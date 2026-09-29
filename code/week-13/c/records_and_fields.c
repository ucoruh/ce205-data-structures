/* Week 13 -- File Organisation I
 * Records and fields: the same records are written to three REAL files, one per layout --
 * fixed-length (padded/truncated to NAME_FIXED bytes), delimited (name + '|'), and length-prefixed
 * (1-byte length + name). The files are created only inside a temporary lab folder that main()
 * creates and removes.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#ifdef _WIN32
#include <direct.h>
#define MKDIR(path) _mkdir(path)
#define RMDIR(path) _rmdir(path)
#else
#define MKDIR(path) mkdir(path, 0755)
#define RMDIR(path) rmdir(path)
#endif

/* A fresh, empty temporary folder under the OS temp directory -- never inside the repository -- that this
   program creates and removes itself; every file this program writes lives only inside it. */
static void lab_path(char *out, size_t n) {
#ifdef _WIN32
    const char *base = getenv("TEMP");
    if (!base) base = getenv("TMP");
    if (!base) base = ".";
#else
    const char *base = getenv("TMPDIR");
    if (!base) base = "/tmp";
#endif
    snprintf(out, n, "%s/cen207_week13_records_lab", base);
}

#define NAME_FIXED 8

typedef struct { int id; char name[NAME_FIXED]; int score; } FixedRecord;

int write_fixed(FILE *fp, int id, const char *name, int score) {
    FixedRecord r; r.id = id; r.score = score;
    int n = (int) strlen(name);
    if (n >= NAME_FIXED) {                 /* too long: truncate, data is lost */
        memcpy(r.name, name, NAME_FIXED);
    } else {
        memcpy(r.name, name, n);
        memset(r.name + n, '_', NAME_FIXED - n);   /* pad with filler bytes */
    }
    return fwrite(&r, sizeof(r), 1, fp) == 1 ? (int) sizeof(r) : -1;
}

int write_delim(FILE *fp, int id, const char *name, int score) {
    (void) id; (void) score;   /* still fixed 4-byte fields; only name is variable here */
    return fprintf(fp, "%s|", name) > 0 ? 4 + (int) strlen(name) + 1 + 4 : -1;
}

int write_lenpfx(FILE *fp, int id, const char *name, int score) {
    (void) id; (void) score;
    unsigned char len = (unsigned char) strlen(name);   /* 1-byte length prefix */
    fwrite(&len, 1, 1, fp);
    fwrite(name, 1, len, fp);
    return 4 + 1 + (int) len + 4;
}

/* ---- driver ------------------------------------------------------------ */

typedef struct { int id; const char *name; int score; } RecIn;

static long file_size(const char *path) {
    FILE *fp = fopen(path, "rb");
    if (!fp) return -1;
    fseek(fp, 0, SEEK_END);
    long sz = ftell(fp);
    fclose(fp);
    return sz;
}

static void run_scenario(const char *label, const char *lab, RecIn recs[], int n) {
    printf("-- %s --\n", label);
    char pfixed[512], pdelim[512], plen[512];
    snprintf(pfixed, sizeof(pfixed), "%s/fixed.dat", lab);
    snprintf(pdelim, sizeof(pdelim), "%s/delim.dat", lab);
    snprintf(plen, sizeof(plen), "%s/lenpfx.dat", lab);

    FILE *ffixed = fopen(pfixed, "wb");
    FILE *fdelim = fopen(pdelim, "wb");
    FILE *flen = fopen(plen, "wb");
    if (!ffixed || !fdelim || !flen) {                 /* clean up whichever of the three did open */
        if (ffixed) fclose(ffixed);
        if (fdelim) fclose(fdelim);
        if (flen) fclose(flen);
        remove(pfixed); remove(pdelim); remove(plen);
        printf("  could not open lab files\n");
        return;
    }

    int wasted = 0, truncated = 0;
    for (int i = 0; i < n; i++) {
        int nlen = (int) strlen(recs[i].name);
        write_fixed(ffixed, recs[i].id, recs[i].name, recs[i].score);
        write_delim(fdelim, recs[i].id, recs[i].name, recs[i].score);
        write_lenpfx(flen, recs[i].id, recs[i].name, recs[i].score);
        if (nlen >= NAME_FIXED) truncated++; else wasted += NAME_FIXED - nlen;
        printf("  id=%-4d name=\"%-10s\" (%2d B) score=%-4d%s\n",
               recs[i].id, recs[i].name, nlen, recs[i].score, nlen >= NAME_FIXED ? "  -- truncated in fixed.dat!" : "");
    }
    fclose(ffixed); fclose(fdelim); fclose(flen);

    long szf = file_size(pfixed), szd = file_size(pdelim), szl = file_size(plen);
    printf("  fixed.dat  = %ld B (expected %d, %d B wasted, %d truncated)\n", szf, n * (8 + NAME_FIXED), wasted, truncated);
    printf("  delim.dat  = %ld B\n", szd);
    printf("  lenpfx.dat = %ld B\n", szl);
    printf("summary: %d records, fixed saves nothing here (%ld B) but reads back at a constant stride;\n"
           "         delim/lenpfx are %ld B smaller, but need parsing to find record boundaries.\n\n",
           n, szf, szf - szd);

    remove(pfixed); remove(pdelim); remove(plen);
}

int main(void) {
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);           /* in case a previous crashed run left it behind */
    MKDIR(lab);

    RecIn normal[] = {
        {101, "ANN", 91}, {102, "BOB", 77}, {103, "CARL", 85}, {104, "DEE", 60}, {105, "ED", 99},
        {106, "FAY", 72}, {107, "GUS", 88}, {108, "HAL", 65}, {109, "IVY", 93}, {110, "JOE", 58}, {111, "KIM", 80}
    };
    RecIn mixed[] = {
        {201, "AL", 70}, {202, "BRENDA", 84}, {203, "CARLITOX", 66}, {204, "DOMINIQUE", 91}, {205, "ED", 55},
        {206, "FRANCESCA", 62}, {207, "GIA", 89}, {208, "HECTOR", 73}, {209, "IRA", 95}, {210, "JULIETTE", 68},
        {211, "KEN", 81}, {212, "LIONEL", 77}, {213, "MAX", 90}
    };
    RecIn edge_empty_long[] = {
        {301, "", 40}, {302, "ALEXANDRIA", 71}, {303, "A", 50}, {304, "BO", 61}, {305, "CHRISTOPHERSON", 82},
        {306, "", 30}, {307, "D", 45}, {308, "EIGHTCHRS", 59}, {309, "F", 66}, {310, "GABRIELLA", 74}, {311, "H", 53}
    };
    RecIn edge_all_truncated[] = {
        {401, "ABCDEFGHIJ", 10}, {402, "KLMNOPQRST", 20}, {403, "UVWXYZABCD", 30}, {404, "EFGHIJKLMN", 40},
        {405, "OPQRSTUVWX", 50}, {406, "YZABCDEFGH", 60}, {407, "IJKLMNOPQR", 70}, {408, "STUVWXYZAB", 80},
        {409, "CDEFGHIJKL", 90}, {410, "MNOPQRSTUV", 15}
    };

    run_scenario("normal: 11 records, short names (padding, no truncation)", lab, normal, 11);
    run_scenario("hard: 13 records, mixed lengths", lab, mixed, 13);
    run_scenario("edge: empty name and a very long name", lab, edge_empty_long, 11);
    run_scenario("edge: every name longer than 8 characters", lab, edge_all_truncated, 10);

    RMDIR(lab);
    return 0;
}
