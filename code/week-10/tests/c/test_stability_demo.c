/* Unit tests for week-10 c/stability_demo.c */
#define main program_main
#include "../../c/stability_demo.c"
#undef main
#include "../../../test_check.h"

static int keys_equal(const Rec a[], const int keys[], int n) {
    for (int i = 0; i < n; i++) if (a[i].key != keys[i]) return 0;
    return 1;
}
static int tags_equal(const Rec a[], const char tags[], int n) {
    for (int i = 0; i < n; i++) if (a[i].tag != tags[i]) return 0;
    return 1;
}

int main(void) {
    /* -- empty array: both sorts must be no-ops -- */
    { Rec a[1] = {{0, 'a'}}; insertion_sort_stable(a, 0); selection_sort_unstable(a, 0);
      CHECK_EQ_INT(a[0].key, 0); }

    /* -- one element: trivially stable -- */
    { Rec a[] = {{5, 'a'}}; insertion_sort_stable(a, 1);
      CHECK_EQ_INT(a[0].key, 5); }

    /* -- two elements, distinct keys, already ordered -- */
    { Rec a[] = {{1, 'a'}, {2, 'a'}}; insertion_sort_stable(a, 2);
      int k[] = {1, 2}; CHECK(keys_equal(a, k, 2)); }

    /* -- two elements, distinct keys, out of order -- */
    { Rec a[] = {{2, 'a'}, {1, 'a'}}; selection_sort_unstable(a, 2);
      int k[] = {1, 2}; CHECK(keys_equal(a, k, 2)); }

    /* -- two elements, EQUAL keys: stable sort must keep original tag order -- */
    { Rec a[] = {{3, 'a'}, {3, 'b'}}; insertion_sort_stable(a, 2);
      char t[] = {'a', 'b'}; CHECK(tags_equal(a, t, 2)); }

    /* -- normal case: stable sort's tag order, independently hand-derived --
     *    input order for key 5 is a,b,c and for key 2 is a,b,c; a stable
     *    sort must reproduce exactly that relative order in the output -- */
    { Rec a[] = {{5,'a'},{2,'a'},{5,'b'},{8,'a'},{2,'b'},{5,'c'},{1,'a'},{8,'b'},{2,'c'},{9,'a'}};
      insertion_sort_stable(a, 10);
      int k[] = {1, 2, 2, 2, 5, 5, 5, 8, 8, 9};
      char t[] = {'a','a','b','c','a','b','c','a','b','a'};
      CHECK(keys_equal(a, k, 10));
      CHECK(tags_equal(a, t, 10)); }

    /* -- all keys equal: the WHOLE array is one tie group; stable sort must
     *    leave the tags in their exact original order -- */
    { Rec a[] = {{6,'a'},{6,'b'},{6,'c'},{6,'d'},{6,'e'}};
      insertion_sort_stable(a, 5);
      char t[] = {'a','b','c','d','e'};
      CHECK(tags_equal(a, t, 5)); }

    /* -- no ties at all: BOTH sorts must give the identical key sequence -- */
    { Rec a1[] = {{9,'a'},{3,'a'},{7,'a'},{1,'a'},{5,'a'},{2,'a'},{8,'a'},{4,'a'},{6,'a'},{0,'a'}};
      Rec a2[10]; for (int i = 0; i < 10; i++) a2[i] = a1[i];
      insertion_sort_stable(a1, 10);
      selection_sort_unstable(a2, 10);
      int want[] = {0,1,2,3,4,5,6,7,8,9};
      CHECK(keys_equal(a1, want, 10));
      CHECK(keys_equal(a2, want, 10)); }

    /* -- unstable sort can reorder ties: with a long-range jump forced by a
     *    deliberately adversarial input, the tag order differs from input --
     *    independent oracle: BOTH sorts must still agree on the KEY sequence -- */
    { Rec a[] = {{4,'a'},{1,'a'},{4,'b'},{2,'a'},{4,'c'}};
      selection_sort_unstable(a, 5);
      int want[] = {1, 2, 4, 4, 4};
      CHECK(keys_equal(a, want, 5)); }

    /* -- reverse-sorted keys, with ties present -- */
    { Rec a[] = {{7,'a'},{6,'a'},{6,'b'},{5,'a'},{4,'a'},{4,'b'},{3,'a'},{2,'a'},{2,'b'},{1,'a'}};
      insertion_sort_stable(a, 10);
      int want[] = {1,2,2,3,4,4,5,6,6,7};
      CHECK(keys_equal(a, want, 10));
      char t[] = {'a','a','b','a','a','b','a','a','b','a'};
      CHECK(tags_equal(a, t, 10)); }

    /* -- negative and extreme keys -- */
    { Rec a[] = {{-5,'a'}, {2147483647,'a'}, {-2147483648,'a'}, {0,'a'}};
      insertion_sort_stable(a, 4);
      int want[] = {-2147483648, -5, 0, 2147483647};
      CHECK(keys_equal(a, want, 4)); }

    /* -- already-sorted keys, with ties present: stable sort changes nothing -- */
    { Rec a[] = {{1,'a'},{2,'a'},{2,'b'},{3,'a'},{4,'a'},{4,'b'},{5,'a'},{6,'a'},{6,'b'},{7,'a'}};
      insertion_sort_stable(a, 10);
      char t[] = {'a','a','b','a','a','b','a','a','b','a'};
      CHECK(tags_equal(a, t, 10)); }

    /* -- both algorithms agree on the multiset even when tag order differs:
     *    sum of keys is an independent, order-independent oracle -- */
    { Rec a1[] = {{5,'a'},{2,'a'},{5,'b'},{8,'a'},{2,'b'}};
      Rec a2[5]; for (int i = 0; i < 5; i++) a2[i] = a1[i];
      insertion_sort_stable(a1, 5);
      selection_sort_unstable(a2, 5);
      int sum1 = 0, sum2 = 0;
      for (int i = 0; i < 5; i++) { sum1 += a1[i].key; sum2 += a2[i].key; }
      CHECK_EQ_INT(sum1, 22);
      CHECK_EQ_INT(sum2, 22); }

    /* -- integration -- */
    program_main();

    TEST_SUMMARY();
}
