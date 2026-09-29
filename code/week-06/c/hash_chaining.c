/* Week 6 -- Search and Hashing
 * Hash table with separate chaining: each bucket holds the head of a linked
 * list ("chain") of every key that hashed there. A collision grows the
 * chain instead of overwriting anything. Insertion is O(1); search walks
 * the chain, so its cost depends on the chain's length.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>

#define MAX_M 16

typedef struct Node { int key; struct Node *next; } Node;
Node *table[MAX_M];                    /* M buckets, each the head of a chain (NULL = empty) */
int M;

static int h(int key) { return ((key % M) + M) % M; }

void insert(int key) {
    int idx = h(key);
    Node *n = malloc(sizeof(Node));
    n->key = key;
    n->next = table[idx];              /* new node becomes the head: O(1) */
    table[idx] = n;
}

int search(int key, int *probes) {
    int idx = h(key);
    int p = 0;
    for (Node *cur = table[idx]; cur != NULL; cur = cur->next) {
        p++;
        if (cur->key == key) { *probes = p; return 1; }
    }
    *probes = p;
    return 0;
}

static void clear_table(void) {
    for (int i = 0; i < MAX_M; i++) {
        Node *cur = table[i];
        while (cur) { Node *nx = cur->next; free(cur); cur = nx; }
        table[i] = NULL;
    }
}

typedef struct { int is_search; int value; } Op;

static void run_scenario(const char *label, int m, Op ops[], int n) {
    printf("-- %s --\n", label);
    printf("m = %d\n", m);
    M = m;
    clear_table();
    int inserted = 0;
    for (int i = 0; i < n; i++) {
        if (!ops[i].is_search) {
            int key = ops[i].value;
            int idx = h(key);
            int collided = table[idx] != NULL;
            insert(key);
            inserted++;
            printf("  insert(%d): h(%d) = %d%s (load factor alpha = %d/%d = %.2f)\n",
                   key, key, idx, collided ? " -- collision, added at head of chain" : " -- empty bucket, new chain",
                   inserted, m, (double) inserted / m);
        } else {
            int key = ops[i].value;
            int probes = 0;
            int found = search(key, &probes);
            printf("  search(%d): h(%d) = %d -- %s, %d probes\n",
                   key, key, h(key), found ? "found" : "not found", probes);
        }
    }
    printf("summary: %d keys inserted, load factor alpha = %.2f\n\n", inserted, (double) inserted / m);
    clear_table();
}

int main(void) {
    Op normal[] = {
        {0, 23}, {0, 44}, {0, 15}, {0, 77}, {0, 8}, {0, 62}, {0, 31}, {0, 50}, {0, 19}, {0, 96},
        {1, 23}, {1, 99}, {1, 96}, {1, 5}
    };
    Op hard[] = {
        {0, 12}, {0, 27}, {0, 42}, {0, 7}, {0, 33}, {0, 18}, {0, 53}, {0, 9}, {0, 44}, {0, 21}, {0, 38}, {0, 16},
        {1, 12}, {1, 100}, {1, 16}, {1, 61}, {1, 9}
    };
    Op single_bucket[] = {
        {0, 5}, {0, 17}, {0, 29}, {0, 3}, {0, 41}, {0, 12}, {0, 8}, {0, 50}, {0, 23}, {0, 36},
        {1, 36}, {1, 99}
    };
    Op high_load[] = {
        {0, 4}, {0, 10}, {0, 16}, {0, 22}, {0, 28}, {0, 34}, {0, 40}, {0, 46}, {0, 52}, {0, 58}, {0, 64}, {0, 70},
        {1, 58}, {1, 100}, {1, 4}
    };

    run_scenario("normal: m = 7, 10 inserts, 4 searches (hits and misses)", 7, normal, 14);
    run_scenario("hard: m = 5, 12 inserts: chains grow, 5 searches", 5, hard, 17);
    run_scenario("edge: m = 1, every key in one chain, search degrades to O(n)", 1, single_bucket, 12);
    run_scenario("edge: m = 3, 12 keys: load factor alpha = 4", 3, high_load, 15);

    return 0;
}
