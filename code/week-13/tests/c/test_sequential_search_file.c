/* Unit tests for week-13 c/sequential_search_file.c */
#include <limits.h>

#define main program_main
#include "../../c/sequential_search_file.c"
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
    int reads, comparisons, idx;

    /* -- found in the first block, first record: best case, 1 read, 1 comparison -- */
    int a[] = { 5, 8, 13, 21, 34, 55, 89 };
    fp = write_scratch(a, 7);
    reads = comparisons = 0;
    idx = seq_search_file(fp, 7, 5, &reads, &comparisons);
    CHECK_EQ_INT(idx, 0);
    CHECK_EQ_INT(reads, 1);
    CHECK_EQ_INT(comparisons, 1);
    close_scratch(fp);

    /* -- found in the last block, last record: worst found case -- */
    fp = write_scratch(a, 7);
    reads = comparisons = 0;
    idx = seq_search_file(fp, 7, 89, &reads, &comparisons);
    CHECK_EQ_INT(idx, 6);
    CHECK_EQ_INT(reads, 2);          /* bf=4: block0 = [5,8,13,21], block1 = [34,55,89] */
    CHECK_EQ_INT(comparisons, 7);
    close_scratch(fp);

    /* -- not found: every block is read, every record compared -- */
    fp = write_scratch(a, 7);
    reads = comparisons = 0;
    idx = seq_search_file(fp, 7, 999, &reads, &comparisons);
    CHECK_EQ_INT(idx, -1);
    CHECK_EQ_INT(reads, 2);
    CHECK_EQ_INT(comparisons, 7);
    close_scratch(fp);

    /* -- duplicates: the FIRST occurrence is returned -- */
    int d[] = { 1, 9, 9, 9, 2 };
    fp = write_scratch(d, 5);
    reads = comparisons = 0;
    idx = seq_search_file(fp, 5, 9, &reads, &comparisons);
    CHECK_EQ_INT(idx, 1);
    close_scratch(fp);

    /* -- one record: found -- */
    int one[] = { 42 };
    fp = write_scratch(one, 1);
    reads = comparisons = 0;
    CHECK_EQ_INT(seq_search_file(fp, 1, 42, &reads, &comparisons), 0);
    CHECK_EQ_INT(reads, 1);
    close_scratch(fp);

    /* -- one record: not found -- */
    fp = write_scratch(one, 1);
    reads = comparisons = 0;
    CHECK_EQ_INT(seq_search_file(fp, 1, 7, &reads, &comparisons), -1);
    CHECK_EQ_INT(reads, 1);
    CHECK_EQ_INT(comparisons, 1);
    close_scratch(fp);

    /* -- exactly one full block (n == BF): still exactly one read -- */
    int exact[] = { 10, 20, 30, 40 };
    fp = write_scratch(exact, 4);
    reads = comparisons = 0;
    CHECK_EQ_INT(seq_search_file(fp, 4, 40, &reads, &comparisons), 3);
    CHECK_EQ_INT(reads, 1);
    close_scratch(fp);

    /* -- negative and extreme keys round-trip correctly -- */
    int extreme[] = { INT_MIN, -5, 0, 5, INT_MAX };
    fp = write_scratch(extreme, 5);
    reads = comparisons = 0;
    CHECK_EQ_INT(seq_search_file(fp, 5, INT_MIN, &reads, &comparisons), 0);
    close_scratch(fp);
    fp = write_scratch(extreme, 5);
    reads = comparisons = 0;
    CHECK_EQ_INT(seq_search_file(fp, 5, INT_MAX, &reads, &comparisons), 4);
    close_scratch(fp);

    /* -- empty file (n=0): zero blocks, search terminates immediately -- */
    fp = write_scratch(a, 0);
    reads = comparisons = 0;
    CHECK_EQ_INT(seq_search_file(fp, 0, 5, &reads, &comparisons), -1);
    CHECK_EQ_INT(reads, 0);
    CHECK_EQ_INT(comparisons, 0);
    close_scratch(fp);

    /* -- integration: run_scenario writes a real file inside a real lab folder and cleans it up -- */
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);
    int tiny[] = { 3, 6, 9, 12, 15 };
    run_scenario("unit-test integration", lab, tiny, 5, 9);
    char check_path[600];
    snprintf(check_path, sizeof(check_path), "%s/file.dat", lab);
    FILE *gone = fopen(check_path, "rb");
    CHECK(gone == NULL);
    RMDIR(lab);

    TEST_SUMMARY();
}
