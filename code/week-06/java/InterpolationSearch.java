/* Week 6 -- Search and Hashing
 * Interpolation search: on a SORTED, roughly uniform array, estimate where
 * the target should be with a formula instead of always checking the
 * middle. A guard avoids dividing by zero when the current range is all one
 * value. Prints every probe.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class InterpolationSearch {
    static int probes;

    static int interpolationSearch(int[] arr, int target) {
        int lo = 0, hi = arr.length - 1;
        probes = 0;
        while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
            probes++;
            if (arr[hi] == arr[lo]) {                 // guard: avoid division by zero
                System.out.println("  probe " + probes + ": arr[hi] == arr[lo] (" + arr[lo] + "), guard triggered");
                return lo;                            // target must equal arr[lo] here
            }
            int pos = lo + (int) ((double) (target - arr[lo]) * (hi - lo) / (arr[hi] - arr[lo]));
            System.out.println("  probe " + probes + ": lo=" + lo + " hi=" + hi + " pos=" + pos + " arr[pos]=" + arr[pos]);
            if (arr[pos] == target) return pos;
            if (arr[pos] < target) lo = pos + 1;
            else hi = pos - 1;
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
        int index = interpolationSearch(arr, target);
        if (index == -1) System.out.println("result: not found, " + probes + " probes");
        else System.out.println("result: found at index " + index + ", " + probes + " probes");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85};
        int[] hard = {10, 13, 21, 24, 33, 36, 44, 48, 55, 61, 68, 74, 81, 87, 94, 100};
        int[] skewed = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1000000};
        int[] allEqual = {42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42};

        runScenario("normal: uniformly spread 16 values, found in a single probe", normal, 55);
        runScenario("hard: slightly uneven spacing, needs a few probes", hard, 81);
        runScenario("edge: skewed data, last value is huge, many probes", skewed, 8);
        runScenario("edge: all values equal, the division guard kicks in", allEqual, 42);
        runScenario("edge: target is entirely outside the range, rejected on sight", normal, 999);
    }
}
