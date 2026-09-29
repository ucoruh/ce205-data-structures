/* Unit tests for week-09 java/BipartiteCheck.java */
public class BipartiteCheckTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static BipartiteCheck.Graph g;
    static void reset() { g = new BipartiteCheck.Graph(); g.vertexCount = 0; }
    static void edge(String a, String b) {
        int x = BipartiteCheck.findOrAddVertex(g, a), y = BipartiteCheck.findOrAddVertex(g, b);
        if (x == y) return;
        BipartiteCheck.addNeighbourSorted(g, x, y);
        BipartiteCheck.addNeighbourSorted(g, y, x);
    }

    public static void main(String[] args) {
        reset();
        check(BipartiteCheck.isBipartite(g), "empty graph vacuously bipartite");

        reset();
        BipartiteCheck.findOrAddVertex(g, "A");
        check(BipartiteCheck.isBipartite(g), "single vertex bipartite");
        checkEq(BipartiteCheck.colorOf[0], 0, "single vertex color");

        reset();
        edge("A", "B");
        check(BipartiteCheck.isBipartite(g), "single edge bipartite");
        check(BipartiteCheck.colorOf[0] != BipartiteCheck.colorOf[1], "single edge opposite colors");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "A");
        check(!BipartiteCheck.isBipartite(g), "triangle not bipartite");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "D"); edge("D", "A");
        check(BipartiteCheck.isBipartite(g), "4-cycle bipartite");
        checkEq(BipartiteCheck.colorOf[0], BipartiteCheck.colorOf[2], "4-cycle opposite corners same color");
        checkEq(BipartiteCheck.colorOf[1], BipartiteCheck.colorOf[3], "4-cycle other corners same color");
        check(BipartiteCheck.colorOf[0] != BipartiteCheck.colorOf[1], "4-cycle adjacent corners differ");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "D"); edge("D", "E"); edge("E", "A");
        check(!BipartiteCheck.isBipartite(g), "5-cycle not bipartite");

        reset();
        edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("B", "E"); edge("C", "F");
        check(BipartiteCheck.isBipartite(g), "tree bipartite");

        reset();
        edge("A", "B");
        edge("X", "Y"); edge("Y", "Z"); edge("Z", "X");
        check(!BipartiteCheck.isBipartite(g), "disconnected with odd cycle not bipartite");

        reset();
        edge("A", "B"); edge("B", "C");
        edge("X", "Y");
        check(BipartiteCheck.isBipartite(g), "disconnected both bipartite");

        reset();
        edge("A", "B"); edge("A", "C"); edge("A", "D"); edge("A", "E");
        check(BipartiteCheck.isBipartite(g), "star bipartite");
        for (int i = 1; i <= 4; i++) check(BipartiteCheck.colorOf[i] != BipartiteCheck.colorOf[0], "star leaf " + i + " opposite color");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "A"); edge("C", "D"); edge("D", "B");
        check(!BipartiteCheck.isBipartite(g), "two triangles sharing edge not bipartite");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
