#define main program_main
#include "../../c/b_plus_tree.c"
#undef main
#include "../../../test_check.h"

static Node *build(int order, const int keys[], int n) {
    Node *root = new_node(true);
    for (int i = 0; i < n; i++)
        root = b_plus_insert(root, order, keys[i]);
    return root;
}

int main(void) {
    int keys[] = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
    Node *root = build(4, keys, 12);

    /* the leaf chain visits every key exactly once, in ascending order */
    int seen[32], sn = 0;
    for (Node *leaf = first_leaf(root); leaf != NULL; leaf = leaf->next)
        for (int i = 0; i < leaf->n; i++)
            seen[sn++] = leaf->keys[i];
    CHECK_EQ_INT(sn, 12);
    for (int i = 1; i < sn; i++)
        CHECK(seen[i - 1] < seen[i]);

    /* leaf-chain keys are exactly the input keys (same multiset) */
    int found_all = 1;
    for (int i = 0; i < 12; i++) {
        int f = 0;
        for (int j = 0; j < sn; j++)
            if (seen[j] == keys[i])
                f = 1;
        if (!f)
            found_all = 0;
    }
    CHECK(found_all == 1);

    /* range_query: a normal band */
    int out[32];
    int count = range_query(root, 6, 18, out, 32);
    CHECK_EQ_INT(count, 7); /* 6,7,10,12,15,17,18 */
    for (int i = 0; i < count; i++) {
        CHECK(out[i] >= 6);
        CHECK(out[i] <= 18);
    }

    /* range_query: single-key range on an existing key */
    CHECK_EQ_INT(range_query(root, 15, 15, out, 32), 1);
    CHECK_EQ_INT(out[0], 15);

    /* range_query: single-key range on a missing key */
    CHECK_EQ_INT(range_query(root, 14, 14, out, 32), 0);

    /* range_query: whole range covers every key */
    CHECK_EQ_INT(range_query(root, -1000, 1000, out, 32), 12);

    /* range_query: empty ranges on both sides */
    CHECK_EQ_INT(range_query(root, 1000, 2000, out, 32), 0);
    CHECK_EQ_INT(range_query(root, -50, -1, out, 32), 0);

    /* range_query: every key, queried as its own 1-key range, is found exactly once */
    for (int i = 0; i < 12; i++)
        CHECK_EQ_INT(range_query(root, keys[i], keys[i], out, 32), 1);

    Node *freed[64];
    int nf = 0;
    free_tree(root, freed, &nf);
    for (int i = 0; i < nf; i++)
        free(freed[i]);

    /* a leaf that never splits (order large relative to n) chains to nothing */
    Node *single = new_node(true);
    single = b_plus_insert(single, 15, 1);
    single = b_plus_insert(single, 15, 2);
    CHECK(single->leaf == true);
    CHECK(single->next == NULL);
    CHECK_EQ_INT(range_query(single, 1, 2, out, 32), 2);
    free(single);

    TEST_SUMMARY();
}
