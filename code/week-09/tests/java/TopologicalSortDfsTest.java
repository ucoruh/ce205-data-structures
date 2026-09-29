/* Unit tests for week-09 java/TopologicalSortDfs.java */
public class TopologicalSortDfsTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static TopologicalSortDfs.Graph g;
    static void reset() { g = new TopologicalSortDfs.Graph(); g.vertexCount = 0; }
    static void edge(String a, String b) {
        int x = TopologicalSortDfs.findOrAddVertex(g, a), y = TopologicalSortDfs.findOrAddVertex(g, b);
        if (x != y) TopologicalSortDfs.addNeighbourSorted(g, x, y);
    }

    public static void main(String[] args) {
        reset();
        TopologicalSortDfs.topoSortDfs(g);
        checkEq(TopologicalSortDfs.finishLen, 0, "empty finish length");
        check(!TopologicalSortDfs.hasCycle, "empty no cycle");

        reset();
        TopologicalSortDfs.findOrAddVertex(g, "A");
        TopologicalSortDfs.topoSortDfs(g);
        checkEq(TopologicalSortDfs.finishLen, 1, "single finish length");
        check(!TopologicalSortDfs.hasCycle, "single no cycle");

        reset();
        edge("A", "A");
        TopologicalSortDfs.topoSortDfs(g);
        checkEq(TopologicalSortDfs.finishLen, 1, "self-loop finish length");
        check(!TopologicalSortDfs.hasCycle, "self-loop no cycle");

        reset();
        edge("A", "B"); edge("B", "C");
        TopologicalSortDfs.topoSortDfs(g);
        check(!TopologicalSortDfs.hasCycle, "chain no cycle");
        checkEq(TopologicalSortDfs.finishLen, 3, "chain finish length");
        checkEq(TopologicalSortDfs.finish[0], 2, "chain finish[0]");
        checkEq(TopologicalSortDfs.finish[1], 1, "chain finish[1]");
        checkEq(TopologicalSortDfs.finish[2], 0, "chain finish[2]");

        reset();
        edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("C", "D");
        TopologicalSortDfs.topoSortDfs(g);
        check(!TopologicalSortDfs.hasCycle, "diamond no cycle");
        checkEq(TopologicalSortDfs.finish[TopologicalSortDfs.finishLen - 1], 0, "diamond A last to finish");
        checkEq(TopologicalSortDfs.finish[0], 3, "diamond D first to finish");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "A");
        TopologicalSortDfs.topoSortDfs(g);
        check(TopologicalSortDfs.hasCycle, "3-cycle detected");

        reset();
        edge("A", "B"); edge("B", "A");
        TopologicalSortDfs.topoSortDfs(g);
        check(TopologicalSortDfs.hasCycle, "2-cycle detected");

        reset();
        edge("A", "B"); edge("A", "C"); edge("B", "C");
        TopologicalSortDfs.topoSortDfs(g);
        check(!TopologicalSortDfs.hasCycle, "shared descendant no cycle");

        reset();
        edge("A", "B"); edge("X", "Y");
        TopologicalSortDfs.topoSortDfs(g);
        check(!TopologicalSortDfs.hasCycle, "disconnected no cycle");
        checkEq(TopologicalSortDfs.finishLen, 4, "disconnected finish length");

        reset();
        edge("A", "B"); edge("B", "C"); edge("A", "C");
        TopologicalSortDfs.topoSortDfs(g);
        check(!TopologicalSortDfs.hasCycle, "forward edge no cycle");
        checkEq(TopologicalSortDfs.finishLen, 3, "forward edge finish length");

        reset();
        edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("C", "D"); edge("D", "E");
        edge("C", "F"); edge("E", "G"); edge("F", "G"); edge("G", "H"); edge("B", "E");
        TopologicalSortDfs.topoSortDfs(g);
        check(!TopologicalSortDfs.hasCycle, "large DAG no cycle");
        checkEq(TopologicalSortDfs.finishLen, 8, "large DAG finish length");
        int[] pos = new int[TopologicalSortDfs.MAX_V];
        for (int i = 0; i < TopologicalSortDfs.finishLen; i++) pos[TopologicalSortDfs.finish[TopologicalSortDfs.finishLen - 1 - i]] = i;
        check(pos[TopologicalSortDfs.findOrAddVertex(g, "A")] < pos[TopologicalSortDfs.findOrAddVertex(g, "B")], "A before B");
        check(pos[TopologicalSortDfs.findOrAddVertex(g, "G")] < pos[TopologicalSortDfs.findOrAddVertex(g, "H")], "G before H");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
