/* Unit tests for week-05 java/ConnectedComponents.java, mirroring tests/c/test_connected_components.c */
public class ConnectedComponentsTest {
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
        // -- bfsLabel, called directly: labels only the reachable component, leaves the rest untouched (-1) --
        {
            ConnectedComponents.EdgeIn[] edges = {
                new ConnectedComponents.EdgeIn("A", "B"), new ConnectedComponents.EdgeIn("B", "C"), new ConnectedComponents.EdgeIn("D", "E")
            };
            ConnectedComponents.Graph g = new ConnectedComponents.Graph();
            ConnectedComponents.buildGraph(g, edges);
            for (int i = 0; i < g.vertexCount; i++) ConnectedComponents.compOf[i] = -1;
            int a = ConnectedComponents.findOrAddVertex(g, "A");
            ConnectedComponents.bfsLabel(g, a, 42);
            checkEq(ConnectedComponents.compOf[ConnectedComponents.findOrAddVertex(g, "A")], 42, "A labelled");
            checkEq(ConnectedComponents.compOf[ConnectedComponents.findOrAddVertex(g, "B")], 42, "B labelled");
            checkEq(ConnectedComponents.compOf[ConnectedComponents.findOrAddVertex(g, "C")], 42, "C labelled");
            checkEq(ConnectedComponents.compOf[ConnectedComponents.findOrAddVertex(g, "D")], -1, "D untouched");
            checkEq(ConnectedComponents.compOf[ConnectedComponents.findOrAddVertex(g, "E")], -1, "E untouched");
        }

        // -- normal: 10 vertices, undirected, 2 components (two separate 5-cycles) --
        {
            ConnectedComponents.EdgeIn[] edges = {
                new ConnectedComponents.EdgeIn("A", "B"), new ConnectedComponents.EdgeIn("B", "C"), new ConnectedComponents.EdgeIn("C", "D"), new ConnectedComponents.EdgeIn("D", "E"), new ConnectedComponents.EdgeIn("E", "A"),
                new ConnectedComponents.EdgeIn("F", "G"), new ConnectedComponents.EdgeIn("G", "H"), new ConnectedComponents.EdgeIn("H", "I"), new ConnectedComponents.EdgeIn("I", "J"), new ConnectedComponents.EdgeIn("J", "F")
            };
            ConnectedComponents.Graph g = new ConnectedComponents.Graph();
            ConnectedComponents.buildGraph(g, edges);
            int total = ConnectedComponents.countComponents(g);
            checkEq(total, 2, "normal total");
            int a = ConnectedComponents.findOrAddVertex(g, "A"), e = ConnectedComponents.findOrAddVertex(g, "E");
            int f = ConnectedComponents.findOrAddVertex(g, "F"), j = ConnectedComponents.findOrAddVertex(g, "J");
            checkEq(ConnectedComponents.compOf[a], ConnectedComponents.compOf[e], "A,E same");
            checkEq(ConnectedComponents.compOf[f], ConnectedComponents.compOf[j], "F,J same");
            check(ConnectedComponents.compOf[a] != ConnectedComponents.compOf[f], "different cycles");
            checkEq(ConnectedComponents.compOf[a], 0, "A starts component 0");
        }

        // -- hard: 10 vertices, DIRECTED, 3 weak components (direction ignored) --
        {
            ConnectedComponents.EdgeIn[] edges = {
                new ConnectedComponents.EdgeIn("P", "Q"), new ConnectedComponents.EdgeIn("Q", "R"), new ConnectedComponents.EdgeIn("R", "S"), new ConnectedComponents.EdgeIn("S", "P"),
                new ConnectedComponents.EdgeIn("T", "U"), new ConnectedComponents.EdgeIn("U", "V"), new ConnectedComponents.EdgeIn("V", "T"),
                new ConnectedComponents.EdgeIn("W", "X"), new ConnectedComponents.EdgeIn("X", "Y"), new ConnectedComponents.EdgeIn("Y", "W")
            };
            ConnectedComponents.Graph g = new ConnectedComponents.Graph();
            ConnectedComponents.buildGraph(g, edges);
            int total = ConnectedComponents.countComponents(g);
            checkEq(total, 3, "hard total");
            int p = ConnectedComponents.findOrAddVertex(g, "P"), s = ConnectedComponents.findOrAddVertex(g, "S");
            int t = ConnectedComponents.findOrAddVertex(g, "T"), w = ConnectedComponents.findOrAddVertex(g, "W");
            checkEq(ConnectedComponents.compOf[p], ConnectedComponents.compOf[s], "P,S same");
            check(ConnectedComponents.compOf[p] != ConnectedComponents.compOf[t], "P!=T");
            check(ConnectedComponents.compOf[t] != ConnectedComponents.compOf[w], "T!=W");
            check(ConnectedComponents.compOf[p] != ConnectedComponents.compOf[w], "P!=W");
        }

