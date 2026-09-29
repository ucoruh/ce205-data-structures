/* Unit tests for week-13 c/relative_file_direct_access.c */
#include <limits.h>

#define main program_main
#include "../../c/relative_file_direct_access.c"
#undef main
#include "../../../test_check.h"

static char scratch_path[600];
static FILE *make_file(int total) {
    char base[512];
    lab_path(base, sizeof(base));
    snprintf(scratch_path, sizeof(scratch_path), "%s_scratch.bin", base);
    FILE *fp = fopen(scratch_path, "wb+");
    for (int i = 0; i < total; i++) { int v = 100 + i * 3; fwrite(&v, sizeof(int), 1, fp); }
    fflush(fp);
    rewind(fp);
    return fp;
}
static void close_scratch(FILE *fp) { fclose(fp); remove(scratch_path); }

int main(void) {
    FILE *fp;
    int val, reads;

    /* -- rrn=0: block 0, offset 0 -- */
    fp = make_file(13);
    reads = 0; val = -1;
    CHECK_EQ_INT(direct_read(fp, 13, 0, &val, &reads), 0);
    CHECK_EQ_INT(val, 100);
    CHECK_EQ_INT(reads, 1);
    close_scratch(fp);

    /* -- rrn in the middle of a block -- */
    fp = make_file(13);
    reads = 0;
    CHECK_EQ_INT(direct_read(fp, 13, 7, &val, &reads), 0);
    CHECK_EQ_INT(val, 100 + 7 * 3);
    CHECK_EQ_INT(reads, 1);   /* always exactly one read */
    close_scratch(fp);

    /* -- rrn at the very last valid position -- */
    fp = make_file(13);
    reads = 0;
    CHECK_EQ_INT(direct_read(fp, 13, 12, &val, &reads), 0);
    CHECK_EQ_INT(val, 100 + 12 * 3);
    close_scratch(fp);

    /* -- negative rrn: invalid, no read performed -- */
    fp = make_file(13);
    reads = 0;
    CHECK_EQ_INT(direct_read(fp, 13, -1, &val, &reads), -1);
    CHECK_EQ_INT(reads, 0);
    close_scratch(fp);

    /* -- rrn == total: invalid (one past the end) -- */
    fp = make_file(13);
    reads = 0;
    CHECK_EQ_INT(direct_read(fp, 13, 13, &val, &reads), -1);
    CHECK_EQ_INT(reads, 0);
    close_scratch(fp);

    /* -- rrn far beyond the end: invalid -- */
    fp = make_file(13);
    reads = 0;
    CHECK_EQ_INT(direct_read(fp, 13, 1000, &val, &reads), -1);
    close_scratch(fp);

    /* -- the single record in a partial last block is still reachable -- */
    fp = make_file(11);   /* bf=5 -> blocks of 5,5,1 */
    reads = 0;
    CHECK_EQ_INT(direct_read(fp, 11, 10, &val, &reads), 0);
    CHECK_EQ_INT(val, 100 + 10 * 3);
    CHECK_EQ_INT(reads, 1);
    close_scratch(fp);

    /* -- one past the last partial block's single record: invalid, but still costs 1 read (the block IS read) -- */
    fp = make_file(11);
    reads = 0;
    CHECK_EQ_INT(direct_read(fp, 11, 11, &val, &reads), -1);   /* rrn == total, caught before any read */
    CHECK_EQ_INT(reads, 0);
    close_scratch(fp);

    /* -- exactly one record (total=1): only rrn=0 is valid -- */
    fp = make_file(1);
    reads = 0;
    CHECK_EQ_INT(direct_read(fp, 1, 0, &val, &reads), 0);
    close_scratch(fp);
    fp = make_file(1);
    reads = 0;
    CHECK_EQ_INT(direct_read(fp, 1, 1, &val, &reads), -1);
    close_scratch(fp);

    /* -- empty file (total=0): every rrn is out of range, caught before any read -- */
    fp = make_file(0);
    reads = 0;
    CHECK_EQ_INT(direct_read(fp, 0, 0, &val, &reads), -1);
    CHECK_EQ_INT(reads, 0);
    close_scratch(fp);

    /* -- every valid rrn in a file costs exactly one read, regardless of file size -- */
    fp = make_file(16);
    int total_reads = 0;
    for (int i = 0; i < 16; i++) { int one = 0; direct_read(fp, 16, i, &val, &one); total_reads += one; }
    CHECK_EQ_INT(total_reads, 16);
    close_scratch(fp);

    /* -- integration: run_scenario writes a real file inside a real lab folder and cleans it up -- */
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);
    int req[] = { 0, 2, 4 };
    run_scenario("unit-test integration", lab, 5, req, 3);
    char check_path[600];
    snprintf(check_path, sizeof(check_path), "%s/file.dat", lab);
    FILE *gone = fopen(check_path, "rb");
    CHECK(gone == NULL);
    RMDIR(lab);

    TEST_SUMMARY();
}
