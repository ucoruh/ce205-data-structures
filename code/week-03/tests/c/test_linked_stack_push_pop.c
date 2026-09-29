/* Unit tests for week-03 c/linked_stack_push_pop.c
 * NOTE: every push in this file is matched by a pop before the test exits, so the
 * sanitized build (leak detection) stays clean. */
#include <limits.h>

#define main program_main
#include "../../c/linked_stack_push_pop.c"
#undef main
#include "../../../test_check.h"

static void drain(void) { int junk; while (top != NULL) pop(&junk); }

int main(void) {
    int out;

    /* -- empty stack: pop is a clean underflow -- */
    drain();
    CHECK(top == NULL);
    CHECK(pop(&out) == false);

    /* -- single push/pop round trip -- */
    push(42);
    CHECK(top != NULL);
    CHECK_EQ_INT(top->data, 42);
    CHECK(pop(&out) == true);
    CHECK_EQ_INT(out, 42);
    CHECK(top == NULL);

    /* -- LIFO order over a known sequence -- */
    push(10); push(20); push(30);
    pop(&out); CHECK_EQ_INT(out, 30);
    pop(&out); CHECK_EQ_INT(out, 20);
    pop(&out); CHECK_EQ_INT(out, 10);
    CHECK(top == NULL);

    /* -- two elements -- */
    push(1); push(2);
    pop(&out); CHECK_EQ_INT(out, 2);
    pop(&out); CHECK_EQ_INT(out, 1);

    /* -- duplicates -- */
    push(9); push(9); push(9);
    pop(&out); CHECK_EQ_INT(out, 9);
    pop(&out); CHECK_EQ_INT(out, 9);
    pop(&out); CHECK_EQ_INT(out, 9);

    /* -- negative values -- */
    push(-5); push(-100);
    pop(&out); CHECK_EQ_INT(out, -100);
    pop(&out); CHECK_EQ_INT(out, -5);

    /* -- INT_MIN / INT_MAX -- */
    push(INT_MAX); push(INT_MIN);
    pop(&out); CHECK_EQ_INT(out, INT_MIN);
    pop(&out); CHECK_EQ_INT(out, INT_MAX);

    /* -- "unbounded": the linked stack has no capacity limit, push far more than
     *    any array-backed version in this chapter (cap 12) could hold, then drain -- */
    for (int i = 0; i < 500; i++) push(i);
    int count = 0;
    while (top != NULL) { pop(&out); count++; }
    CHECK_EQ_INT(count, 500);
    CHECK(top == NULL);

    /* -- pop on an empty stack after fully draining does not crash, still reports false -- */
    CHECK(pop(&out) == false);

    /* -- integration: run_scenario drives the real push/pop path and starts empty itself -- */
    Op tiny[] = { {false, 1}, {false, 2}, {true, 0}, {true, 0} };
    run_scenario("unit-test integration", tiny, 4);
    CHECK(top == NULL);   /* the scenario pushed 2 and popped 2: back to empty */

    drain();   /* safety net: leave nothing allocated */
    TEST_SUMMARY();
}
