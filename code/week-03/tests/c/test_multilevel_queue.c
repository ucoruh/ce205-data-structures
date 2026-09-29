/* Unit tests for week-03 c/multilevel_queue.c */
#include <string.h>

#define main program_main
#include "../../c/multilevel_queue.c"
#undef main
#include "../../../test_check.h"

static void reset_all(void) { for (int lvl = 0; lvl < LEVELS; lvl++) queue_reset(&q[lvl]); }

int main(void) {
    Process out;

    /* -- everything empty: pick_next reports "nothing to run", not a crash -- */
    reset_all();
    CHECK(pick_next(&out) == 0);

    /* -- one process admitted to level 0, picked back out unchanged -- */
    reset_all();
    admit((Process){"P1", 0});
    CHECK(pick_next(&out) == 1);
    CHECK(strcmp(out.name, "P1") == 0);
    CHECK_EQ_INT(out.level, 0);
    CHECK(pick_next(&out) == 0);   /* drained: nothing left */

    /* -- priority ordering: system (0) before interactive (1) before batch (2),
     *    regardless of admission order -- */
    reset_all();
    admit((Process){"B", 2});
    admit((Process){"I", 1});
    admit((Process){"S", 0});
    pick_next(&out); CHECK(strcmp(out.name, "S") == 0);
    pick_next(&out); CHECK(strcmp(out.name, "I") == 0);
    pick_next(&out); CHECK(strcmp(out.name, "B") == 0);
    CHECK(pick_next(&out) == 0);

    /* -- FIFO within one level: first admitted, first picked -- */
    reset_all();
    admit((Process){"P1", 1});
    admit((Process){"P2", 1});
    admit((Process){"P3", 1});
    pick_next(&out); CHECK(strcmp(out.name, "P1") == 0);
    pick_next(&out); CHECK(strcmp(out.name, "P2") == 0);
    pick_next(&out); CHECK(strcmp(out.name, "P3") == 0);

    /* -- a lower level is only served once every higher level is drained, even when
     *    the higher levels keep receiving new arrivals in between -- */
    reset_all();
    admit((Process){"Sys1", 0});
    admit((Process){"Batch1", 2});
    pick_next(&out); CHECK(strcmp(out.name, "Sys1") == 0);   /* system still wins */
    admit((Process){"Sys2", 0});                              /* a fresh system arrival ... */
    pick_next(&out); CHECK(strcmp(out.name, "Sys2") == 0);    /* ... still cuts in front of batch */
    pick_next(&out); CHECK(strcmp(out.name, "Batch1") == 0);  /* batch only now, level 0 and 1 empty */

    /* -- is_empty / queue_reset: resetting one level drops its pending work -- */
    reset_all();
    admit((Process){"Gone", 1});
    CHECK(is_empty(&q[1]) == 0);
    queue_reset(&q[1]);
    CHECK(is_empty(&q[1]) != 0);
    CHECK(pick_next(&out) == 0);   /* the reset process is not served */

    /* -- level_name covers all three classes -- */
    CHECK(strcmp(level_name(0), "system") == 0);
    CHECK(strcmp(level_name(1), "interactive") == 0);
    CHECK(strcmp(level_name(2), "batch") == 0);

    /* -- overflow: a single level's ring buffer is QCAP (20) slots; admitting one more
     *    must not corrupt memory or silently replace an unread process -- */
    reset_all();
    for (int i = 0; i < QCAP + 1; i++) {
        Process p; snprintf(p.name, sizeof p.name, "Q%d", i); p.level = 0;
        admit(p);
    }
    /* the loop above admits QCAP+1 times; count must not exceed QCAP */
    CHECK_EQ_INT(q[0].count, QCAP);
    int served = 0;
    while (pick_next(&out)) {
        CHECK(strcmp(out.name, "Q20") != 0);   /* the QCAP-th (21st, index 20) admit was refused */
        served++;
    }
    CHECK_EQ_INT(served, QCAP);   /* exactly QCAP processes come back out, none lost track of, none duplicated */

    /* -- integration: run_scenario resets every level itself and drives the real path -- */
    Process tiny[] = { {"X1", 0}, {"X2", 1}, {"X3", 2} };
    run_scenario("unit-test integration", tiny, 3);
    CHECK(is_empty(&q[0]) != 0);
    CHECK(is_empty(&q[1]) != 0);
    CHECK(is_empty(&q[2]) != 0);   /* run_scenario drains every level through pick_next */

    TEST_SUMMARY();
}
