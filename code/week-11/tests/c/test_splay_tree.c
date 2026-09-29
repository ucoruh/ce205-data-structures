/* Unit tests for code/week-11/c/splay_tree.c: access_key(), splay(). */
#define main program_main
#include "../../c/splay_tree.c"
#undef main
#include "../../../test_check.h"

static int count_nodes(Node *n) { return n ? 1 + count_nodes(n->left) + count_nodes(n->right) : 0; }
static int contains(Node *n, int key) {
    if (!n) return 0;
    if (n->key == key) return 1;
    return key < n->key ? contains(n->left, key) : contains(n->right, key);
}
static int is_bst(Node *n, long lo, long hi) {
    if (!n) return 1;
    if (n->key <= lo || n->key >= hi) return 0;
    return is_bst(n->left, lo, n->key) && is_bst(n->right, n->key, hi);
}

int main(void) {
    root = NULL;
    int keys[] = {50, 30, 70, 20, 40, 60, 80, 10, 45, 20, 80, 10};
    Node *last = NULL;
    for (int i = 0; i < 12; i++) {
        last = access_key(keys[i]);
        CHECK(root == last);                        /* every access ends with the key at the root */
        CHECK_EQ_INT(root->key, keys[i]);
        CHECK(is_bst(root, -2000000000L, 2000000000L));
    }
    CHECK_EQ_INT(count_nodes(root), 9);              /* 9 distinct keys among the 12 accesses */

    /* zig-zig, exact shape: access(50), access(30) [zig], access(70) [zig-zig, right-right chain].
       Hand-worked: 30-50-70 is a straight right-right chain before the third access, so the zig-zig
       rotation must lift 70 to the root with 50 as its left child and 30 as 50's left child. */
    free_tree(root); root = NULL;
    access_key(50); access_key(30); access_key(70);
    CHECK_EQ_INT(root->key, 70);
    CHECK(root->left != NULL && root->left->key == 50);
    CHECK(root->left->left != NULL && root->left->left->key == 30);
    CHECK(root->right == NULL);
    CHECK(root->left->right == NULL);
    CHECK(root->left->left->left == NULL && root->left->left->right == NULL);

    /* zig-zag, exact shape: access(50), access(70) [zig], access(60) [zig-zag: 60 is between 50 and 70].
       Hand-worked: the zig-zag rotation must lift 60 to the root with 50 and 70 as its two leaf children
       (BST order: 50 < 60 < 70, so 50 goes left and 70 goes right). */
    free_tree(root); root = NULL;
    access_key(50); access_key(70); access_key(60);
    CHECK_EQ_INT(root->key, 60);
    CHECK(root->left != NULL && root->left->key == 50);
    CHECK(root->right != NULL && root->right->key == 70);
    CHECK(root->left->left == NULL && root->left->right == NULL);
    CHECK(root->right->left == NULL && root->right->right == NULL);

    /* accessing the current root again: still the root, no growth */
    free_tree(root); root = NULL;
    access_key(5);
    access_key(5);
    CHECK_EQ_INT(root->key, 5);
    CHECK_EQ_INT(count_nodes(root), 1);

    /* accessing a missing key inserts it and splays it to the root */
    free_tree(root); root = NULL;
    access_key(50); access_key(30); access_key(70);
    access_key(999);
    CHECK_EQ_INT(root->key, 999);
    CHECK(contains(root, 50)); CHECK(contains(root, 30)); CHECK(contains(root, 70));
    CHECK_EQ_INT(count_nodes(root), 4);

    /* empty tree: a single access creates the root */
    free_tree(root); root = NULL;
    access_key(7);
    CHECK(root != NULL);
    CHECK_EQ_INT(root->key, 7);
    CHECK_EQ_INT(count_nodes(root), 1);

    /* two elements */
    free_tree(root); root = NULL;
    access_key(10); access_key(5);
    CHECK_EQ_INT(root->key, 5);
    access_key(10);
    CHECK_EQ_INT(root->key, 10);
    CHECK_EQ_INT(count_nodes(root), 2);

    /* negative values and duplicated accesses (locality) */
    free_tree(root); root = NULL;
    int neg[] = {0, -10, 10, -20, -5, 5, 20, -20, -20};
    for (int i = 0; i < 9; i++) access_key(neg[i]);
    CHECK_EQ_INT(root->key, -20);
    CHECK(is_bst(root, -2000000000L, 2000000000L));
    CHECK_EQ_INT(count_nodes(root), 7);

    free_tree(root);
    TEST_SUMMARY();
}
