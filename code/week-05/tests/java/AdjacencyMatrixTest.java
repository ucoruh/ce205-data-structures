/* Unit tests for week-05 java/AdjacencyMatrix.java, mirroring tests/c/test_adjacency_matrix.c */
public class AdjacencyMatrixTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) {
        // -- collectLabels: alphabetical order regardless of edge insertion order --
        {
            AdjacencyMatrix.EdgeIn[] edges = {
                new AdjacencyMatrix.EdgeIn("C", "A", 1), new AdjacencyMatrix.EdgeIn("B", "C", 1), new AdjacencyMatrix.EdgeIn("A", "B", 1)
            };
            String[] labels = new String[AdjacencyMatrix.MAX_V];
            int n = AdjacencyMatrix.collectLabels(edges, labels);
            checkEq(n, 3, "collectLabels count");
            check(labels[0].equals("A"), "label 0 = A");
            check(labels[1].equals("B"), "label 1 = B");
            check(labels[2].equals("C"), "label 2 = C");
            checkEq(AdjacencyMatrix.indexOf(labels, n, "B"), 1, "indexOf B");
            checkEq(AdjacencyMatrix.indexOf(labels, n, "Z"), -1, "indexOf not found");
        }

        // -- buildAdjacencyMatrix zeroes stale data from a previous scenario --
        AdjacencyMatrix.matrix[0][0] = 99;
        AdjacencyMatrix.buildAdjacencyMatrix(null, 0, false);
        checkEq(AdjacencyMatrix.matrix[0][0], 0, "zeroed after build");
        boolean allZero = true;
        for (int i = 0; i < AdjacencyMatrix.MAX_V; i++)
            for (int j = 0; j < AdjacencyMatrix.MAX_V; j++)
                if (AdjacencyMatrix.matrix[i][j] != 0) allZero = false;
        check(allZero, "empty input: whole matrix zero");

        // -- addEdge, undirected: mirrors across the diagonal --
        AdjacencyMatrix.buildAdjacencyMatrix(null, 0, false);
        AdjacencyMatrix.addEdge(0, 1, 7, false);
        checkEq(AdjacencyMatrix.matrix[0][1], 7, "undirected [0][1]");
        checkEq(AdjacencyMatrix.matrix[1][0], 7, "undirected [1][0]");

        // -- addEdge, directed: does NOT mirror --
        AdjacencyMatrix.buildAdjacencyMatrix(null, 0, true);
        AdjacencyMatrix.addEdge(0, 1, 7, true);
        checkEq(AdjacencyMatrix.matrix[0][1], 7, "directed [0][1]");
        checkEq(AdjacencyMatrix.matrix[1][0], 0, "directed [1][0] untouched");

        // -- addEdge, self-loop --
        AdjacencyMatrix.buildAdjacencyMatrix(null, 0, false);
        AdjacencyMatrix.addEdge(2, 2, 3, false);
        checkEq(AdjacencyMatrix.matrix[2][2], 3, "self-loop diagonal");

        // -- addEdge, duplicate/overwrite: the later call wins --
        AdjacencyMatrix.buildAdjacencyMatrix(null, 0, false);
        AdjacencyMatrix.addEdge(0, 1, 2, false);
        AdjacencyMatrix.addEdge(0, 1, 9, false);
        checkEq(AdjacencyMatrix.matrix[0][1], 9, "overwrite [0][1]");
        checkEq(AdjacencyMatrix.matrix[1][0], 9, "overwrite [1][0]");

        // -- addEdge, negative weight --
        AdjacencyMatrix.buildAdjacencyMatrix(null, 0, true);
        AdjacencyMatrix.addEdge(0, 1, -5, true);
        checkEq(AdjacencyMatrix.matrix[0][1], -5, "negative weight");

        // -- addEdge, extreme weight (Integer.MAX_VALUE) --
        AdjacencyMatrix.buildAdjacencyMatrix(null, 0, true);
        AdjacencyMatrix.addEdge(0, 1, Integer.MAX_VALUE, true);
        checkEq(AdjacencyMatrix.matrix[0][1], Integer.MAX_VALUE, "extreme weight");

