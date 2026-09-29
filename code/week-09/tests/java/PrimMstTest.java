/* Unit tests for week-09 java/PrimMst.java */
public class PrimMstTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static PrimMst.Graph g;
    static void reset() { g = new PrimMst.Graph(); g.vertexCount = 0; }
    static void wedge(String a, String b, int w) {
        int x = PrimMst.findOrAddVertex(g, a), y = PrimMst.findOrAddVertex(g, b);
        PrimMst.addNeighbourSorted(g, x, y, w);
        PrimMst.addNeighbourSorted(g, y, x, w);
    }

    public static void main(String[] args) {
        PrimMst.Edge[] mst = new PrimMst.Edge[PrimMst.MAX_V];
        int[] total = new int[1];

        reset();
        PrimMst.findOrAddVertex(g, "A");
        checkEq(PrimMst.primMst(g, 0, mst, total), 0, "single vertex count");
        checkEq(total[0], 0, "single vertex total");

        reset();
        wedge("A", "B", 9);
        checkEq(PrimMst.primMst(g, 0, mst, total), 1, "one edge count");
        checkEq(total[0], 9, "one edge total");
        checkEq(mst[0].w, 9, "one edge weight");

        reset();
        wedge("A", "B", 1); wedge("B", "C", 2); wedge("A", "C", 3);
        checkEq(PrimMst.primMst(g, 0, mst, total), 2, "triangle count");
        checkEq(total[0], 3, "triangle total");

        reset();
        wedge("A", "B", 1); wedge("B", "C", 2); wedge("C", "D", 1); wedge("D", "A", 4); wedge("A", "C", 3);
        checkEq(PrimMst.primMst(g, 0, mst, total), 3, "square+diagonal count");
        checkEq(total[0], 4, "square+diagonal total");

        reset();
        wedge("A", "B", 5);
        wedge("X", "Y", 2);
        checkEq(PrimMst.primMst(g, 0, mst, total), 1, "disconnected count");
        checkEq(total[0], 5, "disconnected total");
        check(!PrimMst.inMst[PrimMst.findOrAddVertex(g, "X")], "X unreached");
        check(!PrimMst.inMst[PrimMst.findOrAddVertex(g, "Y")], "Y unreached");

        reset();
        wedge("A", "B", 6);
        checkEq(PrimMst.keyOf[PrimMst.findOrAddVertex(g, "A")], 0, "start key is 0");

        reset();
        PrimMst.findOrAddVertex(g, "A");
        for (int i = 0; i < PrimMst.MAX_V; i++) { PrimMst.keyOf[i] = PrimMst.INF; PrimMst.inMst[i] = false; }
        PrimMst.inMst[0] = true;
        checkEq(PrimMst.minKeyVertex(1), -1, "minKeyVertex all included");

        for (int i = 0; i < PrimMst.MAX_V; i++) PrimMst.inMst[i] = false;
        PrimMst.keyOf[0] = 7; PrimMst.keyOf[1] = 2; PrimMst.keyOf[2] = 9;
        checkEq(PrimMst.minKeyVertex(3), 1, "minKeyVertex picks smallest");

        PrimMst.keyOf[0] = 4; PrimMst.keyOf[1] = 4; PrimMst.keyOf[2] = 9;
        checkEq(PrimMst.minKeyVertex(3), 0, "minKeyVertex tie by scan order");

        reset();
        wedge("A", "B", 3); wedge("B", "C", 1); wedge("C", "D", 4); wedge("D", "E", 2);
        checkEq(PrimMst.primMst(g, 0, mst, total), 4, "path graph count");
        checkEq(total[0], 10, "path graph total");

        reset();
        wedge("A", "B", -3); wedge("B", "C", 5); wedge("A", "C", 5);
        checkEq(PrimMst.primMst(g, 0, mst, total), 2, "negative-weight edge count");
        checkEq(total[0], 2, "negative-weight edge total");   // -3 + 5
        checkEq(mst[0].w, -3, "negative-weight edge picked first");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
