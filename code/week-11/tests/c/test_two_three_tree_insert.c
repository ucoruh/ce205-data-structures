/* Unit tests for code/week-11/c/two_three_tree_insert.c: insert(). */
#define main program_main
#include "../../c/two_three_tree_insert.c"
#undef main
#include "../../../test_check.h"

static int count_keys(Node *n) {
    if (n == NULL) return 0;
    int total = n->nkeys;
    if (!is_leaf(n)) for (int i = 0; i <= n->nkeys; i++) total += count_keys(n->child[i]);
    return total;
}
static int contains(Node *n, int key) {
    if (n == NULL) return 0;
    for (int i = 0; i < n->nkeys; i++) if (n->key[i] == key) return 1;
    if (is_leaf(n)) return 0;
    return contains(n->child[child_index(n, key)], key);
}
/* every leaf sits at the same depth, and every node has 1 or 2 keys */
static int check_shape(Node *n, int depth, int *leaf_depth) {
    if (n == NULL) return 1;
    if (n->nkeys < 1 || n->nkeys > 2) return 0;
    if (is_leaf(n)) {
        if (*leaf_depth == -1) { *leaf_depth = depth; return 1; }
        return *leaf_depth == depth;
    }
    for (int i = 0; i <= n->nkeys; i++) if (!check_shape(n->child[i], depth + 1, leaf_depth)) return 0;
    return 1;
}
static int shape_ok(Node *root) { int leaf_depth = -1; return check_shape(root, 0, &leaf_depth); }

int main(void) {
    Node *root = NULL;
    int keys[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    for (int i = 0; i < 10; i++) { root = insert(root, keys[i]); CHECK(shape_ok(root)); }
    CHECK_EQ_INT(count_keys(root), 10);
    CHECK_EQ_INT(tree_height(root), 2);
    for (int i = 0; i < 10; i++) CHECK(contains(root, keys[i]));

    /* enough keys to force at least one root split (height grows past a single level) */
    Node *hard = NULL;
    int hkeys[] = {50, 30, 70, 20, 40, 60, 80, 10, 90, 25, 35, 45, 55, 65};
    for (int i = 0; i < 14; i++) { hard = insert(hard, hkeys[i]); CHECK(shape_ok(hard)); }
    CHECK(tree_height(hard) >= 1);
    CHECK_EQ_INT(count_keys(hard), 14);

    /* duplicates ignored */
    Node *dup = NULL;
    int dk[] = {8, 8, 3, 8, 15, 3, 20, 3, 15, 8};
    for (int i = 0; i < 10; i++) dup = insert(dup, dk[i]);
    CHECK_EQ_INT(count_keys(dup), 4);
    CHECK(contains(dup, 8)); CHECK(contains(dup, 20));

    /* descending order */
    Node *desc = NULL;
    for (int i = 100; i >= 10; i -= 10) { desc = insert(desc, i); CHECK(shape_ok(desc)); }
    CHECK_EQ_INT(count_keys(desc), 10);

    /* empty -> single key */
    Node *single = NULL;
    single = insert(single, 7);
    CHECK_EQ_INT(single->nkeys, 1);
    CHECK_EQ_INT(single->key[0], 7);
    CHECK_EQ_INT(tree_height(single), 0);

    /* two keys: fits in one 3-node, no split */
    Node *two = NULL;
    two = insert(two, 5);
    two = insert(two, 3);
    CHECK_EQ_INT(two->nkeys, 2);
    CHECK_EQ_INT(tree_height(two), 0);

    /* negative values and extremes */
    Node *ext = NULL;
    int ek[] = {0, -2147483647, 2147483647, -1000000, 1000000};
    for (int i = 0; i < 5; i++) { ext = insert(ext, ek[i]); CHECK(shape_ok(ext)); }
    CHECK(contains(ext, -2147483647));
    CHECK(contains(ext, 2147483647));
    CHECK_EQ_INT(count_keys(ext), 5);

    free_tree(root); free_tree(hard); free_tree(dup); free_tree(desc); free_tree(single); free_tree(two); free_tree(ext);
    TEST_SUMMARY();
}
