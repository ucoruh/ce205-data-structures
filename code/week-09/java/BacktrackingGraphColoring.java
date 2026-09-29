/* Week 9 -- Graph Algorithms
 * Backtracking: colour every vertex with one of k colours so that no edge
 * joins two same-coloured vertices. Vertices are tried in alphabetical
 * order, colours 1..k in order; when no colour works, we UNDO (colour 0)
 * and let the caller try its next colour.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class BacktrackingGraphColoring {
    static final int MAX_V = 32;

    static class AdjNode { int to; AdjNode next; AdjNode(int to) { this.to = to; } }
    static class Graph {
        String[] label = new String[MAX_V];
        AdjNode[] adj = new AdjNode[MAX_V];
        int vertexCount;
    }

    static int[] colorOf = new int[MAX_V];         // 0 = uncoloured
    static Graph curG;

    static boolean safe(int v, int c) {
        for (AdjNode n = curG.adj[v]; n != null; n = n.next)    // alphabetical order
            if (colorOf[n.to] == c) return false;    // a neighbour already has this colour
        return true;
    }

    static boolean colorGraph(int v, int k) {           // try to colour v, v+1, ... with k colours
        if (v == curG.vertexCount) return true;          // every vertex coloured: success
        for (int c = 1; c <= k; c++) {
            if (safe(v, c)) {
                colorOf[v] = c;                            // try colour c
                if (colorGraph(v + 1, k)) return true;
                colorOf[v] = 0;                             // backtrack: undo, try the next colour
            }
        }
        return false;                                     // no colour works for v: fail, backtrack further
    }

    // ---- construction: build Graph from a (label, label) UNDIRECTED edge list. ----

    static class EdgeIn { String a, b; EdgeIn(String a, String b) { this.a = a; this.b = b; } }

    static int findOrAddVertex(Graph g, String lbl) {
        for (int i = 0; i < g.vertexCount; i++)
            if (g.label[i].equals(lbl)) return i;
        g.label[g.vertexCount] = lbl;
        g.adj[g.vertexCount] = null;
        return g.vertexCount++;
    }

    static void addNeighbourSorted(Graph g, int v, int neighbour) {
        AdjNode n = new AdjNode(neighbour);
        if (g.adj[v] == null || g.label[g.adj[v].to].compareTo(g.label[neighbour]) > 0) {
            n.next = g.adj[v]; g.adj[v] = n; return;
        }
        AdjNode cur = g.adj[v];
        while (cur.next != null && g.label[cur.next.to].compareTo(g.label[neighbour]) <= 0) cur = cur.next;
        n.next = cur.next; cur.next = n;
    }

    static void buildGraph(Graph g, EdgeIn[] edges) {
        g.vertexCount = 0;
        for (int i = 0; i < MAX_V; i++) g.adj[i] = null;
        for (EdgeIn e : edges) {
            int a = findOrAddVertex(g, e.a), b = findOrAddVertex(g, e.b);
            if (a == b) continue;
            addNeighbourSorted(g, a, b);
            addNeighbourSorted(g, b, a);
        }
    }

    static void runScenario(String labelTxt, int k, EdgeIn[] edges) {
        System.out.println("-- " + labelTxt + " --");
        Graph g = new Graph();
        buildGraph(g, edges);
        curG = g;
        for (int i = 0; i < g.vertexCount; i++) colorOf[i] = 0;

        boolean ok = colorGraph(0, k);
        if (ok) {
            StringBuilder sb = new StringBuilder("colouring:");
            for (int v = 0; v < g.vertexCount; v++) sb.append(' ').append(g.label[v]).append('=').append(colorOf[v]);
            System.out.println(sb);
        } else {
            System.out.println("no valid colouring with k=" + k);
        }

        System.out.println();
    }

    public static void main(String[] args) {
        EdgeIn[] normal = {
            new EdgeIn("A", "B"), new EdgeIn("A", "C"), new EdgeIn("B", "C"), new EdgeIn("B", "D"), new EdgeIn("C", "D"),
            new EdgeIn("C", "E"), new EdgeIn("D", "E"), new EdgeIn("D", "F"), new EdgeIn("E", "F"), new EdgeIn("A", "F")
        };
        runScenario("normal: 6 vertices, 10 edges, solvable with k=3 colours", 3, normal);

        EdgeIn[] hard = {
            new EdgeIn("A", "B"), new EdgeIn("A", "C"), new EdgeIn("A", "E"), new EdgeIn("A", "G"), new EdgeIn("B", "C"),
            new EdgeIn("B", "E"), new EdgeIn("B", "F"), new EdgeIn("C", "D"), new EdgeIn("C", "F"), new EdgeIn("D", "E"),
            new EdgeIn("E", "F"), new EdgeIn("F", "G")
        };
        runScenario("hard: 7 vertices, 12 edges, k=3, needs a fair amount of backtracking", 3, hard);

        EdgeIn[] impossible = {
            new EdgeIn("A", "B"), new EdgeIn("A", "C"), new EdgeIn("A", "D"), new EdgeIn("B", "C"), new EdgeIn("B", "D"), new EdgeIn("C", "D"),
            new EdgeIn("D", "E"), new EdgeIn("E", "F"), new EdgeIn("F", "D"), new EdgeIn("E", "A")
        };
        runScenario("edge: K4 (4 mutually connected vertices) is UNSOLVABLE with k=3 (10 edges)", 3, impossible);

        EdgeIn[] trivial = { new EdgeIn("A", "B") };
        runScenario("edge: 2 vertices, 1 edge, k=2 (the minimum needed)", 2, trivial);
    }
}
