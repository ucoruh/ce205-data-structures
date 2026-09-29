/* Week 13 -- File Organisation I
 * Relative (direct) file access: a record number (RRN) maps straight to a block and an offset by arithmetic --
 * block = rrn / bf, offset = rrn % bf -- so a record is fetched with exactly ONE block read and no searching at
 * all. The file really lives on disk, inside a temporary lab folder that main() creates and removes.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#ifdef _WIN32
#include <direct.h>
#define MKDIR(path) _mkdir(path)
#define RMDIR(path) _rmdir(path)
#else
#define MKDIR(path) mkdir(path, 0755)
#define RMDIR(path) rmdir(path)
#endif

static void lab_path(char *out, size_t n) {
#ifdef _WIN32
    const char *base = getenv("TEMP");
    if (!base) base = getenv("TMP");
    if (!base) base = ".";
#else
    const char *base = getenv("TMPDIR");
    if (!base) base = "/tmp";
#endif
    snprintf(out, n, "%s/cen207_week13_relative_lab", base);
}

#define BF 5   /* records per block */

int direct_read(FILE *fp, int total, int rrn, int *out, int *block_reads) {
    if (rrn < 0 || rrn >= total) return -1;          /* invalid record number */
    int block  = rrn / BF;
    int offset = rrn % BF;
    fseek(fp, (long) block * BF * sizeof(int), SEEK_SET);
    int buf[BF];
    int cnt = (int) fread(buf, sizeof(int), BF, fp);  /* exactly ONE read, always */
    (*block_reads)++;
    if (offset >= cnt) return -1;                     /* past the last, partial block */
    *out = buf[offset];
    return 0;
}

/* ---- driver ------------------------------------------------------------ */

static void run_scenario(const char *label, const char *lab, int total, int requests[], int nreq) {
    printf("-- %s --\n", label);
    char path[512];
    snprintf(path, sizeof(path), "%s/file.dat", lab);
    FILE *fp = fopen(path, "wb");
    for (int i = 0; i < total; i++) { int v = 100 + i * 3; fwrite(&v, sizeof(int), 1, fp); }
    fclose(fp);

    fp = fopen(path, "rb");
    int reads = 0, errors = 0;
    for (int i = 0; i < nreq; i++) {
        int val, rc = direct_read(fp, total, requests[i], &val, &reads);
        if (rc == 0) printf("  read(rrn=%d): value=%d (block=%d, offset=%d)\n", requests[i], val, requests[i] / BF, requests[i] % BF);
        else { errors++; printf("  read(rrn=%d): invalid\n", requests[i]); }
    }
    fclose(fp);
    printf("summary: %d request(s), %d block reads, %d errors\n\n", nreq, reads, errors);
    remove(path);
}

int main(void) {
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);

    int normal_req[] = { 7, 2, 12 };
    int hard_req[] = { 0, 3, 4, 15, 8 };
    int invalid_req[] = { -1, 15, 5 };
    int last_partial_req[] = { 10, 9, 11 };

    run_scenario("normal: bf=5, 13 records, 3 valid requests", lab, 13, normal_req, 3);
    run_scenario("hard: bf=5, 16 records, 5 requests at boundary offsets", lab, 16, hard_req, 5);
    run_scenario("edge: negative and out-of-range record numbers (errors)", lab, 12, invalid_req, 3);
    run_scenario("edge: the single record in the last partial block + out of range", lab, 11, last_partial_req, 3);

    RMDIR(lab);
    return 0;
}
