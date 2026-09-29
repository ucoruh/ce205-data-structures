/* Week 5 -- Graphs and Traversals
 * Graph representation: adjacency list. Builds an array of linked lists
 * from an edge list (undirected appends a node to BOTH endpoints' lists,
 * unless it is a self-loop) and prints every list after each edge is
 * added. Same graphs as AdjacencyMatrix.java, so the two representations
 * can be compared directly.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class AdjacencyList {
    static final int MAX_V = 16;

    static class AdjNode {
        int to;                 // neighbour's vertex index
        AdjNode next;
    }

    static AdjNode[] adj = new AdjNode[MAX_V];   // one linked list per vertex, all start null

    static void append(int v, int neighbour) {
        AdjNode n = new AdjNode();
        n.to = neighbour;
        n.next = null;
        if (adj[v] == null) { adj[v] = n; return; }
        AdjNode cur = adj[v];
        while (cur.next != null)
            cur = cur.next;     // walk to the tail
        cur.next = n;
    }

    static void addEdge(int a, int b, boolean directed) {
        append(a, b);
        if (!directed && a != b)
            append(b, a);
    }

    // ---- construction helpers: turn a (label, label) edge list into the
    // (index, index) pairs addEdge() expects, with vertex indices assigned
    // in alphabetical label order. ----

    static class EdgeIn {
        String a, b;
        EdgeIn(String a, String b) { this.a = a; this.b = b; }
    }

    static int indexOf(String[] labels, int n, String lbl) {
        for (int i = 0; i < n; i++) if (labels[i].equals(lbl)) return i;
        return -1;
    }

    static int collectLabels(EdgeIn[] edges, String[] labels) {
        int count = 0;
        for (EdgeIn e : edges) {
            if (indexOf(labels, count, e.a) < 0) labels[count++] = e.a;
            if (indexOf(labels, count, e.b) < 0) labels[count++] = e.b;
        }
        for (int i = 1; i < count; i++) {
            String key = labels[i];
            int j = i - 1;
            while (j >= 0 && labels[j].compareTo(key) > 0) { labels[j + 1] = labels[j]; j--; }
            labels[j + 1] = key;
        }
        return count;
    }

    static void printLists(String[] labels, int n) {
        for (int i = 0; i < n; i++) {
            StringBuilder sb = new StringBuilder(labels[i] + ":");
            for (AdjNode cur = adj[i]; cur != null; cur = cur.next)
                sb.append(" -> ").append(labels[cur.to]);
            sb.append(" -> NULL");
            System.out.println(sb);
        }
    }

    static void runScenario(String label, boolean directed, EdgeIn[] inEdges) {
        System.out.println("-- " + label + " --");
        String[] labels = new String[MAX_V];
        int v = collectLabels(inEdges, labels);
        for (int i = 0; i < MAX_V; i++) adj[i] = null;

        System.out.println(v + " vertices, empty lists:");
        printLists(labels, v);

        for (EdgeIn e : inEdges) {
            int ia = indexOf(labels, v, e.a), ib = indexOf(labels, v, e.b);
            addEdge(ia, ib, directed);
            System.out.println("add_edge(" + e.a + ", " + e.b + ")"
                + ((!directed && ia != ib) ? " [both lists updated]" : ""));
            printLists(labels, v);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 7 vertices, undirected, unweighted, 10 edges
        EdgeIn[] normal = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "E"),
            new EdgeIn("E", "F"), new EdgeIn("F", "G"), new EdgeIn("G", "A"),
            new EdgeIn("A", "D"), new EdgeIn("B", "E"), new EdgeIn("C", "F")
        };
        runScenario("normal: 7 vertices, undirected, unweighted, 10 edges", false, normal);

        // hard: 8 vertices, directed, weighted, 10 edges including a reversed pair
        EdgeIn[] hard = {
            new EdgeIn("P", "Q"), new EdgeIn("Q", "R"), new EdgeIn("R", "S"), new EdgeIn("S", "T"),
            new EdgeIn("T", "U"), new EdgeIn("U", "V"), new EdgeIn("V", "W"), new EdgeIn("W", "P"),
            new EdgeIn("P", "R"), new EdgeIn("R", "P")
        };
        runScenario("hard: 8 vertices, directed, weighted, 10 edges including a reversed pair", true, hard);

        // edge: 5 vertices, a complete graph (every pair connected), 10 edges
        EdgeIn[] dense = {
            new EdgeIn("A", "B"), new EdgeIn("A", "C"), new EdgeIn("A", "D"), new EdgeIn("A", "E"),
            new EdgeIn("B", "C"), new EdgeIn("B", "D"), new EdgeIn("B", "E"),
            new EdgeIn("C", "D"), new EdgeIn("C", "E"), new EdgeIn("D", "E")
        };
        runScenario("edge: 5 vertices, a complete graph (every pair connected), 10 edges", false, dense);

        // edge: a single vertex, shown with a self-loop -- a one-vertex list
        EdgeIn[] single = { new EdgeIn("A", "A") };
        runScenario("edge: a single vertex, shown with a self-loop -- a one-vertex list", false, single);
    }
}
