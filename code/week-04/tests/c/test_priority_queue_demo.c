/* Unit tests for week-04 c/priority_queue_demo.c
 * Independent oracle: a separate plain "mirror" array of {id, key} pairs (added to on insert, removed
 * from on extract, edited on update_key) is scanned linearly for the true best -- never calls
 * peek()/extract()/better() to derive its own expectation. is_valid_heap() re-derives the parent/child
 * order rule from kind_is_max directly. */
#define main program_main
#include "../../c/priority_queue_demo.c"
#undef main
#include "../../../test_check.h"

#define MAXM 20
static int m_id[MAXM], m_key[MAXM], m_n;

static void m_reset(void) { m_n = 0; }
static void m_add(int id, int key) { m_id[m_n] = id; m_key[m_n] = key; m_n++; }
static void m_remove(int id) {
    for (int i = 0; i < m_n; i++) if (m_id[i] == id) { m_id[i] = m_id[m_n - 1]; m_key[i] = m_key[m_n - 1]; m_n--; return; }
}
static void m_update(int id, int new_key) {
    for (int i = 0; i < m_n; i++) if (m_id[i] == id) { m_key[i] = new_key; return; }
}
static int m_best_id(void) {
    int bi = 0;
    for (int i = 1; i < m_n; i++) if (kind_is_max ? m_key[i] > m_key[bi] : m_key[i] < m_key[bi]) bi = i;
    return m_id[bi];
}
static int m_best_key(void) {
    int bi = 0;
    for (int i = 1; i < m_n; i++) if (kind_is_max ? m_key[i] > m_key[bi] : m_key[i] < m_key[bi]) bi = i;
    return m_key[bi];
}
static int is_valid_heap(void) {
    for (int i = 1; i < size; i++) {
        int p = (i - 1) / 2;
        if (kind_is_max ? (heap[i].key > heap[p].key) : (heap[i].key < heap[p].key)) return 0;
    }
    return 1;
}

int main(void) {
    /* -- insert + peek: root is always the current best, size grows by one each time -- */
    size = 0; kind_is_max = false; m_reset();
    int values[] = {15, 7, 22, 3, 18, 9, 30, 1, 25, 12};
    for (int i = 0; i < 10; i++) {
        insert(i, values[i]);
        m_add(i, values[i]);
        CHECK_EQ_INT(size, i + 1);
        CHECK_EQ_INT(peek().key, m_best_key());
        CHECK_EQ_INT(peek().id, m_best_id());
        CHECK(is_valid_heap());
    }

    /* -- find_by_id: every inserted id is found at some valid index; a never-used id is not found -- */
    for (int id = 0; id < 10; id++) {
        int idx = find_by_id(id);
        CHECK(idx >= 0 && idx < size);
        CHECK_EQ_INT(heap[idx].id, id);
    }
    CHECK_EQ_INT(find_by_id(999), -1);

    /* -- extract: must return the mirror's current best (id AND key), and stay a valid heap -- */
    for (int k = 0; k < 5; k++) {
        int want_id = m_best_id(), want_key = m_best_key();
        Item got = extract();
        CHECK_EQ_INT(got.key, want_key);
        CHECK_EQ_INT(got.id, want_id);
        m_remove(want_id);
        CHECK_EQ_INT(size, 10 - k - 1);
        CHECK(is_valid_heap());
    }
    CHECK_EQ_INT(size, 5);

    /* -- an id that was already extracted is no longer found -- */
    /* (id 7, key 1, was the very first extracted since 1 is the global minimum) */
    CHECK_EQ_INT(find_by_id(7), -1);

    /* -- update_key: a decrease-key on a min-heap must move the item toward the root -- */
    /* remaining ids/keys before this block mirror m_id/m_key (5 items left) */
    {
        int target_id = m_id[0];               /* pick any surviving id */
        update_key(target_id, -999);
        m_update(target_id, -999);
        CHECK_EQ_INT(peek().id, target_id);     /* now the smallest possible key: must be the root */
        CHECK_EQ_INT(peek().key, -999);
        CHECK(is_valid_heap());
    }

    /* -- update_key: an increase-key that makes an item worse than its children must sift it down;
     *    the reported peek()/best must still match the mirror -- */
    {
        int victim_id = m_id[1 % m_n];
        update_key(victim_id, 100000);
        m_update(victim_id, 100000);
        CHECK_EQ_INT(peek().id, m_best_id());
        CHECK_EQ_INT(peek().key, m_best_key());
        CHECK(is_valid_heap());
    }

    /* -- update_key on an id that is not in the heap: must be a no-op (ignored), not a crash -- */
    Item before = heap[0];
    update_key(12345, -1);
    CHECK_EQ_INT(heap[0].id, before.id);
    CHECK_EQ_INT(heap[0].key, before.key);

    /* -- max-heap variant: fresh scenario, verify root is always the maximum inserted so far -- */
    size = 0; kind_is_max = true; m_reset();
    int max_values[] = {4, 19, 2, 40, 11, 27, 8, 33};
    for (int i = 0; i < 8; i++) {
        insert(i, max_values[i]);
        m_add(i, max_values[i]);
        CHECK_EQ_INT(peek().key, m_best_key());
    }
    CHECK(is_valid_heap());

    /* -- duplicates: several items with the same key must not break heap validity or extraction -- */
    size = 0; kind_is_max = false; m_reset();
    for (int i = 0; i < 6; i++) { insert(i, 7); m_add(i, 7); }
    CHECK(is_valid_heap());
    for (int i = 0; i < 6; i++) {
        Item got = extract();
        CHECK_EQ_INT(got.key, 7);
    }
    CHECK_EQ_INT(size, 0);

    TEST_SUMMARY();
}
