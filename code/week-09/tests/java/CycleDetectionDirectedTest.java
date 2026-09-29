/* Unit tests for week-09 java/CycleDetectionDirected.java */
public class CycleDetectionDirectedTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static CycleDetectionDirected.Graph g;
    static void reset() { g = new CycleDetectionDirected.Graph(); g.vertexCount = 0; }
    static void edge(String a, String b) {
        int x = CycleDetectionDirected.findOrAddVertex(g, a), y = CycleDetectionDirected.findOrAddVertex(g, b);
        CycleDetectionDirected.addNeighbourSorted(g, x, y);
    }

    public static void main(String[] args) {
        reset();
        check(!CycleDetectionDirected.hasCycleDirected(g), "empty no cycle");

        reset();
        CycleDetectionDirected.findOrAddVertex(g, "A");
        check(!CycleDetectionDirected.hasCycleDirected(g), "single no cycle");

        reset();
        edge("A", "B");
        check(!CycleDetectionDirected.hasCycleDirected(g), "one edge no cycle");

        reset();
        edge("A", "B"); edge("B", "A");
        check(CycleDetectionDirected.hasCycleDirected(g), "2-cycle detected");
        checkEq(CycleDetectionDirected.cycleLen, 2, "2-cycle length");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "A");
        check(CycleDetectionDirected.hasCycleDirected(g), "3-cycle detected");
        checkEq(CycleDetectionDirected.cycleLen, 3, "3-cycle length");
        checkEq(CycleDetectionDirected.cycle[0], CycleDetectionDirected.findOrAddVertex(g, "A"), "3-cycle starts at A");

        reset();
        edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("C", "D");
        check(!CycleDetectionDirected.hasCycleDirected(g), "diamond no cycle");

        reset();
        edge("A", "B"); edge("A", "C"); edge("B", "C");
        check(!CycleDetectionDirected.hasCycleDirected(g), "forward edge no cycle");

        reset();
        edge("A", "C"); edge("B", "C"); edge("B", "D");
        check(!CycleDetectionDirected.hasCycleDirected(g), "cross edge no cycle");

        reset();
        edge("A", "B"); edge("X", "Y"); edge("Y", "X");
        check(CycleDetectionDirected.hasCycleDirected(g), "cycle in later component detected");

        reset();
        edge("A", "B"); edge("X", "Y");
        check(!CycleDetectionDirected.hasCycleDirected(g), "disconnected no cycle");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "D"); edge("D", "E"); edge("E", "C");
        check(CycleDetectionDirected.hasCycleDirected(g), "long chain with back edge detected");
        checkEq(CycleDetectionDirected.cycleLen, 3, "long chain cycle length");
        checkEq(CycleDetectionDirected.cycle[0], CycleDetectionDirected.findOrAddVertex(g, "C"), "long chain cycle starts at C");

        reset();
        edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("C", "D"); edge("D", "E");
        edge("C", "F"); edge("E", "G"); edge("F", "G"); edge("G", "H"); edge("B", "E");
        check(!CycleDetectionDirected.hasCycleDirected(g), "large DAG no cycle");

        reset();
        edge("A", "A");
        check(CycleDetectionDirected.hasCycleDirected(g), "self-loop detected");
        checkEq(CycleDetectionDirected.cycleLen, 1, "self-loop cycle length");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
