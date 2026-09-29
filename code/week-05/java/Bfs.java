/* Week 5 -- Graphs and Traversals
 * Breadth-first search (BFS) from a chosen start vertex, using a circular
 * queue. Neighbours are examined in ALPHABETICAL order, so the visit
 * order is reproducible. Prints every dequeue and the vertices it enqueues.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class Bfs {
    static final int MAX_V = 32;

    static class AdjNode { int to; AdjNode next; AdjNode(int to) { this.to = to; } }
    static class Graph {
        String[] label = new String[MAX_V];
        AdjNode[] adj = new AdjNode[MAX_V];
        int vertexCount;
    }

    static boolean[] visited = new boolean[MAX_V];
    static int[] levelOf = new int[MAX_V], parentOf = new int[MAX_V];
    static int[] queueData = new int[MAX_V]; static int front, rear, count;

    static void enqueue(int v) { queueData[rear] = v; rear = (rear + 1) % MAX_V; count++; }
    static int  dequeue()      { int v = queueData[front]; front = (front + 1) % MAX_V; count--; return v; }

    static void bfs(Graph g, int start) {
        for (int i = 0; i < g.vertexCount; i++) visited[i] = false;
        visited[start] = true;
        levelOf[start] = 0;
        enqueue(start);
        while (count > 0) {
            int u = dequeue();
            System.out.println("visit " + g.label[u] + " (level " + levelOf[u] + ")");
            for (AdjNode n = g.adj[u]; n != null; n = n.next) {  // neighbours: alphabetical order
                if (!visited[n.to]) {
                    visited[n.to] = true;
                    levelOf[n.to] = levelOf[u] + 1;
                    parentOf[n.to] = u;
                    enqueue(n.to);
                }
            }
        }
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
        for (int i = 0; i < MAX_V; i++) g.adj[i] = null;
        for (EdgeIn e : edges) {
            int a = findOrAddVertex(g, e.a), b = findOrAddVertex(g, e.b);
            if (a == b) continue;                       // self-loop: no traversal edge to add
            addNeighbourSorted(g, a, b);
            if (!directed) addNeighbourSorted(g, b, a);
        }
    }

    static void runScenario(String label, boolean directed, String startLabel, EdgeIn[] edges) {
        System.out.println("-- " + label + " --");
        Graph g = new Graph();
        buildGraph(g, directed, edges);
        int start = findOrAddVertex(g, startLabel);

        front = rear = count = 0;
        bfs(g, start);

        boolean unreached = false;
        StringBuilder sb = new StringBuilder("levels:");
        for (int i = 0; i < g.vertexCount; i++) {
            if (visited[i]) sb.append(' ').append(g.label[i]).append('=').append(levelOf[i]);
            else { sb.append(' ').append(g.label[i]).append("=unreached"); unreached = true; }
        }
        System.out.println(sb);
        if (!unreached) System.out.println("all vertices reached");

        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 7 vertices, undirected, starts at A, 10 edges
        EdgeIn[] normal = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "E"),
            new EdgeIn("E", "F"), new EdgeIn("F", "G"), new EdgeIn("G", "A"),
            new EdgeIn("A", "D"), new EdgeIn("B", "E"), new EdgeIn("C", "F")
        };
        runScenario("normal: 7 vertices, undirected, starts at A, 10 edges", false, "A", normal);

        // hard: 8 vertices, directed, starts at P, with a cycle, 12 edges
        EdgeIn[] hard = {
            new EdgeIn("P", "Q"), new EdgeIn("P", "R"), new EdgeIn("Q", "S"), new EdgeIn("R", "S"),
            new EdgeIn("S", "T"), new EdgeIn("T", "U"), new EdgeIn("T", "V"), new EdgeIn("U", "W"),
            new EdgeIn("V", "W"), new EdgeIn("Q", "T"), new EdgeIn("R", "U"), new EdgeIn("W", "P")
        };
        runScenario("hard: 8 vertices, directed, starts at P, with a cycle, 12 edges", true, "P", hard);

        // edge: 9 vertices, 2 components: G, H, I are unreachable from A
        EdgeIn[] disconnected = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "E"),
            new EdgeIn("E", "F"), new EdgeIn("F", "A"), new EdgeIn("A", "D"),
            new EdgeIn("G", "H"), new EdgeIn("H", "I"), new EdgeIn("I", "G")
        };
        runScenario("edge: 9 vertices, 2 components: G, H, I are unreachable from A", false, "A", disconnected);

        // edge: a single vertex, shown with a self-loop
        EdgeIn[] single = { new EdgeIn("A", "A") };
        runScenario("edge: a single vertex, shown with a self-loop", false, "A", single);
    }
}
