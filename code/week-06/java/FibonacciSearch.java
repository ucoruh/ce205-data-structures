/* Week 6 -- Search and Hashing
 * Fibonacci search: on a SORTED array, split the range using Fibonacci
 * numbers instead of the middle (binary search) or a formula
 * (interpolation search). Uses only addition and subtraction. Prints the
 * Fibonacci triple and every probe.
 * CEN207 Data Structures (formerly CE205)
 */
public class FibonacciSearch {
    static int comparisons;

    static int fibonacciSearch(int[] arr, int target) {
        int n = arr.length;
        int fib2 = 0, fib1 = 1, fib = fib1 + fib2;      // smallest Fibonacci number >= n
        while (fib < n) { int t = fib1 + fib; fib2 = fib1; fib1 = fib; fib = t; }
        System.out.println("  smallest fib >= n: fib=" + fib + " fib1=" + fib1 + " fib2=" + fib2);

        int offset = -1;
        comparisons = 0;
        while (fib > 1) {
            int i = (offset + fib2 < n - 1) ? offset + fib2 : n - 1;
            comparisons++;
            System.out.println("  probe " + comparisons + ": i=" + i + " arr[i]=" + arr[i]
                    + " (fib=" + fib + " fib1=" + fib1 + " fib2=" + fib2 + " offset=" + offset + ")");
            if (arr[i] < target) {                       // eliminate the left part
                fib = fib1; fib1 = fib2; fib2 = fib - fib1;
                offset = i;
            } else if (arr[i] > target) {                // eliminate the right part
                fib = fib2; fib1 = fib1 - fib2; fib2 = fib - fib1;
            } else {
                return i;
            }
        }
        if (fib1 == 1 && offset + 1 < n) {                // one element may be left over
            comparisons++;
            System.out.println("  probe " + comparisons + ": one element left over, i=" + (offset + 1) + " arr[i]=" + arr[offset + 1]);
            if (arr[offset + 1] == target) return offset + 1;
        }
        return -1;
    }

    static void printArray(int[] arr) {
        StringBuilder sb = new StringBuilder("arr =");
        for (int v : arr) sb.append(' ').append(v);
        System.out.println(sb);
    }

    static void runScenario(String label, int[] arr, int target) {
        System.out.println("-- " + label + " --");
        printArray(arr);
        System.out.println("target = " + target);
        int index = fibonacciSearch(arr, target);
        if (index == -1) System.out.println("result: not found, " + comparisons + " comparisons");
        else System.out.println("result: found at index " + index + ", " + comparisons + " comparisons");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] a = {3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63};

        runScenario("normal: 16 values, target found around the middle", a, 39);
        runScenario("hard: target near the end, needs several splits", a, 59);
        runScenario("edge: target is the first element", a, 3);
        runScenario("edge: target is larger than the last element", a, 999);
        runScenario("edge: target is in range but not in the array", a, 40);
    }
}
