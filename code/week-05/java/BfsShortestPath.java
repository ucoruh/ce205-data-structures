/* Week 5 -- Graphs and Traversals
 * Shortest path by EDGE COUNT from s to t, using BFS parent pointers
 * walked back to reconstruct the path. Neighbours are examined in
 * alphabetical order (as in Bfs.java).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class BfsShortestPath {
    static final int MAX_V = 32;

    static class AdjNode { int to; AdjNode next; AdjNode(int to) { this.to = to; } }
    static class Graph {
        String[] label = new String[MAX_V];
        AdjNode[] adj = new AdjNode[MAX_V];
        int vertexCount;
    }

    static int[] visited = new int[MAX_V], parentOf = new int[MAX_V];

    // returns the path length in edges, or -1 if t is unreachable; fills pathOut[0..len] with s..t
    static int bfsShortestPath(Graph g, int s, int t, int[] pathOut) {
        int[] queueData = new int[MAX_V]; int front = 0, rear = 0;
        for (int i = 0; i < g.vertexCount; i++) visited[i] = 0;
        visited[s] = 1;
        queueData[rear++] = s;
        while (front < rear) {
            int u = queueData[front++];
            for (AdjNode n = g.adj[u]; n != null; n = n.next) {   // alphabetical order
                if (visited[n.to] == 0) { visited[n.to] = 1; parentOf[n.to] = u; queueData[rear++] = n.to; }
            }
        }
        if (visited[t] == 0) return -1;                 // no path
        int len = 0, v = t;
        while (v != s) { pathOut[len++] = v; v = parentOf[v]; }
        pathOut[len++] = s;
        for (int i = 0; i < len / 2; i++) {              // pathOut was built backwards, from t to s
            int tmp = pathOut[i]; pathOut[i] = pathOut[len - 1 - i]; pathOut[len - 1 - i] = tmp;
        }
        return len - 1;                                  // path length, in edges
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
        for (EdgeIn e : edges) {
            int a = findOrAddVertex(g, e.a), b = findOrAddVertex(g, e.b);
            if (a == b) continue;                       // self-loop: no traversal edge to add
            addNeighbourSorted(g, a, b);
            if (!directed) addNeighbourSorted(g, b, a);
        }
    }

    static void runScenario(String label, boolean directed, String sLabel, String tLabel, EdgeIn[] edges) {
        System.out.println("-- " + label + " --");
        Graph g = new Graph();
        buildGraph(g, directed, edges);
        int s = findOrAddVertex(g, sLabel), t = findOrAddVertex(g, tLabel);

        int[] path = new int[MAX_V];
        int len = bfsShortestPath(g, s, t, path);

        if (len < 0) {
            System.out.println("no path from " + sLabel + " to " + tLabel);
        } else {
            StringBuilder sb = new StringBuilder("path from " + sLabel + " to " + tLabel + " (length " + len + "):");
            for (int i = 0; i <= len; i++) sb.append(' ').append(g.label[path[i]]);
            System.out.println(sb);
        }

        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 7 vertices, undirected, A to F, 10 edges
        EdgeIn[] normal = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "E"),
            new EdgeIn("E", "F"), new EdgeIn("F", "G"), new EdgeIn("G", "A"),
            new EdgeIn("A", "D"), new EdgeIn("B", "E"), new EdgeIn("C", "F")
        };
        runScenario("normal: 7 vertices, undirected, A to F, 10 edges", false, "A", "F", normal);

        // hard: 8 vertices, directed, P to W, 12 edges
        EdgeIn[] hard = {
            new EdgeIn("P", "Q"), new EdgeIn("P", "R"), new EdgeIn("Q", "S"), new EdgeIn("R", "S"),
            new EdgeIn("S", "T"), new EdgeIn("T", "U"), new EdgeIn("T", "V"), new EdgeIn("U", "W"),
            new EdgeIn("V", "W"), new EdgeIn("Q", "T"), new EdgeIn("R", "U"), new EdgeIn("W", "P")
        };
        runScenario("hard: 8 vertices, directed, P to W, 12 edges", true, "P", "W", hard);

        // edge: 9 vertices, NO PATH from A to H (2 separate components)
        EdgeIn[] noPath = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "E"),
            new EdgeIn("E", "F"), new EdgeIn("F", "A"), new EdgeIn("A", "D"),
            new EdgeIn("G", "H"), new EdgeIn("H", "I"), new EdgeIn("I", "G")
        };
        runScenario("edge: 9 vertices, NO PATH from A to H (2 separate components)", false, "A", "H", noPath);

        // edge: a single vertex, shown with a self-loop: s = t, length 0
        EdgeIn[] single = { new EdgeIn("A", "A") };
        runScenario("edge: a single vertex, shown with a self-loop: s = t, length 0", false, "A", "A", single);
    }
}
