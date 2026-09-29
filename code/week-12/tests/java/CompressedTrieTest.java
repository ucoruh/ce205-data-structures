/* Unit tests for week-12 java/CompressedTrie.java */
public class CompressedTrieTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }

    public static void main(String[] args) {
        boolean[] isPrefix = new boolean[1];

        // -- empty radix trie --
        CompressedTrie.RNode root = new CompressedTrie.RNode("", false);
        check(!CompressedTrie.search(root, "A", isPrefix), "empty: not found");
        check(!isPrefix[0], "empty: not a prefix");

        // -- single word: becomes one leaf edge holding the whole word --
        root = new CompressedTrie.RNode("", false);
        CompressedTrie.insert(root, "TEST");
        check(CompressedTrie.search(root, "TEST", isPrefix), "TEST found");
        check(root.child.get('T').label.equals("TEST"), "TEST is one whole edge");

        // -- a split: TEST then TEA share "TE" --
        root = new CompressedTrie.RNode("", false);
        CompressedTrie.insert(root, "TEST");
        CompressedTrie.insert(root, "TEA");
        CompressedTrie.RNode mid = root.child.get('T');
        check(mid.label.equals("TE"), "shared prefix TE became its own node");
        check(!mid.isEnd, "TE node itself is not a full word");
        check(CompressedTrie.search(root, "TEST", isPrefix), "TEST found after split");
        check(CompressedTrie.search(root, "TEA", isPrefix), "TEA found after split");
        check(!CompressedTrie.search(root, "TE", isPrefix), "TE alone not a full word");
        check(isPrefix[0], "TE is a prefix");

        // -- a word ending exactly at a split point --
        root = new CompressedTrie.RNode("", false);
        CompressedTrie.insert(root, "TEST");
        CompressedTrie.insert(root, "TE");
        mid = root.child.get('T');
        check(mid.label.equals("TE"), "split label TE");
        check(mid.isEnd, "TE becomes isEnd");
        check(CompressedTrie.search(root, "TE", isPrefix), "TE found");
        check(CompressedTrie.search(root, "TEST", isPrefix), "TEST still found");

        // -- CAR is itself a prefix of CARPET --
        root = new CompressedTrie.RNode("", false);
        CompressedTrie.insert(root, "CAR");
        CompressedTrie.insert(root, "CARPET");
        CompressedTrie.RNode car = root.child.get('C');
        check(car.label.equals("CAR"), "CAR edge label");
        check(car.isEnd, "CAR is a full word");
        check(car.child.containsKey('P'), "CAR node has a child for PET");
        check(CompressedTrie.search(root, "CAR", isPrefix), "CAR found");
        check(!CompressedTrie.search(root, "CARP", isPrefix), "CARP not a full word");
        check(isPrefix[0], "CARP is a prefix");
        check(CompressedTrie.search(root, "CARPET", isPrefix), "CARPET found");

        // -- nested split: ANT, ARM, ART --
        root = new CompressedTrie.RNode("", false);
        CompressedTrie.insert(root, "ANT");
        CompressedTrie.insert(root, "ARM");
        CompressedTrie.insert(root, "ART");
        CompressedTrie.RNode a = root.child.get('A');
        check(a.label.equals("A"), "outer split label A");
        check(CompressedTrie.search(root, "ANT", isPrefix), "ANT found");
        check(CompressedTrie.search(root, "ARM", isPrefix), "ARM found");
        check(CompressedTrie.search(root, "ART", isPrefix), "ART found");
        check(!CompressedTrie.search(root, "AR", isPrefix), "AR not a full word");
        check(isPrefix[0], "AR is a prefix");
        check(!CompressedTrie.search(root, "ARK", isPrefix), "ARK not found");
        check(!isPrefix[0], "ARK not a prefix");

        // -- no shared prefix at all --
        root = new CompressedTrie.RNode("", false);
        CompressedTrie.insert(root, "APPLE");
        CompressedTrie.insert(root, "BANANA");
        check(root.child.get('A').label.equals("APPLE"), "APPLE is one whole edge");
        check(root.child.get('B').label.equals("BANANA"), "BANANA is one whole edge");

        // -- not found, and not even a prefix --
        root = new CompressedTrie.RNode("", false);
        CompressedTrie.insert(root, "TEST");
        check(!CompressedTrie.search(root, "ZEBRA", isPrefix), "ZEBRA not found");
        check(!isPrefix[0], "ZEBRA not a prefix");

        // -- empty word: the empty string is a valid (if unusual) trie entry --
        root = new CompressedTrie.RNode("", false);
        check(!CompressedTrie.search(root, "", isPrefix), "empty word: not inserted yet");
        check(isPrefix[0], "empty word: \"\" is trivially a prefix of everything");
        CompressedTrie.insert(root, "");
        check(CompressedTrie.search(root, "", isPrefix), "empty word: found after insert");
        check(!CompressedTrie.search(root, "A", isPrefix), "empty word being a word doesn't make A one");

        // -- all-equal characters: a single leaf edge holding a run of the same letter --
        root = new CompressedTrie.RNode("", false);
        CompressedTrie.insert(root, "AAAA");
        check(CompressedTrie.search(root, "AAAA", isPrefix), "AAAA found");
        check(root.child.get('A').label.equals("AAAA"), "AAAA is one whole edge");
        check(!CompressedTrie.search(root, "AAA", isPrefix), "AAA not a full word");
        check(isPrefix[0], "AAA is a prefix");

        // -- non-ASCII: the HashMap-based Java radix trie has no fixed alphabet, unlike the C array version --
        root = new CompressedTrie.RNode("", false);
        CompressedTrie.insert(root, "café");
        check(CompressedTrie.search(root, "café", isPrefix), "non-ASCII word found");
        check(!CompressedTrie.search(root, "caf", isPrefix), "non-ASCII: caf alone not a full word");
        check(isPrefix[0], "non-ASCII: caf is a prefix");

        // -- integration: runScenario drives the real insert/search path --
        CompressedTrie.runScenario("unit-test integration", new String[]{"TEST", "TEA"}, new String[]{"TEA"});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
