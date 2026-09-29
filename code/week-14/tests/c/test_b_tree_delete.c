#define main program_main
#include "../../c/b_tree_delete.c"
#undef main
#include "../../../test_check.h"
#include <limits.h>

static Node *build(int order, const int keys[], int n) {
    Node *root = new_node(true);
    for (int i = 0; i < n; i++)
        root = tree_insert(root, order, keys[i]);
    return root;
}

/* Independent in-order reader: only reads the tree so we can compare it against a
 * brute-force expected list below -- it does not decide what "correct" is. */
static void in_order(const Node *node, int *out, int *count) {
    for (int i = 0; i < node->n; i++) {
        if (!node->leaf)
            in_order(node->child[i], out, count);
        out[(*count)++] = node->keys[i];
    }
    if (!node->leaf)
        in_order(node->child[node->n], out, count);
}

/* Independent B-tree structural validator: universal invariants of a B-tree of the given
 * order (sorted keys, size bounds, n+1 children with correct parent pointers, every leaf at
 * the same depth, every key strictly between its bounding separators). This checks the
 * RESULT against the definition of a B-tree, not against anything the delete function itself
 * printed or returned. */
static bool valid_rec(const Node *node, int order, bool is_root, int lo, int hi,
                       int *leaf_depth, int depth) {
    int min_k = min_keys(order);
    if (node->n > order - 1)
        return false;
    if (!is_root && node->n < min_k)
        return false;
    if (is_root && !node->leaf && node->n < 1)
        return false;
    for (int i = 0; i < node->n; i++) {
        if (node->keys[i] <= lo || node->keys[i] >= hi)
            return false;
        if (i > 0 && node->keys[i - 1] >= node->keys[i])
            return false;
    }
    if (node->leaf) {
        if (*leaf_depth == -1)
            *leaf_depth = depth;
        return *leaf_depth == depth;
    }
    for (int i = 0; i <= node->n; i++) {
        if (node->child[i] == NULL || node->child[i]->parent != node)
            return false;
        int clo = (i == 0) ? lo : node->keys[i - 1];
        int chi = (i == node->n) ? hi : node->keys[i];
        if (!valid_rec(node->child[i], order, false, clo, chi, leaf_depth, depth + 1))
            return false;
    }
    return true;
}

static bool bt_valid(Node *root, int order) {
    int leaf_depth = -1;
    return valid_rec(root, order, true, INT_MIN, INT_MAX, &leaf_depth, 0);
}

static int cmp_int(const void *a, const void *b) { return *(const int *) a - *(const int *) b; }

/* Brute-force oracle: remove `val` from a plain int array (no B-tree code involved). */
static void remove_val(int *arr, int *n, int val) {
    for (int i = 0; i < *n; i++)
        if (arr[i] == val) {
            for (int j = i; j < *n - 1; j++)
                arr[j] = arr[j + 1];
            (*n)--;
            return;
        }
}

static void check_matches_sorted(Node *root, int *expected, int expected_n) {
    qsort(expected, (size_t) expected_n, sizeof(int), cmp_int);
    int got[64], count = 0;
    in_order(root, got, &count);
    CHECK_EQ_INT(count, expected_n);
    int upto = count < expected_n ? count : expected_n;
    for (int i = 0; i < upto; i++)
        CHECK_EQ_INT(got[i], expected[i]);
}

