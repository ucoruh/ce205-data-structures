#define main program_main
#include "../../c/secondary_index.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int matches[MAX_RECORDS];

    /* empty index */
    IndexEntry none[1] = {{0, 0}};
    CHECK_EQ_INT(search_dense(none, 0, 5, matches, MAX_RECORDS), 0);

    /* single entry: match and no match */
    IndexEntry one[1] = {{7, 0}};
    CHECK_EQ_INT(search_dense(one, 1, 7, matches, MAX_RECORDS), 1);
    CHECK_EQ_INT(matches[0], 0);
    CHECK_EQ_INT(search_dense(one, 1, 8, matches, MAX_RECORDS), 0);

    /* duplicates at the start of the index */
    IndexEntry start_dup[5] = {{1, 10}, {1, 11}, {2, 12}, {3, 13}, {4, 14}};
    CHECK_EQ_INT(search_dense(start_dup, 5, 1, matches, MAX_RECORDS), 2);
    CHECK_EQ_INT(matches[0], 10);
    CHECK_EQ_INT(matches[1], 11);

    /* duplicates in the middle */
    IndexEntry mid_dup[5] = {{1, 0}, {2, 1}, {2, 2}, {2, 3}, {5, 4}};
    CHECK_EQ_INT(search_dense(mid_dup, 5, 2, matches, MAX_RECORDS), 3);
    CHECK_EQ_INT(matches[0], 1);
    CHECK_EQ_INT(matches[2], 3);

    /* duplicates at the end */
    IndexEntry end_dup[4] = {{1, 0}, {2, 1}, {9, 2}, {9, 3}};
    CHECK_EQ_INT(search_dense(end_dup, 4, 9, matches, MAX_RECORDS), 2);

    /* all entries share one key */
    IndexEntry all_same[4] = {{6, 0}, {6, 1}, {6, 2}, {6, 3}};
    CHECK_EQ_INT(search_dense(all_same, 4, 6, matches, MAX_RECORDS), 4);

    /* no duplicates at all */
    IndexEntry unique[4] = {{1, 0}, {2, 1}, {3, 2}, {4, 3}};
    CHECK_EQ_INT(search_dense(unique, 4, 3, matches, MAX_RECORDS), 1);
    CHECK_EQ_INT(matches[0], 2);

    /* key smaller than every entry: scans through, 0 matches */
    CHECK_EQ_INT(search_dense(unique, 4, 0, matches, MAX_RECORDS), 0);
    /* key larger than every entry: 0 matches */
    CHECK_EQ_INT(search_dense(unique, 4, 99, matches, MAX_RECORDS), 0);

    /* count exceeds the caller's buffer: the true count is still reported */
    IndexEntry many_dup[6] = {{5, 0}, {5, 1}, {5, 2}, {5, 3}, {5, 4}, {5, 5}};
    int small_buf[2];
    CHECK_EQ_INT(search_dense(many_dup, 6, 5, small_buf, 2), 6);
    CHECK_EQ_INT(small_buf[0], 0);
    CHECK_EQ_INT(small_buf[1], 1);

    /* negative keys */
    IndexEntry neg[3] = {{-5, 0}, {-3, 1}, {-3, 2}};
    CHECK_EQ_INT(search_dense(neg, 3, -3, matches, MAX_RECORDS), 2);

    TEST_SUMMARY();
}
