/* Week 14 -- File Organisation II
 * External merge sort: Pass 0 sorts RUN_SIZE-record chunks in RAM and writes them out as sorted
 * RUN FILES; later passes k-way MERGE up to FAN_IN runs at a time, reading one small buffer (a
 * single next value) per run file, until a single sorted run remains.
 *
 * This program creates real files, but only inside a lab folder it creates itself; every file and
 * the folder are removed again before the program exits.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#if defined(_WIN32)
#include <direct.h>
#define MKDIR(p) _mkdir(p)
#define RMDIR(p) _rmdir(p)
#else
#include <sys/stat.h>
#define MKDIR(p) mkdir(p, 0755)
#define RMDIR(p) rmdir(p)
#endif

#define LAB_DIR "lab_external_merge_sort"
#define MAX_RUNS 32
#define MAX_FAN_IN 8

static char path_buf[256];
static const char *lab_path(const char *name) {
    snprintf(path_buf, sizeof path_buf, "%s/%s", LAB_DIR, name);
    return path_buf;
}

static int cmp_int(const void *a, const void *b) { return *(const int *) a - *(const int *) b; }

/* Phase 1: RUN_SIZE-record chunks, sorted in RAM, written out as run files (+1 write per run). */
static int create_runs(const int input[], int n, int run_size, char names[][32], int *writes) {
    int r = 0;
    for (int i = 0; i < n; i += run_size) {
        int len = run_size;
        if (i + len > n)
            len = n - i;
        int chunk[64];
        for (int k = 0; k < len; k++)
            chunk[k] = input[i + k];
        qsort(chunk, (size_t) len, sizeof(int), cmp_int);
        snprintf(names[r], 32, "run_%d.txt", r);
        FILE *f = fopen(lab_path(names[r]), "w");
        for (int k = 0; k < len; k++)
            fprintf(f, "%d\n", chunk[k]);
        fclose(f);
        (*writes)++;
        r++;
    }
    return r;
}

/* Merge `g` run files into one new run file: ONE small read buffer per run (its next unread
 * value), never the whole run in RAM. */
static void merge_group(char names[][32], int g, const char *out_name, int *reads, int *writes) {
    FILE *in[MAX_FAN_IN];
    int val[MAX_FAN_IN], has[MAX_FAN_IN];
    for (int i = 0; i < g; i++) {
        in[i] = fopen(lab_path(names[i]), "r");
        has[i] = fscanf(in[i], "%d", &val[i]) == 1;
        (*reads)++;
    }
    FILE *out = fopen(lab_path(out_name), "w");
    while (1) {
        int best = -1;
        for (int i = 0; i < g; i++)
            if (has[i] && (best == -1 || val[i] < val[best]))
                best = i;
        if (best == -1)
            break;
        fprintf(out, "%d\n", val[best]);
        has[best] = fscanf(in[best], "%d", &val[best]) == 1;
    }
    fclose(out);
    (*writes)++;
    for (int i = 0; i < g; i++) {
        fclose(in[i]);
        remove(lab_path(names[i])); /* the merged-away run is no longer needed */
    }
}

static void external_merge_sort(const int input[], int n, int run_size, int fan_in, int *reads, int *writes, int *passes) {
    char names[MAX_RUNS][32];
    int num_runs = create_runs(input, n, run_size, names, writes);
    printf("pass 0: %d runs created\n", num_runs);

    *passes = 0;
    while (num_runs > 1) {
        (*passes)++;
        char next[MAX_RUNS][32];
        int next_n = 0;
        for (int g = 0; g < num_runs; g += fan_in) {
            int glen = fan_in;
            if (g + glen > num_runs)
                glen = num_runs - g;
            if (glen == 1) {
                strcpy(next[next_n], names[g]); /* lone run: carry forward, no I/O */
            } else {
                snprintf(next[next_n], 32, "pass%d_%d.txt", *passes, next_n);
                merge_group(&names[g], glen, next[next_n], reads, writes);
            }
            next_n++;
        }
        for (int i = 0; i < next_n; i++)
            strcpy(names[i], next[i]);
        num_runs = next_n;
        printf("pass %d: %d run(s) remain\n", *passes, num_runs);
    }

    printf("sorted output:");
    FILE *f = fopen(lab_path(names[0]), "r");
    int v;
    while (fscanf(f, "%d", &v) == 1)
        printf(" %d", v);
    fclose(f);
    printf("\n");
    remove(lab_path(names[0]));
}

static void run_scenario(const char *label, const int keys[], int n, int run_size, int fan_in) {
    printf("-- %s --\n", label);
    printf("RUN_SIZE=%d FAN_IN=%d\n", run_size, fan_in);
    int reads = 0, writes = 0, passes = 0;
    external_merge_sort(keys, n, run_size, fan_in, &reads, &writes, &passes);
    printf("passes=%d reads=%d writes=%d\n\n", passes, reads, writes);
}

int main(void) {
    MKDIR(LAB_DIR); /* self-made lab folder; nothing is ever written outside it */

    const int normal_keys[] = {40, 11, 27, 8, 33, 2, 45, 16, 38, 23, 5, 30};
    run_scenario("normal: 12 values, RUN_SIZE=4, FAN_IN=2", normal_keys, 12, 4, 2);

    const int hard_keys[] = {55, 12, 40, 3, 28, 61, 9, 47, 20, 34, 6, 52, 17, 44};
    run_scenario("hard: 14 values, RUN_SIZE=3, FAN_IN=3", hard_keys, 14, 3, 3);

    const int one_run_keys[] = {9, 3, 7, 1, 8, 2, 6, 4, 10, 5};
    run_scenario("edge: RUN_SIZE >= n, done in one pass", one_run_keys, 10, 12, 2);

    const int tiny_keys[] = {9, 3, 7, 1, 8, 2, 6, 4, 10, 5};
    run_scenario("edge: RUN_SIZE=1, many passes", tiny_keys, 10, 1, 2);

    RMDIR(LAB_DIR); /* clean up: the lab folder is empty and removed */
    return 0;
}
