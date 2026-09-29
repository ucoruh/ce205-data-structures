/* Week 10 -- Sorting
 * Merge sort, bottom-up (iterative): no recursion. Treat every element as
 * a sorted run of width 1, merge adjacent runs into width-2 runs, then
 * width-4, doubling every round until one run covers the whole array.
 * Prints every merge and the total comparisons/moves.
 * CEN207 Data Structures (formerly CE205)
 */
public class MergeSortBottomUp {
    static int comparisons, moves;

    static String rangeStr(int[] a, int lo, int hi) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = lo; i < hi; i++) { sb.append(a[i]); if (i + 1 < hi) sb.append(','); }
        sb.append(']');
        return sb.toString();
    }

    static void merge(int[] a, int lo, int mid, int hi, int[] tmp) {
        int i = lo, j = mid, k = lo;
        String leftBefore = rangeStr(a, lo, mid), rightBefore = rangeStr(a, mid, hi);
        while (i < mid && j < hi) {
            comparisons++;
            tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
            moves++;
        }
        while (i < mid) { tmp[k++] = a[i++]; moves++; }
        while (j < hi) { tmp[k++] = a[j++]; moves++; }
        for (int x = lo; x < hi; x++) a[x] = tmp[x];
        System.out.println("  merge " + leftBefore + " + " + rightBefore + " -> " + rangeStr(a, lo, hi));
    }

    static void mergeSortBottomUp(int[] a, int n, int[] tmp) {
        for (int width = 1; width < n; width *= 2) {
            System.out.println(" width=" + width + ":");
            for (int lo = 0; lo < n - width; lo += 2 * width) {
                int mid = lo + width;
                int hi = Math.min(mid + width, n);
                merge(a, lo, mid, hi, tmp);
            }
        }
    }

    static void printArray(int[] a) { System.out.println(rangeStr(a, 0, a.length)); }

    static void runScenario(String label, int[] a) {
        System.out.println("-- " + label + " --");
        System.out.print("before: ");
        printArray(a);
        int[] tmp = new int[a.length];
        comparisons = 0; moves = 0;
        mergeSortBottomUp(a, a.length, tmp);
        System.out.print("after:  ");
        printArray(a);
        System.out.println("total: " + comparisons + " comparisons, " + moves + " moves");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6};
        int[] powerOfTwo = {16, 3, 9, 14, 1, 12, 7, 10, 5, 15, 2, 11, 8, 13, 4, 6};
        int[] alreadySorted = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        int[] reverseSorted = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

        runScenario("normal: 10 unordered values", normal);
        runScenario("hard: 16 values, n is exactly a power of 2", powerOfTwo);
        runScenario("edge: already sorted -- every round still runs", alreadySorted);
        runScenario("edge: reverse sorted", reverseSorted);
    }
}
