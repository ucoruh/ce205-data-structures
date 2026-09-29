/* Week 11 -- Advanced Trees
 * AVL tree: the four rebalancing cases (LL, RR, LR, RL). insert() is the standard recursive AVL insert;
 * rebalance() decides the case from the balance factors (not from the just-inserted key) and records which
 * one fired in last_case, purely so this program can print it.
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

const char *last_case;

Node *rebalance(Node *n) {
    int bf = height(n->left) - height(n->right);
    if (bf > 1  && height(n->left->left)  >= height(n->left->right))  { last_case = "LL"; return rotate_right(n); }
    if (bf > 1)  { n->left  = rotate_left(n->left);   last_case = "LR"; return rotate_right(n); }
    if (bf < -1 && height(n->right->right) >= height(n->right->left)) { last_case = "RR"; return rotate_left(n); }
    if (bf < -1) { n->right = rotate_right(n->right); last_case = "RL"; return rotate_left(n); }
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
        last_case = "none";
        root = avl_insert(root, keys[i]);
        int bf = height(root->left) - height(root->right);
        printf("insert(%d): case = %-4s  root = %d  bf(root) = %d  height = %d\n",
               keys[i], last_case, root->key, bf, height(root));
    }
    printf("\n");
    free_tree(root);
}

int main(void) {
    int ll[] = {50, 30, 70, 20, 40, 60, 80, 10, 45, 5};
    run_scenario("LL case: a single right rotation", ll, 10);

    int rr[] = {50, 30, 70, 20, 40, 60, 80, 55, 90, 95};
    run_scenario("RR case: a single left rotation", rr, 10);

    int lr[] = {50, 70, 30, 80, 60, 40, 20, 55, 35, 36};
    run_scenario("LR case: a double rotation (left-right)", lr, 10);

    int rl[] = {50, 30, 70, 20, 40, 60, 80, 45, 65, 41};
    run_scenario("RL case: a double rotation (right-left)", rl, 10);

    int none[] = {50, 30, 70, 20, 40, 60, 80, 10, 90, 25};
    run_scenario("edge: an insertion that needs no rotation at all", none, 10);

    return 0;
}
