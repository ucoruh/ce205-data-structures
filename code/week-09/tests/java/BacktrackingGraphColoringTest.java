/* Unit tests for week-09 java/BacktrackingGraphColoring.java */
public class BacktrackingGraphColoringTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static BacktrackingGraphColoring.Graph g;
    static void reset() { g = new BacktrackingGraphColoring.Graph(); g.vertexCount = 0; BacktrackingGraphColoring.curG = g; }
    static void edge(String a, String b) {
        int x = BacktrackingGraphColoring.findOrAddVertex(g, a), y = BacktrackingGraphColoring.findOrAddVertex(g, b);
        if (x == y) return;
        BacktrackingGraphColoring.addNeighbourSorted(g, x, y);
        BacktrackingGraphColoring.addNeighbourSorted(g, y, x);
    }
    static void clearColors() { for (int i = 0; i < g.vertexCount; i++) BacktrackingGraphColoring.colorOf[i] = 0; }

    public static void main(String[] args) {
        reset();
        check(BacktrackingGraphColoring.colorGraph(0, 3), "empty graph trivially colourable");

        reset();
        BacktrackingGraphColoring.findOrAddVertex(g, "A");
        clearColors();
        check(BacktrackingGraphColoring.colorGraph(0, 1), "single vertex k=1 solvable");
        checkEq(BacktrackingGraphColoring.colorOf[0], 1, "single vertex color");

        reset();
        edge("A", "B");
        clearColors();
        check(!BacktrackingGraphColoring.colorGraph(0, 1), "single edge k=1 impossible");

        reset();
        edge("A", "B");
        clearColors();
        check(BacktrackingGraphColoring.colorGraph(0, 2), "single edge k=2 solvable");
        check(BacktrackingGraphColoring.colorOf[0] != BacktrackingGraphColoring.colorOf[1], "single edge different colors");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "A");
        clearColors();
        check(!BacktrackingGraphColoring.colorGraph(0, 2), "triangle k=2 impossible");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "A");
        clearColors();
        check(BacktrackingGraphColoring.colorGraph(0, 3), "triangle k=3 solvable");
        check(BacktrackingGraphColoring.colorOf[0] != BacktrackingGraphColoring.colorOf[1], "triangle A!=B");
        check(BacktrackingGraphColoring.colorOf[1] != BacktrackingGraphColoring.colorOf[2], "triangle B!=C");
        check(BacktrackingGraphColoring.colorOf[0] != BacktrackingGraphColoring.colorOf[2], "triangle A!=C");

        reset();
        edge("A", "B"); edge("A", "C"); edge("A", "D"); edge("B", "C"); edge("B", "D"); edge("C", "D");
        clearColors();
        check(!BacktrackingGraphColoring.colorGraph(0, 3), "K4 k=3 impossible");

        reset();
        edge("A", "B"); edge("A", "C"); edge("A", "D"); edge("B", "C"); edge("B", "D"); edge("C", "D");
        clearColors();
        check(BacktrackingGraphColoring.colorGraph(0, 4), "K4 k=4 solvable");

        reset();
        edge("A", "B");
        clearColors();
        BacktrackingGraphColoring.colorOf[1] = 2;
        check(!BacktrackingGraphColoring.safe(0, 2), "safe rejects neighbour's color");
        check(BacktrackingGraphColoring.safe(0, 1), "safe accepts a free color");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "D"); edge("D", "A");
        clearColors();
        check(BacktrackingGraphColoring.colorGraph(0, 2), "even cycle k=2 solvable");
        checkEq(BacktrackingGraphColoring.colorOf[0], BacktrackingGraphColoring.colorOf[2], "even cycle opposite corners match");
        checkEq(BacktrackingGraphColoring.colorOf[1], BacktrackingGraphColoring.colorOf[3], "even cycle other corners match");

        reset();
        edge("A", "B");
        edge("X", "Y"); edge("Y", "Z"); edge("Z", "X");
        clearColors();
        check(BacktrackingGraphColoring.colorGraph(0, 3), "disconnected graph solvable with k=3");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
