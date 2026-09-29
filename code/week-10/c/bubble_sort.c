/* Week 10 -- Sorting
 * Bubble sort with early exit: repeatedly walk the array, swapping adjacent
 * out-of-order pairs; a pass with zero swaps means the array is already
 * sorted and the algorithm stops early. Prints the array after every pass
 * and the total comparisons/swaps.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

static void print_array(const int a[], int n) {
    printf("[");
    for (int i = 0; i < n; i++) printf("%d%s", a[i], i + 1 < n ? ", " : "");
    printf("]\n");
}

void bubble_sort(int a[], int n, int *comparisons, int *swaps) {
    for (int pass = 0; pass < n - 1; pass++) {
        int swapped = 0;
        for (int i = 0; i < n - 1 - pass; i++) {
            (*comparisons)++;
            if (a[i] > a[i + 1]) {
                int tmp = a[i]; a[i] = a[i + 1]; a[i + 1] = tmp;
                (*swaps)++;
                swapped = 1;
            }
        }
        printf("  pass %d: ", pass + 1);
        print_array(a, n);
        if (!swapped) { printf("  no swaps this pass -> early exit\n"); break; }
    }
}

static void run_scenario(const char *label, int a[], int n) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    int comparisons = 0, swaps = 0;
    bubble_sort(a, n, &comparisons, &swaps);
    printf("after:  ");
    print_array(a, n);
    printf("total: %d comparisons, %d swaps\n\n", comparisons, swaps);
}

int main(void) {
    int normal[] = {5, 2, 9, 1, 7, 3, 8, 4, 6, 0};
    int hard[] = {40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29};
    int already_sorted[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
    int reverse_sorted[] = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

    run_scenario("normal: 10 unordered values", normal, 10);
    run_scenario("hard: 14 values, needs many passes", hard, 14);
    run_scenario("edge: already sorted -- early exit after one pass", already_sorted, 12);
    run_scenario("edge: reverse sorted -- worst case, no early exit", reverse_sorted, 12);

    return 0;
}
