/* Week 14 -- File Organisation II
 * B-tree insert (order m): every node is one disk page; overflow splits a page in two and
 * pushes its median key up, growing the tree upward when the root itself splits.
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
    int id;
} Node;

static int next_id;

static Node *new_node(bool leaf) {
    Node *node = calloc(1, sizeof *node);
    node->leaf = leaf;
    node->id = ++next_id;
    return node;
}

void insert_sorted(Node *node, int key) {
    int i = node->n - 1;
    while (i >= 0 && node->keys[i] > key) {
        node->keys[i + 1] = node->keys[i];
        i--;
    }
    node->keys[i + 1] = key;
    node->n++;
}

Node *split(Node *node, int *median_out) {
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

Node *b_tree_insert(Node *root, int order, int key) {
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

static void free_tree(Node *node) {
    if (node == NULL)
        return;
    if (!node->leaf)
        for (int i = 0; i <= node->n; i++)
            free_tree(node->child[i]);
    free(node);
}

static int tree_height(const Node *node) {
    if (node->leaf)
        return 0;
    int best = 0;
    for (int i = 0; i <= node->n; i++) {
        int h = tree_height(node->child[i]);
        if (h > best)
            best = h;
    }
    return best + 1;
}

static int node_count(const Node *node) {
    if (node->leaf)
        return 1;
    int count = 1;
    for (int i = 0; i <= node->n; i++)
        count += node_count(node->child[i]);
    return count;
}

static void print_level_order(Node *root) {
    Node *queue[256];
    int level_end[256];
    int qh = 0, qt = 0;
    queue[qt++] = root;
    level_end[0] = 1;
    int level = 0, printed_in_level = 0;
    printf("level 0:");
    while (qh < qt) {
        Node *node = queue[qh++];
        printf(" [");
        for (int i = 0; i < node->n; i++)
            printf("%s%d", i ? "," : "", node->keys[i]);
        printf("]");
        if (!node->leaf)
            for (int i = 0; i <= node->n; i++)
                queue[qt++] = node->child[i];
        printed_in_level++;
        if (qh == level_end[level] && qt > qh) {
            printf("\n");
            level++;
            printf("level %d:", level);
            level_end[level] = qt;
            printed_in_level = 0;
        }
    }
    (void) printed_in_level;
    printf("\n");
}

static void run_scenario(const char *label, int order, const int keys[], int n) {
    printf("-- %s --\n", label);
    printf("ORDER=%d\n", order);
    Node *root = new_node(true);
    for (int i = 0; i < n; i++)
        root = b_tree_insert(root, order, keys[i]);
    print_level_order(root);
    printf("nodes=%d height=%d\n", node_count(root), tree_height(root));
    free_tree(root);
    printf("\n");
}

int main(void) {
    next_id = 0;
    const int normal_keys[] = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
    run_scenario("normal: order=4, 12 mixed keys", 4, normal_keys, 12);

    const int hard_keys[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
    run_scenario("hard: order=3, 14 ascending keys (worst case)", 3, hard_keys, 14);

    const int desc_keys[] = {95, 85, 75, 65, 55, 45, 35, 25, 15, 5};
    run_scenario("edge: order=3, 10 descending keys", 3, desc_keys, 10);

    const int never_keys[] = {23, 5, 41, 12, 38, 7, 29, 16, 44, 3};
    run_scenario("edge: order=12, 10 keys -- never splits", 12, never_keys, 10);
    return 0;
}
