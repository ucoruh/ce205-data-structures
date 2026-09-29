/* Week 6 -- Search and Hashing
 * Open addressing with double hashing: the probe step itself depends on the
 * key, via a second hash function h2. probe(i) = (h1(key) + i * h2(key))
 * mod m. Two keys that collide at the same home cell usually follow
 * different paths from there, unlike linear or quadratic probing where
 * every colliding key retraces the same path.
 * h2(key) = r - (key mod r) for a prime r < m: always in [1..r], so the
 * step is never 0 (a 0 step would reprobe the same cell forever).
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

#define MAX_M 16
typedef enum { EMPTY, OCCUPIED } Slot;
Slot state[MAX_M];
int table[MAX_M];
int M, R;

static int h1(int key) { return ((key % M) + M) % M; }
static int h2(int key) { return R - (((key % R) + R) % R); }       /* r prime, r < m: h2 in [1..r], never 0 */

int insert(int key, int *probes) {
    int idx = h1(key), step = h2(key);
    for (int i = 0; i < M; i++) {
        (*probes)++;
        if (state[idx] != OCCUPIED) {
            table[idx] = key;
            state[idx] = OCCUPIED;
            return idx;
        }
        idx = (idx + step) % M;                          /* every collision uses THIS key's own step */
    }
    return -1;
}

/* For the closing comparison ONLY: what linear probing would have done on the same keys.
 * Not used for correctness anywhere -- a separate, simpler simulation. */
static int simulate_linear(const int keys[], int n, int m, int *total_probes) {
    Slot lstate[MAX_M] = {0};
    int placed = 0;
    *total_probes = 0;
    for (int k = 0; k < n; k++) {
        int idx = ((keys[k] % m) + m) % m;
        for (int i = 0; i < m; i++) {
            (*total_probes)++;
            if (!lstate[idx]) { lstate[idx] = OCCUPIED; placed++; break; }
            idx = (idx + 1) % m;
        }
    }
    return placed;
}

static void clear_table(void) { for (int i = 0; i < MAX_M; i++) { state[i] = EMPTY; table[i] = 0; } }
static int occupied_count(void) { int c = 0; for (int i = 0; i < M; i++) if (state[i] == OCCUPIED) c++; return c; }

static void run_scenario(const char *label, int m, int r, const int keys[], int n) {
    printf("-- %s --\n", label);
    printf("m = %d, R = %d\n", m, r);
    M = m; R = r;
    clear_table();
    int placed_count = 0, total_probes = 0, cycled_count = 0;
    for (int i = 0; i < n; i++) {
        int key = keys[i];
        int probes = 0;
        int idx = insert(key, &probes);
        total_probes += probes;
        if (idx != -1) {
            placed_count++;
            printf("  insert(%d): h1=%d h2=%d, placed at %d (%d probe%s)\n",
                   key, h1(key), h2(key), idx, probes, probes == 1 ? "" : "s");
        } else {
            int occ = occupied_count();
            int cycled = occ < m;
            if (cycled) { int free_cells = m - occ; cycled_count++; printf("  insert(%d): h1=%d h2=%d, CYCLED -- %d cell%s still empty but never reached\n", key, h1(key), h2(key), free_cells, free_cells == 1 ? "" : "s"); }
            else printf("  insert(%d): h1=%d h2=%d, table full\n", key, h1(key), h2(key));
        }
    }
    int lin_total = 0;
    int lin_placed = simulate_linear(keys, n, m, &lin_total);
    printf("summary: %d/%d inserts, %d probes in total. Linear probing on the same keys places %d/%d, taking %d probes.\n\n",
           placed_count, n, total_probes, lin_placed, n, lin_total);
    (void) cycled_count;
}

int main(void) {
    int normal[] = {7, 20, 33, 14, 29, 41, 56, 68, 81, 95};
    int hard[] = {4, 17, 30, 43, 56, 8, 21, 34, 47, 60};
    int cycle[] = {13, 16, 10, 9, 2, 3, 5, 6, 4, 17};

    run_scenario("normal: m = 13, R = 11, 10 keys: colliding keys use different steps", 13, 11, normal, 10);
    run_scenario("hard: m = 13, R = 11, many keys share a home", 13, 11, hard, 10);
    run_scenario("edge: m = 9 (not prime), the step shares a factor with m, a cycle forms", 9, 7, cycle, 10);

    return 0;
}
