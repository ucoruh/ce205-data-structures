/* Week 14 -- File Organisation II
 * ISAM: a two-level index over a sorted primary data area, plus an overflow area
 * (a linked chain) for keys that no longer fit their home page.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>

#define MAX_PAGES 8
#define MAX_BLOCK 8
#define MAX_GROUPS 8

typedef struct OverflowNode {
    int key;
    struct OverflowNode *next;
} OverflowNode;

typedef struct {
    int keys[MAX_BLOCK]; /* holds up to BLOCK keys: the page's capacity */
    int len;              /* how many of those slots are currently used */
    OverflowNode *overflow_head;
    OverflowNode *overflow_tail;
} Page;

int find_group(const int l1_key[], int l1_n, int key) {
    int g = 0;
    for (int i = 0; i < l1_n; i++) {
        if (l1_key[i] <= key)
            g = i;
        else
            break;
    }
    return g;
}

int find_page(const int l2_key[], int lo, int hi, int key) {
    int page = lo;
    for (int i = lo; i <= hi; i++) {
        if (l2_key[i] <= key)
            page = i;
        else
            break;
    }
    return page;
}

/* block = a page's CAPACITY (how many keys it can hold before it overflows). */
static void isam_insert(Page pages[], int num_pages, int block, const int l1_key[], int l1_n,
                         int group, int key) {
    int g = find_group(l1_key, l1_n, key);
    int lo = g * group, hi = lo + group - 1;
    if (hi > num_pages - 1)
        hi = num_pages - 1;
    int l2_key[MAX_PAGES];
    for (int i = 0; i < num_pages; i++)
        l2_key[i] = pages[i].keys[0];
    int page = find_page(l2_key, lo, hi, key);

    if (pages[page].len < block) {
        int i = pages[page].len - 1;
        while (i >= 0 && pages[page].keys[i] > key) {
            pages[page].keys[i + 1] = pages[page].keys[i];
            i--;
        }
        pages[page].keys[i + 1] = key;
        pages[page].len++;
        printf("insert(%d) -> page %d (%d/%d)\n", key, page + 1, pages[page].len, block);
    } else {
        OverflowNode *node = malloc(sizeof *node);
        node->key = key;
        node->next = NULL;
        if (pages[page].overflow_tail == NULL)
            pages[page].overflow_head = node;
        else
            pages[page].overflow_tail->next = node;
        pages[page].overflow_tail = node;
        printf("insert(%d) -> page %d is full: OVERFLOW\n", key, page + 1);
    }
}

static void print_pages(const Page pages[], int num_pages) {
    for (int p = 0; p < num_pages; p++) {
        printf("  page %d:", p + 1);
        for (int i = 0; i < pages[p].len; i++)
            printf(" %d", pages[p].keys[i]);
        if (pages[p].overflow_head != NULL) {
            printf("  overflow:");
            for (OverflowNode *n = pages[p].overflow_head; n != NULL; n = n->next)
                printf(" %d", n->key);
        }
        printf("\n");
    }
}

static void free_overflow(Page pages[], int num_pages) {
    for (int p = 0; p < num_pages; p++) {
        OverflowNode *n = pages[p].overflow_head;
        while (n != NULL) {
            OverflowNode *next = n->next;
            free(n);
            n = next;
        }
    }
}

/* fill = keys per page when the file is first built (fill <= block, leaving block-fill free slots). */
static void run_scenario(const char *label, const int keys[], int n, int block, int fill, int group,
                          const int inserts[], int in_n) {
    printf("-- %s --\n", label);
    Page pages[MAX_PAGES];
    int num_pages = 0;
    for (int i = 0; i < n; i += fill) {
        int len = 0;
        for (int j = i; j < i + fill && j < n; j++)
            pages[num_pages].keys[len++] = keys[j];
        pages[num_pages].len = len;
        pages[num_pages].overflow_head = NULL;
        pages[num_pages].overflow_tail = NULL;
        num_pages++;
    }
    int l1_key[MAX_GROUPS];
    int l1_n = 0;
    for (int g = 0; g * group < num_pages; g++)
        l1_key[l1_n++] = pages[g * group].keys[0];

    printf("pages: %d (fill=%d, capacity=%d), level-1 groups: %d\n", num_pages, fill, block, l1_n);
    for (int i = 0; i < in_n; i++)
        isam_insert(pages, num_pages, block, l1_key, l1_n, group, inserts[i]);
    print_pages(pages, num_pages);
    free_overflow(pages, num_pages);
    printf("\n");
}

int main(void) {
    const int normal_keys[] = {5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60};
    const int normal_ins[] = {22, 38, 39};
    run_scenario("normal: 12 keys, block=4, fill=3 (1 overflow)", normal_keys, 12, 4, 3, 2, normal_ins, 3);

    const int hard_keys[] = {2, 8, 14, 19, 23, 29, 34, 41, 47, 53, 58, 64, 69, 75, 81, 88};
    const int hard_ins[] = {24, 25, 26};
    run_scenario("hard: 16 keys, block=4, fill=2, chained overflow", hard_keys, 16, 4, 2, 3, hard_ins, 3);

    const int no_of_keys[] = {4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59};
    const int no_of_ins[] = {11, 46, 12, 47};
    run_scenario("edge: plenty of free room, no overflow", no_of_keys, 12, 8, 3, 2, no_of_ins, 4);

    const int all_of_keys[] = {10, 12, 20, 22, 30, 32, 40, 42, 50, 52};
    const int all_of_ins[] = {11, 21, 31, 41};
    run_scenario("edge: fill=block=2, every insert overflows", all_of_keys, 10, 2, 2, 3, all_of_ins, 4);
    return 0;
}
