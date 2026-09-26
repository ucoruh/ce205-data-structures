/* Week 4 -- Trees, Heaps, and Huffman Coding
 * Binary tree shapes: full, complete, perfect, degenerate, height-balanced.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <limits.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#define SLOT_NONE INT_MIN
#define MAX_NODES 32

typedef struct Node {
    int value;
    struct Node *left, *right;
} Node;

static Node *new_node(int value) {
    Node *n = malloc(sizeof(Node));
    n->value = value;
    n->left = NULL;
    n->right = NULL;
    return n;
}

static Node *build_tree(const int arr[], int n, int i) {
    if (i >= n || arr[i] == SLOT_NONE) return NULL;
    Node *node = new_node(arr[i]);
    node->left = build_tree(arr, n, 2 * i + 1);
    node->right = build_tree(arr, n, 2 * i + 2);
    return node;
}

static Node *build_left_chain(const int values[], int n) {
    Node *root = NULL, *tail = NULL;
    for (int i = 0; i < n; i++) {
        Node *node = new_node(values[i]);
        if (root == NULL) root = node; else tail->left = node;
        tail = node;
    }
    return root;
}

/* A full binary tree (every node 0 or 2 children) shaped like a caterpillar: at each spine level one
 * child is a leaf and the other continues the spine -- maximally unbalanced and far from complete.
 * Always has an ODD node count: 2*spine + 1. */
static Node *build_full_caterpillar(int spine, int start, int step) {
    int val = start;
    Node *root = new_node(val); val += step;
    Node *cur = root;
    for (int i = 0; i < spine; i++) {
        cur->left = new_node(val); val += step;       /* one child is always a leaf */
        cur->right = new_node(val); val += step;
        if (i != spine - 1) cur = cur->right;          /* continue the spine, except on the last step */
    }
    return root;
}

/* full: every node has 0 or 2 children (never exactly 1) */
static bool is_full(Node *n) {
    if (n == NULL) return true;
    bool has_l = n->left != NULL, has_r = n->right != NULL;
    if (has_l != has_r) return false;       /* exactly one child: not full */
    return is_full(n->left) && is_full(n->right);
}

/* complete: walking level by level, once a NULL is seen no real node may follow it */
static bool is_complete(Node *root) {
    Node *queue[MAX_NODES]; int front = 0, rear = 0;
    queue[rear++] = root;
    bool seen_gap = false;
    while (front < rear) {
        Node *n = queue[front++];
        if (n == NULL) { seen_gap = true; continue; }
        if (seen_gap) return false;         /* a real node after a gap */
        queue[rear++] = n->left;
        queue[rear++] = n->right;
    }
    return true;
}

/* perfect: full AND every leaf on the same level */
static bool is_perfect(Node *n, int depth, int *leaf_depth) {
    if (n == NULL) return true;
    if (n->left == NULL && n->right == NULL) {
        if (*leaf_depth == -1) *leaf_depth = depth;
        return depth == *leaf_depth;
    }
    if (n->left == NULL || n->right == NULL) return false;   /* not full */
    return is_perfect(n->left, depth + 1, leaf_depth) && is_perfect(n->right, depth + 1, leaf_depth);
}

/* degenerate: no node has two children (every node has 0 or 1) */
static bool is_degenerate(Node *n) {
    if (n == NULL) return true;
    if (n->left != NULL && n->right != NULL) return false;   /* two children: not degenerate */
    return is_degenerate(n->left) && is_degenerate(n->right);
}

/* balanced: |height(left) - height(right)| <= 1 at every node; -1 means "unbalanced already found" */
static int check_balance(Node *n) {
    if (n == NULL) return 0;
    int hl = check_balance(n->left);
    if (hl == -1) return -1;
    int hr = check_balance(n->right);
    if (hr == -1) return -1;
    if (abs(hl - hr) > 1) return -1;      /* found an unbalanced node */
    return 1 + (hl > hr ? hl : hr);
}

static void classify(const char *label, Node *root) {
    printf("-- %s --\n", label);
    int leaf_depth = -1;
    bool full = is_full(root);
    bool complete = is_complete(root);
    bool perfect = is_perfect(root, 0, &leaf_depth);
    bool degenerate = is_degenerate(root);
    int balance = check_balance(root);
    printf("full=%s, complete=%s, perfect=%s, degenerate=%s, balanced=%s\n",
           full ? "true" : "false",
           complete ? "true" : "false",
           perfect ? "true" : "false",
           degenerate ? "true" : "false",
           balance != -1 ? "true" : "false");
    printf("\n");
}

static void free_tree(Node *node) {
    if (node == NULL) return;
    free_tree(node->left);
    free_tree(node->right);
    free(node);
}

int main(void) {
    /* normal: 12 nodes, complete but not perfect */
    int normal_arr[] = {50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55};
    Node *normal_root = build_tree(normal_arr, 12, 0);
    classify("normal: 12 nodes, complete but not perfect", normal_root);
    free_tree(normal_root);

    /* hard: 17 nodes, full but not complete and unbalanced -- a "caterpillar" tree */
    Node *caterpillar_root = build_full_caterpillar(8, 100, 5);
    classify("hard: 17 nodes, full but not complete -- a caterpillar tree", caterpillar_root);
    free_tree(caterpillar_root);

    /* edge: a perfect tree, 15 nodes, 4 full levels */
    int perfect_arr[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
    Node *perfect_root = build_tree(perfect_arr, 15, 0);
    classify("edge: perfect tree, 15 nodes", perfect_root);
    free_tree(perfect_root);

    /* edge: a left-leaning chain (degenerate), 10 nodes */
    int chain_values[] = {90, 84, 78, 72, 66, 60, 54, 48, 42, 36};
    Node *chain_root = build_left_chain(chain_values, 10);
    classify("edge: left-leaning chain (degenerate), 10 nodes", chain_root);
    free_tree(chain_root);

    /* edge: complete but NOT full, 10 nodes */
    int complete_not_full_arr[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    Node *complete_not_full_root = build_tree(complete_not_full_arr, 10, 0);
    classify("edge: complete but NOT full, 10 nodes", complete_not_full_root);
    free_tree(complete_not_full_root);

    /* edge: balanced but NOT complete, 11 nodes */
    int balanced_not_complete_arr[] = {1, 2, 3, 4, 5, 6, 7, 8, SLOT_NONE, 9, SLOT_NONE, 10, SLOT_NONE, 11};
    Node *balanced_not_complete_root = build_tree(balanced_not_complete_arr, 14, 0);
    classify("edge: balanced but NOT complete, 11 nodes", balanced_not_complete_root);
    free_tree(balanced_not_complete_root);

    return 0;
}