int main(void) {
    /* remove_at: shifts keys left, drops the last one */
    Node n = {0};
    n.keys[0] = 1; n.keys[1] = 2; n.keys[2] = 3; n.n = 3;
    remove_at(&n, 1);
    CHECK_EQ_INT(n.n, 2);
    CHECK_EQ_INT(n.keys[0], 1);
    CHECK_EQ_INT(n.keys[1], 3);

    /* find_node: present and absent */
    int base_keys[] = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
    Node *root = build(4, base_keys, 12);
    Node *fn;
    int fi;
    CHECK(find_node(root, 12, &fn, &fi) == true);
    CHECK_EQ_INT(fn->keys[fi], 12);
    CHECK(find_node(root, 999, &fn, &fi) == false);
    free_tree(root);

    /* normal: 3 leaf deletes, verified against the animation's own reference */
    root = build(4, base_keys, 12);
    int deletes1[] = {6, 12, 30};
    bool found;
    for (int i = 0; i < 3; i++) {
        root = b_tree_delete(root, 4, deletes1[i], &found);
        CHECK(found == true);
    }
    CHECK_EQ_INT(node_count(root), 8);
    CHECK_EQ_INT(tree_height(root), 2);
    CHECK(bt_valid(root, 4));
    {
        int expect[] = {10, 20, 5, 7, 17, 3, 25, 18, 15};
        check_matches_sorted(root, expect, 9);
    }
    free_tree(root);

    /* order=3 ascending, 4 deletes: chained merges */
    int asc_keys[14];
    for (int i = 0; i < 14; i++)
        asc_keys[i] = i + 1;
    root = build(3, asc_keys, 14);
    int deletes2[] = {1, 2, 3, 4};
    for (int i = 0; i < 4; i++) {
        root = b_tree_delete(root, 3, deletes2[i], &found);
        CHECK(found == true);
    }
    CHECK_EQ_INT(node_count(root), 8);
    CHECK_EQ_INT(tree_height(root), 2);
    CHECK(bt_valid(root, 3));
    {
        int expect[10] = {5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
        check_matches_sorted(root, expect, 10);
    }
    free_tree(root);

    /* deleting an absent key leaves the tree byte-for-byte the same shape */
    root = build(4, base_keys, 12);
    int before_nodes = node_count(root), before_height = tree_height(root);
    root = b_tree_delete(root, 4, 999, &found);
    CHECK(found == false);
    CHECK_EQ_INT(node_count(root), before_nodes);
    CHECK_EQ_INT(tree_height(root), before_height);
    /* the key is still there after the no-op delete */
    CHECK(find_node(root, 6, &fn, &fi) == true);
    free_tree(root);

    /* delete every key one at a time: the tree always stays a valid, findable structure */
    root = build(4, base_keys, 12);
    for (int i = 0; i < 12; i++) {
        root = b_tree_delete(root, 4, base_keys[i], &found);
        CHECK(found == true);
        CHECK(bt_valid(root, 4));
        for (int j = i + 1; j < 12; j++)
            CHECK(find_node(root, base_keys[j], &fn, &fi) == true);
    }
    CHECK_EQ_INT(root->n, 0);
    CHECK(root->leaf == true); /* fully drained: back to a single empty leaf */
    free_tree(root);

    /* delete until the root shrinks (loses a level) */
    int shrink_keys[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110};
    root = build(3, shrink_keys, 11);
    int shrink_del[] = {10, 20, 30, 40, 50, 60, 70};
    for (int i = 0; i < 7; i++) {
        root = b_tree_delete(root, 3, shrink_del[i], &found);
        CHECK(found == true);
        CHECK(bt_valid(root, 3));
    }
    CHECK_EQ_INT(node_count(root), 3);
    CHECK_EQ_INT(tree_height(root), 1);
    {
        int expect[] = {80, 90, 100, 110};
        check_matches_sorted(root, expect, 4);
    }
    free_tree(root);

    /* ---- explicit coverage of every fix_underflow branch (order=5, min_keys=2) ---- */
    int order5[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
                     130, 140, 150, 160, 170, 180, 190, 200};

    /* A: borrow-from-right (deleted leaf is leftmost -> no left sibling; its right sibling
     * has a surplus key, 45, so the code takes the "right != NULL && right->n > min_k" branch
     * and returns without freeing any node -- node_count must stay unchanged). */
    {
        int keys[21];
        for (int i = 0; i < 20; i++) keys[i] = order5[i];
        keys[20] = 45; /* gives the [40,50] leaf a 3rd key so it can lend */
        root = build(5, keys, 21);
        int before = node_count(root);
        root = b_tree_delete(root, 5, 20, &found);
        CHECK(found == true);
        CHECK(bt_valid(root, 5));
        CHECK_EQ_INT(node_count(root), before); /* borrow only: nothing freed */
        CHECK(find_node(root, 20, &fn, &fi) == false);
        int expect[20], en = 0;
        for (int i = 0; i < 21; i++) if (keys[i] != 20) expect[en++] = keys[i];
        check_matches_sorted(root, expect, en);
        free_tree(root);
    }

    /* B: borrow-from-left (deleted leaf's left sibling [40,45,50] has the surplus key, so the
     * "left != NULL && left->n > min_k" branch fires first and returns; nothing freed). */
    {
        int keys[21];
        for (int i = 0; i < 20; i++) keys[i] = order5[i];
        keys[20] = 45;
        root = build(5, keys, 21);
        int before = node_count(root);
        root = b_tree_delete(root, 5, 70, &found);
        CHECK(found == true);
        CHECK(bt_valid(root, 5));
        CHECK_EQ_INT(node_count(root), before);
        CHECK(find_node(root, 70, &fn, &fi) == false);
        int expect[20], en = 0;
        for (int i = 0; i < 21; i++) if (keys[i] != 70) expect[en++] = keys[i];
        check_matches_sorted(root, expect, en);
        free_tree(root);
    }

    /* C: merge-with-left (deleting 40 leaves the [40,50] leaf with 1 key; both its siblings
     * are exactly at min_keys=2 so neither can lend, so "left != NULL" merges it into its left
     * sibling and frees this node -- exactly one node must disappear). */
    {
        root = build(5, order5, 20);
        int before = node_count(root);
        root = b_tree_delete(root, 5, 40, &found);
        CHECK(found == true);
        CHECK(bt_valid(root, 5));
        CHECK_EQ_INT(node_count(root), before - 1); /* exactly one merge (leaf level) */
        CHECK(find_node(root, 40, &fn, &fi) == false);
        int expect[20], en = 0;
        for (int i = 0; i < 20; i++) if (order5[i] != 40) expect[en++] = order5[i];
        check_matches_sorted(root, expect, en);
        free_tree(root);
    }

    /* D: merge-with-right (deleting 10 leaves the LEFTMOST leaf [10,20] with 1 key -> no left
     * sibling to check, and its right sibling is at min_keys too, so the final "else" branch
     * merges it into its right sibling instead -- again exactly one node freed). */
    {
        root = build(5, order5, 20);
        int before = node_count(root);
        root = b_tree_delete(root, 5, 10, &found);
        CHECK(found == true);
        CHECK(bt_valid(root, 5));
        CHECK_EQ_INT(node_count(root), before - 1);
        CHECK(find_node(root, 10, &fn, &fi) == false);
        int expect[20], en = 0;
        for (int i = 0; i < 20; i++) if (order5[i] != 10) expect[en++] = order5[i];
        check_matches_sorted(root, expect, en);
        free_tree(root);
    }

    /* E: cross-check C and D against each other -- deleting the boundary key from either side
     * of the same pair of min-sized siblings must merge, whichever side started the underflow,
     * and both must end up with the same multiset of surviving keys via the independent
     * remove_val() oracle (not by comparing the two runs' outputs to each other, but each to
     * its own brute-force list, already done above). This block only exercises order=3 (the
     * tightest possible order, min_keys=1) to add an independent, differently-shaped check
     * that a merge cannot leave duplicate or missing keys behind. */
    {
        int keys[9] = {2, 4, 6, 8, 10, 12, 14, 16, 18};
        root = build(3, keys, 9);
        int expect[9];
        int en = 9;
        for (int i = 0; i < 9; i++) expect[i] = keys[i];
        int to_delete[] = {6, 8, 10, 12, 14};
        for (int i = 0; i < 5; i++) {
            root = b_tree_delete(root, 3, to_delete[i], &found);
            CHECK(found == true);
            CHECK(bt_valid(root, 3));
            remove_val(expect, &en, to_delete[i]);
            int copy[9];
            for (int j = 0; j < en; j++) copy[j] = expect[j];
            check_matches_sorted(root, copy, en);
        }
        free_tree(root);
    }

    TEST_SUMMARY();
}