        // -- directed reversed pair: P->Q and Q->P keep independent weights --
        AdjacencyMatrix.buildAdjacencyMatrix(null, 0, true);
        AdjacencyMatrix.addEdge(0, 1, 3, true);
        AdjacencyMatrix.addEdge(1, 0, 5, true);
        checkEq(AdjacencyMatrix.matrix[0][1], 3, "reversed pair [0][1]");
        checkEq(AdjacencyMatrix.matrix[1][0], 5, "reversed pair [1][0]");

        // -- full end-to-end: normal scenario, undirected, unweighted, 10 edges over 7 vertices --
        {
            AdjacencyMatrix.EdgeIn[] inEdges = {
                new AdjacencyMatrix.EdgeIn("A", "B", 1), new AdjacencyMatrix.EdgeIn("B", "C", 1), new AdjacencyMatrix.EdgeIn("C", "D", 1), new AdjacencyMatrix.EdgeIn("D", "E", 1),
                new AdjacencyMatrix.EdgeIn("E", "F", 1), new AdjacencyMatrix.EdgeIn("F", "G", 1), new AdjacencyMatrix.EdgeIn("G", "A", 1),
                new AdjacencyMatrix.EdgeIn("A", "D", 1), new AdjacencyMatrix.EdgeIn("B", "E", 1), new AdjacencyMatrix.EdgeIn("C", "F", 1)
            };
            String[] labels = new String[AdjacencyMatrix.MAX_V];
            int v = AdjacencyMatrix.collectLabels(inEdges, labels);
            checkEq(v, 7, "7 vertices");
            AdjacencyMatrix.Edge[] edges = new AdjacencyMatrix.Edge[10];
            for (int i = 0; i < 10; i++) {
                edges[i] = new AdjacencyMatrix.Edge();
                edges[i].a = AdjacencyMatrix.indexOf(labels, v, inEdges[i].a);
                edges[i].b = AdjacencyMatrix.indexOf(labels, v, inEdges[i].b);
                edges[i].weight = inEdges[i].weight;
            }
            AdjacencyMatrix.buildAdjacencyMatrix(null, 0, false);
            for (int k = 0; k < 10; k++) AdjacencyMatrix.addEdge(edges[k].a, edges[k].b, edges[k].weight, false);

            int[][] expected = {
                {0, 1, 0, 1, 0, 0, 1},
                {1, 0, 1, 0, 1, 0, 0},
                {0, 1, 0, 1, 0, 1, 0},
                {1, 0, 1, 0, 1, 0, 0},
                {0, 1, 0, 1, 0, 1, 0},
                {0, 0, 1, 0, 1, 0, 1},
                {1, 0, 0, 0, 0, 1, 0},
            };
            boolean allMatch = true;
            for (int i = 0; i < 7; i++)
                for (int j = 0; j < 7; j++)
                    if (AdjacencyMatrix.matrix[i][j] != expected[i][j]) allMatch = false;
            check(allMatch, "full matrix matches hand-computed expectation");
            checkEq(AdjacencyMatrix.matrix[0][1], 1, "A-B");
            checkEq(AdjacencyMatrix.matrix[0][2], 0, "A-C not an edge");
        }

        // -- one-vertex, one self-loop edge: a 1x1 matrix --
        {
            AdjacencyMatrix.EdgeIn[] inEdges = { new AdjacencyMatrix.EdgeIn("A", "A", 1) };
            String[] labels = new String[AdjacencyMatrix.MAX_V];
            int v = AdjacencyMatrix.collectLabels(inEdges, labels);
            checkEq(v, 1, "single vertex");
            AdjacencyMatrix.buildAdjacencyMatrix(null, 0, false);
            AdjacencyMatrix.addEdge(0, 0, 1, false);
            checkEq(AdjacencyMatrix.matrix[0][0], 1, "single vertex self-loop");
        }

        // -- two vertices, single directed edge --
        AdjacencyMatrix.buildAdjacencyMatrix(null, 0, true);
        AdjacencyMatrix.addEdge(0, 1, 4, true);
        checkEq(AdjacencyMatrix.matrix[0][1], 4, "two vertices [0][1]");
        checkEq(AdjacencyMatrix.matrix[1][0], 0, "two vertices [1][0]");
        checkEq(AdjacencyMatrix.matrix[1][1], 0, "two vertices [1][1]");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
