/* Unit tests for code/week-11/c/avl_delete.c: avl_delete(). */
#define main program_main
#include "../../c/avl_delete.c"
#undef main
#include "../../../test_check.h"

static int check_avl(Node *n) {
    if (!n) return 1;
    int bf = height(n->left) - height(n->right);
    if (bf < -1 || bf > 1) return 0;
    return check_avl(n->left) && check_avl(n->right);
}
static int count_nodes(Node *n) { return n ? 1 + count_nodes(n->left) + count_nodes(n->right) : 0; }
static int contains(Node *n, int key) {
    if (!n) return 0;
    if (n->key == key) return 1;
    return key < n->key ? contains(n->left, key) : contains(n->right, key);
}

int main(void) {
    Node *root = NULL;
    int keys[] = {50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 90};
    for (int i = 0; i < 12; i++) root = avl_insert(root, keys[i]);

    root = avl_delete(root, 10);                  /* leaf */
    CHECK(!contains(root, 10));
    CHECK(check_avl(root));
    CHECK_EQ_INT(count_nodes(root), 11);

    root = avl_delete(root, 70);                  /* two children */
    CHECK(!contains(root, 70));
    CHECK(check_avl(root));
    CHECK_EQ_INT(count_nodes(root), 10);

    /* delete every key of a 30-node AVL tree, staying balanced throughout */
    Node *big = NULL;
    for (int i = 1; i <= 30; i++) big = avl_insert(big, i);
    for (int i = 1; i <= 30; i++) {
        big = avl_delete(big, i);
        CHECK(check_avl(big));
    }
    CHECK(big == NULL);

    /* not found: no-op */
    Node *nf = NULL;
    int nfk[] = {5, 3, 8};
    for (int i = 0; i < 3; i++) nf = avl_insert(nf, nfk[i]);
    int before = count_nodes(nf);
    nf = avl_delete(nf, 999);
    CHECK_EQ_INT(count_nodes(nf), before);
    CHECK(check_avl(nf));

    /* empty tree: no-op */
    Node *empty = NULL;
    empty = avl_delete(empty, 5);
    CHECK(empty == NULL);

    /* single node: delete -> empty */
    Node *single = NULL;
    single = avl_insert(single, 7);
    single = avl_delete(single, 7);
    CHECK(single == NULL);

    /* two elements */
    Node *two = NULL;
    two = avl_insert(two, 5);
    two = avl_insert(two, 1);
    two = avl_delete(two, 1);
    CHECK(two != NULL);
    CHECK_EQ_INT(two->key, 5);
    two = avl_delete(two, 5);
    CHECK(two == NULL);

    /* negative values */
    Node *neg = NULL;
    int nk[] = {0, -10, 10, -20, -5, 5, 20};
    for (int i = 0; i < 7; i++) neg = avl_insert(neg, nk[i]);
    neg = avl_delete(neg, -20);
    CHECK(!contains(neg, -20));
    CHECK(check_avl(neg));
    CHECK_EQ_INT(count_nodes(neg), 6);

    free_tree(root); free_tree(nf); free_tree(two); free_tree(neg);
    TEST_SUMMARY();
}
