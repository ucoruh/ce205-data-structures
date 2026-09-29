#define main program_main
#include "../../c/primary_index.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* find_page: empty index */
    IndexEntry empty_idx[1];
    CHECK_EQ_INT(find_page(empty_idx, 0, 42), -1);

    /* find_page: single entry */
    IndexEntry one[1] = {{10, 0}};
    CHECK_EQ_INT(find_page(one, 1, 10), 0);
    CHECK_EQ_INT(find_page(one, 1, 50), 0);
    CHECK_EQ_INT(find_page(one, 1, 9), -1);

    /* find_page: several entries */
    IndexEntry idx[4] = {{5, 0}, {20, 1}, {35, 2}, {50, 3}};
    CHECK_EQ_INT(find_page(idx, 4, 4), -1);      /* below the first key */
    CHECK_EQ_INT(find_page(idx, 4, 5), 0);        /* exact match on first_key */
    CHECK_EQ_INT(find_page(idx, 4, 19), 0);       /* just below the next page */
    CHECK_EQ_INT(find_page(idx, 4, 20), 1);       /* exact match on a middle first_key */
    CHECK_EQ_INT(find_page(idx, 4, 49), 2);
    CHECK_EQ_INT(find_page(idx, 4, 999), 3);      /* far beyond the last key */

    /* search_key: 3 pages of 4, built like run_scenario does */
    int data[MAX_PAGES][MAX_BLOCK] = {{5, 10, 15, 20}, {25, 30, 35, 40}, {45, 50, 55, 60}};
    int page_len[MAX_PAGES] = {4, 4, 4};
    IndexEntry search_idx[3] = {{5, 0}, {25, 1}, {45, 2}};
    int out_page;

    CHECK(search_key(data, page_len, search_idx, 3, 30, &out_page) == true);
    CHECK_EQ_INT(out_page, 1);
    CHECK(search_key(data, page_len, search_idx, 3, 5, &out_page) == true);   /* first key overall */
    CHECK_EQ_INT(out_page, 0);
    CHECK(search_key(data, page_len, search_idx, 3, 60, &out_page) == true);  /* last key overall */
    CHECK_EQ_INT(out_page, 2);
    CHECK(search_key(data, page_len, search_idx, 3, 22, &out_page) == false); /* absent, in-range page */
    CHECK_EQ_INT(out_page, 0);
    out_page = -1;
    CHECK(search_key(data, page_len, search_idx, 3, 1, &out_page) == false);  /* below every key: out_page untouched */
    CHECK_EQ_INT(out_page, -1);

    /* single-page file (edge: whole file fits one page) */
    int single_data[MAX_PAGES][MAX_BLOCK] = {{1, 2, 3}};
    int single_len[MAX_PAGES] = {3};
    IndexEntry single_idx[1] = {{1, 0}};
    CHECK(search_key(single_data, single_len, single_idx, 1, 2, &out_page) == true);
    CHECK(search_key(single_data, single_len, single_idx, 1, 99, &out_page) == false);

    /* negative keys */
    int neg_data[MAX_PAGES][MAX_BLOCK] = {{-30, -20, -10}};
    int neg_len[MAX_PAGES] = {3};
    IndexEntry neg_idx[1] = {{-30, 0}};
    CHECK(search_key(neg_data, neg_len, neg_idx, 1, -20, &out_page) == true);
    out_page = -1;
    CHECK(search_key(neg_data, neg_len, neg_idx, 1, -31, &out_page) == false);
    CHECK_EQ_INT(out_page, -1);

    TEST_SUMMARY();
}
