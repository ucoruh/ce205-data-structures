/* Week 12 -- Strings: Structures and Algorithms
 * Compressed trie (radix tree): each edge carries a whole substring; a new word either extends an existing
 * edge, becomes a brand-new leaf edge, or SPLITS an existing edge at the point where it first diverges.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define ALPHA 26

typedef struct RNode {
    char *label;                 /* edge INTO this node; root's label is "" */
    bool is_end;
    struct RNode *child[ALPHA];  /* indexed by the first letter of each child edge */
} RNode;

static char *dup_str(const char *s, int len) {
    char *r = malloc((size_t) len + 1);
    memcpy(r, s, (size_t) len);
    r[len] = '\0';
    return r;
}

static RNode *new_node(const char *label, int label_len, bool is_end) {
    RNode *n = malloc(sizeof(RNode));
    n->label = dup_str(label, label_len);
    n->is_end = is_end;
    for (int i = 0; i < ALPHA; i++) n->child[i] = NULL;
    return n;
}

static int common_prefix_len(const char *a, const char *b) {
    int j = 0;
    while (a[j] && b[j] && a[j] == b[j]) j++;
    return j;
}

static void insert(RNode *node, const char *word) {
    if (word[0] == '\0') { node->is_end = true; return; }   /* the empty word ends exactly at this node */
    int i = 0;
    while (word[i] != '\0') {
        int c = word[i] - 'A';
        if (node->child[c] == NULL) {
            node->child[c] = new_node(word + i, (int) strlen(word + i), true);   /* whole remaining suffix */
            return;
        }
        RNode *child = node->child[c];
        int label_len = (int) strlen(child->label);
        int j = common_prefix_len(word + i, child->label);
        if (j == label_len) {                 /* whole edge matches: descend */
            node = child;
            i += j;
            if (word[i] == '\0') { node->is_end = true; return; }
            continue;
        }
        /* split: a new node holds the shared prefix; child keeps only its tail */
        RNode *mid = new_node(child->label, j, false);
        char *tail = dup_str(child->label + j, label_len - j);
        free(child->label);
        child->label = tail;
        mid->child[(unsigned char) (child->label[0] - 'A')] = child;
        node->child[c] = mid;
        if (word[i + j] == '\0') {
            mid->is_end = true;                /* the inserted word ends exactly at the split point */
            return;
        }
        mid->child[word[i + j] - 'A'] = new_node(word + i + j, (int) strlen(word + i + j), true);
        return;
    }
}

static bool search(RNode *root, const char *word, bool *is_prefix) {
    RNode *node = root;
    int i = 0;
    while (word[i] != '\0') {
        int c = word[i] - 'A';
        if (node->child[c] == NULL) {
            *is_prefix = false;
            return false;
        }
        RNode *child = node->child[c];
        int label_len = (int) strlen(child->label);
        int j = common_prefix_len(word + i, child->label);
        if (j < label_len) {
            *is_prefix = (word[i + j] == '\0');
            return false;
        }
        node = child;
        i += j;
    }
    *is_prefix = true;
    return node->is_end;
}

static void free_radix(RNode *n) {
    if (n == NULL) return;
    for (int i = 0; i < ALPHA; i++) free_radix(n->child[i]);
    free(n->label);
    free(n);
}

static void run_scenario(const char *label, const char *const words[], int nwords, const char *const queries[], int nqueries) {
    printf("-- %s --\n", label);
    RNode *root = new_node("", 0, false);
    for (int i = 0; i < nwords; i++) {
        insert(root, words[i]);
        printf("insert(%s)\n", words[i]);
    }
    for (int i = 0; i < nqueries; i++) {
        bool is_prefix = false;
        bool found = search(root, queries[i], &is_prefix);
        printf("search(%s) -> found=%s, isPrefix=%s\n", queries[i], found ? "true" : "false", is_prefix ? "true" : "false");
    }
    free_radix(root);
    printf("\n");
}

int main(void) {
    const char *const w1[] = {"TEST", "TEA", "TEAM"};
    const char *const q1[] = {"TEA", "TE", "TEAMS"};
    run_scenario("normal: TEST, TEA, TEAM -- one edge splits in two", w1, 3, q1, 3);

    const char *const w2[] = {"ROMAN", "ROMANE", "ROMANUS", "ROMULUS"};
    const char *const q2[] = {"ROMAN", "ROM", "ROMANEQ", "ROMULUS"};
    run_scenario("hard: the ROMAN word family -- several splits back to back", w2, 4, q2, 4);

    const char *const w3[] = {"APPLE", "BANANA"};
    const char *const q3[] = {"APPLE", "AP"};
    run_scenario("edge: no shared prefix, every word is a single long edge", w3, 2, q3, 2);

    const char *const w4[] = {"CAR", "CARPET", "CARD"};
    const char *const q4[] = {"CAR", "CARP", "CARPET"};
    run_scenario("edge: CAR is a prefix of CARPET and CARD", w4, 3, q4, 3);

    const char *const w5[] = {"ANT", "ARM", "ART", "AXE"};
    const char *const q5[] = {"ART", "AR", "ARK"};
    run_scenario("edge: ANT, ARM, ART, AXE -- splits nested inside splits", w5, 4, q5, 3);

    return 0;
}
