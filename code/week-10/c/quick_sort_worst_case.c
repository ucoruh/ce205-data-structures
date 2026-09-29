/* Week 10 -- Sorting
 * Quick sort's worst case, and how pivot choice avoids it: the SAME input
 * is sorted three times with the same Lomuto-style partition, differing
 * only in which element is chosen as the pivot (first / middle / median-
 * of-three). Prints each strategy's total comparisons and recursion depth
 * on the same input, so the O(n^2) vs O(n log n) gap becomes a number.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

static void swap(int a[], int x, int y) { int t = a[x]; a[x] = a[y]; a[y] = t; }

static int choose_pivot_first(int a[], int lo, int hi) { (void) a; (void) hi; return lo; }
static int choose_pivot_middle(int a[], int lo, int hi) { (void) a; return lo + (hi - lo) / 2; }
static int choose_pivot_median3(int a[], int lo, int hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] < a[lo]) swap(a, lo, mid);
    if (a[hi] < a[lo]) swap(a, lo, hi);
    if (a[hi] < a[mid]) swap(a, mid, hi);
    return mid;
}

static int partition_with(int a[], int lo, int hi, int pivot_idx, int *comparisons) {
    swap(a, pivot_idx, hi);
    int pivot = a[hi];
    int i = lo - 1;
    for (int j = lo; j < hi; j++) {
        (*comparisons)++;
        if (a[j] <= pivot) { i++; swap(a, i, j); }
    }
    swap(a, i + 1, hi);
    return i + 1;
}

typedef int (*PivotFn)(int[], int, int);

static void qs(int a[], int lo, int hi, PivotFn pick, int *comparisons, int *calls, int depth, int *max_depth) {
    if (depth > *max_depth) *max_depth = depth;
    if (hi <= lo) return;
    (*calls)++;
    int p_idx = pick(a, lo, hi);
    int p = partition_with(a, lo, hi, p_idx, comparisons);
    qs(a, lo, p - 1, pick, comparisons, calls, depth + 1, max_depth);
    qs(a, p + 1, hi, pick, comparisons, calls, depth + 1, max_depth);
}

static void print_array(const int a[], int n) {
    printf("[");
    for (int i = 0; i < n; i++) printf("%d%s", a[i], i + 1 < n ? "," : "");
    printf("]\n");
}

static void run_strategy(const char *name, const int src[], int n, PivotFn pick) {
    int a[32];
    for (int i = 0; i < n; i++) a[i] = src[i];
    int comparisons = 0, calls = 0, max_depth = 0;
    qs(a, 0, n - 1, pick, &comparisons, &calls, 0, &max_depth);
    printf("  %-16s comparisons=%-4d calls=%-3d depth=%-3d -> ", name, comparisons, calls, max_depth);
    print_array(a, n);
}

static void run_scenario(const char *label, const int a[], int n) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    run_strategy("first element", a, n, choose_pivot_first);
    run_strategy("middle index", a, n, choose_pivot_middle);
    run_strategy("median-of-3", a, n, choose_pivot_median3);
    printf("\n");
}

int main(void) {
    int sorted10[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int sorted14[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
    int reverse10[] = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
    int random10[] = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6};

    run_scenario("normal: already-sorted 10 values -- first-element is the worst case", sorted10, 10);
    run_scenario("hard: already-sorted 14 values -- the gap widens further", sorted14, 14);
    run_scenario("edge: reverse-sorted 10 values -- first-element is again the worst case", reverse10, 10);
    run_scenario("edge: random 10 values -- all three strategies are similar", random10, 10);

    return 0;
}
