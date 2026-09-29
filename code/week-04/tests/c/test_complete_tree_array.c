/* Unit tests for week-04 c/complete_tree_array.c */
#define main program_main
#include "../../c/complete_tree_array.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* -- parent/left/right index formulas, hand-computed -- */
    CHECK_EQ_INT(parent(0), 0);     /* (0-1)/2 truncates toward zero in C: -1/2 == 0 */
    CHECK_EQ_INT(parent(1), 0);
    CHECK_EQ_INT(parent(2), 0);
    CHECK_EQ_INT(parent(3), 1);
    CHECK_EQ_INT(parent(4), 1);
    CHECK_EQ_INT(parent(11), 5);
    CHECK_EQ_INT(left(0), 1);
    CHECK_EQ_INT(right(0), 2);
    CHECK_EQ_INT(left(5), 11);
    CHECK_EQ_INT(right(5), 12);
    CHECK_EQ_INT(left(11), 23);

    /* -- empty array: 0 real nodes, vacuously complete -- */
    int empty_arr[] = { EMPTY, EMPTY, EMPTY };
    CHECK_EQ_INT(last_real_index(empty_arr, 3), -1);
    CHECK_EQ_INT(count_real(empty_arr, 3), 0);
    CHECK(is_complete(empty_arr, 3, -1) == true);

    /* -- single real node -- */
    int single_arr[] = { 5 };
    CHECK_EQ_INT(last_real_index(single_arr, 1), 0);
    CHECK_EQ_INT(count_real(single_arr, 1), 1);
    CHECK(is_complete(single_arr, 1, 0) == true);

    /* -- normal: 12 nodes, no gaps -- complete -- */
    int normal_arr[] = {8, 4, 15, 2, 6, 11, 20, 1, 3, 5, 7, 9};
    CHECK_EQ_INT(last_real_index(normal_arr, 12), 11);
    CHECK_EQ_INT(count_real(normal_arr, 12), 12);
    CHECK(is_complete(normal_arr, 12, 11) == true);

    /* -- hard: 19 nodes, no gaps -- complete, last level half full -- */
    int hard_arr[] = {
        50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85, 5, 15, 22, 28
    };
    CHECK_EQ_INT(last_real_index(hard_arr, 19), 18);
    CHECK_EQ_INT(count_real(hard_arr, 19), 19);
    CHECK(is_complete(hard_arr, 19, 18) == true);

    /* -- edge: NOT complete -- gap at index 9-10, index 11 filled -- */
    int gap_arr[] = {9, 4, 12, 2, 6, 10, 15, 1, 3, EMPTY, EMPTY, 7};
    CHECK_EQ_INT(last_real_index(gap_arr, 12), 11);
    CHECK_EQ_INT(count_real(gap_arr, 12), 10);
    CHECK(is_complete(gap_arr, 12, 11) == false);

    /* -- edge: gap right at the very start (index 0 empty, index 1 filled) -- not complete -- */
    int gap_at_start[] = { EMPTY, 5 };
    CHECK_EQ_INT(last_real_index(gap_at_start, 2), 1);
    CHECK_EQ_INT(count_real(gap_at_start, 2), 1);
    CHECK(is_complete(gap_at_start, 2, 1) == false);

    /* -- duplicates: repeated values do not confuse the empty/real distinction -- */
    int dup_arr[] = { 7, 7, 7, 7 };
    CHECK_EQ_INT(count_real(dup_arr, 4), 4);
    CHECK(is_complete(dup_arr, 4, 3) == true);

    TEST_SUMMARY();
}
