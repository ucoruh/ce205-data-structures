/* Unit tests for code/week-11/c/bst_degenerate.c: bst_insert(), height(), ilog2(). */
#define main program_main
#include "../../c/bst_degenerate.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* ilog2: floor(log2(n)) */
    CHECK_EQ_INT(ilog2(1), 0);
    CHECK_EQ_INT(ilog2(2), 1);
    CHECK_EQ_INT(ilog2(3), 1);
    CHECK_EQ_INT(ilog2(4), 2);
    CHECK_EQ_INT(ilog2(7), 2);
    CHECK_EQ_INT(ilog2(8), 3);
    CHECK_EQ_INT(ilog2(1024), 10);

    /* ascending insert order: height = n - 1 (a pure chain) */
    Node *asc = NULL;
    for (int i = 1; i <= 10; i++) asc = bst_insert(asc, i);
    CHECK_EQ_INT(height(asc), 9);

    /* descending insert order: also height = n - 1, the other direction */
    Node *desc = NULL;
    for (int i = 10; i >= 1; i--) desc = bst_insert(desc, i);
    CHECK_EQ_INT(height(desc), 9);

    /* single key: height 0 */
    Node *single = NULL;
    single = bst_insert(single, 42);
    CHECK_EQ_INT(height(single), 0);

    /* two keys: height 1 either order */
    Node *two = NULL;
    two = bst_insert(two, 5);
    two = bst_insert(two, 9);
    CHECK_EQ_INT(height(two), 1);

    /* empty tree: height() convention is -1 */
    CHECK_EQ_INT(height(NULL), -1);

    /* a shuffled permutation of the SAME 10 keys as asc/desc stays much shallower */
    Node *shuf = NULL;
    int shuffled[] = {6, 9, 2, 10, 4, 8, 1, 7, 3, 5};
    for (int i = 0; i < 10; i++) shuf = bst_insert(shuf, shuffled[i]);
    CHECK(height(shuf) < height(asc));
    CHECK(height(shuf) <= 5);

    /* duplicates in the insertion sequence do not add height */
    Node *dup = NULL;
    int dk[] = {5, 5, 5, 5};
    for (int i = 0; i < 4; i++) dup = bst_insert(dup, dk[i]);
    CHECK_EQ_INT(height(dup), 0);

    /* negative and extreme values */
    Node *ext = NULL;
    ext = bst_insert(ext, 0);
    ext = bst_insert(ext, 2147483647);
    ext = bst_insert(ext, -2147483648);
    CHECK_EQ_INT(height(ext), 1);

    free_tree(asc); free_tree(desc); free_tree(single); free_tree(two); free_tree(shuf); free_tree(dup); free_tree(ext);
    TEST_SUMMARY();
}
