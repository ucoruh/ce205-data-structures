/* Unit tests for code/week-02/c/dynamic_array_growth.c: da_append() and da_remove_last().
   Independent oracle: capacity/growths/shrinks/copies are hand-simulated from the growth rule (grow to
   cap*factor when full; shrink to cap/2 when size <= cap/4 and cap/2 >= cap0) below, not read from the
   program's own trace. */
#define main program_main
#include "../../c/dynamic_array_growth.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* Scenario A: cap0=1, factor=2.0, no shrink -- 12 appends, checkpoints at every growth */
    cap0 = 1; factor = 2.0; shrink_on = 0; copies = 0; growths = 0; shrinks = 0;
    DynArray a;
    a.cap = 1; a.size = 0;
    a.data = malloc(sizeof(int) * (size_t) a.cap);

    da_append(&a, 5);
    CHECK_EQ_INT(a.size, 1); CHECK_EQ_INT(a.cap, 1); CHECK_EQ_INT(growths, 0);

    da_append(&a, 12);        /* size==cap(1): grows to 2, copies 1 element */
    CHECK_EQ_INT(a.size, 2); CHECK_EQ_INT(a.cap, 2); CHECK_EQ_INT(growths, 1); CHECK_EQ_INT(copies, 1);

    da_append(&a, 8);         /* size==cap(2): grows to 4, copies 2 elements (total 3) */
    CHECK_EQ_INT(a.cap, 4); CHECK_EQ_INT(growths, 2); CHECK_EQ_INT(copies, 3);

    da_append(&a, 19); da_append(&a, 3);   /* the 5th append (size==cap(4)) grows to 8, copies 4 (total 7) */
    CHECK_EQ_INT(a.size, 5); CHECK_EQ_INT(a.cap, 8); CHECK_EQ_INT(growths, 3); CHECK_EQ_INT(copies, 7);

    da_append(&a, 27); da_append(&a, 14); da_append(&a, 6);   /* fills to size 8 = cap, no grow yet */
    CHECK_EQ_INT(a.size, 8); CHECK_EQ_INT(a.cap, 8); CHECK_EQ_INT(growths, 3);

    da_append(&a, 31);        /* size==cap(8): grows to 16, copies 8 (total 15) */
    CHECK_EQ_INT(a.cap, 16); CHECK_EQ_INT(growths, 4); CHECK_EQ_INT(copies, 15);

    da_append(&a, 9); da_append(&a, 22); da_append(&a, 17);
    CHECK_EQ_INT(a.size, 12); CHECK_EQ_INT(a.cap, 16); CHECK_EQ_INT(growths, 4); CHECK_EQ_INT(copies, 15);
    CHECK_EQ_INT(a.data[0], 5); CHECK_EQ_INT(a.data[11], 17);    /* content, not just counters */
    free(a.data);

    /* Scenario B: cap0=2, factor=2.0, shrink ON -- 12 appends then 9 removes */
    cap0 = 2; factor = 2.0; shrink_on = 1; copies = 0; growths = 0; shrinks = 0;
    DynArray b;
    b.cap = 2; b.size = 0;
    b.data = malloc(sizeof(int) * (size_t) b.cap);
    int vals[] = {3, 8, 15, 1, 22, 9, 30, 4, 17, 6, 25, 11};
    for (int i = 0; i < 12; i++) da_append(&b, vals[i]);
    CHECK_EQ_INT(b.size, 12); CHECK_EQ_INT(b.cap, 16); CHECK_EQ_INT(growths, 3); CHECK_EQ_INT(copies, 14);

    for (int i = 0; i < 7; i++) da_remove_last(&b);   /* size 12 -> 5: 5 > cap/4=4, no shrink yet */
    CHECK_EQ_INT(b.size, 5); CHECK_EQ_INT(b.cap, 16); CHECK_EQ_INT(shrinks, 0);

    da_remove_last(&b);      /* size 5 -> 4: 4 <= 16/4=4 and 16/2=8 >= cap0(2): shrink to 8, copies 4 more */
    CHECK_EQ_INT(b.size, 4); CHECK_EQ_INT(b.cap, 8); CHECK_EQ_INT(shrinks, 1); CHECK_EQ_INT(copies, 18);

    da_remove_last(&b);      /* size 4 -> 3: 3 > cap/4=2, no further shrink */
    CHECK_EQ_INT(b.size, 3); CHECK_EQ_INT(b.cap, 8); CHECK_EQ_INT(shrinks, 1);
    free(b.data);

    /* Scenario C: da_remove_last on an EMPTY array must be a safe no-op */
    cap0 = 4; factor = 2.0; shrink_on = 1; copies = 0; growths = 0; shrinks = 0;
    DynArray c;
    c.cap = 4; c.size = 0;
    c.data = malloc(sizeof(int) * (size_t) c.cap);
    da_remove_last(&c);
    CHECK_EQ_INT(c.size, 0); CHECK_EQ_INT(c.cap, 4); CHECK_EQ_INT(shrinks, 0);
    free(c.data);

    /* Scenario D: growth factor 1.5 -- smaller, more frequent growths (integer truncation each time) */
    cap0 = 1; factor = 1.5; shrink_on = 0; copies = 0; growths = 0; shrinks = 0;
    DynArray d;
    d.cap = 1; d.size = 0;
    d.data = malloc(sizeof(int) * (size_t) d.cap);
    da_append(&d, 4);                       /* size0==cap1? no: 0!=1. size1,cap1 */
    CHECK_EQ_INT(d.cap, 1);
    da_append(&d, 9);                       /* size1==cap1: new_cap=(int)(1*1.5)=1 -> forced to cap+1=2 */
    CHECK_EQ_INT(d.cap, 2); CHECK_EQ_INT(growths, 1);
    da_append(&d, 15);                      /* size2==cap2: new_cap=(int)(2*1.5)=3 */
    CHECK_EQ_INT(d.cap, 3); CHECK_EQ_INT(growths, 2);
    free(d.data);

    TEST_SUMMARY();
}
