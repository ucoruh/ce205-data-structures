/* Week 1 -- Introduction to Data Structures
 * Count the operations of a nested loop to build T(n) by hand, for three loop shapes:
 * square (j < n), triangle (j < i), and halving (j *= 2).
 * Runs the same normal / hard / edge-case scenarios as the nested-loop-counting animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class NestedLoopCounting {
    static long operations;

    static long tSquare(int n) {
        long count = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                count++;
                operations++;
            }
        }
        return count;
    }

    static long tTriangle(int n) {
        long count = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                count++;
                operations++;
            }
        }
        return count;
    }

    static long tHalving(int n) {
        long count = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 1; j < n; j *= 2) {
                count++;
                operations++;
            }
        }
        return count;
    }

    interface CounterFn {
        long apply(int n);
    }

    static void runScenario(String label, CounterFn f, String shape, int[] ns) {
        System.out.println("-- " + label + " (" + shape + ") --");
        for (int n : ns) {
            operations = 0;
            long total = f.apply(n);
            System.out.println("n = " + n + ": inner body ran " + operations + " times, total = " + total);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: square loop, n = 3 in detail, then 9 more n values
        int[] normalNs = {3, 4, 5, 6, 8, 10, 12, 16, 20, 25};
        runScenario("normal: square loop", NestedLoopCounting::tSquare, "square, j < n", normalNs);

        // hard: triangle loop, n = 4 in detail, then 10 more n values
        int[] hardNs = {4, 5, 6, 8, 10, 14, 18, 24, 32, 40, 50};
        runScenario("hard: triangle loop", NestedLoopCounting::tTriangle, "triangle, j < i", hardNs);

        // edge: halving loop, n = 1 (zero executions)
        int[] halvingNs = {1, 2, 4, 8, 16, 32, 64, 128, 256, 512};
        runScenario("edge: halving loop, n = 1 (zero executions)", NestedLoopCounting::tHalving, "halving, j *= 2", halvingNs);

        // edge: square loop, Fibonacci-spaced n values
        int[] fibNs = {2, 3, 5, 8, 13, 21, 34, 55, 89, 144};
        runScenario("edge: square loop, Fibonacci-spaced n values", NestedLoopCounting::tSquare, "square, j < n", fibNs);
    }
}
