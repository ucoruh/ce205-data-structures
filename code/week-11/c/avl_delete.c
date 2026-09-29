/* Week 11 -- Advanced Trees
 * AVL tree: delete. Splicing is exactly bst_delete.c's leaf / one-child / two-children (successor) logic;
 * afterwards rebalance() is applied at EVERY ancestor on the way back up (a delete can rotate more than
 * once, unlike an insert).
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
    if (n == NULL) return NULL;
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
    if (key == root->key) return root;
    if (key < root->key) root->left  = avl_insert(root->left, key);
    else                  root->right = avl_insert(root->right, key);
    update_height(root);
    return rebalance(root);
}

Node *avl_delete(Node *root, int key) {
    if (root == NULL) return NULL;                      /* not found: no-op */
    if (key < root->key)      root->left  = avl_delete(root->left, key);
    else if (key > root->key) root->right = avl_delete(root->right, key);
    else {
        if (root->left == NULL)  { Node *r = root->right; free(root); return rebalance(r); }
        if (root->right == NULL) { Node *l = root->left;  free(root); return rebalance(l); }
        Node *succ = root->right;
        while (succ->left != NULL) succ = succ->left;
        root->key = succ->key;
        root->right = avl_delete(root->right, succ->key);
    }
    update_height(root);
    return rebalance(root);
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
    for (int i = 0; i < nk; i++) root = avl_insert(root, keys[i]);
    printf("built from %d keys, height = %d\n", nk, height(root));
    for (int i = 0; i < nd; i++) {
        root = avl_delete(root, dels[i]);
        printf("delete(%d): height = %d, inorder =", dels[i], height(root));
        print_inorder(root);
        printf("\n");
    }
    printf("\n");
    free_tree(root);
}

int main(void) {
    int normal_keys[] = {50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 90};
    int normal_dels[] = {10, 25, 90, 50};
    run_scenario("normal: 12 keys, 4 deletes (a mix of leaf/one-child/two-children)", normal_keys, 12, normal_dels, 4);

    int hard_keys[] = {50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85, 90};
    int hard_dels[] = {90, 85, 80, 75, 55, 45};
    run_scenario("hard: 16 keys, 6 deletes, rebalancing cascades", hard_keys, 16, hard_dels, 6);

    int nf_keys[] = {50, 30, 70, 20, 40, 60, 80, 10, 45, 90};
    int nf_dels[] = {999, 30, -1000};
    run_scenario("edge: deleting a key that is not there (no-op)", nf_keys, 10, nf_dels, 3);

    int empty_keys[] = {5, 3, 8, 1, 4, 7, 9, 2, 6, 10};
    int empty_dels[] = {10, 6, 2, 9, 7, 4, 1, 8, 3, 5};
    run_scenario("edge: delete every key, down to empty (stays balanced at every step)", empty_keys, 10, empty_dels, 10);

    int single_keys[] = {7};
    int single_dels[] = {7};
    run_scenario("edge: delete the only node", single_keys, 1, single_dels, 1);

    return 0;
}
