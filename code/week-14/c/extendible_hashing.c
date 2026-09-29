/* Week 14 -- File Organisation II
 * Extendible hashing: an in-memory directory of 2^global_depth pointers selects a bucket by
 * the key's last global_depth bits; a full bucket splits, doubling the directory first if its
 * local_depth had caught up to global_depth.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>

#define MAX_BUCKETS 256
#define MAX_DIR 1024
#define MAX_KEYS 32

typedef struct {
    int keys[MAX_KEYS];
    int n;
    int local_depth;
} Bucket;

static int last_bits(int key, int depth) { return depth == 0 ? 0 : (key & ((1 << depth) - 1)); }

static void insert_key(Bucket buckets[], int *bucket_count, int dir[], int *dir_size, int *global_depth,
                        int capacity, int key) {
    int idx = last_bits(key, *global_depth);
    int b = dir[idx];
    if (buckets[b].n < capacity) {
        buckets[b].keys[buckets[b].n++] = key; /* room: just write */
        return;
    }
    if (buckets[b].local_depth == *global_depth) {
        int old_size = *dir_size;
        for (int i = 0; i < old_size; i++)
            dir[old_size + i] = dir[i]; /* every slot duplicated; memory only */
        *dir_size *= 2;
        (*global_depth)++;
    }
    buckets[b].local_depth++;
    int nb = (*bucket_count)++;
    buckets[nb].n = 0;
    buckets[nb].local_depth = buckets[b].local_depth;
    int split_bit = buckets[b].local_depth - 1;
    for (int i = 0; i < *dir_size; i++)
        if (dir[i] == b && ((i >> split_bit) & 1) == 1)
            dir[i] = nb;
    int old_n = buckets[b].n;
    int old_keys[MAX_KEYS];
    for (int i = 0; i < old_n; i++)
        old_keys[i] = buckets[b].keys[i];
    buckets[b].n = 0;
    for (int i = 0; i < old_n; i++) {
        if (((old_keys[i] >> split_bit) & 1) == 1)
            buckets[nb].keys[buckets[nb].n++] = old_keys[i];
        else
            buckets[b].keys[buckets[b].n++] = old_keys[i];
    }
    insert_key(buckets, bucket_count, dir, dir_size, global_depth, capacity, key); /* retry */
}

static void run_scenario(const char *label, int capacity, const int keys[], int n) {
    printf("-- %s --\n", label);
    printf("CAPACITY=%d\n", capacity);
    Bucket buckets[MAX_BUCKETS];
    int bucket_count = 1;
    buckets[0].n = 0;
    buckets[0].local_depth = 0;
    int dir[MAX_DIR] = {0};
    int dir_size = 1;
    int global_depth = 0;

    for (int i = 0; i < n; i++)
        insert_key(buckets, &bucket_count, dir, &dir_size, &global_depth, capacity, keys[i]);

    printf("global_depth=%d directory_size=%d buckets=%d\n", global_depth, dir_size, bucket_count);
    for (int b = 0; b < bucket_count; b++) {
        printf("  bucket %d (local_depth=%d):", b + 1, buckets[b].local_depth);
        for (int i = 0; i < buckets[b].n; i++)
            printf(" %d", buckets[b].keys[i]);
        printf("\n");
    }
    printf("\n");
}

int main(void) {
    const int normal_keys[] = {9, 20, 15, 3, 25, 12, 7, 30, 1, 18};
    run_scenario("normal: capacity=2, 10 keys", 2, normal_keys, 10);

    const int hard_keys[] = {1, 3, 5, 7, 9, 11, 13, 17, 19, 21, 23, 25};
    run_scenario("hard: capacity=2, 12 odd numbers", 2, hard_keys, 12);

    const int skewed_keys[] = {8, 24, 40, 56, 72, 88, 104, 120, 136, 152};
    run_scenario("edge: all keys are 8 mod 16 -- cascading splits", 2, skewed_keys, 10);

    const int never_keys[] = {41, 7, 23, 58, 14, 33, 2, 47, 19, 36};
    run_scenario("edge: capacity=10, never splits", 10, never_keys, 10);
    return 0;
}
