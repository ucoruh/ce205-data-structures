/* Unit tests for week-05 java/BfsShortestPath.java, mirroring tests/c/test_bfs_shortest_path.c */
public class BfsShortestPathTest {
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
        // -- normal: 7 vertices, undirected, A to F -- hand-traced: A -> G -> F, length 2 --
        {
            BfsShortestPath.EdgeIn[] edges = {
                new BfsShortestPath.EdgeIn("A", "B"), new BfsShortestPath.EdgeIn("B", "C"), new BfsShortestPath.EdgeIn("C", "D"), new BfsShortestPath.EdgeIn("D", "E"),
                new BfsShortestPath.EdgeIn("E", "F"), new BfsShortestPath.EdgeIn("F", "G"), new BfsShortestPath.EdgeIn("G", "A"),
                new BfsShortestPath.EdgeIn("A", "D"), new BfsShortestPath.EdgeIn("B", "E"), new BfsShortestPath.EdgeIn("C", "F")
            };
            BfsShortestPath.Graph g = new BfsShortestPath.Graph();
            BfsShortestPath.buildGraph(g, false, edges);
            int s = BfsShortestPath.findOrAddVertex(g, "A"), t = BfsShortestPath.findOrAddVertex(g, "F");
            int[] path = new int[BfsShortestPath.MAX_V];
            int len = BfsShortestPath.bfsShortestPath(g, s, t, path);
            checkEq(len, 2, "normal length");
            checkEq(path[0], BfsShortestPath.findOrAddVertex(g, "A"), "normal path[0]");
            checkEq(path[1], BfsShortestPath.findOrAddVertex(g, "G"), "normal path[1]");
            checkEq(path[2], BfsShortestPath.findOrAddVertex(g, "F"), "normal path[2]");
        }

        // -- hard: 8 vertices, directed, P to W -- hand-traced: P -> R -> U -> W, length 3 --
        {
            BfsShortestPath.EdgeIn[] edges = {
                new BfsShortestPath.EdgeIn("P", "Q"), new BfsShortestPath.EdgeIn("P", "R"), new BfsShortestPath.EdgeIn("Q", "S"), new BfsShortestPath.EdgeIn("R", "S"),
                new BfsShortestPath.EdgeIn("S", "T"), new BfsShortestPath.EdgeIn("T", "U"), new BfsShortestPath.EdgeIn("T", "V"), new BfsShortestPath.EdgeIn("U", "W"),
                new BfsShortestPath.EdgeIn("V", "W"), new BfsShortestPath.EdgeIn("Q", "T"), new BfsShortestPath.EdgeIn("R", "U"), new BfsShortestPath.EdgeIn("W", "P")
            };
            BfsShortestPath.Graph g = new BfsShortestPath.Graph();
            BfsShortestPath.buildGraph(g, true, edges);
            int s = BfsShortestPath.findOrAddVertex(g, "P"), t = BfsShortestPath.findOrAddVertex(g, "W");
            int[] path = new int[BfsShortestPath.MAX_V];
            int len = BfsShortestPath.bfsShortestPath(g, s, t, path);
            checkEq(len, 3, "hard length");
            checkEq(path[0], BfsShortestPath.findOrAddVertex(g, "P"), "hard path[0]");
            checkEq(path[1], BfsShortestPath.findOrAddVertex(g, "R"), "hard path[1]");
            checkEq(path[2], BfsShortestPath.findOrAddVertex(g, "U"), "hard path[2]");
            checkEq(path[3], BfsShortestPath.findOrAddVertex(g, "W"), "hard path[3]");
        }

        // -- edge: 9 vertices, NO PATH from A to H --
        {
            BfsShortestPath.EdgeIn[] edges = {
                new BfsShortestPath.EdgeIn("A", "B"), new BfsShortestPath.EdgeIn("B", "C"), new BfsShortestPath.EdgeIn("C", "D"), new BfsShortestPath.EdgeIn("D", "E"),
                new BfsShortestPath.EdgeIn("E", "F"), new BfsShortestPath.EdgeIn("F", "A"), new BfsShortestPath.EdgeIn("A", "D"),
                new BfsShortestPath.EdgeIn("G", "H"), new BfsShortestPath.EdgeIn("H", "I"), new BfsShortestPath.EdgeIn("I", "G")
            };
            BfsShortestPath.Graph g = new BfsShortestPath.Graph();
            BfsShortestPath.buildGraph(g, false, edges);
            int s = BfsShortestPath.findOrAddVertex(g, "A"), t = BfsShortestPath.findOrAddVertex(g, "H");
            int[] path = new int[BfsShortestPath.MAX_V];
            checkEq(BfsShortestPath.bfsShortestPath(g, s, t, path), -1, "no path");
        }

