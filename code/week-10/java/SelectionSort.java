/* Week 10 -- Sorting
 * Selection sort: for each position i, scan the unsorted remainder for its
 * minimum and swap it into place. The sorted region grows on the LEFT; at
 * most n-1 swaps ever happen, but every position still does a full scan
 * (no early exit). Prints the array after every position and the total
 * comparisons/swaps.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class SelectionSort {
    static int comparisons, swaps;

    static void printArray(int[] a) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) { sb.append(a[i]); if (i + 1 < a.length) sb.append(", "); }
        sb.append(']');
        System.out.println(sb);
    }

    static void selectionSort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                comparisons++;
                if (a[j] < a[minIdx]) minIdx = j;
            }
            if (minIdx != i) {
                int tmp = a[i]; a[i] = a[minIdx]; a[minIdx] = tmp;
                swaps++;
            }
            System.out.print("  i=" + i + ": min_idx=" + minIdx + " -> ");
            printArray(a);
        }
    }

    static void runScenario(String label, int[] a) {
        System.out.println("-- " + label + " --");
        System.out.print("before: ");
        printArray(a);
        comparisons = 0; swaps = 0;
        selectionSort(a);
        System.out.print("after:  ");
        printArray(a);
        System.out.println("total: " + comparisons + " comparisons, " + swaps + " swaps");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {29, 10, 14, 37, 14, 22, 5, 41, 18, 33};
        int[] hard = {50, 3, 47, 8, 44, 12, 39, 16, 34, 20, 29, 24, 25, 27};
        int[] alreadySorted = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        int[] reverseSorted = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

        runScenario("normal: 10 unordered values", normal);
        runScenario("hard: 14 values, the minimum keeps moving", hard);
        runScenario("edge: already sorted -- a full scan still happens for every i", alreadySorted);
        runScenario("edge: reverse sorted -- every step swaps", reverseSorted);
    }
}
