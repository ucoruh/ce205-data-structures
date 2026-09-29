/* Week 6 -- Search and Hashing
 * Fibonacci search: on a SORTED array, split the range using Fibonacci
 * numbers instead of the middle (binary search) or a formula
 * (interpolation search). Uses only addition and subtraction. Prints the
 * Fibonacci triple and every probe.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

int fibonacci_search(const int arr[], int n, int target, int *comparisons) {
    int fib2 = 0, fib1 = 1, fib = fib1 + fib2;      /* smallest Fibonacci number >= n */
    while (fib < n) { int t = fib1 + fib; fib2 = fib1; fib1 = fib; fib = t; }
    printf("  smallest fib >= n: fib=%d fib1=%d fib2=%d\n", fib, fib1, fib2);

    int offset = -1, comp = 0;
    while (fib > 1) {
        int i = (offset + fib2 < n - 1) ? offset + fib2 : n - 1;
        comp++;
        printf("  probe %d: i=%d arr[i]=%d (fib=%d fib1=%d fib2=%d offset=%d)\n",
               comp, i, arr[i], fib, fib1, fib2, offset);
        if (arr[i] < target) {                       /* eliminate the left part */
            fib = fib1; fib1 = fib2; fib2 = fib - fib1;
            offset = i;
        } else if (arr[i] > target) {                /* eliminate the right part */
            fib = fib2; fib1 = fib1 - fib2; fib2 = fib - fib1;
        } else {
            *comparisons = comp;
            return i;
        }
    }
    if (fib1 == 1 && offset + 1 < n) {                /* one element may be left over */
        comp++;
        printf("  probe %d: one element left over, i=%d arr[i]=%d\n", comp, offset + 1, arr[offset + 1]);
        if (arr[offset + 1] == target) { *comparisons = comp; return offset + 1; }
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
    int index = fibonacci_search(arr, n, target, &comparisons);
    if (index == -1) printf("result: not found, %d comparisons\n\n", comparisons);
    else printf("result: found at index %d, %d comparisons\n\n", index, comparisons);
}

int main(void) {
    int a[] = {3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63};
    int n = 16;

    run_scenario("normal: 16 values, target found around the middle", a, n, 39);
    run_scenario("hard: target near the end, needs several splits", a, n, 59);
    run_scenario("edge: target is the first element", a, n, 3);
    run_scenario("edge: target is larger than the last element", a, n, 999);
    run_scenario("edge: target is in range but not in the array", a, n, 40);

    return 0;
}
