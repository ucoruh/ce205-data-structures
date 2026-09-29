/* Week 14 -- File Organisation II
 * B-tree search (order m): descend from the root comparing the target against each page's
 * keys; every page visited is one disk read.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int keys[16];
    int n;
    struct Node *child[17];
    bool leaf;
    struct Node *parent;
} Node;

static Node *new_node(bool leaf) {
    Node *node = calloc(1, sizeof *node);
    node->leaf = leaf;
    return node;
}

static void insert_sorted(Node *node, int key) {
    int i = node->n - 1;
    while (i >= 0 && node->keys[i] > key) {
        node->keys[i + 1] = node->keys[i];
        i--;
    }
    node->keys[i + 1] = key;
    node->n++;
}

static Node *split(Node *node, int *median_out) {
    int mid = node->n / 2;
    *median_out = node->keys[mid];
    Node *right = new_node(node->leaf);
    for (int i = mid + 1; i < node->n; i++)
        right->keys[right->n++] = node->keys[i];
    if (!node->leaf)
        for (int i = mid + 1; i <= node->n; i++) {
            right->child[i - mid - 1] = node->child[i];
            right->child[i - mid - 1]->parent = right;
        }
    node->n = mid;
    return right;
}

static Node *tree_insert(Node *root, int order, int key) {
    Node *leaf = root;
    while (!leaf->leaf) {
        int i = 0;
        while (i < leaf->n && key > leaf->keys[i])
            i++;
        leaf = leaf->child[i];
    }
    insert_sorted(leaf, key);
    Node *cur = leaf;
    while (cur->n == order) {
        int median;
        Node *right = split(cur, &median);
        if (cur->parent == NULL) {
            Node *new_root = new_node(false);
            new_root->keys[new_root->n++] = median;
            new_root->child[0] = cur;
            new_root->child[1] = right;
            cur->parent = new_root;
            right->parent = new_root;
            return new_root;
        }
        insert_sorted(cur->parent, median);
        Node *parent = cur->parent;
        int pos = 0;
        while (parent->child[pos] != cur)
            pos++;
        for (int i = parent->n; i > pos + 1; i--)
            parent->child[i] = parent->child[i - 1];
        parent->child[pos + 1] = right;
        right->parent = parent;
        cur = parent;
    }
    return root;
}

/* Returns the node containing `key` (and its index via *out_idx), or NULL if absent.
 * *reads is incremented once per page visited. */
bool b_tree_search(Node *node, int key, int *out_idx, Node **out_node, int *reads) {
    while (node != NULL) {
        (*reads)++;
        int i = 0;
        while (i < node->n && key > node->keys[i])
            i++;
        if (i < node->n && key == node->keys[i]) {
            *out_idx = i;
            *out_node = node;
            return true;
        }
        if (node->leaf)
            return false;
        node = node->child[i];
    }
    return false;
}

static void free_tree(Node *node) {
    if (node == NULL)
        return;
    if (!node->leaf)
        for (int i = 0; i <= node->n; i++)
            free_tree(node->child[i]);
    free(node);
}

static void run_scenario(const char *label, int order, const int keys[], int n, const int queries[], int qn) {
    printf("-- %s --\n", label);
    printf("ORDER=%d\n", order);
    Node *root = new_node(true);
    for (int i = 0; i < n; i++)
        root = tree_insert(root, order, keys[i]);

    int total_reads = 0;
    for (int q = 0; q < qn; q++) {
        int idx = -1, reads = 0;
        Node *found_node = NULL;
        bool found = b_tree_search(root, queries[q], &idx, &found_node, &reads);
        total_reads += reads;
        const char *unit = reads == 1 ? "read" : "reads";
        printf("search(%d) -> %s (%d %s)\n", queries[q], found ? "found" : "not found", reads, unit);
    }
    printf("total reads: %d\n", total_reads);
    free_tree(root);
    printf("\n");
}

int main(void) {
    const int normal_keys[] = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
    const int normal_q[] = {17, 99, 3};
    run_scenario("normal: order=4, 12 keys, 3 searches", 4, normal_keys, 12, normal_q, 3);

    const int hard_keys[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
    const int hard_q[] = {1, 14, 7, 100};
    run_scenario("hard: order=3, 14 ascending keys, 4 searches", 3, hard_keys, 14, hard_q, 4);

    const int root_keys[] = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
    const int root_q[] = {12};
    run_scenario("edge: a key found right at the root", 4, root_keys, 12, root_q, 1);

    const int never_keys[] = {23, 5, 41, 12, 38, 7, 29, 16, 44, 3};
    const int never_q[] = {41, 100, 3};
    run_scenario("edge: order=12, single node, every search is 1 read", 12, never_keys, 10, never_q, 3);
    return 0;
}
