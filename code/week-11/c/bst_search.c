/* Week 11 -- Advanced Trees
 * Binary search tree (BST): search.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
} Node;

static Node *bst_build_insert(Node *root, int key) {
    Node *cur = root, *parent = NULL;
    while (cur != NULL) {
        parent = cur;
        if (key == cur->key) return root;
        if (key < cur->key) cur = cur->left; else cur = cur->right;
    }
    Node *n = malloc(sizeof(Node));
    n->key = key; n->left = NULL; n->right = NULL;
    if (parent == NULL) return n;
    if (key < parent->key) parent->left = n; else parent->right = n;
    return root;
}

int probes;

int bst_search(Node *root, int key) {
    Node *cur = root;
    probes = 0;
    while (cur != NULL) {
        probes++;
        if (key == cur->key) return 1;
        if (key < cur->key) cur = cur->left;
        else                cur = cur->right;
    }
    return 0;
}

static void free_tree(Node *n) {
    if (n == NULL) return;
    free_tree(n->left);
    free_tree(n->right);
    free(n);
}

static void run_scenario(const char *label, const int keys[], int nk, const int finds[], int nf) {
    printf("-- %s --\n", label);
    Node *root = NULL;
    for (int i = 0; i < nk; i++) root = bst_build_insert(root, keys[i]);
    printf("tree built from %d keys\n", nk);
    for (int i = 0; i < nf; i++) {
        int found = bst_search(root, finds[i]);
        printf("search(%d): %s, %d probes\n", finds[i], found ? "found" : "not found", probes);
    }
    printf("\n");
    free_tree(root);
}

int main(void) {
    int normal_keys[] = {50, 30, 70, 20, 40, 60, 80, 35, 65, 90};
    int normal_finds[] = {65, 20, 90, 55, 100};
    run_scenario("normal: 10 keys, 3 hits and 2 misses", normal_keys, 10, normal_finds, 5);

    int hard_keys[] = {10, -5, 25, 40, -20, 5, 17, 30, 45, 3, 22, -15, 12, 60};
    int hard_finds[] = {-20, 60, 0, -5, 99};
    run_scenario("hard: 14 keys with negative values, 5 searches", hard_keys, 14, hard_finds, 5);

    int bound_keys[] = {50, 30, 70, 20, 40, 60, 80, 10, 45, 90};
    int bound_finds[] = {-1000, 1000, 50};
    run_scenario("edge: searching below the minimum and above the maximum", bound_keys, 10, bound_finds, 3);

    int chain_keys[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int chain_finds[] = {10, 1, 11};
    run_scenario("edge: searching for the last key in a chain built from ascending inserts (O(n))", chain_keys, 10, chain_finds, 3);

    int single_keys[] = {7};
    int single_finds[] = {7, 3};
    run_scenario("edge: a single node, search the root and a missing value", single_keys, 1, single_finds, 2);

    return 0;
}
