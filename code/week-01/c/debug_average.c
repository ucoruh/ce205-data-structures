/* Week 1 -- Introduction to Data Structures
 * A small bug hunt for the C workshop: why is the average wrong?
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

int average_buggy(const int arr[], int n) {
    int sum = 0;
    for (int i = 0; i < n; i++)
        sum = sum + arr[i];
    return sum / n;               /* bug: integer division truncates */
}

double average_fixed(const int arr[], int n) {
    int sum = 0;
    for (int i = 0; i < n; i++)
        sum = sum + arr[i];
    return (double) sum / n;      /* fix: promote to double before dividing */
}

int main(void) {
    int scores[] = {7, 8, 8};
    int n = (int) (sizeof(scores) / sizeof(scores[0]));

    printf("average_buggy  -> %d\n", average_buggy(scores, n));
    printf("average_fixed  -> %.2f\n", average_fixed(scores, n));

    return 0;
}
