/* Week 5 -- Graphs and Traversals
 * Depth-first search (DFS), recursive: every visit() call pushes a call-
 * stack frame, walks neighbours in ALPHABETICAL order, and pops before
 * returning. Unvisited vertices (alphabetical order) each start their own
 * tree -- a disconnected graph becomes a DFS FOREST. Edges are classified
 * as tree, back (a cycle), and -- directed graphs only -- forward/cross.
 * CEN207 Data Structures (formerly CE205)
 */
public class DfsRecursive {
    static final int MAX_V = 32;

    static class AdjNode { int to; AdjNode next; AdjNode(int to) { this.to = to; } }
    static class Graph {
        String[] label = new String[MAX_V];
        AdjNode[] adj = new AdjNode[MAX_V];
        int vertexCount;
        boolean directed;
    }

    static int[] colorOf = new int[MAX_V];        // 0 white, 1 gray, 2 black
    static int[] discTime = new int[MAX_V], finTime = new int[MAX_V], parentOf = new int[MAX_V];
    static int clock_ = 0;

    static void dfsVisit(Graph g, int u) {
        colorOf[u] = 1;                  // gray: discovered, still exploring
        discTime[u] = ++clock_;
        System.out.println("visit " + g.label[u] + " (disc=" + discTime[u] + ")");
        for (AdjNode n = g.adj[u]; n != null; n = n.next) {  // neighbours: alphabetical order
            int v = n.to;
            if (colorOf[v] == 0) {
                parentOf[v] = u;
                System.out.println("  edge " + g.label[u] + "-" + g.label[v] + ": TREE edge");
                dfsVisit(g, v);
            }
            else if (colorOf[v] == 1) {
                System.out.println("  edge " + g.label[u] + "-" + g.label[v] + ": BACK edge (a cycle)"); // v is an ancestor -> a cycle
            }
            else if (g.directed) {
                if (discTime[u] < discTime[v])
                    System.out.println("  edge " + g.label[u] + "-" + g.label[v] + ": FORWARD edge");
                else
                    System.out.println("  edge " + g.label[u] + "-" + g.label[v] + ": CROSS edge");
            }
        }
        colorOf[u] = 2;                  // black: finished
        finTime[u] = ++clock_;
        System.out.println("finish " + g.label[u] + " (fin=" + finTime[u] + ")");
    }

    static void dfs(Graph g) {
        for (int i = 0; i < g.vertexCount; i++) colorOf[i] = 0;
        for (int i = 0; i < g.vertexCount; i++)
            if (colorOf[i] == 0) dfsVisit(g, i);  // one tree per component
    }

    // ---- construction: build Graph from a (label, label) edge list, neighbour
    // lists kept in alphabetical (insertion) order to match the animation. ----

    static class EdgeIn {
        String a, b;
        EdgeIn(String a, String b) { this.a = a; this.b = b; }
    }

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
            n.next = g.adj[v];
            g.adj[v] = n;
            return;
        }
        AdjNode cur = g.adj[v];
        while (cur.next != null && g.label[cur.next.to].compareTo(g.label[neighbour]) <= 0)
            cur = cur.next;
        n.next = cur.next;
        cur.next = n;
    }

    static void buildGraph(Graph g, boolean directed, EdgeIn[] edges) {
        g.vertexCount = 0;
        g.directed = directed;
        for (int i = 0; i < MAX_V; i++) g.adj[i] = null;
        for (EdgeIn e : edges) {
            int a = findOrAddVertex(g, e.a), b = findOrAddVertex(g, e.b);
            if (a == b) { addNeighbourSorted(g, a, a); continue; }   // self-loop: one entry, a->a
            addNeighbourSorted(g, a, b);
            if (!directed) addNeighbourSorted(g, b, a);
        }
    }

    static void runScenario(String label, boolean directed, EdgeIn[] edges) {
        System.out.println("-- " + label + " --");
        Graph g = new Graph();
        buildGraph(g, directed, edges);
        clock_ = 0;
        dfs(g);

        StringBuilder sb = new StringBuilder("preorder (discovery order):");
        // rebuild the discovery order from discTime, cheaper than tracking a
        // separate array: sort vertex indices by discTime
        int[] order = new int[g.vertexCount];
        for (int i = 0; i < g.vertexCount; i++) order[i] = i;
        for (int i = 1; i < g.vertexCount; i++) {
            int key = order[i], j = i - 1;
            while (j >= 0 && discTime[order[j]] > discTime[key]) { order[j + 1] = order[j]; j--; }
            order[j + 1] = key;
        }
        for (int i = 0; i < g.vertexCount; i++) sb.append(' ').append(g.label[order[i]]);
        System.out.println(sb);

        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 7 vertices, undirected, 4 back edges (cycles), 10 edges
        EdgeIn[] normal = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "E"),
            new EdgeIn("E", "F"), new EdgeIn("F", "G"), new EdgeIn("G", "A"),
            new EdgeIn("A", "D"), new EdgeIn("B", "E"), new EdgeIn("C", "F")
        };
        runScenario("normal: 7 vertices, undirected, 4 back edges (cycles), 10 edges", false, normal);

        // hard: 6 vertices, directed: tree, back, forward AND cross edges all in one graph, 10 edges
        EdgeIn[] hard = {
            new EdgeIn("A", "B"), new EdgeIn("A", "D"), new EdgeIn("A", "E"),
            new EdgeIn("B", "C"), new EdgeIn("C", "A"),
            new EdgeIn("D", "E"), new EdgeIn("D", "F"),
            new EdgeIn("E", "B"), new EdgeIn("E", "F"), new EdgeIn("F", "C")
        };
        runScenario("hard: 6 vertices, directed: tree, back, forward AND cross edges all in one graph, 10 edges", true, hard);

        // edge: 10 vertices, undirected, 2 separate components: a DFS FOREST
        EdgeIn[] forest = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "E"), new EdgeIn("E", "F"),
            new EdgeIn("G", "H"), new EdgeIn("H", "I"), new EdgeIn("I", "G"), new EdgeIn("G", "J"), new EdgeIn("H", "J")
        };
        runScenario("edge: 10 vertices, undirected, 2 separate components: a DFS FOREST", false, forest);

        // edge: a single vertex, shown with a self-loop
        EdgeIn[] single = { new EdgeIn("A", "A") };
        runScenario("edge: a single vertex, shown with a self-loop", false, single);
    }
}
