/* Week 9 -- Graph Algorithms
 * Bipartite check by 2-colouring: BFS colours the start vertex 0, every
 * neighbour the OPPOSITE colour, and queues it. If an already-coloured
 * neighbour has the SAME colour, that edge closes an odd cycle -- the graph
 * is not bipartite. One BFS per component.
 * CEN207 Data Structures (formerly CE205)
 */
public class BipartiteCheck {
    static final int MAX_V = 32;

    static class AdjNode { int to; AdjNode next; AdjNode(int to) { this.to = to; } }
    static class Graph {
        String[] label = new String[MAX_V];
        AdjNode[] adj = new AdjNode[MAX_V];
        int vertexCount;
    }

    static int[] colorOf = new int[MAX_V];         // -1 = uncoloured, 0/1 = the two sides
    static int[] queueData = new int[MAX_V]; static int front, rear;

    static void enqueue(int v) { queueData[rear] = v; rear++; }
    static int  dequeue()      { int v = queueData[front]; front++; return v; }

    static boolean isBipartite(Graph g) {
        for (int i = 0; i < g.vertexCount; i++) colorOf[i] = -1;
        for (int s = 0; s < g.vertexCount; s++) {             // alphabetical: one BFS per component
            if (colorOf[s] != -1) continue;
            colorOf[s] = 0; front = rear = 0; enqueue(s);
            while (front < rear) {
                int u = dequeue();
                for (AdjNode n = g.adj[u]; n != null; n = n.next) {  // alphabetical order
                    if (colorOf[n.to] == -1) { colorOf[n.to] = 1 - colorOf[u]; enqueue(n.to); }
                    else if (colorOf[n.to] == colorOf[u]) return false; // same colour -> an odd cycle
                }
            }
        }
        return true;
    }

    // ---- construction: build Graph from a (label, label) UNDIRECTED edge list. ----

    static class EdgeIn { String a, b; EdgeIn(String a, String b) { this.a = a; this.b = b; } }

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
            n.next = g.adj[v]; g.adj[v] = n; return;
        }
        AdjNode cur = g.adj[v];
        while (cur.next != null && g.label[cur.next.to].compareTo(g.label[neighbour]) <= 0) cur = cur.next;
        n.next = cur.next; cur.next = n;
    }

    static void buildGraph(Graph g, EdgeIn[] edges) {
        g.vertexCount = 0;
        for (int i = 0; i < MAX_V; i++) g.adj[i] = null;
        for (EdgeIn e : edges) {
            int a = findOrAddVertex(g, e.a), b = findOrAddVertex(g, e.b);
            if (a == b) continue;
            addNeighbourSorted(g, a, b);
            addNeighbourSorted(g, b, a);
        }
    }

    static void runScenario(String labelTxt, EdgeIn[] edges) {
        System.out.println("-- " + labelTxt + " --");
        Graph g = new Graph();
        buildGraph(g, edges);

        boolean ok = isBipartite(g);
        StringBuilder sb = new StringBuilder("colors:");
        for (int v = 0; v < g.vertexCount; v++) sb.append(' ').append(g.label[v]).append('=').append(colorOf[v]);
        System.out.println(sb);
        System.out.println(ok ? "bipartite" : "NOT bipartite");

        System.out.println();
    }

    public static void main(String[] args) {
        EdgeIn[] normal = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "E"), new EdgeIn("E", "F"),
            new EdgeIn("F", "G"), new EdgeIn("G", "H"), new EdgeIn("H", "A"), new EdgeIn("A", "D"), new EdgeIn("C", "F")
        };
        runScenario("normal: 8 vertices, an even cycle plus 2 safe diagonals, bipartite", normal);

        EdgeIn[] hard = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "E"), new EdgeIn("E", "F"), new EdgeIn("F", "A"), new EdgeIn("A", "D"),
            new EdgeIn("G", "H"), new EdgeIn("H", "I"), new EdgeIn("I", "J"), new EdgeIn("J", "G")
        };
        runScenario("hard: 10 vertices, 2 components, both bipartite", hard);

        EdgeIn[] oddCycle = {
            new EdgeIn("A", "B"), new EdgeIn("B", "C"), new EdgeIn("C", "D"), new EdgeIn("D", "E"), new EdgeIn("E", "A"),
            new EdgeIn("A", "F"), new EdgeIn("F", "G"), new EdgeIn("G", "H"), new EdgeIn("H", "F"), new EdgeIn("B", "F")
        };
        runScenario("edge: A-B-C-D-E-A is a 5-cycle (odd), NOT bipartite", oddCycle);

        EdgeIn[] twoVertices = { new EdgeIn("A", "B") };
        runScenario("edge: 2 vertices, 1 edge", twoVertices);
    }
}
