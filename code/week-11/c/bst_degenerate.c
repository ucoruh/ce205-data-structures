/* Week 11 -- Advanced Trees
 * Why balancing matters: inserting the SAME set of keys in different orders gives wildly different BST
 * shapes. Sorted input degenerates into a chain -- height n-1, every operation O(n).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
} Node;

Node *bst_insert(Node *root, int key) {
    Node *cur = root, *parent = NULL;
    while (cur != NULL) {
        parent = cur;
        if (key == cur->key) return root;
        if (key < cur->key)  cur = cur->left;
        else                 cur = cur->right;
    }
    Node *n = malloc(sizeof(Node));
    n->key = key; n->left = NULL; n->right = NULL;
    if (parent == NULL) return n;
    if (key < parent->key) parent->left = n;
    else                    parent->right = n;
    return root;
}

static int height(Node *n) {
    if (n == NULL) return -1;
    int l = height(n->left), r = height(n->right);
    return 1 + (l > r ? l : r);
}

static void free_tree(Node *n) {
    if (n == NULL) return;
    free_tree(n->left);
    free_tree(n->right);
    free(n);
}

static int ilog2(int n) {
    int h = 0;
    while (n > 1) { n /= 2; h++; }
    return h;
}

static void run_scenario(const char *label, const int keys[], int n) {
    printf("-- %s --\n", label);
    Node *root = NULL;
    for (int i = 0; i < n; i++) {
        root = bst_insert(root, keys[i]);
        printf("insert(%d): height = %d  (ideal for %d nodes = %d)\n",
               keys[i], height(root), i + 1, ilog2(i + 1));
    }
    int h = height(root), ideal = ilog2(n);
    printf("final: n = %d, height = %d, ideal = %d\n\n", n, h, ideal);
    free_tree(root);
}

int main(void) {
    int normal[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    run_scenario("normal: 10 keys in ascending order -- forms a chain", normal, 10);

    int hard[] = {140, 130, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10};
    run_scenario("hard: 14 keys in descending order -- a chain the other way", hard, 14);

    int zigzag[] = {10, 20, 15, 30, 25, 40, 35, 50, 45, 60};
    run_scenario("edge: nearly sorted with small zig-zags (still deep)", zigzag, 10);

    int shuffled[] = {6, 9, 2, 10, 4, 8, 1, 7, 3, 5};
    run_scenario("edge: the SAME 10 keys shuffled -- much shallower", shuffled, 10);

    int single[] = {42};
    run_scenario("edge: a single key, height 0", single, 1);

    return 0;
}
