/* Unit tests for week-04 c/tree_basics.c */
#define main program_main
#include "../../c/tree_basics.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    Node *root, *probe;

    /* -- single node: a trivial tree is its own leaf, height 0, subtree size 1 -- */
    Spec single[] = { {"R", NULL} };
    root = build_tree(single, 1);
    CHECK_EQ_INT(height(root), 0);
    CHECK_EQ_INT(subtree_size(root), 1);
    CHECK_EQ_INT(root->child_count, 0);
    compute_depths(root);
    CHECK_EQ_INT(root->depth, 0);
    CHECK(root->parent == NULL);

    /* -- chain (degenerate): 10 nodes, each with exactly one child -- */
    Spec chain[] = {
        {"R", NULL}, {"C1", "R"}, {"C2", "C1"}, {"C3", "C2"}, {"C4", "C3"},
        {"C5", "C4"}, {"C6", "C5"}, {"C7", "C6"}, {"C8", "C7"}, {"C9", "C8"}
    };
    root = build_tree(chain, 10);
    CHECK_EQ_INT(height(root), 9);            /* 10 nodes in a straight line: height = n-1 */
    CHECK_EQ_INT(subtree_size(root), 10);
    compute_depths(root);
    CHECK_EQ_INT(root->depth, 0);
    probe = find_by_label("C9");
    CHECK(probe != NULL);
    CHECK_EQ_INT(probe->depth, 9);             /* the last link is 9 edges from the root */
    CHECK_EQ_INT(probe->child_count, 0);        /* C9 is a leaf */
    CHECK_EQ_INT(subtree_size(probe), 1);
    CHECK(probe->parent == find_by_label("C8"));
    CHECK(find_by_label("nope") == NULL);       /* label that does not exist */

    /* -- star: the root has 10 children, every child is a leaf -- */
    Spec star[] = {
        {"R", NULL}, {"L1", "R"}, {"L2", "R"}, {"L3", "R"}, {"L4", "R"}, {"L5", "R"},
        {"L6", "R"}, {"L7", "R"}, {"L8", "R"}, {"L9", "R"}, {"L10", "R"}
    };
    root = build_tree(star, 11);
    CHECK_EQ_INT(height(root), 1);
    CHECK_EQ_INT(root->child_count, 10);
    CHECK_EQ_INT(subtree_size(root), 11);
    probe = find_by_label("L5");
    CHECK_EQ_INT(height(probe), 0);
    CHECK_EQ_INT(subtree_size(probe), 1);
    compute_depths(root);
    CHECK_EQ_INT(probe->depth, 1);
    CHECK(probe->parent == root);
    /* siblings: every other L* is a sibling of L5, but not L5 itself */
    int sib_count = 0;
    for (int i = 0; i < root->child_count; i++) if (root->children[i] != probe) sib_count++;
    CHECK_EQ_INT(sib_count, 9);

    /* -- bushy tree: A -> B,C,D ; B -> E,F ; C -> G ; D -> H,I,J ; E -> K
     *    depths: A0 B1 C1 D1 E2 F2 G2 H2 I2 J2 K3 -- hand-computed, independent of height()/
     *    compute_depths() themselves. */
    Spec normal[] = {
        {"A", NULL}, {"B", "A"}, {"C", "A"}, {"D", "A"},
        {"E", "B"}, {"F", "B"}, {"G", "C"}, {"H", "D"},
        {"I", "D"}, {"J", "D"}, {"K", "E"}
    };
    root = build_tree(normal, 11);
    CHECK_EQ_INT(height(root), 3);              /* deepest leaf K is 3 edges from A */
    CHECK_EQ_INT(subtree_size(root), 11);
    probe = find_by_label("D");
    CHECK_EQ_INT(subtree_size(probe), 4);       /* D, H, I, J */
    CHECK_EQ_INT(probe->child_count, 3);
    CHECK_EQ_INT(height(probe), 1);
    probe = find_by_label("E");
    CHECK_EQ_INT(height(probe), 1);             /* E -> K, one level */
    CHECK_EQ_INT(subtree_size(probe), 2);
    compute_depths(root);
    CHECK_EQ_INT(find_by_label("A")->depth, 0);
    CHECK_EQ_INT(find_by_label("B")->depth, 1);
    CHECK_EQ_INT(find_by_label("K")->depth, 3);
    CHECK(find_by_label("K")->parent == find_by_label("E"));
    /* G is an only child of C */
    probe = find_by_label("G");
    CHECK_EQ_INT(probe->parent->child_count, 1);

    TEST_SUMMARY();
}
