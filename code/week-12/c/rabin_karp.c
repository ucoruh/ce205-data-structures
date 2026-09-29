/* Week 12 -- Strings: Structures and Algorithms
 * Rabin-Karp search: compare a rolling hash of each window against the pattern's hash; a hash match is only
 * a candidate and must be VERIFIED character by character (a "spurious hit" is a hash match that fails
 * verification).
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <string.h>

#define MAXOCC 32

static long long window_hash(const char *s, int m, long long base, long long mod) {
    long long h = 0;
    for (int k = 0; k < m; k++) h = (h * base + (s[k] - 'A')) % mod;
    return h;
}

static int rabin_karp(const char *text, int n, const char *pattern, int m, long long base, long long mod, int occ[], int *spurious) {
    int c = 0;
    *spurious = 0;
    if (m == 0) {                     /* the empty pattern matches at every position, including n */
        for (int s = 0; s <= n; s++) occ[s] = s;
        return n + 1;
    }
    if (n < m) return 0;              /* pattern longer than the text: no window fits, nothing to hash */
    long long p_hash = window_hash(pattern, m, base, mod);
    long long h_pow = 1;
    for (int k = 0; k < m - 1; k++) h_pow = (h_pow * base) % mod;
    long long t_hash = window_hash(text, m, base, mod);      /* first window, computed directly */
    for (int s = 0; s <= n - m; s++) {
        if (s > 0)
            t_hash = ((t_hash - (text[s - 1] - 'A') * h_pow % mod + mod) * base + (text[s + m - 1] - 'A')) % mod;
        if (t_hash == p_hash) {                          /* candidate: VERIFY before counting it */
            if (strncmp(text + s, pattern, (size_t) m) == 0)
                occ[c++] = s;
            else
                (*spurious)++;
        }
    }
    return c;
}

static void print_occ(const int occ[], int count) {
    if (count == 0) { printf("(none)"); return; }
    for (int i = 0; i < count; i++) printf("%s%d", i ? ", " : "", occ[i]);
}

static void run_scenario(const char *label, const char *text, const char *pattern, long long base, long long mod) {
    printf("-- %s --\n", label);
    int n = (int) strlen(text), m = (int) strlen(pattern);
    printf("text = \"%s\" (%d letters), pattern = \"%s\" (%d letters), base=%lld, mod=%lld\n", text, n, pattern, m, base, mod);
    int occ[MAXOCC], spurious;
    int count = rabin_karp(text, n, pattern, m, base, mod, occ, &spurious);
    printf("occurrences (%d): ", count);
    print_occ(occ, count);
    printf(", spurious hits: %d\n\n", spurious);
}

int main(void) {
    run_scenario("normal: mod=101, no spurious hits", "HELLOWORLD", "WORLD", 31, 101);
    run_scenario("hard: mod=7 (small), 1 genuine + 2 spurious hits", "AADBDDBCDBB", "AAD", 4, 7);
    run_scenario("edge: mod=7, no genuine match but 3 spurious collisions", "DBCADADABDC", "BAD", 4, 7);
    run_scenario("edge: a genuine overlapping match everywhere", "AAAAAAAAAA", "AAA", 31, 101);
    run_scenario("edge: mod=1000000007 (large prime), a spurious hit is practically impossible", "ALGORITHMS", "RITHM", 31, 1000000007);
    return 0;
}
