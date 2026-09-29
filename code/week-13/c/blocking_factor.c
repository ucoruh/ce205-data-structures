/* Week 13 -- File Organisation I
 * Blocking factor: how many fixed-size records fit in one disk block (bf), and the waste that comes with it --
 * internal fragmentation inside every full block, plus extra waste in a partial last block. Every block is
 * really written to a file inside a temporary lab folder that main() creates and removes.
 * CEN207 Data Structures (CS50-style lecture notes)
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

static void lab_path(char *out, size_t n) {
#ifdef _WIN32
    const char *base = getenv("TEMP");
    if (!base) base = getenv("TMP");
    if (!base) base = ".";
#else
    const char *base = getenv("TMPDIR");
    if (!base) base = "/tmp";
#endif
    snprintf(out, n, "%s/cen207_week13_blocking_lab", base);
}

#define BLOCK_SIZE 100
#define MAX_BF 20

typedef struct { int keys[MAX_BF]; int count; } Block;

int block_capacity(int rec_size) { return BLOCK_SIZE / rec_size; }   /* bf = floor(BLOCK_SIZE / rec_size) */

void block_put(Block *b, int bf, int key, FILE *fp, int *written) {
    b->keys[b->count++] = key;
    if (b->count == bf) {                    /* block full: flush it to disk */
        fwrite(b->keys, sizeof(int), bf, fp);
        (*written)++;
        b->count = 0;                        /* start a new, empty block */
    }
}

void block_flush(Block *b, FILE *fp, int *written) {
    if (b->count > 0) {                      /* partial last block is still written, with waste */
        fwrite(b->keys, sizeof(int), b->count, fp);
        (*written)++;
    }
}

/* ---- driver ------------------------------------------------------------ */

static void run_scenario(const char *label, const char *lab, int rec_size, int block_size, int keys[], int n) {
    printf("-- %s --\n", label);
    int bf = block_size / rec_size;
    printf("recSize=%d blockSize=%d -> bf=%d\n", rec_size, block_size, bf);
    if (bf < 1) {
        printf("ERROR: a record (%d B) does not fit in a block (%d B): no block can hold even one record.\n\n", rec_size, block_size);
        return;
    }

    char path[512];
    snprintf(path, sizeof(path), "%s/blocks.dat", lab);
    FILE *fp = fopen(path, "wb");
    if (!fp) { printf("  could not open lab file\n"); return; }

    Block b; b.count = 0;
    int written = 0, fragTotal = 0;
    for (int i = 0; i < n; i++) {
        int before = written;
        block_put(&b, bf, keys[i], fp, &written);
        if (written > before) {
            int frag = block_size - bf * rec_size;
            fragTotal += frag;
            printf("  key %d -> block full, flushed (write #%d), %d B internal waste\n", keys[i], written, frag);
        } else {
            printf("  key %d -> buffer (%d/%d)\n", keys[i], b.count, bf);
        }
    }
    int beforeFlush = written;
    int lastWaste = 0;
    if (b.count > 0) lastWaste = (bf - b.count) * rec_size;
    block_flush(&b, fp, &written);
    if (written > beforeFlush) {
        int lastFrag = block_size - bf * rec_size;
        fragTotal += lastFrag;
        printf("  final partial block -> flushed (write #%d), %d B internal waste + %d B last-block waste\n", written, lastFrag, lastWaste);
    }
    fclose(fp);

    fp = fopen(path, "rb");
    fseek(fp, 0, SEEK_END);
    long size = ftell(fp);
    fclose(fp);
    printf("summary: %d keys -> %d block(s) written (%ld B on disk), internal waste %d B, last-block waste %d B\n\n",
           n, written, size, fragTotal, lastWaste);
    remove(path);
}

int main(void) {
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);

    int normal[] = { 12, 45, 7, 89, 23, 56, 34, 78, 19, 61, 42, 90, 15 };
    int hard[] = { 8, 31, 55, 12, 47, 63, 29, 71, 18, 40, 52, 6, 84, 25 };
    int edge_too_big[] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    int edge_exact[] = { 3, 66, 21, 48, 11, 77, 34, 59, 2, 91, 26, 44 };

    run_scenario("normal: recSize=20, blockSize=100 (bf=5), 13 keys", lab, 20, 100, normal, 13);
    run_scenario("hard: recSize=24, blockSize=100 (bf=4), 14 keys", lab, 24, 100, hard, 14);
    run_scenario("edge: record bigger than block (bf=0, error)", lab, 60, 50, edge_too_big, 10);
    run_scenario("edge: 12 keys divide bf=3 exactly, no last-block waste", lab, 30, 100, edge_exact, 12);

    RMDIR(lab);
    return 0;
}
