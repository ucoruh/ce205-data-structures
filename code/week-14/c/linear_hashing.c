/* Week 14 -- File Organisation II
 * Linear hashing: no directory at all. Buckets split in round-robin order (bucket n, then
 * n+1, ...), triggered by ANY overflow; a key's address is a simple modulo, bumped to the
 * next level only when its home bucket has already been split this round.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>

#define MAX_BUCKETS 64
#define MAX_KEYS 32

static int pow2i(int e) {
    int r = 1;
    for (int i = 0; i < e; i++)
        r *= 2;
    return r;
}

int address(int key, int n0, int level, int n) {
    int a = key % (n0 * pow2i(level));
    if (a < n)
        a = key % (n0 * pow2i(level + 1));
    return a;
}

static void split(int buckets[][MAX_KEYS], int bucket_len[], int n0, int *level, int *n) {
    int new_index = n0 * pow2i(*level) + *n;
    int old_len = bucket_len[*n];
    int old_keys[MAX_KEYS];
    for (int i = 0; i < old_len; i++)
        old_keys[i] = buckets[*n][i];
    bucket_len[*n] = 0;
    bucket_len[new_index] = 0;
    for (int i = 0; i < old_len; i++) {
        int a2 = old_keys[i] % (n0 * pow2i(*level + 1));
        int dst = (a2 == new_index) ? new_index : *n;
        buckets[dst][bucket_len[dst]++] = old_keys[i];
    }
    (*n)++;
    if (*n == n0 * pow2i(*level)) {
        *n = 0;
        (*level)++;
    }
}

static void insert_key(int buckets[][MAX_KEYS], int bucket_len[], int n0, int capacity, int *level, int *n, int key) {
    int a = address(key, n0, *level, *n);
    buckets[a][bucket_len[a]++] = key; /* always fits: an overflowing bucket just grows */
    if (bucket_len[a] > capacity)
        split(buckets, bucket_len, n0, level, n); /* ANY overflow triggers splitting bucket n */
}

static void run_scenario(const char *label, int n0, int capacity, const int keys[], int kn) {
    printf("-- %s --\n", label);
    printf("N0=%d CAPACITY=%d\n", n0, capacity);
    static int buckets[MAX_BUCKETS][MAX_KEYS];
    int bucket_len[MAX_BUCKETS] = {0};
    for (int i = 0; i < MAX_BUCKETS; i++)
        bucket_len[i] = 0;
    int level = 0, n = 0;

    for (int i = 0; i < kn; i++)
        insert_key(buckets, bucket_len, n0, capacity, &level, &n, keys[i]);

    int total_buckets = n0 * pow2i(level) + n;
    printf("level=%d n=%d buckets=%d\n", level, n, total_buckets);
    for (int b = 0; b < total_buckets; b++) {
        printf("  bucket %d:", b + 1);
        for (int i = 0; i < bucket_len[b]; i++)
            printf(" %d", buckets[b][i]);
        printf("\n");
    }
    printf("\n");
}

int main(void) {
    const int normal_keys[] = {9, 20, 15, 3, 25, 12, 7, 30, 1, 18};
    run_scenario("normal: N0=4, capacity=2, 10 keys", 4, 2, normal_keys, 10);

    const int hard_keys[] = {4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48};
    run_scenario("hard: N0=4, capacity=2, 12 multiples of 4", 4, 2, hard_keys, 12);

    const int one_keys[] = {0, 11, 22, 33, 44, 55, 66, 77, 88, 99};
    run_scenario("edge: N0=10, exactly 1 key per bucket, no overflow", 10, 2, one_keys, 10);

    const int tight_keys[] = {5, 3, 8, 2, 7, 4, 9, 6, 11, 10};
    run_scenario("edge: N0=2, capacity=1, frequent splits", 2, 1, tight_keys, 10);
    return 0;
}
