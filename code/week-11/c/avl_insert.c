/* Week 11 -- Advanced Trees
 * AVL tree: insert, with the balance factor bf = height(left) - height(right) shown for every step.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
    int height;
} Node;

static int height(Node *n) { return n ? n->height : -1; }
static int max2(int a, int b) { return a > b ? a : b; }
static void update_height(Node *n) { n->height = 1 + max2(height(n->left), height(n->right)); }

static Node *rotate_right(Node *y) {
    Node *x = y->left;
    y->left = x->right;
    x->right = y;
    update_height(y);
    update_height(x);
    return x;
}

static Node *rotate_left(Node *x) {
    Node *y = x->right;
    x->right = y->left;
    y->left = x;
    update_height(x);
    update_height(y);
    return y;
}

Node *rebalance(Node *n) {
    int bf = height(n->left) - height(n->right);
    if (bf > 1  && height(n->left->left)  >= height(n->left->right))  return rotate_right(n);
    if (bf > 1)  { n->left  = rotate_left(n->left);   return rotate_right(n); }
    if (bf < -1 && height(n->right->right) >= height(n->right->left)) return rotate_left(n);
    if (bf < -1) { n->right = rotate_right(n->right); return rotate_left(n); }
    return n;
}

static Node *make_leaf(int key) {
    Node *n = malloc(sizeof(Node));
    n->key = key; n->left = NULL; n->right = NULL; n->height = 0;
    return n;
}

Node *avl_insert(Node *root, int key) {
    if (root == NULL) return make_leaf(key);
    if (key == root->key) return root;                 /* duplicate: unchanged */
    if (key < root->key) root->left  = avl_insert(root->left, key);
    else                  root->right = avl_insert(root->right, key);
    update_height(root);
    return rebalance(root);
}

static void print_inorder_bf(Node *n) {
    if (n == NULL) return;
    print_inorder_bf(n->left);
    printf(" %d(bf=%d)", n->key, height(n->left) - height(n->right));
    print_inorder_bf(n->right);
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
        root = avl_insert(root, keys[i]);
        printf("insert(%d): height = %d, inorder(bf) =", keys[i], height(root));
        print_inorder_bf(root);
        printf("\n");
    }
    printf("\n");
    free_tree(root);
}

int main(void) {
    int normal[] = {6, 74, 51, 56, 26, 66, 98, 2, 9, 72};
    run_scenario("normal: 10 keys, includes two double rotations (LR, RL)", normal, 10);

    int hard[] = {71, 5, 59, 157, 87, 56, 131, 141, -44, 159, -14, -18, 158, -48};
    run_scenario("hard: 14 keys with negative values, all four cases (LL/RR/LR/RL) occur", hard, 14);

    int asc[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    run_scenario("edge: 10 keys in ascending order -- AVL still stays balanced", asc, 10);

    int desc[] = {100, 90, 80, 70, 60, 50, 40, 30, 20, 10};
    run_scenario("edge: 10 keys in descending order", desc, 10);

    int dup[] = {8, 8, 3, 8, 15, 3, 20, 3, 15, 8};
    run_scenario("edge: 10 values, many repeats", dup, 10);

    return 0;
}
