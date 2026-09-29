/* Unit tests for week-05 java/DfsIterative.java, mirroring tests/c/test_dfs_iterative.c */
public class DfsIterativeTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static boolean orderMatches(DfsIterative.Graph g, String[] expected) {
        if (DfsIterative.orderLen != expected.length) return false;
        for (int i = 0; i < expected.length; i++) if (!g.label[DfsIterative.order[i]].equals(expected[i])) return false;
        return true;
    }

    public static void main(String[] args) {
        // -- push/pop: basic LIFO --
        DfsIterative.top = -1;
        DfsIterative.push(7); DfsIterative.push(8); DfsIterative.push(9);
        checkEq(DfsIterative.pop(), 9, "lifo 1");
        checkEq(DfsIterative.pop(), 8, "lifo 2");
        checkEq(DfsIterative.pop(), 7, "lifo 3");
        checkEq(DfsIterative.top, -1, "lifo top");

        // -- addNeighbourSorted: adjacency row stays ascending regardless of insertion order --
        {
            DfsIterative.Graph g = new DfsIterative.Graph();
            g.vertexCount = 0;
            int v = DfsIterative.findOrAddVertex(g, "V");
            DfsIterative.findOrAddVertex(g, "C");
            DfsIterative.findOrAddVertex(g, "A");
            DfsIterative.findOrAddVertex(g, "B");
            DfsIterative.addNeighbourSorted(g, v, 1);   // "C"
            DfsIterative.addNeighbourSorted(g, v, 3);   // "B"
            DfsIterative.addNeighbourSorted(g, v, 2);   // "A"
            checkEq(g.adjCount[v], 3, "adjCount");
            check(g.label[g.adj[v][0]].equals("A"), "sorted[0]");
            check(g.label[g.adj[v][1]].equals("B"), "sorted[1]");
            check(g.label[g.adj[v][2]].equals("C"), "sorted[2]");
        }

        // -- normal: 7 vertices, undirected -- matches dfs_recursive's preorder --
        {
            DfsIterative.EdgeIn[] edges = {
                new DfsIterative.EdgeIn("A", "B"), new DfsIterative.EdgeIn("B", "C"), new DfsIterative.EdgeIn("C", "D"), new DfsIterative.EdgeIn("D", "E"),
                new DfsIterative.EdgeIn("E", "F"), new DfsIterative.EdgeIn("F", "G"), new DfsIterative.EdgeIn("G", "A"),
                new DfsIterative.EdgeIn("A", "D"), new DfsIterative.EdgeIn("B", "E"), new DfsIterative.EdgeIn("C", "F")
            };
            DfsIterative.Graph g = new DfsIterative.Graph();
            DfsIterative.buildGraph(g, false, edges);
            DfsIterative.top = -1;
            DfsIterative.orderLen = 0;
            DfsIterative.dfs(g);
            check(orderMatches(g, new String[]{"A", "B", "C", "D", "E", "F", "G"}), "normal order");
            for (int i = 0; i < g.vertexCount; i++) check(DfsIterative.visited[i], "normal visited " + i);
        }

        // -- hard: 6 vertices, directed, real branching at D --
        {
            DfsIterative.EdgeIn[] edges = {
                new DfsIterative.EdgeIn("A", "B"), new DfsIterative.EdgeIn("A", "D"), new DfsIterative.EdgeIn("A", "E"),
                new DfsIterative.EdgeIn("B", "C"), new DfsIterative.EdgeIn("C", "A"),
                new DfsIterative.EdgeIn("D", "E"), new DfsIterative.EdgeIn("D", "F"),
                new DfsIterative.EdgeIn("E", "B"), new DfsIterative.EdgeIn("E", "F"), new DfsIterative.EdgeIn("F", "C")
            };
            DfsIterative.Graph g = new DfsIterative.Graph();
            DfsIterative.buildGraph(g, true, edges);
            DfsIterative.top = -1;
            DfsIterative.orderLen = 0;
            DfsIterative.dfs(g);
            check(orderMatches(g, new String[]{"A", "B", "C", "D", "E", "F"}), "hard order");
        }

        // -- edge: 10 vertices, undirected, 2 components (real branching at G and H) -- a DFS FOREST --
        {
            DfsIterative.EdgeIn[] edges = {
                new DfsIterative.EdgeIn("A", "B"), new DfsIterative.EdgeIn("B", "C"), new DfsIterative.EdgeIn("C", "D"), new DfsIterative.EdgeIn("D", "E"), new DfsIterative.EdgeIn("E", "F"),
                new DfsIterative.EdgeIn("G", "H"), new DfsIterative.EdgeIn("H", "I"), new DfsIterative.EdgeIn("I", "G"), new DfsIterative.EdgeIn("G", "J"), new DfsIterative.EdgeIn("H", "J")
            };
            DfsIterative.Graph g = new DfsIterative.Graph();
            DfsIterative.buildGraph(g, false, edges);
            DfsIterative.top = -1;
            DfsIterative.orderLen = 0;
            DfsIterative.dfs(g);
            check(orderMatches(g, new String[]{"A", "B", "C", "D", "E", "F", "G", "H", "I", "J"}), "forest order");
            for (int i = 0; i < g.vertexCount; i++) check(DfsIterative.visited[i], "forest visited " + i);
        }

        // -- edge: a single vertex with a self-loop -- must not infinite-loop --
        {
            DfsIterative.EdgeIn[] edges = { new DfsIterative.EdgeIn("A", "A") };
            DfsIterative.Graph g = new DfsIterative.Graph();
            DfsIterative.buildGraph(g, false, edges);
            checkEq(g.vertexCount, 1, "single vertex count");
            DfsIterative.top = -1;
            DfsIterative.orderLen = 0;
            DfsIterative.dfs(g);
            checkEq(DfsIterative.orderLen, 1, "single order length");
            check(g.label[DfsIterative.order[0]].equals("A"), "single order[0]");
            check(DfsIterative.visited[0], "single visited");
        }

        // -- two vertices, single directed edge --
        {
            DfsIterative.EdgeIn[] edges = { new DfsIterative.EdgeIn("A", "B") };
            DfsIterative.Graph g = new DfsIterative.Graph();
            DfsIterative.buildGraph(g, true, edges);
            DfsIterative.top = -1;
            DfsIterative.orderLen = 0;
            DfsIterative.dfs(g);
            check(orderMatches(g, new String[]{"A", "B"}), "two-vertex order");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
