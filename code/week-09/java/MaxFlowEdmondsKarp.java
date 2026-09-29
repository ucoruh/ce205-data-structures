/* Week 9 -- Graph Algorithms
 * Maximum flow by EDMONDS-KARP: repeatedly BFS the RESIDUAL graph (an edge
 * may still be used if capacity minus flow already sent is positive) for
 * the SHORTEST augmenting path from s to t, push the bottleneck, and repeat
 * until no path remains. Pushing flow forward on an edge also opens
 * capacity on its REVERSE edge.
 * CEN207 Data Structures (formerly CE205)
 */
public class MaxFlowEdmondsKarp {
    static final int MAX_V = 32, INF = 1000000000;

    static String[] label = new String[MAX_V];
    static int vertexCount;
    static int[][] capOf = new int[MAX_V][MAX_V];   // residual capacity; reverse pairs start at 0 unless also a given edge
    static int[] parentOf = new int[MAX_V];

    static boolean bfsAugmentingPath(int vertexCnt, int s, int t) {  // shortest path using capOf > 0 only
        boolean[] visited = new boolean[MAX_V]; int[] queueData = new int[MAX_V]; int front = 0, rear = 0;
        visited[s] = true; queueData[rear] = s; rear++;
        while (front < rear) {
            int u = queueData[front]; front++;
            for (int v = 0; v < vertexCnt; v++)                // alphabetical order
                if (!visited[v] && capOf[u][v] > 0) { visited[v] = true; parentOf[v] = u; queueData[rear] = v; rear++; }
        }
        return visited[t];
    }

    static int edmondsKarp(int vertexCnt, int s, int t) {
        int maxFlow = 0;
        while (bfsAugmentingPath(vertexCnt, s, t)) {
            int bottleneck = INF;
            for (int v = t; v != s; v = parentOf[v]) {
                int u = parentOf[v];
                if (capOf[u][v] < bottleneck) bottleneck = capOf[u][v];
            }
            for (int v = t; v != s; v = parentOf[v]) {
                int u = parentOf[v];
                capOf[u][v] -= bottleneck;                        // use up forward capacity
                capOf[v][u] += bottleneck;                        // open up backward (undo) capacity
            }
            maxFlow += bottleneck;
        }
        return maxFlow;
    }

    static int findOrAddVertex(String lbl) {
        for (int i = 0; i < vertexCount; i++)
            if (label[i].equals(lbl)) return i;
        label[vertexCount] = lbl;
        return vertexCount++;
    }

    static class EdgeIn { String a, b; int cap; EdgeIn(String a, String b, int cap) { this.a = a; this.b = b; this.cap = cap; } }

    static void runScenario(String labelTxt, String sLabel, String tLabel, EdgeIn[] edges) {
        System.out.println("-- " + labelTxt + " --");
        vertexCount = 0;
        for (int i = 0; i < MAX_V; i++) for (int j = 0; j < MAX_V; j++) capOf[i][j] = 0;
        for (EdgeIn e : edges) {
            int a = findOrAddVertex(e.a), b = findOrAddVertex(e.b);
            capOf[a][b] = e.cap;
        }
        int s = findOrAddVertex(sLabel), t = findOrAddVertex(tLabel);

        int maxFlow = edmondsKarp(vertexCount, s, t);
        System.out.println("max flow from " + label[s] + " to " + label[t] + " = " + maxFlow);
        System.out.println();
    }

    public static void main(String[] args) {
        EdgeIn[] normal = {
            new EdgeIn("A", "B", 6), new EdgeIn("A", "C", 4), new EdgeIn("B", "C", 2), new EdgeIn("B", "D", 5),
            new EdgeIn("C", "E", 4), new EdgeIn("D", "E", 1), new EdgeIn("D", "F", 4), new EdgeIn("E", "F", 6),
            new EdgeIn("C", "D", 3), new EdgeIn("A", "D", 2)
        };
        runScenario("normal: 6 vertices, 10 edges, A to F", "A", "F", normal);

        EdgeIn[] hard = {
            new EdgeIn("A", "B", 10), new EdgeIn("A", "C", 8), new EdgeIn("B", "C", 5), new EdgeIn("B", "D", 5),
            new EdgeIn("C", "D", 3), new EdgeIn("C", "E", 6), new EdgeIn("D", "E", 2), new EdgeIn("D", "F", 8),
            new EdgeIn("E", "F", 4), new EdgeIn("E", "G", 6), new EdgeIn("F", "H", 9), new EdgeIn("G", "H", 7),
            new EdgeIn("F", "G", 3), new EdgeIn("B", "E", 4)
        };
        runScenario("hard: 8 vertices, 14 edges, A to H, needs several augmenting paths", "A", "H", hard);

        EdgeIn[] noPath = {
            new EdgeIn("A", "B", 3), new EdgeIn("B", "C", 4), new EdgeIn("A", "C", 2), new EdgeIn("C", "D", 5), new EdgeIn("D", "E", 1),
            new EdgeIn("F", "G", 2), new EdgeIn("G", "H", 6), new EdgeIn("H", "I", 3), new EdgeIn("I", "J", 4), new EdgeIn("F", "J", 1)
        };
        runScenario("edge: A and J are in two separate components -- max flow is 0", "A", "J", noPath);

        EdgeIn[] twoVertices = { new EdgeIn("A", "B", 7) };
        runScenario("edge: 2 vertices, 1 edge", "A", "B", twoVertices);
    }
}
