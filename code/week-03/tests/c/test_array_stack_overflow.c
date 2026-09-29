/* Unit tests for week-03 c/array_stack_overflow.c */
#include <limits.h>

#define main program_main
#include "../../c/array_stack_overflow.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int out;

    /* -- empty stack: pop is a clean underflow, not a crash -- */
    top = -1; cap = MAX_CAP;
    CHECK(pop(&out) == false);

    /* -- one element: push then pop it back -- */
    top = -1; cap = MAX_CAP;
    CHECK(push(3) == true);
    CHECK(pop(&out) == true);
    CHECK_EQ_INT(out, 3);

    /* -- two elements: LIFO order -- */
    top = -1; cap = MAX_CAP;
    push(1); push(2);
    pop(&out); CHECK_EQ_INT(out, 2);
    pop(&out); CHECK_EQ_INT(out, 1);

    /* -- overflow: fill a 4-slot stack exactly, the 5th push is rejected -- */
    top = -1; cap = 4;
    CHECK(push(10) == true);
    CHECK(push(20) == true);
    CHECK(push(30) == true);
    CHECK(push(40) == true);
    CHECK_EQ_INT(top, 3);
    CHECK(push(50) == false);        /* overflow */
    CHECK_EQ_INT(top, 3);            /* top unchanged */
    CHECK_EQ_INT(data[3], 40);       /* slot 3 untouched */

    /* -- a second push after overflow still fails until something is popped -- */
    CHECK(push(60) == false);
    CHECK(pop(&out) == true);
    CHECK_EQ_INT(out, 40);
    CHECK(push(60) == true);         /* now there is room again */
    CHECK_EQ_INT(top, 3);

    /* -- underflow after draining: pop exactly cap times, the (cap+1)th fails -- */
    top = -1; cap = 3;
    push(7); push(8); push(9);
    CHECK(pop(&out) == true); CHECK_EQ_INT(out, 9);
    CHECK(pop(&out) == true); CHECK_EQ_INT(out, 8);
    CHECK(pop(&out) == true); CHECK_EQ_INT(out, 7);
    CHECK(pop(&out) == false);       /* underflow: nothing left */
    CHECK_EQ_INT(top, -1);

    /* -- both failures in one very small stack (cap = 1) -- */
    top = -1; cap = 1;
    CHECK(push(100) == true);
    CHECK(push(200) == false);       /* overflow */
    CHECK(pop(&out) == true);
    CHECK_EQ_INT(out, 100);
    CHECK(pop(&out) == false);       /* underflow */

    /* -- duplicates survive push/pop unchanged -- */
    top = -1; cap = MAX_CAP;
    push(5); push(5); push(5);
    pop(&out); CHECK_EQ_INT(out, 5);
    pop(&out); CHECK_EQ_INT(out, 5);
    pop(&out); CHECK_EQ_INT(out, 5);

    /* -- extreme values round-trip through a full stack without corruption -- */
    top = -1; cap = 2;
    CHECK(push(INT_MIN) == true);
    CHECK(push(INT_MAX) == true);
    CHECK(push(0) == false);         /* overflow: cap is 2 */
    pop(&out); CHECK_EQ_INT(out, INT_MAX);
    pop(&out); CHECK_EQ_INT(out, INT_MIN);

    /* -- integration: run_scenario exercises the real overflow+underflow path -- */
    Op edge[] = { {false, 1}, {false, 2}, {false, 3}, {true, 0}, {true, 0}, {true, 0}, {true, 0} };
    run_scenario("unit-test integration", 2, edge, 7);
    CHECK_EQ_INT(top, -1);           /* pushed 3 into a cap-2 stack (1 rejected), then popped 4 times (1 rejected) */

    TEST_SUMMARY();
}
