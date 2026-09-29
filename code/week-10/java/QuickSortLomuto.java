/* Week 10 -- Sorting
 * Quick sort with Lomuto partitioning: pivot = last element of the range.
 * `i` marks the boundary of the "<= pivot" region; `j` scans left to
 * right. The pivot then swaps into its final position i+1. Prints every
 * partition call and the total comparisons/swaps.
 * CEN207 Data Structures (formerly CE205)
 */
public class QuickSortLomuto {
    static int comparisons, swaps;

    static String rangeStr(int[] a, int lo, int hi) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = lo; i <= hi; i++) { sb.append(a[i]); if (i < hi) sb.append(','); }
        sb.append(']');
        return sb.toString();
    }

    static int partitionLomuto(int[] a, int lo, int hi) {
        int pivot = a[hi];
        int i = lo - 1;
        for (int j = lo; j < hi; j++) {
            comparisons++;
            if (a[j] <= pivot) {
                i++;
                int tmp = a[i]; a[i] = a[j]; a[j] = tmp;
                if (i != j) swaps++;
            }
        }
        int tmp2 = a[i + 1]; a[i + 1] = a[hi]; a[hi] = tmp2;
        swaps++;
        return i + 1;
    }

    static void quickSortLomuto(int[] a, int lo, int hi) {
        if (lo < hi) {
            String before = rangeStr(a, lo, hi);
            int pivotVal = a[hi];
            int p = partitionLomuto(a, lo, hi);
            System.out.println("  partition [" + lo + ".." + hi + "] " + before + " pivot=" + pivotVal + " -> " + rangeStr(a, lo, hi) + " (pivot lands at " + p + ")");
            quickSortLomuto(a, lo, p - 1);
            quickSortLomuto(a, p + 1, hi);
        }
    }

    static void printArray(int[] a) { System.out.println(rangeStr(a, 0, a.length - 1)); }

    static void runScenario(String label, int[] a) {
        System.out.println("-- " + label + " --");
        System.out.print("before: ");
        printArray(a);
        comparisons = 0; swaps = 0;
        quickSortLomuto(a, 0, a.length - 1);
        System.out.print("after:  ");
        printArray(a);
        System.out.println("total: " + comparisons + " comparisons, " + swaps + " swaps");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6};
        int[] repeated = {7, 2, 7, 9, 2, 7, 4, 9, 2, 4, 7, 9};
        int[] alreadySorted = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        int[] reverseSorted = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

        runScenario("normal: 10 unordered values", normal);
        runScenario("hard: 12 values with repeated keys", repeated);
        runScenario("edge: already sorted -- worst case, every partition is n-1/0", alreadySorted);
        runScenario("edge: reverse sorted -- worst case again", reverseSorted);
    }
}
