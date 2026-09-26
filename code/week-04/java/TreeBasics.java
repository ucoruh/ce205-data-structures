/* Week 4 -- Trees, Heaps, and Huffman Coding
 * Tree vocabulary on a GENERAL rooted tree (any number of children per
 * node): root, parent, child, sibling, leaf, internal node, edge, depth,
 * height, degree, subtree.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
import java.util.ArrayList;
import java.util.List;

public class TreeBasics {
    static final int MAX_NODES = 32;

    static class Node {
        String label;
        List<Node> children = new ArrayList<>();   // degree of this node = children.size()
        int depth;             // filled in by computeDepths()
        Node parent;            // convenience only -- not shown in the lecture code panel
        Node(String label) { this.label = label; }
    }

    static int height(Node n) {
        if (n.children.isEmpty())
            return 0;           // a leaf: height 0
        int best = -1;
        for (Node c : n.children) {
            int h = height(c);
            if (h > best) best = h;
        }
        return best + 1;        // 1 + tallest child
    }

    static void computeDepths(Node root) {
        Node[] queue = new Node[MAX_NODES];
        int front = 0, rear = 0;
        root.depth = 0;
        queue[rear++] = root;
        while (front < rear) {
            Node cur = queue[front++];
            for (Node ch : cur.children) {
                ch.depth = cur.depth + 1;
                queue[rear++] = ch;
            }
        }
    }

    // --- building a tree from a flat "LABEL:PARENT" list, exactly like the animation's input ---
    static class Spec {
        String label, parent;   // parent == null for the root
        Spec(String label, String parent) { this.label = label; this.parent = parent; }
    }

    static java.util.Map<String, Node> byLabel = new java.util.HashMap<>();

    static Node buildTree(Spec[] specs) {
        byLabel.clear();
        for (Spec s : specs) byLabel.put(s.label, new Node(s.label));
        Node root = null;
        for (Spec s : specs) {
            Node node = byLabel.get(s.label);
            if (s.parent == null) { root = node; continue; }
            Node parent = byLabel.get(s.parent);
            parent.children.add(node);
            node.parent = parent;
        }
        return root;
    }

    static int subtreeSize(Node node) {
        int total = 1;
        for (Node c : node.children) total += subtreeSize(c);
        return total;
    }

    static void collectLeaves(Node node, boolean internal, List<String> out) {
        if (node.children.isEmpty() == !internal) out.add(node.label);
        for (Node c : node.children) collectLeaves(c, internal, out);
    }

    static void printLabelList(String prefix, List<String> labels) {
        StringBuilder sb = new StringBuilder(prefix);
        for (int i = 0; i < labels.size(); i++) sb.append(i == 0 ? "" : " ").append(labels.get(i));
        System.out.println(sb);
    }

    static void describe(String label, Node root, int n, String probeLabel) {
        System.out.println("-- " + label + " --");
        System.out.println("nodes = " + n + ", edges = " + (n - 1));
        computeDepths(root);
        System.out.println("height (of the root) = " + height(root));
        List<String> leaves = new ArrayList<>();
        collectLeaves(root, false, leaves);
        printLabelList("leaves:", leaves);
        List<String> internal = new ArrayList<>();
        collectLeaves(root, true, internal);
        printLabelList("internal nodes:", internal);

        Node probe = byLabel.get(probeLabel);
        System.out.println("probe node " + probe.label + ": depth = " + probe.depth +
                            ", degree (child count) = " + probe.children.size() +
                            ", subtree size = " + subtreeSize(probe));
        StringBuilder kids = new StringBuilder("  children of " + probe.label + ":");
        for (Node c : probe.children) kids.append(' ').append(c.label);
        if (probe.children.isEmpty()) kids.append(" (none, it is a leaf)");
        System.out.println(kids);
        if (probe.parent == null) {
            System.out.println("  " + probe.label + " is the root: no parent, no siblings");
        } else {
            System.out.println("  parent of " + probe.label + ": " + probe.parent.label);
            StringBuilder sibs = new StringBuilder("  siblings of " + probe.label + ":");
            boolean any = false;
            for (Node sib : probe.parent.children) {
                if (sib != probe) { sibs.append(' ').append(sib.label); any = true; }
            }
            if (!any) sibs.append(" (none, only child)");
            System.out.println(sibs);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 11 nodes, a bushy tree
        Spec[] normal = {
            new Spec("A", null), new Spec("B", "A"), new Spec("C", "A"), new Spec("D", "A"),
            new Spec("E", "B"), new Spec("F", "B"), new Spec("G", "C"), new Spec("H", "D"),
            new Spec("I", "D"), new Spec("J", "D"), new Spec("K", "E")
        };
        describe("normal: 11 nodes, a bushy tree", buildTree(normal), 11, "D");

        // hard: 18 nodes, uneven depths (down to level 5)
        Spec[] hard = {
            new Spec("R", null),
            new Spec("P1", "R"), new Spec("P2", "P1"), new Spec("P3", "P2"), new Spec("P4", "P3"), new Spec("P5", "P4"),
            new Spec("Q1", "R"), new Spec("Q2", "R"), new Spec("Q3", "R"),
            new Spec("S1", "Q1"), new Spec("S2", "Q1"), new Spec("S3", "Q2"), new Spec("S4", "Q3"),
            new Spec("U1", "S1"), new Spec("U2", "S3"), new Spec("U3", "S3"),
            new Spec("V1", "U1"), new Spec("W1", "V1")
        };
        describe("hard: 18 nodes, uneven depths", buildTree(hard), 18, "S3");

        // edge: a chain (degenerate), 10 nodes, each with one child
        Spec[] chain = {
            new Spec("R", null), new Spec("C1", "R"), new Spec("C2", "C1"), new Spec("C3", "C2"), new Spec("C4", "C3"),
            new Spec("C5", "C4"), new Spec("C6", "C5"), new Spec("C7", "C6"), new Spec("C8", "C7"), new Spec("C9", "C8")
        };
        describe("edge: a chain (degenerate), 10 nodes", buildTree(chain), 10, "C9");

        // edge: a star -- the root has 10 children
        Spec[] star = {
            new Spec("R", null), new Spec("L1", "R"), new Spec("L2", "R"), new Spec("L3", "R"), new Spec("L4", "R"), new Spec("L5", "R"),
            new Spec("L6", "R"), new Spec("L7", "R"), new Spec("L8", "R"), new Spec("L9", "R"), new Spec("L10", "R")
        };
        describe("edge: a star, the root has 10 children", buildTree(star), 11, "R");
    }
}
