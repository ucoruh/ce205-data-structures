/* Unit tests for week-04 c/leftist_heap_merge.c
 * Independent oracle: expected element counts and best values come straight from the input arrays
 * (never count_and_best()); the heap-order and leftist properties are re-checked by a from-scratch
 * recursive walker written here (never calling the program's own is_leftist()); the key multiset is
 * collected by a from-scratch walker too. */
#define main program_main
#include "../../c/leftist_heap_merge.c"
#undef main
#include "../../../test_check.h"

#define MAXK 40
static int collected[MAXK], collected_n;
static void collect_keys(Node *node) {
    if (!node) return;
    collected[collected_n++] = node->key;
    collect_keys(node->left);
    collect_keys(node->right);
}
static int my_is_valid_leftist(Node *node) {
    if (!node) return 1;
    if (node->left && better(node->left->key, node->key)) return 0;
    if (node->right && better(node->right->key, node->key)) return 0;
    if (npl(node->left) < npl(node->right)) return 0;
    return my_is_valid_leftist(node->left) && my_is_valid_leftist(node->right);
}
static int extreme_of(const int *values, int n, bool want_max) {
    int best = values[0];
    for (int i = 1; i < n; i++) if (want_max ? values[i] > best : values[i] < best) best = values[i];
    return best;
}
static int multiset_matches(int *a, int na, const int *b, int nb) {
    if (na != nb) return 0;
    int sa[MAXK], sb[MAXK];
    for (int i = 0; i < na; i++) { sa[i] = a[i]; sb[i] = b[i]; }
    for (int i = 0; i < na; i++)
        for (int j = i + 1; j < na; j++) {
            if (sa[j] < sa[i]) { int t = sa[i]; sa[i] = sa[j]; sa[j] = t; }
            if (sb[j] < sb[i]) { int t = sb[i]; sb[i] = sb[j]; sb[j] = t; }
        }
    for (int i = 0; i < na; i++) if (sa[i] != sb[i]) return 0;
    return 1;
}

int main(void) {
    /* -- merge with NULL on either side is the identity -- */
    kind_is_max = false;
    Node *lone = new_leaf(5);
    CHECK(merge(NULL, NULL) == NULL);
    CHECK(merge(NULL, lone) == lone);
    Node *lone2 = new_leaf(6);
    CHECK(merge(lone2, NULL) == lone2);
    free_tree(lone); free_tree(lone2);

    /* -- merge of two single-node heaps: the better root wins, the other becomes its child -- */
    kind_is_max = false;
    Node *m = merge(new_leaf(9), new_leaf(3));
    CHECK_EQ_INT(m->key, 3);
    CHECK(my_is_valid_leftist(m));
    collected_n = 0; collect_keys(m);
    { int exp[] = {9, 3}; CHECK(multiset_matches(collected, collected_n, exp, 2)); }
    free_tree(m);

    /* -- normal: min-heap, A (5 elements) merges with B (6 elements) -- */
    int a_normal[] = {9, 5, 12, 3, 15};
    int b_normal[] = {7, 20, 2, 11, 18, 6};
    kind_is_max = false;
    Node *a = build_from_values(a_normal, 5);
    Node *b = build_from_values(b_normal, 6);
    CHECK(my_is_valid_leftist(a));
    CHECK(my_is_valid_leftist(b));
    Node *result = merge(a, b);
    collected_n = 0; collect_keys(result);
    CHECK_EQ_INT(collected_n, 11);
    int all_normal[] = {9, 5, 12, 3, 15, 7, 20, 2, 11, 18, 6};
    CHECK(multiset_matches(collected, collected_n, all_normal, 11));
    CHECK_EQ_INT(result->key, extreme_of(all_normal, 11, false));
    CHECK(my_is_valid_leftist(result));
    free_tree(result);

    /* -- hard: max, A ascending 8, B descending 7 -- a long right spine -- */
    int a_hard[] = {1, 2, 3, 4, 5, 6, 7, 8};
    int b_hard[] = {30, 25, 20, 15, 10, 5, 1};
    kind_is_max = true;
    Node *ah = build_from_values(a_hard, 8);
    Node *bh = build_from_values(b_hard, 7);
    Node *resh = merge(ah, bh);
    collected_n = 0; collect_keys(resh);
    CHECK_EQ_INT(collected_n, 15);
    int all_hard[] = {1, 2, 3, 4, 5, 6, 7, 8, 30, 25, 20, 15, 10, 5, 1};
    CHECK(multiset_matches(collected, collected_n, all_hard, 15));
    CHECK_EQ_INT(resh->key, 30);
    CHECK(my_is_valid_leftist(resh));
    free_tree(resh);

    /* -- edge: A is empty, merge with B (11 elements) -- result must just be B, structurally valid -- */
    int b_edge[] = {6, 19, 3, 27, 11, 8, 35, 14, 22, 9, 41};
    kind_is_max = false;
    Node *ae = build_from_values(NULL, 0);
    Node *be = build_from_values(b_edge, 11);
    CHECK(ae == NULL);
    Node *rese = merge(ae, be);
    CHECK(rese == be);
    collected_n = 0; collect_keys(rese);
    CHECK(multiset_matches(collected, collected_n, b_edge, 11));
    CHECK_EQ_INT(rese->key, extreme_of(b_edge, 11, false));
    CHECK(my_is_valid_leftist(rese));
    free_tree(rese);

    /* -- edge: duplicates -- several equal keys must not break the leftist/heap-order properties -- */
    int dup[] = {4, 4, 4, 4, 4, 4};
    kind_is_max = true;
    Node *d = build_from_values(dup, 6);
    CHECK(my_is_valid_leftist(d));
    collected_n = 0; collect_keys(d);
    CHECK_EQ_INT(collected_n, 6);
    for (int i = 0; i < 6; i++) CHECK_EQ_INT(collected[i], 4);
    free_tree(d);

    TEST_SUMMARY();
}
