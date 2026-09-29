/* Unit tests for week-12 c/compressed_trie.c */
#define main program_main
#include "../../c/compressed_trie.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    bool is_prefix;

    /* -- empty radix trie -- */
    RNode *root = new_node("", 0, false);
    CHECK(search(root, "A", &is_prefix) == false);
    CHECK(is_prefix == false);
    free_radix(root);

    /* -- single word: becomes one leaf edge holding the whole word -- */
    root = new_node("", 0, false);
    insert(root, "TEST");
    CHECK(search(root, "TEST", &is_prefix) == true);
    CHECK(strcmp(root->child['T' - 'A']->label, "TEST") == 0);
    free_radix(root);

    /* -- a split: TEST then TEA share "TE", diverge at 'S' vs 'A' -- */
    root = new_node("", 0, false);
    insert(root, "TEST");
    insert(root, "TEA");
    RNode *mid = root->child['T' - 'A'];
    CHECK(strcmp(mid->label, "TE") == 0);      /* the shared prefix became its own node */
    CHECK(mid->is_end == false);
    CHECK(search(root, "TEST", &is_prefix) == true);
    CHECK(search(root, "TEA", &is_prefix) == true);
    CHECK(search(root, "TE", &is_prefix) == false);
    CHECK(is_prefix == true);
    free_radix(root);

    /* -- a word ending exactly at a split point: mid becomes isEnd -- */
    root = new_node("", 0, false);
    insert(root, "TEST");
    insert(root, "TE");
    mid = root->child['T' - 'A'];
    CHECK(strcmp(mid->label, "TE") == 0);
    CHECK(mid->is_end == true);
    CHECK(search(root, "TE", &is_prefix) == true);
    CHECK(search(root, "TEST", &is_prefix) == true);
    free_radix(root);

    /* -- CAR is itself a prefix of CARPET: CAR's node has isEnd AND a child -- */
    root = new_node("", 0, false);
    insert(root, "CAR");
    insert(root, "CARPET");
    RNode *car = root->child['C' - 'A'];
    CHECK(strcmp(car->label, "CAR") == 0);
    CHECK(car->is_end == true);
    CHECK(car->child['P' - 'A'] != NULL);
    CHECK(search(root, "CAR", &is_prefix) == true);
    CHECK(search(root, "CARP", &is_prefix) == false);
    CHECK(is_prefix == true);        /* CARP ends inside the "PET" edge label */
    CHECK(search(root, "CARPET", &is_prefix) == true);
    free_radix(root);

    /* -- nested split: ANT, ARM share "A", then ARM/ART share "AR" too -- */
    root = new_node("", 0, false);
    insert(root, "ANT");
    insert(root, "ARM");
    insert(root, "ART");
    RNode *a = root->child['A' - 'A'];
    CHECK(strcmp(a->label, "A") == 0);
    CHECK(search(root, "ANT", &is_prefix) == true);
    CHECK(search(root, "ARM", &is_prefix) == true);
    CHECK(search(root, "ART", &is_prefix) == true);
    CHECK(search(root, "AR", &is_prefix) == false);
    CHECK(is_prefix == true);
    CHECK(search(root, "ARK", &is_prefix) == false);
    CHECK(is_prefix == false);       /* diverges from "M"/"T" at the first letter */
    free_radix(root);

    /* -- no shared prefix at all: two independent leaf edges from the root -- */
    root = new_node("", 0, false);
    insert(root, "APPLE");
    insert(root, "BANANA");
    CHECK(strcmp(root->child['A' - 'A']->label, "APPLE") == 0);
    CHECK(strcmp(root->child['B' - 'A']->label, "BANANA") == 0);
    CHECK(search(root, "APPLE", &is_prefix) == true);
    CHECK(search(root, "BANANA", &is_prefix) == true);
    free_radix(root);

    /* -- not found, and not even a prefix: first letter has no edge -- */
    root = new_node("", 0, false);
    insert(root, "TEST");
    CHECK(search(root, "ZEBRA", &is_prefix) == false);
    CHECK(is_prefix == false);
    free_radix(root);

    /* -- empty word: the empty string is a valid (if unusual) trie entry -- */
    root = new_node("", 0, false);
    CHECK(search(root, "", &is_prefix) == false);   /* not inserted yet */
    CHECK(is_prefix == true);                          /* "" is trivially a prefix of everything */
    insert(root, "");
    CHECK(search(root, "", &is_prefix) == true);
    CHECK(search(root, "A", &is_prefix) == false);      /* "" being a word doesn't make "A" one */
    free_radix(root);

    /* -- all-equal characters: a single leaf edge holding a run of the same letter -- */
    root = new_node("", 0, false);
    insert(root, "AAAA");
    CHECK(search(root, "AAAA", &is_prefix) == true);
    CHECK(strcmp(root->child['A' - 'A']->label, "AAAA") == 0);
    CHECK(search(root, "AAA", &is_prefix) == false);
    CHECK(is_prefix == true);
    free_radix(root);

    /* -- integration: run_scenario drives the real insert/search path -- */
    const char *const w[] = {"TEST", "TEA"};
    const char *const q[] = {"TEA"};
    run_scenario("unit-test integration", w, 2, q, 1);

    TEST_SUMMARY();
}
