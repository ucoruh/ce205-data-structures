/* Week 10 -- Sorting
 * Quick sort's worst case, and how pivot choice avoids it: the SAME input
 * is sorted three times with the same Lomuto-style partition, differing
 * only in which element is chosen as the pivot (first / middle / median-
 * of-three). Prints each strategy's total comparisons and recursion depth
 * on the same input, so the O(n^2) vs O(n log n) gap becomes a number.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class QuickSortWorstCase {
    interface Pivot { int pick(int[] a, int lo, int hi); }

    static void swap(int[] a, int x, int y) { int t = a[x]; a[x] = a[y]; a[y] = t; }

    static int choosePivotFirst(int[] a, int lo, int hi) { return lo; }
    static int choosePivotMiddle(int[] a, int lo, int hi) { return lo + (hi - lo) / 2; }
    static int choosePivotMedian3(int[] a, int lo, int hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < a[lo]) swap(a, lo, mid);
        if (a[hi] < a[lo]) swap(a, lo, hi);
        if (a[hi] < a[mid]) swap(a, mid, hi);
        return mid;
    }

    static int[] comparisons = new int[1];
    static int[] calls = new int[1];
    static int[] maxDepth = new int[1];

    static int partitionWith(int[] a, int lo, int hi, int pivotIdx) {
        swap(a, pivotIdx, hi);
        int pivot = a[hi];
        int i = lo - 1;
        for (int j = lo; j < hi; j++) {
            comparisons[0]++;
            if (a[j] <= pivot) { i++; swap(a, i, j); }
        }
        swap(a, i + 1, hi);
        return i + 1;
    }

    static void qs(int[] a, int lo, int hi, Pivot pick, int depth) {
        if (depth > maxDepth[0]) maxDepth[0] = depth;
        if (hi <= lo) return;
        calls[0]++;
        int pIdx = pick.pick(a, lo, hi);
        int p = partitionWith(a, lo, hi, pIdx);
        qs(a, lo, p - 1, pick, depth + 1);
        qs(a, p + 1, hi, pick, depth + 1);
    }

    static void printArray(int[] a) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) { sb.append(a[i]); if (i + 1 < a.length) sb.append(','); }
        sb.append(']');
        System.out.println(sb);
    }

    static void runStrategy(String name, int[] src, Pivot pick) {
        int[] a = src.clone();
        comparisons[0] = 0; calls[0] = 0; maxDepth[0] = 0;
        qs(a, 0, a.length - 1, pick, 0);
        System.out.printf("  %-16s comparisons=%-4d calls=%-3d depth=%-3d -> ", name, comparisons[0], calls[0], maxDepth[0]);
        printArray(a);
    }

    static void runScenario(String label, int[] a) {
        System.out.println("-- " + label + " --");
        System.out.print("before: ");
        printArray(a);
        runStrategy("first element", a, QuickSortWorstCase::choosePivotFirst);
        runStrategy("middle index", a, QuickSortWorstCase::choosePivotMiddle);
        runStrategy("median-of-3", a, QuickSortWorstCase::choosePivotMedian3);
        System.out.println();
    }

    public static void main(String[] args) {
        int[] sorted10 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        int[] sorted14 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
        int[] reverse10 = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
        int[] random10 = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6};

        runScenario("normal: already-sorted 10 values -- first-element is the worst case", sorted10);
        runScenario("hard: already-sorted 14 values -- the gap widens further", sorted14);
        runScenario("edge: reverse-sorted 10 values -- first-element is again the worst case", reverse10);
        runScenario("edge: random 10 values -- all three strategies are similar", random10);
    }
}