        // -- s == t, multi-vertex graph: length 0 --
        {
            BfsShortestPath.EdgeIn[] edges = { new BfsShortestPath.EdgeIn("A", "B"), new BfsShortestPath.EdgeIn("B", "C") };
            BfsShortestPath.Graph g = new BfsShortestPath.Graph();
            BfsShortestPath.buildGraph(g, false, edges);
            int s = BfsShortestPath.findOrAddVertex(g, "A");
            int[] path = new int[BfsShortestPath.MAX_V];
            int len = BfsShortestPath.bfsShortestPath(g, s, s, path);
            checkEq(len, 0, "s==t length");
            checkEq(path[0], s, "s==t path[0]");
        }

        // -- edge: single vertex with a self-loop, s == t: length 0 --
        {
            BfsShortestPath.EdgeIn[] edges = { new BfsShortestPath.EdgeIn("A", "A") };
            BfsShortestPath.Graph g = new BfsShortestPath.Graph();
            BfsShortestPath.buildGraph(g, false, edges);
            int s = BfsShortestPath.findOrAddVertex(g, "A"), t = BfsShortestPath.findOrAddVertex(g, "A");
            int[] path = new int[BfsShortestPath.MAX_V];
            int len = BfsShortestPath.bfsShortestPath(g, s, t, path);
            checkEq(len, 0, "self-loop length");
            checkEq(path[0], 0, "self-loop path[0]");
        }

        // -- 3 vertices, A-B connected, C isolated: not found --
        {
            BfsShortestPath.EdgeIn[] edges = { new BfsShortestPath.EdgeIn("A", "B") };
            BfsShortestPath.Graph g = new BfsShortestPath.Graph();
            BfsShortestPath.buildGraph(g, false, edges);
            int c = BfsShortestPath.findOrAddVertex(g, "C");
            int s = BfsShortestPath.findOrAddVertex(g, "A");
            int[] path = new int[BfsShortestPath.MAX_V];
            checkEq(BfsShortestPath.bfsShortestPath(g, s, c, path), -1, "isolated not found");
        }

        // -- two vertices, single undirected edge: length 1 --
        {
            BfsShortestPath.EdgeIn[] edges = { new BfsShortestPath.EdgeIn("A", "B") };
            BfsShortestPath.Graph g = new BfsShortestPath.Graph();
            BfsShortestPath.buildGraph(g, false, edges);
            int s = BfsShortestPath.findOrAddVertex(g, "A"), t = BfsShortestPath.findOrAddVertex(g, "B");
            int[] path = new int[BfsShortestPath.MAX_V];
            int len = BfsShortestPath.bfsShortestPath(g, s, t, path);
            checkEq(len, 1, "two-vertex length");
            checkEq(path[0], s, "two-vertex path[0]");
            checkEq(path[1], t, "two-vertex path[1]");
        }

        // -- directed: forward path exists, reverse does not --
        {
            BfsShortestPath.EdgeIn[] edges = { new BfsShortestPath.EdgeIn("A", "B"), new BfsShortestPath.EdgeIn("B", "C") };
            BfsShortestPath.Graph g = new BfsShortestPath.Graph();
            BfsShortestPath.buildGraph(g, true, edges);
            int a = BfsShortestPath.findOrAddVertex(g, "A"), c = BfsShortestPath.findOrAddVertex(g, "C");
            int[] path = new int[BfsShortestPath.MAX_V];
            checkEq(BfsShortestPath.bfsShortestPath(g, a, c, path), 2, "directed forward");
            checkEq(BfsShortestPath.bfsShortestPath(g, c, a, path), -1, "directed reverse unreachable");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
