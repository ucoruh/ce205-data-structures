/* Week 5 -- Graphs and Traversals
 * Graph vocabulary: vertex, edge, directed/undirected, weighted, degree,
 * in/out-degree, self-loop, parallel (multi-) edge, connected component,
 * cycle. Builds a Graph as an adjacency list (Edge nodes, one linked list
 * per vertex) and reports these properties for each scenario.
 * CEN207 Data Structures (formerly CE205)
 */
public class GraphTerminology {
    static final int MAX_V = 16;

    static class Edge {
        int to;                 // index of the other endpoint
        int weight;              // 1 if the graph is unweighted
        Edge next;
    }

    static class Graph {
        String[] label = new String[MAX_V];
        Edge[] adj = new Edge[MAX_V];   // adjacency list, one linked list per vertex
        int vertexCount;
        boolean directed;
    }

    static int outDegree(Graph g, int v) {
        int d = 0;
        for (Edge e = g.adj[v]; e != null; e = e.next)
            d++;              // undirected: this already counts BOTH ends written once each -> degree
        return d;
    }

    static int inDegree(Graph g, int v) {   // directed only: how many edges point INTO v
        int d = 0;
        for (int u = 0; u < g.vertexCount; u++)
            for (Edge e = g.adj[u]; e != null; e = e.next)
                if (e.to == v) d++;
        return d;
    }

    // ---- construction helpers: not part of the lecture code panel above, but
    // needed to actually build a Graph from a list of (label, label, weight)
    // edges the way the animation's input box accepts them. ----

    static class EdgeIn {
        String a, b;
        int weight;
        EdgeIn(String a, String b, int weight) { this.a = a; this.b = b; this.weight = weight; }
    }

    static int findOrAddVertex(Graph g, String lbl) {
        for (int i = 0; i < g.vertexCount; i++)
            if (g.label[i].equals(lbl)) return i;
        g.label[g.vertexCount] = lbl;
        g.adj[g.vertexCount] = null;
        return g.vertexCount++;
    }

    static void append(Graph g, int v, int neighbour, int weight) {
        Edge n = new Edge();
        n.to = neighbour;
        n.weight = weight;
        n.next = null;
        if (g.adj[v] == null) { g.adj[v] = n; return; }
        Edge cur = g.adj[v];
        while (cur.next != null) cur = cur.next;
        cur.next = n;
    }

    static void addEdgeLabelled(Graph g, String a, String b, int weight) {
        int ia = findOrAddVertex(g, a), ib = findOrAddVertex(g, b);
        append(g, ia, ib, weight);
        if (!g.directed && ia != ib) append(g, ib, ia, weight);
    }

    // ---- analysis: components (BFS, direction ignored) and cycle (DFS) ----

    static int undirectedNeighbours(Graph g, int v, int[] out) {
        int n = 0;
        for (Edge e = g.adj[v]; e != null; e = e.next)
            if (e.to != v) out[n++] = e.to;             // v's own out-edges (self-loops excluded here)
        if (g.directed)
            for (int u = 0; u < g.vertexCount; u++)
                if (u != v)
                    for (Edge e = g.adj[u]; e != null; e = e.next)
                        if (e.to == v) out[n++] = u;     // edges pointing INTO v, walked backwards
        return n;
    }

    static int countComponents(Graph g, int[] compOf) {
        int[] queueData = new int[MAX_V];
        for (int i = 0; i < g.vertexCount; i++) compOf[i] = -1;
        int nextId = 0;
        for (int s = 0; s < g.vertexCount; s++) {
            if (compOf[s] != -1) continue;
            int front = 0, rear = 0;
            compOf[s] = nextId;
            queueData[rear++] = s;
            while (front < rear) {
                int u = queueData[front++];
                int[] nb = new int[2 * MAX_V];
                int n = undirectedNeighbours(g, u, nb);
                for (int i = 0; i < n; i++)
                    if (compOf[nb[i]] == -1) { compOf[nb[i]] = nextId; queueData[rear++] = nb[i]; }
            }
            nextId++;
        }
        return nextId;
    }

    static int[] color = new int[MAX_V];

    static boolean dfsHasCycle(Graph g, int u, int parent) {
        color[u] = 1;
        boolean skippedParent = false;
        for (Edge e = g.adj[u]; e != null; e = e.next) {
            int v = e.to;
            if (v == u) return true;                                        // self-loop: trivially a cycle
            if (!g.directed && v == parent && !skippedParent) { skippedParent = true; continue; }
            if (color[v] == 0) { if (dfsHasCycle(g, v, u)) return true; }
            else if (color[v] == 1) return true;                            // back edge: an ancestor -> a cycle
        }
        color[u] = 2;
        return false;
    }

    static boolean hasCycle(Graph g) {
        for (int i = 0; i < g.vertexCount; i++) color[i] = 0;
        for (int i = 0; i < g.vertexCount; i++)
            if (color[i] == 0 && dfsHasCycle(g, i, -1)) return true;
        return false;
    }

