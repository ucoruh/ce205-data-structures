/* Unit tests for week-06 java/JumpSearch.java, mirroring tests/c/test_jump_search.c */
public class JumpSearchTest {
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
        int got = JumpSearch.jumpSearch(arr, target);
        int comparisons = JumpSearch.comparisons;
        int expected = linearFind(arr, target);
        if (expected == -1) {
            checkEq(got, -1, label + " not found");
        } else {
            check(got >= 0 && got < arr.length, label + " index in range");
            if (got >= 0 && got < arr.length) checkEq(arr[got], target, label + " value at index");
        }
        check(comparisons >= 0, label + " comparisons >= 0");
        if (arr.length > 0) check(comparisons <= arr.length + 32, label + " comparisons sane bound");
    }

    public static void main(String[] args) {
        int[] normal = {2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62};

        // -- empty input --
        int[] empty = new int[0];
        {
            int got = JumpSearch.jumpSearch(empty, 42);
            checkEq(got, -1, "empty not found");
            checkEq(JumpSearch.comparisons, 0, "empty comparisons == 0");
        }

        // -- one element --
        checkSearch("one, found", new int[]{42}, 42);
        checkSearch("one, not found", new int[]{42}, 7);

        // -- two elements --
        checkSearch("two, first", new int[]{5, 9}, 5);
        checkSearch("two, last", new int[]{5, 9}, 9);
        checkSearch("two, missing", new int[]{5, 9}, 7);

        // -- three/four elements --
        int[] three = {1, 4, 7};
        for (int t : three) checkSearch("three scan", three, t);
        checkSearch("three, absent", three, 5);
        int[] four = {1, 4, 7, 10};
        for (int t : four) checkSearch("four scan", four, t);
        checkSearch("four, absent", four, 5);

        // -- normal --
        checkSearch("normal, second block", normal, 42);
        checkSearch("normal, near last block", normal, 58);
        checkSearch("normal, first element", normal, 2);
        checkSearch("normal, last element", normal, 62);
        checkSearch("normal, smaller than every value", normal, 1);
        checkSearch("normal, larger than every value", normal, 999);
        checkSearch("normal, in range but absent", normal, 45);

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
        int[] big = new int[81];
        for (int i = 0; i < 81; i++) big[i] = i * 3;
        for (int t = 0; t < 81; t += 11) checkSearch("big n scan", big, big[t]);
        checkSearch("big n, absent", big, 5);
        checkSearch("big n, last", big, big[80]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
