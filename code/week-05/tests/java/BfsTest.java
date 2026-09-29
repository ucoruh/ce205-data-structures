/* Unit tests for week-05 java/Bfs.java, mirroring tests/c/test_bfs.c */
public class BfsTest {
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
        // -- enqueue/dequeue: basic FIFO --
        Bfs.front = Bfs.rear = Bfs.count = 0;
        Bfs.enqueue(10); Bfs.enqueue(20); Bfs.enqueue(30);
        checkEq(Bfs.dequeue(), 10, "fifo 1");
        checkEq(Bfs.dequeue(), 20, "fifo 2");
        checkEq(Bfs.dequeue(), 30, "fifo 3");
        checkEq(Bfs.count, 0, "fifo count 0");

        // -- enqueue/dequeue: circular wraparound past MAX_V --
        Bfs.front = Bfs.rear = 30; Bfs.count = 0;   // MAX_V == 32: rear will wrap 30,31,0,1,2
        Bfs.enqueue(100); Bfs.enqueue(101); Bfs.enqueue(102); Bfs.enqueue(103); Bfs.enqueue(104);
        checkEq(Bfs.rear, 3, "wraparound rear");
        checkEq(Bfs.dequeue(), 100, "wrap 1");
        checkEq(Bfs.dequeue(), 101, "wrap 2");
        checkEq(Bfs.dequeue(), 102, "wrap 3");
        checkEq(Bfs.dequeue(), 103, "wrap 4");
        checkEq(Bfs.dequeue(), 104, "wrap 5");
        checkEq(Bfs.count, 0, "wrap count 0");

        // -- normal: 7 vertices, undirected, start A -- hand-traced BFS levels --
        {
            Bfs.EdgeIn[] edges = {
                new Bfs.EdgeIn("A", "B"), new Bfs.EdgeIn("B", "C"), new Bfs.EdgeIn("C", "D"), new Bfs.EdgeIn("D", "E"),
                new Bfs.EdgeIn("E", "F"), new Bfs.EdgeIn("F", "G"), new Bfs.EdgeIn("G", "A"),
                new Bfs.EdgeIn("A", "D"), new Bfs.EdgeIn("B", "E"), new Bfs.EdgeIn("C", "F")
            };
            Bfs.Graph g = new Bfs.Graph();
            Bfs.buildGraph(g, false, edges);
            int start = Bfs.findOrAddVertex(g, "A");
            Bfs.front = Bfs.rear = Bfs.count = 0;
            Bfs.bfs(g, start);
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "A")], 0, "level A");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "B")], 1, "level B");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "D")], 1, "level D");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "G")], 1, "level G");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "C")], 2, "level C");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "E")], 2, "level E");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "F")], 2, "level F");
            for (int i = 0; i < g.vertexCount; i++) check(Bfs.visited[i], "all reached normal " + i);
        }

        // -- hard: 8 vertices, DIRECTED, start P -- hand-traced BFS levels, only forward edges followed --
        {
            Bfs.EdgeIn[] edges = {
                new Bfs.EdgeIn("P", "Q"), new Bfs.EdgeIn("P", "R"), new Bfs.EdgeIn("Q", "S"), new Bfs.EdgeIn("R", "S"),
                new Bfs.EdgeIn("S", "T"), new Bfs.EdgeIn("T", "U"), new Bfs.EdgeIn("T", "V"), new Bfs.EdgeIn("U", "W"),
                new Bfs.EdgeIn("V", "W"), new Bfs.EdgeIn("Q", "T"), new Bfs.EdgeIn("R", "U"), new Bfs.EdgeIn("W", "P")
            };
            Bfs.Graph g = new Bfs.Graph();
            Bfs.buildGraph(g, true, edges);
            int start = Bfs.findOrAddVertex(g, "P");
            Bfs.front = Bfs.rear = Bfs.count = 0;
            Bfs.bfs(g, start);
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "P")], 0, "level P");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "Q")], 1, "level Q");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "R")], 1, "level R");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "S")], 2, "level S");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "T")], 2, "level T");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "U")], 2, "level U");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "V")], 3, "level V");
            checkEq(Bfs.levelOf[Bfs.findOrAddVertex(g, "W")], 3, "level W");
            for (int i = 0; i < g.vertexCount; i++) check(Bfs.visited[i], "all reached hard " + i);
        }

        // -- edge: 9 vertices, 2 components -- G, H, I never visited from A --
        {
            Bfs.EdgeIn[] edges = {
                new Bfs.EdgeIn("A", "B"), new Bfs.EdgeIn("B", "C"), new Bfs.EdgeIn("C", "D"), new Bfs.EdgeIn("D", "E"),
                new Bfs.EdgeIn("E", "F"), new Bfs.EdgeIn("F", "A"), new Bfs.EdgeIn("A", "D"),
                new Bfs.EdgeIn("G", "H"), new Bfs.EdgeIn("H", "I"), new Bfs.EdgeIn("I", "G")
            };
            Bfs.Graph g = new Bfs.Graph();
            Bfs.buildGraph(g, false, edges);
            int start = Bfs.findOrAddVertex(g, "A");
            Bfs.front = Bfs.rear = Bfs.count = 0;
            Bfs.bfs(g, start);
            check(Bfs.visited[Bfs.findOrAddVertex(g, "A")], "A reached");
            check(Bfs.visited[Bfs.findOrAddVertex(g, "F")], "F reached");
            check(!Bfs.visited[Bfs.findOrAddVertex(g, "G")], "G unreached");
            check(!Bfs.visited[Bfs.findOrAddVertex(g, "H")], "H unreached");
            check(!Bfs.visited[Bfs.findOrAddVertex(g, "I")], "I unreached");
        }

        // -- edge: single vertex with a self-loop --
        {
            Bfs.EdgeIn[] edges = { new Bfs.EdgeIn("A", "A") };
            Bfs.Graph g = new Bfs.Graph();
            Bfs.buildGraph(g, false, edges);
            checkEq(g.vertexCount, 1, "single vertex count");
            int start = Bfs.findOrAddVertex(g, "A");
            Bfs.front = Bfs.rear = Bfs.count = 0;
            Bfs.bfs(g, start);
            checkEq(Bfs.levelOf[0], 0, "single vertex level");
            check(Bfs.visited[0], "single vertex visited");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
