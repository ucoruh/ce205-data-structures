/* Week 6 -- Search and Hashing
 * Open addressing with quadratic probing: on a collision, probe
 * home+1^2, home+2^2, home+3^2, ... (mod m) instead of home+1, home+2,
 * home+3 (linear probing). This avoids primary clustering, but if m is not
 * prime (or the load factor is above 0.5) the i^2 sequence can revisit the
 * same few slots forever and never reach a free one, even though the table
 * is not full.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

#define MAX_M 16
typedef enum { EMPTY, OCCUPIED } Slot;
Slot state[MAX_M];
int table[MAX_M];
int M;

static int h(int key) { return ((key % M) + M) % M; }

int insert(int key, int *probes) {
    int home = h(key);
    for (int i = 0; i < M; i++) {
        int idx = (home + i * i) % M;          /* quadratic probing: i^2 offsets */
        (*probes)++;
        if (state[idx] != OCCUPIED) {
            table[idx] = key;
            state[idx] = OCCUPIED;
            return idx;
        }
    }
    return -1;   /* M probes tried: table full, OR (m not prime / alpha > 0.5) the */
                 /* sequence cycled without ever reaching a free slot           */
}

static int occupied_count(void) { int c = 0; for (int i = 0; i < M; i++) if (state[i] == OCCUPIED) c++; return c; }
static void clear_table(void) { for (int i = 0; i < MAX_M; i++) { state[i] = EMPTY; table[i] = 0; } }

static void run_scenario(const char *label, int m, const int keys[], int n) {
    printf("-- %s --\n", label);
    printf("m = %d\n", m);
    M = m;
    clear_table();
    int placed_count = 0, cycled_count = 0;
    for (int i = 0; i < n; i++) {
        int key = keys[i];
        int probes = 0;
        int idx = insert(key, &probes);
        if (idx != -1) {
            placed_count++;
            printf("  insert(%d): home=%d, placed at %d (%d probe%s)\n", key, h(key), idx, probes, probes == 1 ? "" : "s");
        } else {
            int occ = occupied_count();
            int cycled = occ < m;
            if (cycled) { int free_cells = m - occ; cycled_count++; printf("  insert(%d): home=%d, CYCLED -- %d cell%s still empty but never reached\n", key, h(key), free_cells, free_cells == 1 ? "" : "s"); }
            else printf("  insert(%d): home=%d, table full\n", key, h(key));
        }
    }
    printf("summary: %d/%d inserts placed%s\n\n", placed_count, n,
           cycled_count ? (cycled_count == 1 ? ", 1 cycled despite free space existing" : ", multiple cycled despite free space existing") : "");
}

int main(void) {
    int normal[] = {7, 20, 33, 14, 29, 41, 56, 68, 81, 95};
    int hard[] = {4, 15, 26, 37, 48, 9, 20, 31, 42, 53};
    int cycle[] = {8, 9, 12, 26, 19, 5, 14, 16, 7, 24};

    run_scenario("normal: m = 13 (prime), 10 keys, a few i^2 jumps", 13, normal, 10);
    run_scenario("hard: m = 11, two groups share a home: clear i^2 patterns", 11, hard, 10);
    run_scenario("edge: m = 8 (a power of 2), the cycle never finds the free slot", 8, cycle, 10);

    return 0;
}
