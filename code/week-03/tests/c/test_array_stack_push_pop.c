/* Unit tests for week-03 c/array_stack_push_pop.c */
#include <limits.h>

#define main program_main
#include "../../c/array_stack_push_pop.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int out;

    /* -- starts empty -- */
    top = -1; cap = MAX_CAP;
    CHECK(top == -1);

    /* -- pop on an empty stack: underflow, must not crash, out untouched -- */
    out = 777;
    CHECK(pop(&out) == false);
    CHECK_EQ_INT(out, 777);

    /* -- single push/pop round trip -- */
    top = -1; cap = MAX_CAP;
    CHECK(push(42) == true);
    CHECK_EQ_INT(top, 0);
    CHECK_EQ_INT(data[0], 42);
    CHECK(pop(&out) == true);
    CHECK_EQ_INT(out, 42);
    CHECK_EQ_INT(top, -1);

    /* -- LIFO order over a known sequence: push 10,20,30 then pop must give 30,20,10 -- */
    top = -1; cap = MAX_CAP;
    push(10); push(20); push(30);
    CHECK_EQ_INT(top, 2);
    pop(&out); CHECK_EQ_INT(out, 30);
    pop(&out); CHECK_EQ_INT(out, 20);
    pop(&out); CHECK_EQ_INT(out, 10);
    CHECK_EQ_INT(top, -1);

    /* -- two elements: push then pop both, in reverse order -- */
    top = -1; cap = MAX_CAP;
    push(1); push(2);
    pop(&out); CHECK_EQ_INT(out, 2);
    pop(&out); CHECK_EQ_INT(out, 1);
    CHECK(pop(&out) == false);   /* now empty again */

    /* -- duplicates: three equal values pop back in the same value each time -- */
    top = -1; cap = MAX_CAP;
    push(9); push(9); push(9);
    pop(&out); CHECK_EQ_INT(out, 9);
    pop(&out); CHECK_EQ_INT(out, 9);
    pop(&out); CHECK_EQ_INT(out, 9);

    /* -- negative values round-trip correctly -- */
    top = -1; cap = MAX_CAP;
    push(-5); push(-100);
    pop(&out); CHECK_EQ_INT(out, -100);
    pop(&out); CHECK_EQ_INT(out, -5);

    /* -- INT_MIN / INT_MAX round-trip correctly -- */
    top = -1; cap = MAX_CAP;
    push(INT_MAX); push(INT_MIN);
    pop(&out); CHECK_EQ_INT(out, INT_MIN);
    pop(&out); CHECK_EQ_INT(out, INT_MAX);

    /* -- overflow: a 3-slot stack rejects the 4th push, top stays at cap-1 -- */
    top = -1; cap = 3;
    CHECK(push(1) == true);
    CHECK(push(2) == true);
    CHECK(push(3) == true);
    CHECK_EQ_INT(top, 2);
    CHECK(push(4) == false);      /* overflow: rejected */
    CHECK_EQ_INT(top, 2);         /* top did not move */
    CHECK_EQ_INT(data[2], 3);     /* nothing was overwritten */

    /* -- one-slot stack (cap = 1): boundary between full and empty in one cell -- */
    top = -1; cap = 1;
    CHECK(push(55) == true);
    CHECK(push(66) == false);     /* already full */
    CHECK(pop(&out) == true);
    CHECK_EQ_INT(out, 55);
    CHECK(pop(&out) == false);    /* already empty again */

    /* -- integration: run_scenario drives the same push/pop through the real
     *    program path (exercises print_stack too) and leaves a sane final state -- */
    Op tiny[] = { {false, 1}, {false, 2}, {true, 0} };
    run_scenario("unit-test integration", 5, tiny, 3);
    CHECK_EQ_INT(top, 0);         /* pushed 1,2 then popped once: only 1 left */
    CHECK_EQ_INT(data[0], 1);

    TEST_SUMMARY();
}