        // -- edge: 12 vertices, undirected, 4 separate triangle components --
        {
            ConnectedComponents.EdgeIn[] edges = {
                new ConnectedComponents.EdgeIn("A", "B"), new ConnectedComponents.EdgeIn("B", "C"), new ConnectedComponents.EdgeIn("C", "A"),
                new ConnectedComponents.EdgeIn("D", "E"), new ConnectedComponents.EdgeIn("E", "F"), new ConnectedComponents.EdgeIn("F", "D"),
                new ConnectedComponents.EdgeIn("G", "H"), new ConnectedComponents.EdgeIn("H", "I"), new ConnectedComponents.EdgeIn("I", "G"),
                new ConnectedComponents.EdgeIn("J", "K"), new ConnectedComponents.EdgeIn("K", "L"), new ConnectedComponents.EdgeIn("L", "J")
            };
            ConnectedComponents.Graph g = new ConnectedComponents.Graph();
            ConnectedComponents.buildGraph(g, edges);
            int total = ConnectedComponents.countComponents(g);
            checkEq(total, 4, "triangles total");
            String[] names = {"A","B","C","D","E","F","G","H","I","J","K","L"};
            int[] ids = new int[12];
            for (int i = 0; i < 12; i++) ids[i] = ConnectedComponents.compOf[ConnectedComponents.findOrAddVertex(g, names[i])];
            for (int i = 0; i < 3; i++) checkEq(ids[i], ids[0], "ABC together " + i);
            for (int i = 3; i < 6; i++) checkEq(ids[i], ids[3], "DEF together " + i);
            for (int i = 6; i < 9; i++) checkEq(ids[i], ids[6], "GHI together " + i);
            for (int i = 9; i < 12; i++) checkEq(ids[i], ids[9], "JKL together " + i);
            check(ids[0] != ids[3], "ABC!=DEF");
            check(ids[0] != ids[6], "ABC!=GHI");
            check(ids[0] != ids[9], "ABC!=JKL");
            check(ids[3] != ids[6], "DEF!=GHI");
        }

        // -- edge: a single vertex with a self-loop: one component --
        {
            ConnectedComponents.EdgeIn[] edges = { new ConnectedComponents.EdgeIn("A", "A") };
            ConnectedComponents.Graph g = new ConnectedComponents.Graph();
            ConnectedComponents.buildGraph(g, edges);
            checkEq(g.vertexCount, 1, "single vertex count");
            checkEq(ConnectedComponents.countComponents(g), 1, "single component");
        }

        // -- mixed: a connected pair plus a fully isolated vertex added directly --
        {
            ConnectedComponents.EdgeIn[] edges = { new ConnectedComponents.EdgeIn("A", "B") };
            ConnectedComponents.Graph g = new ConnectedComponents.Graph();
            ConnectedComponents.buildGraph(g, edges);
            int z = ConnectedComponents.findOrAddVertex(g, "Z");
            int total = ConnectedComponents.countComponents(g);
            checkEq(total, 2, "mixed total");
            int a = ConnectedComponents.findOrAddVertex(g, "A"), b = ConnectedComponents.findOrAddVertex(g, "B");
            checkEq(ConnectedComponents.compOf[a], ConnectedComponents.compOf[b], "A,B same");
            check(ConnectedComponents.compOf[a] != ConnectedComponents.compOf[z], "A!=Z");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
