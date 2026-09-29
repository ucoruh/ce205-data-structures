/* Week 10 -- Sorting
 * Insertion sort: for each i, pull out a[i] as the key, then shift every
 * element greater than the key one cell right until the key's correct spot
 * (its "hole") is found. Prints the key and the array after every
 * insertion, plus total comparisons/shifts.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

static void print_array(const int a[], int n) {
    printf("[");
    for (int i = 0; i < n; i++) printf("%d%s", a[i], i + 1 < n ? ", " : "");
    printf("]\n");
}

void insertion_sort(int a[], int n, int *comparisons, int *shifts) {
    for (int i = 1; i < n; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0) {
            (*comparisons)++;
            if (a[j] <= key) break;
            a[j + 1] = a[j];
            (*shifts)++;
            j--;
        }
        a[j + 1] = key;
        printf("  i=%d: key=%d -> ", i, key);
        print_array(a, n);
    }
}

static void run_scenario(const char *label, int a[], int n) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    int comparisons = 0, shifts = 0;
    insertion_sort(a, n, &comparisons, &shifts);
    printf("after:  ");
    print_array(a, n);
    printf("total: %d comparisons, %d shifts\n\n", comparisons, shifts);
}

int main(void) {
    int normal[] = {31, 12, 25, 8, 19, 40, 3, 27, 15, 22};
    int hard[] = {45, 2, 38, 9, 33, 14, 29, 6, 41, 18, 24, 11, 36, 20};
    int already_sorted[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
    int reverse_sorted[] = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

    run_scenario("normal: 10 unordered values", normal, 10);
    run_scenario("hard: 14 values, needs long shifts", hard, 14);
    run_scenario("edge: already sorted -- one comparison per i, zero shifts", already_sorted, 12);
    run_scenario("edge: reverse sorted -- worst case, every key shifts to the front", reverse_sorted, 12);

    return 0;
}
