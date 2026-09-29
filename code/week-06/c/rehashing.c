/* Week 6 -- Search and Hashing
 * Rehashing: open addressing (linear probing) works only while the table
 * has room. When the load factor n/m goes past a threshold, we allocate a
 * bigger table -- size = the next prime at least 2*m -- and reinsert every
 * key into it from scratch (every key's index can change, since the
 * modulus changed). This keeps the average probe length bounded as the
 * table grows.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <stdlib.h>

typedef enum { EMPTY, OCCUPIED } Slot;
double threshold = 0.8;
Slot *state; int *table; int m, n;    /* current table, its size, and how many keys are in it */

int is_prime(int x) {
    if (x < 2) return 0;
    for (int i = 2; (long) i * i <= x; i++) if (x % i == 0) return 0;
    return 1;
}
int next_prime(int x) { while (!is_prime(x)) x++; return x; }

int insert_into(Slot *st, int *tb, int mm, int key) {         /* returns the index used */
    int idx = ((key % mm) + mm) % mm;
    for (int i = 0; i < mm; i++) {
        if (st[idx] != OCCUPIED) { tb[idx] = key; st[idx] = OCCUPIED; return idx; }
        idx = (idx + 1) % mm;
    }
    return -1;
}

void rehash(void) {
    int new_m = next_prime(2 * m);
    Slot *new_state = calloc(new_m, sizeof(Slot));
    int *new_table = malloc(new_m * sizeof(int));
    printf("  rehash: alpha exceeded %.2f, growing table %d -> %d\n", threshold, m, new_m);
    for (int i = 0; i < m; i++) {
        if (state[i] == OCCUPIED) {
            int new_idx = insert_into(new_state, new_table, new_m, table[i]);
            printf("    move key %d: old index %d -> new index %d\n", table[i], i, new_idx);
        }
    }
    free(state); free(table);
    state = new_state; table = new_table; m = new_m;
}

void insert(int key) {
    int idx = insert_into(state, table, m, key);
    n++;
    printf("  insert(%d): placed at %d, n=%d, m=%d, alpha=%.2f\n", key, idx, n, m, (double) n / m);
    if ((double) n / m > threshold) rehash();
}

static void run_scenario(const char *label, int m0, double thr, const int keys[], int count) {
    printf("-- %s --\n", label);
    printf("m0 = %d, threshold = %.2f\n", m0, thr);
    threshold = thr;
    m = m0; n = 0;
    state = calloc(m, sizeof(Slot));
    table = malloc(m * sizeof(int));
    for (int i = 0; i < count; i++) insert(keys[i]);
    printf("summary: %d keys inserted, table grew from %d to %d, final alpha=%.2f\n\n", n, m0, m, (double) n / m);
    free(state); free(table);
}

int main(void) {
    int normal[] = {15, 22, 8, 31, 44, 3, 27, 56, 19, 40};
    int hard[] = {12, 18, 24, 30, 36, 7, 13, 19, 25, 31};
    int double_rehash[] = {5, 12, 19, 26, 9, 16};

    run_scenario("normal: m0 = 6, 10 keys: grows once", 6, 0.8, normal, 10);
    run_scenario("hard: m0 = 6, keys cluster at the same home, growing relieves it", 6, 0.8, hard, 10);
    run_scenario("edge: m0 = 2, a tiny table grows twice in a row", 2, 0.8, double_rehash, 6);

    return 0;
}
