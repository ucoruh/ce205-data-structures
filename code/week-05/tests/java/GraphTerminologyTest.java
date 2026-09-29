/* Unit tests for week-05 java/GraphTerminology.java, mirroring tests/c/test_graph_terminology.c
 * Independent oracle: expected degrees/cycle/component values are hand-traced from the edge list used to
 * build each graph, never obtained by calling outDegree/inDegree/hasCycle/countComponents themselves.
 * countComponents is cross-checked with a separate union-find implementation (a different algorithm from
 * the BFS the program uses). */
public class GraphTerminologyTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static int[] ufParent = new int[GraphTerminology.MAX_V];
    static int ufFind(int x) { while (ufParent[x] != x) x = ufParent[x]; return x; }
    static void ufUnion(int a, int b) { a = ufFind(a); b = ufFind(b); if (a != b) ufParent[a] = b; }

    static int ufCountComponents(GraphTerminology.Graph g, GraphTerminology.EdgeIn[] edges) {
        for (GraphTerminology.EdgeIn e : edges) { GraphTerminology.findOrAddVertex(g, e.a); GraphTerminology.findOrAddVertex(g, e.b); }
        for (int i = 0; i < g.vertexCount; i++) ufParent[i] = i;
        for (GraphTerminology.EdgeIn e : edges) {
            int ia = GraphTerminology.findOrAddVertex(g, e.a), ib = GraphTerminology.findOrAddVertex(g, e.b);
            ufUnion(ia, ib);
        }
        int roots = 0;
        for (int i = 0; i < g.vertexCount; i++) if (ufFind(i) == i) roots++;
        return roots;
    }

    public static void main(String[] args) {
        GraphTerminology.Graph g;

        // -- directed path A->B->C plus an isolated vertex Z: hand-counted in/out degree --
        g = new GraphTerminology.Graph();
        g.directed = true;
        int a = GraphTerminology.findOrAddVertex(g, "A"), b = GraphTerminology.findOrAddVertex(g, "B"), c = GraphTerminology.findOrAddVertex(g, "C");
        int z = GraphTerminology.findOrAddVertex(g, "Z");
        GraphTerminology.append(g, a, b, 1);
        GraphTerminology.append(g, b, c, 1);
        checkEq(GraphTerminology.outDegree(g, a), 1, "outDegree A");
        checkEq(GraphTerminology.outDegree(g, b), 1, "outDegree B");
        checkEq(GraphTerminology.outDegree(g, c), 0, "outDegree C");
        checkEq(GraphTerminology.outDegree(g, z), 0, "outDegree Z");
        checkEq(GraphTerminology.inDegree(g, a), 0, "inDegree A");
        checkEq(GraphTerminology.inDegree(g, b), 1, "inDegree B");
        checkEq(GraphTerminology.inDegree(g, c), 1, "inDegree C");
        checkEq(GraphTerminology.inDegree(g, z), 0, "inDegree Z");

        // -- undirected self-loop: A-A adds ONE edge entry --
        g = new GraphTerminology.Graph();
        GraphTerminology.addEdgeLabelled(g, "A", "A", 1);
        checkEq(GraphTerminology.outDegree(g, 0), 1, "self-loop outDegree");
        check(GraphTerminology.hasCycle(g), "self-loop has cycle");

        // -- undirected multi-edge: A-B added twice -- both endpoints see degree 2 --
        g = new GraphTerminology.Graph();
        GraphTerminology.addEdgeLabelled(g, "A", "B", 1);
        GraphTerminology.addEdgeLabelled(g, "A", "B", 5);
        checkEq(GraphTerminology.outDegree(g, 0), 2, "multi-edge outDegree A");
        checkEq(GraphTerminology.outDegree(g, 1), 2, "multi-edge outDegree B");

        // -- hasCycle: undirected triangle --
        g = new GraphTerminology.Graph();
        GraphTerminology.addEdgeLabelled(g, "A", "B", 1);
        GraphTerminology.addEdgeLabelled(g, "B", "C", 1);
        GraphTerminology.addEdgeLabelled(g, "C", "A", 1);
        check(GraphTerminology.hasCycle(g), "triangle has cycle");

        // -- hasCycle: undirected simple path -- no cycle --
        g = new GraphTerminology.Graph();
        GraphTerminology.addEdgeLabelled(g, "A", "B", 1);
        GraphTerminology.addEdgeLabelled(g, "B", "C", 1);
        check(!GraphTerminology.hasCycle(g), "path has no cycle");

        // -- hasCycle: directed cycle A->B->C->A --
        g = new GraphTerminology.Graph();
        g.directed = true;
        GraphTerminology.addEdgeLabelled(g, "A", "B", 1);
        GraphTerminology.addEdgeLabelled(g, "B", "C", 1);
        GraphTerminology.addEdgeLabelled(g, "C", "A", 1);
        check(GraphTerminology.hasCycle(g), "directed cycle detected");

        // -- hasCycle: directed acyclic path A->B->C --
        g = new GraphTerminology.Graph();
        g.directed = true;
        GraphTerminology.addEdgeLabelled(g, "A", "B", 1);
        GraphTerminology.addEdgeLabelled(g, "B", "C", 1);
        check(!GraphTerminology.hasCycle(g), "directed acyclic path");

        // -- hasCycle / countComponents: empty graph (0 vertices) --
        g = new GraphTerminology.Graph();
        check(!GraphTerminology.hasCycle(g), "empty graph no cycle");
        checkEq(GraphTerminology.countComponents(g, new int[GraphTerminology.MAX_V]), 0, "empty graph 0 components");

        // -- countComponents: two disjoint triangles plus one isolated vertex -- hand count: 3 --
        g = new GraphTerminology.Graph();
        GraphTerminology.addEdgeLabelled(g, "A", "B", 1);
        GraphTerminology.addEdgeLabelled(g, "B", "C", 1);
        GraphTerminology.addEdgeLabelled(g, "C", "A", 1);
        GraphTerminology.addEdgeLabelled(g, "D", "E", 1);
        GraphTerminology.addEdgeLabelled(g, "E", "F", 1);
        GraphTerminology.addEdgeLabelled(g, "F", "D", 1);
        GraphTerminology.findOrAddVertex(g, "Z");
        int[] compOf = new int[GraphTerminology.MAX_V];
        checkEq(GraphTerminology.countComponents(g, compOf), 3, "3 components");
        check(compOf[0] == compOf[1] && compOf[1] == compOf[2], "A,B,C together");
        check(compOf[3] == compOf[4] && compOf[4] == compOf[5], "D,E,F together");
        check(compOf[0] != compOf[3], "different components");
        check(compOf[6] != compOf[0] && compOf[6] != compOf[3], "Z on its own");

        // -- countComponents: single isolated vertex --
        g = new GraphTerminology.Graph();
        GraphTerminology.findOrAddVertex(g, "Solo");
        checkEq(GraphTerminology.countComponents(g, new int[GraphTerminology.MAX_V]), 1, "solo component");

        // -- countComponents: chain of 10 vertices -- connected, 1 component --
        g = new GraphTerminology.Graph();
        String prev = "V1";
        GraphTerminology.findOrAddVertex(g, prev);
        for (int i = 2; i <= 10; i++) {
            String cur = "V" + i;
            GraphTerminology.addEdgeLabelled(g, prev, cur, 1);
            prev = cur;
        }
        checkEq(GraphTerminology.countComponents(g, new int[GraphTerminology.MAX_V]), 1, "chain 1 component");
        check(!GraphTerminology.hasCycle(g), "chain no cycle");

        // -- countComponents cross-checked against an independent union-find on a fresh 12-edge graph --
        GraphTerminology.EdgeIn[] many = {
            new GraphTerminology.EdgeIn("A", "B", 1), new GraphTerminology.EdgeIn("B", "C", 1), new GraphTerminology.EdgeIn("C", "A", 1),
            new GraphTerminology.EdgeIn("D", "E", 1), new GraphTerminology.EdgeIn("E", "F", 1), new GraphTerminology.EdgeIn("F", "D", 1),
            new GraphTerminology.EdgeIn("G", "H", 1), new GraphTerminology.EdgeIn("H", "I", 1), new GraphTerminology.EdgeIn("I", "G", 1),
            new GraphTerminology.EdgeIn("J", "K", 1), new GraphTerminology.EdgeIn("K", "L", 1), new GraphTerminology.EdgeIn("L", "J", 1)
        };
        GraphTerminology.Graph g1 = new GraphTerminology.Graph();
        for (GraphTerminology.EdgeIn e : many) GraphTerminology.addEdgeLabelled(g1, e.a, e.b, e.weight);
        int found = GraphTerminology.countComponents(g1, new int[GraphTerminology.MAX_V]);
        GraphTerminology.Graph g2 = new GraphTerminology.Graph();
        int expected = ufCountComponents(g2, many);
        checkEq(found, expected, "matches independent union-find");
        checkEq(found, 4, "4 triangle components");

        // -- weak connectivity on a DIRECTED graph: two separate directed 3-cycles -- 2 components --
        g = new GraphTerminology.Graph();
        g.directed = true;
        GraphTerminology.addEdgeLabelled(g, "P", "Q", 1);
        GraphTerminology.addEdgeLabelled(g, "Q", "R", 1);
        GraphTerminology.addEdgeLabelled(g, "R", "P", 1);
        GraphTerminology.addEdgeLabelled(g, "X", "Y", 1);
        GraphTerminology.addEdgeLabelled(g, "Y", "Z", 1);
        GraphTerminology.addEdgeLabelled(g, "Z", "X", 1);
        checkEq(GraphTerminology.countComponents(g, new int[GraphTerminology.MAX_V]), 2, "2 weak components (directed)");
        check(GraphTerminology.hasCycle(g), "directed weak-component cycle");

        // -- full boundary: exactly MAX_V (16) vertices in a chain -- must not overflow --
        g = new GraphTerminology.Graph();
        prev = "N1";
        GraphTerminology.findOrAddVertex(g, prev);
        for (int i = 2; i <= GraphTerminology.MAX_V; i++) {
            String cur = "N" + i;
            GraphTerminology.addEdgeLabelled(g, prev, cur, 1);
            prev = cur;
        }
        checkEq(g.vertexCount, GraphTerminology.MAX_V, "full 16 vertices");
        checkEq(GraphTerminology.countComponents(g, new int[GraphTerminology.MAX_V]), 1, "full chain 1 component");
        check(!GraphTerminology.hasCycle(g), "full chain no cycle");

        // -- undirectedNeighbours: direct check of the neighbour list for a mid-degree vertex --
        g = new GraphTerminology.Graph();
        GraphTerminology.addEdgeLabelled(g, "A", "B", 1);
        GraphTerminology.addEdgeLabelled(g, "A", "C", 1);
        GraphTerminology.addEdgeLabelled(g, "A", "D", 1);
        int[] nb = new int[2 * GraphTerminology.MAX_V];
        int n = GraphTerminology.undirectedNeighbours(g, 0, nb);
        checkEq(n, 3, "undirectedNeighbours count");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
