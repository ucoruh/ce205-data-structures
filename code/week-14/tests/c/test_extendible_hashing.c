#define main program_main
#include "../../c/extendible_hashing.c"
#undef main
#include "../../../test_check.h"

/* Independent structural invariant of extendible hashing (textbook fact, true for ANY correct
 * implementation, not derived from this program's output): the number of directory slots that
 * point at bucket b must be exactly 2^(global_depth - local_depth[b]), and no local_depth may
 * exceed global_depth. */
static void check_dir_invariant(const int dir[], int dir_size, const Bucket buckets[],
                                 int bucket_count, int global_depth) {
    CHECK_EQ_INT(dir_size, 1 << global_depth);
    for (int b = 0; b < bucket_count; b++) {
        CHECK(buckets[b].local_depth <= global_depth);
        int count = 0;
        for (int i = 0; i < dir_size; i++)
            if (dir[i] == b)
                count++;
        CHECK_EQ_INT(count, 1 << (global_depth - buckets[b].local_depth));
    }
    /* every bucket has at least one directory slot pointing to it (proven above: a split
     * always hands its new bucket >=1 slot), so bucket_count can never exceed dir_size */
    CHECK(bucket_count <= dir_size);
}

/* Independent lookup: scans every bucket directly (does not use the directory routing at all),
 * so it can catch a key that insert_key placed in the wrong bucket. Returns how many copies of
 * `key` are present -- should be exactly 1 for every key that was inserted once. */
static int count_key(const Bucket buckets[], int bucket_count, int key) {
    int hits = 0;
    for (int b = 0; b < bucket_count; b++)
        for (int i = 0; i < buckets[b].n; i++)
            if (buckets[b].keys[i] == key)
                hits++;
    return hits;
}

