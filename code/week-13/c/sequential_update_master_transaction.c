/* Week 13 -- File Organisation I
 * Sequential update: merge a SORTED transaction file into a SORTED master file in one pass, producing a new
 * master file. Every transaction is add / change / delete; a change or delete on a key that is not in the
 * master is an error, and adding a key that already exists is also an error. The new master really lives on
 * disk, inside a temporary lab folder that main() creates and removes.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#ifdef _WIN32
#include <direct.h>
#define MKDIR(path) _mkdir(path)
#define RMDIR(path) _rmdir(path)
#else
#define MKDIR(path) mkdir(path, 0755)
#define RMDIR(path) rmdir(path)
#endif

static void lab_path(char *out, size_t n) {
#ifdef _WIN32
    const char *base = getenv("TEMP");
    if (!base) base = getenv("TMP");
    if (!base) base = ".";
#else
    const char *base = getenv("TMPDIR");
    if (!base) base = "/tmp";
#endif
    snprintf(out, n, "%s/cen207_week13_seqjoin_lab", base);
}

typedef struct { int key, val; } Rec;
typedef struct { int key; char op; int val; } Txn;   /* op: 'A' add, 'C' change, 'D' delete */

int merge_update(const Rec *master, int nm, const Txn *txn, int nt, FILE *out,
                 int *written, int *deleted, int *errors) {
    int i = 0, j = 0;
    while (i < nm && j < nt) {
        if (master[i].key < txn[j].key) {              /* master record has no transaction: copy it */
            fwrite(&master[i], sizeof(Rec), 1, out); (*written)++; i++;
        } else if (master[i].key > txn[j].key) {        /* transaction key is not in master (yet) */
            if (txn[j].op == 'A') {
                Rec r = { txn[j].key, txn[j].val };
                fwrite(&r, sizeof(Rec), 1, out); (*written)++;
            } else { (*errors)++; }                     /* change/delete: key not found */
            j++;
        } else {                                        /* same key: transaction applies to this record */
            if (txn[j].op == 'A') {                                 /* duplicate add: keep the original, flag the error */
                fwrite(&master[i], sizeof(Rec), 1, out); (*written)++; (*errors)++;
            }
            else if (txn[j].op == 'C') {
                Rec r = { master[i].key, txn[j].val };
                fwrite(&r, sizeof(Rec), 1, out); (*written)++;
            } else { (*deleted)++; }                    /* 'D': record is dropped, nothing written */
            i++; j++;
        }
    }
    while (i < nm) { fwrite(&master[i], sizeof(Rec), 1, out); (*written)++; i++; }   /* leftover master */
    while (j < nt) {                                                                  /* leftover transactions */
        if (txn[j].op == 'A') {
            Rec r = { txn[j].key, txn[j].val };
            fwrite(&r, sizeof(Rec), 1, out); (*written)++;
        } else { (*errors)++; }
        j++;
    }
    return *written;
}

/* ---- driver ------------------------------------------------------------ */

static void run_scenario(const char *label, const char *lab, Rec master[], int nm, Txn txn[], int nt) {
    printf("-- %s --\n", label);
    char path[512];
    snprintf(path, sizeof(path), "%s/newmaster.dat", lab);
    FILE *fp = fopen(path, "wb");
    int written = 0, deleted = 0, errors = 0;
    merge_update(master, nm, txn, nt, fp, &written, &deleted, &errors);
    fclose(fp);

    fp = fopen(path, "rb");
    Rec r;
    printf("  new master:");
    while (fread(&r, sizeof(r), 1, fp) == 1) printf(" %d:%d", r.key, r.val);
    printf("\n");
    fclose(fp);

    printf("summary: %d master, %d transactions -> written=%d deleted=%d errors=%d\n\n", nm, nt, written, deleted, errors);
    remove(path);
}

int main(void) {
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);

    Rec normal_m[] = { { 5, 10 }, { 10, 20 }, { 15, 30 }, { 20, 40 }, { 25, 50 }, { 30, 60 }, { 35, 70 }, { 40, 80 }, { 45, 90 }, { 50, 100 } };
    Txn normal_t[] = { { 8, 'A', 16 }, { 15, 'C', 999 }, { 25, 'D', 0 }, { 42, 'A', 84 }, { 50, 'C', 500 }, { 60, 'A', 120 } };

    Rec hard_m[] = { { 2, 6 }, { 6, 18 }, { 10, 30 }, { 14, 42 }, { 18, 54 }, { 22, 66 }, { 26, 78 }, { 30, 90 }, { 34, 102 }, { 38, 114 }, { 42, 126 } };
    Txn hard_t[] = { { 5, 'A', 15 }, { 12, 'A', 36 }, { 13, 'A', 39 }, { 18, 'C', 999 }, { 22, 'D', 0 }, { 34, 'C', 111 }, { 40, 'A', 120 }, { 50, 'A', 150 } };

    Rec dup_m[] = { { 3, 103 }, { 7, 107 }, { 11, 111 }, { 15, 115 }, { 19, 119 }, { 23, 123 }, { 27, 127 }, { 31, 131 }, { 35, 135 }, { 39, 139 } };
    Txn dup_t[] = { { 7, 'A', 777 }, { 11, 'C', 555 }, { 39, 'C', 999 }, { 45, 'A', 900 }, { 50, 'D', 0 } };

    Rec trail_m[] = { { 1, 2 }, { 4, 8 }, { 7, 14 }, { 10, 20 }, { 13, 26 }, { 16, 32 }, { 19, 38 }, { 22, 44 }, { 25, 50 }, { 28, 56 } };
    Txn trail_t[] = { { 5, 'D', 0 }, { 30, 'A', 60 }, { 35, 'C', 999 }, { 40, 'A', 80 }, { 45, 'D', 0 }, { 50, 'A', 100 } };

    run_scenario("normal: 10 master, 6 valid transactions", lab, normal_m, 10, normal_t, 6);
    run_scenario("hard: 11 master, 8 transactions (back-to-back adds)", lab, hard_m, 11, hard_t, 8);
    run_scenario("edge: adding an existing key + acting on a missing key (errors)", lab, dup_m, 10, dup_t, 5);
    run_scenario("edge: master runs out, trailing transactions (some invalid)", lab, trail_m, 10, trail_t, 6);

    RMDIR(lab);
    return 0;
}
