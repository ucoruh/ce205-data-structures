/* Unit tests for week-03 c/prefix_evaluator.c
 * Prefix scans right to left, so for a non-commutative op the FIRST operand popped
 * is the LEFT operand (see the comments in eval_prefix). */
#define main program_main
#include "../../c/prefix_evaluator.c"
#undef main
#include "../../../test_check.h"

static int run_ok(char *tok[], int n, bool *err) { *err = false; return eval_prefix(tok, n, err); }

int main(void) {
    bool err;

    /* -- a single number -- */
    char *one[] = {"5"};
    CHECK_EQ_INT(run_ok(one, 1, &err), 5);
    CHECK(err == false);

    /* -- one operator: + 3 4 = 7 -- */
    char *add[] = {"+", "3", "4"};
    CHECK_EQ_INT(run_ok(add, 3, &err), 7);

    /* -- non-commutative, order preserved: - 10 3 means 10 - 3 = 7 (NOT 3 - 10) -- */
    char *sub[] = {"-", "10", "3"};
    CHECK_EQ_INT(run_ok(sub, 3, &err), 7);

    /* -- multiplication -- */
    char *mul[] = {"*", "6", "7"};
    CHECK_EQ_INT(run_ok(mul, 3, &err), 42);

    /* -- integer division, order preserved: / 7 2 means 7 / 2 = 3 -- */
    char *dv[] = {"/", "7", "2"};
    CHECK_EQ_INT(run_ok(dv, 3, &err), 3);

    /* -- nested, hand-computed: * + 2 3 4 means (2+3)*4 = 20 -- */
    char *e1[] = {"*", "+", "2", "3", "4"};
    CHECK_EQ_INT(run_ok(e1, 5, &err), 20);

    /* -- the program's own normal preset. Parsed left to right by the standard
     *    recursive-descent prefix rule (operator, then its left subtree, then its
     *    right subtree) -- a method independent of the program's own right-to-left
     *    stack scan -- this token stream is:
     *      -( +( -( *( +(5,3), 8 ), 2 ), 6 ), 12 )
     *    = -( +( -( *(8,8), 2 ), 6 ), 12 ) = -( +( -(64,2), 6 ), 12 )
     *    = -( +(62, 6), 12 ) = -(68, 12) = 56 -- */
    char *normal[] = {"-", "+", "-", "*", "+", "5", "3", "8", "2", "6", "12"};
    CHECK_EQ_INT(run_ok(normal, 11, &err), 56);
    CHECK(err == false);

    /* -- too few operands: an operator as the very last token (processed first,
     *    since prefix scans right to left) with nothing yet on the stack -- */
    char *tooFew1[] = {"+", "5"};    /* scanning right to left: "5" then "+" needs 2 operands, has 1 */
    run_ok(tooFew1, 2, &err);
    CHECK(err == true);
    char *tooFew2[] = {"+"};
    run_ok(tooFew2, 1, &err);
    CHECK(err == true);

    /* -- the program's own "too few operands" abnormal preset -- */
    char *edge[] = {"+", "5", "3", "8", "2", "*", "9", "+", "6", "-", "7"};
    run_ok(edge, 11, &err);
    CHECK(err == true);

    /* -- division by zero -- */
    char *dz[] = {"/", "4", "0"};
    run_ok(dz, 3, &err);
    CHECK(err == true);

    /* -- too many operands left over: two numbers, no operator to combine them -- */
    char *tooMany[] = {"3", "4"};
    run_ok(tooMany, 2, &err);
    CHECK(err == true);

    /* -- empty input is an error, not a crash -- */
    char *none[] = {"x"};
    run_ok(none, 0, &err);
    CHECK(err == true);

    /* -- negative results are allowed -- */
    char *neg[] = {"-", "3", "10"};
    CHECK_EQ_INT(run_ok(neg, 3, &err), -7);
    CHECK(err == false);

    /* -- apply() and is_number() directly -- */
    CHECK_EQ_INT(apply('+', 2, 3), 5);
    CHECK_EQ_INT(apply('-', 2, 3), -1);
    CHECK_EQ_INT(apply('*', 2, 3), 6);
    CHECK_EQ_INT(apply('/', 7, 2), 3);
    CHECK(is_number("5") == true);
    CHECK(is_number("-") == false);

    /* -- run() is exercised for integration/coverage -- */
    run("unit-test integration", add, 3);

    TEST_SUMMARY();
}
