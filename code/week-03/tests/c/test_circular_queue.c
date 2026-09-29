/* Unit tests for week-03 c/circular_queue.c
 * Extra focus: the full/empty distinction, since front == rear can happen at BOTH
 * states -- count is what must tell them apart (see the note's "Test yourself" Q1). */
#include <limits.h>

#define main program_main
#include "../../c/circular_queue.c"
#undef main
#include "../../../test_check.h"

static void reset(int c) { front = 0; rear = -1; count = 0; cap = c; }

int main(void) {
    int out;

    /* -- empty queue: dequeue is a clean underflow -- */
    reset(MAX_CAP);
    CHECK_EQ_INT(count, 0);
    CHECK(dequeue(&out) == false);

    /* -- single enqueue/dequeue round trip -- */
    reset(MAX_CAP);
    CHECK(enqueue(7) == true);
    CHECK_EQ_INT(count, 1);
    CHECK(dequeue(&out) == true);
    CHECK_EQ_INT(out, 7);
    CHECK_EQ_INT(count, 0);

    /* -- FIFO order (not LIFO): three enqueues come back in the SAME order -- */
    reset(MAX_CAP);
    enqueue(10); enqueue(20); enqueue(30);
    dequeue(&out); CHECK_EQ_INT(out, 10);
    dequeue(&out); CHECK_EQ_INT(out, 20);
    dequeue(&out); CHECK_EQ_INT(out, 30);

    /* -- overflow: fill a 4-slot queue exactly, the 5th enqueue is rejected -- */
    reset(4);
    CHECK(enqueue(1) == true);
    CHECK(enqueue(2) == true);
    CHECK(enqueue(3) == true);
    CHECK(enqueue(4) == true);
    CHECK_EQ_INT(count, 4);
    CHECK(enqueue(5) == false);     /* overflow */
    CHECK_EQ_INT(count, 4);         /* count did not move */

    /* -- wraparound stays FIFO across the wrap: six enqueues (with two dequeues in
     *    between, forcing rear past the end of the array) still come out 1..6 in order -- */
    reset(4);
    enqueue(1); enqueue(2); enqueue(3); enqueue(4);   /* full: front=0 rear=3 */
    dequeue(&out); CHECK_EQ_INT(out, 1);
    dequeue(&out); CHECK_EQ_INT(out, 2);
    enqueue(5);                                        /* rear wraps to 0 */
    enqueue(6);                                        /* rear wraps to 1, full again */
    CHECK_EQ_INT(count, 4);
    dequeue(&out); CHECK_EQ_INT(out, 3);
    dequeue(&out); CHECK_EQ_INT(out, 4);
    dequeue(&out); CHECK_EQ_INT(out, 5);
    dequeue(&out); CHECK_EQ_INT(out, 6);
    CHECK_EQ_INT(count, 0);
    CHECK(dequeue(&out) == false);   /* underflow again */

    /* -- the full/empty ambiguity, made unmistakable with a 1-slot queue: after the
     *    first enqueue front == rear == 0 (FULL, count 1); after the dequeue that
     *    follows, front == rear == 0 AGAIN (EMPTY, count 0) -- the indices alone
     *    cannot tell the two apart, only `count` can. -- */
    reset(1);
    CHECK(enqueue(99) == true);
    CHECK_EQ_INT(front, rear);       /* indices coincide ... */
    CHECK_EQ_INT(count, 1);          /* ... but count says FULL */
    CHECK(enqueue(100) == false);    /* so a second enqueue correctly overflows */
    CHECK(dequeue(&out) == true);
    CHECK_EQ_INT(out, 99);
    CHECK_EQ_INT(front, rear);       /* indices coincide again ... */
    CHECK_EQ_INT(count, 0);          /* ... but count now says EMPTY */
    CHECK(dequeue(&out) == false);   /* so a second dequeue correctly underflows */
    CHECK(enqueue(101) == true);     /* and the single slot is reusable */
    dequeue(&out); CHECK_EQ_INT(out, 101);

    /* -- duplicates and negative values survive FIFO order -- */
    reset(MAX_CAP);
    enqueue(-3); enqueue(-3); enqueue(5);
    dequeue(&out); CHECK_EQ_INT(out, -3);
    dequeue(&out); CHECK_EQ_INT(out, -3);
    dequeue(&out); CHECK_EQ_INT(out, 5);

    /* -- INT_MIN / INT_MAX round-trip -- */
    reset(MAX_CAP);
    enqueue(INT_MIN); enqueue(INT_MAX);
    dequeue(&out); CHECK_EQ_INT(out, INT_MIN);
    dequeue(&out); CHECK_EQ_INT(out, INT_MAX);

    /* -- integration: run_scenario drives the real overflow+underflow path and
     *    resets front/rear/count itself -- */
    Op tiny[] = { {false, 1}, {false, 2}, {true, 0}, {true, 0}, {true, 0} };
    run_scenario("unit-test integration", 5, tiny, 5);
    CHECK_EQ_INT(count, 0);   /* 2 enqueues, 3 dequeues (1 of them underflows): ends empty */

    TEST_SUMMARY();
}
