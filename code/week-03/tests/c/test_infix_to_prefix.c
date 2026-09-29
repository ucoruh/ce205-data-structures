/* Unit tests for week-03 c/infix_to_prefix.c
 * Expected prefix strings below are hand-derived independently, by fully
 * parenthesizing the infix expression per the standard precedence/associativity
 * rules and then moving each operator in front of its two operands -- not by
 * tracing the reverse-shunting-yard algorithm the program itself uses. */
#include <string.h>

#define main program_main
#include "../../c/infix_to_prefix.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    char out[128];

    /* -- a single operand -- */
    CHECK(to_prefix("A", out) == true);
    CHECK(strcmp(out, "A") == 0);

    /* -- one operator: A+B -> +AB -- */
    CHECK(to_prefix("A+B", out) == true);
    CHECK(strcmp(out, "+AB") == 0);

    /* -- precedence: A*B+C is (A*B)+C -> +*ABC -- */
    CHECK(to_prefix("A*B+C", out) == true);
    CHECK(strcmp(out, "+*ABC") == 0);

    /* -- left-associativity carried through correctly: A-B-C is (A-B)-C -> --ABC -- */
    CHECK(to_prefix("A-B-C", out) == true);
    CHECK(strcmp(out, "--ABC") == 0);

    /* -- parentheses: (A)  is just A -- */
    CHECK(to_prefix("(A)", out) == true);
    CHECK(strcmp(out, "A") == 0);

    /* -- the program's own three real presets, independently re-derived:
     *    A+B*C-D+E*F is ((A+(B*C))-D)+(E*F) -> +-+A*BCD*EF
     *    (A+B) * (C-D) / E + F*G is (((A+B)*(C-D))/E)+(F*G), prefix "+ / * +AB-CDE *FG"
     *    the same-precedence chain front-loads all 9 operators, operands follow
     *    in original order (the algorithm's own "strict >" rule never pops within
     *    a uniform chain, so every operator survives to the final flush) -- */
    CHECK(to_prefix("A+B*C-D+E*F", out) == true);
    CHECK(strcmp(out, "+-+A*BCD*EF") == 0);
    CHECK(to_prefix("(A+B)*(C-D)/E+F*G", out) == true);
    CHECK(strcmp(out, "+/*+AB-CDE*FG") == 0);
    CHECK(to_prefix("A+B+C+D+E+F+G+H+I+J", out) == true);
    CHECK(strcmp(out, "+++++++++ABCDEFGHIJ") == 0);

    /* -- unbalanced: a closing parenthesis with nothing left to match -- */
    CHECK(to_prefix(")", out) == false);
    CHECK(to_prefix("A+B)", out) == false);
    CHECK(to_prefix("A+B*C)-D+E*F", out) == false);      /* the program's own abnormal preset */

    /* -- unbalanced: an opening parenthesis with nothing to close it -- */
    CHECK(to_prefix("(", out) == false);
    CHECK(to_prefix("(A+B", out) == false);
    CHECK(to_prefix("A+(B*C-(D+E)*F", out) == false);    /* the program's own abnormal preset */

    /* -- a well-formed expression right after a failed one must still work -- */
    CHECK(to_prefix("A+B", out) == true);
    CHECK(strcmp(out, "+AB") == 0);

    /* -- swap_paren and reverse_and_swap_parens, the building blocks -- */
    CHECK(swap_paren('(') == ')');
    CHECK(swap_paren(')') == '(');
    CHECK(swap_paren('A') == 'A');
    char rev[100];
    reverse_and_swap_parens("A(B", rev);
    CHECK(strcmp(rev, "B)A") == 0);

    /* -- run() is exercised for integration/coverage -- */
    run("unit-test integration", "A+B*C");

    TEST_SUMMARY();
}
