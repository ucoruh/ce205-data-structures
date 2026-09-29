/* Week 9 -- Graph Algorithms
 * Disjoint-set union-find with UNION BY RANK and PATH COMPRESSION. A
 * sequence of operations is replayed: "union A B" merges the sets
 * containing A and B; "find A" finds A's root and compresses the path from
 * A to it.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class UnionFind {
    static final int MAX_V = 32;

    static String[] label = new String[MAX_V];
    static int vertexCount;
    static int[] parentOf = new int[MAX_V], rankOf = new int[MAX_V];

    static int findOrAddVertex(String lbl) {
        for (int i = 0; i < vertexCount; i++)
            if (label[i].equals(lbl)) return i;
        label[vertexCount] = lbl;
        return vertexCount++;
    }

    static void makeSet(int v) { parentOf[v] = v; rankOf[v] = 0; }

    static int find(int v) {
        int root = v;
        while (parentOf[root] != root) root = parentOf[root];  // walk up to the root
        while (parentOf[v] != root) {            // path compression: relink every node on the way
            int next = parentOf[v];
            parentOf[v] = root;
            v = next;
        }
        return root;
    }

    static void unionSets(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return;                    // already in the same set
        if (rankOf[ra] < rankOf[rb]) {            // union by rank: shorter tree hangs under the taller one
            parentOf[ra] = rb;
        } else if (rankOf[ra] > rankOf[rb]) {
            parentOf[rb] = ra;
        } else {
            parentOf[rb] = ra;
            rankOf[ra]++;
        }
    }

    static class Op {
        boolean isFind; String a, b;
        Op(boolean isFind, String a, String b) { this.isFind = isFind; this.a = a; this.b = b; }
    }

    static void runScenario(String labelTxt, Op[] ops) {
        System.out.println("-- " + labelTxt + " --");
        vertexCount = 0;

        // discover every vertex mentioned, then makeSet each one
        for (Op op : ops) {
            findOrAddVertex(op.a);
            if (op.b != null) findOrAddVertex(op.b);
        }
        for (int i = 0; i < vertexCount; i++) makeSet(i);

        for (Op op : ops) {
            if (op.isFind) {
                int a = findOrAddVertex(op.a);
                int root = find(a);
                System.out.println("find(" + op.a + ") = " + label[root]);
            } else {
                int a = findOrAddVertex(op.a), b = findOrAddVertex(op.b);
                int ra = find(a), rb = find(b);
                unionSets(a, b);
                if (ra == rb) System.out.println("union(" + op.a + ", " + op.b + "): already the same set (" + label[ra] + ")");
                else System.out.println("union(" + op.a + ", " + op.b + "): merged, new root = " + label[find(a)]);
            }
        }

        StringBuilder sb = new StringBuilder("final sets:");
        for (int i = 0; i < vertexCount; i++) sb.append(' ').append(label[i]).append("->").append(label[find(i)]);
        System.out.println(sb);
        System.out.println();
    }

    public static void main(String[] args) {
        Op[] normal = {
            new Op(false, "A", "B"), new Op(false, "C", "D"), new Op(false, "A", "C"),
            new Op(false, "E", "F"), new Op(false, "G", "H"), new Op(false, "E", "G"),
            new Op(true, "D", null), new Op(false, "A", "E"), new Op(true, "D", null), new Op(true, "H", null), new Op(false, "B", "H")
        };
        runScenario("normal: 8 elements, merges two rank-1 trees into a deeper chain, then flattens it with find (11 ops)", normal);

        Op[] hard = {
            new Op(false, "A", "B"), new Op(false, "C", "D"), new Op(false, "E", "F"), new Op(false, "G", "H"),
            new Op(false, "A", "C"), new Op(false, "E", "G"), new Op(true, "F", null), new Op(false, "I", "J"),
            new Op(false, "A", "E"), new Op(false, "B", "D"), new Op(true, "H", null), new Op(false, "A", "I"),
            new Op(true, "J", null), new Op(false, "C", "F"), new Op(true, "B", null)
        };
        runScenario("hard: 10 elements, nested merges and some already-same-set unions (15 ops)", hard);

        Op[] noop = {
            new Op(false, "A", "B"), new Op(false, "A", "B"), new Op(false, "B", "A"),
            new Op(false, "C", "D"), new Op(false, "A", "C"), new Op(false, "D", "B"),
            new Op(false, "A", "D"), new Op(true, "D", null), new Op(false, "C", "A"), new Op(true, "B", null)
        };
        runScenario("edge: repeatedly unioning the same set with itself (10 ops)", noop);

        Op[] single = { new Op(true, "A", null) };
        runScenario("edge: a single element, no unions, only a find", single);
    }
}
