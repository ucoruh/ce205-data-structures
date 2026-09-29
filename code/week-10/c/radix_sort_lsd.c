/* Week 10 -- Sorting
 * Radix sort, least-significant-digit first (LSD): run a STABLE counting
 * sort on one decimal digit at a time, starting at the ones place, up to
 * the highest place any value needs. Always 10 buckets. Prints the array
 * after every digit pass. Zero comparisons; total writes are reported.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

static int get_digit(int x, int place) { return (x / place) % 10; }

static void print_array(const int a[], int n) {
    printf("[");
    for (int i = 0; i < n; i++) printf("%d%s", a[i], i + 1 < n ? "," : "");
    printf("]\n");
}

void radix_sort_lsd(int a[], int n, int *writes) {
    if (n <= 0) return;               /* empty array: nothing to do, a[0] would be out of bounds */
    int max_val = a[0];
    for (int i = 1; i < n; i++) if (a[i] > max_val) max_val = a[i];

    for (int place = 1; max_val / place > 0; place *= 10) {
        int count[10] = {0};
        for (int i = 0; i < n; i++) { count[get_digit(a[i], place)]++; (*writes)++; }
        for (int d = 1; d < 10; d++) count[d] += count[d - 1];

        int output[64];
        for (int i = n - 1; i >= 0; i--) {
            int dgt = get_digit(a[i], place);
            output[count[dgt] - 1] = a[i];
            (*writes)++;
            count[dgt]--;
        }
        for (int i = 0; i < n; i++) a[i] = output[i];
        printf("  place=%-4d -> ", place);
        print_array(a, n);
    }
}

static void run_scenario(const char *label, int a[], int n) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    int writes = 0;
    radix_sort_lsd(a, n, &writes);
    printf("after:  ");
    print_array(a, n);
    printf("total: 0 comparisons, %d writes\n\n", writes);
}

int main(void) {
    int normal[] = {329, 457, 657, 839, 436, 720, 355, 21, 8, 100};
    int hard[] = {5, 45, 802, 3, 66, 913, 27, 8, 150, 999, 12, 300, 4, 88};
    int already_sorted[] = {1, 12, 23, 34, 45, 56, 67, 78, 89, 90};
    int single_digit[] = {4, 2, 9, 1, 7, 3, 8, 0, 6, 5};

    run_scenario("normal: 10 values, up to 3 digits, 3 passes", normal, 10);
    run_scenario("hard: 14 values, mixed digit lengths", hard, 14);
    run_scenario("edge: already sorted -- every pass still runs", already_sorted, 10);
    run_scenario("edge: all single-digit values -- only one pass", single_digit, 10);

    return 0;
}
