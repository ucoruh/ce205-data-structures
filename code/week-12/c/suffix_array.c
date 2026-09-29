/* Week 12 -- Strings: Structures and Algorithms
 * Suffix array: every starting position of text, sorted by the suffix beginning there, built here with
 * insertion sort over strcmp(text+a, text+b) -- each suffix is just a pointer into the same buffer, no copy.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>

#define MAXN 24

static int compare_suffix(const char *text, int a, int b) {
    return strcmp(text + a, text + b);   /* pointer INTO the same buffer, no copy */
}

static void build_suffix_array(const char *text, int n, int sa[]) {
    for (int i = 0; i < n; i++) sa[i] = i;   /* start: unsorted, index order */
    for (int i = 1; i < n; i++) {
        int key = sa[i], j = i - 1;
        while (j >= 0 && compare_suffix(text, sa[j], key) > 0) {
            sa[j + 1] = sa[j];
            j--;
        }
        sa[j + 1] = key;
    }
}

static void run_scenario(const char *label, const char *text) {
    printf("-- %s --\n", label);
    int n = (int) strlen(text);
    printf("text = \"%s\" (%d letters)\n", text, n);
    int sa[MAXN];
    build_suffix_array(text, n, sa);
    printf("suffix array:");
    for (int i = 0; i < n; i++) printf(" %d", sa[i]);
    printf("\n");
    for (int i = 0; i < n; i++) printf("  sa[%d]=%d -> \"%s\"\n", i, sa[i], text + sa[i]);
    printf("\n");
}

int main(void) {
    run_scenario("normal: MISSISSIPPI, many repeating suffixes", "MISSISSIPPI");
    run_scenario("hard: ABABABABAB, near-ties throughout", "ABABABABAB");
    run_scenario("edge: AAAAAAAAAA, every character identical", "AAAAAAAAAA");
    run_scenario("edge: ABCDEFGHIJ, already ascending", "ABCDEFGHIJ");
    run_scenario("edge: JIHGFEDCBA, descending, the most shifting", "JIHGFEDCBA");
    return 0;
}
