/* Week 10 -- Sorting
 * Sorting comparison: the SAME input array is sorted five different ways
 * -- bubble, selection, insertion, merge (top-down), quick (Lomuto) -- and
 * each algorithm's comparisons/writes are reported on the identical input,
 * so the O(n^2) vs O(n log n) gap becomes an actual number.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class SortingComparison {
    interface SortFn { void sort(int[] a, int n); }

    static int comparisons, writes;

    static String arrStr(int[] a, int n) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < n; i++) { sb.append(a[i]); if (i + 1 < n) sb.append(','); }
        sb.append(']');
        return sb.toString();
    }

    static void bubble(int[] a, int n) {
        for (int pass = 0; pass < n - 1; pass++) {
            boolean swapped = false;
            for (int i = 0; i < n - 1 - pass; i++) {
                comparisons++;
                if (a[i] > a[i + 1]) { int t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; writes += 2; swapped = true; }
            }
            if (!swapped) break;
        }
    }

    static void selection(int[] a, int n) {
        for (int i = 0; i < n - 1; i++) {
            int m = i;
            for (int j = i + 1; j < n; j++) { comparisons++; if (a[j] < a[m]) m = j; }
            if (m != i) { int t = a[i]; a[i] = a[m]; a[m] = t; writes += 2; }
        }
    }

    static void insertion(int[] a, int n) {
        for (int i = 1; i < n; i++) {
            int key = a[i], j = i - 1;
            while (j >= 0) {
                comparisons++;
                if (a[j] <= key) break;
                a[j + 1] = a[j]; writes++; j--;
            }
            a[j + 1] = key; writes++;
        }
    }

    static void mergeRange(int[] a, int lo, int mid, int hi, int[] tmp) {
        int i = lo, j = mid, k = lo;
        while (i < mid && j < hi) { comparisons++; tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++]; writes++; }
        while (i < mid) { tmp[k++] = a[i++]; writes++; }
        while (j < hi) { tmp[k++] = a[j++]; writes++; }
        for (int x = lo; x < hi; x++) a[x] = tmp[x];
    }
    static void mergeSortRec(int[] a, int lo, int hi, int[] tmp) {
        if (hi - lo <= 1) return;
        int mid = lo + (hi - lo) / 2;
        mergeSortRec(a, lo, mid, tmp);
        mergeSortRec(a, mid, hi, tmp);
        mergeRange(a, lo, mid, hi, tmp);
    }
    static void mergeSortTop(int[] a, int n) { mergeSortRec(a, 0, n, new int[n]); }

    static void quickSortRec(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int pivot = a[hi], i = lo - 1;
        for (int j = lo; j < hi; j++) {
            comparisons++;
            if (a[j] <= pivot) { i++; int t = a[i]; a[i] = a[j]; a[j] = t; writes += 2; }
        }
        int t2 = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t2; writes += 2;
        int p = i + 1;
        quickSortRec(a, lo, p - 1);
        quickSortRec(a, p + 1, hi);
    }
    static void quickSortTop(int[] a, int n) { quickSortRec(a, 0, n - 1); }

    static void runOne(String name, SortFn fn, int[] src, int n) {
        int[] a = new int[n];
        System.arraycopy(src, 0, a, 0, n);
        comparisons = 0; writes = 0;
        fn.sort(a, n);
        System.out.printf("  %-10s comparisons=%-4d writes=%-4d -> ", name, comparisons, writes);
        System.out.println(arrStr(a, n));
    }

    static void runScenario(String label, int[] a) {
        System.out.println("-- " + label + " --");
        System.out.println("before: " + arrStr(a, a.length));
        runOne("bubble", SortingComparison::bubble, a, a.length);
        runOne("selection", SortingComparison::selection, a, a.length);
        runOne("insertion", SortingComparison::insertion, a, a.length);
        runOne("merge", SortingComparison::mergeSortTop, a, a.length);
        runOne("quick", SortingComparison::quickSortTop, a, a.length);
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6};
        int[] alreadySorted = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        int[] reverseSorted = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
        int[] nearlySorted = {1, 2, 3, 4, 9, 6, 7, 8, 5, 10, 11, 12};

        runScenario("normal: 10 unordered values", normal);
        runScenario("edge: already sorted -- bubble wins via early exit, quick (Lomuto) has its worst day", alreadySorted);
        runScenario("edge: reverse sorted -- both bubble and quick (Lomuto) hit their worst case", reverseSorted);
        runScenario("edge: nearly sorted -- only two values are swapped", nearlySorted);
    }
}
