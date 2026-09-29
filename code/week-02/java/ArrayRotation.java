/* Week 2 -- Linked Lists, Arrays and Matrices
 * Rotate an array left by d positions with the reversal algorithm: reverse
 * the first d elements, reverse the rest, then reverse the whole thing.
 * Matches the array-rotation.js animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class ArrayRotation {
    static void reverse(int[] arr, int lo, int hi) {
        while (lo < hi) {
            int tmp = arr[lo];
            arr[lo] = arr[hi];
            arr[hi] = tmp;
            lo++;
            hi--;
        }
    }

    static void rotateLeft(int[] arr, int d) {
        int n = arr.length;
        if (n == 0)
            return;                     // empty array: nothing to rotate
        d = d % n;
        reverse(arr, 0, d - 1);        // reverse the first d elements
        reverse(arr, d, n - 1);        // reverse the remaining n-d elements
        reverse(arr, 0, n - 1);        // reverse the whole array
    }

    static void printArray(String label, int[] arr) {
        StringBuilder sb = new StringBuilder(label + ":");
        for (int v : arr) sb.append(' ').append(v);
        System.out.println(sb);
    }

    static void runScenario(String label, int[] arr, int d) {
        System.out.println("-- " + label + " --");
        printArray("before", arr);
        System.out.println("rotate_left(arr, " + arr.length + ", " + d + ")");
        rotateLeft(arr, d);
        printArray("after", arr);
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 12 values, d=4
        int[] normal = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120};
        runScenario("normal: 12 values, d=4", normal, 4);

        // hard: 15 values (negative/duplicate), d=7 (near half)
        int[] hard = {3, -8, 15, 3, 22, -1, 40, 9, -17, 26, 5, -30, 11, 3, 18};
        runScenario("hard: 15 values (negative/duplicate), d=7 (near half)", hard, 7);

        // edge: d=0: nothing should change
        int[] dZero = {4, 9, 15, 23, 2, 31, 8, 19, 6, 27};
        runScenario("edge: d=0: nothing should change", dZero, 0);

        // edge: d=n: d%n=0, still no change
        int[] dEqN = {5, 12, 18, 24, 3, 30, 9, 21, 15, 6};
        runScenario("edge: d=n: d%n=0, still no change", dEqN, 10);

        // edge: d>n: reduced by d%n (d=23, n=10 -> 3)
        int[] dGtN = {7, 14, 21, 2, 28, 9, 35, 16, 4, 22};
        runScenario("edge: d>n: reduced by d%n (d=23, n=10 -> 3)", dGtN, 23);
    }
}
