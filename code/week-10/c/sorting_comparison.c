/* Week 10 -- Sorting
 * Sorting comparison: the SAME input array is sorted five different ways
 * -- bubble, selection, insertion, merge (top-down), quick (Lomuto) -- and
 * each algorithm's comparisons/writes are reported on the identical input,
 * so the O(n^2) vs O(n log n) gap becomes an actual number.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>

static void print_array(const int a[], int n) {
    printf("[");
    for (int i = 0; i < n; i++) printf("%d%s", a[i], i + 1 < n ? "," : "");
    printf("]");
}

static void bubble(int a[], int n, int *comparisons, int *writes) {
    for (int pass = 0; pass < n - 1; pass++) {
        int swapped = 0;
        for (int i = 0; i < n - 1 - pass; i++) {
            (*comparisons)++;
            if (a[i] > a[i + 1]) { int t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; *writes += 2; swapped = 1; }
        }
        if (!swapped) break;
    }
}

static void selection(int a[], int n, int *comparisons, int *writes) {
    for (int i = 0; i < n - 1; i++) {
        int m = i;
        for (int j = i + 1; j < n; j++) { (*comparisons)++; if (a[j] < a[m]) m = j; }
        if (m != i) { int t = a[i]; a[i] = a[m]; a[m] = t; *writes += 2; }
    }
}

static void insertion(int a[], int n, int *comparisons, int *writes) {
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0) {
            (*comparisons)++;
            if (a[j] <= key) break;
            a[j + 1] = a[j]; (*writes)++; j--;
        }
        a[j + 1] = key; (*writes)++;
    }
}

static void merge_range(int a[], int lo, int mid, int hi, int tmp[], int *comparisons, int *writes) {
    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) { (*comparisons)++; tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++]; (*writes)++; }
    while (i < mid) { tmp[k++] = a[i++]; (*writes)++; }
    while (j < hi) { tmp[k++] = a[j++]; (*writes)++; }
    for (int x = lo; x < hi; x++) a[x] = tmp[x];
}
static void merge_sort_rec(int a[], int lo, int hi, int tmp[], int *comparisons, int *writes) {
    if (hi - lo <= 1) return;
    int mid = lo + (hi - lo) / 2;
    merge_sort_rec(a, lo, mid, tmp, comparisons, writes);
    merge_sort_rec(a, mid, hi, tmp, comparisons, writes);
    merge_range(a, lo, mid, hi, tmp, comparisons, writes);
}
static void merge_sort_top(int a[], int n, int *comparisons, int *writes) {
    int tmp[64];
    merge_sort_rec(a, 0, n, tmp, comparisons, writes);
}

static void quick_sort_rec(int a[], int lo, int hi, int *comparisons, int *writes) {
    if (lo >= hi) return;
    int pivot = a[hi], i = lo - 1;
    for (int j = lo; j < hi; j++) {
        (*comparisons)++;
        if (a[j] <= pivot) { i++; int t = a[i]; a[i] = a[j]; a[j] = t; *writes += 2; }
    }
    int t2 = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t2; *writes += 2;
    int p = i + 1;
    quick_sort_rec(a, lo, p - 1, comparisons, writes);
    quick_sort_rec(a, p + 1, hi, comparisons, writes);
}
static void quick_sort_top(int a[], int n, int *comparisons, int *writes) { quick_sort_rec(a, 0, n - 1, comparisons, writes); }

typedef void (*SortFn)(int[], int, int *, int *);

static void run_one(const char *name, SortFn fn, const int src[], int n) {
    int a[32];
    memcpy(a, src, sizeof(int) * (size_t) n);
    int comparisons = 0, writes = 0;
    fn(a, n, &comparisons, &writes);
    printf("  %-10s comparisons=%-4d writes=%-4d -> ", name, comparisons, writes);
    print_array(a, n);
    printf("\n");
}

static void run_scenario(const char *label, const int a[], int n) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    printf("\n");
    run_one("bubble", bubble, a, n);
    run_one("selection", selection, a, n);
    run_one("insertion", insertion, a, n);
    run_one("merge", merge_sort_top, a, n);
    run_one("quick", quick_sort_top, a, n);
    printf("\n");
}

int main(void) {
    int normal[] = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6};
    int already_sorted[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
    int reverse_sorted[] = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
    int nearly_sorted[] = {1, 2, 3, 4, 9, 6, 7, 8, 5, 10, 11, 12};

    run_scenario("normal: 10 unordered values", normal, 10);
    run_scenario("edge: already sorted -- bubble wins via early exit, quick (Lomuto) has its worst day", already_sorted, 12);
    run_scenario("edge: reverse sorted -- both bubble and quick (Lomuto) hit their worst case", reverse_sorted, 12);
    run_scenario("edge: nearly sorted -- only two values are swapped", nearly_sorted, 12);

    return 0;
}
