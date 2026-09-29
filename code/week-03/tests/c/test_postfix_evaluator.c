/* Unit tests for week-03 c/postfix_evaluator.c */
#define main program_main
#include "../../c/postfix_evaluator.c"
#undef main
#include "../../../test_check.h"

static int run_ok(char *tok[], int n, bool *err) { *err = false; return eval_postfix(tok, n, err); }

int main(void) {
    bool err;

    /* -- a single number: no operators at all -- */
    char *one[] = {"5"};
    CHECK_EQ_INT(run_ok(one, 1, &err), 5);
    CHECK(err == false);

    /* -- one operator, hand-computed: 3 4 + = 7 -- */
    char *add[] = {"3", "4", "+"};
    CHECK_EQ_INT(run_ok(add, 3, &err), 7);

    /* -- subtraction is NOT commutative: order matters, 10 3 - = 7 -- */
    char *sub[] = {"10", "3", "-"};
    CHECK_EQ_INT(run_ok(sub, 3, &err), 7);

    /* -- multiplication -- */
    char *mul[] = {"6", "7", "*"};
    CHECK_EQ_INT(run_ok(mul, 3, &err), 42);

    /* -- integer division truncates toward zero: 7 2 / = 3 -- */
    char *dv[] = {"7", "2", "/"};
    CHECK_EQ_INT(run_ok(dv, 3, &err), 3);

    /* -- a longer expression, hand-computed: 5 3 + 8 2 - * = (5+3)*(8-2) = 48 -- */
    char *e1[] = {"5", "3", "+", "8", "2", "-", "*"};
    CHECK_EQ_INT(run_ok(e1, 7, &err), 48);

    /* -- the program's own normal preset, hand-computed:
     *    5 3 + 8 2 - * 6 + 12 - = ((5+3)*(8-2)+6)-12 = (48+6)-12 = 42 -- */
    char *normal[] = {"5", "3", "+", "8", "2", "-", "*", "6", "+", "12", "-"};
    CHECK_EQ_INT(run_ok(normal, 11, &err), 42);
    CHECK(err == false);

    /* -- the program's own hard preset, hand-computed:
     *    12 3 / 4 * 5 + 20 - 2 * 7 + 3 * = ((((12/3)*4)+5)-20)*2+7)*3
     *    step by step: 12/3=4; 4*4=16; 16+5=21; 21-20=1; 1*2=2; 2+7=9; 9*3=27 -- */
    char *hard[] = {"12", "3", "/", "4", "*", "5", "+", "20", "-", "2", "*", "7", "+", "3", "*"};
    CHECK_EQ_INT(run_ok(hard, 15, &err), 27);
    CHECK(err == false);

    /* -- division by zero is reported as an error, not a crash -- */
    char *dz[] = {"4", "0", "/"};
    CHECK(run_ok(dz, 3, &err) == 0);
    CHECK(err == true);

    /* -- the program's own division-by-zero abnormal preset -- */
    char *edge[] = {"9", "3", "-", "6", "*", "0", "/", "5", "+", "8", "-", "2", "*"};
    run_ok(edge, 13, &err);
    CHECK(err == true);

    /* -- too few operands: an operator with only one (or zero) value pushed so far -- */
    char *tooFew1[] = {"5", "+"};
    run_ok(tooFew1, 2, &err);
    CHECK(err == true);
    char *tooFew2[] = {"+"};
    run_ok(tooFew2, 1, &err);
    CHECK(err == true);

    /* -- too many operands left over: two numbers, no operator to combine them -- */
    char *tooMany[] = {"3", "4"};
    run_ok(tooMany, 2, &err);
    CHECK(err == true);

    /* -- empty input: no numbers ever pushed, top stays -1, reported as an error -- */
    char *none[] = {"x"};   /* unused placeholder, n = 0 means the array is never read */
    run_ok(none, 0, &err);
    CHECK(err == true);

    /* -- negative results are allowed and are not mistaken for a new error -- */
    char *neg[] = {"3", "10", "-"};
    CHECK_EQ_INT(run_ok(neg, 3, &err), -7);
    CHECK(err == false);

    /* -- apply() and is_number() directly -- */
    CHECK_EQ_INT(apply('+', 2, 3), 5);
    CHECK_EQ_INT(apply('-', 2, 3), -1);
    CHECK_EQ_INT(apply('*', 2, 3), 6);
    CHECK_EQ_INT(apply('/', 7, 2), 3);
    CHECK(is_number("5") == true);
    CHECK(is_number("+") == false);

    /* -- run() is exercised for integration/coverage -- */
    run("unit-test integration", add, 3);

    TEST_SUMMARY();
}
