/* Week 13 -- File Organisation I
 * Sequential search of a file: blocks are read from disk in order, and every record inside a loaded block is
 * compared until the key is found or the file ends. The cost is measured in BLOCK READS. The file really lives
 * on disk, inside a temporary lab folder that main() creates and removes.
 * CEN207 Data Structures (formerly CE205)
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
    snprintf(out, n, "%s/cen207_week13_seqsearch_lab", base);
}

#define BF 4   /* records per block */

int seq_search_file(FILE *fp, int n, int key, int *block_reads, int *comparisons) {
    int buf[BF];
    int nblocks = (n + BF - 1) / BF;
    for (int b = 0; b < nblocks; b++) {
        fseek(fp, (long) b * BF * sizeof(int), SEEK_SET);
        int cnt = (int) fread(buf, sizeof(int), BF, fp);   /* one block read */
        (*block_reads)++;
        for (int i = 0; i < cnt; i++) {
            (*comparisons)++;
            if (buf[i] == key) return b * BF + i;           /* found */
        }
    }
    return -1;                                              /* not found: every block was read */
}

/* ---- driver ------------------------------------------------------------ */

static void run_scenario(const char *label, const char *lab, int keys[], int n, int target) {
    printf("-- %s --\n", label);
    char path[512];
    snprintf(path, sizeof(path), "%s/file.dat", lab);
    FILE *fp = fopen(path, "wb");
    fwrite(keys, sizeof(int), n, fp);
    fclose(fp);

    fp = fopen(path, "rb");
    int reads = 0, comparisons = 0;
    int idx = seq_search_file(fp, n, target, &reads, &comparisons);
    fclose(fp);

    int nblocks = (n + BF - 1) / BF;
    if (idx >= 0) printf("  search(%d): found at position %d, %d/%d block reads, %d comparisons\n", target, idx, reads, nblocks, comparisons);
    else printf("  search(%d): not found, %d/%d block reads, %d comparisons\n", target, reads, nblocks, comparisons);
    printf("summary: %d keys in %d block(s), bf=%d\n\n", n, nblocks, BF);
    remove(path);
}

int main(void) {
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);

    int normal[] = { 51, 8, 73, 20, 44, 12, 67, 29, 90, 3, 58, 36, 81 };
    int hard[] = { 15, 42, 7, 63, 28, 91, 50, 19, 77, 33, 5, 62, 95, 62 };
    int edge_not_found[] = { 11, 34, 56, 9, 78, 23, 45, 67, 2, 88, 31, 60 };
    int edge_first[] = { 70, 14, 39, 82, 6, 55, 27, 48, 93, 11 };

    run_scenario("normal: 13 keys, target in the middle (found in block 2)", lab, normal, 13, 67);
    run_scenario("hard: 14 keys, duplicate target in the last block (worst case)", lab, hard, 14, 62);
    run_scenario("edge: target absent, the whole file is scanned", lab, edge_not_found, 12, 999);
    run_scenario("edge: target is the first record, best case (1 read)", lab, edge_first, 10, 70);

    RMDIR(lab);
    return 0;
}
