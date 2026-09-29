// Unit tests for code/week-02/java/ArrayBinarySearch.java: binarySearch().
// Precondition: arr[] must already be sorted ascending (documented in the note).
import java.util.Arrays;

public class ArrayBinarySearchTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }

    public static void main(String[] args) {
        int[] a = {1, 3, 5, 7, 9, 11, 13};
        checkEq(ArrayBinarySearch.binarySearch(a, 1), 0, "first");
        checkEq(ArrayBinarySearch.binarySearch(a, 7), 3, "middle");
        checkEq(ArrayBinarySearch.binarySearch(a, 13), 6, "last");

        checkEq(ArrayBinarySearch.binarySearch(a, 0), -1, "below range");
        checkEq(ArrayBinarySearch.binarySearch(a, 14), -1, "above range");
        checkEq(ArrayBinarySearch.binarySearch(a, 4), -1, "between elements");

        int[] empty = {};
        checkEq(ArrayBinarySearch.binarySearch(empty, 1), -1, "empty array");

        int[] one = {42};
        checkEq(ArrayBinarySearch.binarySearch(one, 42), 0, "one element found");
        checkEq(ArrayBinarySearch.binarySearch(one, 7), -1, "one element not found");

        int[] two = {10, 20};
        checkEq(ArrayBinarySearch.binarySearch(two, 10), 0, "two elements first");
        checkEq(ArrayBinarySearch.binarySearch(two, 20), 1, "two elements second");
        checkEq(ArrayBinarySearch.binarySearch(two, 15), -1, "two elements not found");

        int[] four = {2, 4, 6, 8};
        checkEq(ArrayBinarySearch.binarySearch(four, 2), 0, "even length idx0");
        checkEq(ArrayBinarySearch.binarySearch(four, 4), 1, "even length idx1");
        checkEq(ArrayBinarySearch.binarySearch(four, 6), 2, "even length idx2");
        checkEq(ArrayBinarySearch.binarySearch(four, 8), 3, "even length idx3");

        int[] dup = {1, 3, 3, 3, 3, 5, 7};
        int r = ArrayBinarySearch.binarySearch(dup, 3);
        check(r >= 1 && r <= 4 && dup[r] == 3, "duplicates: returned index holds the target");

        int[] extreme = {Integer.MIN_VALUE, -100, 0, 17, Integer.MAX_VALUE};
        checkEq(ArrayBinarySearch.binarySearch(extreme, Integer.MIN_VALUE), 0, "INT_MIN");
        checkEq(ArrayBinarySearch.binarySearch(extreme, -100), 1, "negative");
        checkEq(ArrayBinarySearch.binarySearch(extreme, Integer.MAX_VALUE), 4, "INT_MAX");
        checkEq(ArrayBinarySearch.binarySearch(extreme, 12345), -1, "not found among extremes");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
