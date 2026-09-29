/* Week 11 -- Advanced Trees
 * Red-black tree: insert (recoloring and rotations, the three cases named).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>

#define RED 0
#define BLACK 1

typedef struct Node {
    int key;
    int color;
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

void fixup(Node *z) {
    while (z->parent != NULL && z->parent->color == RED) {
        Node *p = z->parent, *g = p->parent;
        Node *u = (p == g->left) ? g->right : g->left;
        if (u != NULL && u->color == RED) {                        /* case 1: red uncle */
            p->color = BLACK; u->color = BLACK; g->color = RED; z = g; continue;
        }
        if (p == g->left) {
            if (z == p->right) { z = p; rotate_left(z); p = z->parent; }     /* case 2: triangle */
            p->color = BLACK; g->color = RED; rotate_right(g);               /* case 3: line */
        } else {
            if (z == p->left)  { z = p; rotate_right(z); p = z->parent; }
            p->color = BLACK; g->color = RED; rotate_left(g);
        }
        break;
    }
    root->color = BLACK;
}

void insert(int key) {
    Node *y = NULL, *x = root;
    while (x != NULL) {
        if (key == x->key) return;                     /* duplicate: unchanged */
        y = x;
        x = (key < x->key) ? x->left : x->right;
    }
    Node *z = malloc(sizeof(Node));
    z->key = key; z->color = RED; z->left = NULL; z->right = NULL; z->parent = y;
    if (y == NULL) root = z;
    else if (key < y->key) y->left = z;
    else                   y->right = z;
    fixup(z);
}

static int black_height(Node *n) {
    if (n == NULL) return 0;
    int l = black_height(n->left), r = black_height(n->right);
    int add = (n->color == BLACK) ? 1 : 0;
    return (l > r ? l : r) + add;                         /* NOT a correctness check, just a printable stat */
}

static void print_inorder_color(Node *n) {
    if (n == NULL) return;
    print_inorder_color(n->left);
    printf(" %d%c", n->key, n->color == RED ? 'R' : 'B');
    print_inorder_color(n->right);
}

static void free_tree(Node *n) {
    if (n == NULL) return;
    free_tree(n->left);
    free_tree(n->right);
    free(n);
}

static void run_scenario(const char *label, const int keys[], int n) {
    printf("-- %s --\n", label);
    root = NULL;
    for (int i = 0; i < n; i++) {
        insert(keys[i]);
        printf("insert(%d): root = %d, bh = %d, inorder =", keys[i], root->key, black_height(root));
        print_inorder_color(root);
        printf("\n");
    }
    printf("\n");
    free_tree(root);
    root = NULL;
}

int main(void) {
    int normal[] = {3, 69, 31, 88, 50, 58, 98, 29, 14, 75};
    run_scenario("normal: 10 keys, all three cases (1, 2, 3) occur", normal, 10);

    int hard[] = {50, 40, 60, 30, 45, 55, 70, 20, 35, 42, 48, 80, 75, 10};
    run_scenario("hard: 14 keys, includes rotation cases (2 and 3)", hard, 14);

    int asc[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    run_scenario("edge: 10 keys in ascending order -- red-black still stays balanced", asc, 10);

    int desc[] = {100, 90, 80, 70, 60, 50, 40, 30, 20, 10};
    run_scenario("edge: 10 keys in descending order", desc, 10);

    int dup[] = {8, 8, 3, 8, 15, 3, 20, 3, 15, 8};
    run_scenario("edge: 10 values, many repeats", dup, 10);

    return 0;
}
