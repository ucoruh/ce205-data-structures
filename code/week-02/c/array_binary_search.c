/* Week 2 -- Linked Lists, Arrays and Matrices
 * Binary search in a sorted array.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

int binary_search(int arr[], int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        printf("  check index %d: value %d\n", mid, arr[mid]);
        if (arr[mid] == target)
            return mid;
        if (arr[mid] < target)
            lo = mid + 1;       /* target is to the right */
        else
            hi = mid - 1;       /* target is to the left */
    }
    return -1;
}

int main(void) {
    int arr[] = {1, 3, 5, 7, 9, 11, 13};
    int n = 7;

    printf("sorted array: [1, 3, 5, 7, 9, 11, 13]\n");

    printf("binary_search(9):\n");
    int a = binary_search(arr, n, 9);
    printf("-> index %d\n", a);

    printf("binary_search(4):\n");
    int b = binary_search(arr, n, 4);
    printf("-> index %d\n", b);

    return 0;
}
