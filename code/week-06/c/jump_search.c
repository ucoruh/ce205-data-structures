/* Week 6 -- Search and Hashing
 * Jump search: on a SORTED array, jump forward in fixed-size blocks
 * (block = floor(sqrt(n))) until a block boundary is >= target, then scan
 * that block linearly. Prints every jump and every comparison inside the
 * final block.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <math.h>

int jump_search(const int arr[], int n, int target, int *comparisons) {
    int block = (int) sqrt((double) n);      /* block size = floor(sqrt(n)) */
    if (block < 1) block = 1;
    int prev = 0, step = block, comp = 0;
    while (step < n) {                        /* jump forward one block at a time */
        comp++;
        printf("  jump: check arr[%d] = %d\n", step - 1, arr[step - 1]);
        if (arr[step - 1] >= target) break;    /* target may be in this block */
        prev = step;
        step += block;
    }
    if (step > n) step = n;
    printf("  scanning block [%d..%d)\n", prev, step);
    for (int i = prev; i < step; i++) {        /* linear scan inside the block */
        comp++;
        printf("  compare arr[%d] = %d\n", i, arr[i]);
        if (arr[i] == target) { *comparisons = comp; return i; }
        if (arr[i] > target) break;             /* sorted: no need to look further */
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
    int index = jump_search(arr, n, target, &comparisons);
    if (index == -1) printf("result: not found, %d comparisons\n\n", comparisons);
    else printf("result: found at index %d, %d comparisons\n\n", index, comparisons);
}

int main(void) {
    int a[] = {2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62};
    int n = 16;

    run_scenario("normal: 16 values, target found in the second block", a, n, 42);
    run_scenario("hard: target near the last block, needs the most jumps", a, n, 58);
    run_scenario("edge: target is smaller than every value", a, n, 1);
    run_scenario("edge: target is larger than every value", a, n, 999);
    run_scenario("edge: target is in range but not in the array", a, n, 45);

    return 0;
}
