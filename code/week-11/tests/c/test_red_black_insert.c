/* Unit tests for code/week-11/c/red_black_insert.c: insert(), fixup(). */
#define main program_main
#include "../../c/red_black_insert.c"
#undef main
#include "../../../test_check.h"

static int count_nodes(Node *n) { return n ? 1 + count_nodes(n->left) + count_nodes(n->right) : 0; }
static int contains(Node *n, int key) {
    if (!n) return 0;
    if (n->key == key) return 1;
    return key < n->key ? contains(n->left, key) : contains(n->right, key);
}
/* no red node has a red child */
static int no_red_red(Node *n) {
    if (!n) return 1;
    if (n->color == RED) {
        if (n->left && n->left->color == RED) return 0;
        if (n->right && n->right->color == RED) return 0;
    }
    return no_red_red(n->left) && no_red_red(n->right);
}
/* every root-to-NIL path has the same number of black nodes; returns the count, or -1 if inconsistent */
static int black_height_ok(Node *n) {
    if (!n) return 1;
    int l = black_height_ok(n->left), r = black_height_ok(n->right);
    if (l < 0 || r < 0 || l != r) return -1;
    return l + (n->color == BLACK ? 1 : 0);
}
static int is_valid_rb(Node *n) {
    return n == NULL || (n->color == BLACK && no_red_red(n) && black_height_ok(n) >= 0);
}

int main(void) {
    int keys[] = {3, 69, 31, 88, 50, 58, 98, 29, 14, 75};
    root = NULL;
    for (int i = 0; i < 10; i++) { insert(keys[i]); CHECK(is_valid_rb(root)); }
    CHECK_EQ_INT(count_nodes(root), 10);
    CHECK_EQ_INT(root->color, BLACK);

    /* ascending order: every insertion keeps the RB invariants */
    free_tree(root); root = NULL;
    for (int i = 1; i <= 200; i++) { insert(i); CHECK(is_valid_rb(root)); }
    CHECK_EQ_INT(count_nodes(root), 200);

    /* descending order */
    free_tree(root); root = NULL;
    for (int i = 200; i >= 1; i--) { insert(i); CHECK(is_valid_rb(root)); }
    CHECK_EQ_INT(count_nodes(root), 200);

    /* duplicates ignored */
    free_tree(root); root = NULL;
    int dk[] = {8, 8, 3, 8, 15, 3, 20, 3, 15, 8};
    for (int i = 0; i < 10; i++) insert(dk[i]);
    CHECK_EQ_INT(count_nodes(root), 4);
    CHECK(contains(root, 8)); CHECK(contains(root, 20));

    /* empty tree */
    free_tree(root); root = NULL;
    CHECK(root == NULL);

    /* single insert: root becomes black */
    free_tree(root); root = NULL;
    insert(42);
    CHECK_EQ_INT(root->key, 42);
    CHECK_EQ_INT(root->color, BLACK);

    /* two elements */
    free_tree(root); root = NULL;
    insert(5); insert(1);
    CHECK(is_valid_rb(root));
    CHECK_EQ_INT(count_nodes(root), 2);

    /* negative values and extremes */
    free_tree(root); root = NULL;
    insert(0); insert(2147483647); insert(-2147483648); insert(-1000000);
    CHECK(is_valid_rb(root));
    CHECK(contains(root, 2147483647));
    CHECK(contains(root, -2147483648));

    free_tree(root);
    TEST_SUMMARY();
}
