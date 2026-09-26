/* Week 4 -- Trees, Heaps, and Huffman Coding
 * Huffman coding: count frequencies, build the tree with a min-heap of
 * trees (repeatedly merging the two lowest-frequency roots), assign a
 * 0/1 code to every leaf, then encode and decode.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class Huffman {
    static class Node {
        char ch;
        int freq;
        int tieId;               // leaf: char code of ch; internal: 256 + merge order
        Node left, right;
    }

    static Node newLeaf(char ch, int freq) {
        Node n = new Node();
        n.ch = ch;
        n.freq = freq;
        n.tieId = ch;
        return n;
    }

    static Node newInternal(Node a, Node b, int tieId) {
        Node n = new Node();
        n.ch = '\0';
        n.freq = a.freq + b.freq;
        n.tieId = tieId;
        n.left = a;
        n.right = b;
        return n;
    }

    // ordering key: smaller frequency first; ties broken by a stable tieId
    static boolean isLess(Node a, Node b) {
        if (a.freq != b.freq) return a.freq < b.freq;
        return a.tieId < b.tieId;
    }

    // --- array-based min-heap of Node, own sift-up/sift-down ---
    static final int HEAP_CAP = 32;
    static Node[] heap = new Node[HEAP_CAP];
    static int heapSize = 0;

    static void heapPush(Node node) {
        heap[heapSize] = node;
        int i = heapSize;
        heapSize++;

        while (i > 0) {
            int parent = (i - 1) / 2;
            if (!isLess(heap[i], heap[parent]))
                break;
            Node tmp = heap[parent];
            heap[parent] = heap[i];
            heap[i] = tmp;
            i = parent;
        }
    }

    static Node heapPop() {
        Node top = heap[0];
        heapSize--;
        heap[0] = heap[heapSize];

        int i = 0;
        while (true) {
            int left = 2 * i + 1;
            int right = 2 * i + 2;
            int smallest = i;

            if (left < heapSize && isLess(heap[left], heap[smallest]))
                smallest = left;
            if (right < heapSize && isLess(heap[right], heap[smallest]))
                smallest = right;
            if (smallest == i)
                break;

            Node tmp = heap[i];
            heap[i] = heap[smallest];
            heap[smallest] = tmp;
            i = smallest;
        }

        return top;
    }

    // --- frequency counting ---
    static char[] distinctChars = new char[256];
    static int[] freqOf = new int[256];
    static int distinctCount = 0;

    static void countFrequencies(String text) {
        java.util.HashMap<Character, Integer> indexOf = new java.util.HashMap<>();
        distinctCount = 0;
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            Integer idx = indexOf.get(c);
            if (idx == null) {
                idx = distinctCount;
                indexOf.put(c, idx);
                distinctChars[distinctCount] = c;
                freqOf[distinctCount] = 0;
                distinctCount++;
            }
            freqOf[idx]++;
        }
    }

    // --- code table, built by walking the tree ---
    static String[] codes = new String[256];

    // assign a 0/1 code to every leaf by walking the tree
    static void assignCodes(Node node, StringBuilder path) {
        if (node.left == null && node.right == null) {
            codes[node.ch] = path.toString();
            return;
        }
        path.append('0'); assignCodes(node.left, path); path.deleteCharAt(path.length() - 1);
        path.append('1'); assignCodes(node.right, path); path.deleteCharAt(path.length() - 1);
    }

    // encode: concatenate each character's code
    static String encode(String text) {
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < text.length(); i++)
            out.append(codes[text.charAt(i)]);
        return out.toString();
    }

    // decode: walk the tree one bit at a time; a leaf emits a character and restarts at the root
    static String decode(String bits, Node root) {
        StringBuilder out = new StringBuilder();
        Node node = root;
        for (int i = 0; i < bits.length(); i++) {
            node = bits.charAt(i) == '0' ? node.left : node.right;
            if (node.left == null && node.right == null) {
                out.append(node.ch);
                node = root;
            }
        }
        return out.toString();
    }

    static void runScenario(String label, String text) {
        System.out.println("-- " + label + " --");
        System.out.println("text: \"" + text + "\" (" + text.length() + " characters)");

        countFrequencies(text);
        StringBuilder freqLine = new StringBuilder("frequency table:");
        for (int i = 0; i < distinctCount; i++)
            freqLine.append(' ').append(distinctChars[i]).append(':').append(freqOf[i]);
        System.out.println(freqLine);

        heapSize = 0;
        for (int i = 0; i < distinctCount; i++)
            heapPush(newLeaf(distinctChars[i], freqOf[i]));

        // repeatedly merge the two lowest-priority roots until one remains
        int mergeId = 256;
        while (heapSize > 1) {
            Node a = heapPop();          // smallest
            Node b = heapPop();          // second smallest
            Node parent = newInternal(a, b, mergeId++);
            heapPush(parent);
        }
        Node root = heapPop();           // the Huffman tree

        assignCodes(root, new StringBuilder());

        StringBuilder codeLine = new StringBuilder("codes:");
        for (int i = 0; i < distinctCount; i++)
            codeLine.append(' ').append(distinctChars[i]).append('=').append(codes[distinctChars[i]]);
        System.out.println(codeLine);

        String encoded = encode(text);
        int plainBits = text.length() * 8;
        System.out.println("encoded (" + encoded.length() + " bits): " + encoded);
        System.out.println("plain ASCII would need " + text.length() + " * 8 = " + plainBits + " bits");

        String decoded = decode(encoded, root);
        System.out.println("decoded: \"" + decoded + "\" -- " +
                            (decoded.equals(text) ? "matches the original" : "DOES NOT MATCH (bug!)"));
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: the classic example, 11 characters
        runScenario("normal: the classic example", "ABRACADABRA");

        // hard: more variety, 16 characters
        runScenario("hard: more variety", "THEQUICKBROWNFOX");

        // edge: only 2 distinct symbols, very skewed frequencies (9 A's, 1 B)
        runScenario("edge: only 2 symbols, very skewed (9 A's, 1 B)", "AAAAAAAAAB");
    }
}
