/* Unit tests for week-03 c/array_queue_drift.c
 * This queue is deliberately naive (the drift bug is the lesson): once `rear` reaches
 * cap-1 it never comes back down, so the queue reports "full" even after elements
 * have been dequeued and slots at the front are wasted. The tests check both the
 * normal FIFO behavior and that this specific drift bug reproduces on demand. */
#include <limits.h>

#define main program_main
#include "../../c/array_queue_drift.c"
#undef main
#include "../../../test_check.h"

static void reset(int c) { front = 0; rear = -1; cap = c; }

int main(void) {
    int out;

    /* -- empty queue: dequeue is a clean underflow -- */
    reset(MAX_CAP);
    CHECK(dequeue(&out) == false);

    /* -- single enqueue/dequeue round trip -- */
    reset(MAX_CAP);
    CHECK(enqueue(7) == true);
    CHECK(dequeue(&out) == true);
    CHECK_EQ_INT(out, 7);
    CHECK(dequeue(&out) == false);   /* empty again */

    /* -- FIFO order for three elements -- */
    reset(MAX_CAP);
    enqueue(10); enqueue(20); enqueue(30);
    dequeue(&out); CHECK_EQ_INT(out, 10);
    dequeue(&out); CHECK_EQ_INT(out, 20);
    dequeue(&out); CHECK_EQ_INT(out, 30);

    /* -- "full" at rear == cap - 1 -- */
    reset(4);
    enqueue(1); enqueue(2); enqueue(3); enqueue(4);
    CHECK_EQ_INT(rear, 3);
    CHECK(enqueue(5) == false);      /* rear is already at cap - 1 */

    /* -- the drift bug, demonstrated directly: dequeuing does NOT free space at the
     *    rear, so a queue that is well under capacity by element count can still
     *    reject an enqueue -- */
    reset(4);
    enqueue(1); enqueue(2); enqueue(3); enqueue(4);   /* rear = 3, "full" */
    dequeue(&out); CHECK_EQ_INT(out, 1);              /* front = 1 */
    dequeue(&out); CHECK_EQ_INT(out, 2);              /* front = 2: only 2 of 4 slots logically used */
    CHECK(enqueue(99) == false);     /* still rejected -- this is the drift bug, not a fresh bug */
    CHECK_EQ_INT(front, 2);
    CHECK_EQ_INT(rear, 3);
    dequeue(&out); CHECK_EQ_INT(out, 3);
    dequeue(&out); CHECK_EQ_INT(out, 4);
    CHECK(dequeue(&out) == false);   /* now genuinely empty (front > rear) */

    /* -- duplicates and negative values keep FIFO order -- */
    reset(MAX_CAP);
    enqueue(-8); enqueue(-8); enqueue(6);
    dequeue(&out); CHECK_EQ_INT(out, -8);
    dequeue(&out); CHECK_EQ_INT(out, -8);
    dequeue(&out); CHECK_EQ_INT(out, 6);

    /* -- INT_MIN / INT_MAX round-trip -- */
    reset(MAX_CAP);
    enqueue(INT_MIN); enqueue(INT_MAX);
    dequeue(&out); CHECK_EQ_INT(out, INT_MIN);
    dequeue(&out); CHECK_EQ_INT(out, INT_MAX);

    /* -- one-slot queue: full and empty are adjacent with nothing in between -- */
    reset(1);
    CHECK(enqueue(1) == true);
    CHECK(enqueue(2) == false);
    CHECK(dequeue(&out) == true);
    CHECK_EQ_INT(out, 1);
    CHECK(dequeue(&out) == false);

    /* -- integration: run_scenario exercises the real drift path -- */
    Op tiny[] = { {false, 1}, {false, 2}, {true, 0}, {true, 0}, {true, 0} };
    run_scenario("unit-test integration", 3, tiny, 5);
    CHECK_EQ_INT(front, 2);
    CHECK_EQ_INT(rear, 1);   /* 2 enqueues (rear ends at 1), 3 dequeues (1 underflows): front > rear */

    TEST_SUMMARY();
}
