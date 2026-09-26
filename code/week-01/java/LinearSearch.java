/* Week 1 -- Introduction to Data Structures
 * Linear search: scan the array from the front, one comparison at a time.
 * Runs the same normal / hard / edge-case scenarios as the linear-search animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class LinearSearch {
    static int comparisons;

    static int linearSearch(int[] arr, int target) {
        comparisons = 0;
        for (int i = 0; i < arr.length; i++) {
            comparisons++;
            if (arr[i] == target)
                return i;
        }
        return -1;
    }

    static void printArray(int[] arr) {
        StringBuilder sb = new StringBuilder("arr:");
        for (int v : arr) sb.append(' ').append(v);
        sb.append("  (n = ").append(arr.length).append(')');
        System.out.println(sb);
    }

    static void runScenario(String label, int[] arr, int target) {
        System.out.println("-- " + label + " --");
        printArray(arr);
        int index = linearSearch(arr, target);
        if (index >= 0)
            System.out.println("linearSearch(target=" + target + ") -> found at index " + index
                    + ", " + comparisons + " comparison" + (comparisons == 1 ? "" : "s"));
        else
            System.out.println("linearSearch(target=" + target + ") -> not found, "
                    + comparisons + " comparisons");
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 11 values, target in the middle
        int[] normal = {4, 8, 15, 16, 23, 27, 31, 38, 42, 50, 61};
        runScenario("normal: 11 values, target in the middle", normal, 27);

        // hard: 20 values, duplicate target, first match
        int[] hard = {12, 47, 3, 88, 25, 61, 9, 34, 77, 15, 52, 6, 41, 18, 63, 99, 5, 29, 99, 71};
        runScenario("hard: 20 values, duplicate target, first match", hard, 99);

        // edge: not found -- target is not in the array
        int[] notFound = {2, 4, 6, 8, 10, 12, 14, 16, 18, 20};
        runScenario("edge: not found, target is not in the array", notFound, 7);

        // edge: best case -- target is in the first box (index 0)
        int[] firstIndex = {5, 13, 21, 34, 42, 55, 67, 78, 89, 91};
        runScenario("edge: best case, target is in the first box (index 0)", firstIndex, 5);

        // edge: one-element array
        int[] one = {42};
        runScenario("edge: one-element array", one, 42);
    }
}
