/* Week 12 -- Strings: Structures and Algorithms
 * KMP failure function (lps[]): for every prefix pattern[0..i], lps[i] is the length of the longest proper
 * prefix of that prefix that is also a suffix of it. Built in O(m) by comparing the pattern to itself.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <string.h>

static void compute_lps(const char *pattern, int m, int lps[]) {
    lps[0] = 0;
    int len = 0, i = 1;
    while (i < m) {
        if (pattern[i] == pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else if (len != 0) {
            len = lps[len - 1];       /* fall back, do NOT advance i */
        } else {
            lps[i] = 0;
            i++;
        }
    }
}

static void run_scenario(const char *label, const char *pattern) {
    printf("-- %s --\n", label);
    int m = (int) strlen(pattern);
    printf("pattern = \"%s\" (%d letters)\n", pattern, m);
    int lps[64];
    compute_lps(pattern, m, lps);
    printf("lps:");
    for (int i = 0; i < m; i++) printf(" %d", lps[i]);
    printf("\n\n");
}

int main(void) {
    run_scenario("normal: mixed growth and fallback", "ABABCABABA");
    run_scenario("hard: grows at every step, lps[i] = i", "AAAAAAAAAA");
    run_scenario("edge: no repetition at all, lps is always 0", "ABCDEFGHIJ");
    run_scenario("edge: a constantly oscillating pattern", "ABABABABAB");
    run_scenario("edge: the fallback chases a chain (lps[len-1])", "AABAACAABAA");
    return 0;
}
