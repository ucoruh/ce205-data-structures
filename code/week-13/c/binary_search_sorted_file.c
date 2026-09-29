/* Week 13 -- File Organisation I
 * Binary search of a SORTED file: jump to the middle BLOCK (compare the key to the block's first and last
 * key), then scan only inside that one block -- O(log numBlocks) block reads instead of O(numBlocks). The
 * file really lives on disk, inside a temporary lab folder that main() creates and removes.
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
    snprintf(out, n, "%s/cen207_week13_binsearch_lab", base);
}

#define BF 4   /* records per block; the whole file is sorted by key */

int bsearch_file(FILE *fp, int nblocks, int key, int *block_reads) {
    int lo = 0, hi = nblocks - 1;
    int buf[BF];
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        fseek(fp, (long) mid * BF * sizeof(int), SEEK_SET);
        int cnt = (int) fread(buf, sizeof(int), BF, fp);   /* one block read */
        (*block_reads)++;
        if (key < buf[0]) {
            hi = mid - 1;                                  /* whole block is too big: go left */
        } else if (key > buf[cnt - 1]) {
            lo = mid + 1;                                  /* whole block is too small: go right */
        } else {
            for (int i = 0; i < cnt; i++)                  /* key's block found: scan inside it */
                if (buf[i] == key) return mid * BF + i;
            return -1;                                      /* in range but absent: a gap */
        }
    }
    return -1;                                               /* outside the file's key range */
}

/* ---- driver ------------------------------------------------------------ */

static void run_scenario(const char *label, const char *lab, int keys[], int n, int target) {
    printf("-- %s --\n", label);
    char path[512];
    snprintf(path, sizeof(path), "%s/file.dat", lab);
    FILE *fp = fopen(path, "wb");
    fwrite(keys, sizeof(int), n, fp);
    fclose(fp);

    int nblocks = (n + BF - 1) / BF;
    fp = fopen(path, "rb");
    int reads = 0;
    int idx = bsearch_file(fp, nblocks, target, &reads);
    fclose(fp);

    if (idx >= 0) printf("  search(%d): found at position %d, %d/%d block reads\n", target, idx, reads, nblocks);
    else printf("  search(%d): not found, %d/%d block reads\n", target, reads, nblocks);
    printf("summary: %d keys in %d block(s), bf=%d\n\n", n, nblocks, BF);
    remove(path);
}

int main(void) {
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);

    int normal[] = { 3, 9, 14, 20, 27, 31, 38, 44, 50, 57, 63, 70 };
    int hard[24]; for (int i = 0; i < 24; i++) hard[i] = 2 + i * 3;   /* 6 blocks: worst case needs 3 probes */
    int edge_gap[] = { 4, 11, 19, 26, 33, 40, 48, 55, 62, 69, 77, 85 };

    run_scenario("normal: bf=4, 12 sorted keys, target found in the 2nd probed block", lab, normal, 12, 63);
    run_scenario("hard: bf=4, 24 sorted keys (6 blocks), worst case needs 3 probes", lab, hard, 24, 71);
    run_scenario("edge: target is inside a block's range but absent (a gap)", lab, edge_gap, 12, 45);
    run_scenario("edge: target is outside the file's key range (below the minimum)", lab, edge_gap, 12, 1);

    RMDIR(lab);
    return 0;
}
