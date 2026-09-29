/* Week 10 -- Sorting
 * Merge sort, top-down (recursive): split the range in half, recursively
 * sort each half, then merge the two sorted halves with an auxiliary
 * array. Prints every merge (its two input runs and the merged result)
 * and the total comparisons/moves.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

static int comparisons, moves;

static void print_range(const int a[], int lo, int hi) {
    printf("[");
    for (int i = lo; i < hi; i++) printf("%d%s", a[i], i + 1 < hi ? "," : "");
    printf("]");
}

void merge(int a[], int lo, int mid, int hi, int tmp[]) {
    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) {
        comparisons++;
        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
        moves++;
    }
    while (i < mid) { tmp[k++] = a[i++]; moves++; }
    while (j < hi) { tmp[k++] = a[j++]; moves++; }
    printf("  merge ");
    print_range(a, lo, mid);
    printf(" + ");
    print_range(a, mid, hi);
    printf(" -> ");
    for (int x = lo; x < hi; x++) a[x] = tmp[x];
    print_range(a, lo, hi);
    printf("\n");
}

void merge_sort(int a[], int lo, int hi, int tmp[]) {
    if (hi - lo <= 1) return;
    int mid = lo + (hi - lo) / 2;
    merge_sort(a, lo, mid, tmp);
    merge_sort(a, mid, hi, tmp);
    merge(a, lo, mid, hi, tmp);
}

static void print_array(const int a[], int n) { print_range(a, 0, n); printf("\n"); }

static void run_scenario(const char *label, int a[], int n) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    int tmp[64];
    comparisons = 0; moves = 0;
    merge_sort(a, 0, n, tmp);
    printf("after:  ");
    print_array(a, n);
    printf("total: %d comparisons, %d moves\n\n", comparisons, moves);
}

int main(void) {
    int normal[] = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6};
    int hard[] = {45, 2, 38, 9, 33, 14, 29, 6, 41, 18, 24, 11, 36, 20};
    int already_sorted[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
    int reverse_sorted[] = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

    run_scenario("normal: 10 unordered values", normal, 10);
    run_scenario("hard: 14 values, uneven splits", hard, 14);
    run_scenario("edge: already sorted -- every split and merge still runs", already_sorted, 12);
    run_scenario("edge: reverse sorted", reverse_sorted, 12);

    return 0;
}
