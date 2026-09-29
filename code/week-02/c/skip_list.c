/* Week 2 -- Linked Lists, Arrays and Matrices
 * Skip list: a sorted linked list with an extra "express lane". Levels are
 * given explicitly per key (a deterministic stand-in for a coin flip), not
 * chosen at random, so every run is repeatable. Matches the skip-list.js
 * animation (MAX_LEVEL = 2: level 0 is the full list, level 1 is the
 * express lane).
 * CEN207 Data Structures (formerly CE205)
 */
#include <limits.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#define MAX_LEVEL 2   /* level 0 = the full list, level 1 = the express lane */
typedef struct Node { int value; struct Node *forward[MAX_LEVEL]; } Node;
typedef struct { Node *header; } SkipList;      /* header: sentinel, present at every level */

static Node *new_node(int value) {
    Node *n = malloc(sizeof(Node));
    n->value = value;
    for (int i = 0; i < MAX_LEVEL; i++) n->forward[i] = NULL;
    return n;
}

void sl_insert(SkipList *sl, int value, int level, bool verbose) {
    Node *update[MAX_LEVEL];
    Node *cur = sl->header;
    for (int i = MAX_LEVEL - 1; i >= 0; i--) {
        while (cur->forward[i] != NULL && cur->forward[i]->value < value)
            cur = cur->forward[i];
        update[i] = cur;             /* predecessor of the new node at level i */
    }
    Node *n = new_node(value);
    for (int i = 0; i < level; i++) {
        n->forward[i] = update[i]->forward[i];
        update[i]->forward[i] = n;
    }
    if (verbose) printf("sl_insert(%d, level=%d)\n", value, level);
}

int sl_search(SkipList *sl, int value, int *comparisons) {
    Node *cur = sl->header;
    *comparisons = 0;
    for (int i = MAX_LEVEL - 1; i >= 0; i--) {
        while (cur->forward[i] != NULL && cur->forward[i]->value < value) {
            cur = cur->forward[i];   /* go right */
            (*comparisons)++;
        }
        /* else: drop down one level */
    }
    cur = cur->forward[0];
    (*comparisons)++;
    return cur != NULL && cur->value == value;
}

static void print_sorted(SkipList *sl) {
    printf("sorted:");
    for (Node *cur = sl->header->forward[0]; cur != NULL; cur = cur->forward[0])
        printf(" %d", cur->value);
    printf("\n");
}

static void free_list(SkipList *sl) {
    Node *cur = sl->header->forward[0];
    while (cur != NULL) {
        Node *tmp = cur;
        cur = cur->forward[0];
        free(tmp);
    }
}

static void run_scenario(const char *label, const int values[], const int levels[], int n, const int searches[], int sn) {
    printf("-- %s --\n", label);
    Node header_node = { INT_MIN, { NULL, NULL } };
    SkipList sl = { &header_node };
    for (int i = 0; i < n; i++)
        sl_insert(&sl, values[i], levels[i], true);
    print_sorted(&sl);
    for (int q = 0; q < sn; q++) {
        int comparisons;
        int found = sl_search(&sl, searches[q], &comparisons);
        printf("sl_search(%d): %s, comparisons %d\n", searches[q], found ? "found" : "not found", comparisons);
    }
    printf("\n");
    free_list(&sl);
}

int main(void) {
    /* normal: 10 keys, every other one on the express lane, two searches */
    int normal_v[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    int normal_l[] = {1, 2, 1, 2, 1, 2, 1, 2, 1, 2};
    int normal_s[] = {80, 999};
    run_scenario("normal: 10 keys, every other one on the express lane, two searches", normal_v, normal_l, 10, normal_s, 2);

    /* hard: 14 keys (duplicates/negatives), inserted out of sorted order */
    int hard_v[] = {50, -20, 10, 10, 70, -20, 30, 90, 30, 0, 60, 40, 80, 20};
    int hard_l[] = {1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1};
    int hard_s[] = {30, -20, 1000};
    run_scenario("hard: 14 keys (duplicates/negatives), inserted out of sorted order", hard_v, hard_l, 14, hard_s, 3);

    /* edge: 10 keys, only ONE node on the express lane */
    int one_express_v[] = {5, 15, 25, 35, 45, 55, 65, 75, 85, 95};
    int one_express_l[] = {1, 1, 1, 2, 1, 1, 1, 1, 1, 1};
    int one_express_s[] = {35, 90};
    run_scenario("edge: 10 keys, only ONE node on the express lane", one_express_v, one_express_l, 10, one_express_s, 2);

    /* edge: 12 keys: the first key, the last key, and a value that is not present */
    int fl_v[] = {8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96};
    int fl_l[] = {2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1};
    int fl_s[] = {8, 96, 200};
    run_scenario("edge: 12 keys: the first key, the last key, and a value that is not present", fl_v, fl_l, 12, fl_s, 3);

    return 0;
}
