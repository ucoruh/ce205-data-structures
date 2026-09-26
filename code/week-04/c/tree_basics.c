/* Week 4 -- Trees, Heaps, and Huffman Coding
 * Tree vocabulary on a GENERAL rooted tree (any number of children per
 * node): root, parent, child, sibling, leaf, internal node, edge, depth,
 * height, degree, subtree.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>

#define MAX_CHILDREN 12
#define MAX_NODES 32

typedef struct Node {
    char label[4];
    struct Node *children[MAX_CHILDREN];
    int child_count;      /* degree of this node */
    int depth;            /* filled in by compute_depths() */
    struct Node *parent;  /* convenience only -- not shown in the lecture code panel */
} Node;

int height(Node *n) {
    if (n->child_count == 0)
        return 0;         /* a leaf: height 0 */
    int best = -1;
    for (int i = 0; i < n->child_count; i++) {
        int h = height(n->children[i]);
        if (h > best) best = h;
    }
    return best + 1;      /* 1 + tallest child */
}

void compute_depths(Node *root) {
    Node *queue[MAX_NODES];
    int front = 0, rear = 0;
    root->depth = 0;
    queue[rear++] = root;
    while (front < rear) {
        Node *cur = queue[front++];
        for (int i = 0; i < cur->child_count; i++) {
            Node *ch = cur->children[i];
            ch->depth = cur->depth + 1;
            queue[rear++] = ch;
        }
    }
}

/* --- building a tree from a flat "LABEL:PARENT" list, exactly like the animation's input --- */
typedef struct {
    const char *label;
    const char *parent;   /* NULL for the root */
} Spec;

static Node pool[MAX_NODES];
static int pool_count;

static Node *find_by_label(const char *label) {
    for (int i = 0; i < pool_count; i++)
        if (strcmp(pool[i].label, label) == 0) return &pool[i];
    return NULL;
}

static Node *build_tree(const Spec specs[], int n) {
    pool_count = 0;
    for (int i = 0; i < n; i++) {
        Node *node = &pool[pool_count++];
        strcpy(node->label, specs[i].label);
        node->child_count = 0;
        node->depth = 0;
        node->parent = NULL;
    }
    Node *root = NULL;
    for (int i = 0; i < n; i++) {
        Node *node = find_by_label(specs[i].label);
        if (specs[i].parent == NULL) { root = node; continue; }
        Node *parent = find_by_label(specs[i].parent);
        parent->children[parent->child_count++] = node;
        node->parent = parent;
    }
    return root;
}

static int subtree_size(Node *node) {
    int total = 1;
    for (int i = 0; i < node->child_count; i++)
        total += subtree_size(node->children[i]);
    return total;
}

static void print_leaves_internal(Node *node, int internal, int first_call) {
    static int any_printed;
    if (first_call) any_printed = 0;
    if ((node->child_count == 0) == !internal) {
        printf(any_printed ? " %s" : "%s", node->label);
        any_printed = 1;
    }
    for (int i = 0; i < node->child_count; i++)
        print_leaves_internal(node->children[i], internal, 0);
}

static void describe(const char *label, Node *root, int n, const char *probe_label) {
    printf("-- %s --\n", label);
    printf("nodes = %d, edges = %d\n", n, n - 1);
    compute_depths(root);
    printf("height (of the root) = %d\n", height(root));
    printf("leaves:");
    print_leaves_internal(root, 0, 1);
    printf("\n");
    printf("internal nodes:");
    print_leaves_internal(root, 1, 1);
    printf("\n");

    Node *probe = find_by_label(probe_label);
    printf("probe node %s: depth = %d, degree (child count) = %d, subtree size = %d\n",
           probe->label, probe->depth, probe->child_count, subtree_size(probe));
    printf("  children of %s:", probe->label);
    for (int i = 0; i < probe->child_count; i++) printf(" %s", probe->children[i]->label);
    if (probe->child_count == 0) printf(" (none, it is a leaf)");
    printf("\n");
    if (probe->parent == NULL) {
        printf("  %s is the root: no parent, no siblings\n", probe->label);
    } else {
        printf("  parent of %s: %s\n", probe->label, probe->parent->label);
        printf("  siblings of %s:", probe->label);
        int any = 0;
        for (int i = 0; i < probe->parent->child_count; i++) {
            Node *sib = probe->parent->children[i];
            if (sib != probe) { printf(" %s", sib->label); any = 1; }
        }
        if (!any) printf(" (none, only child)");
        printf("\n");
    }
    printf("\n");
}

int main(void) {
    /* normal: 11 nodes, a bushy tree */
    Spec normal[] = {
        {"A", NULL}, {"B", "A"}, {"C", "A"}, {"D", "A"},
        {"E", "B"}, {"F", "B"}, {"G", "C"}, {"H", "D"},
        {"I", "D"}, {"J", "D"}, {"K", "E"}
    };
    describe("normal: 11 nodes, a bushy tree", build_tree(normal, 11), 11, "D");

    /* hard: 18 nodes, uneven depths (down to level 5) */
    Spec hard[] = {
        {"R", NULL},
        {"P1", "R"}, {"P2", "P1"}, {"P3", "P2"}, {"P4", "P3"}, {"P5", "P4"},
        {"Q1", "R"}, {"Q2", "R"}, {"Q3", "R"},
        {"S1", "Q1"}, {"S2", "Q1"}, {"S3", "Q2"}, {"S4", "Q3"},
        {"U1", "S1"}, {"U2", "S3"}, {"U3", "S3"},
        {"V1", "U1"}, {"W1", "V1"}
    };
    describe("hard: 18 nodes, uneven depths", build_tree(hard, 18), 18, "S3");

    /* edge: a chain (degenerate), 10 nodes, each with one child */
    Spec chain[] = {
        {"R", NULL}, {"C1", "R"}, {"C2", "C1"}, {"C3", "C2"}, {"C4", "C3"},
        {"C5", "C4"}, {"C6", "C5"}, {"C7", "C6"}, {"C8", "C7"}, {"C9", "C8"}
    };
    describe("edge: a chain (degenerate), 10 nodes", build_tree(chain, 10), 10, "C9");

    /* edge: a star -- the root has 10 children */
    Spec star[] = {
        {"R", NULL}, {"L1", "R"}, {"L2", "R"}, {"L3", "R"}, {"L4", "R"}, {"L5", "R"},
        {"L6", "R"}, {"L7", "R"}, {"L8", "R"}, {"L9", "R"}, {"L10", "R"}
    };
    describe("edge: a star, the root has 10 children", build_tree(star, 11), 11, "R");

    return 0;
}
