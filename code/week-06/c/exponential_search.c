/* Week 6 -- Search and Hashing
 * Exponential search: on a SORTED array, double a bound (1, 2, 4, 8, ...)
 * until it overshoots target, then run ordinary binary search inside
 * [bound/2, bound]. Prints the bound-finding phase and the binary-search
 * phase.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

int exponential_search(const int arr[], int n, int target, int *comparisons) {
    int comp = 1;                    /* the arr[0] check below counts as comparison #1 */
    printf("  check arr[0] = %d\n", arr[0]);
    if (arr[0] == target) { *comparisons = comp; return 0; }
    int bound = 1;
    while (bound < n) {                 /* double the bound until it overshoots target */
        comp++;
        printf("  bound = %d: check arr[%d] = %d\n", bound, bound, arr[bound]);
        if (arr[bound] >= target) break;
        bound *= 2;
    }
    int lo = bound / 2, hi = (bound < n) ? bound : n - 1;
    printf("  binary search inside [%d..%d]\n", lo, hi);
    while (lo <= hi) {                  /* ordinary binary search inside [lo..hi] */
        int mid = lo + (hi - lo) / 2;
        comp++;
        printf("  compare arr[%d] = %d\n", mid, arr[mid]);
        if (arr[mid] == target) { *comparisons = comp; return mid; }
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    *comparisons = comp;
    return -1;
}

static void print_array(const int arr[], int n) {
    printf("arr =");
    for (int i = 0; i < n; i++) printf(" %d", arr[i]);
    printf("\n");
}

static void run_scenario(const char *label, const int arr[], int n, int target) {
    printf("-- %s --\n", label);
    print_array(arr, n);
    printf("target = %d\n", target);
    int comparisons = 0;
    int index = exponential_search(arr, n, target, &comparisons);
    if (index == -1) printf("result: not found, %d comparisons\n\n", comparisons);
    else printf("result: found at index %d, %d comparisons\n\n", index, comparisons);
}

int main(void) {
    int a[] = {3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63};
    int n = 16;

    run_scenario("normal: 16 values, target found around the middle", a, n, 39);
    run_scenario("hard: target near the end, the bound doubles several times", a, n, 59);
    run_scenario("edge: target is the first element, a single comparison", a, n, 3);
    run_scenario("edge: target is larger than the last element", a, n, 999);
    run_scenario("edge: target is in range but not in the array", a, n, 40);

    return 0;
}
