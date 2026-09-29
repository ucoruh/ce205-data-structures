/* Week 14 -- File Organisation II
 * Primary (sparse) index over a sorted file: one index entry per disk page.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdbool.h>
#include <stdio.h>

#define MAX_PAGES 8
#define MAX_BLOCK 16

typedef struct {
    int first_key;
    int page;
} IndexEntry;

int find_page(IndexEntry index[], int idx_n, int key) {
    int page = -1;
    for (int i = 0; i < idx_n; i++) {
        if (index[i].first_key <= key)
            page = index[i].page; /* keep the last entry that still fits */
        else
            break; /* index is sorted: later entries start too high */
    }
    return page;
}

bool search_key(int data[][MAX_BLOCK], const int page_len[], IndexEntry index[], int idx_n,
                 int key, int *out_page) {
    int page = find_page(index, idx_n, key);
    if (page == -1)
        return false; /* smaller than every key: guaranteed absent */
    for (int i = 0; i < page_len[page]; i++)
        if (data[page][i] == key) {
            *out_page = page;
            return true;
        }
    *out_page = page;
    return false;
}

static void run_scenario(const char *label, const int keys[], int n, int block, const int queries[], int qn) {
    printf("-- %s --\n", label);
    int data[MAX_PAGES][MAX_BLOCK];
    int page_len[MAX_PAGES];
    IndexEntry index[MAX_PAGES];
    int pages = 0;

    for (int i = 0; i < n; i += block) {
        int len = 0;
        for (int j = i; j < i + block && j < n; j++)
            data[pages][len++] = keys[j];
        page_len[pages] = len;
        index[pages].first_key = data[pages][0];
        index[pages].page = pages;
        pages++;
    }

    printf("pages: %d\n", pages);
    for (int p = 0; p < pages; p++) {
        printf("  page %d:", p + 1);
        for (int i = 0; i < page_len[p]; i++)
            printf(" %d", data[p][i]);
        printf("\n");
    }
    for (int q = 0; q < qn; q++) {
        int out_page = -1;
        bool found = search_key(data, page_len, index, pages, queries[q], &out_page);
        if (out_page == -1)
            printf("search(%d) -> not found (below the first key, no page read)\n", queries[q]);
        else
            printf("search(%d) -> %s (page %d)\n", queries[q], found ? "found" : "not found", out_page + 1);
    }
    printf("\n");
}

int main(void) {
    const int normal_keys[] = {5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60};
    const int normal_q[] = {22, 50, 3};
    run_scenario("normal: 12 keys, block=4", normal_keys, 12, 4, normal_q, 3);

    const int hard_keys[] = {2, 8, 14, 19, 23, 29, 34, 41, 47, 53, 58, 64, 69, 75, 81, 88};
    const int hard_q[] = {29, 75, 90, 1, 88};
    run_scenario("hard: 16 keys, block=3, partial last page", hard_keys, 16, 3, hard_q, 5);

    const int single_keys[] = {3, 6, 9, 12, 15, 18, 21, 24, 27, 30};
    const int single_q[] = {9, 25, 1};
    run_scenario("edge: single page, block=12", single_keys, 10, 12, single_q, 3);

    const int below_keys[] = {100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155};
    const int below_q[] = {10, 50, 99};
    run_scenario("edge: every query below range, block=4", below_keys, 12, 4, below_q, 3);
    return 0;
}
