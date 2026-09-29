/* Unit tests for week-04 c/binomial_heap_union.c
 * Independent oracle: expected element counts and best values come straight from the flat input arrays
 * (never from walk_count_best()/summarize()); orders-present come from the binary bit pattern of the
 * count (a binomial heap of n elements always decomposes into the set bits of n); node counts per order
 * and the heap-order property are re-checked by a separate recursive walker written here, never calling
 * link()/union_heaps() to derive its own answer. */
#define main program_main
#include "../../c/binomial_heap_union.c"
#undef main
#include "../../../test_check.h"

#define MAXK 80
static int collected[MAXK], collected_n;
static void collect_keys(Node *node) {
    if (!node) return;
    collected[collected_n++] = node->key;
    collect_keys(node->child);
    collect_keys(node->sibling);
}
/* Counts only `node`'s OWN subtree (itself plus every descendant reachable through ->child chains) --
 * deliberately does NOT walk node->sibling, because when this is called on a child partway through
 * is_valid_binomial_tree's loop, that child's sibling is a DIFFERENT child of the same parent, not part
 * of this node's own subtree. */
static int count_nodes(Node *node) {
    if (!node) return 0;
    int total = 1;
    for (Node *c = node->child; c != NULL; c = c->sibling) total += count_nodes(c);
    return total;
}
/* A binomial tree of order k must have exactly 2^k nodes and satisfy the heap-order property (every
 * child at least as bad as its parent) at every node. */
static int is_valid_binomial_tree(Node *node, int expected_order) {
    if (count_nodes(node) != (1 << expected_order)) return 0;
    int child_order = expected_order - 1;
    for (Node *c = node->child; c != NULL; c = c->sibling) {
        if (better(c->key, node->key)) return 0;         /* child must not be better than its parent */
        if (!is_valid_binomial_tree(c, child_order)) return 0;
        child_order--;
    }
    return child_order == -1;   /* exactly `expected_order` children, orders order-1 .. 0 */
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
/* Every present order in `trees` must be a valid binomial tree of that order, and the set of present
 * orders must equal the set bits of n (a binomial heap's defining structural invariant). */
static void check_forest(Node *trees[], int n) {
    for (int k = 0; k < MAX_ORDER; k++) {
        int bit_set = (n >> k) & 1;
        CHECK((trees[k] != NULL) == bit_set);
        if (trees[k]) CHECK(is_valid_binomial_tree(trees[k], k));
    }
}

int main(void) {
    /* -- link(): the better root wins and the worse root becomes its new leftmost child -- */
    kind_is_max = false;
    Node *t1 = new_leaf(9), *t2 = new_leaf(4);
    Node *linked = link(t1, t2);
    CHECK_EQ_INT(linked->key, 4);          /* min-heap: 4 is better than 9 */
    CHECK_EQ_INT(linked->order, 1);
    CHECK(linked->child == t1);
    CHECK_EQ_INT(count_nodes(linked), 2);
    free_forest(linked);

    /* -- A: 7 elements, min-heap -- orders present must be the set bits of 7 (0,1,2) -- */
    int a_normal[] = {5, 3, 8, 1, 9, 2, 4};
    Node *A[MAX_ORDER];
    kind_is_max = false;
    build_from_values(A, a_normal, 7);
    check_forest(A, 7);
    collected_n = 0;
    for (int k = 0; k < MAX_ORDER; k++) collect_keys(A[k]);
    CHECK(multiset_matches(collected, collected_n, a_normal, 7));

    /* -- B: 5 elements -- orders present must be the set bits of 5 (0,2) -- */
    int b_normal[] = {12, 15, 11, 20, 7};
    Node *B[MAX_ORDER];
    build_from_values(B, b_normal, 5);
    check_forest(B, 5);

    /* -- union(A, B): 12 elements total, orders = set bits of 12 (2,3); best = min of all 12 -- */
    Node *result[MAX_ORDER];
    union_heaps(A, B, result);
    check_forest(result, 12);
    collected_n = 0;
    for (int k = 0; k < MAX_ORDER; k++) collect_keys(result[k]);
    CHECK_EQ_INT(collected_n, 12);
    int all_normal[] = {5, 3, 8, 1, 9, 2, 4, 12, 15, 11, 20, 7};
    CHECK(multiset_matches(collected, collected_n, all_normal, 12));
    int min_best = extreme_of(all_normal, 12, false);
    /* the true minimum must sit at SOME root (every binomial tree's root is its own subtree's best) */
    int found_min = 0;
    for (int k = 0; k < MAX_ORDER; k++) if (result[k] && result[k]->key == min_best) found_min = 1;
    CHECK(found_min);
    for (int k = 0; k < MAX_ORDER; k++) free_forest(result[k]);

    /* -- hard: max-heap, A and B share orders 0/1/2 -- a carry forms at every order -- */
    int a_hard[] = {10, 40, 25, 60, 15, 55, 30};
    int b_hard[] = {70, 20, 90, 35, 80, 45, 65};
    Node *Ah[MAX_ORDER], *Bh[MAX_ORDER], *resh[MAX_ORDER];
    kind_is_max = true;
    build_from_values(Ah, a_hard, 7);
    build_from_values(Bh, b_hard, 7);
    union_heaps(Ah, Bh, resh);
    check_forest(resh, 14);
    int all_hard[] = {10, 40, 25, 60, 15, 55, 30, 70, 20, 90, 35, 80, 45, 65};
    int max_best = extreme_of(all_hard, 14, true);
    int found_max = 0;
    for (int k = 0; k < MAX_ORDER; k++) if (resh[k] && resh[k]->key == max_best) found_max = 1;
    CHECK(found_max);
    CHECK_EQ_INT(max_best, 90);
    for (int k = 0; k < MAX_ORDER; k++) free_forest(resh[k]);

    /* -- edge: A is empty, union with B (11 elements) -- result must equal B's own decomposition -- */
    int b_edge[] = {6, 19, 3, 27, 11, 8, 35, 14, 22, 9, 41};
    Node *Ae[MAX_ORDER], *Be[MAX_ORDER], *rese[MAX_ORDER];
    kind_is_max = false;
    build_from_values(Ae, NULL, 0);
    build_from_values(Be, b_edge, 11);
    union_heaps(Ae, Be, rese);
    check_forest(rese, 11);
    collected_n = 0;
    for (int k = 0; k < MAX_ORDER; k++) collect_keys(rese[k]);
    CHECK(multiset_matches(collected, collected_n, b_edge, 11));
    CHECK_EQ_INT(extreme_of(b_edge, 11, false), 3);
    for (int k = 0; k < MAX_ORDER; k++) free_forest(rese[k]);

    /* -- edge: single element -- a binomial heap of 1 has exactly order 0 present -- */
    Node *single[MAX_ORDER];
    build_from_values(single, (int[]){77}, 1);
    check_forest(single, 1);
    CHECK_EQ_INT(single[0]->key, 77);
    free_forest(single[0]);

    TEST_SUMMARY();
}
