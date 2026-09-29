/* Week 12 -- Strings: Structures and Algorithms
 * Trie (prefix tree): insert and search, one edge per character, a HashMap of children per node.
 * CEN207 Data Structures (formerly CE205)
 */
import java.util.HashMap;
import java.util.Map;

public class TrieInsertSearch {
    static class TrieNode {
        Map<Character, TrieNode> child = new HashMap<>();
        boolean isEnd = false;
    }

    static void insert(TrieNode root, String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            if (!cur.child.containsKey(c))
                cur.child.put(c, new TrieNode());
            cur = cur.child.get(c);
        }
        cur.isEnd = true;
    }

    static boolean search(TrieNode root, String word, boolean[] isPrefix) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            if (!cur.child.containsKey(c)) {
                isPrefix[0] = false;
                return false;
            }
            cur = cur.child.get(c);
        }
        isPrefix[0] = true;
        return cur.isEnd;
    }

    static void runScenario(String label, String[] words, String[] queries) {
        System.out.println("-- " + label + " --");
        TrieNode root = new TrieNode();
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
        runScenario("normal: CAT, CAR, CARD, DOG; search CAR/CARS/DO",
                new String[]{"CAT", "CAR", "CARD", "DOG"}, new String[]{"CAR", "CARS", "DO"});

        runScenario("hard: the TRIE word family, 5 searches",
                new String[]{"TRIE", "TRIED", "TRIES", "TRY", "TRUE", "TRUCK"},
                new String[]{"TRIE", "TR", "TRUCKS", "TRY", "TRUST"});

        runScenario("edge: no shared prefix, every word branches from the root",
                new String[]{"AB", "CD", "EF", "GH", "IJ"}, new String[]{"AB", "XY", "A"});

        runScenario("edge: duplicate insert of DATA (idempotent)",
                new String[]{"DATA", "DATA", "STRUCTURE"}, new String[]{"DATA", "DAT", "STRUCTURES"});

        runScenario("edge: a branchless chain A, AB, ABC, ABCD",
                new String[]{"A", "AB", "ABC", "ABCD"}, new String[]{"A", "ABCD", "ABCDE"});
    }
}
