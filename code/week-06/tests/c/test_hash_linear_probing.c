/* Unit tests for week-06 c/hash_linear_probing.c
 * Two independent oracles, never derived from calling insert()/search()/delete_key():
 *  (a) fully hand-traced exact index/probe values for two scenarios (worked out on paper from the
 *      key list and m, following the linear-probing rule step by step);
 *  (b) a structural-invariant checker: every OCCUPIED key must be reachable by linear probing
 *      starting from its own home index ((key%m+m)%m), within m steps -- this must hold for ANY
 *      correct open-addressing table regardless of insertion order, so it is a genuine independent
 *      property check, not a re-implementation of the algorithm. */
#define main program_main
#include "../../c/hash_linear_probing.c"
#undef main
#include "../../../test_check.h"

/* (b) structural invariant: scan the table and confirm every occupied key is reachable from its home. */
static void check_reachable_from_home(void) {
    for (int idx = 0; idx < M; idx++) {
        if (state[idx] != OCCUPIED) continue;
        int key = table[idx];
        int home = ((key % M) + M) % M;
        int found = 0;
        int p = home;
        for (int i = 0; i < M; i++) {
            if (p == idx) { found = 1; break; }
            if (state[p] == EMPTY) break; /* a real EMPTY gap before reaching idx would break search() too */
            p = (p + 1) % M;
        }
        CHECK(found);
    }
}

typedef struct { int kind; int value; } TOp;

