/* Week 10 -- Sorting
 * Shell sort: insertion sort, but comparing elements `gap` apart instead of
 * adjacent; the gap starts at n/2 and halves every round down to 1. Prints
 * the array after every gap round and the total comparisons/shifts.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

static void print_array(const int a[], int n) {
    printf("[");
    for (int i = 0; i < n; i++) printf("%d%s", a[i], i + 1 < n ? ", " : "");
    printf("]\n");
}

void shell_sort(int a[], int n, int *comparisons, int *shifts) {
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int key = a[i];
            int j = i;
            while (j >= gap) {
                (*comparisons)++;
                if (a[j - gap] <= key) break;
                a[j] = a[j - gap];
                (*shifts)++;
                j -= gap;
            }
            a[j] = key;
        }
        printf("  gap=%d: ", gap);
        print_array(a, n);
    }
}

static void run_scenario(const char *label, int a[], int n) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    int comparisons = 0, shifts = 0;
    shell_sort(a, n, &comparisons, &shifts);
    printf("after:  ");
    print_array(a, n);
    printf("total: %d comparisons, %d shifts\n\n", comparisons, shifts);
}

int main(void) {
    int normal[] = {23, 9, 41, 5, 33, 17, 2, 46, 12, 28};
    int hard[] = {50, 3, 47, 8, 44, 12, 39, 16, 34, 20, 29, 24, 25, 27, 1, 45};
    int already_sorted[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
    int reverse_sorted[] = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

    run_scenario("normal: 10 values, gap sequence 5, 2, 1", normal, 10);
    run_scenario("hard: 16 values, gap sequence 8, 4, 2, 1", hard, 16);
    run_scenario("edge: already sorted -- zero shifts at every gap", already_sorted, 12);
    run_scenario("edge: reverse sorted -- large gaps close long distances immediately", reverse_sorted, 12);

    return 0;
}
