/* Week 14 -- File Organisation II
 * Replacement selection: keep a small RAM window (a min-heap in practice); a record smaller
 * than the last one WRITTEN cannot extend the current run, so it is tagged for the NEXT run.
 * This makes runs longer than RAM -- about 2x on random data, one run in the best case, and
 * exactly RAM_SIZE in the worst case (strictly descending input).
 *
 * This program creates real files, but only inside a lab folder it creates itself; every file and
 * the folder are removed again before the program exits.
 * CEN207 Data Structures (formerly CE205)
 */
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>

#if defined(_WIN32)
#include <direct.h>
#define MKDIR(p) _mkdir(p)
#define RMDIR(p) _rmdir(p)
#else
#include <sys/stat.h>
#define MKDIR(p) mkdir(p, 0755)
#define RMDIR(p) rmdir(p)
#endif

#define LAB_DIR "lab_replacement_selection"
#define MAX_WINDOW 32
#define MAX_RUNS 32

static char path_buf[256];
static const char *lab_path(const char *name) {
    snprintf(path_buf, sizeof path_buf, "%s/%s", LAB_DIR, name);
    return path_buf;
}

typedef enum { CURRENT, NEXT } Tag;

typedef struct {
    int val;
    Tag tag;
} Item;

int extract_min_current(const Item window[], int w) {
    int best = -1;
    for (int i = 0; i < w; i++)
        if (window[i].tag == CURRENT && (best == -1 || window[i].val < window[best].val))
            best = i;
    return best;
}

static void replacement_selection(FILE *in, int m, int *reads, int *writes, char run_names[][32], int *run_count) {
    Item window[MAX_WINDOW];
    int w = 0;
    for (; w < m; w++) {
        if (fscanf(in, "%d", &window[w].val) != 1)
            break;
        window[w].tag = CURRENT;
        (*reads)++;
    }
    int last_written = INT_MIN;
    *run_count = 0;
    snprintf(run_names[*run_count], 32, "run_%d.txt", *run_count);
    FILE *out = fopen(lab_path(run_names[*run_count]), "w");

    while (w > 0) {
        int best = extract_min_current(window, w);
        if (best == -1) {
            for (int i = 0; i < w; i++)
                window[i].tag = CURRENT;
            last_written = INT_MIN;
            fclose(out);
            (*run_count)++;
            snprintf(run_names[*run_count], 32, "run_%d.txt", *run_count);
            out = fopen(lab_path(run_names[*run_count]), "w");
            continue;
        }
        int val = window[best].val;
        fprintf(out, "%d\n", val);
        (*writes)++;
        last_written = val;
        for (int i = best; i < w - 1; i++)
            window[i] = window[i + 1];
        w--;
        int v;
        if (fscanf(in, "%d", &v) == 1) {
            (*reads)++;
            window[w].val = v;
            window[w].tag = (v >= last_written) ? CURRENT : NEXT;
            w++;
        }
    }
    fclose(out);
    (*run_count)++;
}

static void run_scenario(const char *label, const int keys[], int n, int m) {
    printf("-- %s --\n", label);
    printf("RAM_SIZE=%d\n", m);

    FILE *input = fopen(lab_path("input.txt"), "w");
    for (int i = 0; i < n; i++)
        fprintf(input, "%d\n", keys[i]);
    fclose(input);

    FILE *in = fopen(lab_path("input.txt"), "r");
    int reads = 0, writes = 0, run_count = 0;
    char run_names[MAX_RUNS][32];
    replacement_selection(in, m, &reads, &writes, run_names, &run_count);
    fclose(in);

    printf("runs=%d reads=%d writes=%d\n", run_count, reads, writes);
    for (int r = 0; r < run_count; r++) {
        printf("  run %d:", r + 1);
        FILE *f = fopen(lab_path(run_names[r]), "r");
        int v;
        while (fscanf(f, "%d", &v) == 1)
            printf(" %d", v);
        fclose(f);
        printf("\n");
        remove(lab_path(run_names[r]));
    }
    remove(lab_path("input.txt"));
    printf("\n");
}

int main(void) {
    MKDIR(LAB_DIR); /* self-made lab folder; nothing is ever written outside it */

    const int normal_keys[] = {40, 11, 27, 8, 33, 2, 45, 16, 38, 23, 5, 30};
    run_scenario("normal: RAM=4, 12 mixed values", normal_keys, 12, 4);

    const int hard_keys[] = {55, 12, 40, 3, 28, 61, 9, 47, 20, 34, 6, 52, 17, 44};
    run_scenario("hard: RAM=3, 14 mixed values", hard_keys, 14, 3);

    const int desc_keys[] = {100, 90, 80, 70, 60, 50, 40, 30, 20, 10};
    run_scenario("edge: worst case, strictly descending input", desc_keys, 10, 4);

    const int all_keys[] = {9, 3, 7, 1, 8, 2, 6, 4, 10, 5};
    run_scenario("edge: best case, RAM >= n -- a single run", all_keys, 10, 15);

    RMDIR(LAB_DIR); /* clean up: the lab folder is empty and removed */
    return 0;
}
