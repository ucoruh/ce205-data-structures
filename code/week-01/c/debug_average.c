/* Week 1 -- Introduction to Data Structures
 * average_buggy() truncates because of integer division; average_fixed() casts to double first.
 * Runs the same normal / hard / edge-case scenarios as the debugger-stepping animation, the way a
 * gdb session (Section 7.5) narrates them one breakpoint at a time.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

int average_buggy(const int arr[], int n) {
    if (n == 0) return 0;            /* guard: avoid division by zero */
    int sum = 0;
    for (int i = 0; i < n; i++)
        sum = sum + arr[i];
    return sum / n;                  /* bug: integer division truncates */
}

double average_fixed(const int arr[], int n) {
    if (n == 0) return 0.0;
    int sum = 0;
    for (int i = 0; i < n; i++)
        sum = sum + arr[i];
    return (double) sum / n;         /* fix: promote to double before dividing */
}

static void run_scenario(const char *label, const int arr[], int n) {
    printf("-- %s --\n", label);
    printf("arr:");
    for (int i = 0; i < n; i++)
        printf(" %d", arr[i]);
    printf("  (n = %d)\n", n);
    printf("average_buggy  -> %d\n", average_buggy(arr, n));
    printf("average_fixed  -> %.2f\n\n", average_fixed(arr, n));
}

int main(void) {
    /* normal: 10 elements, the bug shows */
    int normal[] = {7, 8, 8, 9, 6, 10, 7, 8, 9, 9};
    run_scenario("normal: 10 elements, the bug shows", normal, 10);

    /* hard: 16 elements, negative values */
    int hard[] = {-5, 3, -8, 12, -1, 7, -10, 4, 9, -6, 2, -3, 8, -7, 1, 5};
    run_scenario("hard: 16 elements, negative values", hard, 16);

    /* edge: empty array, the division-by-zero guard */
    run_scenario("edge: empty array (division-by-zero guard)", NULL, 0);

    /* edge: a single element */
    int single[] = {7};
    run_scenario("edge: a single element", single, 1);

    return 0;
}
