/* Week 1 -- Introduction to Data Structures
 * Space complexity: a recursive sum pushes one stack frame per call;
 * an iterative sum reuses a single set of variables.
 * Runs the same normal / hard / edge-case scenarios as the space-recursive-vs-iterative animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

int sum_recursive(const int arr[], int n) {
    if (n == 0)              /* base case: 0 elements left */
        return 0;
    return arr[n - 1] + sum_recursive(arr, n - 1);   /* one stack frame per call */
}

int sum_iterative(const int arr[], int n) {
    int total = 0;           /* ONE set of variables, reused every iteration */
    for (int i = 0; i < n; i++)
        total += arr[i];
    return total;
}

static void print_array(const int arr[], int n) {
    printf("arr:");
    for (int i = 0; i < n; i++)
        printf(" %d", arr[i]);
    printf("  (n = %d)\n", n);
}

static void run_scenario(const char *label, const int arr[], int n) {
    printf("-- %s --\n", label);
    print_array(arr, n);
    printf("sum_recursive -> %d (uses O(n) stack space: %d frames)\n", sum_recursive(arr, n), n);
    printf("sum_iterative -> %d (uses O(1) stack space: 1 frame, reused)\n\n", sum_iterative(arr, n));
}

int main(void) {
    /* normal: 10 positive values */
    int normal[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    run_scenario("normal: 10 positive values", normal, 10);

    /* hard: 20 values with mixed signs */
    int hard[] = {5, -3, 12, 8, -7, 15, 22, -10, 6, 18, 9, -4, 11, 27, -15, 3, 19, -8, 14, 7};
    run_scenario("hard: 20 values with mixed signs", hard, 20);

    /* edge: 10 negative values */
    int allNegative[] = {-5, -10, -15, -20, -25, -30, -35, -40, -45, -50};
    run_scenario("edge: 10 negative values", allNegative, 10);

    /* edge: 22 values, deep recursion */
    int deep[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22};
    run_scenario("edge: 22 values, deep recursion", deep, 22);

    return 0;
}
