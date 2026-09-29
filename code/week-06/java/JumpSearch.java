/* Week 6 -- Search and Hashing
 * Jump search: on a SORTED array, jump forward in fixed-size blocks
 * (block = floor(sqrt(n))) until a block boundary is >= target, then scan
 * that block linearly. Prints every jump and every comparison inside the
 * final block.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class JumpSearch {
    static int comparisons;

    static int jumpSearch(int[] arr, int target) {
        int n = arr.length;
        int block = (int) Math.sqrt(n);          // block size = floor(sqrt(n))
        if (block < 1) block = 1;
        int prev = 0, step = block;
        comparisons = 0;
        while (step < n) {                        // jump forward one block at a time
            comparisons++;
            System.out.println("  jump: check arr[" + (step - 1) + "] = " + arr[step - 1]);
            if (arr[step - 1] >= target) break;    // target may be in this block
            prev = step;
            step += block;
        }
        if (step > n) step = n;
        System.out.println("  scanning block [" + prev + ".." + step + ")");
        for (int i = prev; i < step; i++) {        // linear scan inside the block
            comparisons++;
            System.out.println("  compare arr[" + i + "] = " + arr[i]);
            if (arr[i] == target) return i;
            if (arr[i] > target) break;             // sorted: no need to look further
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
        int index = jumpSearch(arr, target);
        if (index == -1) System.out.println("result: not found, " + comparisons + " comparisons");
        else System.out.println("result: found at index " + index + ", " + comparisons + " comparisons");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] a = {2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62};

        runScenario("normal: 16 values, target found in the second block", a, 42);
        runScenario("hard: target near the last block, needs the most jumps", a, 58);
        runScenario("edge: target is smaller than every value", a, 1);
        runScenario("edge: target is larger than every value", a, 999);
        runScenario("edge: target is in range but not in the array", a, 45);
    }
}
