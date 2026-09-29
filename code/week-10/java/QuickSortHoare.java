/* Week 10 -- Sorting
 * Quick sort with Hoare partitioning: pivot = first element of the range.
 * Two pointers scan inward from both ends and swap out-of-place pairs; the
 * partition does NOT guarantee the pivot itself lands at the returned
 * index. Recursive calls are (lo, p) and (p + 1, hi) -- note p, not
 * p - 1. Prints every partition call and the total comparisons/swaps.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class QuickSortHoare {
    static int comparisons, swaps;

    static String rangeStr(int[] a, int lo, int hi) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = lo; i <= hi; i++) { sb.append(a[i]); if (i < hi) sb.append(','); }
        sb.append(']');
        return sb.toString();
    }

    static int partitionHoare(int[] a, int lo, int hi) {
        int pivot = a[lo];
        int i = lo - 1, j = hi + 1;
        while (true) {
            do { i++; comparisons++; } while (a[i] < pivot);
            do { j--; comparisons++; } while (a[j] > pivot);
            if (i >= j) return j;
            int tmp = a[i]; a[i] = a[j]; a[j] = tmp;
            swaps++;
        }
    }

    static void quickSortHoare(int[] a, int lo, int hi) {
        if (lo < hi) {
            String before = rangeStr(a, lo, hi);
            int pivotVal = a[lo];
            int p = partitionHoare(a, lo, hi);
            System.out.println("  partition [" + lo + ".." + hi + "] " + before + " pivot=" + pivotVal + " -> " + rangeStr(a, lo, hi) + " (returns " + p + ")");
            quickSortHoare(a, lo, p);
            quickSortHoare(a, p + 1, hi);
        }
    }

    static void printArray(int[] a) { System.out.println(rangeStr(a, 0, a.length - 1)); }

    static void runScenario(String label, int[] a) {
        System.out.println("-- " + label + " --");
        System.out.print("before: ");
        printArray(a);
        comparisons = 0; swaps = 0;
        quickSortHoare(a, 0, a.length - 1);
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
        runScenario("edge: already sorted -- every scan still runs", alreadySorted);
        runScenario("edge: reverse sorted -- worst case", reverseSorted);
    }
}
