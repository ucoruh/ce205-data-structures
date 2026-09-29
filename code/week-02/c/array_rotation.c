/* Week 2 -- Linked Lists, Arrays and Matrices
 * Rotate an array left by d positions with the reversal algorithm: reverse
 * the first d elements, reverse the rest, then reverse the whole thing.
 * Matches the array-rotation.js animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

void reverse(int arr[], int lo, int hi) {
    while (lo < hi) {
        int tmp = arr[lo];
        arr[lo] = arr[hi];
        arr[hi] = tmp;
        lo++;
        hi--;
    }
}

void rotate_left(int arr[], int n, int d) {
    if (n == 0)
        return;                     /* empty array: nothing to rotate */
    d = d % n;
    reverse(arr, 0, d - 1);        /* reverse the first d elements */
    reverse(arr, d, n - 1);        /* reverse the remaining n-d elements */
    reverse(arr, 0, n - 1);        /* reverse the whole array */
}

static void print_array(const char *label, const int arr[], int n) {
    printf("%s:", label);
    for (int i = 0; i < n; i++) printf(" %d", arr[i]);
    printf("\n");
}

static void run_scenario(const char *label, int arr[], int n, int d) {
    printf("-- %s --\n", label);
    print_array("before", arr, n);
    printf("rotate_left(arr, %d, %d)\n", n, d);
    rotate_left(arr, n, d);
    print_array("after", arr, n);
    printf("\n");
}

int main(void) {
    /* normal: 12 values, d=4 */
    int normal[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120};
    run_scenario("normal: 12 values, d=4", normal, 12, 4);

    /* hard: 15 values (negative/duplicate), d=7 (near half) */
    int hard[] = {3, -8, 15, 3, 22, -1, 40, 9, -17, 26, 5, -30, 11, 3, 18};
    run_scenario("hard: 15 values (negative/duplicate), d=7 (near half)", hard, 15, 7);

    /* edge: d=0: nothing should change */
    int d_zero[] = {4, 9, 15, 23, 2, 31, 8, 19, 6, 27};
    run_scenario("edge: d=0: nothing should change", d_zero, 10, 0);

    /* edge: d=n: d%n=0, still no change */
    int d_eq_n[] = {5, 12, 18, 24, 3, 30, 9, 21, 15, 6};
    run_scenario("edge: d=n: d%n=0, still no change", d_eq_n, 10, 10);

    /* edge: d>n: reduced by d%n (d=23, n=10 -> 3) */
    int d_gt_n[] = {7, 14, 21, 2, 28, 9, 35, 16, 4, 22};
    run_scenario("edge: d>n: reduced by d%n (d=23, n=10 -> 3)", d_gt_n, 10, 23);

    return 0;
}
