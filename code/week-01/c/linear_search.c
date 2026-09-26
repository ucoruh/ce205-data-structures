/* Week 1 -- Introduction to Data Structures
 * Linear search: scan the array from the front, one comparison at a time.
 * Runs the same normal / hard / edge-case scenarios as the linear-search animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

int linear_search(const int arr[], int n, int target, int *comparisons) {
    for (int i = 0; i < n; i++) {
        (*comparisons)++;
        if (arr[i] == target)
            return i;
    }
    return -1;
}

static void print_array(const int arr[], int n) {
    printf("arr:");
    for (int i = 0; i < n; i++)
        printf(" %d", arr[i]);
    printf("  (n = %d)\n", n);
}

static void run_scenario(const char *label, const int arr[], int n, int target) {
    printf("-- %s --\n", label);
    print_array(arr, n);
    int comparisons = 0;
    int index = linear_search(arr, n, target, &comparisons);
    if (index >= 0)
        printf("linear_search(target=%d) -> found at index %d, %d comparison%s\n\n",
               target, index, comparisons, comparisons == 1 ? "" : "s");
    else
        printf("linear_search(target=%d) -> not found, %d comparisons\n\n", target, comparisons);
}

int main(void) {
    /* normal: 11 values, target in the middle */
    int normal[] = {4, 8, 15, 16, 23, 27, 31, 38, 42, 50, 61};
    run_scenario("normal: 11 values, target in the middle", normal, 11, 27);

    /* hard: 20 values, duplicate target, first match */
    int hard[] = {12, 47, 3, 88, 25, 61, 9, 34, 77, 15, 52, 6, 41, 18, 63, 99, 5, 29, 99, 71};
    run_scenario("hard: 20 values, duplicate target, first match", hard, 20, 99);

    /* edge: not found -- target is not in the array */
    int notFound[] = {2, 4, 6, 8, 10, 12, 14, 16, 18, 20};
    run_scenario("edge: not found, target is not in the array", notFound, 10, 7);

    /* edge: best case -- target is in the first box (index 0) */
    int firstIndex[] = {5, 13, 21, 34, 42, 55, 67, 78, 89, 91};
    run_scenario("edge: best case, target is in the first box (index 0)", firstIndex, 10, 5);

    /* edge: one-element array */
    int one[] = {42};
    run_scenario("edge: one-element array", one, 1, 42);

    return 0;
}
