/* Week 12 -- Strings: Structures and Algorithms
 * Edit distance (Levenshtein distance): the fewest insertions, deletions and substitutions to turn a into b,
 * a DP table plus a traceback that reconstructs one shortest edit sequence.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <string.h>

#define MAXN 16
#define MAXM 16
#define MAXOPS 32

static int edit_distance(const char *a, int n, const char *b, int m, int dp[MAXN][MAXM]) {
    for (int i = 0; i <= n; i++) dp[i][0] = i;            /* delete all of a[0..i) */
    for (int j = 0; j <= m; j++) dp[0][j] = j;            /* insert all of b[0..j) */
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a[i - 1] == b[j - 1])
                dp[i][j] = dp[i - 1][j - 1];               /* match: no cost */
            else {
                int sub = dp[i - 1][j - 1], del = dp[i - 1][j], ins = dp[i][j - 1];
                int best = sub < del ? sub : del;
                best = best < ins ? best : ins;
                dp[i][j] = 1 + best;                        /* substitute, delete or insert */
            }
        }
    }
    return dp[n][m];
}

static int traceback(const char *a, int n, const char *b, int m, int dp[MAXN][MAXM], char ops[][12]) {
    int i = n, j = m, k = 0;
    char tmp[MAXOPS][12];
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i - 1] == b[j - 1] && dp[i][j] == dp[i - 1][j - 1]) {
            snprintf(tmp[k++], 12, "match");
            i--; j--;
        } else if (i > 0 && j > 0 && dp[i][j] == dp[i - 1][j - 1] + 1) {
            snprintf(tmp[k++], 12, "substitute");
            i--; j--;
        } else if (i > 0 && dp[i][j] == dp[i - 1][j] + 1) {
            snprintf(tmp[k++], 12, "delete");
            i--;
        } else {
            snprintf(tmp[k++], 12, "insert");
            j--;
        }
    }
    for (int t = 0; t < k; t++) snprintf(ops[t], 12, "%s", tmp[k - 1 - t]);   /* reverse into order */
    return k;
}

static void run_scenario(const char *label, const char *a, const char *b) {
    printf("-- %s --\n", label);
    int n = (int) strlen(a), m = (int) strlen(b);
    printf("a = \"%s\" (%d letters), b = \"%s\" (%d letters)\n", a, n, b, m);
    static int dp[MAXN][MAXM];
    int distance = edit_distance(a, n, b, m, dp);
    char ops[MAXOPS][12];
    int k = traceback(a, n, b, m, dp, ops);
    printf("edit_distance = %d\nops:", distance);
    for (int t = 0; t < k; t++) printf(" %s", ops[t]);
    printf("\n\n");
}

int main(void) {
    run_scenario("normal: the classic example, distance 3", "KITTEN", "SITTING");
    run_scenario("hard: a big table, distance 5", "INTENTION", "EXECUTION");
    run_scenario("edge: identical strings, distance 0", "ALGORITHM", "ALGORITHM");
    run_scenario("edge: no shared letters, every position a substitution", "ABCDE", "FGHIJ");
    run_scenario("edge: pure insertion", "CAT", "CATERPILLAR");
    return 0;
}
