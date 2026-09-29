/* Unit tests for week-13 c/deletion_with_tombstones.c */
#include <limits.h>

#define main program_main
#include "../../c/deletion_with_tombstones.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int table[M];

    /* -- find on an empty table: not found immediately -- */
    for (int i = 0; i < 9; i++) table[i] = EMPTY;
    CHECK_EQ_INT(ts_find(table, 9, 5), -1);

    /* -- insert then find: found at its home slot -- */
    ts_insert(table, 9, 5);
    CHECK_EQ_INT(ts_find(table, 9, 5), 5);

    /* -- delete a key that is not present: no-op, returns -1 -- */
    CHECK_EQ_INT(ts_delete(table, 9, 999), -1);

    /* -- delete an existing key: slot becomes TOMB, not EMPTY -- */
    CHECK_EQ_INT(ts_delete(table, 9, 5), 5);
    CHECK_EQ_INT(table[5], TOMB);

    /* -- find on a deleted key: not found, but the tombstone must not stop a search for something else -- */
    CHECK_EQ_INT(ts_find(table, 9, 5), -1);

    /* -- classic tombstone scenario: delete the head of a probe chain, the tail must still be found -- */
    for (int i = 0; i < 9; i++) table[i] = EMPTY;
    ts_insert(table, 9, 2);    /* home 2 */
    ts_insert(table, 9, 11);   /* home 2, collides -> slot 3 */
    ts_insert(table, 9, 20);   /* home 2, collides -> slot 4 */
    ts_delete(table, 9, 2);    /* head of the chain becomes a tombstone */
    CHECK_EQ_INT(table[2], TOMB);
    CHECK_EQ_INT(ts_find(table, 9, 11), 3);    /* must skip the tombstone at slot 2 */
    CHECK_EQ_INT(ts_find(table, 9, 20), 4);    /* must skip the tombstone AND slot 3 */

    /* -- searching for a genuinely absent key with the same home still stops at a true empty slot -- */
    CHECK_EQ_INT(ts_find(table, 9, 29), -1);   /* home 2 too: probes 2(TOMB),3(11),4(20),5(EMPTY) -> stop */

    /* -- insert reuses a tombstone instead of probing further -- */
    int slot = ts_insert(table, 9, 38);        /* home 2: slot 2 is a tombstone -> reused */
    CHECK_EQ_INT(slot, 2);
    CHECK_EQ_INT(table[2], 38);

    /* -- delete then reinsert the SAME key: lands back at the same slot -- */
    for (int i = 0; i < 9; i++) table[i] = EMPTY;
    ts_insert(table, 9, 7);
    int home = ts_find(table, 9, 7);
    ts_delete(table, 9, 7);
    CHECK_EQ_INT(ts_insert(table, 9, 7), home);

    /* -- a fully-tombstoned table (no true empty slot at all): find must terminate, not loop forever -- */
    for (int i = 0; i < 5; i++) table[i] = TOMB;
    CHECK_EQ_INT(ts_find(table, 5, 123), -1);   /* bounded by `tries < m`, must still return */

    /* -- insert into a fully-tombstoned table reuses the very first slot it tries -- */
    for (int i = 0; i < 5; i++) table[i] = TOMB;
    CHECK_EQ_INT(ts_insert(table, 5, 3), 3);    /* home of 3 in m=5 is slot 3, which is TOMB -> reused immediately */

    /* -- m=1: delete then find then reinsert, all on the single slot -- */
    int one[1]; one[0] = EMPTY;
    ts_insert(one, 1, 9);
    CHECK_EQ_INT(ts_delete(one, 1, 9), 0);
    CHECK_EQ_INT(ts_find(one, 1, 9), -1);
    CHECK_EQ_INT(ts_insert(one, 1, 9), 0);

    /* -- integration: run_scenario writes a real file inside a real lab folder and cleans it up -- */
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);
    int ins[] = { 1, 2, 3 };
    int del[] = { 2 };
    run_scenario("unit-test integration", lab, 7, ins, 3, del, 1, 1, 99, 9);
    char check_path[600];
    snprintf(check_path, sizeof(check_path), "%s/table.dat", lab);
    FILE *gone = fopen(check_path, "rb");
    CHECK(gone == NULL);
    RMDIR(lab);

    TEST_SUMMARY();
}
