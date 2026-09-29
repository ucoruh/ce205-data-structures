/* Week 10 -- Sorting
 * Counting sort: a non-comparison sort for small non-negative integers.
 * Counts occurrences of each value, turns the counts into a cumulative
 * total, then places every input value directly at its final index,
 * scanning backwards to stay stable. Prints count[] at each stage and the
 * final result. Zero comparisons; the total writes are reported.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

static void print_array(const int a[], int n) {
    printf("[");
    for (int i = 0; i < n; i++) printf("%d%s", a[i], i + 1 < n ? "," : "");
    printf("]\n");
}

void counting_sort(int a[], int n, int max_val, int *writes) {
    int count[64] = {0};
    for (int i = 0; i < n; i++) { count[a[i]]++; (*writes)++; }
    printf("  raw counts:        ");
    print_array(count, max_val + 1);
    for (int v = 1; v <= max_val; v++) count[v] += count[v - 1];
    printf("  cumulative counts: ");
    print_array(count, max_val + 1);

    int output[64];
    for (int i = n - 1; i >= 0; i--) {
        output[count[a[i]] - 1] = a[i];
        (*writes)++;
        count[a[i]]--;
    }
    for (int i = 0; i < n; i++) a[i] = output[i];
}

static void run_scenario(const char *label, int a[], int n, int max_val) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    int writes = 0;
    counting_sort(a, n, max_val, &writes);
    printf("after:  ");
    print_array(a, n);
    printf("total: 0 comparisons, %d writes\n\n", writes);
}

int main(void) {
    int normal[] = {4, 2, 2, 8, 3, 3, 1, 4, 2, 7};
    int hard[] = {5, 1, 5, 9, 2, 5, 1, 9, 5, 2, 1, 9, 5, 0};
    int already_sorted[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    int sparse[] = {0, 15, 3, 12, 6, 9, 1, 14, 7, 8};

    run_scenario("normal: 10 values, range 0..9", normal, 10, 9);
    run_scenario("hard: 14 values, range 0..9, heavy repeats", hard, 14, 9);
    run_scenario("edge: already sorted -- every pass still runs", already_sorted, 10, 9);
    run_scenario("edge: sparse range -- 10 values but maxVal=15 (the O(n+k) cost)", sparse, 10, 15);

    return 0;
}
