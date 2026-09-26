/* Week 1 -- Introduction to Data Structures
 * Binary search: repeatedly halve the search range on a SORTED array.
 * Runs the same normal / hard / edge-case scenarios as the binary-search animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class BinarySearch {
    static int comparisons;

    static int binarySearch(int[] arr, int target) {
        comparisons = 0;
        int lo = 0, hi = arr.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            comparisons++;
            if (arr[mid] == target)
                return mid;
            if (arr[mid] < target)
                lo = mid + 1;
            else
                hi = mid - 1;
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
        int index = binarySearch(arr, target);
        if (index >= 0)
            System.out.println("binarySearch(target=" + target + ") -> found at index " + index
                    + ", " + comparisons + " comparison" + (comparisons == 1 ? "" : "s"));
        else
            System.out.println("binarySearch(target=" + target + ") -> not found, "
                    + comparisons + " comparisons");
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 16 values, target found
        int[] normal = {3, 7, 11, 15, 19, 23, 29, 34, 41, 47, 53, 60, 68, 75, 83, 90};
        runScenario("normal: 16 values, target found", normal, 47);

        // hard: 31 values, not found: lo > hi at the end
        int[] hard = {2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62,
                      66, 70, 74, 78, 82, 86, 90, 94, 98, 102, 106, 110, 114, 118, 122};
        runScenario("hard: 31 values, not found (lo > hi at the end)", hard, 5);

        // edge: target is smaller than every value
        int[] smallerThanAll = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        runScenario("edge: target is smaller than every value", smallerThanAll, 1);

        // edge: target is larger than every value
        int[] largerThanAll = {15, 25, 35, 45, 55, 65, 75, 85, 95, 105};
        runScenario("edge: target is larger than every value", largerThanAll, 999);

        // edge: searching among duplicate values
        int[] duplicates = {5, 5, 5, 10, 15, 20, 20, 25, 30, 35};
        runScenario("edge: searching among duplicate values", duplicates, 20);
    }
}
