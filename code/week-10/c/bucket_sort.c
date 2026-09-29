/* Week 10 -- Sorting
 * Bucket sort: for values in [0, 99], distribute into 10 buckets by the
 * tens digit, sort each bucket with insertion sort, then concatenate.
 * Prints the bucket contents and the final result; comparisons/moves are
 * counted (comparisons come from the within-bucket insertion sorts).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

#define BUCKETS 10
#define MAX_N 20

static void print_array(const int a[], int n) {
    printf("[");
    for (int i = 0; i < n; i++) printf("%d%s", a[i], i + 1 < n ? "," : "");
    printf("]");
}

void bucket_sort(int a[], int n, int max_val, int *comparisons, int *moves) {
    int bucket[BUCKETS][MAX_N];
    int bucket_len[BUCKETS] = {0};
    for (int i = 0; i < n; i++) {
        int b = (a[i] * BUCKETS) / (max_val + 1);
        bucket[b][bucket_len[b]++] = a[i];
        (*moves)++;
    }
    int k = 0;
    for (int b = 0; b < BUCKETS; b++) {
        for (int x = 1; x < bucket_len[b]; x++) {
            int key = bucket[b][x], y = x - 1;
            while (y >= 0) {
                (*comparisons)++;
                if (bucket[b][y] <= key) break;
                bucket[b][y + 1] = bucket[b][y];
                (*moves)++;
                y--;
            }
            bucket[b][y + 1] = key;
        }
        if (bucket_len[b] > 0) {
            printf("  bucket[%d] (%d-%d) = ", b, 10 * b, 10 * b + 9);
            print_array(bucket[b], bucket_len[b]);
            printf("\n");
        }
        for (int i = 0; i < bucket_len[b]; i++) { a[k++] = bucket[b][i]; (*moves)++; }
    }
}

static void run_scenario(const char *label, int a[], int n) {
    printf("-- %s --\n", label);
    printf("before: ");
    print_array(a, n);
    printf("\n");
    int comparisons = 0, moves = 0;
    bucket_sort(a, n, 99, &comparisons, &moves);
    printf("after:  ");
    print_array(a, n);
    printf("\n");
    printf("total: %d comparisons, %d moves\n\n", comparisons, moves);
}

int main(void) {
    int normal[] = {42, 8, 77, 15, 91, 33, 56, 24, 68, 5};
    int hard[] = {42, 45, 8, 77, 71, 15, 91, 33, 38, 56, 24, 68, 5, 3};
    int same_bucket[] = {40, 41, 42, 43, 44, 45, 46, 47, 48, 49};
    int already_sorted[] = {2, 12, 22, 33, 44, 55, 66, 77, 88, 99};

    run_scenario("normal: 10 values, 0-99, spread well across the buckets", normal, 10);
    run_scenario("hard: 14 values, some buckets collide", hard, 14);
    run_scenario("edge: all in one bucket -- worst case, degrades to O(n^2)", same_bucket, 10);
    run_scenario("edge: already sorted", already_sorted, 10);

    return 0;
}
