/* Week 5 -- Graphs and Traversals
 * Connected components: repeated BFS. Every unvisited vertex starts a new
 * BFS that labels everything it reaches with the same component id;
 * direction is ignored (weak connectivity).
 * CEN207 Data Structures (formerly CE205)
 */
public class ConnectedComponents {
    static final int MAX_V = 32;

    static class AdjNode { int to; AdjNode next; AdjNode(int to) { this.to = to; } }
    static class Graph {
        String[] label = new String[MAX_V];
        AdjNode[] adj = new AdjNode[MAX_V];   // undirected adjacency: direction always ignored here
        int vertexCount;
    }

    static int[] compOf = new int[MAX_V];   // -1 = not yet labelled

    static void bfsLabel(Graph g, int start, int id) {
        int[] queueData = new int[MAX_V]; int front = 0, rear = 0;
        compOf[start] = id;
        queueData[rear++] = start;
        while (front < rear) {
            int u = queueData[front++];
            for (AdjNode n = g.adj[u]; n != null; n = n.next) {  // direction ignored: treated as undirected
                if (compOf[n.to] == -1) { compOf[n.to] = id; queueData[rear++] = n.to; }
            }
        }
    }

    static int countComponents(Graph g) {
        int nextId = 0;
        for (int i = 0; i < g.vertexCount; i++) compOf[i] = -1;
        for (int i = 0; i < g.vertexCount; i++)
            if (compOf[i] == -1) { System.out.println("unvisited " + g.label[i] + ": new component " + nextId); bfsLabel(g, i, nextId++); }  // unvisited vertex starts a new component
        return nextId;
    }

    // ---- construction: build Graph from a (label, label) edge list, ignoring
    // direction entirely (both endpoints get each other appended), neighbour
    // lists kept in alphabetical (insertion) order. ----

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
        for (EdgeIn e : edges) {
            int a = findOrAddVertex(g, e.a), b = findOrAddVertex(g, e.b);
            if (a == b) continue;                 // self-loop: no traversal edge to add
            addNeighbourSorted(g, a, b);
            addNeighbourSorted(g, b, a);           // direction always ignored: mirror both ways
        }
    }

    static void runScenario(String label, EdgeIn[] edges) {
        System.out.println("-- " + label + " --");
        Graph g = new Graph();
        buildGraph(g, edges);

        int total = countComponents(g);

        StringBuilder sb = new StringBuilder("component of each vertex:");
        for (int i = 0; i < g.vertexCount; i++) sb.append(' ').append(g.label[i]).append('=').append(compOf[i]);
        System.out.println(sb);
        System.out.println("total components: " + total);

        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 10 vertices, undirected, 2 components (two separate 5-cycles), 10 edges
        EdgeIn[] normal = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "E"), new EdgeIn("E", "A"),
            new EdgeIn("F", "G"), new EdgeIn("G", "H"), new EdgeIn("H", "I"), new EdgeIn("I", "J"), new EdgeIn("J", "F")
        };
        runScenario("normal: 10 vertices, undirected, 2 components (two separate 5-cycles), 10 edges", normal);

        // hard: 10 vertices, directed, 3 weak components (each a cycle), 10 edges
        EdgeIn[] hard = {
            new EdgeIn("P", "Q"), new EdgeIn("Q", "R"), new EdgeIn("R", "S"), new EdgeIn("S", "P"),
            new EdgeIn("T", "U"), new EdgeIn("U", "V"), new EdgeIn("V", "T"),
            new EdgeIn("W", "X"), new EdgeIn("X", "Y"), new EdgeIn("Y", "W")
        };
        runScenario("hard: 10 vertices, directed, 3 weak components (each a cycle), 10 edges", hard);

        // edge: 12 vertices, undirected, 4 separate triangle components, 12 edges
        EdgeIn[] many = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "A"),
            new EdgeIn("D", "E"), new EdgeIn("E", "F"), new EdgeIn("F", "D"),
            new EdgeIn("G", "H"), new EdgeIn("H", "I"), new EdgeIn("I", "G"),
            new EdgeIn("J", "K"), new EdgeIn("K", "L"), new EdgeIn("L", "J")
        };
        runScenario("edge: 12 vertices, undirected, 4 separate triangle components, 12 edges", many);

        // edge: a single vertex, shown with a self-loop: one component
        EdgeIn[] single = { new EdgeIn("A", "A") };
        runScenario("edge: a single vertex, shown with a self-loop: one component", single);
    }
}
