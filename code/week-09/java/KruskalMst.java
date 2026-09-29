/* Week 9 -- Graph Algorithms
 * Kruskal's minimum spanning tree: sort every edge by weight, then scan it
 * in that order and add it to the tree with UNION-FIND (union by rank +
 * path compression) unless it would close a cycle. Ties keep the input
 * order (an explicit tie-break by original index). If the graph is
 * disconnected, Kruskal still finishes and produces a minimum spanning
 * FOREST.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
import java.util.Arrays;
import java.util.Comparator;

public class KruskalMst {
    static final int MAX_V = 32;

    static class Edge { int a, b, w, idx; Edge(int a, int b, int w, int idx) { this.a = a; this.b = b; this.w = w; this.idx = idx; } }

    static String[] label = new String[MAX_V];
    static int vertexCount;
    static int[] parentOf = new int[MAX_V], rankOf = new int[MAX_V];

    static int findOrAddVertex(String lbl) {
        for (int i = 0; i < vertexCount; i++)
            if (label[i].equals(lbl)) return i;
        label[vertexCount] = lbl;
        return vertexCount++;
    }

    static int find(int v) {
        int root = v;
        while (parentOf[root] != root) root = parentOf[root];
        while (parentOf[v] != root) { int next = parentOf[v]; parentOf[v] = root; v = next; }
        return root;
    }

    static void unionSets(int a, int b) {
        int ra = find(a), rb = find(b);
        if (rankOf[ra] < rankOf[rb]) parentOf[ra] = rb;
        else if (rankOf[ra] > rankOf[rb]) parentOf[rb] = ra;
        else { parentOf[rb] = ra; rankOf[ra]++; }
    }

    static int cmpWeight(Edge x, Edge y) { return x.w != y.w ? x.w - y.w : x.idx - y.idx; }

    static int kruskalMst(Edge[] sorted, Edge[] mstOut, int[] totalOut) {
        for (int v = 0; v < vertexCount; v++) { parentOf[v] = v; rankOf[v] = 0; }
        Arrays.sort(sorted, Comparator.comparingInt((Edge e) -> e.w).thenComparingInt(e -> e.idx));
        int mstLen = 0, total = 0;
        for (Edge e : sorted) {
            if (find(e.a) == find(e.b)) continue;      // would close a cycle
            unionSets(e.a, e.b);
            mstOut[mstLen] = e; mstLen++;
            total += e.w;
        }
        totalOut[0] = total;
        return mstLen;
    }

    static class EdgeIn { String a, b; int w; EdgeIn(String a, String b, int w) { this.a = a; this.b = b; this.w = w; } }

    static void runScenario(String labelTxt, EdgeIn[] edges) {
        System.out.println("-- " + labelTxt + " --");
        vertexCount = 0;
        Edge[] sorted = new Edge[edges.length];
        for (int i = 0; i < edges.length; i++) sorted[i] = new Edge(findOrAddVertex(edges[i].a), findOrAddVertex(edges[i].b), edges[i].w, i);

        Edge[] mst = new Edge[edges.length]; int[] total = new int[1];
        int mstLen = kruskalMst(sorted, mst, total);

        StringBuilder sb = new StringBuilder("MST edges:");
        for (int i = 0; i < mstLen; i++) sb.append(' ').append(label[mst[i].a]).append('-').append(label[mst[i].b]).append(':').append(mst[i].w);
        System.out.println(sb);
        System.out.println("total weight = " + total[0]);

        int roots = 0;
        for (int i = 0; i < vertexCount; i++) if (find(i) == i) roots++;
        System.out.println("components = " + roots + (roots > 1 ? " (a spanning forest)" : ""));
        System.out.println();
    }

    public static void main(String[] args) {
        EdgeIn[] normal = {
            new EdgeIn("A", "B", 4), new EdgeIn("A", "C", 2), new EdgeIn("B", "C", 1), new EdgeIn("B", "D", 5),
            new EdgeIn("C", "D", 8), new EdgeIn("C", "E", 10), new EdgeIn("D", "E", 2), new EdgeIn("D", "F", 6),
            new EdgeIn("E", "F", 3), new EdgeIn("E", "G", 7)
        };
        runScenario("normal: 7 vertices, 10 edges, one component", normal);

        EdgeIn[] hard = {
            new EdgeIn("A", "B", 3), new EdgeIn("A", "C", 3), new EdgeIn("B", "C", 3), new EdgeIn("B", "D", 5),
            new EdgeIn("C", "D", 3), new EdgeIn("C", "E", 6), new EdgeIn("D", "E", 3), new EdgeIn("D", "F", 4),
            new EdgeIn("E", "F", 3), new EdgeIn("F", "G", 2), new EdgeIn("F", "H", 3), new EdgeIn("G", "H", 1),
            new EdgeIn("H", "I", 3), new EdgeIn("G", "I", 5)
        };
        runScenario("hard: 9 vertices, 14 edges, many tied weights (input order breaks ties)", hard);

        EdgeIn[] disconnected = {
            new EdgeIn("A", "B", 2), new EdgeIn("B", "C", 4), new EdgeIn("A", "C", 5), new EdgeIn("C", "D", 1), new EdgeIn("D", "E", 3),
            new EdgeIn("F", "G", 2), new EdgeIn("G", "H", 6), new EdgeIn("F", "H", 7), new EdgeIn("H", "I", 3), new EdgeIn("I", "J", 4)
        };
        runScenario("edge: 10 edges, 2 components -- the result is a spanning FOREST", disconnected);

        EdgeIn[] twoVertices = { new EdgeIn("A", "B", 9) };
        runScenario("edge: 2 vertices, 1 edge", twoVertices);
    }
}
