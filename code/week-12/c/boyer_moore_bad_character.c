/* Week 12 -- Strings: Structures and Algorithms
 * Boyer-Moore, bad-character rule only: compare the pattern to each window RIGHT to LEFT; on a mismatch, use
 * the mismatched character's last occurrence in the pattern to jump forward as far as safely possible.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>

#define MAXOCC 32

static void bad_char_table(const char *pattern, int m, int last[256]) {
    for (int c = 0; c < 256; c++) last[c] = -1;
    for (int j = 0; j < m; j++) last[(unsigned char) pattern[j]] = j;
}

static int boyer_moore_bad_char(const char *text, int n, const char *pattern, int m, const int last[256], int occ[]) {
    int s = 0, c = 0;
    while (s <= n - m) {
        int j = m - 1;
        while (j >= 0 && pattern[j] == text[s + j]) j--;     /* compare RIGHT to LEFT */
        if (j < 0) {
            occ[c++] = s;                 /* full match at shift s */
            s += 1;
        } else {
            int lo = last[(unsigned char) text[s + j]];
            int shift = j - lo;
            s += shift > 1 ? shift : 1;   /* always advance by at least 1 */
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
    int last[256];
    bad_char_table(pattern, m, last);
    int occ[MAXOCC];
    int count = boyer_moore_bad_char(text, n, pattern, m, last, occ);
    printf("occurrences (%d): ", count);
    print_occ(occ, count);
    printf("\n\n");
}

int main(void) {
    run_scenario("normal: mixed-size jumps", "ABAAABCDAB", "ABC");
    run_scenario("hard: low diversity, weak jumps", "AAAAAAAAAA", "AAAB");
    run_scenario("edge: never found", "THEQUICKBROWNFOX", "ZEBRA");
    run_scenario("edge: Z is not in the pattern -- the biggest possible jump every time", "ZZZZZZZZZZ", "ABC");
    run_scenario("edge: the match is near the end", "XXXXXXXABC", "ABC");
    return 0;
}
