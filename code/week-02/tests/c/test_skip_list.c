/* Unit tests for code/week-02/c/skip_list.c: sl_insert() and sl_search().
   Independent oracle: (1) sl_search's found/not-found result is cross-checked against a brute-force linear
   scan of the inserted values (a completely different algorithm from the level-skipping walk);
   (2) the level-0 sorted order is cross-checked against an insertion sort of the inserted values (also a
   different algorithm), never against sl_search's own idea of what is present. */
#define main program_main
#include "../../c/skip_list.c"
#undef main
#include "../../../test_check.h"

static int brute_contains(const int values[], int n, int target) {
    for (int i = 0; i < n; i++) if (values[i] == target) return 1;
    return 0;
}

static void insertion_sort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}

static void assert_sorted_order(const char *label, SkipList *sl, const int inserted[], int n) {
    int expected[64];
    for (int i = 0; i < n; i++) expected[i] = inserted[i];
    insertion_sort(expected, n);
    Node *cur = sl->header->forward[0];
    for (int i = 0; i < n; i++) {
        test_checks++;
        if (cur == NULL) { test_failures++; fprintf(stderr, "%s: level-0 list too short at %d\n", label, i); return; }
        if (cur->value != expected[i]) { test_failures++; fprintf(stderr, "%s: level-0[%d] = %d, expected %d\n", label, i, cur->value, expected[i]); }
        cur = cur->forward[0];
    }
    test_checks++;
    if (cur != NULL) { test_failures++; fprintf(stderr, "%s: level-0 list longer than expected\n", label); }
}

int main(void) {
    Node header;
    SkipList sl;
    int cmp;

    /* normal: 10 keys, alternating express lane, present and absent searches */
    header = (Node){ INT_MIN, { NULL, NULL } }; sl.header = &header;
    int normal_v[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    int normal_l[] = {1, 2, 1, 2, 1, 2, 1, 2, 1, 2};
    for (int i = 0; i < 10; i++) sl_insert(&sl, normal_v[i], normal_l[i], false);
    assert_sorted_order("normal", &sl, normal_v, 10);
    CHECK(sl_search(&sl, 80, &cmp) == brute_contains(normal_v, 10, 80));
    CHECK(sl_search(&sl, 80, &cmp) == 1);
    CHECK(sl_search(&sl, 999, &cmp) == brute_contains(normal_v, 10, 999));
    CHECK(sl_search(&sl, 999, &cmp) == 0);
    CHECK(sl_search(&sl, 10, &cmp) == 1);      /* first key */
    CHECK(sl_search(&sl, 100, &cmp) == 1);     /* last key */
    free_list(&sl);

    /* empty skip list: nothing found, no crash */
    header = (Node){ INT_MIN, { NULL, NULL } }; sl.header = &header;
    CHECK(sl_search(&sl, 5, &cmp) == 0);

    /* single key */
    header = (Node){ INT_MIN, { NULL, NULL } }; sl.header = &header;
    sl_insert(&sl, 42, 1, false);
    CHECK(sl_search(&sl, 42, &cmp) == 1);
    CHECK(sl_search(&sl, 7, &cmp) == 0);
    free_list(&sl);

    /* every node at level 1 only: no express lane at all, still correct */
    header = (Node){ INT_MIN, { NULL, NULL } }; sl.header = &header;
    int flat_v[] = {5, 3, 9, 1, 7};
    int flat_l[] = {1, 1, 1, 1, 1};
    for (int i = 0; i < 5; i++) sl_insert(&sl, flat_v[i], flat_l[i], false);
    assert_sorted_order("no express lane", &sl, flat_v, 5);
    CHECK(sl_search(&sl, 1, &cmp) == 1);
    CHECK(sl_search(&sl, 9, &cmp) == 1);
    CHECK(sl_search(&sl, 4, &cmp) == 0);
    free_list(&sl);

    /* duplicates: inserted twice, present, and the sorted list holds both copies */
    header = (Node){ INT_MIN, { NULL, NULL } }; sl.header = &header;
    int dup_v[] = {10, 20, 10, 30};
    int dup_l[] = {1, 2, 1, 1};
    for (int i = 0; i < 4; i++) sl_insert(&sl, dup_v[i], dup_l[i], false);
    assert_sorted_order("duplicates", &sl, dup_v, 4);
    CHECK(sl_search(&sl, 10, &cmp) == 1);
    free_list(&sl);

    /* negative values and out-of-order insertion */
    header = (Node){ INT_MIN, { NULL, NULL } }; sl.header = &header;
    int neg_v[] = {50, -20, 10, -20, 30};
    int neg_l[] = {1, 2, 1, 1, 2};
    for (int i = 0; i < 5; i++) sl_insert(&sl, neg_v[i], neg_l[i], false);
    assert_sorted_order("negative values, out of order", &sl, neg_v, 5);
    CHECK(sl_search(&sl, -20, &cmp) == 1);
    CHECK(sl_search(&sl, -999, &cmp) == 0);
    free_list(&sl);

    TEST_SUMMARY();
}
