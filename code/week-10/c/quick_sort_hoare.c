/* Week 10 -- Sorting
 * Quick sort with Hoare partitioning: pivot = first element of the range.
 * Two pointers scan inward from both ends and swap out-of-place pairs; the
 * partition does NOT guarantee the pivot itself lands at the returned
 * index. Recursive calls are (lo, p) and (p + 1, hi) -- note p, not
 * p - 1. Prints every partition call and the total comparisons/swaps.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

static int comparisons, swaps;

static void print_range(const int a[], int lo, int hi) {
    printf("[");
    for (int i = lo; i <= hi; i++) printf("%d%s", a[i], i < hi ? "," : "");
    printf("]");
}

int partition_hoare(int a[], int lo, int hi) {
    int pivot = a[lo];
    int i = lo - 1, j = hi + 1;
    while (1) {
        do { i++; comparisons++; } while (a[i] < pivot);
        do { j--; comparisons++; } while (a[j] > pivot);
        if (i >= j) return j;
        int tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        swaps++;
    }
}

void quick_sort_hoare(int a[], int lo, int hi) {
    if (lo < hi) {
        printf("  partition [%d..%d] ", lo, hi);
        print_range(a, lo, hi);
        printf(" pivot=%d -> ", a[lo]);
        int p = partition_hoare(a, lo, hi);
        print_range(a, lo, hi);
        printf(" (returns %d)\n", p);
        quick_sort_hoare(a, lo, p);
        quick_sort_hoare(a, p + 1, hi);
    }
}

static void print_array(const int a[], int n) { print_range(a, 0, n - 1); printf("\n"); }

static void run_scenario(const char *label, int a[], int n) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    comparisons = 0; swaps = 0;
    quick_sort_hoare(a, 0, n - 1);
    printf("after:  ");
    print_array(a, n);
    printf("total: %d comparisons, %d swaps\n\n", comparisons, swaps);
}

int main(void) {
    int normal[] = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6};
    int repeated[] = {7, 2, 7, 9, 2, 7, 4, 9, 2, 4, 7, 9};
    int already_sorted[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int reverse_sorted[] = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

    run_scenario("normal: 10 unordered values", normal, 10);
    run_scenario("hard: 12 values with repeated keys", repeated, 12);
    run_scenario("edge: already sorted -- every scan still runs", already_sorted, 10);
    run_scenario("edge: reverse sorted -- worst case", reverse_sorted, 10);

    return 0;
}
