/* Unit tests for week-13 c/blocking_factor.c */
#include <limits.h>

#define main program_main
#include "../../c/blocking_factor.c"
#undef main
#include "../../../test_check.h"

static char scratch_path[600];
static FILE *open_scratch(void) {
    char base[512];
    lab_path(base, sizeof(base));
    snprintf(scratch_path, sizeof(scratch_path), "%s_scratch.bin", base);
    return fopen(scratch_path, "wb+");
}
static void close_scratch(FILE *fp) { fclose(fp); remove(scratch_path); }

int main(void) {
    FILE *fp;
    int written;
    Block b;

    /* -- block_capacity: exact and non-exact division -- */
    CHECK_EQ_INT(block_capacity(20), 5);
    CHECK_EQ_INT(block_capacity(24), 4);      /* 100/24 = 4.16 -> 4 */
    CHECK_EQ_INT(block_capacity(60), 1);
    CHECK_EQ_INT(block_capacity(101), 0);     /* record bigger than block */
    CHECK_EQ_INT(block_capacity(1), 100);     /* smallest record: full block capacity */

    /* -- block_put: does not flush until the block is full -- */
    fp = open_scratch();
    b.count = 0; written = 0;
    block_put(&b, 5, 11, fp, &written);
    block_put(&b, 5, 22, fp, &written);
    CHECK_EQ_INT(written, 0);
    CHECK_EQ_INT(b.count, 2);
    CHECK_EQ_INT(b.keys[0], 11);
    CHECK_EQ_INT(b.keys[1], 22);
    close_scratch(fp);

    /* -- block_put: flushes exactly when the block reaches bf, and resets count -- */
    fp = open_scratch();
    b.count = 0; written = 0;
    for (int i = 0; i < 5; i++) block_put(&b, 5, 100 + i, fp, &written);
    CHECK_EQ_INT(written, 1);
    CHECK_EQ_INT(b.count, 0);       /* buffer reset after the flush */
    close_scratch(fp);

    /* -- block_put: bf=1 flushes on every single key -- */
    fp = open_scratch();
    b.count = 0; written = 0;
    block_put(&b, 1, 7, fp, &written);
    CHECK_EQ_INT(written, 1);
    block_put(&b, 1, 8, fp, &written);
    CHECK_EQ_INT(written, 2);
    close_scratch(fp);

    /* -- block_flush: does nothing on an empty buffer -- */
    fp = open_scratch();
    b.count = 0; written = 0;
    block_flush(&b, fp, &written);
    CHECK_EQ_INT(written, 0);
    close_scratch(fp);

    /* -- block_flush: writes a partial buffer and reports it as one more write -- */
    fp = open_scratch();
    b.count = 0; written = 0;
    block_put(&b, 5, 1, fp, &written);
    block_put(&b, 5, 2, fp, &written);
    block_put(&b, 5, 3, fp, &written);
    CHECK_EQ_INT(written, 0);
    block_flush(&b, fp, &written);
    CHECK_EQ_INT(written, 1);
    fseek(fp, 0, SEEK_END);
    CHECK_EQ_INT(ftell(fp), 3 * (int) sizeof(int));   /* only the 3 real keys were written, no padding on disk */
    close_scratch(fp);

    /* -- integration: a whole file of blocks reads back with the right key count -- */
    fp = open_scratch();
    b.count = 0; written = 0;
    int keys[] = { 5, 10, 15, 20, 25, 30, 35 };        /* 7 keys, bf=3 -> 2 full blocks + 1 partial (1 key) */
    for (int i = 0; i < 7; i++) block_put(&b, 3, keys[i], fp, &written);
    CHECK_EQ_INT(written, 2);
    block_flush(&b, fp, &written);
    CHECK_EQ_INT(written, 3);
    fflush(fp);
    fseek(fp, 0, SEEK_SET);
    int readback[7], got = (int) fread(readback, sizeof(int), 7, fp);
    CHECK_EQ_INT(got, 7);
    for (int i = 0; i < 7; i++) CHECK_EQ_INT(readback[i], keys[i]);
    close_scratch(fp);

    /* -- integration: run_scenario with a real lab folder, error path (bf=0) does not crash or write -- */
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);
    int big[] = { 1, 2, 3 };
    run_scenario("unit-test error path", lab, 999, 10, big, 3);   /* bf = 0 */
    char check_path[600];
    snprintf(check_path, sizeof(check_path), "%s/blocks.dat", lab);
    FILE *gone = fopen(check_path, "rb");
    CHECK(gone == NULL);      /* nothing was ever written */

    /* -- integration: run_scenario with a normal case writes and then cleans up its own file -- */
    int small[] = { 1, 2, 3, 4, 5, 6 };
    run_scenario("unit-test normal path", lab, 20, 100, small, 6);   /* bf=5: 1 full block + 1 partial */
    gone = fopen(check_path, "rb");
    CHECK(gone == NULL);
    RMDIR(lab);

    TEST_SUMMARY();
}
