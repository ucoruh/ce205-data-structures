/* Unit tests for week-06 c/rehashing.c
 * Independent oracles, never derived from calling insert()/rehash():
 *  (a) is_prime()/next_prime() checked against hand-picked primes/composites and hand-derived
 *      next-prime values;
 *  (b) the "normal" scenario's every insert() index hand-traced by computing key%m (and, for
 *      collisions, the linear-probing sequence) directly on paper -- including the rehash trigger
 *      point (n/m > threshold) and the new table size next_prime(2*m);
 *  (c) a structural post-condition checker (multiset of keys preserved, every occupied key reachable
 *      by linear probing from its own home in the CURRENT table) applied to every scenario -- a
 *      property any correct rehashing table must satisfy regardless of the exact growth schedule. */
#define main program_main
#include "../../c/rehashing.c"
#undef main
#include "../../../test_check.h"

static void check_reachable_and_multiset(const int keys[], int n_keys) {
    CHECK_EQ_INT(n, n_keys);
    int occ_count = 0;
    for (int idx = 0; idx < m; idx++) if (state[idx] == OCCUPIED) occ_count++;
    CHECK_EQ_INT(occ_count, n_keys);
    /* every occupied key reachable from its own home */
    for (int idx = 0; idx < m; idx++) {
        if (state[idx] != OCCUPIED) continue;
        int key = table[idx];
        int home = ((key % m) + m) % m;
        int found = 0, p = home;
        for (int i = 0; i < m; i++) {
            if (p == idx) { found = 1; break; }
            if (state[p] == EMPTY) break;
            p = (p + 1) % m;
        }
        CHECK(found);
    }
    /* multiset preserved: every original key present exactly once */
    for (int i = 0; i < n_keys; i++) {
        int seen = 0;
        for (int idx = 0; idx < m; idx++) if (state[idx] == OCCUPIED && table[idx] == keys[i]) seen++;
        CHECK_EQ_INT(seen, 1);
    }
}

