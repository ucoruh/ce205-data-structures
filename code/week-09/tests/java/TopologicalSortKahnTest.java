/* Unit tests for week-09 java/TopologicalSortKahn.java */
public class TopologicalSortKahnTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static TopologicalSortKahn.Graph g;
    static void reset() { g = new TopologicalSortKahn.Graph(); g.vertexCount = 0; }
    static void edge(String a, String b) {
        int x = TopologicalSortKahn.findOrAddVertex(g, a), y = TopologicalSortKahn.findOrAddVertex(g, b);
        if (x != y) TopologicalSortKahn.addNeighbourSorted(g, x, y);
    }

    public static void main(String[] args) {
        // -- empty graph: 0 vertices --
        reset();
        check(TopologicalSortKahn.topoSortKahn(g), "empty solvable");
        checkEq(TopologicalSortKahn.orderLen, 0, "empty order length");

        // -- single vertex, no edges --
        reset();
        TopologicalSortKahn.findOrAddVertex(g, "A");
        check(TopologicalSortKahn.topoSortKahn(g), "single solvable");
        checkEq(TopologicalSortKahn.orderLen, 1, "single order length");
        checkEq(TopologicalSortKahn.order[0], 0, "single order[0]");

        // -- single vertex via self-loop (ignored) --
        reset();
        edge("A", "A");
        check(TopologicalSortKahn.topoSortKahn(g), "self-loop solvable");
        checkEq(TopologicalSortKahn.orderLen, 1, "self-loop order length");

        // -- simple chain A>B>C --
        reset();
        edge("A", "B"); edge("B", "C");
        check(TopologicalSortKahn.topoSortKahn(g), "chain solvable");
        checkEq(TopologicalSortKahn.orderLen, 3, "chain order length");
        checkEq(TopologicalSortKahn.order[0], 0, "chain order[0]");
        checkEq(TopologicalSortKahn.order[1], 1, "chain order[1]");
        checkEq(TopologicalSortKahn.order[2], 2, "chain order[2]");

        // -- diamond: A>B, A>C, B>D, C>D -- ties broken alphabetically --
        reset();
        edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("C", "D");
        check(TopologicalSortKahn.topoSortKahn(g), "diamond solvable");
        checkEq(TopologicalSortKahn.orderLen, 4, "diamond order length");
        checkEq(TopologicalSortKahn.order[0], 0, "diamond order[0]");
        checkEq(TopologicalSortKahn.order[1], 1, "diamond order[1]");
        checkEq(TopologicalSortKahn.order[2], 2, "diamond order[2]");
        checkEq(TopologicalSortKahn.order[3], 3, "diamond order[3]");

        // -- 2 disconnected chains: A>B and X>Y -- both fully placed --
        reset();
        edge("A", "B"); edge("X", "Y");
        check(TopologicalSortKahn.topoSortKahn(g), "disconnected solvable");
        checkEq(TopologicalSortKahn.orderLen, 4, "disconnected order length");

        // -- a 3-cycle: A>B>C>A -- unsolvable --
        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "A");
        check(!TopologicalSortKahn.topoSortKahn(g), "3-cycle unsolvable");
        checkEq(TopologicalSortKahn.orderLen, 0, "3-cycle order length");

        // -- cycle with a clean tail: A>B>C>A, C>D --
        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "A"); edge("C", "D");
        check(!TopologicalSortKahn.topoSortKahn(g), "cycle+tail unsolvable");
        checkEq(TopologicalSortKahn.orderLen, 0, "cycle+tail order length");

        // -- duplicated edge A>B twice --
        reset();
        edge("A", "B"); edge("A", "B"); edge("B", "C");
        check(TopologicalSortKahn.topoSortKahn(g), "duplicate edge solvable");
        checkEq(TopologicalSortKahn.orderLen, 3, "duplicate edge order length");

        // -- larger DAG matching the program's "normal" scenario --
        reset();
        edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("C", "D"); edge("D", "E");
        edge("C", "F"); edge("E", "G"); edge("F", "G"); edge("G", "H"); edge("B", "E");
        check(TopologicalSortKahn.topoSortKahn(g), "large DAG solvable");
        checkEq(TopologicalSortKahn.orderLen, 8, "large DAG order length");
        int[] pos = new int[TopologicalSortKahn.MAX_V];
        for (int i = 0; i < TopologicalSortKahn.orderLen; i++) pos[TopologicalSortKahn.order[i]] = i;
        check(pos[TopologicalSortKahn.findOrAddVertex(g, "A")] < pos[TopologicalSortKahn.findOrAddVertex(g, "B")], "A before B");
        check(pos[TopologicalSortKahn.findOrAddVertex(g, "D")] < pos[TopologicalSortKahn.findOrAddVertex(g, "E")], "D before E");
        check(pos[TopologicalSortKahn.findOrAddVertex(g, "G")] < pos[TopologicalSortKahn.findOrAddVertex(g, "H")], "G before H");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
