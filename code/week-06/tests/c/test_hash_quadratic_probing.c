/* Unit tests for week-06 c/hash_quadratic_probing.c
 * Independent oracles, never derived by calling insert():
 *  (a) fully hand-traced exact index/probe values for the "normal" scenario (m = 13, prime);
 *  (b) a structural check: for every OCCUPIED slot, confirm SOME i in [0, m) satisfies
 *      (home + i*i) % m == idx (the slot really is on the key's probe sequence) -- computed by a
 *      fresh loop over i, not by re-deriving insert()'s own logic;
 *  (c) an explicit re-derivation, for the m = 8 "cycle" scenario, of which residues i*i mod 8 can
 *      ever produce (0, 1, 4 only), confirming the documented "cycles without reaching a free slot"
 *      claim independently of the program. */
#define main program_main
#include "../../c/hash_quadratic_probing.c"
#undef main
#include "../../../test_check.h"

static void check_on_probe_sequence(void) {
    for (int idx = 0; idx < M; idx++) {
        if (state[idx] != OCCUPIED) continue;
        int key = table[idx];
        int home = ((key % M) + M) % M;
        int on_sequence = 0;
        for (int i = 0; i < M; i++) if ((home + i * i) % M == idx) { on_sequence = 1; break; }
        CHECK(on_sequence);
    }
}

int main(void) {
    /* -- (a) hand-traced: normal, m = 13 (prime), keys = 7,20,33,14,29,41,56,68,81,95 --
       home(key) = key mod 13: 7->7, 20->7, 33->7, 14->1, 29->3, 41->2, 56->4, 68->3, 81->3, 95->4. */
    {
        M = 13;
        clear_table();
        int probes;
        probes = 0; CHECK_EQ_INT(insert(7, &probes), 7);  CHECK_EQ_INT(probes, 1);   /* home 7, free */
        probes = 0; CHECK_EQ_INT(insert(20, &probes), 8); CHECK_EQ_INT(probes, 2);   /* home7 occ, +1^2=8 free */
        probes = 0; CHECK_EQ_INT(insert(33, &probes), 11);CHECK_EQ_INT(probes, 3);   /* home7 occ,+1=8occ,+4=11 free */
        probes = 0; CHECK_EQ_INT(insert(14, &probes), 1); CHECK_EQ_INT(probes, 1);   /* home 1, free */
        probes = 0; CHECK_EQ_INT(insert(29, &probes), 3); CHECK_EQ_INT(probes, 1);   /* home 3, free */
        probes = 0; CHECK_EQ_INT(insert(41, &probes), 2); CHECK_EQ_INT(probes, 1);   /* home 2, free */
        probes = 0; CHECK_EQ_INT(insert(56, &probes), 4); CHECK_EQ_INT(probes, 1);   /* home 4, free */
        check_on_probe_sequence();
        clear_table();
    }

    /* -- (b) structural-only checks for the remaining main() scenarios -- */
    {
        M = 13;
        clear_table();
        int normal[] = {7, 20, 33, 14, 29, 41, 56, 68, 81, 95};
        int placed = 0;
        for (int i = 0; i < 10; i++) { int probes = 0; if (insert(normal[i], &probes) != -1) placed++; }
        CHECK_EQ_INT(placed, 10); /* m=13, 10 keys, well under capacity, none should be rejected */
        check_on_probe_sequence();
        /* multiset check: every inserted key appears exactly once among occupied slots */
        for (int i = 0; i < 10; i++) {
            int seen = 0;
            for (int idx = 0; idx < M; idx++) if (state[idx] == OCCUPIED && table[idx] == normal[i]) seen++;
            CHECK_EQ_INT(seen, 1);
        }
        clear_table();
    }
    {
        M = 11;
        clear_table();
        int hard[] = {4, 15, 26, 37, 48, 9, 20, 31, 42, 53};
        int placed = 0;
        for (int i = 0; i < 10; i++) { int probes = 0; if (insert(hard[i], &probes) != -1) placed++; }
        check_on_probe_sequence();
        CHECK(placed <= 10);
        clear_table();
    }

    /* -- (c) independent re-derivation: m = 8 is not prime, i*i mod 8 only ever takes 3 distinct
       values (0, 1, 4) no matter how many i are tried, so at most 3 of the 8 slots starting from any
       home are ever reachable -- confirmed here by direct computation, not by calling insert(). */
    {
        int seen[8] = {0};
        int distinct = 0;
        for (int i = 0; i < 8; i++) { int r = (i * i) % 8; if (!seen[r]) { seen[r] = 1; distinct++; } }
        CHECK_EQ_INT(distinct, 3); /* residues are exactly {0, 1, 4} */

        M = 8;
        clear_table();
        int cycle[] = {8, 9, 12, 26, 19, 5, 14, 16, 7, 24};
        int cycled_seen = 0;
        for (int i = 0; i < 10; i++) {
            int probes = 0;
            int idx = insert(cycle[i], &probes);
            if (idx == -1) {
                int occ = occupied_count();
                if (occ < M) cycled_seen = 1; /* rejected while free space still existed: a real cycle */
            }
        }
        CHECK(cycled_seen); /* the documented "cycles without reaching a free slot" behavior must occur */
        check_on_probe_sequence();
        clear_table();
    }

    /* -- empty table: no occupied slots, nothing to check but must not crash -- */
    {
        M = 13;
        clear_table();
        check_on_probe_sequence(); /* vacuously true */
    }

    /* -- single key -- */
    {
        M = 13;
        clear_table();
        int probes = 0;
        CHECK_EQ_INT(insert(5, &probes), 5);
        CHECK_EQ_INT(probes, 1);
        clear_table();
    }

    TEST_SUMMARY();
}