int main(void) {
    /* -- (a) is_prime -- */
    CHECK(!is_prime(-5));
    CHECK(!is_prime(0));
    CHECK(!is_prime(1));
    CHECK(is_prime(2));
    CHECK(is_prime(3));
    CHECK(!is_prime(4));
    CHECK(is_prime(5));
    CHECK(!is_prime(9));
    CHECK(is_prime(13));
    CHECK(!is_prime(21));   /* 3 * 7 */
    CHECK(is_prime(29));
    CHECK(is_prime(97));
    CHECK(!is_prime(100));

    /* -- (a) next_prime -- */
    CHECK_EQ_INT(next_prime(1), 2);
    CHECK_EQ_INT(next_prime(2), 2);
    CHECK_EQ_INT(next_prime(4), 5);
    CHECK_EQ_INT(next_prime(12), 13);
    CHECK_EQ_INT(next_prime(14), 17);
    CHECK_EQ_INT(next_prime(24), 29);
    CHECK_EQ_INT(next_prime(25), 29);

    /* -- (b) hand-traced: normal scenario, m0 = 6, threshold = 0.8 --
       15,22,8,31 land at their own homes (3,4,2,1); 44 (home 2) collides with 8,15,22 in a row and
       lands at 5 (probes to 2,3,4 all occupied, 5 free) -- n/m = 5/6 = 0.833 > 0.8, rehash to
       next_prime(12) = 13. Reinsertion walks the OLD table in index order (1,2,3,4,5 -> keys
       31,8,15,22,44), so 31->5, 8->8, 15->2, 22->9, 44 collides with 31's new slot 5 and lands at 6. */
    {
        threshold = 0.8; m = 6; n = 0;
        state = calloc(m, sizeof(Slot));
        table = malloc(m * sizeof(int));
        CHECK_EQ_INT(insert_into(state, table, m, 15), 3);
        n++;
        CHECK_EQ_INT(insert_into(state, table, m, 22), 4);
        n++;
        CHECK_EQ_INT(insert_into(state, table, m, 8), 2);
        n++;
        CHECK_EQ_INT(insert_into(state, table, m, 31), 1);
        n++;
        CHECK_EQ_INT(insert_into(state, table, m, 44), 5); /* collision chain 2,3,4 occupied -> 5 */
        n++;
        CHECK((double) n / m > threshold); /* 5/6 = 0.833 > 0.8: rehash must trigger here */
        rehash();
        CHECK_EQ_INT(m, 13); /* next_prime(12) */
        /* re-verify the post-rehash placements by hand */
        int idx31 = -1, idx8 = -1, idx15 = -1, idx22 = -1, idx44 = -1;
        for (int i = 0; i < m; i++) {
            if (state[i] != OCCUPIED) continue;
            if (table[i] == 31) idx31 = i;
            if (table[i] == 8) idx8 = i;
            if (table[i] == 15) idx15 = i;
            if (table[i] == 22) idx22 = i;
            if (table[i] == 44) idx44 = i;
        }
        CHECK_EQ_INT(idx31, 5);
        CHECK_EQ_INT(idx8, 8);
        CHECK_EQ_INT(idx15, 2);
        CHECK_EQ_INT(idx22, 9);
        CHECK_EQ_INT(idx44, 6);
        free(state); free(table);
    }

    /* -- (b continued) run the FULL normal scenario through insert() (the public entry point used by
       main()) and cross-check with the structural oracle -- */
    {
        int normal[] = {15, 22, 8, 31, 44, 3, 27, 56, 19, 40};
        threshold = 0.8; m = 6; n = 0;
        state = calloc(m, sizeof(Slot));
        table = malloc(m * sizeof(int));
        for (int i = 0; i < 10; i++) insert(normal[i]);
        CHECK_EQ_INT(m, 13); /* grows exactly once for this scenario (matches hand trace above) */
        check_reachable_and_multiset(normal, 10);
        free(state); free(table);
    }

    /* -- (c) structural checks: hard scenario (keys cluster at the same home) -- */
    {
        int hard[] = {12, 18, 24, 30, 36, 7, 13, 19, 25, 31};
        threshold = 0.8; m = 6; n = 0;
        state = calloc(m, sizeof(Slot));
        table = malloc(m * sizeof(int));
        for (int i = 0; i < 10; i++) insert(hard[i]);
        check_reachable_and_multiset(hard, 10);
        free(state); free(table);
    }

    /* -- (c) structural checks: edge scenario, m0 = 2, grows twice in a row -- */
    {
        int double_rehash[] = {5, 12, 19, 26, 9, 16};
        threshold = 0.8; m = 2; n = 0;
        state = calloc(m, sizeof(Slot));
        table = malloc(m * sizeof(int));
        for (int i = 0; i < 6; i++) insert(double_rehash[i]);
        CHECK(m > 2); /* must have grown at least once */
        check_reachable_and_multiset(double_rehash, 6);
        free(state); free(table);
    }

    /* -- edge: a single insert, no rehash triggered (n/m = 1/6 well under threshold) -- */
    {
        threshold = 0.8; m = 6; n = 0;
        state = calloc(m, sizeof(Slot));
        table = malloc(m * sizeof(int));
        insert(42);
        CHECK_EQ_INT(m, 6); /* unchanged: 1/6 = 0.167, no rehash */
        CHECK_EQ_INT(n, 1);
        int single[] = {42};
        check_reachable_and_multiset(single, 1);
        free(state); free(table);
    }

    /* -- edge: zero inserts (empty), must not crash and must not rehash -- */
    {
        threshold = 0.8; m = 6; n = 0;
        state = calloc(m, sizeof(Slot));
        table = malloc(m * sizeof(int));
        CHECK_EQ_INT(m, 6);
        CHECK_EQ_INT(n, 0);
        free(state); free(table);
    }

    TEST_SUMMARY();
}
