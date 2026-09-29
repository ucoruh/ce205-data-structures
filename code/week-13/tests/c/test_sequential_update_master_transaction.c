/* Unit tests for week-13 c/sequential_update_master_transaction.c */
#include <limits.h>

#define main program_main
#include "../../c/sequential_update_master_transaction.c"
#undef main
#include "../../../test_check.h"

static char scratch_path[600];
static FILE *open_scratch(void) {
    char base[512];
    lab_path(base, sizeof(base));
    snprintf(scratch_path, sizeof(scratch_path), "%s_scratch.bin", base);
    return fopen(scratch_path, "wb+");
}
static void close_scratch(FILE *fp) { fclose(fp); remove(scratch_path); }

static int read_all(FILE *fp, Rec out[], int max) {
    fflush(fp);
    rewind(fp);
    return (int) fread(out, sizeof(Rec), max, fp);
}

int main(void) {
    FILE *fp;
    int written, deleted, errors;
    Rec out[32];

    /* -- master key smaller than transaction key: copied unchanged -- */
    Rec m1[] = { { 5, 50 }, { 10, 100 } };
    Txn t1[] = { { 20, 'A', 200 } };
    fp = open_scratch();
    written = deleted = errors = 0;
    merge_update(m1, 2, t1, 1, fp, &written, &deleted, &errors);
    CHECK_EQ_INT(written, 3);
    CHECK_EQ_INT(deleted, 0);
    CHECK_EQ_INT(errors, 0);
    CHECK_EQ_INT(read_all(fp, out, 32), 3);
    CHECK_EQ_INT(out[0].key, 5); CHECK_EQ_INT(out[0].val, 50);
    CHECK_EQ_INT(out[1].key, 10); CHECK_EQ_INT(out[1].val, 100);
    CHECK_EQ_INT(out[2].key, 20); CHECK_EQ_INT(out[2].val, 200);
    close_scratch(fp);

    /* -- add: transaction key not in master, between two master keys -- */
    Rec m2[] = { { 5, 50 }, { 15, 150 } };
    Txn t2[] = { { 10, 'A', 100 } };
    fp = open_scratch();
    written = deleted = errors = 0;
    merge_update(m2, 2, t2, 1, fp, &written, &deleted, &errors);
    CHECK_EQ_INT(written, 3);
    CHECK_EQ_INT(errors, 0);
    CHECK_EQ_INT(read_all(fp, out, 32), 3);
    CHECK_EQ_INT(out[1].key, 10); CHECK_EQ_INT(out[1].val, 100);
    close_scratch(fp);

    /* -- change/delete on a key that is not in the master: error, nothing written -- */
    Rec m3[] = { { 5, 50 }, { 15, 150 } };
    Txn t3c[] = { { 10, 'C', 999 } };
    fp = open_scratch();
    written = deleted = errors = 0;
    merge_update(m3, 2, t3c, 1, fp, &written, &deleted, &errors);
    CHECK_EQ_INT(written, 2);   /* just the 2 master records, unchanged */
    CHECK_EQ_INT(errors, 1);
    close_scratch(fp);

    Txn t3d[] = { { 10, 'D', 0 } };
    fp = open_scratch();
    written = deleted = errors = 0;
    merge_update(m3, 2, t3d, 1, fp, &written, &deleted, &errors);
    CHECK_EQ_INT(written, 2);
    CHECK_EQ_INT(errors, 1);
    close_scratch(fp);

    /* -- add on an EXISTING key: duplicate error, master record untouched -- */
    Rec m4[] = { { 10, 100 } };
    Txn t4[] = { { 10, 'A', 999 } };
    fp = open_scratch();
    written = deleted = errors = 0;
    merge_update(m4, 1, t4, 1, fp, &written, &deleted, &errors);
    CHECK_EQ_INT(written, 1);
    CHECK_EQ_INT(errors, 1);
    CHECK_EQ_INT(read_all(fp, out, 32), 1);
    CHECK_EQ_INT(out[0].val, 100);   /* the OLD value, not 999 */
    close_scratch(fp);

    /* -- change on an existing key: value replaced -- */
    Rec m5[] = { { 10, 100 } };
    Txn t5[] = { { 10, 'C', 999 } };
    fp = open_scratch();
    written = deleted = errors = 0;
    merge_update(m5, 1, t5, 1, fp, &written, &deleted, &errors);
    CHECK_EQ_INT(written, 1);
    CHECK_EQ_INT(read_all(fp, out, 32), 1);
    CHECK_EQ_INT(out[0].val, 999);
    close_scratch(fp);

    /* -- delete on an existing key: record dropped, nothing written for it -- */
    Rec m6[] = { { 10, 100 }, { 20, 200 } };
    Txn t6[] = { { 10, 'D', 0 } };
    fp = open_scratch();
    written = deleted = errors = 0;
    merge_update(m6, 2, t6, 1, fp, &written, &deleted, &errors);
    CHECK_EQ_INT(written, 1);
    CHECK_EQ_INT(deleted, 1);
    CHECK_EQ_INT(read_all(fp, out, 32), 1);
    CHECK_EQ_INT(out[0].key, 20);
    close_scratch(fp);

    /* -- leftover master after transactions are exhausted: copied unchanged -- */
    Rec m7[] = { { 1, 1 }, { 2, 2 }, { 3, 3 } };
    Txn t7[] = { { 1, 'D', 0 } };
    fp = open_scratch();
    written = deleted = errors = 0;
    merge_update(m7, 3, t7, 1, fp, &written, &deleted, &errors);
    CHECK_EQ_INT(written, 2);
    CHECK_EQ_INT(deleted, 1);
    CHECK_EQ_INT(read_all(fp, out, 32), 2);
    CHECK_EQ_INT(out[0].key, 2); CHECK_EQ_INT(out[1].key, 3);
    close_scratch(fp);

    /* -- leftover (trailing) transactions after master is exhausted: add succeeds, change/delete error -- */
    Rec m8[] = { { 1, 1 } };
    Txn t8[] = { { 5, 'A', 50 }, { 6, 'D', 0 }, { 7, 'C', 70 } };
    fp = open_scratch();
    written = deleted = errors = 0;
    merge_update(m8, 1, t8, 3, fp, &written, &deleted, &errors);
    CHECK_EQ_INT(written, 2);   /* the 1 master record + the trailing add */
    CHECK_EQ_INT(errors, 2);   /* trailing D and C on missing keys */
    close_scratch(fp);

    /* -- INT_MIN/INT_MAX round-trip through key and val unchanged (traced by hand) -- */
    Rec m11[] = { { INT_MIN, 1 }, { 0, 2 }, { INT_MAX, 3 } };
    Txn t11[] = { { INT_MIN, 'C', INT_MAX }, { INT_MAX, 'C', INT_MIN } };
    fp = open_scratch();
    written = deleted = errors = 0;
    merge_update(m11, 3, t11, 2, fp, &written, &deleted, &errors);
    CHECK_EQ_INT(written, 3);
    CHECK_EQ_INT(errors, 0);
    CHECK_EQ_INT(read_all(fp, out, 32), 3);
    CHECK_EQ_INT(out[0].key, INT_MIN); CHECK_EQ_INT(out[0].val, INT_MAX);
    CHECK_EQ_INT(out[2].key, INT_MAX); CHECK_EQ_INT(out[2].val, INT_MIN);
    close_scratch(fp);

    /* -- empty master: every transaction is either an add or an error -- */
    Txn t9[] = { { 1, 'A', 10 }, { 2, 'D', 0 } };
    fp = open_scratch();
    written = deleted = errors = 0;
    merge_update(NULL, 0, t9, 2, fp, &written, &deleted, &errors);
    CHECK_EQ_INT(written, 1);
    CHECK_EQ_INT(errors, 1);
    close_scratch(fp);

    /* -- empty transactions: every master record is copied unchanged -- */
    Rec m10[] = { { 1, 1 }, { 2, 2 } };
    fp = open_scratch();
    written = deleted = errors = 0;
    merge_update(m10, 2, NULL, 0, fp, &written, &deleted, &errors);
    CHECK_EQ_INT(written, 2);
    CHECK_EQ_INT(deleted, 0);
    CHECK_EQ_INT(errors, 0);
    close_scratch(fp);

    /* -- integration: run_scenario writes a real file inside a real lab folder and cleans it up -- */
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);
    Rec tinym[] = { { 1, 10 }, { 2, 20 } };
    Txn tinyt[] = { { 3, 'A', 30 } };
    run_scenario("unit-test integration", lab, tinym, 2, tinyt, 1);
    char check_path[600];
    snprintf(check_path, sizeof(check_path), "%s/newmaster.dat", lab);
    FILE *gone = fopen(check_path, "rb");
    CHECK(gone == NULL);
    RMDIR(lab);

    TEST_SUMMARY();
}
