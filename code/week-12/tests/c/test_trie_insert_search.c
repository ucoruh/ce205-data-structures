/* Unit tests for week-12 c/trie_insert_search.c */
#define main program_main
#include "../../c/trie_insert_search.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    bool is_prefix;

    /* -- empty trie: everything is not found and not a prefix -- */
    TrieNode *root = new_node();
    CHECK(search(root, "A", &is_prefix) == false);
    CHECK(is_prefix == false);
    free_trie(root);

    /* -- single word round trip -- */
    root = new_node();
    insert(root, "CAT");
    CHECK(search(root, "CAT", &is_prefix) == true);
    CHECK(is_prefix == true);
    CHECK(search(root, "CA", &is_prefix) == false);   /* prefix of CAT, but not itself a word */
    CHECK(is_prefix == true);
    CHECK(search(root, "CATS", &is_prefix) == false); /* longer than any inserted word */
    CHECK(is_prefix == false);
    CHECK(search(root, "DOG", &is_prefix) == false);  /* no shared prefix at all */
    CHECK(is_prefix == false);
    free_trie(root);

    /* -- shared prefix: CAT, CAR, CARD -- */
    root = new_node();
    insert(root, "CAT");
    insert(root, "CAR");
    insert(root, "CARD");
    CHECK(search(root, "CAT", &is_prefix) == true);
    CHECK(search(root, "CAR", &is_prefix) == true);
    CHECK(search(root, "CARD", &is_prefix) == true);
    CHECK(search(root, "CARS", &is_prefix) == false);
    CHECK(is_prefix == false);   /* R has no child S */
    free_trie(root);

    /* -- a word that is itself a prefix of another, with a node isEnd AND a child -- */
    root = new_node();
    insert(root, "CAR");
    insert(root, "CARPET");
    CHECK(search(root, "CAR", &is_prefix) == true);      /* CAR is a full word ... */
    CHECK(search(root, "CARP", &is_prefix) == false);    /* ...but CARP is only a prefix */
    CHECK(is_prefix == true);
    CHECK(search(root, "CARPET", &is_prefix) == true);
    free_trie(root);

    /* -- duplicate insert is idempotent -- */
    root = new_node();
    insert(root, "DATA");
    insert(root, "DATA");
    CHECK(search(root, "DATA", &is_prefix) == true);
    free_trie(root);

    /* -- a branchless chain: A, AB, ABC, ABCD, every prefix is itself a word -- */
    root = new_node();
    insert(root, "A");
    insert(root, "AB");
    insert(root, "ABC");
    insert(root, "ABCD");
    CHECK(search(root, "A", &is_prefix) == true);
    CHECK(search(root, "AB", &is_prefix) == true);
    CHECK(search(root, "ABC", &is_prefix) == true);
    CHECK(search(root, "ABCD", &is_prefix) == true);
    CHECK(search(root, "ABCDE", &is_prefix) == false);
    CHECK(is_prefix == false);
    free_trie(root);

    /* -- no shared prefix at all: every word branches immediately from the root -- */
    root = new_node();
    insert(root, "AB");
    insert(root, "CD");
    insert(root, "EF");
    CHECK(search(root, "AB", &is_prefix) == true);
    CHECK(search(root, "CD", &is_prefix) == true);
    CHECK(search(root, "XY", &is_prefix) == false);
    CHECK(is_prefix == false);
    free_trie(root);

    /* -- empty word: the empty string is a valid (if unusual) trie entry -- */
    root = new_node();
    CHECK(search(root, "", &is_prefix) == false);   /* not inserted yet */
    CHECK(is_prefix == true);                          /* "" is trivially a prefix of everything */
    insert(root, "");
    CHECK(search(root, "", &is_prefix) == true);
    CHECK(is_prefix == true);
    CHECK(search(root, "A", &is_prefix) == false);      /* "" being a word doesn't make "A" one */
    free_trie(root);

    /* -- all-equal characters: a chain of the same letter -- */
    root = new_node();
    insert(root, "AAAA");
    CHECK(search(root, "AAAA", &is_prefix) == true);
    CHECK(search(root, "AAA", &is_prefix) == false);
    CHECK(is_prefix == true);
    CHECK(search(root, "AAAAA", &is_prefix) == false);
    CHECK(is_prefix == false);
    free_trie(root);

    /* -- integration: run_scenario drives the real insert/search path -- */
    const char *const w[] = {"CAT", "CAR"};
    const char *const q[] = {"CAT"};
    run_scenario("unit-test integration", w, 2, q, 1);

    TEST_SUMMARY();
}
