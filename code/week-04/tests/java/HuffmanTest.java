/* Unit tests for week-04 java/Huffman.java, mirroring tests/c/test_huffman.c */
public class HuffmanTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static boolean codesArePrefixFree() {
        for (int i = 0; i < Huffman.distinctCount; i++) {
            for (int j = 0; j < Huffman.distinctCount; j++) {
                if (i == j) continue;
                String ci = Huffman.codes[Huffman.distinctChars[i]];
                String cj = Huffman.codes[Huffman.distinctChars[j]];
                if (ci.length() > 0 && ci.length() < cj.length() && cj.startsWith(ci)) return false;
            }
        }
        return true;
    }

    static Huffman.Node buildTreeFor(String text) {
        Huffman.countFrequencies(text);
        Huffman.heapSize = 0;
        for (int i = 0; i < Huffman.distinctCount; i++) Huffman.heapPush(Huffman.newLeaf(Huffman.distinctChars[i], Huffman.freqOf[i]));
        int mergeId = 256;
        while (Huffman.heapSize > 1) {
            Huffman.Node a = Huffman.heapPop(), b = Huffman.heapPop();
            Huffman.heapPush(Huffman.newInternal(a, b, mergeId++));
        }
        Huffman.Node root = Huffman.heapPop();
        Huffman.assignCodes(root, new StringBuilder());
        return root;
    }

    public static void main(String[] args) {
        // -- countFrequencies: hand-counted --
        Huffman.countFrequencies("ABRACADABRA");
        checkEq(Huffman.distinctCount, 5, "distinct count ABRACADABRA");
        for (int i = 0; i < Huffman.distinctCount; i++) {
            char c = Huffman.distinctChars[i];
            int expected = c == 'A' ? 5 : c == 'B' ? 2 : c == 'R' ? 2 : c == 'C' ? 1 : c == 'D' ? 1 : -1;
            checkEq(Huffman.freqOf[i], expected, "freq of " + c);
        }

        // -- countFrequencies: a single repeated character --
        Huffman.countFrequencies("ZZZZZ");
        checkEq(Huffman.distinctCount, 1, "distinct count ZZZZZ");
        checkEq(Huffman.freqOf[0], 5, "freq of Z");

        // -- countFrequencies: all distinct, frequency 1 each --
        Huffman.countFrequencies("ABCDEFGHIJ");
        checkEq(Huffman.distinctCount, 10, "distinct count ABCDEFGHIJ");
        for (int i = 0; i < 10; i++) checkEq(Huffman.freqOf[i], 1, "freq of distinct " + i);

        // -- isLess: lower frequency wins; equal frequency breaks the tie by tieId --
        Huffman.Node lo = Huffman.newLeaf('x', 3), hi = Huffman.newLeaf('y', 9);
        check(Huffman.isLess(lo, hi), "isLess lo<hi");
        check(!Huffman.isLess(hi, lo), "isLess hi>lo false");
        Huffman.Node tieA = Huffman.newLeaf((char) 5, 4), tieB = Huffman.newLeaf((char) 9, 4);
        check(Huffman.isLess(tieA, tieB), "isLess tie a<b");
        check(!Huffman.isLess(tieB, tieA), "isLess tie b<a false");

        // -- heapPush/heapPop: non-decreasing frequency order --
        Huffman.heapSize = 0;
        int[] freqs = {9, 2, 7, 1, 5, 3, 8, 4, 6};
        for (int i = 0; i < 9; i++) Huffman.heapPush(Huffman.newLeaf((char) i, freqs[i]));
        int lastFreq = -1;
        for (int i = 0; i < 9; i++) {
            Huffman.Node popped = Huffman.heapPop();
            check(popped.freq >= lastFreq, "heap pop order " + i);
            lastFreq = popped.freq;
        }
        checkEq(Huffman.heapSize, 0, "heap drained");

        // -- edge: exactly 2 distinct symbols -- both must get length-1 codes --
        Huffman.Node root2 = buildTreeFor("AAAAAAAAAB");
        checkEq(Huffman.codes['A'].length(), 1, "2-symbol A code length");
        checkEq(Huffman.codes['B'].length(), 1, "2-symbol B code length");
        check(!Huffman.codes['A'].equals(Huffman.codes['B']), "2-symbol codes differ");
        check(codesArePrefixFree(), "2-symbol prefix-free");
        {
            String encoded = Huffman.encode("AAAAAAAAAB");
            String decoded = Huffman.decode(encoded, root2);
            check(decoded.equals("AAAAAAAAAB"), "2-symbol round trip");
        }

        // -- normal: hand-traced code lengths (see test_huffman.c for the derivation) --
        Huffman.Node rootNormal = buildTreeFor("ABRACADABRA");
        check(codesArePrefixFree(), "normal prefix-free");
        checkEq(Huffman.codes['A'].length(), 1, "normal A length");
        checkEq(Huffman.codes['B'].length(), 3, "normal B length");
        checkEq(Huffman.codes['R'].length(), 3, "normal R length");
        checkEq(Huffman.codes['C'].length(), 3, "normal C length");
        checkEq(Huffman.codes['D'].length(), 3, "normal D length");
        {
            String encoded = Huffman.encode("ABRACADABRA");
            String decoded = Huffman.decode(encoded, rootNormal);
            check(decoded.equals("ABRACADABRA"), "normal round trip");
            checkEq(encoded.length(), 23, "normal encoded bit count");
        }

        // -- hard: more variety, round trip must hold --
        Huffman.Node rootHard = buildTreeFor("THEQUICKBROWNFOX");
        check(codesArePrefixFree(), "hard prefix-free");
        {
            String encoded = Huffman.encode("THEQUICKBROWNFOX");
            String decoded = Huffman.decode(encoded, rootHard);
            check(decoded.equals("THEQUICKBROWNFOX"), "hard round trip");
        }

        // -- edge: single distinct character repeated --
        Huffman.Node rootOne = buildTreeFor("EEEEE");
        checkEq(Huffman.codes['E'].length(), 0, "lone symbol needs zero bits");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
