/* Week 12 -- Strings: Structures and Algorithms
 * KMP search: uses the lps[] failure-function table so the text pointer i never moves backward. O(n + m).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>

#define MAXOCC 32

static void compute_lps(const char *pattern, int m, int lps[]) {
    lps[0] = 0;
    int len = 0, i = 1;
    while (i < m) {
        if (pattern[i] == pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else if (len != 0) {
            len = lps[len - 1];
        } else {
            lps[i] = 0;
            i++;
        }
    }
}

static int kmp_search(const char *text, int n, const char *pattern, int m, const int lps[], int occ[]) {
    if (m == 0) {                     /* the empty pattern matches at every position, including n */
        for (int s = 0; s <= n; s++) occ[s] = s;
        return n + 1;
    }
    int i = 0, j = 0, c = 0;
    while (i < n) {
        if (text[i] == pattern[j]) {
            i++; j++;
            if (j == m) {
                occ[c++] = i - m;        /* occurrence found; keep scanning */
                j = lps[j - 1];
            }
        } else if (j > 0) {
            j = lps[j - 1];              /* fall back in the PATTERN; i never moves back */
        } else {
            i++;
        }
    }
    return c;
}

static void print_occ(const int occ[], int count) {
    if (count == 0) { printf("(none)"); return; }
    for (int i = 0; i < count; i++) printf("%s%d", i ? ", " : "", occ[i]);
}

static void run_scenario(const char *label, const char *text, const char *pattern) {
    printf("-- %s --\n", label);
    int n = (int) strlen(text), m = (int) strlen(pattern);
    printf("text = \"%s\" (%d letters), pattern = \"%s\" (%d letters)\n", text, n, pattern, m);
    int lps[64];
    compute_lps(pattern, m, lps);
    int occ[MAXOCC];
    int count = kmp_search(text, n, pattern, m, lps, occ);
    printf("occurrences (%d): ", count);
    print_occ(occ, count);
    printf("\n\n");
}

int main(void) {
    run_scenario("normal: the classic CLRS-style example", "ABABDABACDABABCABAB", "ABABCABAB");
    run_scenario("hard: many lps fallbacks", "AAAAAAAAAAAAAAAB", "AAAAB");
    run_scenario("edge: never found", "THEQUICKBROWNFOX", "ZEBRA");
    run_scenario("edge: overlapping matches", "AAAAAAAAAA", "AAA");
    run_scenario("edge: text == pattern, one match, no fallback at all", "ALGORITHMS", "ALGORITHMS");
    return 0;
}
