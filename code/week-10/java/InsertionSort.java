/* Week 10 -- Sorting
 * Insertion sort: for each i, pull out a[i] as the key, then shift every
 * element greater than the key one cell right until the key's correct spot
 * (its "hole") is found. Prints the key and the array after every
 * insertion, plus total comparisons/shifts.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class InsertionSort {
    static int comparisons, shifts;

    static void printArray(int[] a) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) { sb.append(a[i]); if (i + 1 < a.length) sb.append(", "); }
        sb.append(']');
        System.out.println(sb);
    }

    static void insertionSort(int[] a) {
        int n = a.length;
        for (int i = 1; i < n; i++) {
            int key = a[i];
            int j = i - 1;
            while (j >= 0) {
                comparisons++;
                if (a[j] <= key) break;
                a[j + 1] = a[j];
                shifts++;
                j--;
            }
            a[j + 1] = key;
            System.out.print("  i=" + i + ": key=" + key + " -> ");
            printArray(a);
        }
    }

    static void runScenario(String label, int[] a) {
        System.out.println("-- " + label + " --");
        System.out.print("before: ");
        printArray(a);
        comparisons = 0; shifts = 0;
        insertionSort(a);
        System.out.print("after:  ");
        printArray(a);
        System.out.println("total: " + comparisons + " comparisons, " + shifts + " shifts");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {31, 12, 25, 8, 19, 40, 3, 27, 15, 22};
        int[] hard = {45, 2, 38, 9, 33, 14, 29, 6, 41, 18, 24, 11, 36, 20};
        int[] alreadySorted = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        int[] reverseSorted = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

        runScenario("normal: 10 unordered values", normal);
        runScenario("hard: 14 values, needs long shifts", hard);
        runScenario("edge: already sorted -- one comparison per i, zero shifts", alreadySorted);
        runScenario("edge: reverse sorted -- worst case, every key shifts to the front", reverseSorted);
    }
}
