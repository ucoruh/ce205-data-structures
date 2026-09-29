/* Week 12 -- Strings: Structures and Algorithms
 * Longest common subsequence (LCS): the longest sequence of characters appearing, in order, in both a and b.
 * A DP table plus a traceback that reconstructs one actual longest common subsequence.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>

#define MAXN 16
#define MAXM 16

static int lcs_length(const char *a, int n, const char *b, int m, int dp[MAXN][MAXM]) {
    for (int i = 0; i <= n; i++) dp[i][0] = 0;
    for (int j = 0; j <= m; j++) dp[0][j] = 0;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a[i - 1] == b[j - 1])
                dp[i][j] = dp[i - 1][j - 1] + 1;         /* extend the diagonal by one */
            else
                dp[i][j] = dp[i-1][j] >= dp[i][j-1] ? dp[i-1][j] : dp[i][j-1];   /* better neighbor */
        }
    }
    return dp[n][m];
}

static void traceback(const char *a, int n, const char *b, int m, int dp[MAXN][MAXM], char out[]) {
    int i = n, j = m, k = dp[n][m];
    out[k] = '\0';
    while (i > 0 && j > 0) {
        if (a[i - 1] == b[j - 1]) { out[--k] = a[i - 1]; i--; j--; }     /* part of the LCS */
        else if (dp[i - 1][j] >= dp[i][j - 1]) i--;                      /* came from above */
        else j--;                                                        /* came from the left */
    }
}

static void run_scenario(const char *label, const char *a, const char *b) {
    printf("-- %s --\n", label);
    int n = (int) strlen(a), m = (int) strlen(b);
    printf("a = \"%s\" (%d letters), b = \"%s\" (%d letters)\n", a, n, b, m);
    static int dp[MAXN][MAXM];
    int length = lcs_length(a, n, b, m, dp);
    char out[MAXN];
    traceback(a, n, b, m, dp, out);
    printf("lcs_length = %d, one LCS = \"%s\"\n\n", length, out);
}

int main(void) {
    run_scenario("normal: the classic example, length 4", "ABCBDAB", "BDCABA");
    run_scenario("hard: the bioinformatics classic, length 4", "AGGTAB", "GXTXAYB");
    run_scenario("edge: no shared letters at all, length 0", "ABCDE", "FGHIJ");
    run_scenario("edge: identical strings, the LCS is the whole string", "ALGORITHM", "ALGORITHM");
    run_scenario("edge: ACEG is entirely a subsequence of ABCDEFGH", "ACEG", "ABCDEFGH");
    return 0;
}
