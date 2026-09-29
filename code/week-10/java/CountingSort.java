/* Week 10 -- Sorting
 * Counting sort: a non-comparison sort for small non-negative integers.
 * Counts occurrences of each value, turns the counts into a cumulative
 * total, then places every input value directly at its final index,
 * scanning backwards to stay stable. Prints count[] at each stage and the
 * final result. Zero comparisons; the total writes are reported.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class CountingSort {
    static void printArray(int[] a, int n) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < n; i++) { sb.append(a[i]); if (i + 1 < n) sb.append(','); }
        sb.append(']');
        System.out.println(sb);
    }

    static int countingSort(int[] a, int n, int maxVal) {
        int writes = 0;
        int[] count = new int[maxVal + 1];
        for (int i = 0; i < n; i++) { count[a[i]]++; writes++; }
        System.out.print("  raw counts:        ");
        printArray(count, maxVal + 1);
        for (int v = 1; v <= maxVal; v++) count[v] += count[v - 1];
        System.out.print("  cumulative counts: ");
        printArray(count, maxVal + 1);

        int[] output = new int[n];
        for (int i = n - 1; i >= 0; i--) {
            output[count[a[i]] - 1] = a[i];
            writes++;
            count[a[i]]--;
        }
        for (int i = 0; i < n; i++) a[i] = output[i];
        return writes;
    }

    static void runScenario(String label, int[] a, int maxVal) {
        System.out.println("-- " + label + " --");
        System.out.print("before: ");
        printArray(a, a.length);
        int writes = countingSort(a, a.length, maxVal);
        System.out.print("after:  ");
        printArray(a, a.length);
        System.out.println("total: 0 comparisons, " + writes + " writes");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {4, 2, 2, 8, 3, 3, 1, 4, 2, 7};
        int[] hard = {5, 1, 5, 9, 2, 5, 1, 9, 5, 2, 1, 9, 5, 0};
        int[] alreadySorted = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
        int[] sparse = {0, 15, 3, 12, 6, 9, 1, 14, 7, 8};

        runScenario("normal: 10 values, range 0..9", normal, 9);
        runScenario("hard: 14 values, range 0..9, heavy repeats", hard, 9);
        runScenario("edge: already sorted -- every pass still runs", alreadySorted, 9);
        runScenario("edge: sparse range -- 10 values but maxVal=15 (the O(n+k) cost)", sparse, 15);
    }
}