    static void runScenario(String label, boolean directed, EdgeIn[] edges) {
        System.out.println("-- " + label + " --");
        Graph g = new Graph();
        g.directed = directed;
        for (EdgeIn e : edges) addEdgeLabelled(g, e.a, e.b, e.weight);

        System.out.println((directed ? "directed" : "undirected") + ", " + g.vertexCount + " vertices, " + edges.length + " edges");

        int selfLoops = 0;
        for (EdgeIn e : edges)
            if (e.a.equals(e.b)) { System.out.println("self-loop: " + e.a + "-" + e.b); selfLoops++; }
        if (selfLoops == 0) System.out.println("self-loops: none");

        boolean multiFound = false;
        outer:
        for (int i = 0; i < edges.length; i++) {
            if (edges[i].a.equals(edges[i].b)) continue;
            for (int j = i + 1; j < edges.length; j++) {
                boolean same = directed
                    ? (edges[i].a.equals(edges[j].a) && edges[i].b.equals(edges[j].b))
                    : ((edges[i].a.equals(edges[j].a) && edges[i].b.equals(edges[j].b)) ||
                       (edges[i].a.equals(edges[j].b) && edges[i].b.equals(edges[j].a)));
                if (same) {
                    System.out.println("multi-edge: " + edges[i].a + (directed ? ">" : "-") + edges[i].b + " (2 copies)");
                    multiFound = true;
                    break outer;
                }
            }
        }
        if (!multiFound) System.out.println("multi-edges: none");

        StringBuilder sb;
        if (!directed) {
            sb = new StringBuilder("degree (list-length, via out-degree):");
            for (int i = 0; i < g.vertexCount; i++) sb.append(' ').append(g.label[i]).append('=').append(outDegree(g, i));
            System.out.println(sb);
        } else {
            sb = new StringBuilder("in-degree: ");
            for (int i = 0; i < g.vertexCount; i++) sb.append(' ').append(g.label[i]).append('=').append(inDegree(g, i));
            System.out.println(sb);
            sb = new StringBuilder("out-degree:");
            for (int i = 0; i < g.vertexCount; i++) sb.append(' ').append(g.label[i]).append('=').append(outDegree(g, i));
            System.out.println(sb);
        }

        int[] compOf = new int[MAX_V];
        int comps = countComponents(g, compOf);
        System.out.println("connected components: " + comps);

        boolean cyc = hasCycle(g);
        System.out.println("has cycle: " + (cyc ? "yes" : "no"));

        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 8 vertices, weighted, a cycle, a self-loop, a multi-edge and 2 components
        EdgeIn[] normal = {
            new EdgeIn("A", "B", 3), new EdgeIn("B", "C", 5), new EdgeIn("C", "A", 2), new EdgeIn("C", "D", 4),
            new EdgeIn("D", "E", 1), new EdgeIn("E", "F", 6), new EdgeIn("E", "F", 9), new EdgeIn("D", "D", 7),
            new EdgeIn("G", "H", 2), new EdgeIn("F", "C", 8)
        };
        runScenario("normal: 8 vertices, weighted, a cycle, a self-loop, a multi-edge and 2 components", false, normal);

        // hard: 8 vertices, directed, multiple cycles, a self-loop, a multi-edge and 2 weak components
        EdgeIn[] hard = {
            new EdgeIn("P", "Q", 3), new EdgeIn("Q", "R", 1), new EdgeIn("R", "P", 4), new EdgeIn("R", "S", 2),
            new EdgeIn("S", "T", 5), new EdgeIn("T", "U", 1), new EdgeIn("T", "U", 1), new EdgeIn("U", "U", 6),
            new EdgeIn("Q", "S", 2), new EdgeIn("S", "Q", 3), new EdgeIn("V", "W", 2), new EdgeIn("W", "V", 3)
        };
        runScenario("hard: 8 vertices, directed, multiple cycles, a self-loop, a multi-edge and 2 weak components", true, hard);

        // edge: an 11-vertex chain, no cycle, unweighted, connected
        EdgeIn[] noCycle = {
            new EdgeIn("V1", "V2", 1), new EdgeIn("V2", "V3", 1), new EdgeIn("V3", "V4", 1), new EdgeIn("V4", "V5", 1), new EdgeIn("V5", "V6", 1),
            new EdgeIn("V6", "V7", 1), new EdgeIn("V7", "V8", 1), new EdgeIn("V8", "V9", 1), new EdgeIn("V9", "V10", 1), new EdgeIn("V10", "V11", 1)
        };
        runScenario("edge: an 11-vertex chain, no cycle, unweighted, connected", false, noCycle);

        // edge: a single vertex, shown with a self-loop
        EdgeIn[] single = { new EdgeIn("A", "A", 1) };
        runScenario("edge: a single vertex, shown with a self-loop", false, single);
    }
}
