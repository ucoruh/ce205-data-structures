#define main program_main
#include "../../c/external_merge_sort.c"
#undef main
#include "../../../test_check.h"

#if defined(_WIN32)
#include <io.h>
#define DUP(fd) _dup(fd)
#define DUP2(a, b) _dup2(a, b)
#define CLOSEFD(fd) _close(fd)
#define FILENO(f) _fileno(f)
#else
#include <unistd.h>
#define DUP(fd) dup(fd)
#define DUP2(a, b) dup2(a, b)
#define CLOSEFD(fd) close(fd)
#define FILENO(f) fileno(f)
#endif

static int read_all(const char *name, int out[]) {
    FILE *f = fopen(lab_path(name), "r");
    int n = 0, v;
    while (fscanf(f, "%d", &v) == 1)
        out[n++] = v;
    fclose(f);
    return n;
}

/* external_merge_sort() prints its final sorted run to stdout and deletes the file, so to test
 * the full end-to-end function (not just its create_runs/merge_group building blocks) this
 * captures stdout to a lab file, runs it, and hands the captured text back to the caller. */
static void capture_run(const int keys[], int n, int run_size, int fan_in,
                         int *reads, int *writes, int *passes, char *out_buf, size_t out_cap) {
    fflush(stdout);
    int saved_fd = DUP(FILENO(stdout));
    FILE *tmp = fopen(lab_path("stdout_capture.txt"), "w");
    DUP2(FILENO(tmp), FILENO(stdout));
    external_merge_sort(keys, n, run_size, fan_in, reads, writes, passes);
    fflush(stdout);
    DUP2(saved_fd, FILENO(stdout));
    CLOSEFD(saved_fd);
    fclose(tmp);
    FILE *r = fopen(lab_path("stdout_capture.txt"), "r");
    size_t len = fread(out_buf, 1, out_cap - 1, r);
    out_buf[len] = '\0';
    fclose(r);
    remove(lab_path("stdout_capture.txt"));
}

/* Independent parse: pulls the space-separated integers that follow `marker` out of `text`. */
static void parse_ints_after(const char *text, const char *marker, int out[], int max_n, int *count) {
    const char *p = strstr(text, marker);
    *count = 0;
    if (p == NULL)
        return;
    p += strlen(marker);
    while (*count < max_n) {
        while (*p == ' ')
            p++;
        if (*p == '\0' || *p == '\n' || *p == '\r')
            break;
        char *end;
        long v = strtol(p, &end, 10);
        if (end == p)
            break;
        out[(*count)++] = (int) v;
        p = end;
    }
}

