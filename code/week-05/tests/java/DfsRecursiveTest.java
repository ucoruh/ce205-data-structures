/* Unit tests for week-05 java/DfsRecursive.java, mirroring tests/c/test_dfs_recursive.c */
public class DfsRecursiveTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static int[] preorderOf(DfsRecursive.Graph g) {
        int[] order = new int[g.vertexCount];
        for (int i = 0; i < g.vertexCount; i++) order[i] = i;
        for (int i = 1; i < g.vertexCount; i++) {
            int key = order[i], j = i - 1;
            while (j >= 0 && DfsRecursive.discTime[order[j]] > DfsRecursive.discTime[key]) { order[j + 1] = order[j]; j--; }
            order[j + 1] = key;
        }
        return order;
    }

    public static void main(String[] args) {
        // -- normal: 7 vertices, undirected, one long recursive chain A..G --
        {
            DfsRecursive.EdgeIn[] edges = {
                new DfsRecursive.EdgeIn("A", "B"), new DfsRecursive.EdgeIn("B", "C"), new DfsRecursive.EdgeIn("C", "D"), new DfsRecursive.EdgeIn("D", "E"),
                new DfsRecursive.EdgeIn("E", "F"), new DfsRecursive.EdgeIn("F", "G"), new DfsRecursive.EdgeIn("G", "A"),
                new DfsRecursive.EdgeIn("A", "D"), new DfsRecursive.EdgeIn("B", "E"), new DfsRecursive.EdgeIn("C", "F")
            };
            DfsRecursive.Graph g = new DfsRecursive.Graph();
            DfsRecursive.buildGraph(g, false, edges);
            DfsRecursive.clock_ = 0;
            DfsRecursive.dfs(g);
            int A = DfsRecursive.findOrAddVertex(g, "A"), B = DfsRecursive.findOrAddVertex(g, "B"), C = DfsRecursive.findOrAddVertex(g, "C");
            int D = DfsRecursive.findOrAddVertex(g, "D"), E = DfsRecursive.findOrAddVertex(g, "E"), F = DfsRecursive.findOrAddVertex(g, "F");
            int G = DfsRecursive.findOrAddVertex(g, "G");
            checkEq(DfsRecursive.discTime[A], 1, "disc A"); checkEq(DfsRecursive.finTime[A], 14, "fin A");
            checkEq(DfsRecursive.discTime[B], 2, "disc B"); checkEq(DfsRecursive.finTime[B], 13, "fin B");
            checkEq(DfsRecursive.discTime[C], 3, "disc C"); checkEq(DfsRecursive.finTime[C], 12, "fin C");
            checkEq(DfsRecursive.discTime[D], 4, "disc D"); checkEq(DfsRecursive.finTime[D], 11, "fin D");
            checkEq(DfsRecursive.discTime[E], 5, "disc E"); checkEq(DfsRecursive.finTime[E], 10, "fin E");
            checkEq(DfsRecursive.discTime[F], 6, "disc F"); checkEq(DfsRecursive.finTime[F], 9, "fin F");
            checkEq(DfsRecursive.discTime[G], 7, "disc G"); checkEq(DfsRecursive.finTime[G], 8, "fin G");
            checkEq(DfsRecursive.parentOf[B], A, "parent B"); checkEq(DfsRecursive.parentOf[C], B, "parent C"); checkEq(DfsRecursive.parentOf[D], C, "parent D");
            checkEq(DfsRecursive.parentOf[E], D, "parent E"); checkEq(DfsRecursive.parentOf[F], E, "parent F"); checkEq(DfsRecursive.parentOf[G], F, "parent G");
            int[] order = preorderOf(g);
            int[] expectedOrder = {A, B, C, D, E, F, G};
            boolean orderOk = true;
            for (int i = 0; i < 7; i++) if (order[i] != expectedOrder[i]) orderOk = false;
            check(orderOk, "normal preorder");
            for (int i = 0; i < g.vertexCount; i++) checkEq(DfsRecursive.colorOf[i], 2, "black " + i);
        }

        // -- hard: 6 vertices, directed, tree/back/forward/cross edges all present --
        {
            DfsRecursive.EdgeIn[] edges = {
                new DfsRecursive.EdgeIn("A", "B"), new DfsRecursive.EdgeIn("A", "D"), new DfsRecursive.EdgeIn("A", "E"),
                new DfsRecursive.EdgeIn("B", "C"), new DfsRecursive.EdgeIn("C", "A"),
                new DfsRecursive.EdgeIn("D", "E"), new DfsRecursive.EdgeIn("D", "F"),
                new DfsRecursive.EdgeIn("E", "B"), new DfsRecursive.EdgeIn("E", "F"), new DfsRecursive.EdgeIn("F", "C")
            };
            DfsRecursive.Graph g = new DfsRecursive.Graph();
            DfsRecursive.buildGraph(g, true, edges);
            DfsRecursive.clock_ = 0;
            DfsRecursive.dfs(g);
            int A = DfsRecursive.findOrAddVertex(g, "A"), B = DfsRecursive.findOrAddVertex(g, "B"), C = DfsRecursive.findOrAddVertex(g, "C");
            int D = DfsRecursive.findOrAddVertex(g, "D"), E = DfsRecursive.findOrAddVertex(g, "E"), F = DfsRecursive.findOrAddVertex(g, "F");
            checkEq(DfsRecursive.discTime[A], 1, "disc A2");  checkEq(DfsRecursive.finTime[A], 12, "fin A2");
            checkEq(DfsRecursive.discTime[B], 2, "disc B2");  checkEq(DfsRecursive.finTime[B], 5, "fin B2");
            checkEq(DfsRecursive.discTime[C], 3, "disc C2");  checkEq(DfsRecursive.finTime[C], 4, "fin C2");
            checkEq(DfsRecursive.discTime[D], 6, "disc D2");  checkEq(DfsRecursive.finTime[D], 11, "fin D2");
            checkEq(DfsRecursive.discTime[E], 7, "disc E2");  checkEq(DfsRecursive.finTime[E], 10, "fin E2");
            checkEq(DfsRecursive.discTime[F], 8, "disc F2");  checkEq(DfsRecursive.finTime[F], 9, "fin F2");
            checkEq(DfsRecursive.parentOf[B], A, "parent B2"); checkEq(DfsRecursive.parentOf[C], B, "parent C2"); checkEq(DfsRecursive.parentOf[D], A, "parent D2");
            checkEq(DfsRecursive.parentOf[E], D, "parent E2"); checkEq(DfsRecursive.parentOf[F], E, "parent F2");
            int[] order = preorderOf(g);
            int[] expectedOrder = {A, B, C, D, E, F};
            boolean orderOk = true;
            for (int i = 0; i < 6; i++) if (order[i] != expectedOrder[i]) orderOk = false;
            check(orderOk, "hard preorder");
        }

        // -- edge: 10 vertices, undirected, 2 components -- a DFS FOREST --
        {
            DfsRecursive.EdgeIn[] edges = {
                new DfsRecursive.EdgeIn("A", "B"), new DfsRecursive.EdgeIn("B", "C"), new DfsRecursive.EdgeIn("C", "D"), new DfsRecursive.EdgeIn("D", "E"), new DfsRecursive.EdgeIn("E", "F"),
                new DfsRecursive.EdgeIn("G", "H"), new DfsRecursive.EdgeIn("H", "I"), new DfsRecursive.EdgeIn("I", "G"), new DfsRecursive.EdgeIn("G", "J"), new DfsRecursive.EdgeIn("H", "J")
            };
            DfsRecursive.Graph g = new DfsRecursive.Graph();
            DfsRecursive.buildGraph(g, false, edges);
            DfsRecursive.clock_ = 0;
            DfsRecursive.dfs(g);
            int A = DfsRecursive.findOrAddVertex(g, "A"), F = DfsRecursive.findOrAddVertex(g, "F");
            int G = DfsRecursive.findOrAddVertex(g, "G"), H = DfsRecursive.findOrAddVertex(g, "H");
            int I = DfsRecursive.findOrAddVertex(g, "I"), J = DfsRecursive.findOrAddVertex(g, "J");
            checkEq(DfsRecursive.discTime[A], 1, "disc A3");  checkEq(DfsRecursive.finTime[A], 12, "fin A3");
            checkEq(DfsRecursive.discTime[F], 6, "disc F3");  checkEq(DfsRecursive.finTime[F], 7, "fin F3");
            checkEq(DfsRecursive.discTime[G], 13, "disc G3"); checkEq(DfsRecursive.finTime[G], 20, "fin G3");
            checkEq(DfsRecursive.discTime[H], 14, "disc H3"); checkEq(DfsRecursive.finTime[H], 19, "fin H3");
            checkEq(DfsRecursive.discTime[I], 15, "disc I3"); checkEq(DfsRecursive.finTime[I], 16, "fin I3");
            checkEq(DfsRecursive.discTime[J], 17, "disc J3"); checkEq(DfsRecursive.finTime[J], 18, "fin J3");
            checkEq(DfsRecursive.parentOf[H], G, "parent H3");
            checkEq(DfsRecursive.parentOf[I], H, "parent I3");
            checkEq(DfsRecursive.parentOf[J], H, "parent J3");
            int[] order = preorderOf(g);
            String[] expectedLabels = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J"};
            boolean orderOk = true;
            for (int i = 0; i < 10; i++) if (!g.label[order[i]].equals(expectedLabels[i])) orderOk = false;
            check(orderOk, "forest preorder");
            for (int i = 0; i < g.vertexCount; i++) checkEq(DfsRecursive.colorOf[i], 2, "black3 " + i);
        }

        // -- edge: a single vertex with a self-loop -- must classify as BACK and terminate --
        {
            DfsRecursive.EdgeIn[] edges = { new DfsRecursive.EdgeIn("A", "A") };
            DfsRecursive.Graph g = new DfsRecursive.Graph();
            DfsRecursive.buildGraph(g, false, edges);
            checkEq(g.vertexCount, 1, "single vertex count");
            DfsRecursive.clock_ = 0;
            DfsRecursive.dfs(g);
            checkEq(DfsRecursive.discTime[0], 1, "single disc");
            checkEq(DfsRecursive.finTime[0], 2, "single fin");
            checkEq(DfsRecursive.colorOf[0], 2, "single black");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
