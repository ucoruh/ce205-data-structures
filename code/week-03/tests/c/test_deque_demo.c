/* Unit tests for week-03 c/deque_demo.c
 * NOTE: every push in this file is matched by a pop before the test exits, so the
 * sanitized build (leak detection) stays clean. */
#include <limits.h>

#define main program_main
#include "../../c/deque_demo.c"
#undef main
#include "../../../test_check.h"

static void drain(void) { int junk; while (front != NULL) pop_front(&junk); }

int main(void) {
    int out;

    /* -- empty deque: both ends report a clean underflow -- */
    drain();
    CHECK(pop_back(&out) == false);
    CHECK(pop_front(&out) == false);

    /* -- push_back then pop_back: single element round trip -- */
    push_back(5);
    CHECK(pop_back(&out) == true);
    CHECK_EQ_INT(out, 5);
    CHECK(front == NULL);
    CHECK(rear == NULL);

    /* -- push_front then pop_front: single element round trip -- */
    push_front(6);
    CHECK(pop_front(&out) == true);
    CHECK_EQ_INT(out, 6);

    /* -- two pushes at the back, remove from the front: FIFO-style use -- */
    push_back(1); push_back(2);
    CHECK(pop_front(&out) == true); CHECK_EQ_INT(out, 1);
    CHECK(pop_back(&out) == true);  CHECK_EQ_INT(out, 2);

    /* -- two pushes at the front: the second push_front becomes the new front -- */
    push_front(1); push_front(2);   /* front to back: 2, 1 */
    CHECK(pop_front(&out) == true); CHECK_EQ_INT(out, 2);
    CHECK(pop_front(&out) == true); CHECK_EQ_INT(out, 1);

    /* -- mixed ends, independent hand-traced sequence:
     *    push_back(1) -> [1]
     *    push_front(2) -> [2,1]
     *    push_back(3) -> [2,1,3]
     *    pop_front() -> 2, leaves [1,3]
     *    pop_back()  -> 3, leaves [1]
     *    pop_front() -> 1, leaves []                -- */
    push_back(1); push_front(2); push_back(3);
    CHECK(pop_front(&out) == true); CHECK_EQ_INT(out, 2);
    CHECK(pop_back(&out) == true);  CHECK_EQ_INT(out, 3);
    CHECK(pop_front(&out) == true); CHECK_EQ_INT(out, 1);
    CHECK(front == NULL);
    CHECK(rear == NULL);
    CHECK(pop_front(&out) == false);   /* underflow at the front */
    CHECK(pop_back(&out) == false);    /* underflow at the back, independently */

    /* -- duplicates and negative values -- */
    push_back(-7); push_back(-7); push_front(3);
    CHECK(pop_front(&out) == true); CHECK_EQ_INT(out, 3);
    CHECK(pop_back(&out) == true);  CHECK_EQ_INT(out, -7);
    CHECK(pop_back(&out) == true);  CHECK_EQ_INT(out, -7);

    /* -- INT_MIN / INT_MAX at both ends -- */
    push_back(INT_MIN); push_front(INT_MAX);
    CHECK(pop_front(&out) == true); CHECK_EQ_INT(out, INT_MAX);
    CHECK(pop_back(&out) == true);  CHECK_EQ_INT(out, INT_MIN);

    /* -- run_token parses the same mini-language the program's main() uses -- */
    run_token("10");   /* push_back(10) */
    run_token("f20");  /* push_front(20) */
    CHECK_EQ_INT(front->data, 20);
    CHECK_EQ_INT(rear->data, 10);
    run_token("pb");   /* pop_back(): removes 10 */
    run_token("pf");   /* pop_front(): removes 20 */
    CHECK(front == NULL);

    /* -- integration: run_scenario starts empty itself and drives the real path,
     *    including an underflow at both ends -- */
    const char *tiny[] = {"pb", "pf", "1", "f2", "pb", "pf"};
    run_scenario("unit-test integration", tiny, 6);
    CHECK(front == NULL);
    CHECK(rear == NULL);

    drain();   /* safety net: leave nothing allocated */
    TEST_SUMMARY();
}
