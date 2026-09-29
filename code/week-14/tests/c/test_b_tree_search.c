#define main program_main
#include "../../c/b_tree_search.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    Node *root = new_node(true);
    int keys[] = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
    for (int i = 0; i < 12; i++)
        root = tree_insert(root, 4, keys[i]);

    int idx, reads;
    Node *found_node;

    /* found at the root */
    idx = -1; reads = 0; found_node = NULL;
    CHECK(b_tree_search(root, 17, &idx, &found_node, &reads) == true);
    CHECK_EQ_INT(reads, 1);
    CHECK(found_node == root);
    CHECK_EQ_INT(found_node->keys[idx], 17);

    /* found deeper (a leaf) */
    idx = -1; reads = 0; found_node = NULL;
    CHECK(b_tree_search(root, 3, &idx, &found_node, &reads) == true);
    CHECK(reads >= 2);
    CHECK_EQ_INT(found_node->keys[idx], 3);

    /* not found: value absent, still terminates at a leaf */
    idx = -1; reads = 0; found_node = NULL;
    CHECK(b_tree_search(root, 999, &idx, &found_node, &reads) == false);
    CHECK(found_node == NULL);
    CHECK(reads >= 1);

    /* not found: value smaller than every key */
    idx = -1; reads = 0; found_node = NULL;
    CHECK(b_tree_search(root, -5, &idx, &found_node, &reads) == false);

    /* every inserted key is actually findable */
    for (int i = 0; i < 12; i++) {
        idx = -1; reads = 0; found_node = NULL;
        CHECK(b_tree_search(root, keys[i], &idx, &found_node, &reads) == true);
    }
    free_tree(root);

    /* single-node tree (large order, never splits): every search costs exactly 1 read */
    Node *single = new_node(true);
    int small_keys[] = {23, 5, 41, 12, 38};
    for (int i = 0; i < 5; i++)
        single = tree_insert(single, 12, small_keys[i]);
    idx = -1; reads = 0; found_node = NULL;
    CHECK(b_tree_search(single, 41, &idx, &found_node, &reads) == true);
    CHECK_EQ_INT(reads, 1);
    idx = -1; reads = 0; found_node = NULL;
    CHECK(b_tree_search(single, 100, &idx, &found_node, &reads) == false);
    CHECK_EQ_INT(reads, 1);
    free_tree(single);

    /* empty subtree (NULL) is handled without crashing */
    idx = -1; reads = 0; found_node = NULL;
    CHECK(b_tree_search(NULL, 5, &idx, &found_node, &reads) == false);
    CHECK_EQ_INT(reads, 0);

    TEST_SUMMARY();
}
