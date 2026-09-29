/* Unit tests for code/week-11/c/avl_insert.c: avl_insert(). */
#define main program_main
#include "../../c/avl_insert.c"
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
    Node *normal = NULL;
    int nk[] = {6, 74, 51, 56, 26, 66, 98, 2, 9, 72};
    for (int i = 0; i < 10; i++) normal = avl_insert(normal, nk[i]);
    CHECK(check_avl(normal));
    CHECK_EQ_INT(count_nodes(normal), 10);

    /* ascending order: AVL stays logarithmic (unlike plain BST) */
    Node *asc = NULL;
    for (int i = 1; i <= 200; i++) asc = avl_insert(asc, i);
    CHECK(check_avl(asc));
    CHECK(height(asc) <= 12);
    CHECK_EQ_INT(count_nodes(asc), 200);

    /* descending order */
    Node *desc = NULL;
    for (int i = 200; i >= 1; i--) desc = avl_insert(desc, i);
    CHECK(check_avl(desc));
    CHECK_EQ_INT(count_nodes(desc), 200);

    /* duplicates are ignored, height/count unaffected */
    Node *dup = NULL;
    int dk[] = {8, 8, 3, 8, 15, 3, 20, 3, 15, 8};
    for (int i = 0; i < 10; i++) dup = avl_insert(dup, dk[i]);
    CHECK_EQ_INT(count_nodes(dup), 4);
    CHECK(contains(dup, 8)); CHECK(contains(dup, 3)); CHECK(contains(dup, 20));

    /* empty tree */
    Node *empty = NULL;
    CHECK_EQ_INT(height(empty), -1);

    /* single element */
    Node *single = NULL;
    single = avl_insert(single, 5);
    CHECK_EQ_INT(height(single), 0);

    /* two elements */
    Node *two = NULL;
    two = avl_insert(two, 5);
    two = avl_insert(two, 1);
    CHECK(check_avl(two));
    CHECK_EQ_INT(height(two), 1);

    /* negative values and extremes */
    Node *ext = NULL;
    ext = avl_insert(ext, 0);
    ext = avl_insert(ext, 2147483647);
    ext = avl_insert(ext, -2147483648);
    ext = avl_insert(ext, -1000000);
    CHECK(check_avl(ext));
    CHECK(contains(ext, 2147483647));
    CHECK(contains(ext, -2147483648));

    free_tree(normal); free_tree(asc); free_tree(desc); free_tree(dup);
    free_tree(single); free_tree(two); free_tree(ext);
    TEST_SUMMARY();
}
