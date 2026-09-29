/* Minimal unit-test helpers for the CEN207 C examples (no external framework needed).
 *
 * Usage in code/week-NN/tests/c/test_<program>.c:
 *     #define main program_main
 *     #include "../../c/<program>.c"
 *     #undef main
 *     #include "../../../test_check.h"
 *     int main(void) {
 *         CHECK_EQ_INT(linear_search(a, 10, 7, &cmp), 3);
 *         CHECK(cmp == 4);
 *         TEST_SUMMARY();          // prints the result and returns 0 only if every check passed
 *     }
 */
#ifndef CEN207_TEST_CHECK_H
#define CEN207_TEST_CHECK_H

#include <stdio.h>

static int test_checks = 0;
static int test_failures = 0;

#define CHECK(cond)                                                                    \
    do {                                                                               \
        test_checks++;                                                                 \
        if (!(cond)) {                                                                 \
            test_failures++;                                                           \
            fprintf(stderr, "%s:%d: CHECK failed: %s\n", __FILE__, __LINE__, #cond);   \
        }                                                                              \
    } while (0)

#define CHECK_EQ_INT(actual, expected)                                                 \
    do {                                                                               \
        long long a_ = (long long) (actual), e_ = (long long) (expected);              \
        test_checks++;                                                                 \
        if (a_ != e_) {                                                                \
            test_failures++;                                                           \
            fprintf(stderr, "%s:%d: %s == %lld, expected %lld\n",                      \
                    __FILE__, __LINE__, #actual, a_, e_);                              \
        }                                                                              \
    } while (0)

#define TEST_SUMMARY()                                                                 \
    do {                                                                               \
        printf("%d checks, %d failures\n", test_checks, test_failures);               \
        return test_failures == 0 ? 0 : 1;                                             \
    } while (0)

#endif
