/* Week 9 -- Graph Algorithms
 * Strongly connected components by KOSARAJU's algorithm: (1) DFS on the
 * graph, recording every vertex's FINISH time; (2) DFS again on the
 * TRANSPOSE graph, visiting unvisited roots in DECREASING finish-time
 * order -- each resulting DFS tree is exactly one strongly connected
 * component.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class StronglyConnectedComponents {
    static final int MAX_V = 32;

    static class AdjNode { int to; AdjNode next; AdjNode(int to) { this.to = to; } }
    static class Graph {
        String[] label = new String[MAX_V];
        AdjNode[] adj = new AdjNode[MAX_V];
        AdjNode[] adjT = new AdjNode[MAX_V];   // transpose: every edge reversed
        int vertexCount;
    }

    static int[] visited = new int[MAX_V];
    static int[] finish = new int[MAX_V]; static int finishLen;
    static int[] compOf = new int[MAX_V]; static int compCount;
    static Graph curG;

    static void dfs1(int u) {                              // phase 1: order by finish time
        visited[u] = 1;
        for (AdjNode n = curG.adj[u]; n != null; n = n.next)     // alphabetical order
            if (visited[n.to] == 0) dfs1(n.to);
        finish[finishLen] = u; finishLen++;
    }

    static void dfs2(int u, int id) {                      // phase 2: collect one component
        visited[u] = 1;
        compOf[u] = id;
        for (AdjNode n = curG.adjT[u]; n != null; n = n.next)    // alphabetical order, on the TRANSPOSE
            if (visited[n.to] == 0) dfs2(n.to, id);
    }

    static int kosaraju(Graph g) {
        curG = g;
        for (int i = 0; i < g.vertexCount; i++) visited[i] = 0;
        finishLen = 0;
        for (int v = 0; v < g.vertexCount; v++)             // alphabetical order
            if (visited[v] == 0) dfs1(v);
        for (int i = 0; i < g.vertexCount; i++) visited[i] = 0;
        compCount = 0;
        for (int i = finishLen - 1; i >= 0; i--) {           // decreasing finish time
            int v = finish[i];
            if (visited[v] == 0) { dfs2(v, compCount); compCount++; }
        }
        return compCount;
    }

    // ---- construction: build Graph (and its transpose) from a DIRECTED edge list. ----

    static class EdgeIn { String a, b; EdgeIn(String a, String b) { this.a = a; this.b = b; } }

    static int findOrAddVertex(Graph g, String lbl) {
        for (int i = 0; i < g.vertexCount; i++)
            if (g.label[i].equals(lbl)) return i;
        g.label[g.vertexCount] = lbl;
        g.adj[g.vertexCount] = null;
        g.adjT[g.vertexCount] = null;
        return g.vertexCount++;
    }

    static void addSorted(Graph g, AdjNode[] adj, int v, int neighbour) {
        AdjNode n = new AdjNode(neighbour);
        if (adj[v] == null || g.label[adj[v].to].compareTo(g.label[neighbour]) > 0) {
            n.next = adj[v]; adj[v] = n; return;
        }
        AdjNode cur = adj[v];
        while (cur.next != null && g.label[cur.next.to].compareTo(g.label[neighbour]) <= 0) cur = cur.next;
        n.next = cur.next; cur.next = n;
    }

    static void buildGraph(Graph g, EdgeIn[] edges) {
        g.vertexCount = 0;
        for (int i = 0; i < MAX_V; i++) { g.adj[i] = null; g.adjT[i] = null; }
        for (EdgeIn e : edges) {
            int a = findOrAddVertex(g, e.a), b = findOrAddVertex(g, e.b);
            if (a == b) continue;
            addSorted(g, g.adj, a, b);
            addSorted(g, g.adjT, b, a);
        }
    }

    static void runScenario(String labelTxt, EdgeIn[] edges) {
        System.out.println("-- " + labelTxt + " --");
        Graph g = new Graph();
        buildGraph(g, edges);

        int cc = kosaraju(g);
        System.out.println(cc + " component" + (cc == 1 ? "" : "s") + ":");
        for (int id = 0; id < cc; id++) {
            StringBuilder sb = new StringBuilder(" ");
            for (int v = 0; v < g.vertexCount; v++) if (compOf[v] == id) sb.append(' ').append(g.label[v]);
            System.out.println(sb);
        }

        System.out.println();
    }

    public static void main(String[] args) {
        EdgeIn[] normal = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "A"), new EdgeIn("C", "D"), new EdgeIn("D", "E"),
            new EdgeIn("E", "F"), new EdgeIn("F", "D"), new EdgeIn("F", "G"), new EdgeIn("G", "H"), new EdgeIn("E", "G")
        };
        runScenario("normal: 8 vertices, 10 edges, 2 cyclic components + 2 singletons", normal);

        EdgeIn[] hard = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "A"), new EdgeIn("B", "D"),
            new EdgeIn("C", "B"), new EdgeIn("D", "E"), new EdgeIn("E", "F"), new EdgeIn("F", "E"), new EdgeIn("F", "G"),
            new EdgeIn("G", "H"), new EdgeIn("H", "I"), new EdgeIn("I", "G"), new EdgeIn("I", "J")
        };
        runScenario("hard: 10 vertices, 14 edges, 3 components (one large)", hard);

        EdgeIn[] oneBigScc = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "E"), new EdgeIn("E", "F"),
            new EdgeIn("F", "G"), new EdgeIn("G", "H"), new EdgeIn("H", "A"), new EdgeIn("C", "A"), new EdgeIn("F", "D")
        };
        runScenario("edge: everything is one big cycle, the whole graph is one component", oneBigScc);

        EdgeIn[] dag = {
            new EdgeIn("A", "B"), new EdgeIn("A", "C"), new EdgeIn("B", "D"), new EdgeIn("C", "D"), new EdgeIn("D", "E"),
            new EdgeIn("C", "F"), new EdgeIn("E", "G"), new EdgeIn("F", "G"), new EdgeIn("G", "H"), new EdgeIn("B", "E")
        };
        runScenario("edge: a cycle-free graph (a DAG), every vertex is its own component", dag);
    }
}
