/* Week 14 -- File Organisation II
 * Dense secondary index: one index entry per RECORD, sorted by a key that repeats.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <stdlib.h>

#define MAX_RECORDS 16

typedef struct {
    int key;
    int slot;
} IndexEntry;

/* Search a dense, sorted index for every record whose key matches; matching entries cluster
 * together because the index is sorted, so a single pass collects them all. */
int search_dense(const IndexEntry index[], int n, int key, int matches[], int max_matches) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (index[i].key == key) {
            if (count < max_matches)
                matches[count] = index[i].slot; /* remember which record matched */
            count++;
        } else if (count > 0) {
            break; /* dense + sorted: matches always cluster together */
        }
    }
    return count;
}

static int cmp_entry(const void *a, const void *b) {
    const IndexEntry *ea = a, *eb = b;
    if (ea->key != eb->key)
        return ea->key - eb->key;
    return ea->slot - eb->slot;
}

static void run_scenario(const char *label, const int keys[], int n, int block, const int queries[], int qn) {
    printf("-- %s --\n", label);
    printf("records: %d, block=%d\n", n, block);

    IndexEntry index[MAX_RECORDS];
    for (int i = 0; i < n; i++) {
        index[i].key = keys[i];
        index[i].slot = i;
    }
    qsort(index, (size_t) n, sizeof(IndexEntry), cmp_entry);

    for (int q = 0; q < qn; q++) {
        int matches[MAX_RECORDS];
        int count = search_dense(index, n, queries[q], matches, MAX_RECORDS);
        printf("search(%d) -> %d match(es):", queries[q], count);
        for (int i = 0; i < count; i++) {
            int slot = matches[i];
            printf(" page%d.slot%d", slot / block + 1, slot % block);
        }
        printf("\n");
    }
    printf("\n");
}

int main(void) {
    const int normal_keys[] = {3, 1, 4, 1, 2, 3, 1, 4, 2, 3, 1, 4};
    const int normal_q[] = {1, 5, 4};
    run_scenario("normal: 12 records, block=4", normal_keys, 12, 4, normal_q, 3);

    const int hard_keys[] = {2, 5, 1, 3, 5, 4, 1, 5, 2, 3, 5, 1, 4, 2};
    const int hard_q[] = {5, 9, 4};
    run_scenario("hard: 14 records, block=3", hard_keys, 14, 3, hard_q, 3);

    const int same_keys[] = {7, 7, 7, 7, 7, 7, 7, 7, 7, 7};
    const int same_q[] = {7, 3};
    run_scenario("edge: all 10 records share one key", same_keys, 10, 4, same_q, 2);

    const int unique_keys[] = {40, 10, 30, 20, 50, 15, 25, 35, 45, 5};
    const int unique_q[] = {30, 99, 5};
    run_scenario("edge: no duplicate keys", unique_keys, 10, 5, unique_q, 3);
    return 0;
}
