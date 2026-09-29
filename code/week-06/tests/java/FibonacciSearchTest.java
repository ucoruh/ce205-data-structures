/* Unit tests for week-06 java/FibonacciSearch.java, mirroring tests/c/test_fibonacci_search.c */
public class FibonacciSearchTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static int linearFind(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) if (arr[i] == target) return i;
        return -1;
    }

    static void checkSearch(String label, int[] arr, int target) {
        int got = FibonacciSearch.fibonacciSearch(arr, target);
        int comparisons = FibonacciSearch.comparisons;
        int expected = linearFind(arr, target);
        if (expected == -1) {
            checkEq(got, -1, label + " not found");
        } else {
            check(got >= 0 && got < arr.length, label + " index in range");
            if (got >= 0 && got < arr.length) checkEq(arr[got], target, label + " value at index");
        }
        check(comparisons >= 0, label + " comparisons >= 0");
        if (arr.length > 0) check(comparisons <= arr.length, label + " comparisons <= n");
    }

    public static void main(String[] args) {
        int[] normal = {3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63};

        // -- empty input --
        {
            int[] empty = new int[0];
            int got = FibonacciSearch.fibonacciSearch(empty, 39);
            checkEq(got, -1, "empty not found");
            checkEq(FibonacciSearch.comparisons, 0, "empty comparisons == 0");
        }

        // -- one element --
        checkSearch("one, found", new int[]{42}, 42);
        checkSearch("one, not found", new int[]{42}, 7);

        // -- two elements --
        checkSearch("two, first", new int[]{5, 9}, 5);
        checkSearch("two, last", new int[]{5, 9}, 9);
        checkSearch("two, missing", new int[]{5, 9}, 7);

        // -- three elements --
        int[] three = {1, 2, 3};
        checkSearch("three, first", three, 1);
        checkSearch("three, mid", three, 2);
        checkSearch("three, last", three, 3);
        checkSearch("three, missing", three, 5);

        // -- normal --
        checkSearch("normal, middle", normal, 39);
        checkSearch("normal, first element", normal, 3);
        checkSearch("normal, last element", normal, 63);
        checkSearch("normal, near-end target", normal, 59);
        checkSearch("normal, beyond last", normal, 999);
        checkSearch("normal, below first", normal, 0);
        checkSearch("normal, in range but absent", normal, 40);

        // -- leftover-element branch, n=17 --
        int[] seventeen = new int[17];
        for (int i = 0; i < 17; i++) seventeen[i] = i * 3;
        for (int t = 0; t < 17; t++) checkSearch("n=17 target idx " + t, seventeen, seventeen[t]);
        checkSearch("n=17, not found", seventeen, 100);

        // -- duplicates --
        int[] dup = {2, 2, 2, 5, 5, 8, 8, 8, 8, 11, 14, 14, 20, 20, 20, 25};
        checkSearch("duplicates, found run", dup, 8);
        checkSearch("duplicates, found single", dup, 11);
        checkSearch("duplicates, not found", dup, 6);

        // -- all equal --
        int[] allSame = {7, 7, 7, 7, 7, 7, 7, 7, 7, 7};
        checkSearch("all equal, found", allSame, 7);
        checkSearch("all equal, not found", allSame, 3);

        // -- extreme values --
        int[] extreme = {Integer.MIN_VALUE, -1000, -1, 0, 1, 1000, Integer.MAX_VALUE};
        checkSearch("extreme, INT_MIN", extreme, Integer.MIN_VALUE);
        checkSearch("extreme, INT_MAX", extreme, Integer.MAX_VALUE);
        checkSearch("extreme, zero", extreme, 0);
        checkSearch("extreme, not found", extreme, 500);

        // -- big n --
        int[] big = new int[64];
        for (int i = 0; i < 64; i++) big[i] = i * 2;
        for (int t = 0; t < 64; t += 7) checkSearch("big n scan", big, big[t]);
        checkSearch("big n, absent", big, 99);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
