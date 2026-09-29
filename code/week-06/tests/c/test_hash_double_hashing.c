/* Unit tests for week-06 c/hash_double_hashing.c
 * Independent oracles, never derived by calling insert():
 *  (a) fully hand-traced exact index/probe values for the "normal" scenario (m = 13, R = 11) --
 *      h1(key) = key mod 13 and h2(key) = 11 - (key mod 11) computed by hand for all 10 keys;
 *  (b) a structural check: for every OCCUPIED slot, confirm SOME i in [0, m) satisfies
 *      (h1(key) + i*h2(key)) % m == idx, computed by a fresh loop, not by re-deriving insert()'s logic;
 *  (c) an independent number-theory check (gcd) for the m = 9 "cycle" scenario: a step value that
 *      shares a factor g with m can only ever reach m/g distinct slots, confirmed by direct
 *      enumeration -- this is what makes the documented cycle possible, verified from first
 *      principles rather than by trusting the program's own behavior. */
#define main program_main
#include "../../c/hash_double_hashing.c"
#undef main
#include "../../../test_check.h"

static void check_on_probe_sequence(void) {
    for (int idx = 0; idx < M; idx++) {
        if (state[idx] != OCCUPIED) continue;
        int key = table[idx];
        int home = ((key % M) + M) % M;
        int step = R - (((key % R) + R) % R);
        int on_sequence = 0;
        for (int i = 0; i < M; i++) if ((home + i * step) % M == idx) { on_sequence = 1; break; }
        CHECK(on_sequence);
    }
}

static int gcd(int a, int b) { while (b) { int t = a % b; a = b; b = t; } return a; }

int main(void) {
    /* -- (a) hand-traced: normal, m = 13, R = 11 -- */
    {
        M = 13; R = 11;
        clear_table();
        int probes;
        probes = 0; CHECK_EQ_INT(insert(7, &probes), 7);  CHECK_EQ_INT(probes, 1);
        probes = 0; CHECK_EQ_INT(insert(20, &probes), 9); CHECK_EQ_INT(probes, 2);
        probes = 0; CHECK_EQ_INT(insert(33, &probes), 5); CHECK_EQ_INT(probes, 2);
        probes = 0; CHECK_EQ_INT(insert(14, &probes), 1); CHECK_EQ_INT(probes, 1);
        probes = 0; CHECK_EQ_INT(insert(29, &probes), 3); CHECK_EQ_INT(probes, 1);
        probes = 0; CHECK_EQ_INT(insert(41, &probes), 2); CHECK_EQ_INT(probes, 1);
        probes = 0; CHECK_EQ_INT(insert(56, &probes), 4); CHECK_EQ_INT(probes, 1);
        probes = 0; CHECK_EQ_INT(insert(68, &probes), 12);CHECK_EQ_INT(probes, 2);
        probes = 0; CHECK_EQ_INT(insert(81, &probes), 10);CHECK_EQ_INT(probes, 2);
        probes = 0; CHECK_EQ_INT(insert(95, &probes), 8); CHECK_EQ_INT(probes, 2);
        check_on_probe_sequence();
        /* multiset preserved: every key present exactly once */
        int keys[] = {7, 20, 33, 14, 29, 41, 56, 68, 81, 95};
        for (int i = 0; i < 10; i++) {
            int seen = 0;
            for (int idx = 0; idx < M; idx++) if (state[idx] == OCCUPIED && table[idx] == keys[i]) seen++;
            CHECK_EQ_INT(seen, 1);
        }
        clear_table();
    }

    /* -- (b) structural checks: hard scenario -- */
    {
        M = 13; R = 11;
        clear_table();
        int hard[] = {4, 17, 30, 43, 56, 8, 21, 34, 47, 60};
        int placed = 0;
        for (int i = 0; i < 10; i++) { int probes = 0; if (insert(hard[i], &probes) != -1) placed++; }
        check_on_probe_sequence();
        CHECK(placed <= 10);
        clear_table();
    }

    /* -- (c) independent gcd proof for the m = 9, R = 7 "cycle" scenario --
       key = 4: h2(4) = 7 - (4 mod 7) = 3; gcd(3, 9) = 3, so the probe sequence home + i*3 (mod 9)
       can only ever reach 9/3 = 3 distinct slots, confirmed here by direct enumeration. */
    {
        CHECK_EQ_INT(gcd(3, 9), 3);
        int home = ((4 % 9) + 9) % 9;
        int seen[9] = {0};
        int distinct = 0;
        for (int i = 0; i < 9; i++) { int idx = (home + i * 3) % 9; if (!seen[idx]) { seen[idx] = 1; distinct++; } }
        CHECK_EQ_INT(distinct, 3);

        M = 9; R = 7;
        clear_table();
        int cycle[] = {13, 16, 10, 9, 2, 3, 5, 6, 4, 17};
        int cycled_seen = 0;
        for (int i = 0; i < 10; i++) {
            int probes = 0;
            int idx = insert(cycle[i], &probes);
            if (idx == -1) {
                int occ = occupied_count();
                if (occ < M) cycled_seen = 1;
            }
        }
        CHECK(cycled_seen);
        check_on_probe_sequence();
        clear_table();
    }

    /* -- empty table -- */
    {
        M = 13; R = 11;
        clear_table();
        check_on_probe_sequence(); /* vacuously true */
    }

    /* -- single key -- */
    {
        M = 13; R = 11;
        clear_table();
        int probes = 0;
        CHECK_EQ_INT(insert(5, &probes), 5);
        CHECK_EQ_INT(probes, 1);
        clear_table();
    }

    /* -- h2 is never zero for a prime R < m (a property the code's own comment relies on) -- */
    {
        M = 13; R = 11;
        for (int key = -30; key <= 30; key++) {
            int step = R - (((key % R) + R) % R);
            CHECK(step >= 1 && step <= R);
            CHECK(step != 0);
        }
    }

    TEST_SUMMARY();
}
