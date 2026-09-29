/* Week 9 -- Graph Algorithms
 * Topological sort by KAHN's algorithm: count every vertex's in-degree, seed
 * a queue with the vertices that have in-degree 0, then repeatedly dequeue
 * one, print it, and decrement its neighbours' in-degree. If a cycle exists,
 * the queue empties before every vertex is placed.
 * CEN207 Data Structures (formerly CE205)
 */
public class TopologicalSortKahn {
    static final int MAX_V = 32;

    static class AdjNode { int to; AdjNode next; AdjNode(int to) { this.to = to; } }
    static class Graph {
        String[] label = new String[MAX_V];
        AdjNode[] adj = new AdjNode[MAX_V];
        int vertexCount;
    }

    static int[] indeg = new int[MAX_V];
    static int[] queueData = new int[MAX_V]; static int front, rear;
    static int[] order = new int[MAX_V]; static int orderLen;

    static void enqueue(int v) { queueData[rear] = v; rear++; }
    static int  dequeue()      { int v = queueData[front]; front++; return v; }

    static boolean topoSortKahn(Graph g) {
        for (int i = 0; i < g.vertexCount; i++) indeg[i] = 0;
        for (int u = 0; u < g.vertexCount; u++)
            for (AdjNode n = g.adj[u]; n != null; n = n.next)
                indeg[n.to]++;
        front = rear = 0; orderLen = 0;
        for (int v = 0; v < g.vertexCount; v++)           // alphabetical order
            if (indeg[v] == 0) enqueue(v);
        while (front < rear) {
            int u = dequeue();
            order[orderLen] = u; orderLen++;
            for (AdjNode n = g.adj[u]; n != null; n = n.next) {  // alphabetical order
                indeg[n.to]--;
                if (indeg[n.to] == 0) enqueue(n.to);
            }
        }
        return orderLen == g.vertexCount;                 // false -> a cycle exists
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
            if (a == b) continue;                       // self-loop: only used to seed a lone vertex
            addNeighbourSorted(g, a, b);
        }
    }

    static void runScenario(String label, EdgeIn[] edges) {
        System.out.println("-- " + label + " --");
        Graph g = new Graph();
        buildGraph(g, edges);

        boolean ok = topoSortKahn(g);
        StringBuilder sb = new StringBuilder("order:");
        for (int i = 0; i < orderLen; i++) sb.append(' ').append(g.label[order[i]]);
        System.out.println(sb);
        if (ok) {
            System.out.println("all " + g.vertexCount + " vertices placed: a valid topological order");
        } else {
            StringBuilder ub = new StringBuilder("only " + orderLen + " of " + g.vertexCount + " vertices placed -- a cycle exists, unplaced:");
            for (int i = 0; i < g.vertexCount; i++) {
                boolean placed = false;
                for (int j = 0; j < orderLen; j++) if (order[j] == i) placed = true;
                if (!placed) ub.append(' ').append(g.label[i]);
            }
            System.out.println(ub);
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
        runScenario("edge: 10 edges but a cycle exists, no full order", cycle);

        EdgeIn[] single = { new EdgeIn("A", "A") };
        runScenario("edge: a single vertex, no edges (self-loop is ignored)", single);
    }
}
