/* Week 11 -- Advanced Trees
 * Binary search tree (BST): delete (leaf / one child / two children with successor).
 * CEN207 Data Structures (formerly CE205)
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

Node *bst_delete(Node *root, int key) {
    Node *cur = root, *parent = NULL;
    while (cur != NULL && key != cur->key) {
        parent = cur;
        cur = (key < cur->key) ? cur->left : cur->right;
    }
    if (cur == NULL) return root;                     /* not found: no-op */
    if (cur->left != NULL && cur->right != NULL) {
        Node *succ = cur->right, *succParent = cur;
        while (succ->left != NULL) { succParent = succ; succ = succ->left; }
        cur->key = succ->key;                          /* copy successor key up */
        parent = succParent;
        cur = succ;                                    /* now splice out succ: <= 1 child */
    }
    Node *child = (cur->left != NULL) ? cur->left : cur->right;
    if (parent == NULL)           root = child;
    else if (parent->left == cur) parent->left  = child;
    else                          parent->right = child;
    free(cur);
    return root;
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

static void run_scenario(const char *label, const int keys[], int nk, const int dels[], int nd) {
    printf("-- %s --\n", label);
    Node *root = NULL;
    for (int i = 0; i < nk; i++) root = bst_build_insert(root, keys[i]);
    printf("tree built from %d keys, inorder =", nk);
    print_inorder(root);
    printf("\n");
    for (int i = 0; i < nd; i++) {
        root = bst_delete(root, dels[i]);
        printf("delete(%d): inorder =", dels[i]);
        print_inorder(root);
        printf("\n");
    }
    printf("\n");
    free_tree(root);
}

int main(void) {
    int normal_keys[] = {50, 30, 70, 20, 40, 60, 80, 35, 65, 90};
    int normal_dels[] = {35, 70, 50, 20};
    run_scenario("normal: 10 keys, 4 deletes (a mix of leaf, one-child, two-children)", normal_keys, 10, normal_dels, 4);

    int hard_keys[] = {10, -5, 25, 40, -20, 5, 17, 30, 45, 3, 22, -15, 12, 60};
    int hard_dels[] = {-5, 40, 10, 17, 60, 3};
    run_scenario("hard: 14 keys with negative values, 6 deletes (including the root)", hard_keys, 14, hard_dels, 6);

    int nf_keys[] = {50, 30, 70, 20, 40, 60, 80, 10, 45, 90};
    int nf_dels[] = {999, 30, -1000};
    run_scenario("edge: trying to delete a key that is not there (no-op)", nf_keys, 10, nf_dels, 3);

    int empty_keys[] = {5, 3, 8, 1, 4, 7, 9, 2, 6, 10};
    int empty_dels[] = {10, 6, 2, 9, 7, 4, 1, 8, 3, 5};
    run_scenario("edge: delete every key, down to an empty tree", empty_keys, 10, empty_dels, 10);

    int single_keys[] = {7};
    int single_dels[] = {7};
    run_scenario("edge: delete the only node", single_keys, 1, single_dels, 1);

    return 0;
}
