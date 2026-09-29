/* Unit tests for code/week-11/c/bst_search.c: bst_search(). */
#define main program_main
#include "../../c/bst_search.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    Node *root = NULL;
    int keys[] = {50, 30, 70, 20, 40, 60, 80};
    for (int i = 0; i < 7; i++) root = bst_build_insert(root, keys[i]);

    CHECK_EQ_INT(bst_search(root, 50), 1); CHECK_EQ_INT(probes, 1);   /* root: found at the first comparison */
    CHECK_EQ_INT(bst_search(root, 20), 1); CHECK_EQ_INT(probes, 3);   /* leaf, deepest */
    CHECK_EQ_INT(bst_search(root, 80), 1);
    CHECK_EQ_INT(bst_search(root, 99), 0);                            /* not found: falls off the right */
    CHECK_EQ_INT(bst_search(root, -99), 0);                           /* not found: falls off the left */

    /* empty tree */
    Node *empty = NULL;
    CHECK_EQ_INT(bst_search(empty, 5), 0);
    CHECK_EQ_INT(probes, 0);

    /* one element: found and not found */
    Node *one = NULL;
    one = bst_build_insert(one, 42);
    CHECK_EQ_INT(bst_search(one, 42), 1);
    CHECK_EQ_INT(bst_search(one, 7), 0);

    /* two elements */
    Node *two = NULL;
    two = bst_build_insert(two, 10);
    two = bst_build_insert(two, 20);
    CHECK_EQ_INT(bst_search(two, 10), 1);
    CHECK_EQ_INT(bst_search(two, 20), 1);
    CHECK_EQ_INT(bst_search(two, 15), 0);

    /* duplicates: inserting again does not change search behavior */
    Node *dup = NULL;
    dup = bst_build_insert(dup, 5);
    dup = bst_build_insert(dup, 5);
    dup = bst_build_insert(dup, 3);
    CHECK_EQ_INT(bst_search(dup, 5), 1);
    CHECK_EQ_INT(bst_search(dup, 3), 1);

    /* negative values */
    Node *neg = NULL;
    int negs[] = {0, -5, 10, -10, 5};
    for (int i = 0; i < 5; i++) neg = bst_build_insert(neg, negs[i]);
    CHECK_EQ_INT(bst_search(neg, -10), 1);
    CHECK_EQ_INT(bst_search(neg, -5), 1);
    CHECK_EQ_INT(bst_search(neg, 999), 0);

    /* sorted (degenerate) insertion: worst-case search cost equals height + 1 */
    Node *chain = NULL;
    for (int i = 1; i <= 6; i++) chain = bst_build_insert(chain, i);
    CHECK_EQ_INT(bst_search(chain, 6), 1);
    CHECK_EQ_INT(probes, 6);
    CHECK_EQ_INT(bst_search(chain, 1), 1);
    CHECK_EQ_INT(probes, 1);

    /* extreme values */
    Node *ext = NULL;
    ext = bst_build_insert(ext, 2147483647);
    ext = bst_build_insert(ext, -2147483648);
    CHECK_EQ_INT(bst_search(ext, 2147483647), 1);
    CHECK_EQ_INT(bst_search(ext, -2147483648), 1);

    free_tree(root); free_tree(one); free_tree(two); free_tree(dup); free_tree(neg); free_tree(chain); free_tree(ext);
    TEST_SUMMARY();
}
