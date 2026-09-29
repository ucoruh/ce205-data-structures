/* Week 10 -- Sorting
 * Merge sort, top-down (recursive): split the range in half, recursively
 * sort each half, then merge the two sorted halves with an auxiliary
 * array. Prints every merge (its two input runs and the merged result)
 * and the total comparisons/moves.
 * CEN207 Data Structures (formerly CE205)
 */
public class MergeSort {
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

    static void mergeSort(int[] a, int lo, int hi, int[] tmp) {
        if (hi - lo <= 1) return;
        int mid = lo + (hi - lo) / 2;
        mergeSort(a, lo, mid, tmp);
        mergeSort(a, mid, hi, tmp);
        merge(a, lo, mid, hi, tmp);
    }

    static void printArray(int[] a) { System.out.println(rangeStr(a, 0, a.length)); }

    static void runScenario(String label, int[] a) {
        System.out.println("-- " + label + " --");
        System.out.print("before: ");
        printArray(a);
        int[] tmp = new int[a.length];
        comparisons = 0; moves = 0;
        mergeSort(a, 0, a.length, tmp);
        System.out.print("after:  ");
        printArray(a);
        System.out.println("total: " + comparisons + " comparisons, " + moves + " moves");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6};
        int[] hard = {45, 2, 38, 9, 33, 14, 29, 6, 41, 18, 24, 11, 36, 20};
        int[] alreadySorted = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        int[] reverseSorted = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

        runScenario("normal: 10 unordered values", normal);
        runScenario("hard: 14 values, uneven splits", hard);
        runScenario("edge: already sorted -- every split and merge still runs", alreadySorted);
        runScenario("edge: reverse sorted", reverseSorted);
    }
}
