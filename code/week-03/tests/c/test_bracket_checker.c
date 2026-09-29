/* Unit tests for week-03 c/bracket_checker.c */
#define main program_main
#include "../../c/bracket_checker.c"
#undef main
#include "../../../test_check.h"
#include <string.h>

int main(void) {
    /* -- empty input: vacuously balanced -- */
    CHECK(balanced("") == true);

    /* -- one character, not a bracket at all: vacuously balanced -- */
    CHECK(balanced("x") == true);
    CHECK(balanced("hello world") == true);

    /* -- one element: a lone opener or a lone closer, neither is balanced -- */
    CHECK(balanced("(") == false);
    CHECK(balanced(")") == false);   /* must not read past the empty stack */

    /* -- two elements: a matched pair of each bracket kind -- */
    CHECK(balanced("()") == true);
    CHECK(balanced("[]") == true);
    CHECK(balanced("{}") == true);

    /* -- all three kinds back to back -- */
    CHECK(balanced("()[]{}") == true);

    /* -- properly nested -- */
    CHECK(balanced("([{}])") == true);
    CHECK(balanced("((((()))))") == true);   /* ten deep */

    /* -- normal example from the program itself -- */
    CHECK(balanced("a(b[c]d)e{f}g") == true);

    /* -- hard example: three balanced groups, all three bracket kinds nested -- */
    CHECK(balanced("(a[b]{c})+(d[e]{f})*(g[h]{i})") == true);

    /* -- wrong closer type: ( does not match ] -- */
    CHECK(balanced("(]") == false);
    CHECK(balanced("start(a[b)c]end") == false);   /* the program's own edge example */

    /* -- interleaved (crossing) brackets: a classic wrong-nesting case -- */
    CHECK(balanced("([)]") == false);

    /* -- extra closer with nothing left to match -- */
    CHECK(balanced("()) ") == false);
    CHECK(balanced("a)b") == false);

    /* -- an opener that is never closed -- */
    CHECK(balanced("(a") == false);
    CHECK(balanced("a(b[c]d") == false);

    /* -- matches() itself, the character-pairing helper -- */
    CHECK(matches('(', ')') == true);
    CHECK(matches('[', ']') == true);
    CHECK(matches('{', '}') == true);
    CHECK(matches('(', ']') == false);
    CHECK(matches('{', ')') == false);

    TEST_SUMMARY();
}
