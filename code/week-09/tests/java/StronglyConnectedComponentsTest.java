/* Unit tests for week-09 java/StronglyConnectedComponents.java */
public class StronglyConnectedComponentsTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static StronglyConnectedComponents.Graph g;
    static void reset() { g = new StronglyConnectedComponents.Graph(); g.vertexCount = 0; }
    static void edge(String a, String b) {
        int x = StronglyConnectedComponents.findOrAddVertex(g, a), y = StronglyConnectedComponents.findOrAddVertex(g, b);
        if (x == y) return;
        StronglyConnectedComponents.addSorted(g, g.adj, x, y);
        StronglyConnectedComponents.addSorted(g, g.adjT, y, x);
    }

    public static void main(String[] args) {
        reset();
        checkEq(StronglyConnectedComponents.kosaraju(g), 0, "empty graph 0 components");

        reset();
        StronglyConnectedComponents.findOrAddVertex(g, "A");
        checkEq(StronglyConnectedComponents.kosaraju(g), 1, "single vertex component count");
        checkEq(StronglyConnectedComponents.compOf[0], 0, "single vertex component id");

        reset();
        edge("A", "B");
        checkEq(StronglyConnectedComponents.kosaraju(g), 2, "one edge two components");
        check(StronglyConnectedComponents.compOf[0] != StronglyConnectedComponents.compOf[1], "one edge different components");

        reset();
        edge("A", "B"); edge("B", "A");
        checkEq(StronglyConnectedComponents.kosaraju(g), 1, "2-cycle one component");
        checkEq(StronglyConnectedComponents.compOf[0], StronglyConnectedComponents.compOf[1], "2-cycle same component");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "A");
        checkEq(StronglyConnectedComponents.kosaraju(g), 1, "3-cycle one component");
        checkEq(StronglyConnectedComponents.compOf[0], StronglyConnectedComponents.compOf[1], "3-cycle A==B");
        checkEq(StronglyConnectedComponents.compOf[1], StronglyConnectedComponents.compOf[2], "3-cycle B==C");

        reset();
        edge("A", "B"); edge("B", "C");
        checkEq(StronglyConnectedComponents.kosaraju(g), 3, "pure DAG every vertex own component");
        check(StronglyConnectedComponents.compOf[0] != StronglyConnectedComponents.compOf[1], "DAG A != B");
        check(StronglyConnectedComponents.compOf[1] != StronglyConnectedComponents.compOf[2], "DAG B != C");

        reset();
        edge("A", "B"); edge("B", "A"); edge("X", "Y"); edge("Y", "X");
        checkEq(StronglyConnectedComponents.kosaraju(g), 2, "two disjoint cycles count");
        checkEq(StronglyConnectedComponents.compOf[0], StronglyConnectedComponents.compOf[1], "disjoint cycle 1 same component");
        int x = StronglyConnectedComponents.findOrAddVertex(g, "X"), y = StronglyConnectedComponents.findOrAddVertex(g, "Y");
        checkEq(StronglyConnectedComponents.compOf[x], StronglyConnectedComponents.compOf[y], "disjoint cycle 2 same component");
        check(StronglyConnectedComponents.compOf[0] != StronglyConnectedComponents.compOf[x], "disjoint cycles different components");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "A"); edge("C", "D");
        checkEq(StronglyConnectedComponents.kosaraju(g), 2, "cycle plus tail count");
        int d = StronglyConnectedComponents.findOrAddVertex(g, "D");
        check(StronglyConnectedComponents.compOf[d] != StronglyConnectedComponents.compOf[0], "tail vertex separate component");

        reset();
        edge("D", "A"); edge("A", "B"); edge("B", "C"); edge("C", "A");
        checkEq(StronglyConnectedComponents.kosaraju(g), 2, "tail into cycle count");

        reset();
        edge("A", "B"); edge("B", "C"); edge("C", "D"); edge("D", "A"); edge("A", "C");
        checkEq(StronglyConnectedComponents.kosaraju(g), 1, "4-cycle with chord one component");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
