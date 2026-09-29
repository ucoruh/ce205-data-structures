/* Unit tests for week-01 java/BinarySearch.java. Expected values are hand-computed / brute-force verified,
 * independent of the method under test (mirrors code/week-01/tests/c/test_binary_search.c).
 */
public class BinarySearchTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static int bruteIndex(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++)
            if (arr[i] == target) return i;
        return -1;
    }

    public static void main(String[] args) {
        // normal: 16 values, target found (hand trace: mid 7 -> 11 -> 9, 3 comparisons)
        {
            int[] arr = {3, 7, 11, 15, 19, 23, 29, 34, 41, 47, 53, 60, 68, 75, 83, 90};
            int idx = BinarySearch.binarySearch(arr, 47);
            checkEq(idx, 9, "normal index");
            checkEq(BinarySearch.comparisons, 3, "normal comparisons");
            checkEq(idx, bruteIndex(arr, 47), "normal matches brute force");
        }

        // empty input
        {
            int idx = BinarySearch.binarySearch(new int[0], 5);
            checkEq(idx, -1, "empty not found");
            checkEq(BinarySearch.comparisons, 0, "empty comparisons");
        }

        // one element, found
        checkEq(BinarySearch.binarySearch(new int[] {42}, 42), 0, "one element found");
        // one element, not found
        checkEq(BinarySearch.binarySearch(new int[] {42}, 10), -1, "one element not found");

        // two elements
        checkEq(BinarySearch.binarySearch(new int[] {5, 9}, 9), 1, "two elements second");
        checkEq(BinarySearch.binarySearch(new int[] {5, 9}, 5), 0, "two elements first");

        // hard: not found, lo > hi at the end
        {
            int[] arr = {2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62,
                         66, 70, 74, 78, 82, 86, 90, 94, 98, 102, 106, 110, 114, 118, 122};
            int idx = BinarySearch.binarySearch(arr, 5);
            checkEq(idx, -1, "hard not found");
            checkEq(idx, bruteIndex(arr, 5), "hard matches brute force");
        }

        // edge: smaller than every value
        checkEq(BinarySearch.binarySearch(new int[] {10, 20, 30, 40, 50, 60, 70, 80, 90, 100}, 1), -1, "smaller than all");
        // edge: larger than every value
        checkEq(BinarySearch.binarySearch(new int[] {15, 25, 35, 45, 55, 65, 75, 85, 95, 105}, 999), -1, "larger than all");

        // duplicates: some index holding the target is returned
        {
            int[] arr = {5, 5, 5, 10, 15, 20, 20, 25, 30, 35};
            int idx = BinarySearch.binarySearch(arr, 20);
            check(idx == 5 || idx == 6, "duplicates plausible index");
            checkEq(arr[idx], 20, "duplicates value at returned index");
        }

        // first / last index
        {
            int[] arr = {1, 4, 9, 16, 25, 36, 49};
            checkEq(BinarySearch.binarySearch(arr, 1), 0, "first index");
            checkEq(BinarySearch.binarySearch(arr, 49), 6, "last index");
        }

        // negative values
        checkEq(BinarySearch.binarySearch(new int[] {-25, -20, -15, -10, -5, 0, 5, 10}, -15), 2, "negative values");

        // Integer.MIN_VALUE / MAX_VALUE at the ends
        {
            int[] arr = {Integer.MIN_VALUE, -1, 0, 1, Integer.MAX_VALUE};
            checkEq(BinarySearch.binarySearch(arr, Integer.MIN_VALUE), 0, "MIN_VALUE");
            checkEq(BinarySearch.binarySearch(arr, Integer.MAX_VALUE), 4, "MAX_VALUE");
        }

        // comparisons bound: never exceeds 5 for a 16-element array
        {
            int[] arr = {3, 7, 11, 15, 19, 23, 29, 34, 41, 47, 53, 60, 68, 75, 83, 90};
            for (int t : arr) {
                BinarySearch.binarySearch(arr, t);
                check(BinarySearch.comparisons <= 5, "comparisons bound for target " + t);
            }
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
