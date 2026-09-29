/* Week 2 -- Linked Lists, Arrays and Matrices
 * Linear search in an (unsorted) array.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

int linear_search(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        printf("  check index %d: value %d\n", i, arr[i]);
        if (arr[i] == target)
            return i;
    }
    return -1;
}

int main(void) {
    int arr[] = {5, 2, 9, 1, 7};
    int n = 5;

    printf("array: [5, 2, 9, 1, 7]\n");

    printf("linear_search(9):\n");
    int a = linear_search(arr, n, 9);
    printf("-> index %d\n", a);

    printf("linear_search(4):\n");
    int b = linear_search(arr, n, 4);
    printf("-> index %d\n", b);

    return 0;
}
