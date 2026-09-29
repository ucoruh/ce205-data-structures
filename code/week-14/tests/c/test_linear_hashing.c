#define main program_main
#include "../../c/linear_hashing.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* address: level 0, n=0 is a plain modulo */
    CHECK_EQ_INT(address(7, 4, 0, 0), 3);
    CHECK_EQ_INT(address(8, 4, 0, 0), 0);
    CHECK_EQ_INT(address(11, 4, 0, 0), 3);

    /* address: a bucket already split this round (a < n) bumps to the next level */
    CHECK_EQ_INT(address(1, 4, 0, 2), 1);   /* 1 % 4 = 1, 1 >= n=2: stays */
    CHECK_EQ_INT(address(0, 4, 0, 2), 0);   /* 0 % 4 = 0 < n=2: bump to 0 % 8 = 0 */
    CHECK_EQ_INT(address(4, 4, 0, 2), 4);   /* 4 % 4 = 0 < n=2: bump to 4 % 8 = 4 */

    /* insert_key: fills two buckets to capacity without any overflow */
    static int buckets[MAX_BUCKETS][MAX_KEYS];
    int bucket_len[MAX_BUCKETS] = {0};
    int level = 0, n = 0;
    insert_key(buckets, bucket_len, 4, 2, &level, &n, 1);  /* addr 1 */
    insert_key(buckets, bucket_len, 4, 2, &level, &n, 5);  /* addr 1 too */
    CHECK_EQ_INT(bucket_len[1], 2);
    CHECK_EQ_INT(level, 0);
    CHECK_EQ_INT(n, 0);

    /* insert_key: a 3rd key into the same bucket overflows it and splits bucket n (=0), not bucket 1 */
    insert_key(buckets, bucket_len, 4, 2, &level, &n, 9);  /* addr 1 again: now 3 in bucket 1 */
    CHECK_EQ_INT(bucket_len[1], 3);       /* the overflowing bucket itself is untouched */
    CHECK_EQ_INT(n, 1);                    /* bucket 0 (not bucket 1) was the one split */
    int total = 0;
    for (int b = 0; b < 5; b++)
        total += bucket_len[b];
    CHECK_EQ_INT(total, 3);                /* no key lost */

    /* one-per-bucket: N0=10, 10 distinct keys mod 10, capacity=2: never overflows */
    static int b2[MAX_BUCKETS][MAX_KEYS];
    int len2[MAX_BUCKETS] = {0};
    int lvl2 = 0, n2 = 0;
    int one_keys[] = {0, 11, 22, 33, 44, 55, 66, 77, 88, 99};
    for (int i = 0; i < 10; i++)
        insert_key(b2, len2, 10, 2, &lvl2, &n2, one_keys[i]);
    CHECK_EQ_INT(lvl2, 0);
    CHECK_EQ_INT(n2, 0);
    for (int b = 0; b < 10; b++)
        CHECK_EQ_INT(len2[b], 1);

    /* tight: N0=2, capacity=1 forces very frequent splitting; every key still ends up somewhere */
    static int b3[MAX_BUCKETS][MAX_KEYS];
    int len3[MAX_BUCKETS] = {0};
    int lvl3 = 0, n3 = 0;
    int tight_keys[] = {5, 3, 8, 2, 7, 4, 9, 6, 11, 10};
    for (int i = 0; i < 10; i++)
        insert_key(b3, len3, 2, 1, &lvl3, &n3, tight_keys[i]);
    int total_buckets3 = 2 * pow2i(lvl3) + n3;
    int total3 = 0;
    for (int b = 0; b < total_buckets3; b++)
        total3 += len3[b];
    CHECK_EQ_INT(total3, 10);
    CHECK(lvl3 >= 1); /* capacity=1 with 10 keys must trigger at least one full round */

    TEST_SUMMARY();
}
