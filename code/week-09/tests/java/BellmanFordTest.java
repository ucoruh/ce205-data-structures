/* Unit tests for week-09 java/BellmanFord.java */
public class BellmanFordTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static BellmanFord.Graph g;
    static void reset() { g = new BellmanFord.Graph(); g.vertexCount = 0; }
    static void wedge(String a, String b, int w) {
        int x = BellmanFord.findOrAddVertex(g, a), y = BellmanFord.findOrAddVertex(g, b);
        BellmanFord.addNeighbourSorted(g, x, y, w);
    }

    public static void main(String[] args) {
        reset();
        BellmanFord.findOrAddVertex(g, "A");
        check(!BellmanFord.bellmanFord(g, 0), "single vertex no cycle");
        checkEq(BellmanFord.distOf[0], 0, "single vertex dist");

        reset();
        wedge("A", "B", 1); wedge("B", "C", 2); wedge("C", "D", 3);
        check(!BellmanFord.bellmanFord(g, 0), "positive chain no cycle");
        checkEq(BellmanFord.distOf[BellmanFord.findOrAddVertex(g, "D")], 6, "positive chain total");

        reset();
        wedge("A", "B", 5); wedge("A", "C", 2); wedge("C", "B", 1);
        check(!BellmanFord.bellmanFord(g, 0), "negative edge shortcut no cycle");
        checkEq(BellmanFord.distOf[BellmanFord.findOrAddVertex(g, "B")], 3, "negative edge shortcut dist");

        reset();
        wedge("A", "B", 1); wedge("B", "C", 2); wedge("C", "A", -4);
        check(BellmanFord.bellmanFord(g, 0), "classic negative cycle detected");

        reset();
        wedge("A", "B", 1); wedge("B", "C", 1); wedge("C", "A", 1);
        check(!BellmanFord.bellmanFord(g, 0), "positive cycle not flagged");

        reset();
        wedge("A", "B", 1); wedge("B", "C", -1); wedge("C", "A", 0);
        check(!BellmanFord.bellmanFord(g, 0), "zero-sum cycle not flagged");

        reset();
        wedge("A", "B", 1);
        BellmanFord.findOrAddVertex(g, "Z");
        check(!BellmanFord.bellmanFord(g, 0), "unreachable vertex no false cycle");
        checkEq(BellmanFord.distOf[BellmanFord.findOrAddVertex(g, "Z")], BellmanFord.INF, "unreachable stays inf");

        // a negative cycle UNREACHABLE from start is not flagged: detection only follows
        // edges from vertices whose distance is already finite -- a known, teachable limit
        // of single-source Bellman-Ford (Floyd-Warshall's dist[v][v] < 0 check catches it instead)
        reset();
        wedge("A", "B", 3);
        wedge("X", "Y", 1); wedge("Y", "Z", 1); wedge("Z", "X", -3);
        check(!BellmanFord.bellmanFord(g, 0), "unreachable negative cycle not flagged");
        checkEq(BellmanFord.distOf[BellmanFord.findOrAddVertex(g, "B")], 3, "unaffected subgraph dist");
        checkEq(BellmanFord.distOf[BellmanFord.findOrAddVertex(g, "X")], BellmanFord.INF, "isolated cycle unreached");

        reset();
        wedge("A", "B", -5);
        check(!BellmanFord.bellmanFord(g, 0), "self-contained negative edge no cycle");
        checkEq(BellmanFord.distOf[BellmanFord.findOrAddVertex(g, "B")], -5, "self-contained negative edge dist");

        reset();
        wedge("A", "B", 1); wedge("A", "C", 100); wedge("B", "C", -50);
        check(!BellmanFord.bellmanFord(g, 0), "negative edge on best path no cycle");
        checkEq(BellmanFord.distOf[BellmanFord.findOrAddVertex(g, "C")], -49, "negative edge on best path dist");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