int main(void) {
    /* last_bits: depth 0 is always 0, regardless of the key */
    CHECK_EQ_INT(last_bits(0, 0), 0);
    CHECK_EQ_INT(last_bits(255, 0), 0);
    CHECK_EQ_INT(last_bits(-7, 0), 0);

    /* last_bits: extracts exactly the low-order bits */
    CHECK_EQ_INT(last_bits(0b1011, 1), 1);
    CHECK_EQ_INT(last_bits(0b1011, 2), 3);
    CHECK_EQ_INT(last_bits(0b1011, 3), 3);
    CHECK_EQ_INT(last_bits(0b1011, 4), 11);
    CHECK_EQ_INT(last_bits(8, 3), 0);  /* 8 = 1000b, low 3 bits are 0 */
    CHECK_EQ_INT(last_bits(8, 4), 8);

    /* insert_key: capacity=10, 10 distinct keys never overflow: single bucket the whole time */
    Bucket b1[MAX_BUCKETS];
    int bc1 = 1;
    b1[0].n = 0; b1[0].local_depth = 0;
    int dir1[MAX_DIR] = {0};
    int ds1 = 1, gd1 = 0;
    int never_keys[] = {41, 7, 23, 58, 14, 33, 2, 47, 19, 36};
    for (int i = 0; i < 10; i++)
        insert_key(b1, &bc1, dir1, &ds1, &gd1, 10, never_keys[i]);
    CHECK_EQ_INT(bc1, 1);
    CHECK_EQ_INT(gd1, 0);
    CHECK_EQ_INT(ds1, 1);
    CHECK_EQ_INT(b1[0].n, 10);
    check_dir_invariant(dir1, ds1, b1, bc1, gd1);
    for (int i = 0; i < 10; i++)
        CHECK_EQ_INT(count_key(b1, bc1, never_keys[i]), 1);

    /* insert_key: capacity=2, exactly 2 keys (both odd: share bit0=1) fit without any split */
    Bucket b2[MAX_BUCKETS];
    int bc2 = 1;
    b2[0].n = 0; b2[0].local_depth = 0;
    int dir2[MAX_DIR] = {0};
    int ds2 = 1, gd2 = 0;
    insert_key(b2, &bc2, dir2, &ds2, &gd2, 2, 1);
    insert_key(b2, &bc2, dir2, &ds2, &gd2, 2, 3);
    CHECK_EQ_INT(bc2, 1);
    CHECK_EQ_INT(gd2, 0);
    CHECK_EQ_INT(b2[0].n, 2);

    /* insert_key: a 3rd key (even: bit0=0) forces exactly one clean split
     * (local_depth==global_depth -> directory doubles once, bit0 separates 1,3 from 2) */
    insert_key(b2, &bc2, dir2, &ds2, &gd2, 2, 2);
    CHECK_EQ_INT(gd2, 1);
    CHECK_EQ_INT(ds2, 2);
    CHECK_EQ_INT(bc2, 2);
    /* every key inserted so far is still present somewhere, none lost or duplicated */
    int total = 0;
    for (int b = 0; b < bc2; b++)
        total += b2[b].n;
    CHECK_EQ_INT(total, 3);
    check_dir_invariant(dir2, ds2, b2, bc2, gd2);
    CHECK_EQ_INT(count_key(b2, bc2, 1), 1);
    CHECK_EQ_INT(count_key(b2, bc2, 2), 1);
    CHECK_EQ_INT(count_key(b2, bc2, 3), 1);

    /* insert_key: the skewed preset keeps splitting without losing any key */
    Bucket b3[MAX_BUCKETS];
    int bc3 = 1;
    b3[0].n = 0; b3[0].local_depth = 0;
    int dir3[MAX_DIR] = {0};
    int ds3 = 1, gd3 = 0;
    int skewed_keys[] = {8, 24, 40, 56, 72, 88, 104, 120, 136, 152};
    for (int i = 0; i < 10; i++)
        insert_key(b3, &bc3, dir3, &ds3, &gd3, 2, skewed_keys[i]);
    int total3 = 0;
    for (int b = 0; b < bc3; b++)
        total3 += b3[b].n;
    CHECK_EQ_INT(total3, 10);
    CHECK(gd3 >= 4); /* keys share bits 0..3 (all are 8 mod 16): needs real depth to separate */
    /* every directory entry still points at a valid bucket */
    for (int i = 0; i < ds3; i++) {
        CHECK(dir3[i] >= 0);
        CHECK(dir3[i] < bc3);
    }
    check_dir_invariant(dir3, ds3, b3, bc3, gd3);
    for (int i = 0; i < 10; i++)
        CHECK_EQ_INT(count_key(b3, bc3, skewed_keys[i]), 1);

    /* insert_key: directory doubling MANY times in a row. All 10 keys share their lowest 5
     * bits (every one is 5 mod 32), so by the pigeonhole principle no global_depth <= 5 can
     * ever separate them -- last_bits(key, depth<=5) is identical for all ten, so they would
     * all still route to one bucket and keep overflowing capacity=2. The directory must
     * therefore double at least 6 times (size 1 -> 2 -> 4 -> ... -> 64, global_depth >= 6)
     * before the 6th bit (the first bit on which these values actually differ) can separate
     * them. This bound comes from the key values themselves, not from running the program. */
    Bucket b4[MAX_BUCKETS];
    int bc4 = 1;
    b4[0].n = 0; b4[0].local_depth = 0;
    int dir4[MAX_DIR] = {0};
    int ds4 = 1, gd4 = 0;
    int mod32_keys[] = {5, 37, 69, 101, 133, 165, 197, 229, 261, 293};
    for (int i = 0; i < 10; i++)
        CHECK_EQ_INT(mod32_keys[i] % 32, 5); /* sanity check on the fixture itself */
    for (int i = 0; i < 10; i++)
        insert_key(b4, &bc4, dir4, &ds4, &gd4, 2, mod32_keys[i]);
    CHECK(gd4 >= 6);
    CHECK_EQ_INT(ds4, 1 << gd4);
    int total4 = 0;
    for (int b = 0; b < bc4; b++)
        total4 += b4[b].n;
    CHECK_EQ_INT(total4, 10);
    check_dir_invariant(dir4, ds4, b4, bc4, gd4);
    for (int i = 0; i < 10; i++)
        CHECK_EQ_INT(count_key(b4, bc4, mod32_keys[i]), 1);

    /* insert_key: capacity=1, 8 distinct keys covering EVERY 3-bit pattern (0..7). Pigeonhole:
     * any global_depth <= 2 gives at most 4 directory slots for these 8 distinct values, so at
     * least two of them must always collide in the same bucket -- with capacity=1 that is an
     * immediate overflow, so global_depth must reach at least 3 (dir_size >= 8). This holds for
     * ANY insertion order, purely from counting the 8 distinct keys against <=4 slots. */
    Bucket b5[MAX_BUCKETS];
    int bc5 = 1;
    b5[0].n = 0; b5[0].local_depth = 0;
    int dir5[MAX_DIR] = {0};
    int ds5 = 1, gd5 = 0;
    int cap1_keys[] = {0, 1, 2, 3, 4, 5, 6, 7};
    for (int i = 0; i < 8; i++)
        insert_key(b5, &bc5, dir5, &ds5, &gd5, 1, cap1_keys[i]);
    CHECK(gd5 >= 3);
    CHECK_EQ_INT(ds5, 1 << gd5);
    int total5 = 0;
    for (int b = 0; b < bc5; b++) {
        CHECK(b5[b].n <= 1); /* capacity=1: never more than one key per bucket */
        total5 += b5[b].n;
    }
    CHECK_EQ_INT(total5, 8);
    check_dir_invariant(dir5, ds5, b5, bc5, gd5);
    for (int i = 0; i < 8; i++)
        CHECK_EQ_INT(count_key(b5, bc5, cap1_keys[i]), 1);

    TEST_SUMMARY();
}
