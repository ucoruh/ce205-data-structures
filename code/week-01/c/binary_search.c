/* Week 1 -- Introduction to Data Structures
 * Binary search: repeatedly halve the search range on a SORTED array.
 * Runs the same normal / hard / edge-case scenarios as the binary-search animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

int binary_search(const int arr[], int n, int target, int *comparisons) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        (*comparisons)++;
        if (arr[mid] == target)
            return mid;
        if (arr[mid] < target)
            lo = mid + 1;
        else
            hi = mid - 1;
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
    int index = binary_search(arr, n, target, &comparisons);
    if (index >= 0)
        printf("binary_search(target=%d) -> found at index %d, %d comparison%s\n\n",
               target, index, comparisons, comparisons == 1 ? "" : "s");
    else
        printf("binary_search(target=%d) -> not found, %d comparisons\n\n", target, comparisons);
}

int main(void) {
    /* normal: 16 values, target found */
    int normal[] = {3, 7, 11, 15, 19, 23, 29, 34, 41, 47, 53, 60, 68, 75, 83, 90};
    run_scenario("normal: 16 values, target found", normal, 16, 47);

    /* hard: 31 values, not found: lo > hi at the end */
    int hard[] = {2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62,
                  66, 70, 74, 78, 82, 86, 90, 94, 98, 102, 106, 110, 114, 118, 122};
    run_scenario("hard: 31 values, not found (lo > hi at the end)", hard, 31, 5);

    /* edge: target is smaller than every value */
    int smallerThanAll[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    run_scenario("edge: target is smaller than every value", smallerThanAll, 10, 1);

    /* edge: target is larger than every value */
    int largerThanAll[] = {15, 25, 35, 45, 55, 65, 75, 85, 95, 105};
    run_scenario("edge: target is larger than every value", largerThanAll, 10, 999);

    /* edge: searching among duplicate values */
    int duplicates[] = {5, 5, 5, 10, 15, 20, 20, 25, 30, 35};
    run_scenario("edge: searching among duplicate values", duplicates, 10, 20);

    return 0;
}
