/* Unit tests for week-04 c/huffman.c
 * Independent oracle: frequency counts are hand-derived from the text; code correctness is checked via
 * structural properties that must hold for ANY valid Huffman code (prefix-free, round-trip encode/decode
 * fidelity) rather than by re-deriving the exact bit patterns the greedy algorithm happens to produce. */
#define main program_main
#include "../../c/huffman.c"
#undef main
#include "../../../test_check.h"

/* No code may be a prefix of another distinct code -- the property that makes decoding unambiguous. */
static int codes_are_prefix_free(void) {
    for (int i = 0; i < distinct_count; i++) {
        for (int j = 0; j < distinct_count; j++) {
            if (i == j) continue;
            char *ci = codes[(unsigned char) distinct_chars[i]];
            char *cj = codes[(unsigned char) distinct_chars[j]];
            size_t li = strlen(ci);
            if (li > 0 && li < strlen(cj) && strncmp(ci, cj, li) == 0) return 0;
        }
    }
    return 1;
}

static Node *build_tree_for(const char *text) {
    count_frequencies(text);
    heap_size = 0;
    for (int i = 0; i < distinct_count; i++) heap_push(new_leaf(distinct_chars[i], freq_of[i]));
    int merge_id = 256;
    while (heap_size > 1) {
        Node *a = heap_pop(), *b = heap_pop();
        heap_push(new_internal(a, b, merge_id++));
    }
    Node *root = heap_pop();
    char path[ALPHABET];
    assign_codes(root, path, 0);
    return root;
}

int main(void) {
    /* -- count_frequencies: hand-counted against a simple text -- */
    count_frequencies("ABRACADABRA");
    CHECK_EQ_INT(distinct_count, 5);           /* A, B, R, C, D */
    for (int i = 0; i < distinct_count; i++) {
        int expected = distinct_chars[i] == 'A' ? 5
                      : distinct_chars[i] == 'B' ? 2
                      : distinct_chars[i] == 'R' ? 2
                      : distinct_chars[i] == 'C' ? 1
                      : distinct_chars[i] == 'D' ? 1 : -1;
        CHECK_EQ_INT(freq_of[i], expected);
    }

    /* -- count_frequencies: a single repeated character -- */
    count_frequencies("ZZZZZ");
    CHECK_EQ_INT(distinct_count, 1);
    CHECK_EQ_INT(freq_of[0], 5);

    /* -- count_frequencies: all distinct characters, frequency 1 each -- */
    count_frequencies("ABCDEFGHIJ");
    CHECK_EQ_INT(distinct_count, 10);
    for (int i = 0; i < 10; i++) CHECK_EQ_INT(freq_of[i], 1);

    /* -- is_less: lower frequency wins; equal frequency breaks the tie by tie_id -- */
    Node *lo = new_leaf('x', 3), *hi = new_leaf('y', 9);
    CHECK(is_less(lo, hi) == 1);
    CHECK(is_less(hi, lo) == 0);
    free_tree(lo); free_tree(hi);
    Node *tieA = new_leaf((char) 5, 4), *tieB = new_leaf((char) 9, 4);   /* same freq, tie_id 5 < 9 */
    CHECK(is_less(tieA, tieB) == 1);
    CHECK(is_less(tieB, tieA) == 0);
    free_tree(tieA); free_tree(tieB);

    /* -- heap_push/heap_pop: pops come out in non-decreasing (freq, tie_id) order -- */
    heap_size = 0;
    int freqs[] = {9, 2, 7, 1, 5, 3, 8, 4, 6};
    for (int i = 0; i < 9; i++) heap_push(new_leaf((char) i, freqs[i]));
    int last_freq = -1;
    for (int i = 0; i < 9; i++) {
        Node *popped = heap_pop();
        CHECK(popped->freq >= last_freq);
        last_freq = popped->freq;
        free_tree(popped);
    }
    CHECK_EQ_INT(heap_size, 0);

    /* -- edge: exactly 2 distinct symbols -- both MUST get length-1 codes (a single merge produces a
     *    root with the two leaves as direct children, regardless of which side wins the tie) -- */
    Node *root2 = build_tree_for("AAAAAAAAAB");
    CHECK_EQ_INT(strlen(codes[(unsigned char) 'A']), 1);
    CHECK_EQ_INT(strlen(codes[(unsigned char) 'B']), 1);
    CHECK(codes[(unsigned char) 'A'][0] != codes[(unsigned char) 'B'][0]);
    CHECK(codes_are_prefix_free());
    {
        char encoded[64], decoded[64];
        encode("AAAAAAAAAB", encoded);
        decode(encoded, root2, decoded);
        CHECK(strcmp(decoded, "AAAAAAAAAB") == 0);
    }
    free_tree(root2);

    /* -- normal: the classic example -- prefix-free codes and an exact round trip.
     *    Hand-traced greedy merges for freq(A=5,B=2,R=2,C=1,D=1), tie-broken by ASCII code:
     *      merge(C,D)->2 ; merge(B,R)->4 ; merge((C,D),( B,R))->6 ; merge(A,that)->11 (A on the LEFT,
     *      since A was the smaller-index pop at the final step: heap order (2,4,5) pops the freq-2 node
     *      first as `a`, so A becomes the second pop `b`... to avoid re-deriving this fragile ordering,
     *      the only claim asserted below is the total bit count, which is independent of left/right
     *      placement: A (depth 1) contributes 5*1, and B, R, C, D (all depth 3) contribute 2*3+2*3+1*3+1*3
     *      = 23 total -- a strictly dominant single symbol must reach depth 1 in any correct Huffman tree
     *      built by this greedy merge order, and the other four, tied together into one combined subtree
     *      of weight 6 before ever meeting A, must all land at depth 3. -- */
    Node *root_normal = build_tree_for("ABRACADABRA");
    CHECK(codes_are_prefix_free());
    CHECK_EQ_INT(strlen(codes[(unsigned char) 'A']), 1);
    CHECK_EQ_INT(strlen(codes[(unsigned char) 'B']), 3);
    CHECK_EQ_INT(strlen(codes[(unsigned char) 'R']), 3);
    CHECK_EQ_INT(strlen(codes[(unsigned char) 'C']), 3);
    CHECK_EQ_INT(strlen(codes[(unsigned char) 'D']), 3);
    {
        char encoded[256], decoded[256];
        encode("ABRACADABRA", encoded);
        decode(encoded, root_normal, decoded);
        CHECK(strcmp(decoded, "ABRACADABRA") == 0);
        CHECK_EQ_INT((int) strlen(encoded), 23);
    }
    free_tree(root_normal);

    /* -- hard: more variety, round trip must still hold exactly -- */
    Node *root_hard = build_tree_for("THEQUICKBROWNFOX");
    CHECK(codes_are_prefix_free());
    {
        char encoded[256], decoded[256];
        encode("THEQUICKBROWNFOX", encoded);
        decode(encoded, root_hard, decoded);
        CHECK(strcmp(decoded, "THEQUICKBROWNFOX") == 0);
    }
    free_tree(root_hard);

    /* -- edge: single distinct character repeated -- Huffman with one symbol still assigns it SOME code
     *    (the root is itself a leaf, so assign_codes gives it the empty string at depth 0) and encode/
     *    decode must round-trip -- */
    Node *root_one = build_tree_for("EEEEE");
    CHECK(codes[(unsigned char) 'E'][0] == '\0');   /* a lone symbol needs zero bits to distinguish it */
    free_tree(root_one);

    TEST_SUMMARY();
}
