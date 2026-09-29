/* Week 14 -- File Organisation II
 * B-tree delete (order m): remove a key, then fix underflow by BORROWING a key from a sibling
 * through the parent, or MERGING with a sibling when no sibling can spare one.
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

static int min_keys(int order) { return (order + 1) / 2 - 1; }

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

static void remove_at(Node *node, int idx) {
    for (int i = idx; i < node->n - 1; i++)
        node->keys[i] = node->keys[i + 1];
    node->n--;
}

static int child_index(Node *parent, Node *child) {
    int i = 0;
    while (parent->child[i] != child)
        i++;
    return i;
}

static void fix_underflow(Node *node, int order) {
    int min_k = min_keys(order);
    while (node->parent != NULL && node->n < min_k) {
        Node *parent = node->parent;
        int idx = child_index(parent, node);
        Node *left = idx > 0 ? parent->child[idx - 1] : NULL;
        Node *right = idx < parent->n ? parent->child[idx + 1] : NULL;

        if (left != NULL && left->n > min_k) {
            for (int i = node->n; i > 0; i--)
                node->keys[i] = node->keys[i - 1];
            node->keys[0] = parent->keys[idx - 1];
            node->n++;
            parent->keys[idx - 1] = left->keys[left->n - 1];
            left->n--;
            if (!node->leaf) {
                for (int i = node->n; i > 0; i--)
                    node->child[i] = node->child[i - 1];
                node->child[0] = left->child[left->n + 1];
                node->child[0]->parent = node;
            }
            return;
        }
        if (right != NULL && right->n > min_k) {
            node->keys[node->n++] = parent->keys[idx];
            parent->keys[idx] = right->keys[0];
            remove_at(right, 0);
            if (!node->leaf) {
                node->child[node->n] = right->child[0];
                node->child[node->n]->parent = node;
                for (int i = 0; i < right->n + 1; i++)
                    right->child[i] = right->child[i + 1];
            }
            return;
        }
        if (left != NULL) {
            left->keys[left->n++] = parent->keys[idx - 1];
            for (int i = 0; i < node->n; i++)
                left->keys[left->n++] = node->keys[i];
            if (!node->leaf)
                for (int i = 0; i <= node->n; i++) {
                    left->child[left->n - node->n + i] = node->child[i];
                    left->child[left->n - node->n + i]->parent = left;
                }
            for (int i = idx - 1; i < parent->n - 1; i++)
                parent->keys[i] = parent->keys[i + 1];
            for (int i = idx; i < parent->n; i++)
                parent->child[i] = parent->child[i + 1];
            parent->n--;
            free(node);
            node = parent;
        } else {
            node->keys[node->n++] = parent->keys[idx];
            for (int i = 0; i < right->n; i++)
                node->keys[node->n++] = right->keys[i];
            if (!node->leaf)
                for (int i = 0; i <= right->n; i++) {
                    node->child[node->n - right->n + i] = right->child[i];
                    node->child[node->n - right->n + i]->parent = node;
                }
            for (int i = idx; i < parent->n - 1; i++)
                parent->keys[i] = parent->keys[i + 1];
            for (int i = idx + 1; i < parent->n; i++)
                parent->child[i] = parent->child[i + 1];
            parent->n--;
            free(right);
            node = parent;
        }
    }
}

static bool find_node(Node *root, int key, Node **out_node, int *out_idx) {
    Node *node = root;
    while (node != NULL) {
        int i = 0;
        while (i < node->n && key > node->keys[i])
            i++;
        if (i < node->n && key == node->keys[i]) {
            *out_node = node;
            *out_idx = i;
            return true;
        }
        if (node->leaf)
            return false;
        node = node->child[i];
    }
    return false;
}

static Node *b_tree_delete(Node *root, int order, int key, bool *found) {
    Node *node;
    int idx;
    *found = find_node(root, key, &node, &idx);
    if (!*found)
        return root;
    if (node->leaf) {
        remove_at(node, idx);
        fix_underflow(node, order);
    } else {
        Node *pred = node->child[idx];
        while (!pred->leaf)
            pred = pred->child[pred->n];
        node->keys[idx] = pred->keys[pred->n - 1];
        remove_at(pred, pred->n - 1);
        fix_underflow(pred, order);
    }
    if (!root->leaf && root->n == 0) {
        Node *new_root = root->child[0];
        new_root->parent = NULL;
        free(root);
        root = new_root;
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

static void run_scenario(const char *label, int order, const int keys[], int n, const int deletes[], int dn) {
    printf("-- %s --\n", label);
    printf("ORDER=%d MIN_KEYS=%d\n", order, min_keys(order));
    Node *root = new_node(true);
    for (int i = 0; i < n; i++)
        root = tree_insert(root, order, keys[i]);

    for (int i = 0; i < dn; i++) {
        bool found;
        root = b_tree_delete(root, order, deletes[i], &found);
        printf("delete(%d) -> %s\n", deletes[i], found ? "removed" : "not present");
    }
    printf("nodes=%d height=%d\n", node_count(root), tree_height(root));
    free_tree(root);
    printf("\n");
}

int main(void) {
    const int normal_keys[] = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
    const int normal_del[] = {6, 12, 30};
    run_scenario("normal: order=4, 12 keys, 3 deletes", 4, normal_keys, 12, normal_del, 3);

    const int hard_keys[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
    const int hard_del[] = {1, 2, 3, 4};
    run_scenario("hard: order=3, 14 ascending keys, chained merges", 3, hard_keys, 14, hard_del, 4);

    const int nf_keys[] = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
    const int nf_del[] = {999, 6};
    run_scenario("edge: deleting a key that is not present", 4, nf_keys, 12, nf_del, 2);

    const int shrink_keys[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110};
    const int shrink_del[] = {10, 20, 30, 40, 50, 60, 70};
    run_scenario("edge: delete until the root shrinks", 3, shrink_keys, 11, shrink_del, 7);
    return 0;
}
