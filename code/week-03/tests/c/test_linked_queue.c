/* Unit tests for week-03 c/linked_queue.c
 * NOTE: every enqueue in this file is matched by a dequeue before the test exits, so
 * the sanitized build (leak detection) stays clean. */
#include <limits.h>

#define main program_main
#include "../../c/linked_queue.c"
#undef main
#include "../../../test_check.h"

static void drain(void) { int junk; while (front != NULL) dequeue(&junk); }

int main(void) {
    int out;

    /* -- empty queue: dequeue is a clean underflow -- */
    drain();
    CHECK(front == NULL);
    CHECK(rear == NULL);
    CHECK(dequeue(&out) == false);

    /* -- single enqueue/dequeue round trip; rear becomes NULL again when it empties -- */
    enqueue(42);
    CHECK(front != NULL);
    CHECK(rear != NULL);
    CHECK(front == rear);          /* one node: front and rear are the same node */
    CHECK(dequeue(&out) == true);
    CHECK_EQ_INT(out, 42);
    CHECK(front == NULL);
    CHECK(rear == NULL);           /* both must be reset, not just front */

    /* -- FIFO order for three elements -- */
    enqueue(10); enqueue(20); enqueue(30);
    dequeue(&out); CHECK_EQ_INT(out, 10);
    dequeue(&out); CHECK_EQ_INT(out, 20);
    dequeue(&out); CHECK_EQ_INT(out, 30);
    CHECK(front == NULL);
    CHECK(rear == NULL);

    /* -- duplicates and negative values -- */
    enqueue(-4); enqueue(-4); enqueue(9);
    dequeue(&out); CHECK_EQ_INT(out, -4);
    dequeue(&out); CHECK_EQ_INT(out, -4);
    dequeue(&out); CHECK_EQ_INT(out, 9);

    /* -- INT_MIN / INT_MAX -- */
    enqueue(INT_MIN); enqueue(INT_MAX);
    dequeue(&out); CHECK_EQ_INT(out, INT_MIN);
    dequeue(&out); CHECK_EQ_INT(out, INT_MAX);

    /* -- unbounded: no capacity limit, unlike the array-backed queues in this chapter -- */
    for (int i = 0; i < 500; i++) enqueue(i);
    int count = 0;
    while (front != NULL) { dequeue(&out); CHECK_EQ_INT(out, count); count++; }
    CHECK_EQ_INT(count, 500);

    /* -- draining to empty then restarting works (rear must not stay dangling) -- */
    enqueue(1); enqueue(2);
    dequeue(&out); dequeue(&out);
    CHECK(front == NULL);
    CHECK(rear == NULL);
    enqueue(99);
    CHECK(front == rear);
    dequeue(&out);
    CHECK_EQ_INT(out, 99);

    /* -- integration: run_scenario starts empty itself and drives the real path -- */
    Op tiny[] = { {false, 1}, {false, 2}, {true, 0}, {true, 0} };
    run_scenario("unit-test integration", tiny, 4);
    CHECK(front == NULL);
    CHECK(rear == NULL);

    drain();   /* safety net: leave nothing allocated */
    TEST_SUMMARY();
}
