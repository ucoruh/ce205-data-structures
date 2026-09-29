/* Unit tests for code/week-11/c/bst_insert.c: bst_insert(). */
#define main program_main
#include "../../c/bst_insert.c"
#undef main
#include "../../../test_check.h"

static int contains(Node *n, int key) {
    if (!n) return 0;
    if (n->key == key) return 1;
    return key < n->key ? contains(n->left, key) : contains(n->right, key);
}
static int count_nodes(Node *n) { return n ? 1 + count_nodes(n->left) + count_nodes(n->right) : 0; }

int main(void) {
    Node *root = NULL;
    int keys[] = {50, 30, 70, 20, 40, 60, 80};
    for (int i = 0; i < 7; i++) root = bst_insert(root, keys[i]);
    CHECK(contains(root, 50));
    CHECK(contains(root, 20));
    CHECK(contains(root, 80));
    CHECK(!contains(root, 99));
    CHECK_EQ_INT(count_nodes(root), 7);
    CHECK_EQ_INT(height(root), 2);

    /* duplicate: tree unchanged */
    root = bst_insert(root, 50);
    CHECK_EQ_INT(count_nodes(root), 7);

    /* empty tree: first insert becomes the root */
    Node *r2 = NULL;
    r2 = bst_insert(r2, 5);
    CHECK(r2 != NULL);
    CHECK_EQ_INT(r2->key, 5);
    CHECK_EQ_INT(height(r2), 0);

    /* one element, then a duplicate of it */
    r2 = bst_insert(r2, 5);
    CHECK_EQ_INT(count_nodes(r2), 1);

    /* two elements */
    r2 = bst_insert(r2, 3);
    CHECK_EQ_INT(count_nodes(r2), 2);
    CHECK(contains(r2, 3));

    /* negative values */
    Node *r3 = NULL;
    int negs[] = {0, -5, 10, -10, 5};
    for (int i = 0; i < 5; i++) r3 = bst_insert(r3, negs[i]);
    CHECK(contains(r3, -10));
    CHECK(contains(r3, -5));
    CHECK(!contains(r3, 999));
    CHECK_EQ_INT(count_nodes(r3), 5);

    /* sorted (ascending) insert order -> degenerate right chain, height = n-1 */
    Node *r4 = NULL;
    for (int i = 1; i <= 6; i++) r4 = bst_insert(r4, i);
    CHECK_EQ_INT(height(r4), 5);
    CHECK_EQ_INT(r4->key, 1);
    CHECK(r4->left == NULL);
    CHECK(r4->right != NULL);

    /* reverse-sorted insert order -> degenerate left chain */
    Node *r5 = NULL;
    for (int i = 6; i >= 1; i--) r5 = bst_insert(r5, i);
    CHECK_EQ_INT(height(r5), 5);
    CHECK(r5->right == NULL);

    /* extreme values: INT_MAX, INT_MIN */
    Node *r6 = NULL;
    r6 = bst_insert(r6, 2147483647);
    r6 = bst_insert(r6, -2147483648);
    r6 = bst_insert(r6, 0);
    CHECK(contains(r6, 2147483647));
    CHECK(contains(r6, -2147483648));
    CHECK_EQ_INT(count_nodes(r6), 3);

    free_tree(root); free_tree(r2); free_tree(r3); free_tree(r4); free_tree(r5); free_tree(r6);
    TEST_SUMMARY();
}
