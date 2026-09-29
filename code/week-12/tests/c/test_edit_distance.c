/* Unit tests for week-12 c/edit_distance.c */
#define main program_main
#include "../../c/edit_distance.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    static int dp[MAXN][MAXM];
    char ops[MAXOPS][12];
    int k;

    /* -- identical strings: distance 0, path is all matches -- */
    CHECK_EQ_INT(edit_distance("CAT", 3, "CAT", 3, dp), 0);
    k = traceback("CAT", 3, "CAT", 3, dp, ops);
    CHECK_EQ_INT(k, 3);
    for (int i = 0; i < k; i++) CHECK(strcmp(ops[i], "match") == 0);

    /* -- one empty string: distance = the other's length, all inserts or all deletes -- */
    CHECK_EQ_INT(edit_distance("", 0, "ABC", 3, dp), 3);
    CHECK_EQ_INT(edit_distance("ABC", 3, "", 0, dp), 3);

    /* -- classic example: KITTEN -> SITTING, distance 3 -- */
    CHECK_EQ_INT(edit_distance("KITTEN", 6, "SITTING", 7, dp), 3);

    /* -- classic example: INTENTION -> EXECUTION, distance 5 -- */
    CHECK_EQ_INT(edit_distance("INTENTION", 9, "EXECUTION", 9, dp), 5);

    /* -- no shared letters: distance == max(len) since every position substitutes -- */
    CHECK_EQ_INT(edit_distance("ABCDE", 5, "FGHIJ", 5, dp), 5);

    /* -- pure insertion: a is a prefix of b -- */
    CHECK_EQ_INT(edit_distance("CAT", 3, "CATERPILLAR", 11, dp), 8);
    k = traceback("CAT", 3, "CATERPILLAR", 11, dp, ops);
    CHECK_EQ_INT(k, 11);
    for (int i = 0; i < 3; i++) CHECK(strcmp(ops[i], "match") == 0);
    for (int i = 3; i < 11; i++) CHECK(strcmp(ops[i], "insert") == 0);

    /* -- pure deletion: the reverse of pure insertion -- */
    CHECK_EQ_INT(edit_distance("CATERPILLAR", 11, "CAT", 3, dp), 8);

    /* -- single substitution -- */
    CHECK_EQ_INT(edit_distance("CAT", 3, "COT", 3, dp), 1);

    /* -- a traced sequence's non-match ops must total exactly the edit distance -- */
    int matches = 0, subs = 0, ins = 0, del = 0;
    edit_distance("KITTEN", 6, "SITTING", 7, dp);
    k = traceback("KITTEN", 6, "SITTING", 7, dp, ops);
    for (int i = 0; i < k; i++) {
        if (strcmp(ops[i], "match") == 0) matches++;
        else if (strcmp(ops[i], "substitute") == 0) subs++;
        else if (strcmp(ops[i], "insert") == 0) ins++;
        else del++;
    }
    CHECK_EQ_INT(subs + ins + del, 3);   /* must equal the edit distance */
    CHECK_EQ_INT(matches + subs + ins + del, k);

    /* -- non-ASCII bytes: only byte equality matters, any value works -- */
    CHECK_EQ_INT(edit_distance("caf" "\xc3" "\xa9", 5, "caf" "\xc3" "\xa9", 5, dp), 0);
    CHECK_EQ_INT(edit_distance("caf" "\xc3" "\xa9", 5, "caf", 3, dp), 2);

    /* -- integration: run_scenario drives the real DP + traceback path -- */
    run_scenario("unit-test integration", "KITTEN", "SITTING");

    TEST_SUMMARY();
}
