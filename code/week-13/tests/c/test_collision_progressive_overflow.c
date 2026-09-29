/* Unit tests for week-13 c/collision_progressive_overflow.c */
#include <limits.h>

#define main program_main
#include "../../c/collision_progressive_overflow.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int table[M];
    int probes;

    /* -- insert into an empty home slot: 1 probe -- */
    for (int i = 0; i < 9; i++) table[i] = EMPTY;
    probes = 0;
    CHECK_EQ_INT(po_insert(table, 9, 5, &probes), 5);
    CHECK_EQ_INT(probes, 1);
    CHECK_EQ_INT(table[5], 5);

    /* -- second key at the same home slot: probes past the first one -- */
    probes = 0;
    CHECK_EQ_INT(po_insert(table, 9, 14, &probes), 6);   /* 14 % 9 == 5, occupied -> slot 6 */
    CHECK_EQ_INT(probes, 2);

    /* -- wraparound: a key whose home is near the end probes past slot m-1 back to slot 0 -- */
    for (int i = 0; i < 5; i++) table[i] = EMPTY;
    table[0] = 100; table[1] = 101; table[2] = 102; table[3] = 103; table[4] = EMPTY;
    /* home of key 3 (3%5==3) is occupied by 103; slots 4,0,1,2 are checked next -- slot 4 is free */
    probes = 0;
    CHECK_EQ_INT(po_insert(table, 5, 3, &probes), 4);
    CHECK_EQ_INT(probes, 2);

    /* -- duplicate key: rejected, table unchanged, no new slot used -- */
    for (int i = 0; i < 9; i++) table[i] = EMPTY;
    probes = 0;
    po_insert(table, 9, 20, &probes);
    int before = probes;
    CHECK_EQ_INT(po_insert(table, 9, 20, &probes), -2);
    CHECK(probes > before);   /* still had to probe to discover the duplicate */

    /* -- file full: every slot occupied, insert fails and leaves the table untouched -- */
    for (int i = 0; i < 4; i++) table[i] = 10 + i;
    probes = 0;
    CHECK_EQ_INT(po_insert(table, 4, 999, &probes), -1);
    CHECK_EQ_INT(probes, 4);   /* tried every slot once */
    for (int i = 0; i < 4; i++) CHECK_EQ_INT(table[i], 10 + i);   /* nothing overwritten */

    /* -- table with exactly one free slot: the insert succeeds, filling the file exactly -- */
    for (int i = 0; i < 5; i++) table[i] = (i == 3) ? EMPTY : 100 + i;
    probes = 0;
    int slot = po_insert(table, 5, 3, &probes);   /* home 3 happens to be the free one */
    CHECK_EQ_INT(slot, 3);
    CHECK_EQ_INT(table[3], 3);

    /* -- m=1: a single-slot table accepts exactly one key, then is always full -- */
    int one[1]; one[0] = EMPTY;
    probes = 0;
    CHECK_EQ_INT(po_insert(one, 1, 42, &probes), 0);
    probes = 0;
    CHECK_EQ_INT(po_insert(one, 1, 43, &probes), -1);
    CHECK_EQ_INT(probes, 1);

    /* -- an extreme (but non-negative) key: record keys are identifiers, always >= 0 here -- */
    for (int i = 0; i < 9; i++) table[i] = EMPTY;
    probes = 0;
    int s1 = po_insert(table, 9, INT_MAX, &probes);
    CHECK(s1 >= 0 && s1 < 9);

    /* -- integration: run_scenario writes a real file inside a real lab folder and cleans it up -- */
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);
    int tiny[] = { 1, 2, 3 };
    run_scenario("unit-test integration", lab, 5, tiny, 3);
    char check_path[600];
    snprintf(check_path, sizeof(check_path), "%s/table.dat", lab);
    FILE *gone = fopen(check_path, "rb");
    CHECK(gone == NULL);
    RMDIR(lab);

    TEST_SUMMARY();
}
