/* Week 5 -- Graphs and Traversals
 * Depth-first search (DFS), iterative: an explicit stack (LIFO) replaces
 * the recursive call stack. A vertex's neighbours are pushed in REVERSE
 * alphabetical order, so popping them later processes them in alphabetical
 * order -- exactly the order DfsRecursive.java visits them in. A vertex
 * may be pushed more than once; a stale entry (already visited when
 * popped) is simply discarded. Same graphs as DfsRecursive.java.
 * CEN207 Data Structures (formerly CE205)
 */
public class DfsIterative {
    static final int MAX_V = 32, MAX_STACK = 256;

    static class Graph {
        String[] label = new String[MAX_V];
        int[][] adj = new int[MAX_V][MAX_V];   // array-based adjacency, each row in ascending (alphabetical) order
        int[] adjCount = new int[MAX_V];
        int vertexCount;
    }

    static boolean[] visited = new boolean[MAX_V];
    static int[] stackData = new int[MAX_STACK]; static int top = -1;
    static int[] order = new int[MAX_V]; static int orderLen;   // visit order, for the final summary line only

    static void push(int v) { stackData[++top] = v; }
    static int  pop()       { return stackData[top--]; }

    static void dfsIterative(Graph g, int start) {
        push(start);
        while (top >= 0) {
            int u = pop();
            if (visited[u]) { System.out.println("pop " + g.label[u] + ": stale, already visited -- discarded"); continue; }
            visited[u] = true;
            order[orderLen++] = u;
            System.out.println("pop " + g.label[u] + ": visit");
            for (int i = g.adjCount[u] - 1; i >= 0; i--)   // push in REVERSE alphabetical order
                if (!visited[g.adj[u][i]]) { push(g.adj[u][i]); System.out.println("  push " + g.label[g.adj[u][i]]); }
        }
    }

    static void dfs(Graph g) {
        for (int i = 0; i < g.vertexCount; i++) visited[i] = false;
        for (int i = 0; i < g.vertexCount; i++)
            if (!visited[i]) dfsIterative(g, i);   // one tree per component
    }

    // ---- construction: build Graph from a (label, label) edge list, each
    // vertex's adjacency row kept sorted alphabetically to match the
    // animation's neighbour order. ----

    static class EdgeIn {
        String a, b;
        EdgeIn(String a, String b) { this.a = a; this.b = b; }
    }

    static int findOrAddVertex(Graph g, String lbl) {
        for (int i = 0; i < g.vertexCount; i++)
            if (g.label[i].equals(lbl)) return i;
        g.label[g.vertexCount] = lbl;
        g.adjCount[g.vertexCount] = 0;
        return g.vertexCount++;
    }

    static void addNeighbourSorted(Graph g, int v, int neighbour) {
        int n = g.adjCount[v], i = n;
        while (i > 0 && g.label[g.adj[v][i - 1]].compareTo(g.label[neighbour]) > 0) {
            g.adj[v][i] = g.adj[v][i - 1];
            i--;
        }
        g.adj[v][i] = neighbour;
        g.adjCount[v] = n + 1;
    }

    static void buildGraph(Graph g, boolean directed, EdgeIn[] edges) {
        g.vertexCount = 0;
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
        top = -1;
        orderLen = 0;
        dfs(g);

        StringBuilder sb = new StringBuilder("visit order:");
        for (int i = 0; i < orderLen; i++) sb.append(' ').append(g.label[order[i]]);
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

        // hard: 6 vertices, directed, with a cycle, 10 edges
        EdgeIn[] hard = {
            new EdgeIn("A", "B"), new EdgeIn("A", "D"), new EdgeIn("A", "E"),
            new EdgeIn("B", "C"), new EdgeIn("C", "A"),
            new EdgeIn("D", "E"), new EdgeIn("D", "F"),
            new EdgeIn("E", "B"), new EdgeIn("E", "F"), new EdgeIn("F", "C")
        };
        runScenario("hard: 6 vertices, directed, with a cycle, 10 edges", true, hard);

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
