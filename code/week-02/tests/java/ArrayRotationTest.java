// Unit tests for code/week-02/java/ArrayRotation.java: rotateLeft() (and its reverse() helper).
// Independent oracle: rotating left by d means result[i] = original[(i+d) % n] for every i --
// computed by hand into an expected[] array below, never by calling rotateLeft() itself.
public class ArrayRotationTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void checkRotation(String label, int[] arr, int d, int[] expected) {
        ArrayRotation.rotateLeft(arr, d);
        for (int i = 0; i < arr.length; i++)
            check(arr[i] == expected[i], label + " index " + i + " (got " + arr[i] + ", expected " + expected[i] + ")");
    }

    public static void main(String[] args) {
        int[] normal = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120};
        int[] normalExpected = {50, 60, 70, 80, 90, 100, 110, 120, 10, 20, 30, 40};
        checkRotation("normal d=4", normal, 4, normalExpected);

        int[] dZero = {4, 9, 15, 23, 2, 31, 8, 19, 6, 27};
        int[] dZeroExpected = {4, 9, 15, 23, 2, 31, 8, 19, 6, 27};
        checkRotation("d=0", dZero, 0, dZeroExpected);

        int[] dEqN = {5, 12, 18, 24, 3, 30, 9, 21, 15, 6};
        int[] dEqNExpected = {5, 12, 18, 24, 3, 30, 9, 21, 15, 6};
        checkRotation("d=n", dEqN, 10, dEqNExpected);

        int[] dGtN = {7, 14, 21, 2, 28, 9, 35, 16, 4, 22};
        int[] dGtNExpected = {2, 28, 9, 35, 16, 4, 22, 7, 14, 21};
        checkRotation("d>n", dGtN, 23, dGtNExpected);

        int[] empty = {};
        ArrayRotation.rotateLeft(empty, 5);
        check(true, "empty array with d=5 did not crash");
        ArrayRotation.rotateLeft(empty, 0);
        check(true, "empty array with d=0 did not crash");

        int[] one = {77};
        checkRotation("one element d=0", one, 0, new int[]{77});
        int[] one2 = {77};
        checkRotation("one element d=1", one2, 1, new int[]{77});
        int[] one3 = {77};
        checkRotation("one element large d", one3, 999, new int[]{77});

        int[] two = {1, 2};
        checkRotation("two elements d=1", two, 1, new int[]{2, 1});

        int[] hard = {3, -8, 15, 3, 22, -1, 40, 9, -17, 26, 5, -30, 11, 3, 18};
        int[] hardExpected = new int[15];
        for (int i = 0; i < 15; i++) hardExpected[i] = hard[(i + 7) % 15];
        checkRotation("hard d=7", hard, 7, hardExpected);

        int[] extreme = {Integer.MAX_VALUE, Integer.MIN_VALUE, 0, 5, -5};
        int[] extremeExpected = new int[5];
        for (int i = 0; i < 5; i++) extremeExpected[i] = extreme[(i + 2) % 5];
        checkRotation("extreme values d=2", extreme, 2, extremeExpected);

        int[] rev = {50, 40, 30, 20, 10};
        int[] revExpected = new int[5];
        for (int i = 0; i < 5; i++) revExpected[i] = rev[(i + 3) % 5];
        checkRotation("reverse-sorted d=3", rev, 3, revExpected);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
