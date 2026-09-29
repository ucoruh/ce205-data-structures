/* Week 14 -- File Organisation II
 * B+-tree: every key lives in a LEAF (internal nodes only route); leaves are linked into a
 * chain, so a range query descends once and then just walks the chain.
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
    struct Node *next; /* leaf chain; NULL for internal nodes and the last leaf */
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

static Node *insert_into_parent(Node *left, int key, Node *right) {
    if (left->parent == NULL) {
        Node *new_root = new_node(false);
        new_root->keys[new_root->n++] = key;
        new_root->child[0] = left;
        new_root->child[1] = right;
        left->parent = new_root;
        right->parent = new_root;
        return new_root;
    }
    Node *parent = left->parent;
    insert_sorted(parent, key);
    int pos = 0;
    while (parent->child[pos] != left)
        pos++;
    for (int i = parent->n; i > pos + 1; i--)
        parent->child[i] = parent->child[i - 1];
    parent->child[pos + 1] = right;
    right->parent = parent;
    return NULL; /* not a new root */
}

static Node *b_plus_insert(Node *root, int order, int key) {
    Node *node = root;
    while (!node->leaf) {
        int i = 0;
        while (i < node->n && key >= node->keys[i])
            i++;
        node = node->child[i];
    }
    insert_sorted(node, key);
    if (node->n != order)
        return root;

    int mid = (node->n + 1) / 2;
    int copy_up = node->keys[mid];
    Node *right = new_node(true);
    for (int i = mid; i < node->n; i++)
        right->keys[right->n++] = node->keys[i];
    right->next = node->next;
    node->next = right;
    node->n = mid;
    Node *new_root = insert_into_parent(node, copy_up, right);
    if (new_root)
        root = new_root;

    Node *cur = node->parent;
    while (cur != NULL && cur->n == order) {
        int mid2 = cur->n / 2;
        int push_up = cur->keys[mid2];
        Node *right_i = new_node(false);
        for (int i = mid2 + 1; i < cur->n; i++)
            right_i->keys[right_i->n++] = cur->keys[i];
        for (int i = mid2 + 1; i <= cur->n; i++) {
            right_i->child[i - mid2 - 1] = cur->child[i];
            right_i->child[i - mid2 - 1]->parent = right_i;
        }
        cur->n = mid2;
        Node *new_root2 = insert_into_parent(cur, push_up, right_i);
        if (new_root2) {
            root = new_root2;
            break;
        }
        cur = cur->parent;
    }
    return root;
}

static Node *first_leaf(Node *node) {
    while (!node->leaf)
        node = node->child[0];
    return node;
}

/* Descend once to the first leaf that could hold `lo`, then follow the LEAF CHAIN. */
int range_query(Node *root, int lo, int hi, int out[], int max_out) {
    Node *node = root;
    while (!node->leaf) {
        int i = 0;
        while (i < node->n && lo >= node->keys[i])
            i++;
        node = node->child[i];
    }
    int count = 0;
    while (node != NULL) {
        for (int i = 0; i < node->n; i++)
            if (node->keys[i] >= lo && node->keys[i] <= hi && count < max_out)
                out[count++] = node->keys[i];
        if (node->n > 0 && node->keys[node->n - 1] > hi)
            break; /* past hi: stop */
        node = node->next; /* follow the chain, no re-descent */
    }
    return count;
}

static void free_tree(Node *node, Node **freed, int *nf) {
    if (node == NULL)
        return;
    for (int i = 0; i < *nf; i++)
        if (freed[i] == node)
            return; /* already scheduled (leaves reached both via child[] and next) */
    freed[(*nf)++] = node;
    if (!node->leaf)
        for (int i = 0; i <= node->n; i++)
            free_tree(node->child[i], freed, nf);
}

static void run_scenario(const char *label, int order, const int keys[], int n,
                          const int ranges[][2], int rn) {
    printf("-- %s --\n", label);
    printf("ORDER=%d\n", order);
    Node *root = new_node(true);
    for (int i = 0; i < n; i++)
        root = b_plus_insert(root, order, keys[i]);

    printf("leaves:");
    for (Node *leaf = first_leaf(root); leaf != NULL; leaf = leaf->next) {
        printf(" [");
        for (int i = 0; i < leaf->n; i++)
            printf("%s%d", i ? "," : "", leaf->keys[i]);
        printf("]");
    }
    printf("\n");

    for (int i = 0; i < rn; i++) {
        int out[64];
        int count = range_query(root, ranges[i][0], ranges[i][1], out, 64);
        printf("range(%d,%d) ->", ranges[i][0], ranges[i][1]);
        for (int k = 0; k < count; k++)
            printf(" %d", out[k]);
        if (count == 0)
            printf(" (none)");
        printf("\n");
    }
    Node *freed[64];
    int nf = 0;
    free_tree(root, freed, &nf);
    for (int i = 0; i < nf; i++)
        free(freed[i]);
    printf("\n");
}

int main(void) {
    const int normal_keys[] = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
    const int normal_ranges[][2] = {{6, 18}, {26, 100}, {15, 15}};
    run_scenario("normal: order=4, 12 keys, 3 range queries", 4, normal_keys, 12, normal_ranges, 3);

    const int hard_keys[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
    const int hard_ranges[][2] = {{3, 11}, {50, 60}};
    run_scenario("hard: order=3, 14 keys, a long chain walk", 3, hard_keys, 14, hard_ranges, 2);

    const int whole_keys[] = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
    const int whole_ranges[][2] = {{0, 999}};
    run_scenario("edge: a range covering every key", 4, whole_keys, 12, whole_ranges, 1);

    const int empty_keys[] = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
    const int empty_ranges[][2] = {{1000, 2000}, {-50, -1}};
    run_scenario("edge: a range matching no key", 4, empty_keys, 12, empty_ranges, 2);
    return 0;
}
