/* Unit tests for week-09 java/KruskalMst.java */
public class KruskalMstTest {
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
        KruskalMst.Edge[] mst = new KruskalMst.Edge[16];
        int[] total = new int[1];

        KruskalMst.vertexCount = 2;
        checkEq(KruskalMst.kruskalMst(new KruskalMst.Edge[] { new KruskalMst.Edge(0, 1, 5, 0) }, mst, total), 1, "single edge count");
        checkEq(total[0], 5, "single edge total");
        checkEq(mst[0].w, 5, "single edge weight");

        KruskalMst.vertexCount = 3;
        checkEq(KruskalMst.kruskalMst(new KruskalMst.Edge[] {
            new KruskalMst.Edge(0, 1, 1, 0), new KruskalMst.Edge(1, 2, 2, 1), new KruskalMst.Edge(0, 2, 3, 2)
        }, mst, total), 2, "triangle count");
        checkEq(total[0], 3, "triangle total");

        KruskalMst.vertexCount = 3;
        checkEq(KruskalMst.kruskalMst(new KruskalMst.Edge[] {
            new KruskalMst.Edge(0, 2, 3, 0), new KruskalMst.Edge(0, 1, 1, 1), new KruskalMst.Edge(1, 2, 2, 2)
        }, mst, total), 2, "unsorted input count");
        checkEq(total[0], 3, "unsorted input total");

        KruskalMst.vertexCount = 4;
        checkEq(KruskalMst.kruskalMst(new KruskalMst.Edge[] {
            new KruskalMst.Edge(0, 1, 1, 0), new KruskalMst.Edge(1, 2, 2, 1), new KruskalMst.Edge(2, 3, 1, 2),
            new KruskalMst.Edge(3, 0, 4, 3), new KruskalMst.Edge(0, 2, 3, 4)
        }, mst, total), 3, "square+diagonal count");
        checkEq(total[0], 4, "square+diagonal total");

        KruskalMst.vertexCount = 4;
        checkEq(KruskalMst.kruskalMst(new KruskalMst.Edge[] {
            new KruskalMst.Edge(0, 1, 7, 0), new KruskalMst.Edge(2, 3, 2, 1)
        }, mst, total), 2, "disconnected forest count");
        checkEq(total[0], 9, "disconnected forest total");

        KruskalMst.vertexCount = 3;
        checkEq(KruskalMst.kruskalMst(new KruskalMst.Edge[] {
            new KruskalMst.Edge(0, 1, 5, 0), new KruskalMst.Edge(1, 2, 5, 1), new KruskalMst.Edge(0, 2, 5, 2)
        }, mst, total), 2, "tie-break count");
        checkEq(mst[0].a, 0, "tie-break mst[0].a"); checkEq(mst[0].b, 1, "tie-break mst[0].b");
        checkEq(mst[1].a, 1, "tie-break mst[1].a"); checkEq(mst[1].b, 2, "tie-break mst[1].b");

        KruskalMst.vertexCount = 3;
        checkEq(KruskalMst.kruskalMst(new KruskalMst.Edge[0], mst, total), 0, "no edges count");
        checkEq(total[0], 0, "no edges total");

        KruskalMst.vertexCount = 0;
        checkEq(KruskalMst.kruskalMst(new KruskalMst.Edge[0], mst, total), 0, "0 vertices count");
        checkEq(total[0], 0, "0 vertices total");

        KruskalMst.vertexCount = 3;
        checkEq(KruskalMst.kruskalMst(new KruskalMst.Edge[] {
            new KruskalMst.Edge(0, 1, -2, 0), new KruskalMst.Edge(1, 2, 5, 1), new KruskalMst.Edge(0, 2, 5, 2)
        }, mst, total), 2, "negative-weight edge count");
        checkEq(total[0], 3, "negative-weight edge total");        // -2 + 5
        checkEq(mst[0].w, -2, "negative-weight edge picked first");

        KruskalMst.Edge e1 = new KruskalMst.Edge(0, 1, 3, 5), e2 = new KruskalMst.Edge(1, 2, 7, 1), e3 = new KruskalMst.Edge(0, 2, 3, 2);
        check(KruskalMst.cmpWeight(e1, e2) < 0, "cmpWeight lighter first");
        check(KruskalMst.cmpWeight(e2, e1) > 0, "cmpWeight heavier last");
        check(KruskalMst.cmpWeight(e1, e3) > 0, "cmpWeight tie broken by idx");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
