/* Week 9 -- Graph Algorithms
 * Dijkstra's shortest path: single source, non-negative weights only. Every
 * not-yet-finished vertex keeps a "dist" (its current best distance from
 * the start); each round the smallest is picked (it is now final) and its
 * outgoing edges are relaxed.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class Dijkstra {
    static final int MAX_V = 32, INF = 1000000000;

    static class AdjNode { int to, weight; AdjNode next; AdjNode(int to, int w) { this.to = to; this.weight = w; } }
    static class Graph {
        String[] label = new String[MAX_V];
        AdjNode[] adj = new AdjNode[MAX_V];
        int vertexCount;
    }

    static int[] distOf = new int[MAX_V], parentOf = new int[MAX_V]; static boolean[] done = new boolean[MAX_V];

    static int minDistVertex(int vertexCount) {
        int best = -1, bestDist = INF;
        for (int v = 0; v < vertexCount; v++)
            if (!done[v] && distOf[v] < bestDist) { bestDist = distOf[v]; best = v; }
        return best;
    }

    static void dijkstra(Graph g, int start) {
        for (int v = 0; v < g.vertexCount; v++) { distOf[v] = INF; done[v] = false; parentOf[v] = -1; }
        distOf[start] = 0;
        for (int count = 0; count < g.vertexCount; count++) {
            int u = minDistVertex(g.vertexCount);
            if (u == -1 || distOf[u] == INF) break;       // nothing left reachable
            done[u] = true;
            for (AdjNode n = g.adj[u]; n != null; n = n.next) {    // alphabetical order
                int cand = distOf[u] + n.weight;
                if (!done[n.to] && cand < distOf[n.to]) { distOf[n.to] = cand; parentOf[n.to] = u; }
            }
        }
    }

    // ---- construction: build Graph from a (label, label, weight) DIRECTED edge list. ----

    static class EdgeIn { String a, b; int w; EdgeIn(String a, String b, int w) { this.a = a; this.b = b; this.w = w; } }

    static int findOrAddVertex(Graph g, String lbl) {
        for (int i = 0; i < g.vertexCount; i++)
            if (g.label[i].equals(lbl)) return i;
        g.label[g.vertexCount] = lbl;
        g.adj[g.vertexCount] = null;
        return g.vertexCount++;
    }

    static void addNeighbourSorted(Graph g, int v, int neighbour, int w) {
        AdjNode n = new AdjNode(neighbour, w);
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
            addNeighbourSorted(g, a, b, e.w);
        }
    }

    static void runScenario(String labelTxt, String startLabel, EdgeIn[] edges) {
        System.out.println("-- " + labelTxt + " --");
        Graph g = new Graph();
        buildGraph(g, edges);
        int start = findOrAddVertex(g, startLabel);

        dijkstra(g, start);

        StringBuilder sb = new StringBuilder("distances:");
        for (int v = 0; v < g.vertexCount; v++) {
            if (distOf[v] == INF) sb.append(' ').append(g.label[v]).append("=inf");
            else sb.append(' ').append(g.label[v]).append('=').append(distOf[v]);
        }
        System.out.println(sb);

        System.out.println();
    }

    public static void main(String[] args) {
        EdgeIn[] normal = {
            new EdgeIn("A", "B", 4), new EdgeIn("A", "C", 2), new EdgeIn("C", "B", 1), new EdgeIn("B", "D", 5),
            new EdgeIn("C", "D", 8), new EdgeIn("C", "E", 10), new EdgeIn("D", "E", 2), new EdgeIn("D", "F", 6),
            new EdgeIn("E", "F", 3), new EdgeIn("E", "G", 7)
        };
        runScenario("normal: 8 vertices, 10 edges, starts at A", "A", normal);

        EdgeIn[] hard = {
            new EdgeIn("A", "B", 2), new EdgeIn("A", "C", 2), new EdgeIn("B", "D", 3), new EdgeIn("C", "D", 3),
            new EdgeIn("B", "E", 6), new EdgeIn("C", "F", 6), new EdgeIn("D", "G", 2), new EdgeIn("E", "G", 3),
            new EdgeIn("F", "G", 3), new EdgeIn("G", "H", 1), new EdgeIn("H", "I", 4), new EdgeIn("H", "J", 4),
            new EdgeIn("E", "H", 2), new EdgeIn("F", "H", 2)
        };
        runScenario("hard: 10 vertices, 14 edges, starts at A, many tied distances", "A", hard);

        EdgeIn[] unreachable = {
            new EdgeIn("A", "B", 2), new EdgeIn("B", "C", 4), new EdgeIn("A", "C", 5), new EdgeIn("C", "D", 1), new EdgeIn("D", "E", 3),
            new EdgeIn("F", "G", 2), new EdgeIn("G", "H", 6), new EdgeIn("H", "F", 7), new EdgeIn("H", "I", 3), new EdgeIn("I", "J", 4)
        };
        runScenario("edge: starts at A, F..J are never reachable via the directed edges", "A", unreachable);

        EdgeIn[] twoVertices = { new EdgeIn("A", "B", 9) };
        runScenario("edge: 2 vertices, 1 edge", "A", twoVertices);
    }
}
