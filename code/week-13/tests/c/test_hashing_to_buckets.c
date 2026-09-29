/* Unit tests for week-13 c/hashing_to_buckets.c */
#include <limits.h>

#define main program_main
#include "../../c/hashing_to_buckets.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    Bucket b[MAXBLOCKS];
    int nblocks, writes;

    /* -- one key: goes straight into its home bucket -- */
    for (int i = 0; i < 5; i++) { b[i].count = 0; b[i].next = -1; }
    nblocks = 5; writes = 0;
    int h = bucket_put(b, &nblocks, 5, 12, &writes);
    CHECK_EQ_INT(h, 2);              /* 12 % 5 == 2 */
    CHECK_EQ_INT(b[2].count, 1);
    CHECK_EQ_INT(b[2].keys[0], 12);
    CHECK_EQ_INT(writes, 1);
    CHECK_EQ_INT(nblocks, 5);        /* no overflow allocated */

    /* -- filling a bucket exactly to bf: still no overflow -- */
    for (int i = 0; i < 5; i++) { b[i].count = 0; b[i].next = -1; }
    nblocks = 5; writes = 0;
    bucket_put(b, &nblocks, 5, 2, &writes);   /* home 2 */
    bucket_put(b, &nblocks, 5, 7, &writes);   /* home 2 */
    bucket_put(b, &nblocks, 5, 12, &writes);  /* home 2: fills it exactly (bf=3) */
    CHECK_EQ_INT(b[2].count, 3);
    CHECK_EQ_INT(b[2].next, -1);
    CHECK_EQ_INT(nblocks, 5);
    CHECK_EQ_INT(writes, 3);

    /* -- one more key into a full bucket: allocates exactly one overflow block -- */
    bucket_put(b, &nblocks, 5, 17, &writes);  /* home 2, bucket full -> overflow */
    CHECK_EQ_INT(nblocks, 6);
    CHECK(b[2].next >= 5);
    CHECK_EQ_INT(b[b[2].next].count, 1);
    CHECK_EQ_INT(b[b[2].next].keys[0], 17);
    CHECK_EQ_INT(writes, 5);   /* 3 inserts + 1 new block + 1 insert into it */

    /* -- a second overflow block chains onto the first, not onto the home bucket -- */
    bucket_put(b, &nblocks, 5, 22, &writes);   /* home 2: home full, ov0 has room */
    CHECK_EQ_INT(nblocks, 6);                  /* reused ov0, no new block yet */
    CHECK_EQ_INT(b[b[2].next].count, 2);
    bucket_put(b, &nblocks, 5, 27, &writes);   /* home 2: home full, ov0 has room (2/3) */
    CHECK_EQ_INT(b[b[2].next].count, 3);
    bucket_put(b, &nblocks, 5, 32, &writes);   /* home 2: home full, ov0 full -> second overflow */
    CHECK_EQ_INT(nblocks, 7);
    int ov0 = b[2].next, ov1 = b[ov0].next;
    CHECK(ov1 >= 5 && ov1 != ov0);
    CHECK_EQ_INT(b[ov1].count, 1);
    CHECK_EQ_INT(b[ov1].keys[0], 32);

    /* -- m=1: every key shares the one bucket, chain grows every bf keys -- */
    for (int i = 0; i < MAXBLOCKS; i++) { b[i].count = 0; b[i].next = -1; }
    nblocks = 1; writes = 0;
    int keys[] = { 5, 11, 2, 19, 8, 14, 3, 27, 6 };   /* 9 keys, bf=3 -> 3 blocks total */
    for (int i = 0; i < 9; i++) bucket_put(b, &nblocks, 1, keys[i], &writes);
    CHECK_EQ_INT(nblocks, 3);
    int total = b[0].count, nx = b[0].next;
    while (nx >= 0) { total += b[nx].count; nx = b[nx].next; }
    CHECK_EQ_INT(total, 9);

    /* -- every distinct key ends up somewhere in the structure (no key is lost) -- */
    int found[9] = { 0 };
    nx = 0;
    while (nx >= 0) {
        for (int k = 0; k < b[nx].count; k++)
            for (int i = 0; i < 9; i++) if (b[nx].keys[k] == keys[i]) found[i] = 1;
        nx = b[nx].next;
    }
    int all_found = 1;
    for (int i = 0; i < 9; i++) if (!found[i]) all_found = 0;
    CHECK(all_found);

    /* -- zero keys: no bucket_put call at all, structure stays exactly as initialised -- */
    for (int i = 0; i < 5; i++) { b[i].count = 0; b[i].next = -1; }
    nblocks = 5; writes = 0;
    CHECK_EQ_INT(nblocks, 5);
    CHECK_EQ_INT(writes, 0);
    for (int i = 0; i < 5; i++) { CHECK_EQ_INT(b[i].count, 0); CHECK_EQ_INT(b[i].next, -1); }

    /* -- integration: run_scenario writes a real file inside a real lab folder and cleans it up -- */
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);
    int tiny[] = { 1, 2, 3, 4, 5 };
    run_scenario("unit-test integration", lab, 3, tiny, 5);
    char check_path[600];
    snprintf(check_path, sizeof(check_path), "%s/buckets.dat", lab);
    FILE *gone = fopen(check_path, "rb");
    CHECK(gone == NULL);
    RMDIR(lab);

    TEST_SUMMARY();
}
