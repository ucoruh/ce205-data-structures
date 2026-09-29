/* Week 9 -- Graph Algorithms
 * Floyd-Warshall all-pairs shortest paths: an N x N distance matrix, tried
 * as an intermediate stop vertex by vertex. For a fixed k, dist[i][k] and
 * dist[k][j] never change during that pass, so the matrix can be updated in
 * place. A negative diagonal entry dist[v][v] < 0 means v lies on a
 * negative cycle.
 * CEN207 Data Structures (formerly CE205)
 */
public class FloydWarshall {
    static final int MAX_V = 32, INF = 1000000000;

    static String[] label = new String[MAX_V];
    static int vertexCount;
    static int[][] dist = new int[MAX_V][MAX_V];

    static void floydWarshall(int vertexCnt) {
        for (int k = 0; k < vertexCnt; k++) {            // try every vertex as an intermediate stop
            for (int i = 0; i < vertexCnt; i++) {
                for (int j = 0; j < vertexCnt; j++) {
                    if (dist[i][k] == INF || dist[k][j] == INF) continue;    // no path through k
                    int through = dist[i][k] + dist[k][j];
                    if (through < dist[i][j]) dist[i][j] = through;
                }
            }
        }
    }

    static boolean hasNegativeCycle(int vertexCnt) {
        for (int v = 0; v < vertexCnt; v++)
            if (dist[v][v] < 0) return true;              // a path from v back to v got shorter than 0
        return false;
    }

    static int findOrAddVertex(String lbl) {
        for (int i = 0; i < vertexCount; i++)
            if (label[i].equals(lbl)) return i;
        label[vertexCount] = lbl;
        return vertexCount++;
    }

    static class EdgeIn { String a, b; int w; EdgeIn(String a, String b, int w) { this.a = a; this.b = b; this.w = w; } }

    static void runScenario(String labelTxt, EdgeIn[] edges) {
        System.out.println("-- " + labelTxt + " --");
        vertexCount = 0;
        for (EdgeIn e : edges) { findOrAddVertex(e.a); findOrAddVertex(e.b); }

        for (int i = 0; i < vertexCount; i++)
            for (int j = 0; j < vertexCount; j++)
                dist[i][j] = (i == j) ? 0 : INF;
        for (EdgeIn e : edges) {
            int a = findOrAddVertex(e.a), b = findOrAddVertex(e.b);
            if (e.w < dist[a][b]) dist[a][b] = e.w;
        }

        floydWarshall(vertexCount);

        System.out.println("distance matrix:");
        StringBuilder head = new StringBuilder("   ");
        for (int j = 0; j < vertexCount; j++) head.append(String.format(" %3s", label[j]));
        System.out.println(head);
        for (int i = 0; i < vertexCount; i++) {
            StringBuilder row = new StringBuilder(String.format("%3s", label[i]));
            for (int j = 0; j < vertexCount; j++) {
                if (dist[i][j] == INF) row.append(" inf");
                else row.append(String.format(" %3d", dist[i][j]));
            }
            System.out.println(row);
        }

        boolean neg = hasNegativeCycle(vertexCount);
        if (neg) {
            StringBuilder nb = new StringBuilder("negative cycle at:");
            for (int v = 0; v < vertexCount; v++) if (dist[v][v] < 0) nb.append(' ').append(label[v]);
            System.out.println(nb);
        } else {
            System.out.println("no negative cycle");
        }
        System.out.println();
    }

    public static void main(String[] args) {
        EdgeIn[] normal = {
            new EdgeIn("A", "B", 3), new EdgeIn("A", "C", 8), new EdgeIn("A", "E", -4), new EdgeIn("B", "D", 1),
            new EdgeIn("B", "E", 7), new EdgeIn("C", "B", 4), new EdgeIn("D", "A", 2), new EdgeIn("D", "C", -5),
            new EdgeIn("E", "D", 6), new EdgeIn("C", "E", 2)
        };
        runScenario("normal: 5 vertices, 10 edges, negative edges but no negative cycle", normal);

        EdgeIn[] hard = {
            new EdgeIn("A", "B", 2), new EdgeIn("B", "C", 3), new EdgeIn("A", "C", 8), new EdgeIn("C", "D", 1),
            new EdgeIn("D", "B", -2),
            new EdgeIn("X", "Y", 4), new EdgeIn("Y", "Z", 2), new EdgeIn("Z", "X", 1), new EdgeIn("X", "Z", 9),
            new EdgeIn("Y", "X", 5), new EdgeIn("Z", "Y", 3)
        };
        runScenario("hard: 6 vertices, 11 edges, some pairs stay disconnected (distance remains inf)", hard);

        EdgeIn[] negativeCycle = {
            new EdgeIn("A", "B", 1), new EdgeIn("B", "C", 2), new EdgeIn("C", "A", -4), new EdgeIn("A", "D", 3),
            new EdgeIn("D", "E", 2), new EdgeIn("B", "D", 5), new EdgeIn("C", "E", 1), new EdgeIn("D", "A", 6),
            new EdgeIn("E", "B", 2), new EdgeIn("E", "C", 3)
        };
        runScenario("edge: A-B-C-A is a negative cycle, 10 edges", negativeCycle);

        EdgeIn[] twoVertices = { new EdgeIn("A", "B", 5) };
        runScenario("edge: 2 vertices, 1 edge", twoVertices);
    }
}