int main(void) {
    /* -- (a) fully hand-traced: the "normal" scenario from main(), m = 11 --
       23,34,45,12,56,67 all hash to home 1 (each %11 == 1); 18,29,40,51 all hash to home 7.
       Traced by hand, slot by slot (see test source comment history for the full derivation). */
    {
        M = 11;
        clear_table();
        int probes;
        probes = 0; CHECK_EQ_INT(insert(23, &probes), 1);  CHECK_EQ_INT(probes, 1);
        probes = 0; CHECK_EQ_INT(insert(34, &probes), 2);  CHECK_EQ_INT(probes, 2);
        probes = 0; CHECK_EQ_INT(insert(45, &probes), 3);  CHECK_EQ_INT(probes, 3);
        probes = 0; CHECK_EQ_INT(insert(12, &probes), 4);  CHECK_EQ_INT(probes, 4);
        probes = 0; CHECK_EQ_INT(insert(56, &probes), 5);  CHECK_EQ_INT(probes, 5);
        probes = 0; CHECK_EQ_INT(insert(67, &probes), 6);  CHECK_EQ_INT(probes, 6);
        probes = 0; CHECK_EQ_INT(insert(18, &probes), 7);  CHECK_EQ_INT(probes, 1);
        probes = 0; CHECK_EQ_INT(insert(29, &probes), 8);  CHECK_EQ_INT(probes, 2);
        probes = 0; CHECK_EQ_INT(insert(40, &probes), 9);  CHECK_EQ_INT(probes, 3);
        probes = 0; CHECK_EQ_INT(insert(51, &probes), 10); CHECK_EQ_INT(probes, 4);
        probes = 0; CHECK_EQ_INT(search(45, &probes), 3);  CHECK_EQ_INT(probes, 3);
        probes = 0; CHECK_EQ_INT(delete_key(34, &probes), 2); CHECK_EQ_INT(probes, 2);
        /* searching for the now-deleted 34 must walk PAST the tombstone at slot 2, all the way
           around to the empty slot 0, before concluding "not found": 11 probes. */
        probes = 0; CHECK_EQ_INT(search(34, &probes), -1); CHECK_EQ_INT(probes, 11);
        check_reachable_from_home();
        clear_table();
    }

    /* -- (a) fully hand-traced: table-full, m = 8, all 10 keys hash to home 3 --
       first 8 keys fill every slot (3,4,5,6,7,0,1,2 in wrap order); the last 2 are rejected. */
    {
        M = 8;
        clear_table();
        int probes;
        probes = 0; CHECK_EQ_INT(insert(3, &probes), 3);  CHECK_EQ_INT(probes, 1);
        probes = 0; CHECK_EQ_INT(insert(11, &probes), 4); CHECK_EQ_INT(probes, 2);
        probes = 0; CHECK_EQ_INT(insert(19, &probes), 5); CHECK_EQ_INT(probes, 3);
        probes = 0; CHECK_EQ_INT(insert(27, &probes), 6); CHECK_EQ_INT(probes, 4);
        probes = 0; CHECK_EQ_INT(insert(35, &probes), 7); CHECK_EQ_INT(probes, 5);
        probes = 0; CHECK_EQ_INT(insert(43, &probes), 0); CHECK_EQ_INT(probes, 6);
        probes = 0; CHECK_EQ_INT(insert(51, &probes), 1); CHECK_EQ_INT(probes, 7);
        probes = 0; CHECK_EQ_INT(insert(59, &probes), 2); CHECK_EQ_INT(probes, 8);
        probes = 0; CHECK_EQ_INT(insert(99, &probes), -1); CHECK_EQ_INT(probes, 8); /* table full: rejected */
        probes = 0; CHECK_EQ_INT(insert(67, &probes), -1); CHECK_EQ_INT(probes, 8);
        check_reachable_from_home();
        clear_table();
    }

    /* -- (b) structural checks on the remaining main() scenarios -- */
    {
        M = 11;
        clear_table();
        TOp hard[] = {
            {0, 11}, {0, 22}, {0, 33}, {0, 44}, {0, 55}, {0, 5}, {0, 16}, {0, 27}, {0, 38}, {0, 49},
            {1, 49}, {2, 22}, {1, 33}, {1, 22}
        };
        int placed = 0;
        for (int i = 0; i < 14; i++) {
            int probes = 0;
            if (hard[i].kind == 0) { int idx = insert(hard[i].value, &probes); if (idx != -1) placed++; }
            else if (hard[i].kind == 1) { search(hard[i].value, &probes); }
            else { delete_key(hard[i].value, &probes); }
        }
        CHECK_EQ_INT(placed, 10); /* m=11, 10 inserts, not full yet */
        check_reachable_from_home();
        clear_table();
    }
    {
        M = 11;
        clear_table();
        TOp tombstone[] = {
            {0, 15}, {0, 26}, {0, 37}, {0, 8}, {0, 19}, {0, 30}, {0, 41}, {0, 52}, {0, 63}, {0, 74},
            {2, 26}, {1, 37}, {1, 26}
        };
        for (int i = 0; i < 10; i++) { int probes = 0; insert(tombstone[i].value, &probes); }
        /* hand-traced: 15,26,37 all hash to home 4 (placed at 4,5,6); deleting 26 (slot 5) leaves a
           tombstone that search(37) must walk past to reach 37 at slot 6. */
        int probes = 0;
        CHECK_EQ_INT(delete_key(26, &probes), 5);
        CHECK_EQ_INT(probes, 2);
        probes = 0;
        CHECK_EQ_INT(search(37, &probes), 6);
        CHECK_EQ_INT(probes, 3);
        check_reachable_from_home();
        clear_table();
    }

    /* -- search/delete on an empty table: must fail safely, 1 probe (home slot is EMPTY) -- */
    {
        M = 11;
        clear_table();
        int probes = 0;
        CHECK_EQ_INT(search(5, &probes), -1);
        CHECK_EQ_INT(probes, 1);
        probes = 0;
        CHECK_EQ_INT(delete_key(5, &probes), -1);
        CHECK_EQ_INT(probes, 1);
    }

    /* -- m = 1: single slot, second insert always rejected -- */
    {
        M = 1;
        clear_table();
        int probes = 0;
        CHECK_EQ_INT(insert(5, &probes), 0);
        probes = 0;
        CHECK_EQ_INT(insert(9, &probes), -1);
        CHECK_EQ_INT(probes, 1);
        probes = 0;
        CHECK_EQ_INT(search(5, &probes), 0);
        clear_table();
    }

    TEST_SUMMARY();
}
