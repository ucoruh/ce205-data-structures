#define main program_main
#include "../../c/replacement_selection.c"
#undef main
#include "../../../test_check.h"

static int read_all(const char *name, int out[]) {
    FILE *f = fopen(lab_path(name), "r");
    int n = 0, v;
    while (fscanf(f, "%d", &v) == 1)
        out[n++] = v;
    fclose(f);
    return n;
}

/* Independent multiset check: every value in `expected` (n of them) must appear in `got`
 * exactly once, counted by brute-force linear scan -- catches a value silently dropped,
 * duplicated, or corrupted while being moved between runs. */
static void check_same_multiset(const int got[], int got_n, const int expected[], int expected_n) {
    CHECK_EQ_INT(got_n, expected_n);
    for (int i = 0; i < expected_n; i++) {
        int count = 0;
        for (int j = 0; j < got_n; j++)
            if (got[j] == expected[i])
                count++;
        CHECK_EQ_INT(count, 1);
    }
}

int main(void) {
    /* extract_min_current: picks the smallest CURRENT item, skips NEXT-tagged ones */
    Item w1[4] = {{5, CURRENT}, {2, NEXT}, {9, CURRENT}, {1, NEXT}};
    CHECK_EQ_INT(extract_min_current(w1, 4), 0); /* 5 is the smallest among CURRENT (5, 9) */

    Item w2[3] = {{5, NEXT}, {2, NEXT}, {9, NEXT}};
    CHECK_EQ_INT(extract_min_current(w2, 3), -1); /* nothing CURRENT: signals "start a new run" */

    Item w3[1] = {{7, CURRENT}};
    CHECK_EQ_INT(extract_min_current(w3, 1), 0);

    Item w4[3] = {{3, CURRENT}, {3, CURRENT}, {1, CURRENT}};
    CHECK_EQ_INT(extract_min_current(w4, 3), 2); /* ties go to the first-seen minimum */

    /* replacement_selection over a real (small, in-memory-written) file */
    MKDIR(LAB_DIR);
    FILE *in = fopen(lab_path("t_in.txt"), "w");
    int vals[] = {40, 11, 27, 8, 33, 2, 45, 16, 38, 23, 5, 30};
    for (int i = 0; i < 12; i++)
        fprintf(in, "%d\n", vals[i]);
    fclose(in);
    FILE *rin = fopen(lab_path("t_in.txt"), "r");
    int reads = 0, writes = 0, run_count = 0;
    char run_names[MAX_RUNS][32];
    replacement_selection(rin, 4, &reads, &writes, run_names, &run_count);
    fclose(rin);
    CHECK_EQ_INT(run_count, 2);
    CHECK_EQ_INT(reads, 12);
    CHECK_EQ_INT(writes, 12);
    int buf[16];
    int r0 = read_all(run_names[0], buf);
    for (int i = 1; i < r0; i++)
        CHECK(buf[i - 1] < buf[i]); /* every run is internally sorted */
    int r1 = read_all(run_names[1], buf);
    for (int i = 1; i < r1; i++)
        CHECK(buf[i - 1] < buf[i]);
    CHECK_EQ_INT(r0 + r1, 12); /* every value accounted for, none lost */
    remove(lab_path(run_names[0]));
    remove(lab_path(run_names[1]));

    /* worst case: strictly descending input makes every run exactly RAM_SIZE long
     * (except possibly a shorter final run once the input runs out) */
    FILE *in2 = fopen(lab_path("t_in2.txt"), "w");
    for (int v = 100; v >= 10; v -= 10)
        fprintf(in2, "%d\n", v);
    fclose(in2);
    FILE *rin2 = fopen(lab_path("t_in2.txt"), "r");
    int reads2 = 0, writes2 = 0, rc2 = 0;
    char names2[MAX_RUNS][32];
    replacement_selection(rin2, 4, &reads2, &writes2, names2, &rc2);
    fclose(rin2);
    CHECK_EQ_INT(rc2, 3); /* 10 values, RAM=4: runs of 4, 4, 2 */
    /* every value is read exactly once and written exactly once, whatever the run boundaries --
     * true by construction (one fscanf per read, one fprintf per extracted item), so reads and
     * writes must both equal n regardless of how many runs that turns into */
    CHECK_EQ_INT(reads2, 10);
    CHECK_EQ_INT(writes2, 10);
    int all2[16], all2n = 0;
    int r2_0 = read_all(names2[0], buf);
    CHECK_EQ_INT(r2_0, 4);
    for (int i = 0; i < r2_0; i++) all2[all2n++] = buf[i];
    int r2_1 = read_all(names2[1], buf);
    CHECK_EQ_INT(r2_1, 4);
    for (int i = 0; i < r2_1; i++) all2[all2n++] = buf[i];
    int r2_2 = read_all(names2[2], buf);
    CHECK_EQ_INT(r2_2, 2);
    for (int i = 0; i < r2_2; i++) all2[all2n++] = buf[i];
    /* worst case (strictly descending) means each run individually is forced down to exactly
     * RAM_SIZE, so it must ALSO come out sorted ascending within itself */
    for (int i = 1; i < r2_0; i++) CHECK(all2[i - 1] < all2[i]);
    for (int i = 1; i < r2_1; i++) CHECK(all2[r2_0 + i - 1] < all2[r2_0 + i]);
    for (int i = 1; i < r2_2; i++) CHECK(all2[r2_0 + r2_1 + i - 1] < all2[r2_0 + r2_1 + i]);
    const int desc_expected[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    check_same_multiset(all2, all2n, desc_expected, 10);
    remove(lab_path(names2[0]));
    remove(lab_path(names2[1]));
    remove(lab_path(names2[2]));

    /* best case: RAM >= n produces exactly one fully sorted run, whatever the input order */
    FILE *in3 = fopen(lab_path("t_in3.txt"), "w");
    int shuffled[] = {9, 3, 7, 1, 8, 2, 6, 4, 10, 5};
    for (int i = 0; i < 10; i++)
        fprintf(in3, "%d\n", shuffled[i]);
    fclose(in3);
    FILE *rin3 = fopen(lab_path("t_in3.txt"), "r");
    int reads3 = 0, writes3 = 0, rc3 = 0;
    char names3[MAX_RUNS][32];
    replacement_selection(rin3, 15, &reads3, &writes3, names3, &rc3);
    fclose(rin3);
    CHECK_EQ_INT(rc3, 1);
    CHECK_EQ_INT(reads3, 10);
    CHECK_EQ_INT(writes3, 10);
    int n3 = read_all(names3[0], buf);
    CHECK_EQ_INT(n3, 10);
    for (int i = 0; i < 10; i++)
        CHECK_EQ_INT(buf[i], i + 1); /* fully sorted 1..10 */
    remove(lab_path(names3[0]));

    remove(lab_path("t_in.txt"));
    remove(lab_path("t_in2.txt"));
    remove(lab_path("t_in3.txt"));
    RMDIR(LAB_DIR);
    TEST_SUMMARY();
}
