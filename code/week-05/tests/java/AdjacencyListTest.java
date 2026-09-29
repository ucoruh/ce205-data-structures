/* Unit tests for week-05 java/AdjacencyList.java, mirroring tests/c/test_adjacency_list.c */
public class AdjacencyListTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static int listLen(int v) {
        int n = 0;
        for (AdjacencyList.AdjNode cur = AdjacencyList.adj[v]; cur != null; cur = cur.next) n++;
        return n;
    }
    static boolean listContains(int v, int target, int times) {
        int n = 0;
        for (AdjacencyList.AdjNode cur = AdjacencyList.adj[v]; cur != null; cur = cur.next) if (cur.to == target) n++;
        return n == times;
    }
    static void clearAdj() { for (int i = 0; i < AdjacencyList.MAX_V; i++) AdjacencyList.adj[i] = null; }

    public static void main(String[] args) {
        clearAdj();

        // -- collectLabels: alphabetical order regardless of edge insertion order --
        {
            AdjacencyList.EdgeIn[] edges = {
                new AdjacencyList.EdgeIn("C", "A"), new AdjacencyList.EdgeIn("B", "C"), new AdjacencyList.EdgeIn("A", "B")
            };
            String[] labels = new String[AdjacencyList.MAX_V];
            int n = AdjacencyList.collectLabels(edges, labels);
            checkEq(n, 3, "collectLabels count");
            check(labels[0].equals("A"), "label 0 = A");
            check(labels[1].equals("B"), "label 1 = B");
            check(labels[2].equals("C"), "label 2 = C");
            checkEq(AdjacencyList.indexOf(labels, n, "B"), 1, "indexOf B");
            checkEq(AdjacencyList.indexOf(labels, n, "Z"), -1, "indexOf not found");
        }

        // -- append: single append into an empty list --
        AdjacencyList.append(0, 5);
        check(AdjacencyList.adj[0] != null, "single append not null");
        checkEq(AdjacencyList.adj[0].to, 5, "single append value");
        check(AdjacencyList.adj[0].next == null, "single append next null");
        clearAdj();

        // -- append: preserves INSERTION order (tail-appends, does not sort) --
        AdjacencyList.append(0, 3);
        AdjacencyList.append(0, 1);
        AdjacencyList.append(0, 2);
        checkEq(AdjacencyList.adj[0].to, 3, "order[0]");
        checkEq(AdjacencyList.adj[0].next.to, 1, "order[1]");
        checkEq(AdjacencyList.adj[0].next.next.to, 2, "order[2]");
        check(AdjacencyList.adj[0].next.next.next == null, "order end");
        checkEq(listLen(0), 3, "order length");
        clearAdj();

        // -- addEdge, undirected: appends to BOTH endpoints --
        AdjacencyList.addEdge(0, 1, false);
        checkEq(listLen(0), 1, "undirected len(0)");
        checkEq(listLen(1), 1, "undirected len(1)");
        check(listContains(0, 1, 1), "undirected 0->1");
        check(listContains(1, 0, 1), "undirected 1->0");
        clearAdj();

        // -- addEdge, self-loop: only ONE entry --
        AdjacencyList.addEdge(0, 0, false);
        checkEq(listLen(0), 1, "self-loop len");
        check(listContains(0, 0, 1), "self-loop entry");
        clearAdj();

        // -- addEdge, directed: only the source vertex's list is updated --
        AdjacencyList.addEdge(0, 1, true);
        checkEq(listLen(0), 1, "directed len(0)");
        checkEq(listLen(1), 0, "directed len(1)");
        clearAdj();

        // -- addEdge, duplicate: NOT deduplicated --
        AdjacencyList.addEdge(0, 1, true);
        AdjacencyList.addEdge(0, 1, true);
        checkEq(listLen(0), 2, "duplicate len");
        check(listContains(0, 1, 2), "duplicate both present");
        clearAdj();

        // -- full end-to-end: same normal scenario as AdjacencyMatrix, 7 vertices, 10 undirected edges --
        {
            AdjacencyList.EdgeIn[] inEdges = {
                new AdjacencyList.EdgeIn("A", "B"), new AdjacencyList.EdgeIn("B", "C"), new AdjacencyList.EdgeIn("C", "D"), new AdjacencyList.EdgeIn("D", "E"),
                new AdjacencyList.EdgeIn("E", "F"), new AdjacencyList.EdgeIn("F", "G"), new AdjacencyList.EdgeIn("G", "A"),
                new AdjacencyList.EdgeIn("A", "D"), new AdjacencyList.EdgeIn("B", "E"), new AdjacencyList.EdgeIn("C", "F")
            };
            String[] labels = new String[AdjacencyList.MAX_V];
            int v = AdjacencyList.collectLabels(inEdges, labels);
            checkEq(v, 7, "7 vertices");
            clearAdj();
            for (AdjacencyList.EdgeIn e : inEdges) {
                int ia = AdjacencyList.indexOf(labels, v, e.a), ib = AdjacencyList.indexOf(labels, v, e.b);
                AdjacencyList.addEdge(ia, ib, false);
            }
            checkEq(listLen(0), 3, "A degree 3");
            check(listContains(0, AdjacencyList.indexOf(labels, v, "B"), 1), "A-B");
            check(listContains(0, AdjacencyList.indexOf(labels, v, "G"), 1), "A-G");
            check(listContains(0, AdjacencyList.indexOf(labels, v, "D"), 1), "A-D");
            checkEq(listLen(AdjacencyList.indexOf(labels, v, "G")), 2, "G degree 2 (only F and A)");
            clearAdj();
        }

        // -- one-vertex, one self-loop: a one-vertex list --
        {
            AdjacencyList.EdgeIn[] inEdges = { new AdjacencyList.EdgeIn("A", "A") };
            String[] labels = new String[AdjacencyList.MAX_V];
            int v = AdjacencyList.collectLabels(inEdges, labels);
            checkEq(v, 1, "single vertex");
            clearAdj();
            AdjacencyList.addEdge(0, 0, false);
            checkEq(listLen(0), 1, "single vertex self-loop");
        }
        clearAdj();

        // -- two vertices, single directed edge --
        AdjacencyList.addEdge(0, 1, true);
        checkEq(listLen(0), 1, "two vertices len(0)");
        checkEq(listLen(1), 0, "two vertices len(1)");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
