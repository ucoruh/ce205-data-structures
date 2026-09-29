/* Week 10 -- Sorting
 * Bubble sort with early exit: repeatedly walk the array, swapping adjacent
 * out-of-order pairs; a pass with zero swaps means the array is already
 * sorted and the algorithm stops early. Prints the array after every pass
 * and the total comparisons/swaps.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class BubbleSort {
    static int comparisons, swaps;

    static void printArray(int[] a) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) { sb.append(a[i]); if (i + 1 < a.length) sb.append(", "); }
        sb.append(']');
        System.out.println(sb);
    }

    static void bubbleSort(int[] a) {
        int n = a.length;
        for (int pass = 0; pass < n - 1; pass++) {
            boolean swapped = false;
            for (int i = 0; i < n - 1 - pass; i++) {
                comparisons++;
                if (a[i] > a[i + 1]) {
                    int tmp = a[i]; a[i] = a[i + 1]; a[i + 1] = tmp;
                    swaps++;
                    swapped = true;
                }
            }
            System.out.print("  pass " + (pass + 1) + ": ");
            printArray(a);
            if (!swapped) { System.out.println("  no swaps this pass -> early exit"); break; }
        }
    }

    static void runScenario(String label, int[] a) {
        System.out.println("-- " + label + " --");
        System.out.print("before: ");
        printArray(a);
        comparisons = 0; swaps = 0;
        bubbleSort(a);
        System.out.print("after:  ");
        printArray(a);
        System.out.println("total: " + comparisons + " comparisons, " + swaps + " swaps");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {5, 2, 9, 1, 7, 3, 8, 4, 6, 0};
        int[] hard = {40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29};
        int[] alreadySorted = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        int[] reverseSorted = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

        runScenario("normal: 10 unordered values", normal);
        runScenario("hard: 14 values, needs many passes", hard);
        runScenario("edge: already sorted -- early exit after one pass", alreadySorted);
        runScenario("edge: reverse sorted -- worst case, no early exit", reverseSorted);
    }
}
