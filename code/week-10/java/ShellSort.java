/* Week 10 -- Sorting
 * Shell sort: insertion sort, but comparing elements `gap` apart instead of
 * adjacent; the gap starts at n/2 and halves every round down to 1. Prints
 * the array after every gap round and the total comparisons/shifts.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class ShellSort {
    static int comparisons, shifts;

    static void printArray(int[] a) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) { sb.append(a[i]); if (i + 1 < a.length) sb.append(", "); }
        sb.append(']');
        System.out.println(sb);
    }

    static void shellSort(int[] a) {
        int n = a.length;
        for (int gap = n / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int key = a[i];
                int j = i;
                while (j >= gap) {
                    comparisons++;
                    if (a[j - gap] <= key) break;
                    a[j] = a[j - gap];
                    shifts++;
                    j -= gap;
                }
                a[j] = key;
            }
            System.out.print("  gap=" + gap + ": ");
            printArray(a);
        }
    }

    static void runScenario(String label, int[] a) {
        System.out.println("-- " + label + " --");
        System.out.print("before: ");
        printArray(a);
        comparisons = 0; shifts = 0;
        shellSort(a);
        System.out.print("after:  ");
        printArray(a);
        System.out.println("total: " + comparisons + " comparisons, " + shifts + " shifts");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {23, 9, 41, 5, 33, 17, 2, 46, 12, 28};
        int[] hard = {50, 3, 47, 8, 44, 12, 39, 16, 34, 20, 29, 24, 25, 27, 1, 45};
        int[] alreadySorted = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        int[] reverseSorted = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};

        runScenario("normal: 10 values, gap sequence 5, 2, 1", normal);
        runScenario("hard: 16 values, gap sequence 8, 4, 2, 1", hard);
        runScenario("edge: already sorted -- zero shifts at every gap", alreadySorted);
        runScenario("edge: reverse sorted -- large gaps close long distances immediately", reverseSorted);
    }
}
