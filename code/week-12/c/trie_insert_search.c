/* Week 12 -- Strings: Structures and Algorithms
 * Trie (prefix tree): insert and search, one edge per character, a fixed 26-letter alphabet array per node.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#define ALPHA 26

typedef struct TrieNode {
    struct TrieNode *child[ALPHA];
    bool is_end;
} TrieNode;

static TrieNode *new_node(void) {
    TrieNode *n = malloc(sizeof(TrieNode));
    for (int i = 0; i < ALPHA; i++) n->child[i] = NULL;
    n->is_end = false;
    return n;
}

static void insert(TrieNode *root, const char *word) {
    TrieNode *cur = root;
    for (int i = 0; word[i] != '\0'; i++) {
        int c = word[i] - 'A';
        if (cur->child[c] == NULL)
            cur->child[c] = new_node();
        cur = cur->child[c];
    }
    cur->is_end = true;
}

static bool search(TrieNode *root, const char *word, bool *is_prefix) {
    TrieNode *cur = root;
    for (int i = 0; word[i] != '\0'; i++) {
        int c = word[i] - 'A';
        if (cur->child[c] == NULL) {
            *is_prefix = false;
            return false;
        }
        cur = cur->child[c];
    }
    *is_prefix = true;
    return cur->is_end;
}

static void free_trie(TrieNode *n) {
    if (n == NULL) return;
    for (int i = 0; i < ALPHA; i++) free_trie(n->child[i]);
    free(n);
}

static void run_scenario(const char *label, const char *const words[], int nwords, const char *const queries[], int nqueries) {
    printf("-- %s --\n", label);
    TrieNode *root = new_node();
    for (int i = 0; i < nwords; i++) {
        insert(root, words[i]);
        printf("insert(%s)\n", words[i]);
    }
    for (int i = 0; i < nqueries; i++) {
        bool is_prefix = false;
        bool found = search(root, queries[i], &is_prefix);
        printf("search(%s) -> found=%s, isPrefix=%s\n", queries[i], found ? "true" : "false", is_prefix ? "true" : "false");
    }
    free_trie(root);
    printf("\n");
}

int main(void) {
    const char *const w1[] = {"CAT", "CAR", "CARD", "DOG"};
    const char *const q1[] = {"CAR", "CARS", "DO"};
    run_scenario("normal: CAT, CAR, CARD, DOG; search CAR/CARS/DO", w1, 4, q1, 3);

    const char *const w2[] = {"TRIE", "TRIED", "TRIES", "TRY", "TRUE", "TRUCK"};
    const char *const q2[] = {"TRIE", "TR", "TRUCKS", "TRY", "TRUST"};
    run_scenario("hard: the TRIE word family, 5 searches", w2, 6, q2, 5);

    const char *const w3[] = {"AB", "CD", "EF", "GH", "IJ"};
    const char *const q3[] = {"AB", "XY", "A"};
    run_scenario("edge: no shared prefix, every word branches from the root", w3, 5, q3, 3);

    const char *const w4[] = {"DATA", "DATA", "STRUCTURE"};
    const char *const q4[] = {"DATA", "DAT", "STRUCTURES"};
    run_scenario("edge: duplicate insert of DATA (idempotent)", w4, 3, q4, 3);

    const char *const w5[] = {"A", "AB", "ABC", "ABCD"};
    const char *const q5[] = {"A", "ABCD", "ABCDE"};
    run_scenario("edge: a branchless chain A, AB, ABC, ABCD", w5, 4, q5, 3);

    return 0;
}
