/* Week 1 -- Introduction to Data Structures
 * Pointer arithmetic: p + k means base address + k * sizeof(*p), never k bytes.
 * An out-of-range k is undefined behavior (UB); the guard below reports it instead of reading it.
 * Addresses are a PRETEND base (matching the animation), not real OS addresses, so the output is
 * reproducible and can be compared byte for byte with the Java version.
 * Runs the same normal / hard / edge-case scenarios as the pointer-arithmetic animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

static void run_int_scenario(const char *label, long base, const int values[], int n,
                              const int offsets[], int offCount) {
    printf("-- %s (type = int, sizeof = %zu) --\n", label, sizeof(int));
    const int *p = values;   /* p decays to point at values[0] */
    for (int i = 0; i < offCount; i++) {
        int k = offsets[i];
        if (k < 0 || k >= n) {
            printf("p + %d -> out of range (UB): 0 <= k < %d required\n", k, n);
            continue;
        }
        long addr = base + (long) k * (long) sizeof(int);
        printf("p + %d = %ld, *(p + %d) = %d\n", k, addr, k, *(p + k));
    }
    printf("\n");
}

static void run_double_scenario(const char *label, long base, const double values[], int n,
                                 const int offsets[], int offCount) {
    printf("-- %s (type = double, sizeof = %zu) --\n", label, sizeof(double));
    const double *p = values;
    for (int i = 0; i < offCount; i++) {
        int k = offsets[i];
        if (k < 0 || k >= n) {
            printf("p + %d -> out of range (UB): 0 <= k < %d required\n", k, n);
            continue;
        }
        long addr = base + (long) k * (long) sizeof(double);
        printf("p + %d = %ld, *(p + %d) = %.0f\n", k, addr, k, *(p + k));
    }
    printf("\n");
}

static void run_char_scenario(const char *label, long base, const char values[], int n,
                               const int offsets[], int offCount) {
    printf("-- %s (type = char, sizeof = %zu) --\n", label, sizeof(char));
    const char *p = values;
    for (int i = 0; i < offCount; i++) {
        int k = offsets[i];
        if (k < 0 || k >= n) {
            printf("p + %d -> out of range (UB): 0 <= k < %d required\n", k, n);
            continue;
        }
        long addr = base + (long) k * (long) sizeof(char);   /* sizeof(char) is always 1 */
        printf("p + %d = %ld, *(p + %d) = %d\n", k, addr, k, (int) *(p + k));
    }
    printf("\n");
}

int main(void) {
    /* normal: int array, 5 valid offsets */
    int normalValues[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    int normalOffsets[] = {0, 1, 2, 4, 9};
    run_int_scenario("normal: int array, 5 valid offsets", 1000, normalValues, 10, normalOffsets, 5);

    /* hard: double array (sizeof = 8), 7 offsets */
    double hardValues[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
    int hardOffsets[] = {0, 2, 5, 8, 11, 6, 3};
    run_double_scenario("hard: double array (sizeof = 8), 7 offsets", 2000, hardValues, 12, hardOffsets, 7);

    /* edge: out-of-range offsets, negative and beyond N */
    int edgeValues[] = {4, 8, 15, 16, 23, 42, 8, 9, 15, 3};
    int edgeOffsets[] = {-1, 0, 5, 10, 15};
    run_int_scenario("edge: out-of-range offsets (negative and beyond N)", 1000, edgeValues, 10, edgeOffsets, 5);

    /* edge: char array (sizeof = 1), p + k coincides with k bytes */
    char charValues[] = {65, 66, 67, 68, 69, 70, 71, 72, 73, 74};
    int charOffsets[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    run_char_scenario("edge: char array (sizeof = 1)", 500, charValues, 10, charOffsets, 10);

    return 0;
}
