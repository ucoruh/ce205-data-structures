/* Week 11 -- Advanced Trees
 * Splay tree: every access moves the accessed key to the root (zig, zig-zig, zig-zag).
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
    struct Node *parent;
} Node;

Node *root;

static void rotate_left(Node *x) {
    Node *y = x->right;
    x->right = y->left;
    if (y->left) y->left->parent = x;
    y->parent = x->parent;
    if (x->parent == NULL)         root = y;
    else if (x == x->parent->left) x->parent->left  = y;
    else                           x->parent->right = y;
    y->left = x;
    x->parent = y;
}

static void rotate_right(Node *y) {
    Node *x = y->left;
    y->left = x->right;
    if (x->right) x->right->parent = y;
    x->parent = y->parent;
    if (y->parent == NULL)          root = x;
    else if (y == y->parent->left)  y->parent->left  = x;
    else                            y->parent->right = x;
    x->right = y;
    y->parent = x;
}

static void rotate_up(Node *x) {
    if (x == x->parent->left) rotate_right(x->parent); else rotate_left(x->parent);
}

void splay(Node *x) {
    while (x->parent != NULL) {
        Node *p = x->parent, *g = p->parent;
        if (g == NULL)                                    { rotate_up(x); }
        else if ((x == p->left) == (p == g->left))         { rotate_up(p); rotate_up(x); }
        else                                                { rotate_up(x); rotate_up(x); }
    }
}

Node *access_key(int key) {
    Node *cur = root, *parent = NULL;
    while (cur != NULL && cur->key != key) { parent = cur; cur = (key < cur->key) ? cur->left : cur->right; }
    if (cur == NULL) {
        cur = malloc(sizeof(Node));
        cur->key = key; cur->left = NULL; cur->right = NULL; cur->parent = parent;
        if (parent == NULL)         root = cur;
        else if (key < parent->key) parent->left  = cur;
        else                        parent->right = cur;
    }
    splay(cur);
    return cur;
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

static void run_scenario(const char *label, const int ops[], int n) {
    printf("-- %s --\n", label);
    root = NULL;
    for (int i = 0; i < n; i++) {
        access_key(ops[i]);
        printf("access(%d): root = %d, inorder =", ops[i], root->key);
        print_inorder(root);
        printf("\n");
    }
    printf("\n");
    free_tree(root);
    root = NULL;
}

int main(void) {
    int normal[] = {50, 30, 70, 20, 40, 60, 80, 10, 45, 20, 80, 10};
    run_scenario("normal: 12 accesses: zig, zig-zig, and zig-zag all occur", normal, 12);

    int hard[] = {64, 32, 96, 16, 48, 80, 112, 8, 24, 8, 96, 8, 40, 96, 8, 112};
    run_scenario("hard: 16 accesses with repeats (locality)", hard, 16);

    int root_access[] = {50, 30, 70, 20, 40, 50, 50, 60, 80, 50};
    run_scenario("edge: accessing the root again (no rotation)", root_access, 10);

    int new_key[] = {50, 30, 70, 20, 40, 60, 80, 35, 999, -999};
    run_scenario("edge: accessing a missing key inserts it and splays it", new_key, 10);

    int single[] = {7};
    run_scenario("edge: a single access on an empty tree", single, 1);

    return 0;
}
