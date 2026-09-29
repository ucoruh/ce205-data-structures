#define main program_main
#include "../../c/isam.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* find_group */
    int l1_empty[1] = {0};
    CHECK_EQ_INT(find_group(l1_empty, 0, 50), 0);
    int l1[3] = {5, 30, 70};
    CHECK_EQ_INT(find_group(l1, 3, 4), 0);   /* below the first group */
    CHECK_EQ_INT(l1[0], 5);
    CHECK_EQ_INT(find_group(l1, 3, 5), 0);
    CHECK_EQ_INT(find_group(l1, 3, 29), 0);
    CHECK_EQ_INT(find_group(l1, 3, 30), 1);
    CHECK_EQ_INT(find_group(l1, 3, 999), 2);

    /* find_page */
    int l2[4] = {5, 15, 30, 45};
    CHECK_EQ_INT(find_page(l2, 0, 1, 10), 0);
    CHECK_EQ_INT(find_page(l2, 0, 1, 20), 1);
    CHECK_EQ_INT(find_page(l2, 2, 3, 40), 2);
    CHECK_EQ_INT(find_page(l2, 2, 3, 999), 3);

    /* isam_insert: direct insert into a page with room */
    Page pages[2];
    pages[0].keys[0] = 10; pages[0].keys[1] = 20; pages[0].len = 2;
    pages[0].overflow_head = NULL; pages[0].overflow_tail = NULL;
    pages[1].keys[0] = 40; pages[1].keys[1] = 50; pages[1].len = 2;
    pages[1].overflow_head = NULL; pages[1].overflow_tail = NULL;
    int idx1[1] = {10};
    isam_insert(pages, 2, 4, idx1, 1, 2, 15);
    CHECK_EQ_INT(pages[0].len, 3);
    CHECK_EQ_INT(pages[0].keys[0], 10);
    CHECK_EQ_INT(pages[0].keys[1], 15); /* inserted in sorted position */
    CHECK_EQ_INT(pages[0].keys[2], 20);
    CHECK(pages[0].overflow_head == NULL);

    /* isam_insert: page now has 3/4, one more direct insert fills it exactly */
    isam_insert(pages, 2, 4, idx1, 1, 2, 25);
    CHECK_EQ_INT(pages[0].len, 4);
    CHECK(pages[0].overflow_head == NULL);

    /* isam_insert: page is now full (4/4): the next insert overflows */
    isam_insert(pages, 2, 4, idx1, 1, 2, 12);
    CHECK_EQ_INT(pages[0].len, 4); /* unchanged: went to overflow instead */
    CHECK(pages[0].overflow_head != NULL);
    CHECK_EQ_INT(pages[0].overflow_head->key, 12);
    CHECK(pages[0].overflow_head == pages[0].overflow_tail);

    /* isam_insert: a second overflow on the same page chains after the first */
    isam_insert(pages, 2, 4, idx1, 1, 2, 13);
    CHECK(pages[0].overflow_head->next == pages[0].overflow_tail);
    CHECK_EQ_INT(pages[0].overflow_tail->key, 13);

    /* isam_insert into the second page is independent of the first */
    isam_insert(pages, 2, 4, idx1, 1, 2, 45);
    CHECK_EQ_INT(pages[1].len, 3);
    CHECK(pages[1].overflow_head == NULL);

    free_overflow(pages, 2);
    TEST_SUMMARY();
}
