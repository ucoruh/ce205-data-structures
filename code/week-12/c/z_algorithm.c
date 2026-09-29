/* Week 12 -- Strings: Structures and Algorithms
 * The Z-algorithm: Z[i] is how many characters S[i..] shares with S itself from the start. For
 * S = pattern + '#' + text, positions in the text part with Z[i] >= |pattern| mark occurrences. O(n + m).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>

#define MAXN 64
#define MAXOCC 32

static void z_array(const char *s, int n, int z[]) {
    for (int i = 0; i < n; i++) z[i] = 0;
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r)
            z[i] = (r - i < z[i - l]) ? r - i : z[i - l];   /* reuse the [l,r) window */
        while (i + z[i] < n && s[z[i]] == s[i + z[i]])
            z[i]++;                                          /* extend by direct comparison */
        if (i + z[i] > r) { l = i; r = i + z[i]; }            /* window grew: remember it */
    }
}

static int z_search(const char *pattern, int m, const char *text, int n, int occ[]) {
    int c = 0;
    if (m == 0) {                     /* the empty pattern matches at every position, including n */
        for (int s = 0; s <= n; s++) occ[s] = s;
        return n + 1;
    }
    char s[MAXN];
    snprintf(s, sizeof(s), "%s#%s", pattern, text);         /* combined string */
    int total = m + 1 + n;
    int z[MAXN];
    z_array(s, total, z);
    for (int i = m + 1; i < total; i++)
        if (z[i] >= m) occ[c++] = i - (m + 1);               /* Z[i] >= m: a full match */
    return c;
}

static void print_occ(const int occ[], int count) {
    if (count == 0) { printf("(none)"); return; }
    for (int i = 0; i < count; i++) printf("%s%d", i ? ", " : "", occ[i]);
}

static void run_scenario(const char *label, const char *pattern, const char *text) {
    printf("-- %s --\n", label);
    int m = (int) strlen(pattern), n = (int) strlen(text);
    printf("pattern = \"%s\" (%d letters), text = \"%s\" (%d letters)\n", pattern, m, text, n);
    int occ[MAXOCC];
    int count = z_search(pattern, m, text, n, occ);
    printf("occurrences (%d): ", count);
    print_occ(occ, count);
    printf("\n\n");
}

int main(void) {
    run_scenario("normal: a periodic Z array", "AB", "ABABABABAB");
    run_scenario("hard: the window is reused constantly", "AAA", "AAAAAAAAAA");
    run_scenario("edge: no match at all, Z stays small", "XYZ", "ABCDEFGHIJ");
    run_scenario("edge: matches only at the very first position", "ABC", "ABCDEFGHIJ");
    run_scenario("edge: the m=1 boundary case, many matches", "A", "BABABABABA");
    return 0;
}
