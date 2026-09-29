/* Week 11 -- Advanced Trees
 * Binary search tree (BST): insert. Duplicates are ignored (tree unchanged).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
} Node;

Node *bst_insert(Node *root, int key) {
    Node *cur = root, *parent = NULL;
    while (cur != NULL) {
        parent = cur;
        if (key == cur->key) return root;             /* duplicate: tree unchanged */
        if (key < cur->key)  cur = cur->left;
        else                 cur = cur->right;
    }
    Node *n = malloc(sizeof(Node));
    n->key = key;
    n->left = NULL;
    n->right = NULL;
    if (parent == NULL) return n;                      /* empty tree: n is the new root */
    if (key < parent->key) parent->left = n;
    else                    parent->right = n;
    return root;
}

static int height(Node *n) {
    if (n == NULL) return -1;
    int l = height(n->left), r = height(n->right);
    return 1 + (l > r ? l : r);
}

static void print_inorder(Node *n) {
    if (n == NULL) return;
    print_inorder(n->left);
    printf(" %d", n->key);
    print_inorder(n->right);
}

static void free_tree(Node *n) {
    if (n == NULL) return;
    free_tree(n->left);
    free_tree(n->right);
    free(n);
}

static void run_scenario(const char *label, const int keys[], int n) {
    printf("-- %s --\n", label);
    Node *root = NULL;
    for (int i = 0; i < n; i++) {
        root = bst_insert(root, keys[i]);
        printf("insert(%d): inorder =", keys[i]);
        print_inorder(root);
        printf("  height = %d\n", height(root));
    }
    printf("\n");
    free_tree(root);
}

int main(void) {
    int normal[] = {50, 30, 70, 20, 40, 60, 80, 35, 65, 90};
    run_scenario("normal: 10 keys, a moderately mixed order", normal, 10);

    int hard[] = {10, -5, 25, 10, -20, 5, 17, 30, -5, 3, 22, 40, -15, 12};
    run_scenario("hard: 14 keys, negative values and a repeat", hard, 14);

    int dup[] = {8, 8, 3, 8, 3, 15, 3, 8, 15, 8};
    run_scenario("edge: 10 values, only 3 distinct keys", dup, 10);

    int sorted[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    run_scenario("edge: 10 keys in ascending order -- forms a near-chain", sorted, 10);

    int single[] = {42};
    run_scenario("edge: a single key", single, 1);

    return 0;
}
