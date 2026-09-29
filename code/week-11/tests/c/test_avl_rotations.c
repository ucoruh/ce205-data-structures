/* Unit tests for code/week-11/c/avl_rotations.c: avl_insert(), rebalance(), last_case. */
#include <string.h>
#define main program_main
#include "../../c/avl_rotations.c"
#undef main
#include "../../../test_check.h"

static int check_avl(Node *n) {
    if (!n) return 1;
    int bf = height(n->left) - height(n->right);
    if (bf < -1 || bf > 1) return 0;
    return check_avl(n->left) && check_avl(n->right);
}
static int count_nodes(Node *n) { return n ? 1 + count_nodes(n->left) + count_nodes(n->right) : 0; }

int main(void) {
    Node *ll = NULL;
    int llk[] = {50, 30, 70, 20, 40, 60, 80, 10, 45, 5};
    for (int i = 0; i < 10; i++) { last_case = "none"; ll = avl_insert(ll, llk[i]); }
    CHECK_EQ_INT(strcmp(last_case, "LL"), 0);
    CHECK(check_avl(ll));

    Node *rr = NULL;
    int rrk[] = {50, 30, 70, 20, 40, 60, 80, 55, 90, 95};
    for (int i = 0; i < 10; i++) { last_case = "none"; rr = avl_insert(rr, rrk[i]); }
    CHECK_EQ_INT(strcmp(last_case, "RR"), 0);
    CHECK(check_avl(rr));

    Node *lr = NULL;
    int lrk[] = {50, 70, 30, 80, 60, 40, 20, 55, 35, 36};
    for (int i = 0; i < 10; i++) { last_case = "none"; lr = avl_insert(lr, lrk[i]); }
    CHECK_EQ_INT(strcmp(last_case, "LR"), 0);
    CHECK(check_avl(lr));

    Node *rl = NULL;
    int rlk[] = {50, 30, 70, 20, 40, 60, 80, 45, 65, 41};
    for (int i = 0; i < 10; i++) { last_case = "none"; rl = avl_insert(rl, rlk[i]); }
    CHECK_EQ_INT(strcmp(last_case, "RL"), 0);
    CHECK(check_avl(rl));

    /* AVL stays balanced even for a sorted (worst-case-for-plain-BST) sequence */
    Node *asc = NULL;
    for (int i = 1; i <= 100; i++) asc = avl_insert(asc, i);
    CHECK(check_avl(asc));
    CHECK(height(asc) <= 10);           /* ceil(1.44 log2(102)) ~= 10 for AVL */
    CHECK_EQ_INT(count_nodes(asc), 100);

    /* duplicates ignored */
    Node *dup = NULL;
    dup = avl_insert(dup, 5);
    dup = avl_insert(dup, 5);
    dup = avl_insert(dup, 5);
    CHECK_EQ_INT(count_nodes(dup), 1);

    /* empty -> single insert */
    Node *single = NULL;
    single = avl_insert(single, 7);
    CHECK(single != NULL);
    CHECK_EQ_INT(single->key, 7);
    CHECK_EQ_INT(height(single), 0);

    /* two elements: no rotation needed */
    Node *two = NULL;
    two = avl_insert(two, 1);
    two = avl_insert(two, 2);
    CHECK(check_avl(two));
    CHECK_EQ_INT(height(two), 1);

    /* negative values */
    Node *neg = NULL;
    int nk[] = {0, -10, 10, -20, -5, 5, 20};
    for (int i = 0; i < 7; i++) neg = avl_insert(neg, nk[i]);
    CHECK(check_avl(neg));
    CHECK_EQ_INT(count_nodes(neg), 7);

    free_tree(ll); free_tree(rr); free_tree(lr); free_tree(rl); free_tree(asc);
    free_tree(dup); free_tree(single); free_tree(two); free_tree(neg);
    TEST_SUMMARY();
}
