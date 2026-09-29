/* Unit tests for week-13 c/binary_search_sorted_file.c */
#include <limits.h>

#define main program_main
#include "../../c/binary_search_sorted_file.c"
#undef main
#include "../../../test_check.h"

static char scratch_path[600];
static FILE *write_scratch(int *keys, int n) {
    char base[512];
    lab_path(base, sizeof(base));
    snprintf(scratch_path, sizeof(scratch_path), "%s_scratch.bin", base);
    FILE *fp = fopen(scratch_path, "wb+");
    fwrite(keys, sizeof(int), n, fp);
    fflush(fp);
    rewind(fp);
    return fp;
}
static void close_scratch(FILE *fp) { fclose(fp); remove(scratch_path); }

int main(void) {
    FILE *fp;
    int reads;

    /* -- exactly one block (n <= BF): found in the single probe -- */
    int one_block[] = { 5, 10, 15, 20 };
    fp = write_scratch(one_block, 4);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 1, 15, &reads), 2);
    CHECK_EQ_INT(reads, 1);
    close_scratch(fp);

    /* -- exactly one block: not found (a gap) still costs only 1 read -- */
    fp = write_scratch(one_block, 4);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 1, 12, &reads), -1);
    CHECK_EQ_INT(reads, 1);
    close_scratch(fp);

    /* -- found at the very first key (below every other block's range) -- */
    int a[] = { 3, 9, 14, 20, 27, 31, 38, 44, 50, 57, 63, 70 };
    fp = write_scratch(a, 12);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 3, 3, &reads), 0);
    close_scratch(fp);

    /* -- found at the very last key -- */
    fp = write_scratch(a, 12);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 3, 70, &reads), 11);
    close_scratch(fp);

    /* -- target below the minimum: not found, search must terminate (lo > hi) -- */
    fp = write_scratch(a, 12);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 3, 1, &reads), -1);
    CHECK(reads >= 1 && reads <= 3);
    close_scratch(fp);

    /* -- target above the maximum: not found -- */
    fp = write_scratch(a, 12);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 3, 999, &reads), -1);
    close_scratch(fp);

    /* -- target inside a block's range but absent: a gap, still reported not found -- */
    fp = write_scratch(a, 12);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 3, 45, &reads), -1);   /* block [38,44,50,57]: 45 is missing */
    close_scratch(fp);

    /* -- reads never exceed ceil(log2(nblocks)) + 1 (sanity bound on a bigger file) -- */
    int big[24];
    for (int i = 0; i < 24; i++) big[i] = 2 + i * 3;
    fp = write_scratch(big, 24);
    reads = 0;
    int idx = bsearch_file(fp, 6, 71, &reads);
    CHECK_EQ_INT(idx, 23);
    CHECK(reads <= 4);
    close_scratch(fp);

    /* -- negative and extreme keys round-trip correctly -- */
    int extreme[] = { INT_MIN, -100, 0, 100, INT_MAX };
    fp = write_scratch(extreme, 5);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 2, INT_MIN, &reads), 0);
    close_scratch(fp);
    fp = write_scratch(extreme, 5);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 2, INT_MAX, &reads), 4);
    close_scratch(fp);

    /* -- empty file: zero blocks, search must terminate immediately with no probe -- */
    fp = write_scratch(a, 0);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 0, 5, &reads), -1);
    CHECK_EQ_INT(reads, 0);
    close_scratch(fp);

    /* -- exactly one real key (n=1, still a single -- possibly partial -- block): found and not found -- */
    int single[] = { 42 };
    fp = write_scratch(single, 1);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 1, 42, &reads), 0);
    CHECK_EQ_INT(reads, 1);
    close_scratch(fp);
    fp = write_scratch(single, 1);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 1, 7, &reads), -1);
    CHECK_EQ_INT(reads, 1);
    close_scratch(fp);

    /* -- exactly two keys (n=2, one partial block): both ends found, a value between them is a gap -- */
    int pair[] = { 10, 20 };
    fp = write_scratch(pair, 2);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 1, 10, &reads), 0);
    close_scratch(fp);
    fp = write_scratch(pair, 2);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 1, 20, &reads), 1);
    close_scratch(fp);
    fp = write_scratch(pair, 2);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 1, 15, &reads), -1);   /* gap between the two keys */
    close_scratch(fp);

    /* -- duplicate keys inside one block: traced by hand -- mid=1 (block [9,15,20,26]) too big for key=4,
       so hi drops to block 0 ([2,4,4,4]); the block scan returns the FIRST matching index in that block -- */
    int dup[] = { 2, 4, 4, 4, 9, 15, 20, 26, 31, 37, 42, 48 };
    fp = write_scratch(dup, 12);
    reads = 0;
    CHECK_EQ_INT(bsearch_file(fp, 3, 4, &reads), 1);
    CHECK_EQ_INT(reads, 2);
    close_scratch(fp);

    /* -- integration: run_scenario writes a real file inside a real lab folder and cleans it up -- */
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);
    int tiny[] = { 2, 4, 6, 8, 10 };
    run_scenario("unit-test integration", lab, tiny, 5, 6);
    char check_path[600];
    snprintf(check_path, sizeof(check_path), "%s/file.dat", lab);
    FILE *gone = fopen(check_path, "rb");
    CHECK(gone == NULL);
    RMDIR(lab);

    TEST_SUMMARY();
}
