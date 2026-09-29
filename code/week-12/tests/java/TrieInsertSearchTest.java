/* Unit tests for week-12 java/TrieInsertSearch.java */
public class TrieInsertSearchTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }

    public static void main(String[] args) {
        boolean[] isPrefix = new boolean[1];

        // -- empty trie --
        TrieInsertSearch.TrieNode root = new TrieInsertSearch.TrieNode();
        check(!TrieInsertSearch.search(root, "A", isPrefix), "empty: not found");
        check(!isPrefix[0], "empty: not a prefix");

        // -- single word round trip --
        root = new TrieInsertSearch.TrieNode();
        TrieInsertSearch.insert(root, "CAT");
        check(TrieInsertSearch.search(root, "CAT", isPrefix), "CAT found");
        check(isPrefix[0], "CAT is a prefix of itself");
        check(!TrieInsertSearch.search(root, "CA", isPrefix), "CA not a full word");
        check(isPrefix[0], "CA is a prefix");
        check(!TrieInsertSearch.search(root, "CATS", isPrefix), "CATS not found");
        check(!isPrefix[0], "CATS not a prefix");
        check(!TrieInsertSearch.search(root, "DOG", isPrefix), "DOG not found");
        check(!isPrefix[0], "DOG not a prefix");

        // -- shared prefix: CAT, CAR, CARD --
        root = new TrieInsertSearch.TrieNode();
        TrieInsertSearch.insert(root, "CAT");
        TrieInsertSearch.insert(root, "CAR");
        TrieInsertSearch.insert(root, "CARD");
        check(TrieInsertSearch.search(root, "CAT", isPrefix), "CAT found in shared trie");
        check(TrieInsertSearch.search(root, "CAR", isPrefix), "CAR found in shared trie");
        check(TrieInsertSearch.search(root, "CARD", isPrefix), "CARD found in shared trie");
        check(!TrieInsertSearch.search(root, "CARS", isPrefix), "CARS not found");
        check(!isPrefix[0], "CARS not a prefix (no child S)");

        // -- a word that is itself a prefix of another --
        root = new TrieInsertSearch.TrieNode();
        TrieInsertSearch.insert(root, "CAR");
        TrieInsertSearch.insert(root, "CARPET");
        check(TrieInsertSearch.search(root, "CAR", isPrefix), "CAR is a full word");
        check(!TrieInsertSearch.search(root, "CARP", isPrefix), "CARP is not a full word");
        check(isPrefix[0], "CARP is a prefix");
        check(TrieInsertSearch.search(root, "CARPET", isPrefix), "CARPET found");

        // -- duplicate insert is idempotent --
        root = new TrieInsertSearch.TrieNode();
        TrieInsertSearch.insert(root, "DATA");
        TrieInsertSearch.insert(root, "DATA");
        check(TrieInsertSearch.search(root, "DATA", isPrefix), "duplicate insert still found");

        // -- a branchless chain --
        root = new TrieInsertSearch.TrieNode();
        TrieInsertSearch.insert(root, "A");
        TrieInsertSearch.insert(root, "AB");
        TrieInsertSearch.insert(root, "ABC");
        TrieInsertSearch.insert(root, "ABCD");
        check(TrieInsertSearch.search(root, "A", isPrefix), "chain A");
        check(TrieInsertSearch.search(root, "AB", isPrefix), "chain AB");
        check(TrieInsertSearch.search(root, "ABC", isPrefix), "chain ABC");
        check(TrieInsertSearch.search(root, "ABCD", isPrefix), "chain ABCD");
        check(!TrieInsertSearch.search(root, "ABCDE", isPrefix), "chain ABCDE not found");
        check(!isPrefix[0], "chain ABCDE not a prefix");

        // -- no shared prefix at all --
        root = new TrieInsertSearch.TrieNode();
        TrieInsertSearch.insert(root, "AB");
        TrieInsertSearch.insert(root, "CD");
        TrieInsertSearch.insert(root, "EF");
        check(TrieInsertSearch.search(root, "AB", isPrefix), "AB found");
        check(TrieInsertSearch.search(root, "CD", isPrefix), "CD found");
        check(!TrieInsertSearch.search(root, "XY", isPrefix), "XY not found");
        check(!isPrefix[0], "XY not a prefix");

        // -- empty word: the empty string is a valid (if unusual) trie entry --
        root = new TrieInsertSearch.TrieNode();
        check(!TrieInsertSearch.search(root, "", isPrefix), "empty word: not inserted yet");
        check(isPrefix[0], "empty word: \"\" is trivially a prefix of everything");
        TrieInsertSearch.insert(root, "");
        check(TrieInsertSearch.search(root, "", isPrefix), "empty word: found after insert");
        check(!TrieInsertSearch.search(root, "A", isPrefix), "empty word being a word doesn't make A one");

        // -- all-equal characters: a chain of the same letter --
        root = new TrieInsertSearch.TrieNode();
        TrieInsertSearch.insert(root, "AAAA");
        check(TrieInsertSearch.search(root, "AAAA", isPrefix), "AAAA found");
        check(!TrieInsertSearch.search(root, "AAA", isPrefix), "AAA not a full word");
        check(isPrefix[0], "AAA is a prefix");
        check(!TrieInsertSearch.search(root, "AAAAA", isPrefix), "AAAAA not found");
        check(!isPrefix[0], "AAAAA not a prefix");

        // -- non-ASCII: the HashMap-based Java trie has no fixed alphabet, unlike the C array version --
        root = new TrieInsertSearch.TrieNode();
        TrieInsertSearch.insert(root, "café");
        check(TrieInsertSearch.search(root, "café", isPrefix), "non-ASCII word found");
        check(!TrieInsertSearch.search(root, "caf", isPrefix), "non-ASCII: caf alone not a full word");
        check(isPrefix[0], "non-ASCII: caf is a prefix");

        // -- integration: runScenario drives the real insert/search path --
        TrieInsertSearch.runScenario("unit-test integration", new String[]{"CAT", "CAR"}, new String[]{"CAT"});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
