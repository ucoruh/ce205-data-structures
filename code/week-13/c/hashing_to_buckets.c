/* Week 13 -- File Organisation I
 * Hashing to buckets: h(key) = key mod m picks a HOME bucket; a bucket holds up to bf keys, and once it is full
 * an OVERFLOW block is allocated and chained onto it (bucket chaining) instead of searching elsewhere. Every
 * bucket and overflow block is a real block written to disk, inside a temporary lab folder that main() creates
 * and removes.
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
    snprintf(out, n, "%s/cen207_week13_buckets_lab", base);
}

#define BF 3    /* keys per bucket / overflow block */
#define MAXBLOCKS 40

typedef struct { int keys[BF]; int count; int next; } Bucket;   /* next = -1: no overflow yet */

int bucket_put(Bucket b[], int *nblocks, int m, int key, int *writes) {
    int h = key % m, cur = h;                    /* home bucket */
    while (b[cur].count == BF) {                  /* this block is full */
        if (b[cur].next < 0) {                      /* no overflow yet: allocate one */
            b[cur].next = (*nblocks)++;
            b[b[cur].next].count = 0; b[b[cur].next].next = -1;
            (*writes)++;                              /* the new, empty overflow block */
        }
        cur = b[cur].next;                                /* follow the chain */
    }
    b[cur].keys[b[cur].count++] = key;
    (*writes)++;                                          /* the block that now holds the key */
    return h;
}

/* ---- driver ------------------------------------------------------------ */

static void write_blocks(FILE *fp, Bucket b[], int nblocks) {
    for (int i = 0; i < nblocks; i++) fwrite(b[i].keys, sizeof(int), BF, fp);
}

static void run_scenario(const char *label, const char *lab, int m, int keys[], int n) {
    printf("-- %s --\n", label);
    Bucket b[MAXBLOCKS];
    for (int i = 0; i < m; i++) { b[i].count = 0; b[i].next = -1; }
    int nblocks = m, writes = 0;

    for (int i = 0; i < n; i++) {
        int h = bucket_put(b, &nblocks, m, keys[i], &writes);
        printf("  key %d -> home bucket %d\n", keys[i], h);
    }

    char path[512];
    snprintf(path, sizeof(path), "%s/buckets.dat", lab);
    FILE *fp = fopen(path, "wb");
    write_blocks(fp, b, nblocks);
    fclose(fp);

    fp = fopen(path, "rb");
    fseek(fp, 0, SEEK_END);
    long size = ftell(fp);
    fclose(fp);

    for (int i = 0; i < m; i++) {
        printf("  bucket %d:", i);
        for (int k = 0; k < b[i].count; k++) printf(" %d", b[i].keys[k]);
        int nx = b[i].next;
        while (nx >= 0) { printf(" ->"); for (int k = 0; k < b[nx].count; k++) printf(" %d", b[nx].keys[k]); nx = b[nx].next; }
        printf("\n");
    }
    printf("summary: %d keys, %d home bucket(s), %d overflow block(s) (%d blocks total, %ld B on disk), %d writes\n\n",
           n, m, nblocks - m, nblocks, size, writes);
    remove(path);
}

int main(void) {
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);

    int normal[] = { 12, 7, 23, 18, 4, 29, 15, 31, 9, 26, 3, 37, 21 };
    int hard[] = { 4, 8, 12, 16, 20, 24, 1, 5, 9, 13, 17, 21, 2, 6 };
    int edge_all_same[] = { 6, 12, 18, 24, 30, 36, 42, 48, 54, 60 };
    int edge_one_bucket[] = { 5, 11, 2, 19, 8, 14, 3, 27, 6, 10 };

    run_scenario("normal: m=5, bf=3, 13 keys, little overflow", lab, 5, normal, 13);
    run_scenario("hard: m=4, 14 keys, several buckets chain", lab, 4, hard, 14);
    run_scenario("edge: all 10 keys hash to the same bucket (long chain)", lab, 6, edge_all_same, 10);
    run_scenario("edge: m=1, one bucket, everything chains", lab, 1, edge_one_bucket, 10);

    RMDIR(lab);
    return 0;
}
