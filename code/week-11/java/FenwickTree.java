/* Week 11 -- Advanced Trees
 * Fenwick tree (binary indexed tree, BIT): prefix sums and i & -i.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class FenwickTree {
    static final int MAXN = 32;
    static int[] bit = new int[MAXN + 1];  // 1-indexed; bit[0] is unused
    static int n;

    static void update(int i, int delta) {
        while (i <= n) {
            bit[i] += delta;
            i += i & (-i);         // move to the next responsible index
        }
    }

    static int query(int i) {              // prefix sum: v[1] + v[2] + ... + v[i]
        int sum = 0;
        while (i > 0) {
            sum += bit[i];
            i -= i & (-i);         // move to the previous responsible index
        }
        return sum;
    }

    static class Op {
        boolean isQuery; int i; int delta;
        Op(boolean isQuery, int i, int delta) { this.isQuery = isQuery; this.i = i; this.delta = delta; }
    }

    static void runScenario(String label, int size, Op[] ops) {
        System.out.println("-- " + label + " --");
        n = size;
        for (int i = 0; i <= n; i++) bit[i] = 0;
        for (Op op : ops) {
            if (op.isQuery) {
                System.out.println("query(" + op.i + ") = " + query(op.i));
            } else {
                update(op.i, op.delta);
                System.out.println("update(" + op.i + ", " + op.delta + ")");
            }
        }
        System.out.println();
    }

    public static void main(String[] args) {
        Op[] normal = {
            new Op(false, 3, 5), new Op(false, 7, 2), new Op(true, 10, 0), new Op(false, 1, 4),
            new Op(true, 5, 0), new Op(false, 10, 3), new Op(true, 10, 0), new Op(true, 1, 0)
        };
        runScenario("normal: n=10, 8 operations: updates and queries mixed", 10, normal);

        Op[] hard = {
            new Op(false, 5, 8), new Op(false, 12, -3), new Op(true, 16, 0), new Op(false, 1, 6),
            new Op(false, 16, 4), new Op(true, 8, 0), new Op(false, 9, -5), new Op(true, 16, 0),
            new Op(true, 12, 0), new Op(false, 8, 2)
        };
        runScenario("hard: n=16, 10 operations, including negative deltas", 16, hard);

        Op[] chain = { new Op(false, 1, 7), new Op(true, 16, 0) };
        runScenario("edge: n=16, update(1) takes 5 steps, query(16) takes only 1", 16, chain);

        Op[] neg = {
            new Op(false, 4, -9), new Op(false, 8, 2), new Op(true, 10, 0),
            new Op(false, 1, -3), new Op(true, 4, 0), new Op(true, 10, 0)
        };
        runScenario("edge: negative deltas can push the sum below zero", 10, neg);

        Op[] point = { new Op(false, 1, 9), new Op(true, 1, 0) };
        runScenario("edge: an update immediately queried at the same point", 10, point);
    }
}
