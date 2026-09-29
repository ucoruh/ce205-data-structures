/* Week 9 -- Graph Algorithms
 * Topological sort by DFS: run recursive DFS, record every vertex's FINISH
 * time, then read the finish order back to front. A back edge (to a grey,
 * still-open ancestor) means the graph has a cycle, so no topological order
 * exists.
 * CEN207 Data Structures (formerly CE205)
 */
public class TopologicalSortDfs {
    static final int MAX_V = 32;

    static class AdjNode { int to; AdjNode next; AdjNode(int to) { this.to = to; } }
    static class Graph {
        String[] label = new String[MAX_V];
        AdjNode[] adj = new AdjNode[MAX_V];
        int vertexCount;
    }

    static int[] colorOf = new int[MAX_V];        // 0 white, 1 gray, 2 black
    static int[] finish = new int[MAX_V]; static int finishLen;
    static boolean hasCycle;
    static Graph curG;

    static void dfsVisit(int u) {
        colorOf[u] = 1;                                 // gray: in progress
        for (AdjNode n = curG.adj[u]; n != null; n = n.next) {  // alphabetical order
            if (colorOf[n.to] == 0) dfsVisit(n.to);            // tree edge
            else if (colorOf[n.to] == 1) hasCycle = true;      // back edge -> a cycle
        }
        colorOf[u] = 2;                                 // black: done
        finish[finishLen] = u; finishLen++;
    }

    static void topoSortDfs(Graph g) {
        curG = g;
        for (int i = 0; i < g.vertexCount; i++) colorOf[i] = 0;
        finishLen = 0; hasCycle = false;
        for (int v = 0; v < g.vertexCount; v++)           // alphabetical order
            if (colorOf[v] == 0) dfsVisit(v);
    }

    // ---- construction: build Graph from a (label, label) DIRECTED edge list. ----

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

    static void buildGraph(Graph g, EdgeIn[] edges) {
        g.vertexCount = 0;
        for (int i = 0; i < MAX_V; i++) g.adj[i] = null;
        for (EdgeIn e : edges) {
            int a = findOrAddVertex(g, e.a), b = findOrAddVertex(g, e.b);
            if (a == b) continue;
            addNeighbourSorted(g, a, b);
        }
    }

    static void runScenario(String label, EdgeIn[] edges) {
        System.out.println("-- " + label + " --");
        Graph g = new Graph();
        buildGraph(g, edges);

        topoSortDfs(g);
        StringBuilder sb = new StringBuilder("finish order:");
        for (int i = 0; i < finishLen; i++) sb.append(' ').append(g.label[finish[i]]);
        System.out.println(sb);
        if (hasCycle) {
            System.out.println("a back edge was found: NOT a valid topological order (the graph has a cycle)");
        } else {
            StringBuilder ob = new StringBuilder("topo order:");
            for (int i = finishLen - 1; i >= 0; i--) ob.append(' ').append(g.label[finish[i]]);
            System.out.println(ob);
        }

        System.out.println();
    }

    public static void main(String[] args) {
        EdgeIn[] normal = {
            new EdgeIn("A", "B"), new EdgeIn("A", "C"), new EdgeIn("B", "D"), new EdgeIn("C", "D"), new EdgeIn("D", "E"),
            new EdgeIn("C", "F"), new EdgeIn("E", "G"), new EdgeIn("F", "G"), new EdgeIn("G", "H"), new EdgeIn("B", "E")
        };
        runScenario("normal: 8 vertices, 10 edges, a valid DAG", normal);

        EdgeIn[] hard = {
            new EdgeIn("A", "D"), new EdgeIn("B", "D"), new EdgeIn("C", "E"), new EdgeIn("D", "F"), new EdgeIn("E", "F"),
            new EdgeIn("D", "G"), new EdgeIn("F", "H"), new EdgeIn("G", "H"), new EdgeIn("H", "I"), new EdgeIn("I", "J"),
            new EdgeIn("G", "J"), new EdgeIn("B", "E"), new EdgeIn("A", "G"), new EdgeIn("C", "F")
        };
        runScenario("hard: 10 vertices, 14 edges, a DAG with several sources", hard);

        EdgeIn[] cycle = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "A"), new EdgeIn("C", "D"), new EdgeIn("D", "E"),
            new EdgeIn("E", "F"), new EdgeIn("A", "D"), new EdgeIn("F", "G"), new EdgeIn("D", "F"), new EdgeIn("B", "D")
        };
        runScenario("edge: 10 edges but a cycle exists, a back edge is found", cycle);

        EdgeIn[] single = { new EdgeIn("A", "A") };
        runScenario("edge: a single vertex, no edges (self-loop is ignored)", single);
    }
}
