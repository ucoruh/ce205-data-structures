/* Week 11 -- Advanced Trees
 * Segment tree: build once from an array, then answer range-sum queries in O(log n).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class SegmentTree {
    static final int MAXN = 32;
    static long[] tree = new long[4 * MAXN];

    static void build(int i, int lo, int hi, int[] arr) {
        if (lo == hi) { tree[i] = arr[lo]; return; }
        int mid = (lo + hi) / 2;
        build(2 * i,     lo,      mid, arr);
        build(2 * i + 1, mid + 1, hi,  arr);
        tree[i] = tree[2 * i] + tree[2 * i + 1];
    }

    static long query(int i, int lo, int hi, int l, int r) {
        if (r < lo || hi < l)   return 0;                   // no overlap: outside [l, r]
        if (l <= lo && hi <= r) return tree[i];              // fully inside: precomputed sum
        int mid = (lo + hi) / 2;                             // partial overlap: check both halves
        return query(2 * i, lo, mid, l, r) + query(2 * i + 1, mid + 1, hi, l, r);
    }

    static void runScenario(String label, int[] arr, int[][] queries) {
        System.out.println("-- " + label + " --");
        int n = arr.length;
        build(1, 0, n - 1, arr);
        System.out.println("built from " + n + " values");
        for (int[] q : queries) {
            long s = query(1, 0, n - 1, q[0], q[1]);
            System.out.println("query(" + q[0] + "," + q[1] + ") = " + s);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {5, 3, 8, 2, 9, 1, 7, 4, 6, 10};
        int[][] normalQ = {{0, 9}, {2, 5}, {7, 7}};
        runScenario("normal: 10 values, 3 queries: full range, partial, a single point", normal, normalQ);

        int[] hard = {4, -7, 12, 3, -2, 9, -5, 8, 1, -3, 6, 0, -9, 11};
        int[][] hardQ = {{0, 13}, {3, 8}, {10, 10}, {1, 2}};
        runScenario("hard: 14 values including negatives, 4 queries", hard, hardQ);

        int[] full = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        int[][] fullQ = {{0, 9}};
        runScenario("edge: the query spans the whole array", full, fullQ);

        int[] points = {11, 22, 33, 44, 55, 66, 77, 88, 99, 100};
        int[][] pointsQ = {{0, 0}, {9, 9}, {4, 4}};
        runScenario("edge: three single-point queries", points, pointsQ);

        int[] single = {42};
        int[][] singleQ = {{0, 0}};
        runScenario("edge: a single-element array", single, singleQ);
    }
}
