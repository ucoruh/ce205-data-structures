/* Unit tests for code/week-02/c/singly_search.c: search().
   Independent oracle: index and comparisons are hand-counted from the input array (comparisons = the
   1-based position of the match, or the full length when not found), never read from search()'s own trace. */
#define main program_main
#include "../../c/singly_search.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int vals[] = {12, 45, 3, 78, 23, 56, 89, 1, 67, 34};   /* n = 10 */
    Node *head = build_list(vals, 10);
    int cmp;

    /* found: first, middle, last */
    CHECK_EQ_INT(search(head, 12, &cmp), 0); CHECK_EQ_INT(cmp, 1);
    CHECK_EQ_INT(search(head, 23, &cmp), 4); CHECK_EQ_INT(cmp, 5);
    CHECK_EQ_INT(search(head, 34, &cmp), 9); CHECK_EQ_INT(cmp, 10);

    /* not found: scans the whole list */
    CHECK_EQ_INT(search(head, 999, &cmp), -1); CHECK_EQ_INT(cmp, 10);
    free_list(head);

    /* empty list: not found immediately, zero comparisons */
    CHECK_EQ_INT(search(NULL, 1, &cmp), -1); CHECK_EQ_INT(cmp, 0);

    /* one element: found and not found */
    Node *one = build_list((int[]){42}, 1);
    CHECK_EQ_INT(search(one, 42, &cmp), 0); CHECK_EQ_INT(cmp, 1);
    CHECK_EQ_INT(search(one, 7, &cmp), -1); CHECK_EQ_INT(cmp, 1);
    free_list(one);

    /* two elements: found first, found second */
    Node *two = build_list((int[]){10, 20}, 2);
    CHECK_EQ_INT(search(two, 10, &cmp), 0); CHECK_EQ_INT(cmp, 1);
    CHECK_EQ_INT(search(two, 20, &cmp), 1); CHECK_EQ_INT(cmp, 2);
    free_list(two);

    /* duplicates: the FIRST occurrence wins, with the comparison count of THAT position */
    Node *dup = build_list((int[]){8, 15, 8, 22, 8}, 5);
    CHECK_EQ_INT(search(dup, 8, &cmp), 0); CHECK_EQ_INT(cmp, 1);
    free_list(dup);

    /* negative values and INT_MIN/INT_MAX */
    Node *extreme = build_list((int[]){-100, 0, 2147483647, -2147483648, 17}, 5);
    CHECK_EQ_INT(search(extreme, -100, &cmp), 0); CHECK_EQ_INT(cmp, 1);
    CHECK_EQ_INT(search(extreme, 2147483647, &cmp), 2); CHECK_EQ_INT(cmp, 3);
    CHECK_EQ_INT(search(extreme, -2147483648, &cmp), 3); CHECK_EQ_INT(cmp, 4);
    free_list(extreme);

    /* reverse-sorted list */
    Node *rev = build_list((int[]){9, 7, 5, 3, 1}, 5);
    CHECK_EQ_INT(search(rev, 1, &cmp), 4); CHECK_EQ_INT(cmp, 5);
    free_list(rev);

    TEST_SUMMARY();
}
