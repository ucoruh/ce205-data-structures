/* Week 10 -- Sorting
 * Selection sort: for each position i, scan the unsorted remainder for its
 * minimum and swap it into place. The sorted region grows on the LEFT; at
 * most n-1 swaps ever happen, but every position still does a full scan
 * (no early exit). Prints the array after every position and the total
 * comparisons/swaps.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

static void print_array(const int a[], int n) {
    printf("[");
    for (int i = 0; i < n; i++) printf("%d%s", a[i], i + 1 < n ? ", " : "");
    printf("]\n");
}

void selection_sort(int a[], int n, int *comparisons, int *swaps) {
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            (*comparisons)++;
            if (a[j] < a[min_idx]) min_idx = j;
        }
        if (min_idx != i) {
            int tmp = a[i]; a[i] = a[min_idx]; a[min_idx] = tmp;
            (*swaps)++;
        }
        printf("  i=%d: min_idx=%d -> ", i, min_idx);
        print_array(a, n);
    }
}

static void run_scenario(const char *label, int a[], int n) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    int comparisons = 0, swaps = 0;
    selection_sort(a, n, &comparisons, &swaps);
    printf("after:  ");
    print_array(a, n);
    printf("total: %d comparisons, %d swaps\n\n", comparisons, swaps);
}

int main(void) {
    int normal[] = {29, 10, 14, 37, 14, 22, 5, 41, 18, 33};
    int hard[] = {50, 3, 47, 8, 44, 12, 39, 16, 34, 20, 29, 24, 25, 27};
    int already_sorted[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
    int reverse_sorted[] = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

    run_scenario("normal: 10 unordered values", normal, 10);
    run_scenario("hard: 14 values, the minimum keeps moving", hard, 14);
    run_scenario("edge: already sorted -- a full scan still happens for every i", already_sorted, 12);
    run_scenario("edge: reverse sorted -- every step swaps", reverse_sorted, 12);

    return 0;
}
