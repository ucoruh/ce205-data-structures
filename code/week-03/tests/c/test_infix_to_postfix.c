/* Unit tests for week-03 c/infix_to_postfix.c
 * Expected postfix strings below are hand-traced against the shunting-yard rules
 * (precedence table + left-associative pop-on-equal), not copied from the program's
 * own output. */
#include <string.h>

#define main program_main
#include "../../c/infix_to_postfix.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    char out[128];

    /* -- empty input: no operators, nothing to flush -- */
    CHECK(to_postfix("", out) == true);
    CHECK(strcmp(out, "") == 0);

    /* -- a single operand, no operators at all -- */
    CHECK(to_postfix("A", out) == true);
    CHECK(strcmp(out, "A") == 0);

    /* -- one operator -- */
    CHECK(to_postfix("A+B", out) == true);
    CHECK(strcmp(out, "AB+") == 0);

    /* -- higher precedence binds first: A*B+C -> AB*C+ -- */
    CHECK(to_postfix("A*B+C", out) == true);
    CHECK(strcmp(out, "AB*C+") == 0);

    /* -- and the mirror: A+B*C -> ABC*+ -- */
    CHECK(to_postfix("A+B*C", out) == true);
    CHECK(strcmp(out, "ABC*+") == 0);

    /* -- left-associativity of equal-precedence operators: (A-B)-C, not A-(B-C) -- */
    CHECK(to_postfix("A-B-C", out) == true);
    CHECK(strcmp(out, "AB-C-") == 0);

    /* -- parentheses override precedence: (A+B)*C -- */
    CHECK(to_postfix("(A+B)*C", out) == true);
    CHECK(strcmp(out, "AB+C*") == 0);

    /* -- a single operand wrapped in a balanced, otherwise-redundant parenthesis -- */
    CHECK(to_postfix("(A)", out) == true);
    CHECK(strcmp(out, "A") == 0);

    /* -- the program's own three real presets -- */
    CHECK(to_postfix("A+B*C-D+E*F", out) == true);
    CHECK(strcmp(out, "ABC*+D-EF*+") == 0);
    CHECK(to_postfix("(A+B)*(C-D)/E+F*G", out) == true);
    CHECK(strcmp(out, "AB+CD-*E/FG*+") == 0);
    CHECK(to_postfix("A+B+C+D+E+F+G+H+I+J", out) == true);
    CHECK(strcmp(out, "AB+C+D+E+F+G+H+I+J+") == 0);

    /* -- unbalanced: an opening parenthesis with nothing to close it -- */
    CHECK(to_postfix("(", out) == false);
    CHECK(to_postfix("(A+B", out) == false);
    CHECK(to_postfix("A+(B*C-(D+E)*F", out) == false);   /* the program's own abnormal preset */

    /* -- unbalanced: a closing parenthesis with nothing left to match -- */
    CHECK(to_postfix(")", out) == false);
    CHECK(to_postfix("A+B)", out) == false);
    CHECK(to_postfix("A+B*C)-D+E*F", out) == false);      /* the program's own abnormal preset */

    /* -- a well-formed expression right after a failed one must still work: the
     *    caller can reuse `out` / the function has no lingering global state -- */
    CHECK(to_postfix("A+B", out) == true);
    CHECK(strcmp(out, "AB+") == 0);

    /* -- prec(): the precedence table itself -- */
    CHECK_EQ_INT(prec('+'), 1);
    CHECK_EQ_INT(prec('-'), 1);
    CHECK_EQ_INT(prec('*'), 2);
    CHECK_EQ_INT(prec('/'), 2);
    CHECK_EQ_INT(prec('('), 0);

    /* -- run() is exercised for integration/coverage -- */
    run("unit-test integration", "A+B*C");

    TEST_SUMMARY();
}
