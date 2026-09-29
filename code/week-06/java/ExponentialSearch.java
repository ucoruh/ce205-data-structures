/* Week 6 -- Search and Hashing
 * Exponential search: on a SORTED array, double a bound (1, 2, 4, 8, ...)
 * until it overshoots target, then run ordinary binary search inside
 * [bound/2, bound]. Prints the bound-finding phase and the binary-search
 * phase.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class ExponentialSearch {
    static int comparisons;

    static int exponentialSearch(int[] arr, int target) {
        int n = arr.length;
        comparisons = 1;                 // the arr[0] check below counts as comparison #1
        System.out.println("  check arr[0] = " + arr[0]);
        if (arr[0] == target) return 0;
        int bound = 1;
        while (bound < n) {                 // double the bound until it overshoots target
            comparisons++;
            System.out.println("  bound = " + bound + ": check arr[" + bound + "] = " + arr[bound]);
            if (arr[bound] >= target) break;
            bound *= 2;
        }
        int lo = bound / 2, hi = (bound < n) ? bound : n - 1;
        System.out.println("  binary search inside [" + lo + ".." + hi + "]");
        while (lo <= hi) {                  // ordinary binary search inside [lo..hi]
            int mid = lo + (hi - lo) / 2;
            comparisons++;
            System.out.println("  compare arr[" + mid + "] = " + arr[mid]);
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) lo = mid + 1;
            else hi = mid - 1;
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
        int index = exponentialSearch(arr, target);
        if (index == -1) System.out.println("result: not found, " + comparisons + " comparisons");
        else System.out.println("result: found at index " + index + ", " + comparisons + " comparisons");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] a = {3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63};

        runScenario("normal: 16 values, target found around the middle", a, 39);
        runScenario("hard: target near the end, the bound doubles several times", a, 59);
        runScenario("edge: target is the first element, a single comparison", a, 3);
        runScenario("edge: target is larger than the last element", a, 999);
        runScenario("edge: target is in range but not in the array", a, 40);
    }
}
