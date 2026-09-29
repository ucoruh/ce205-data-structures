/* Unit tests for week-13 c/records_and_fields.c */
#include <limits.h>

#define main program_main
#include "../../c/records_and_fields.c"
#undef main
#include "../../../test_check.h"

static long fsize(FILE *fp) { fseek(fp, 0, SEEK_END); long n = ftell(fp); return n; }

/* MinGW's tmpfile() needs admin rights (it tries to create the file at the drive root), so every test opens
   a real, named scratch file in the OS temp directory instead, and removes it right after. */
static char scratch_path[600];
static FILE *open_scratch(void) {
    char base[512];
    lab_path(base, sizeof(base));
    snprintf(scratch_path, sizeof(scratch_path), "%s_scratch.bin", base);
    return fopen(scratch_path, "wb+");
}
static void close_scratch(FILE *fp) { fclose(fp); remove(scratch_path); }

int main(void) {
    FILE *fp;
    int n;

    /* -- write_fixed: short name is padded with '_' -- */
    fp = open_scratch();
    n = write_fixed(fp, 101, "ANN", 91);
    CHECK_EQ_INT(n, 4 + NAME_FIXED + 4);
    CHECK_EQ_INT(fsize(fp), 4 + NAME_FIXED + 4);
    fseek(fp, 0, SEEK_SET);
    FixedRecord r;
    CHECK_EQ_INT((int) fread(&r, sizeof(r), 1, fp), 1);
    CHECK_EQ_INT(r.id, 101);
    CHECK_EQ_INT(r.score, 91);
    CHECK(memcmp(r.name, "ANN_____", NAME_FIXED) == 0);   /* 3 letters + 5 '_' padding */
    close_scratch(fp);

    /* -- write_fixed: name exactly NAME_FIXED long -- no padding, no truncation -- */
    fp = open_scratch();
    write_fixed(fp, 1, "ABCDEFGH", 0);
    fseek(fp, 0, SEEK_SET);
    fread(&r, sizeof(r), 1, fp);
    CHECK(memcmp(r.name, "ABCDEFGH", NAME_FIXED) == 0);
    close_scratch(fp);

    /* -- write_fixed: name longer than NAME_FIXED -- truncated, extra characters lost -- */
    fp = open_scratch();
    write_fixed(fp, 2, "ABCDEFGHIJ", 0);   /* 10 letters, only first 8 kept */
    fseek(fp, 0, SEEK_SET);
    fread(&r, sizeof(r), 1, fp);
    CHECK(memcmp(r.name, "ABCDEFGH", NAME_FIXED) == 0);
    close_scratch(fp);

    /* -- write_fixed: empty name -- all padding -- */
    fp = open_scratch();
    write_fixed(fp, 3, "", 0);
    fseek(fp, 0, SEEK_SET);
    fread(&r, sizeof(r), 1, fp);
    CHECK(memcmp(r.name, "________", NAME_FIXED) == 0);
    close_scratch(fp);

    /* -- write_fixed: INT_MIN / INT_MAX round-trip through id and score -- */
    fp = open_scratch();
    write_fixed(fp, INT_MAX, "X", INT_MIN);
    fseek(fp, 0, SEEK_SET);
    fread(&r, sizeof(r), 1, fp);
    CHECK_EQ_INT(r.id, INT_MAX);
    CHECK_EQ_INT(r.score, INT_MIN);
    close_scratch(fp);

    /* -- write_fixed: every record is always the same size, whatever the content -- */
    fp = open_scratch();
    int s1 = write_fixed(fp, 1, "", 0);
    int s2 = write_fixed(fp, 2, "ABCDEFGHIJKLMNOP", 0);
    CHECK_EQ_INT(s1, s2);
    close_scratch(fp);

    /* -- write_delim: short name -- id,score not written, just name + '|' -- */
    fp = open_scratch();
    n = write_delim(fp, 101, "ANN", 91);
    CHECK_EQ_INT(n, 4 + 3 + 1 + 4);
    CHECK_EQ_INT(fsize(fp), 4);   /* "ANN|" is 4 bytes on disk (id/score are not actually written here) */
    fseek(fp, 0, SEEK_SET);
    char buf[16] = { 0 };
    fread(buf, 1, 4, fp);
    CHECK(memcmp(buf, "ANN|", 4) == 0);
    close_scratch(fp);

    /* -- write_delim: empty name -- just the delimiter -- */
    fp = open_scratch();
    n = write_delim(fp, 1, "", 0);
    CHECK_EQ_INT(n, 4 + 0 + 1 + 4);
    CHECK_EQ_INT(fsize(fp), 1);
    close_scratch(fp);

    /* -- write_delim: long name does NOT get truncated (unlike write_fixed) -- */
    fp = open_scratch();
    n = write_delim(fp, 1, "ABCDEFGHIJKLMNOP", 0);   /* 16 letters */
    CHECK_EQ_INT(n, 4 + 16 + 1 + 4);
    CHECK_EQ_INT(fsize(fp), 17);
    close_scratch(fp);

    /* -- write_lenpfx: short name -- 1 length byte + the name bytes -- */
    fp = open_scratch();
    n = write_lenpfx(fp, 101, "ANN", 91);
    CHECK_EQ_INT(n, 4 + 1 + 3 + 4);
    CHECK_EQ_INT(fsize(fp), 1 + 3);
    fseek(fp, 0, SEEK_SET);
    unsigned char lb;
    fread(&lb, 1, 1, fp);
    CHECK_EQ_INT(lb, 3);
    memset(buf, 0, sizeof(buf));
    fread(buf, 1, lb, fp);
    CHECK(memcmp(buf, "ANN", 3) == 0);
    close_scratch(fp);

    /* -- write_lenpfx: empty name -- length byte 0, nothing after it -- */
    fp = open_scratch();
    n = write_lenpfx(fp, 1, "", 0);
    CHECK_EQ_INT(fsize(fp), 1);
    fseek(fp, 0, SEEK_SET);
    fread(&lb, 1, 1, fp);
    CHECK_EQ_INT(lb, 0);
    close_scratch(fp);

    /* -- write_lenpfx: long name does NOT get truncated either -- */
    fp = open_scratch();
    n = write_lenpfx(fp, 1, "ABCDEFGHIJKLMNOP", 0);
    CHECK_EQ_INT(n, 4 + 1 + 16 + 4);
    close_scratch(fp);

    /* -- integration: run_scenario writes real files inside a real lab folder and cleans up -- */
    char lab[512];
    lab_path(lab, sizeof(lab));
    RMDIR(lab);
    MKDIR(lab);
    RecIn tiny[] = { { 1, "A", 10 }, { 2, "BBBBBBBBBB", 20 } };   /* one short, one truncated */
    run_scenario("unit-test integration", lab, tiny, 2);
    char check_path[600];
    snprintf(check_path, sizeof(check_path), "%s/fixed.dat", lab);
    FILE *gone = fopen(check_path, "rb");
    CHECK(gone == NULL);   /* run_scenario removes its own files when it is done */
    RMDIR(lab);

    TEST_SUMMARY();
}