int main(void) {
    MKDIR(LAB_DIR);

    /* create_runs: RUN_SIZE=3 over 7 values makes 3 runs (3, 3, 1), each sorted */
    int input[] = {9, 2, 7, 4, 1, 8, 5};
    char names[MAX_RUNS][32];
    int writes = 0;
    int num_runs = create_runs(input, 7, 3, names, &writes);
    CHECK_EQ_INT(num_runs, 3);
    CHECK_EQ_INT(writes, 3);
    int buf[16];
    CHECK_EQ_INT(read_all(names[0], buf), 3);
    CHECK_EQ_INT(buf[0], 2);
    CHECK_EQ_INT(buf[1], 7);
    CHECK_EQ_INT(buf[2], 9);
    CHECK_EQ_INT(read_all(names[2], buf), 1);
    CHECK_EQ_INT(buf[0], 5);
    remove(lab_path(names[0]));
    remove(lab_path(names[1]));
    remove(lab_path(names[2]));

    /* create_runs: RUN_SIZE >= n makes exactly one run holding everything, sorted */
    int single_in[] = {5, 1, 4, 2, 3};
    char single_names[MAX_RUNS][32];
    int w2 = 0;
    int n2 = create_runs(single_in, 5, 100, single_names, &w2);
    CHECK_EQ_INT(n2, 1);
    CHECK_EQ_INT(read_all(single_names[0], buf), 5);
    for (int i = 1; i < 5; i++)
        CHECK(buf[i - 1] < buf[i]);
    remove(lab_path(single_names[0]));

    /* merge_group: two sorted runs merge into one, in order, and the inputs are removed */
    FILE *fa = fopen(lab_path("t_a.txt"), "w");
    fprintf(fa, "1\n4\n7\n");
    fclose(fa);
    FILE *fb = fopen(lab_path("t_b.txt"), "w");
    fprintf(fb, "2\n3\n9\n");
    fclose(fb);
    char group_names[2][32];
    strcpy(group_names[0], "t_a.txt");
    strcpy(group_names[1], "t_b.txt");
    int reads = 0, mwrites = 0;
    merge_group(group_names, 2, "t_out.txt", &reads, &mwrites);
    CHECK_EQ_INT(reads, 2);
    CHECK_EQ_INT(mwrites, 1);
    int n3 = read_all("t_out.txt", buf);
    CHECK_EQ_INT(n3, 6);
    int expected[] = {1, 2, 3, 4, 7, 9};
    for (int i = 0; i < 6; i++)
        CHECK_EQ_INT(buf[i], expected[i]);
    FILE *check_removed = fopen(lab_path("t_a.txt"), "r");
    CHECK(check_removed == NULL); /* merged-away input was deleted */
    remove(lab_path("t_out.txt"));

    /* merge_group: one empty run merged with a non-empty one still sorts correctly */
    FILE *fe = fopen(lab_path("t_empty.txt"), "w");
    fclose(fe);
    FILE *fc = fopen(lab_path("t_c.txt"), "w");
    fprintf(fc, "3\n1\n2\n"); /* NOTE: merge_group assumes sorted input; use a sorted run */
    fclose(fc);
    remove(lab_path("t_c.txt"));
    FILE *fc2 = fopen(lab_path("t_c.txt"), "w");
    fprintf(fc2, "1\n2\n3\n");
    fclose(fc2);
    char group2[2][32];
    strcpy(group2[0], "t_empty.txt");
    strcpy(group2[1], "t_c.txt");
    int r2 = 0, w3 = 0;
    merge_group(group2, 2, "t_out2.txt", &r2, &w3);
    int n4 = read_all("t_out2.txt", buf);
    CHECK_EQ_INT(n4, 3);
    CHECK_EQ_INT(buf[0], 1);
    remove(lab_path("t_out2.txt"));

    /* external_merge_sort end-to-end, ONE run: RUN_SIZE >= n means create_runs makes exactly
     * one run and the "while (num_runs > 1)" merge loop in external_merge_sort never executes
     * at all -- reading that loop condition (not running the program) is what tells us passes
     * must be 0, reads must be 0 (merge_group is never called) and writes must be 1 (the single
     * run file). The sorted content itself is checked against qsort() (the C library's own
     * independent sort), not against anything external_merge_sort printed before. */
    {
        const int one_run[] = {9, 3, 7, 1, 8, 2, 6, 4, 10, 5};
        int reads = 0, writes = 0, passes = 0;
        char out[1024];
        capture_run(one_run, 10, 100, 2, &reads, &writes, &passes, out, sizeof out);
        CHECK_EQ_INT(passes, 0);
        CHECK_EQ_INT(writes, 1);
        CHECK_EQ_INT(reads, 0);
        int got[16], gc = 0;
        parse_ints_after(out, "sorted output:", got, 16, &gc);
        int expect[10];
        for (int i = 0; i < 10; i++)
            expect[i] = one_run[i];
        qsort(expect, 10, sizeof(int), cmp_int);
        CHECK_EQ_INT(gc, 10);
        for (int i = 0; i < 10; i++)
            CHECK_EQ_INT(got[i], expect[i]);
        CHECK(strstr(out, "pass 0: 1 runs created") != NULL);
    }

    /* external_merge_sort end-to-end, MANY runs/passes: 16 values, RUN_SIZE=2 -> 8 runs;
     * FAN_IN=2 merges pairs each pass, so the run count halves every pass: 8 -> 4 -> 2 -> 1,
     * which is exactly 3 passes (a plain ceil(log2(8)) count, derived from the numbers, not
     * from running the program). Every pass merges ALL of its runs in pairs (8, 4 and 2 are all
     * even), so every merge_group call handles exactly 2 runs: reads = 2 per merge * 7 merges
     * = 14, writes = 8 (create_runs) + 7 (one per merge) = 15. */
    {
        const int many_keys[] = {40, 11, 27, 8, 33, 2, 45, 16, 38, 23, 5, 30, 19, 44, 1, 50};
        int reads = 0, writes = 0, passes = 0;
        char out[2048];
        capture_run(many_keys, 16, 2, 2, &reads, &writes, &passes, out, sizeof out);
        CHECK_EQ_INT(passes, 3);
        CHECK_EQ_INT(writes, 15);
        CHECK_EQ_INT(reads, 14);
        int got[32], gc = 0;
        parse_ints_after(out, "sorted output:", got, 32, &gc);
        int expect[16];
        for (int i = 0; i < 16; i++)
            expect[i] = many_keys[i];
        qsort(expect, 16, sizeof(int), cmp_int);
        CHECK_EQ_INT(gc, 16);
        for (int i = 0; i < 16; i++)
            CHECK_EQ_INT(got[i], expect[i]);
        CHECK(strstr(out, "pass 0: 8 runs created") != NULL);
        CHECK(strstr(out, "pass 3: 1 run(s) remain") != NULL);
    }

    RMDIR(LAB_DIR);
    TEST_SUMMARY();
}
