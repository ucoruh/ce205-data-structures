/* Unit tests for week-06 java/InterpolationSearch.java, mirroring tests/c/test_interpolation_search.c */
public class InterpolationSearchTest {
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
        int got = InterpolationSearch.interpolationSearch(arr, target);
        int probes = InterpolationSearch.probes;
        int expected = linearFind(arr, target);
        if (expected == -1) {
            checkEq(got, -1, label + " not found");
        } else {
            check(got >= 0 && got < arr.length, label + " index in range");
            if (got >= 0 && got < arr.length) checkEq(arr[got], target, label + " value at index");
        }
        check(probes >= 0, label + " probes >= 0");
        if (arr.length > 0) check(probes <= arr.length, label + " probes <= n");
    }

    public static void main(String[] args) {
        int[] normal = {10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85};
        int[] allEqual = {42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42};
        int[] skewed = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1000000};

        // -- empty input --
        int[] empty = new int[0];
        {
            int got = InterpolationSearch.interpolationSearch(empty, 55);
            checkEq(got, -1, "empty not found");
            checkEq(InterpolationSearch.probes, 0, "empty probes == 0");
        }

        // -- one element --
        checkSearch("one, found", new int[]{42}, 42);
        checkSearch("one, not found", new int[]{42}, 7);

        // -- two elements --
        checkSearch("two, first", new int[]{5, 9}, 5);
        checkSearch("two, last", new int[]{5, 9}, 9);
        checkSearch("two, missing", new int[]{5, 9}, 7);

        // -- normal --
        checkSearch("normal, single-probe hit", normal, 55);
        checkSearch("normal, first element", normal, 10);
        checkSearch("normal, last element", normal, 85);
        checkSearch("normal, outside range below", normal, -5);
        checkSearch("normal, outside range above", normal, 999);
        checkSearch("normal, in range but absent", normal, 22);

        // -- hard --
        int[] hard = {10, 13, 21, 24, 33, 36, 44, 48, 55, 61, 68, 74, 81, 87, 94, 100};
        checkSearch("hard, several probes", hard, 81);
        checkSearch("hard, first", hard, 10);
        checkSearch("hard, last", hard, 100);
        checkSearch("hard, absent", hard, 82);

        // -- skewed --
        checkSearch("skewed, small value many probes", skewed, 8);
        checkSearch("skewed, huge last value", skewed, 1000000);
        checkSearch("skewed, absent", skewed, 500);

        // -- all equal: guard triggers on the first probe --
        {
            int got = InterpolationSearch.interpolationSearch(allEqual, 42);
            checkEq(got, 0, "all equal, found at lo");
            checkEq(InterpolationSearch.probes, 1, "all equal, 1 probe");
            checkSearch("all equal, not found", allEqual, 7);
        }

        // -- two equal values --
        {
            int[] twoEq = {9, 9};
            int got = InterpolationSearch.interpolationSearch(twoEq, 9);
            checkEq(got, 0, "two equal, found at lo");
            checkEq(InterpolationSearch.probes, 1, "two equal, 1 probe");
        }

        // -- duplicates --
        int[] dup = {2, 2, 2, 5, 5, 8, 8, 8, 8, 11, 14, 14, 20, 20, 20, 25};
        checkSearch("duplicates, found run", dup, 8);
        checkSearch("duplicates, found single", dup, 11);
        checkSearch("duplicates, not found", dup, 6);

        // -- extreme values --
        int[] extreme = {Integer.MIN_VALUE, -1000, -1, 0, 1, 1000, Integer.MAX_VALUE};
        checkSearch("extreme, INT_MIN", extreme, Integer.MIN_VALUE);
        checkSearch("extreme, INT_MAX", extreme, Integer.MAX_VALUE);
        checkSearch("extreme, zero", extreme, 0);
        checkSearch("extreme, not found", extreme, 500);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
