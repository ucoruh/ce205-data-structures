/* Unit tests for code/week-02/c/array_insert_delete.c: insert_at() and delete_at().
   Independent oracle: each expected array state below is hand-computed from the operation sequence,
   never read back from arr[] before being asserted. */
#define main program_main
#include "../../c/array_insert_delete.c"
#undef main
#include "../../../test_check.h"

static void check_state(const char *label, const int expected[], int expected_size) {
    test_checks++;
    if (size != expected_size) {
        test_failures++;
        fprintf(stderr, "%s: size = %d, expected %d\n", label, size, expected_size);
    }
    for (int i = 0; i < expected_size && i < size; i++) {
        test_checks++;
        if (arr[i] != expected[i]) {
            test_failures++;
            fprintf(stderr, "%s: arr[%d] = %d, expected %d\n", label, i, arr[i], expected[i]);
        }
    }
}

int main(void) {
    /* Scenario A: cap=5, a full cycle -- front/middle/end inserts, overflow, front/middle/end deletes, underflow */
    size = 0; cap = 5;
    CHECK(insert_at(0, 10) == true);
    check_state("A: after insert_at(0,10)", (int[]){10}, 1);

    CHECK(insert_at(1, 20) == true);
    check_state("A: after insert_at(1,20)", (int[]){10, 20}, 2);

    CHECK(insert_at(0, 5) == true);                          /* front insert: shifts everything right */
    check_state("A: after insert_at(0,5)", (int[]){5, 10, 20}, 3);

    CHECK(insert_at(2, 15) == true);                         /* middle insert */
    check_state("A: after insert_at(2,15)", (int[]){5, 10, 15, 20}, 4);

    CHECK(insert_at(4, 99) == true);                         /* end insert: now full (size==cap) */
    check_state("A: after insert_at(4,99)", (int[]){5, 10, 15, 20, 99}, 5);

    CHECK(insert_at(2, 777) == false);                       /* overflow: rejected, array unchanged */
    check_state("A: after rejected overflow insert", (int[]){5, 10, 15, 20, 99}, 5);

    CHECK(delete_at(0) == true);                             /* delete front */
    check_state("A: after delete_at(0)", (int[]){10, 15, 20, 99}, 4);

    CHECK(delete_at(3) == true);                             /* delete last index */
    check_state("A: after delete_at(3)", (int[]){10, 15, 20}, 3);

    CHECK(delete_at(1) == true);                             /* delete middle */
    check_state("A: after delete_at(1)", (int[]){10, 20}, 2);

    CHECK(delete_at(0) == true);
    check_state("A: after delete_at(0) #2", (int[]){20}, 1);

    CHECK(delete_at(0) == true);
    check_state("A: after delete_at(0) #3 (now empty)", (int[]){0}, 0);

    CHECK(delete_at(0) == false);                            /* underflow: rejected on empty array */
    check_state("A: still empty after rejected delete", (int[]){0}, 0);

    /* Scenario B: cap=1, single-slot array */
    size = 0; cap = 1;
    CHECK(insert_at(0, 42) == true);
    check_state("B: single slot filled", (int[]){42}, 1);
    CHECK(insert_at(0, 99) == false);                        /* immediate overflow */
    check_state("B: unchanged after overflow", (int[]){42}, 1);
    CHECK(delete_at(0) == true);
    check_state("B: emptied", (int[]){0}, 0);
    CHECK(delete_at(0) == false);                            /* immediate underflow */
    CHECK(insert_at(0, 7) == true);                          /* usable again after emptying */
    check_state("B: reused after empty", (int[]){7}, 1);

    /* Scenario C: cap=4, duplicates and INT_MIN/INT_MAX/negative values */
    size = 0; cap = 4;
    CHECK(insert_at(0, -2147483648) == true);
    CHECK(insert_at(1, 2147483647) == true);
    CHECK(insert_at(1, -5) == true);                         /* middle insert */
    check_state("C: three inserted", (int[]){-2147483648, -5, 2147483647}, 3);
    CHECK(insert_at(3, -5) == true);                         /* duplicate value appended, now full */
    check_state("C: full with duplicate -5", (int[]){-2147483648, -5, 2147483647, -5}, 4);
    CHECK(insert_at(0, 999) == false);                       /* overflow */
    CHECK(delete_at(1) == true);                             /* removes the FIRST -5 (by position) */
    check_state("C: after removing first -5", (int[]){-2147483648, 2147483647, -5}, 3);
    CHECK(delete_at(2) == true);                              /* removes the remaining -5 (now last) */
    check_state("C: after removing second -5", (int[]){-2147483648, 2147483647}, 2);

    TEST_SUMMARY();
}
