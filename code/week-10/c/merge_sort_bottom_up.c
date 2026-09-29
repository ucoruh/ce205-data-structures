/* Week 10 -- Sorting
 * Merge sort, bottom-up (iterative): no recursion. Treat every element as
 * a sorted run of width 1, merge adjacent runs into width-2 runs, then
 * width-4, doubling every round until one run covers the whole array.
 * Prints every merge and the total comparisons/moves.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

static int comparisons, moves;

static void print_range(const int a[], int lo, int hi) {
    printf("[");
    for (int i = lo; i < hi; i++) printf("%d%s", a[i], i + 1 < hi ? "," : "");
    printf("]");
}

static void merge(int a[], int lo, int mid, int hi, int tmp[]) {
    int i = lo, j = mid, k = lo;
    printf("  merge ");
    print_range(a, lo, mid);
    printf(" + ");
    print_range(a, mid, hi);
    while (i < mid && j < hi) {
        comparisons++;
        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
        moves++;
    }
    while (i < mid) { tmp[k++] = a[i++]; moves++; }
    while (j < hi) { tmp[k++] = a[j++]; moves++; }
    for (int x = lo; x < hi; x++) a[x] = tmp[x];
    printf(" -> ");
    print_range(a, lo, hi);
    printf("\n");
}

void merge_sort_bottom_up(int a[], int n, int tmp[]) {
    for (int width = 1; width < n; width *= 2) {
        printf(" width=%d:\n", width);
        for (int lo = 0; lo < n - width; lo += 2 * width) {
            int mid = lo + width;
            int hi = mid + width < n ? mid + width : n;
            merge(a, lo, mid, hi, tmp);
        }
    }
}

static void print_array(const int a[], int n) { print_range(a, 0, n); printf("\n"); }

static void run_scenario(const char *label, int a[], int n) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    int tmp[64];
    comparisons = 0; moves = 0;
    merge_sort_bottom_up(a, n, tmp);
    printf("after:  ");
    print_array(a, n);
    printf("total: %d comparisons, %d moves\n\n", comparisons, moves);
}

int main(void) {
    int normal[] = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6};
    int power_of_two[] = {16, 3, 9, 14, 1, 12, 7, 10, 5, 15, 2, 11, 8, 13, 4, 6};
    int already_sorted[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
    int reverse_sorted[] = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

    run_scenario("normal: 10 unordered values", normal, 10);
    run_scenario("hard: 16 values, n is exactly a power of 2", power_of_two, 16);
    run_scenario("edge: already sorted -- every round still runs", already_sorted, 12);
    run_scenario("edge: reverse sorted", reverse_sorted, 12);

    return 0;
}
