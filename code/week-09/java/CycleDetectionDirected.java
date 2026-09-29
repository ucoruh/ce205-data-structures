/* Week 9 -- Graph Algorithms
 * Cycle detection in a DIRECTED graph: 3-colour DFS (white/gray/black) with
 * an explicit "on the current path" stack. A back edge to a GREY vertex
 * means that vertex is still an open ancestor -- the path from it down to
 * here, plus the back edge, IS the cycle.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class CycleDetectionDirected {
    static final int MAX_V = 32;

    static class AdjNode { int to; AdjNode next; AdjNode(int to) { this.to = to; } }
    static class Graph {
        String[] label = new String[MAX_V];
        AdjNode[] adj = new AdjNode[MAX_V];
        int vertexCount;
    }

    static int[] colorOf = new int[MAX_V];        // 0 white, 1 gray, 2 black
    static int[] onPath = new int[MAX_V]; static int pathTop;
    static int[] cycle = new int[MAX_V]; static int cycleLen;
    static Graph curG;

    static boolean dfsCycle(int u) {
        colorOf[u] = 1;                                  // gray: on the current path
        onPath[pathTop] = u; pathTop++;
        for (AdjNode n = curG.adj[u]; n != null; n = n.next) {  // alphabetical order
            if (colorOf[n.to] == 0) {
                if (dfsCycle(n.to)) return true;
            } else if (colorOf[n.to] == 1) {
                int i = pathTop - 1;                      // n.to is a grey ancestor: extract the cycle
                while (onPath[i] != n.to) i--;
                cycleLen = 0;
                for (; i < pathTop; i++) { cycle[cycleLen] = onPath[i]; cycleLen++; }
                return true;
            }
        }
        pathTop--;                                        // leaving the path: no cycle through u
        colorOf[u] = 2;
        return false;
    }

    static boolean hasCycleDirected(Graph g) {
        curG = g;
        for (int i = 0; i < g.vertexCount; i++) colorOf[i] = 0;
        pathTop = 0; cycleLen = 0;
        for (int v = 0; v < g.vertexCount; v++)            // alphabetical order
            if (colorOf[v] == 0 && dfsCycle(v)) return true;
        return false;
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
            addNeighbourSorted(g, a, b);
        }
    }

    static void runScenario(String label, EdgeIn[] edges) {
        System.out.println("-- " + label + " --");
        Graph g = new Graph();
        buildGraph(g, edges);

        boolean found = hasCycleDirected(g);
        if (found) {
            StringBuilder sb = new StringBuilder("cycle found:");
            for (int i = 0; i < cycleLen; i++) sb.append(' ').append(g.label[cycle[i]]);
            sb.append(" -> ").append(g.label[cycle[0]]);
            System.out.println(sb);
        } else {
            System.out.println("no cycle found");
        }

        System.out.println();
    }

    public static void main(String[] args) {
        EdgeIn[] normal = {
            new EdgeIn("A", "B"), new EdgeIn("A", "C"), new EdgeIn("B", "D"), new EdgeIn("C", "D"), new EdgeIn("D", "F"),
            new EdgeIn("F", "C"), new EdgeIn("D", "E"), new EdgeIn("F", "G"), new EdgeIn("E", "G"), new EdgeIn("G", "H")
        };
        runScenario("normal: 8 vertices, 10 edges, one cycle: C-D-F-C", normal);

        EdgeIn[] hard = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "B"), new EdgeIn("D", "E"),
            new EdgeIn("E", "F"), new EdgeIn("F", "D"), new EdgeIn("F", "G"), new EdgeIn("G", "H"), new EdgeIn("H", "I"),
            new EdgeIn("I", "J"), new EdgeIn("A", "E"), new EdgeIn("C", "F"), new EdgeIn("B", "G")
        };
        runScenario("hard: 10 vertices, 14 edges, two overlapping cycles", hard);

        EdgeIn[] acyclic = {
            new EdgeIn("A", "B"), new EdgeIn("A", "C"), new EdgeIn("B", "D"), new EdgeIn("C", "D"), new EdgeIn("D", "E"),
            new EdgeIn("C", "F"), new EdgeIn("E", "G"), new EdgeIn("F", "G"), new EdgeIn("G", "H"), new EdgeIn("B", "E")
        };
        runScenario("edge: 10 edges, entirely cycle-free (a DAG)", acyclic);

        EdgeIn[] minCycle = {
            new EdgeIn("A", "B"), new EdgeIn("B", "A"), new EdgeIn("C", "D"), new EdgeIn("D", "E"), new EdgeIn("E", "F"),
            new EdgeIn("C", "E"), new EdgeIn("F", "G"), new EdgeIn("G", "H"), new EdgeIn("D", "G"), new EdgeIn("H", "I")
        };
        runScenario("edge: the smallest cycle, A-B-A (2 edges), among 10 edges", minCycle);
    }
}
