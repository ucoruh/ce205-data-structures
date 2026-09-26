/* Week 1 -- Introduction to Data Structures
 * Space complexity: a recursive sum pushes one stack frame per call;
 * an iterative sum reuses a single set of variables.
 * Runs the same normal / hard / edge-case scenarios as the space-recursive-vs-iterative animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class SpaceRecursiveVsIterative {
    static int sumRecursive(int[] arr, int n) {
        if (n == 0)               // base case: 0 elements left
            return 0;
        return arr[n - 1] + sumRecursive(arr, n - 1);   // one stack frame per call
    }

    static int sumIterative(int[] arr, int n) {
        int total = 0;            // ONE set of variables, reused every iteration
        for (int i = 0; i < n; i++)
            total += arr[i];
        return total;
    }

    static void printArray(int[] arr) {
        StringBuilder sb = new StringBuilder("arr:");
        for (int v : arr) sb.append(' ').append(v);
        sb.append("  (n = ").append(arr.length).append(')');
        System.out.println(sb);
    }

    static void runScenario(String label, int[] arr) {
        System.out.println("-- " + label + " --");
        printArray(arr);
        int n = arr.length;
        System.out.println("sumRecursive -> " + sumRecursive(arr, n) + " (uses O(n) stack space: " + n + " frames)");
        System.out.println("sumIterative -> " + sumIterative(arr, n) + " (uses O(1) stack space: 1 frame, reused)");
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 10 positive values
        int[] normal = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        runScenario("normal: 10 positive values", normal);

        // hard: 20 values with mixed signs
        int[] hard = {5, -3, 12, 8, -7, 15, 22, -10, 6, 18, 9, -4, 11, 27, -15, 3, 19, -8, 14, 7};
        runScenario("hard: 20 values with mixed signs", hard);

        // edge: 10 negative values
        int[] allNegative = {-5, -10, -15, -20, -25, -30, -35, -40, -45, -50};
        runScenario("edge: 10 negative values", allNegative);

        // edge: 22 values, deep recursion
        int[] deep = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22};
        runScenario("edge: 22 values, deep recursion", deep);
    }
}
