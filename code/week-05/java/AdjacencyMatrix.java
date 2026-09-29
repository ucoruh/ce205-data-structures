/* Week 5 -- Graphs and Traversals
 * Graph representation: adjacency matrix. Builds a V x V table from an
 * edge list, one edge at a time (undirected mirrors both cells across the
 * diagonal), and prints the whole matrix after every edge is added.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class AdjacencyMatrix {
    static final int MAX_V = 16;

    static int[][] matrix = new int[MAX_V][MAX_V];   // all cells start at 0

    static void addEdge(int a, int b, int weight, boolean directed) {
        matrix[a][b] = weight;      // 1 if the graph is unweighted
        if (!directed)
            matrix[b][a] = weight;  // undirected: mirror across the diagonal
    }

    static class Edge { int a, b, weight; }

    static void buildAdjacencyMatrix(Edge[] edges, int edgeCount, boolean directed) {
        for (int i = 0; i < MAX_V; i++)
            for (int j = 0; j < MAX_V; j++)
                matrix[i][j] = 0;
        for (int k = 0; k < edgeCount; k++)
            addEdge(edges[k].a, edges[k].b, edges[k].weight, directed);
    }

    // ---- construction helpers: turn a (label, label, weight) edge list into
    // the (index, index, weight) Edge array buildAdjacencyMatrix() expects,
    // with vertex indices assigned in alphabetical label order. ----

    static class EdgeIn {
        String a, b;
        int weight;
        EdgeIn(String a, String b, int weight) { this.a = a; this.b = b; this.weight = weight; }
    }

    static int indexOf(String[] labels, int n, String lbl) {
        for (int i = 0; i < n; i++) if (labels[i].equals(lbl)) return i;
        return -1;
    }

    static int collectLabels(EdgeIn[] edges, String[] labels) {
        int count = 0;
        for (EdgeIn e : edges) {
            if (indexOf(labels, count, e.a) < 0) labels[count++] = e.a;
            if (indexOf(labels, count, e.b) < 0) labels[count++] = e.b;
        }
        // simple insertion sort, alphabetical -- matches the vertex order the animation uses
        for (int i = 1; i < count; i++) {
            String key = labels[i];
            int j = i - 1;
            while (j >= 0 && labels[j].compareTo(key) > 0) { labels[j + 1] = labels[j]; j--; }
            labels[j + 1] = key;
        }
        return count;
    }

    static void printMatrix(String[] labels, int n) {
        StringBuilder sb = new StringBuilder("    ");
        for (int j = 0; j < n; j++) sb.append(String.format("%3s", labels[j]));
        System.out.println(sb);
        for (int i = 0; i < n; i++) {
            sb = new StringBuilder(String.format("%3s ", labels[i]));
            for (int j = 0; j < n; j++) sb.append(String.format("%3d", matrix[i][j]));
            System.out.println(sb);
        }
    }

    static void runScenario(String label, boolean directed, EdgeIn[] inEdges) {
        System.out.println("-- " + label + " --");
        String[] labels = new String[MAX_V];
        int v = collectLabels(inEdges, labels);

        Edge[] edges = new Edge[inEdges.length];
        for (int i = 0; i < inEdges.length; i++) {
            edges[i] = new Edge();
            edges[i].a = indexOf(labels, v, inEdges[i].a);
            edges[i].b = indexOf(labels, v, inEdges[i].b);
            edges[i].weight = inEdges[i].weight;
        }

        buildAdjacencyMatrix(null, 0, directed);   // zero the matrix first
        System.out.println(v + " vertices, empty matrix:");
        printMatrix(labels, v);

        for (int k = 0; k < inEdges.length; k++) {
            addEdge(edges[k].a, edges[k].b, edges[k].weight, directed);
            System.out.println("add_edge(" + inEdges[k].a + ", " + inEdges[k].b + ", " + inEdges[k].weight + ")"
                + ((!directed && edges[k].a != edges[k].b) ? " [mirrored]" : ""));
            printMatrix(labels, v);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 7 vertices, undirected, unweighted, 10 edges
        EdgeIn[] normal = {
            new EdgeIn("A", "B", 1), new EdgeIn("B", "C", 1), new EdgeIn("C", "D", 1), new EdgeIn("D", "E", 1),
            new EdgeIn("E", "F", 1), new EdgeIn("F", "G", 1), new EdgeIn("G", "A", 1),
            new EdgeIn("A", "D", 1), new EdgeIn("B", "E", 1), new EdgeIn("C", "F", 1)
        };
        runScenario("normal: 7 vertices, undirected, unweighted, 10 edges", false, normal);

        // hard: 8 vertices, directed, weighted, 10 edges including a reversed pair
        EdgeIn[] hard = {
            new EdgeIn("P", "Q", 3), new EdgeIn("Q", "R", 1), new EdgeIn("R", "S", 4), new EdgeIn("S", "T", 2),
            new EdgeIn("T", "U", 5), new EdgeIn("U", "V", 1), new EdgeIn("V", "W", 3), new EdgeIn("W", "P", 2),
            new EdgeIn("P", "R", 6), new EdgeIn("R", "P", 7)
        };
        runScenario("hard: 8 vertices, directed, weighted, 10 edges including a reversed pair", true, hard);

        // edge: 5 vertices, a complete graph (every pair connected), 10 edges
        EdgeIn[] dense = {
            new EdgeIn("A", "B", 1), new EdgeIn("A", "C", 1), new EdgeIn("A", "D", 1), new EdgeIn("A", "E", 1),
            new EdgeIn("B", "C", 1), new EdgeIn("B", "D", 1), new EdgeIn("B", "E", 1),
            new EdgeIn("C", "D", 1), new EdgeIn("C", "E", 1), new EdgeIn("D", "E", 1)
        };
        runScenario("edge: 5 vertices, a complete graph (every pair connected), 10 edges", false, dense);

        // edge: a single vertex, shown with a self-loop -- a 1x1 matrix
        EdgeIn[] single = { new EdgeIn("A", "A", 1) };
        runScenario("edge: a single vertex, shown with a self-loop -- a 1x1 matrix", false, single);
    }
}
