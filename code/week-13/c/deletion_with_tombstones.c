/* Week 13 -- File Organisation I
 * Deletion with tombstones: in a probed (linearly-hashed) file, deleting a record cannot just clear its slot to
 * EMPTY -- a later search for a DIFFERENT key that once probed past this slot would then stop too early and
 * wrongly report "not found". A TOMBSTONE ("something was here, keep looking") fixes this; a search skips over
 * tombstones but a later INSERT may reuse one. The table really lives on disk, inside a temporary lab folder
 * that main() creates and removes.
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
    snprintf(out, n, "%s/cen207_week13_tombstone_lab", base);
}

#define EMPTY (-1)
#define TOMB  (-2)   /* deleted marker: "something was here, keep looking" */
#define M 20         /* table size: number of slots (large enough for every scenario below) */

int ts_find(int table[], int m, int key) {
    int i = key % m, tries = 0;
    while (tries < m) {
        if (table[i] == EMPTY) return -1;      /* truly empty: never probed past here */
        if (table[i] == key) return i;          /* found */
        i = (i + 1) % m; tries++;                /* TOMB or a different key: keep going */
    }
    return -1;
}

int ts_delete(int table[], int m, int key) {
    int i = ts_find(table, m, key);
    if (i < 0) return -1;
    table[i] = TOMB;                             /* not EMPTY: later finds must not stop here */
    return i;
}

int ts_insert(int table[], int m, int key) {
    int i = key % m, tries = 0;
    while (tries < m) {
        if (table[i] == EMPTY || table[i] == TOMB) { table[i] = key; return i; }  /* reuse a tombstone */
        if (table[i] == key) return -2;                   /* duplicate */
        i = (i + 1) % m; tries++;
    }
    return -1;                                              /* file full */
}

/* ---- driver ------------------------------------------------------------ */

static void print_table(int table[], int m) {
    printf("  table:");
    for (int i = 0; i < m; i++) {
        if (table[i] == EMPTY) continue;
        if (table[i] == TOMB) printf(" [%d]=DEL", i);
        else printf(" [%d]=%d", i, table[i]);
    }
    printf("\n");
}

static void run_scenario(const char *label, const char *lab, int m,
                          int insert_keys[], int n_insert, int delete_keys[], int n_delete,
                          int search_found, int search_missing, int reinsert_key) {
    printf("-- %s --\n", label);
    int table[M];
    for (int i = 0; i < m; i++) table[i] = EMPTY;

    for (int i = 0; i < n_insert; i++) ts_insert(table, m, insert_keys[i]);
    print_table(table, m);

    for (int i = 0; i < n_delete; i++) {
        int slot = ts_delete(table, m, delete_keys[i]);
        printf("  delete(%d): %s\n", delete_keys[i], slot >= 0 ? "tombstone left" : "not found");
    }
    print_table(table, m);

    int f1 = ts_find(table, m, search_found);
    printf("  find(%d): %s\n", search_found, f1 >= 0 ? "found" : "not found");
    int f2 = ts_find(table, m, search_missing);
    printf("  find(%d): %s\n", search_missing, f2 >= 0 ? "found" : "not found");
    int r = ts_insert(table, m, reinsert_key);
    printf("  reinsert(%d): slot %d\n", reinsert_key, r);
    print_table(table, m);

    char path[512];
    snprintf(path, sizeof(path), "%s/table.dat", lab);
    FILE *fp = fopen(path, "wb");
    fwrite(table, sizeof(int), m, fp);
    fclose(fp);
    fp = fopen(path, "rb");
    fseek(fp, 0, SEEK_END);
    long size = ftell(fp);
    fclose(fp);
    printf("summary: %d B on disk\n\n", size > 0 ? (int) size : 0);
    remove(path);
}

int main(void) {
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);

    int normal_ins[] = { 5, 18, 31, 1, 2, 3, 4, 9, 10, 11, 12 };
    int normal_del[] = { 5 };
    int hard_ins[] = { 2, 15, 28, 41, 54, 7, 8, 9, 10, 11, 0 };
    int hard_del[] = { 15, 41 };
    int edge1_ins[] = { 3, 14, 25, 0, 1, 2, 6, 7, 8, 9 };
    int edge1_del[] = { 3 };
    int edge2_ins[] = { 4, 15, 26, 22, 12, 13, 14, 18, 19, 20, 21 };
    int edge2_del[] = { 4, 15, 26 };

    run_scenario("normal: m=13, the head of a 3-chain is deleted, search skips the tombstone",
                 lab, 13, normal_ins, 11, normal_del, 1, 18, 44, 57);
    run_scenario("hard: m=13, two deletions in a 5-chain (two tombstones to skip)",
                 lab, 13, hard_ins, 11, hard_del, 2, 54, 67, 80);
    run_scenario("edge: a key is deleted, then the very same key is reinserted",
                 lab, 11, edge1_ins, 10, edge1_del, 1, 14, 36, 3);
    run_scenario("edge: the file is completely full; a whole chain is deleted, no true-empty slot remains",
                 lab, 11, edge2_ins, 11, edge2_del, 3, 18, 37, 37);

    RMDIR(lab);
    return 0;
}
