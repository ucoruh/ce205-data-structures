/* Week 6 -- Search and Hashing
 * Open addressing with linear probing: every key lives directly IN the
 * table. On a collision, probe the next slot, wrapping around, until an
 * empty (or deleted) slot is found. A deleted slot gets a tombstone marker,
 * not a plain empty mark, so search keeps walking past it.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

#define MAX_M 16
typedef enum { EMPTY, OCCUPIED, DELETED } Slot;
Slot state[MAX_M];
int table[MAX_M];
int M;

static int h(int key) { return ((key % M) + M) % M; }

int insert(int key, int *probes) {
    int idx = h(key);
    for (int i = 0; i < M; i++) {
        (*probes)++;
        if (state[idx] != OCCUPIED) {          /* EMPTY or DELETED: reuse this slot */
            table[idx] = key;
            state[idx] = OCCUPIED;
            return idx;
        }
        idx = (idx + 1) % M;                   /* linear probing: try the next slot */
    }
    return -1;                              /* table full: M slots probed, none free */
}

int search(int key, int *probes) {
    int idx = h(key);
    for (int i = 0; i < M; i++) {
        (*probes)++;
        if (state[idx] == EMPTY) return -1;   /* gap: key cannot be further */
        if (state[idx] == OCCUPIED && table[idx] == key) return idx;
        idx = (idx + 1) % M;
    }
    return -1;
}

int delete_key(int key, int *probes) {
    int idx = h(key);
    for (int i = 0; i < M; i++) {
        (*probes)++;
        if (state[idx] == EMPTY) return -1;
        if (state[idx] == OCCUPIED && table[idx] == key) { state[idx] = DELETED; return idx; }
        idx = (idx + 1) % M;
    }
    return -1;
}

typedef struct { int kind; int value; } Op;   /* kind: 0 insert, 1 search, 2 delete */

static void clear_table(void) { for (int i = 0; i < MAX_M; i++) { state[i] = EMPTY; table[i] = 0; } }

static void run_scenario(const char *label, int m, Op ops[], int n) {
    printf("-- %s --\n", label);
    printf("m = %d\n", m);
    M = m;
    clear_table();
    int placed_count = 0, rejected = 0;
    for (int i = 0; i < n; i++) {
        int probes = 0;
        if (ops[i].kind == 0) {
            int key = ops[i].value;
            int idx = insert(key, &probes);
            if (idx == -1) { rejected++; printf("  insert(%d): table full, rejected (%d probes)\n", key, probes); }
            else { placed_count++; printf("  insert(%d): placed at %d (%d probe%s)\n", key, idx, probes, probes == 1 ? "" : "s"); }
        } else if (ops[i].kind == 1) {
            int key = ops[i].value;
            int idx = search(key, &probes);
            printf("  search(%d): %s (%d probes)\n", key, idx == -1 ? "not found" : "found", probes);
        } else {
            int key = ops[i].value;
            int idx = delete_key(key, &probes);
            printf("  delete(%d): %s (%d probes)\n", key, idx == -1 ? "not found" : "deleted, tombstone left", probes);
        }
    }
    printf("summary: %d/%d inserts placed%s\n\n", placed_count, placed_count + rejected,
           rejected ? " (table full for the rest)" : "");
}

int main(void) {
    Op normal[] = {
        {0, 23}, {0, 34}, {0, 45}, {0, 12}, {0, 56}, {0, 67}, {0, 18}, {0, 29}, {0, 40}, {0, 51},
        {1, 45}, {2, 34}, {1, 34}
    };
    Op hard[] = {
        {0, 11}, {0, 22}, {0, 33}, {0, 44}, {0, 55}, {0, 5}, {0, 16}, {0, 27}, {0, 38}, {0, 49},
        {1, 49}, {2, 22}, {1, 33}, {1, 22}
    };
    Op table_full[] = {
        {0, 3}, {0, 11}, {0, 19}, {0, 27}, {0, 35}, {0, 43}, {0, 51}, {0, 59}, {0, 99}, {0, 67}
    };
    Op tombstone[] = {
        {0, 15}, {0, 26}, {0, 37}, {0, 8}, {0, 19}, {0, 30}, {0, 41}, {0, 52}, {0, 63}, {0, 74},
        {2, 26}, {1, 37}, {1, 26}
    };

    run_scenario("normal: m = 11, 10 inserts, a search and a delete", 11, normal, 13);
    run_scenario("hard: m = 11, the keys collide into two big clusters", 11, hard, 14);
    run_scenario("edge: m = 8, 8 keys into the same cell: the table fills exactly, later inserts are rejected", 8, table_full, 10);
    run_scenario("edge: search after a delete, why it would go wrong without a tombstone", 11, tombstone, 13);

    return 0;
}
