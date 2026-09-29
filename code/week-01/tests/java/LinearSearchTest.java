/* Unit tests for week-01 java/LinearSearch.java. Expected values are hand-computed, independent of the
 * method under test (mirrors code/week-01/tests/c/test_linear_search.c).
 */
public class LinearSearchTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) {
        // normal data: target in the middle, hand count: index 4, 5 comparisons
        {
            int[] arr = {4, 8, 15, 16, 23, 27, 31, 38, 42, 50, 61};
            int idx = LinearSearch.linearSearch(arr, 23);
            checkEq(idx, 4, "normal index");
            checkEq(LinearSearch.comparisons, 5, "normal comparisons");
        }

        // empty input: n = 0
        {
            int idx = LinearSearch.linearSearch(new int[0], 42);
            checkEq(idx, -1, "empty not found");
            checkEq(LinearSearch.comparisons, 0, "empty comparisons");
        }

        // one element, found
        {
            int idx = LinearSearch.linearSearch(new int[] {42}, 42);
            checkEq(idx, 0, "one element found index");
            checkEq(LinearSearch.comparisons, 1, "one element found comparisons");
        }

        // one element, not found
        {
            int idx = LinearSearch.linearSearch(new int[] {42}, 7);
            checkEq(idx, -1, "one element not found index");
            checkEq(LinearSearch.comparisons, 1, "one element not found comparisons");
        }

        // two elements, target is the second
        {
            int idx = LinearSearch.linearSearch(new int[] {5, 9}, 9);
            checkEq(idx, 1, "two elements index");
            checkEq(LinearSearch.comparisons, 2, "two elements comparisons");
        }

        // best case: target is the first element
        {
            int[] arr = {5, 13, 21, 34, 42, 55, 67, 78, 89, 91};
            int idx = LinearSearch.linearSearch(arr, 5);
            checkEq(idx, 0, "best case index");
            checkEq(LinearSearch.comparisons, 1, "best case comparisons");
        }

        // worst case: target is the last element
        {
            int[] arr = {5, 13, 21, 34, 42, 55, 67, 78, 89, 91};
            int idx = LinearSearch.linearSearch(arr, 91);
            checkEq(idx, 9, "worst case index");
            checkEq(LinearSearch.comparisons, 10, "worst case comparisons");
        }

        // not found, full scan
        {
            int[] arr = {2, 4, 6, 8, 10, 12, 14, 16, 18, 20};
            int idx = LinearSearch.linearSearch(arr, 7);
            checkEq(idx, -1, "full scan not found");
            checkEq(LinearSearch.comparisons, 10, "full scan comparisons");
        }

        // duplicates: first match wins
        {
            int[] arr = {12, 47, 3, 88, 25, 61, 9, 34, 77, 15, 52, 6, 41, 18, 63, 99, 5, 29, 99, 71};
            int idx = LinearSearch.linearSearch(arr, 99);
            checkEq(idx, 15, "duplicates first match index");
            checkEq(LinearSearch.comparisons, 16, "duplicates comparisons");
        }

        // negative values
        {
            int[] arr = {-5, -10, -15, -20, -25};
            int idx = LinearSearch.linearSearch(arr, -20);
            checkEq(idx, 3, "negative values index");
            checkEq(LinearSearch.comparisons, 4, "negative values comparisons");
        }

        // reverse-sorted array
        {
            int[] arr = {90, 83, 75, 68, 60, 53, 47, 41, 34, 29, 23, 19, 15, 11, 7, 3};
            int idx = LinearSearch.linearSearch(arr, 3);
            checkEq(idx, 15, "reverse-sorted index");
            checkEq(LinearSearch.comparisons, 16, "reverse-sorted comparisons");
        }

        // Integer.MIN_VALUE / MAX_VALUE as ordinary values
        {
            int[] arr = {0, 1, -1, Integer.MAX_VALUE, Integer.MIN_VALUE, 5};
            checkEq(LinearSearch.linearSearch(arr, Integer.MAX_VALUE), 3, "MAX_VALUE index");
            checkEq(LinearSearch.linearSearch(arr, Integer.MIN_VALUE), 4, "MIN_VALUE index");
            checkEq(LinearSearch.comparisons, 5, "MIN_VALUE comparisons");
        }

        // target value 0 is not confused with "not found"
        {
            int idx = LinearSearch.linearSearch(new int[] {3, 0, 7}, 0);
            checkEq(idx, 1, "zero target index");
        }

        // arr is not mutated by the search
        {
            int[] arr = {1, 2, 3};
            int[] copy = arr.clone();
            LinearSearch.linearSearch(arr, 2);
            check(java.util.Arrays.equals(arr, copy), "array unmodified");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
