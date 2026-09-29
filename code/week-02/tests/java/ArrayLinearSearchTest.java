// Unit tests for code/week-02/java/ArrayLinearSearch.java: linearSearch().
import java.util.Arrays;

public class ArrayLinearSearchTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }

    public static void main(String[] args) {
        int[] a = {5, 2, 9, 1, 7};
        checkEq(ArrayLinearSearch.linearSearch(a, 9), 2, "middle");
        checkEq(ArrayLinearSearch.linearSearch(a, 5), 0, "first");
        checkEq(ArrayLinearSearch.linearSearch(a, 7), 4, "last");
        checkEq(ArrayLinearSearch.linearSearch(a, 4), -1, "not found");

        int[] empty = {};
        checkEq(ArrayLinearSearch.linearSearch(empty, 5), -1, "empty array");

        int[] one = {42};
        checkEq(ArrayLinearSearch.linearSearch(one, 42), 0, "one element found");
        checkEq(ArrayLinearSearch.linearSearch(one, 7), -1, "one element not found");

        int[] two = {10, 20};
        checkEq(ArrayLinearSearch.linearSearch(two, 10), 0, "two elements first");
        checkEq(ArrayLinearSearch.linearSearch(two, 20), 1, "two elements second");
        checkEq(ArrayLinearSearch.linearSearch(two, 30), -1, "two elements not found");

        int[] dup = {3, 8, 3, 8, 3};
        checkEq(ArrayLinearSearch.linearSearch(dup, 3), 0, "duplicates first match (3)");
        checkEq(ArrayLinearSearch.linearSearch(dup, 8), 1, "duplicates first match (8)");

        int[] extreme = {-100, 0, Integer.MAX_VALUE, Integer.MIN_VALUE, 17};
        checkEq(ArrayLinearSearch.linearSearch(extreme, -100), 0, "negative value");
        checkEq(ArrayLinearSearch.linearSearch(extreme, Integer.MAX_VALUE), 2, "INT_MAX");
        checkEq(ArrayLinearSearch.linearSearch(extreme, Integer.MIN_VALUE), 3, "INT_MIN");
        checkEq(ArrayLinearSearch.linearSearch(extreme, 17), 4, "last extreme");

        int[] sorted = {1, 3, 5, 7, 9};
        checkEq(ArrayLinearSearch.linearSearch(sorted, 7), 3, "sorted array");
        checkEq(ArrayLinearSearch.linearSearch(sorted, 2), -1, "sorted array not found");

        int[] rev = {9, 7, 5, 3, 1};
        checkEq(ArrayLinearSearch.linearSearch(rev, 1), 4, "reverse-sorted array");
        checkEq(ArrayLinearSearch.linearSearch(rev, 9), 0, "reverse-sorted array first");

        int[] prefix = Arrays.copyOf(new int[]{1, 2, 3, 4, 5, 6, 7}, 3);
        checkEq(ArrayLinearSearch.linearSearch(prefix, 5), -1, "value past the searched prefix");
        checkEq(ArrayLinearSearch.linearSearch(prefix, 2), 1, "value inside the searched prefix");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
