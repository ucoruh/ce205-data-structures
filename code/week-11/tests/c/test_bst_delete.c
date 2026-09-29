/* Unit tests for code/week-11/c/bst_delete.c: bst_delete(). */
#define main program_main
#include "../../c/bst_delete.c"
#undef main
#include "../../../test_check.h"

static int contains(Node *n, int key) {
    if (!n) return 0;
    if (n->key == key) return 1;
    return key < n->key ? contains(n->left, key) : contains(n->right, key);
}
static int count_nodes(Node *n) { return n ? 1 + count_nodes(n->left) + count_nodes(n->right) : 0; }
static int is_bst(Node *n, int lo, int hi) {
    if (!n) return 1;
    if (n->key <= lo || n->key >= hi) return 0;
    return is_bst(n->left, lo, n->key) && is_bst(n->right, n->key, hi);
}

int main(void) {
    Node *root = NULL;
    int keys[] = {50, 30, 70, 20, 40, 60, 80, 35, 65, 90};
    for (int i = 0; i < 10; i++) root = bst_build_insert(root, keys[i]);

    /* leaf delete */
    root = bst_delete(root, 35);
    CHECK(!contains(root, 35));
    CHECK_EQ_INT(count_nodes(root), 9);
    CHECK(is_bst(root, -2000000000, 2000000000));

    /* two-children delete (successor used) */
    root = bst_delete(root, 70);
    CHECK(!contains(root, 70));
    CHECK(contains(root, 80));
    CHECK(contains(root, 60));
    CHECK_EQ_INT(count_nodes(root), 8);
    CHECK(is_bst(root, -2000000000, 2000000000));

    /* another leaf delete (20 became a leaf once 40 lost its only child above) */
    root = bst_delete(root, 20);
    CHECK(!contains(root, 20));
    CHECK_EQ_INT(count_nodes(root), 7);
    CHECK(is_bst(root, -2000000000, 2000000000));

    /* one-child delete, on a small tree built just for this: 5 has exactly one child, 3 */
    Node *oc = NULL;
    int ock[] = {10, 5, 15, 3};
    for (int i = 0; i < 4; i++) oc = bst_build_insert(oc, ock[i]);
    oc = bst_delete(oc, 5);
    CHECK(!contains(oc, 5));
    CHECK(contains(oc, 3));
    CHECK_EQ_INT(count_nodes(oc), 3);
    CHECK(is_bst(oc, -2000000000, 2000000000));
    free_tree(oc);

    /* not found: no-op */
    int before = count_nodes(root);
    root = bst_delete(root, 999);
    CHECK_EQ_INT(count_nodes(root), before);

    /* empty tree: no-op, does not crash */
    Node *empty = NULL;
    empty = bst_delete(empty, 5);
    CHECK(empty == NULL);

    /* single node: delete the only node -> empty tree */
    Node *single = NULL;
    single = bst_build_insert(single, 7);
    single = bst_delete(single, 7);
    CHECK(single == NULL);

    /* two elements: delete each in turn */
    Node *two = NULL;
    two = bst_build_insert(two, 10);
    two = bst_build_insert(two, 5);
    two = bst_delete(two, 5);
    CHECK(two != NULL);
    CHECK_EQ_INT(two->key, 10);
    two = bst_delete(two, 10);
    CHECK(two == NULL);

    /* delete every key of a 10-node tree, down to empty */
    Node *all = NULL;
    int akeys[] = {5, 3, 8, 1, 4, 7, 9, 2, 6, 10};
    for (int i = 0; i < 10; i++) all = bst_build_insert(all, akeys[i]);
    for (int i = 0; i < 10; i++) {
        all = bst_delete(all, akeys[i]);
        CHECK(is_bst(all, -2000000000, 2000000000));
    }
    CHECK(all == NULL);

    /* negative values and duplicates ignored during build */
    Node *neg = NULL;
    int nk[] = {0, -5, 10, -10, 5, -5};
    for (int i = 0; i < 6; i++) neg = bst_build_insert(neg, nk[i]);
    neg = bst_delete(neg, -10);
    CHECK(!contains(neg, -10));
    CHECK_EQ_INT(count_nodes(neg), 4);
    free_tree(neg);

    free_tree(root);
    TEST_SUMMARY();
}
