/* Unit tests for week-09 java/Dijkstra.java */
public class DijkstraTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static Dijkstra.Graph g;
    static void reset() { g = new Dijkstra.Graph(); g.vertexCount = 0; }
    static void wedge(String a, String b, int w) {
        int x = Dijkstra.findOrAddVertex(g, a), y = Dijkstra.findOrAddVertex(g, b);
        Dijkstra.addNeighbourSorted(g, x, y, w);
    }

    public static void main(String[] args) {
        reset();
        Dijkstra.findOrAddVertex(g, "A");
        Dijkstra.dijkstra(g, 0);
        checkEq(Dijkstra.distOf[0], 0, "single vertex dist");

        reset();
        wedge("A", "B", 9);
        Dijkstra.dijkstra(g, 0);
        checkEq(Dijkstra.distOf[1], 9, "one edge dist");

        reset();
        wedge("A", "B", 2); wedge("B", "C", 1); wedge("A", "C", 10);
        Dijkstra.dijkstra(g, 0);
        int c = Dijkstra.findOrAddVertex(g, "C");
        checkEq(Dijkstra.distOf[c], 3, "shortcut beats direct edge");
        checkEq(Dijkstra.parentOf[c], Dijkstra.findOrAddVertex(g, "B"), "shortcut parent is B");

        reset();
        wedge("A", "B", 1);
        Dijkstra.findOrAddVertex(g, "Z");
        Dijkstra.dijkstra(g, 0);
        checkEq(Dijkstra.distOf[Dijkstra.findOrAddVertex(g, "Z")], Dijkstra.INF, "unreachable stays inf");

        reset();
        wedge("A", "B", 0); wedge("B", "C", 5);
        Dijkstra.dijkstra(g, 0);
        checkEq(Dijkstra.distOf[Dijkstra.findOrAddVertex(g, "C")], 5, "zero-weight edge");

        reset();
        wedge("A", "B", 2); wedge("A", "C", 2); wedge("B", "D", 3); wedge("C", "D", 3);
        Dijkstra.dijkstra(g, 0);
        checkEq(Dijkstra.distOf[Dijkstra.findOrAddVertex(g, "D")], 5, "diamond equal paths");

        for (int i = 0; i < Dijkstra.MAX_V; i++) { Dijkstra.distOf[i] = Dijkstra.INF; Dijkstra.done[i] = false; }
        Dijkstra.done[0] = true;
        checkEq(Dijkstra.minDistVertex(1), -1, "minDistVertex all done");

        for (int i = 0; i < Dijkstra.MAX_V; i++) Dijkstra.done[i] = false;
        Dijkstra.distOf[0] = Dijkstra.INF; Dijkstra.distOf[1] = 4; Dijkstra.distOf[2] = Dijkstra.INF;
        checkEq(Dijkstra.minDistVertex(3), 1, "minDistVertex ignores inf");

        reset();
        wedge("A", "B", 1); wedge("B", "C", 2); wedge("C", "D", 3); wedge("D", "E", 4);
        Dijkstra.dijkstra(g, 0);
        int e = Dijkstra.findOrAddVertex(g, "E"), d = Dijkstra.findOrAddVertex(g, "D");
        checkEq(Dijkstra.distOf[e], 10, "chain total distance");
        checkEq(Dijkstra.parentOf[e], d, "chain parent of E is D");
        checkEq(Dijkstra.parentOf[d], Dijkstra.findOrAddVertex(g, "C"), "chain parent of D is C");

        for (int i = 0; i < Dijkstra.MAX_V; i++) { Dijkstra.distOf[i] = Dijkstra.INF; Dijkstra.done[i] = false; }
        checkEq(Dijkstra.minDistVertex(3), -1, "minDistVertex nothing reachable");

        reset();
        wedge("A", "B", 1); wedge("B", "C", 1);
        int b = Dijkstra.findOrAddVertex(g, "B");
        Dijkstra.dijkstra(g, b);
        checkEq(Dijkstra.distOf[b], 0, "start from B: B is 0");
        checkEq(Dijkstra.distOf[Dijkstra.findOrAddVertex(g, "C")], 1, "start from B: C is 1");
        checkEq(Dijkstra.distOf[Dijkstra.findOrAddVertex(g, "A")], Dijkstra.INF, "start from B: A unreachable (directed)");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
