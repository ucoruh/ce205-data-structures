/* Week 13 -- File Organisation I
 * Progressive overflow (linear probing) on disk: one record per slot; if the home slot h(key) = key mod m is
 * occupied, probe the NEXT slot, wrapping around, until an empty slot is found, the key is already there
 * (duplicate), or every slot has been tried (file full). The table really lives on disk, inside a temporary
 * lab folder that main() creates and removes.
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
    snprintf(out, n, "%s/cen207_week13_probing_lab", base);
}

#define EMPTY (-1)
#define M 20    /* table size: number of slots in the file (large enough for every scenario below) */

int po_insert(int table[], int m, int key, int *probes) {
    int h = key % m, i = h, tries = 0;
    while (tries < m) {
        (*probes)++;                                   /* one slot probed = one disk access */
        if (table[i] == EMPTY) { table[i] = key; return i; }   /* home or next free slot */
        if (table[i] == key) return -2;                        /* duplicate key */
        i = (i + 1) % m;                                       /* progressive overflow: try the next slot */
        tries++;
    }
    return -1;                                                 /* every slot tried: file is full */
}

/* ---- driver ------------------------------------------------------------ */

static void run_scenario(const char *label, const char *lab, int m, int keys[], int n) {
    printf("-- %s --\n", label);
    int table[M];
    for (int i = 0; i < m; i++) table[i] = EMPTY;
    int probes = 0, inserted = 0, errors = 0;
    for (int i = 0; i < n; i++) {
        int before = probes;
        int slot = po_insert(table, m, keys[i], &probes);
        if (slot >= 0) { inserted++; printf("  insert(%d): slot %d, %d probe(s)\n", keys[i], slot, probes - before); }
        else if (slot == -2) { errors++; printf("  insert(%d): duplicate key\n", keys[i]); }
        else { errors++; printf("  insert(%d): FILE FULL\n", keys[i]); }
    }

    char path[512];
    snprintf(path, sizeof(path), "%s/table.dat", lab);
    FILE *fp = fopen(path, "wb");
    fwrite(table, sizeof(int), m, fp);
    fclose(fp);
    fp = fopen(path, "rb");
    fseek(fp, 0, SEEK_END);
    long size = ftell(fp);
    fclose(fp);

    printf("  table:");
    for (int i = 0; i < m; i++) if (table[i] != EMPTY) printf(" [%d]=%d", i, table[i]);
    printf("\n");
    printf("summary: %d request(s), %d inserted, %d error(s), %d probes total, %ld B on disk\n\n", n, inserted, errors, probes, size);
    remove(path);
}

int main(void) {
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);

    int normal[] = { 7, 20, 33, 3, 16, 29, 10, 23, 5, 18 };
    int hard[] = { 2, 13, 24, 35, 4, 15, 26, 6, 17, 8 };
    int edge_full[] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 45 };
    int edge_same_home[] = { 3, 12, 21, 30, 39, 48, 57, 66, 75, 84 };

    run_scenario("normal: m=13, 10 keys, moderate load (77%)", lab, 13, normal, 10);
    run_scenario("hard: m=11, 10 keys, heavy load (91%), long probe runs", lab, 11, hard, 10);
    run_scenario("edge: the file fills exactly, the 10th insert fails (file full)", lab, 9, edge_full, 10);
    run_scenario("edge: every key shares the same home slot, the file fills", lab, 9, edge_same_home, 10);

    RMDIR(lab);
    return 0;
}
