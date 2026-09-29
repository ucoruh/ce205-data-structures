/* Week 10 -- Sorting
 * Quick sort with Lomuto partitioning: pivot = last element of the range.
 * `i` marks the boundary of the "<= pivot" region; `j` scans left to
 * right. The pivot then swaps into its final position i+1. Prints every
 * partition call and the total comparisons/swaps.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

static int comparisons, swaps;

static void print_range(const int a[], int lo, int hi) {
    printf("[");
    for (int i = lo; i <= hi; i++) printf("%d%s", a[i], i < hi ? "," : "");
    printf("]");
}

int partition_lomuto(int a[], int lo, int hi) {
    int pivot = a[hi];
    int i = lo - 1;
    for (int j = lo; j < hi; j++) {
        comparisons++;
        if (a[j] <= pivot) {
            i++;
            int tmp = a[i]; a[i] = a[j]; a[j] = tmp;
            if (i != j) swaps++;
        }
    }
    int tmp2 = a[i + 1]; a[i + 1] = a[hi]; a[hi] = tmp2;
    swaps++;
    return i + 1;
}

void quick_sort_lomuto(int a[], int lo, int hi) {
    if (lo < hi) {
        printf("  partition [%d..%d] ", lo, hi);
        print_range(a, lo, hi);
        printf(" pivot=%d -> ", a[hi]);
        int p = partition_lomuto(a, lo, hi);
        print_range(a, lo, hi);
        printf(" (pivot lands at %d)\n", p);
        quick_sort_lomuto(a, lo, p - 1);
        quick_sort_lomuto(a, p + 1, hi);
    }
}

static void print_array(const int a[], int n) { print_range(a, 0, n - 1); printf("\n"); }

static void run_scenario(const char *label, int a[], int n) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    comparisons = 0; swaps = 0;
    quick_sort_lomuto(a, 0, n - 1);
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
    run_scenario("edge: already sorted -- worst case, every partition is n-1/0", already_sorted, 10);
    run_scenario("edge: reverse sorted -- worst case again", reverse_sorted, 10);

    return 0;
}
