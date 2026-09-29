/* Week 11 -- Advanced Trees
 * 2-3 tree: insert (growing upward via node splits).
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int nkeys;               /* 1 or 2 (briefly 3 mid-overflow, before it is split) */
    int key[3];
    struct Node *child[4];   /* nkeys + 1 children, or none if a leaf (briefly 4 mid-overflow) */
} Node;

static Node *make_leaf(int key) {
    Node *n = malloc(sizeof(Node));
    n->nkeys = 1; n->key[0] = key;
    n->child[0] = n->child[1] = n->child[2] = n->child[3] = NULL;
    return n;
}

static int is_leaf(Node *n) { return n->child[0] == NULL; }

static int child_index(Node *n, int key) {
    int i = 0;
    while (i < n->nkeys && key > n->key[i]) i++;
    return i;
}

static int leaf_has(Node *n, int key) {
    for (int i = 0; i < n->nkeys; i++) if (n->key[i] == key) return 1;
    return 0;
}

static void insert_sorted(Node *n, int key) {
    n->key[n->nkeys] = key;
    n->nkeys++;
    for (int i = n->nkeys - 1; i > 0 && n->key[i] < n->key[i - 1]; i--) {
        int tmp = n->key[i]; n->key[i] = n->key[i - 1]; n->key[i - 1] = tmp;
    }
}

static void split_node(Node *node, Node **left, Node **right, int *promoted) {
    int k0 = node->key[0], k1 = node->key[1], k2 = node->key[2];
    if (is_leaf(node)) {
        *left = make_leaf(k0);
        *right = make_leaf(k2);
    } else {
        *left = malloc(sizeof(Node));
        (*left)->nkeys = 1; (*left)->key[0] = k0;
        (*left)->child[0] = node->child[0]; (*left)->child[1] = node->child[1]; (*left)->child[2] = NULL; (*left)->child[3] = NULL;
        *right = malloc(sizeof(Node));
        (*right)->nkeys = 1; (*right)->key[0] = k2;
        (*right)->child[0] = node->child[2]; (*right)->child[1] = node->child[3]; (*right)->child[2] = NULL; (*right)->child[3] = NULL;
    }
    *promoted = k1;
}

static void replace_with_split(Node *parent, Node *old, int promoted, Node *left, Node *right) {
    int idx = 0;
    while (parent->child[idx] != old) idx++;
    for (int i = parent->nkeys; i > idx; i--) parent->child[i + 1] = parent->child[i];
    for (int i = parent->nkeys - 1; i >= idx; i--) parent->key[i + 1] = parent->key[i];
    parent->key[idx] = promoted;
    parent->child[idx] = left;
    parent->child[idx + 1] = right;
    parent->nkeys++;
}

Node *insert(Node *root, int key) {
    if (root == NULL) return make_leaf(key);
    Node *path[32]; int depth = 0;
    Node *cur = root;
    while (cur->child[0] != NULL) {                    /* walk down to the right leaf */
        path[depth++] = cur;
        int i = child_index(cur, key);
        if (i < cur->nkeys && cur->key[i] == key) return root;   /* duplicate: unchanged */
        cur = cur->child[i];
    }
    if (leaf_has(cur, key)) return root;                /* duplicate: unchanged */
    insert_sorted(cur, key);                            /* leaf now has 2 or 3 keys */
    Node *node = cur;
    while (node->nkeys == 3) {                          /* overflow: split and promote the middle key */
        Node *left, *right; int promoted;
        split_node(node, &left, &right, &promoted);
        if (depth == 0) {
            Node *nr = malloc(sizeof(Node));
            nr->nkeys = 1; nr->key[0] = promoted;
            nr->child[0] = left; nr->child[1] = right; nr->child[2] = NULL; nr->child[3] = NULL;
            free(node);                                 /* its key(s)/children were copied into left/right */
            return nr;                                  /* root split: height + 1 */
        }
        Node *parent = path[--depth];
        replace_with_split(parent, node, promoted, left, right);
        free(node);                                     /* its key(s)/children were copied into left/right */
        node = parent;
    }
    return root;
}

static void print_node(Node *n) {
    printf("[");
    for (int i = 0; i < n->nkeys; i++) printf(i ? ",%d" : "%d", n->key[i]);
    printf("]");
}

static void print_level_order(Node *root) {
    Node *queue[256]; int qh = 0, qt = 0;
    queue[qt++] = root;
    while (qh < qt) {
        Node *n = queue[qh++];
        print_node(n);
        printf(" ");
        if (!is_leaf(n)) for (int i = 0; i <= n->nkeys; i++) queue[qt++] = n->child[i];
    }
}

static int tree_height(Node *n) {
    if (n == NULL || is_leaf(n)) return 0;
    return 1 + tree_height(n->child[0]);
}

static void free_tree(Node *n) {
    if (n == NULL) return;
    if (!is_leaf(n)) for (int i = 0; i <= n->nkeys; i++) free_tree(n->child[i]);
    free(n);
}

static void run_scenario(const char *label, const int keys[], int n) {
    printf("-- %s --\n", label);
    Node *root = NULL;
    for (int i = 0; i < n; i++) {
        root = insert(root, keys[i]);
        printf("insert(%d): height = %d, level-order = ", keys[i], tree_height(root));
        print_level_order(root);
        printf("\n");
    }
    printf("\n");
    free_tree(root);
}

int main(void) {
    int normal[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    run_scenario("normal: 10 keys in ascending order -- a few splits", normal, 10);

    int hard[] = {50, 30, 70, 20, 40, 60, 80, 10, 90, 25, 35, 45, 55, 65};
    run_scenario("hard: 14 keys, the root splits and the height grows", hard, 14);

    int dup[] = {8, 8, 3, 8, 15, 3, 20, 3, 15, 8};
    run_scenario("edge: 10 values, many repeats", dup, 10);

    int desc[] = {100, 90, 80, 70, 60, 50, 40, 30, 20, 10};
    run_scenario("edge: 10 keys in descending order", desc, 10);

    int single[] = {7};
    run_scenario("edge: a single key", single, 1);

    return 0;
}
