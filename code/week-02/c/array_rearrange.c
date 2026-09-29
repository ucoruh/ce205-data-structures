/* Week 2 -- Linked Lists, Arrays and Matrices
 * Rearrange an array in place: every negative value ends up left of every
 * non-negative value, using two pointers walking toward each other (the
 * same shape as a quicksort partition). Matches the array-rearrange.js
 * animation.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

void segregate(int arr[], int n) {
    int left = 0, right = n - 1;
    while (left < right) {
        while (left < right && arr[left] < 0)
            left++;                 /* already negative: leave it */
        while (left < right && arr[right] >= 0)
            right--;                /* already non-negative: leave it */
        if (left < right) {
            int tmp = arr[left];
            arr[left] = arr[right];
            arr[right] = tmp;
            left++;
            right--;
        }
    }
}

static void print_array(const char *label, const int arr[], int n) {
    printf("%s:", label);
    for (int i = 0; i < n; i++) printf(" %d", arr[i]);
    printf("\n");
}

static void run_scenario(const char *label, int arr[], int n) {
    printf("-- %s --\n", label);
    print_array("before", arr, n);
    segregate(arr, n);
    print_array("after ", arr, n);
    printf("\n");
}

int main(void) {
    /* normal: 12 values, mixed sign */
    int normal[] = {12, -7, 5, -3, 9, -1, -8, 6, 15, -20, 3, -4};
    run_scenario("normal: 12 values, mixed sign", normal, 12);

    /* hard: 15 values with zeros and duplicates (0 does NOT count as negative) */
    int hard[] = {0, -5, 3, -5, 0, 8, -12, 0, 4, -3, 7, -7, 0, 9, -2};
    run_scenario("hard: 15 values with zeros and duplicates (0 does NOT count as negative)", hard, 15);

    /* edge: all negative: no swap is ever needed */
    int all_negative[] = {-3, -8, -1, -15, -22, -4, -9, -17, -2, -6};
    run_scenario("edge: all negative: no swap is ever needed", all_negative, 10);

    /* edge: all non-negative (0 included): no swap is ever needed */
    int all_nonnegative[] = {4, 0, 9, 15, 2, 8, 0, 11, 6, 3};
    run_scenario("edge: all non-negative (0 included): no swap is ever needed", all_nonnegative, 10);

    /* edge: already segregated: the pointers cross without any swap */
    int already[] = {-5, -3, -8, -1, -9, 2, 4, 6, 8, 10, 12, 14};
    run_scenario("edge: already segregated: the pointers cross without any swap", already, 12);

    return 0;
}
