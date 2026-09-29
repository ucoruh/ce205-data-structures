/* Unit tests for week-06 c/hash_chaining.c
 * Independent oracle: a from-scratch per-bucket mirror array (own insertion-order bookkeeping, own
 * hash formula spelled out again, own most-recent-first search walk) -- never calls insert()/search()
 * or h() to derive its own expectation; only the RESULT of calling insert()/search() is checked
 * against it. */
#define main program_main
#include "../../c/hash_chaining.c"
#undef main
#include "../../../test_check.h"

#define MIR_MAX 64
static int mir_keys[MAX_M][MIR_MAX];
static int mir_count[MAX_M];

static void mir_clear(void) { for (int i = 0; i < MAX_M; i++) mir_count[i] = 0; }

static void mir_insert(int key, int m) {
    int idx = ((key % m) + m) % m;
    mir_keys[idx][mir_count[idx]++] = key;
}

/* most-recent-first walk: mirrors that insert() always adds at the head of the chain */
static int mir_search(int key, int m, int *probes) {
    int idx = ((key % m) + m) % m;
    int p = 0;
    for (int i = mir_count[idx] - 1; i >= 0; i--) {
        p++;
        if (mir_keys[idx][i] == key) { *probes = p; return 1; }
    }
    *probes = p;
    return 0;
}

typedef struct { int is_search; int value; } TOp;

static void run_and_check(const char *label, int m, TOp ops[], int n) {
    (void) label;
    M = m;
    clear_table();
    mir_clear();
    for (int i = 0; i < n; i++) {
        if (!ops[i].is_search) {
            insert(ops[i].value);
            mir_insert(ops[i].value, m);
        } else {
            int probes = -1, mprobes = -1;
            int found = search(ops[i].value, &probes);
            int mfound = mir_search(ops[i].value, m, &mprobes);
            CHECK_EQ_INT(found, mfound);
            CHECK_EQ_INT(probes, mprobes);
        }
    }
    clear_table();
}

int main(void) {
    /* -- empty table: search before any insert must fail safely with 0 probes -- */
    {
        M = 7;
        clear_table();
        int probes = -1;
        int found = search(42, &probes);
        CHECK_EQ_INT(found, 0);
        CHECK_EQ_INT(probes, 0);
        clear_table();
    }

    /* -- normal: m = 7, 10 inserts, 4 searches (hits and misses) -- */
    {
        TOp normal[] = {
            {0, 23}, {0, 44}, {0, 15}, {0, 77}, {0, 8}, {0, 62}, {0, 31}, {0, 50}, {0, 19}, {0, 96},
            {1, 23}, {1, 99}, {1, 96}, {1, 5}
        };
        run_and_check("normal", 7, normal, 14);
    }

    /* -- hard: m = 5, 12 inserts: chains grow long, 5 searches -- */
    {
        TOp hard[] = {
            {0, 12}, {0, 27}, {0, 42}, {0, 7}, {0, 33}, {0, 18}, {0, 53}, {0, 9}, {0, 44}, {0, 21}, {0, 38}, {0, 16},
            {1, 12}, {1, 100}, {1, 16}, {1, 61}, {1, 9}
        };
        run_and_check("hard", 5, hard, 17);
    }

    /* -- edge: m = 1, every key in one chain -- */
    {
        TOp single[] = {
            {0, 5}, {0, 17}, {0, 29}, {0, 3}, {0, 41}, {0, 12}, {0, 8}, {0, 50}, {0, 23}, {0, 36},
            {1, 36}, {1, 99}
        };
        run_and_check("single-bucket", 1, single, 12);
    }

    /* -- edge: m = 3, 12 keys, load factor 4 -- */
    {
        TOp high[] = {
            {0, 4}, {0, 10}, {0, 16}, {0, 22}, {0, 28}, {0, 34}, {0, 40}, {0, 46}, {0, 52}, {0, 58}, {0, 64}, {0, 70},
            {1, 58}, {1, 100}, {1, 4}
        };
        run_and_check("high-load", 3, high, 15);
    }

    /* -- duplicate key inserted twice: most recent copy is found first, probes == 1 -- */
    {
        M = 7;
        clear_table();
        insert(23);
        insert(30);
        insert(23); /* second copy of 23, becomes the new head of its chain (whatever bucket it lands in) */
        int probes = -1;
        int found = search(23, &probes);
        CHECK_EQ_INT(found, 1);
        CHECK_EQ_INT(probes, 1); /* the most-recently-inserted 23 is checked first (head of chain) */
        clear_table();
    }

    /* -- negative keys -- */
    {
        TOp neg[] = { {0, -3}, {0, -15}, {0, -27}, {0, 5}, {0, 18}, {1, -3}, {1, -27}, {1, 999} };
        run_and_check("negative keys", 11, neg, 8);
    }

    /* -- search for a key never inserted, in a table that already has several keys -- */
    {
        TOp miss[] = { {0, 1}, {0, 2}, {0, 3}, {0, 4}, {0, 5}, {1, 6}, {1, 100}, {1, -1} };
        run_and_check("misses only", 4, miss, 8);
    }

    TEST_SUMMARY();
}
