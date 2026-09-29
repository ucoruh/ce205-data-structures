/* Week 6 -- Search and Hashing
 * Interpolation search: on a SORTED, roughly uniform array, estimate where
 * the target should be with a formula instead of always checking the
 * middle. A guard avoids dividing by zero when the current range is all one
 * value. Prints every probe.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

int interpolation_search(const int arr[], int n, int target, int *probes) {
    int lo = 0, hi = n - 1, p = 0;
    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
        p++;
        if (arr[hi] == arr[lo]) {                 /* guard: avoid division by zero */
            printf("  probe %d: arr[hi] == arr[lo] (%d), guard triggered\n", p, arr[lo]);
            *probes = p;
            return lo;                            /* target must equal arr[lo] here */
        }
        int pos = lo + (int) ((double) (target - arr[lo]) * (hi - lo) / (arr[hi] - arr[lo]));
        printf("  probe %d: lo=%d hi=%d pos=%d arr[pos]=%d\n", p, lo, hi, pos, arr[pos]);
        if (arr[pos] == target) { *probes = p; return pos; }
        if (arr[pos] < target) lo = pos + 1;
        else hi = pos - 1;
    }
    *probes = p;
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
    int probes = 0;
    int index = interpolation_search(arr, n, target, &probes);
    if (index == -1) printf("result: not found, %d probes\n\n", probes);
    else printf("result: found at index %d, %d probes\n\n", index, probes);
}

int main(void) {
    int normal[] = {10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85};
    int hard[] = {10, 13, 21, 24, 33, 36, 44, 48, 55, 61, 68, 74, 81, 87, 94, 100};
    int skewed[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1000000};
    int all_equal[] = {42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42};

    run_scenario("normal: uniformly spread 16 values, found in a single probe", normal, 16, 55);
    run_scenario("hard: slightly uneven spacing, needs a few probes", hard, 16, 81);
    run_scenario("edge: skewed data, last value is huge, many probes", skewed, 16, 8);
    run_scenario("edge: all values equal, the division guard kicks in", all_equal, 16, 42);
    run_scenario("edge: target is entirely outside the range, rejected on sight", normal, 16, 999);

    return 0;
}
