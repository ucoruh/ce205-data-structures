/* Week 12 -- Strings: Structures and Algorithms
 * Compressed trie (radix tree): each edge carries a whole substring; a new word either extends an existing
 * edge, becomes a brand-new leaf edge, or SPLITS an existing edge at the point where it first diverges.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
import java.util.HashMap;
import java.util.Map;

public class CompressedTrie {
    static class RNode {
        String label;                            // edge INTO this node; root's label is ""
        boolean isEnd;
        Map<Character, RNode> child = new HashMap<>();
        RNode(String label, boolean isEnd) { this.label = label; this.isEnd = isEnd; }
    }

    static int commonPrefixLen(String a, String b) {
        int j = 0;
        while (j < a.length() && j < b.length() && a.charAt(j) == b.charAt(j)) j++;
        return j;
    }

    static void insert(RNode node, String word) {
        if (word.isEmpty()) { node.isEnd = true; return; }   // the empty word ends exactly at this node
        int i = 0;
        while (i < word.length()) {
            char c = word.charAt(i);
            if (!node.child.containsKey(c)) {
                node.child.put(c, new RNode(word.substring(i), true));   // whole remaining suffix
                return;
            }
            RNode child = node.child.get(c);
            int j = commonPrefixLen(word.substring(i), child.label);
            if (j == child.label.length()) {        // whole edge matches: descend
                node = child;
                i += j;
                if (i == word.length()) { node.isEnd = true; return; }
                continue;
            }
            // split: a new node holds the shared prefix; child keeps only its tail
            RNode mid = new RNode(child.label.substring(0, j), false);
            child.label = child.label.substring(j);
            mid.child.put(child.label.charAt(0), child);
            node.child.put(c, mid);
            if (i + j == word.length()) {
                mid.isEnd = true;                     // the inserted word ends exactly at the split point
                return;
            }
            mid.child.put(word.charAt(i + j), new RNode(word.substring(i + j), true));
            return;
        }
    }

    static boolean search(RNode root, String word, boolean[] isPrefix) {
        RNode node = root;
        int i = 0;
        while (i < word.length()) {
            char c = word.charAt(i);
            if (!node.child.containsKey(c)) {
                isPrefix[0] = false;
                return false;
            }
            RNode child = node.child.get(c);
            int j = commonPrefixLen(word.substring(i), child.label);
            if (j < child.label.length()) {
                isPrefix[0] = (i + j == word.length());
                return false;
            }
            node = child;
            i += j;
        }
        isPrefix[0] = true;
        return node.isEnd;
    }

    static void runScenario(String label, String[] words, String[] queries) {
        System.out.println("-- " + label + " --");
        RNode root = new RNode("", false);
        for (String w : words) {
            insert(root, w);
            System.out.println("insert(" + w + ")");
        }
        for (String q : queries) {
            boolean[] isPrefix = new boolean[1];
            boolean found = search(root, q, isPrefix);
            System.out.println("search(" + q + ") -> found=" + found + ", isPrefix=" + isPrefix[0]);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        runScenario("normal: TEST, TEA, TEAM -- one edge splits in two",
                new String[]{"TEST", "TEA", "TEAM"}, new String[]{"TEA", "TE", "TEAMS"});

        runScenario("hard: the ROMAN word family -- several splits back to back",
                new String[]{"ROMAN", "ROMANE", "ROMANUS", "ROMULUS"},
                new String[]{"ROMAN", "ROM", "ROMANEQ", "ROMULUS"});

        runScenario("edge: no shared prefix, every word is a single long edge",
                new String[]{"APPLE", "BANANA"}, new String[]{"APPLE", "AP"});

        runScenario("edge: CAR is a prefix of CARPET and CARD",
                new String[]{"CAR", "CARPET", "CARD"}, new String[]{"CAR", "CARP", "CARPET"});

        runScenario("edge: ANT, ARM, ART, AXE -- splits nested inside splits",
                new String[]{"ANT", "ARM", "ART", "AXE"}, new String[]{"ART", "AR", "ARK"});
    }
}
