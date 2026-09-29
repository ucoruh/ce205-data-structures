/* Week 12 -- Strings: Structures and Algorithms
 * Naive (brute-force) substring search: try every shift, compare left to right until a mismatch or a full
 * match. Worst case O(n*m).
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <string.h>

#define MAXOCC 32

static int naive_search(const char *text, int n, const char *pattern, int m, int occ[]) {
    int c = 0;
    for (int s = 0; s <= n - m; s++) {          /* try every shift */
        int j = 0;
        while (j < m && text[s + j] == pattern[j]) j++;   /* compare left to right */
        if (j == m) occ[c++] = s;                /* whole pattern matched: occurrence at s */
    }
    return c;
}

static void print_occ(const int occ[], int count) {
    if (count == 0) { printf("(none)"); return; }
    for (int i = 0; i < count; i++) printf("%s%d", i ? ", " : "", occ[i]);
}

static void run_scenario(const char *label, const char *text, const char *pattern) {
    printf("-- %s --\n", label);
    printf("text = \"%s\" (%d letters), pattern = \"%s\" (%d letters)\n",
           text, (int) strlen(text), pattern, (int) strlen(pattern));
    int occ[MAXOCC];
    int count = naive_search(text, (int) strlen(text), pattern, (int) strlen(pattern), occ);
    printf("occurrences (%d): ", count);
    print_occ(occ, count);
    printf("\n\n");
}

int main(void) {
    run_scenario("normal: a few false starts", "ABABAABABC", "ABABC");
    run_scenario("hard: worst case, fails late every time", "AAAAAAAAAA", "AAAB");
    run_scenario("edge: never found, always fails early", "THEQUICKFOX", "ZEBRA");
    run_scenario("edge: an overlapping match at every shift", "AAAAAAAAAA", "AAA");
    run_scenario("edge: text == pattern, only one possible shift", "ALGORITHMS", "ALGORITHMS");
    return 0;
}
