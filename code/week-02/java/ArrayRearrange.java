/* Week 2 -- Linked Lists, Arrays and Matrices
 * Rearrange an array in place: every negative value ends up left of every
 * non-negative value, using two pointers walking toward each other (the
 * same shape as a quicksort partition). Matches the array-rearrange.js
 * animation.
 * CEN207 Data Structures (formerly CE205)
 */
public class ArrayRearrange {
    static void segregate(int[] arr) {
        int left = 0, right = arr.length - 1;
        while (left < right) {
            while (left < right && arr[left] < 0)
                left++;                 // already negative: leave it
            while (left < right && arr[right] >= 0)
                right--;                // already non-negative: leave it
            if (left < right) {
                int tmp = arr[left];
                arr[left] = arr[right];
                arr[right] = tmp;
                left++;
                right--;
            }
        }
    }

    static void printArray(String label, int[] arr) {
        StringBuilder sb = new StringBuilder(label + ":");
        for (int v : arr) sb.append(' ').append(v);
        System.out.println(sb);
    }

    static void runScenario(String label, int[] arr) {
        System.out.println("-- " + label + " --");
        printArray("before", arr);
        segregate(arr);
        printArray("after ", arr);
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 12 values, mixed sign
        int[] normal = {12, -7, 5, -3, 9, -1, -8, 6, 15, -20, 3, -4};
        runScenario("normal: 12 values, mixed sign", normal);

        // hard: 15 values with zeros and duplicates (0 does NOT count as negative)
        int[] hard = {0, -5, 3, -5, 0, 8, -12, 0, 4, -3, 7, -7, 0, 9, -2};
        runScenario("hard: 15 values with zeros and duplicates (0 does NOT count as negative)", hard);

        // edge: all negative: no swap is ever needed
        int[] allNegative = {-3, -8, -1, -15, -22, -4, -9, -17, -2, -6};
        runScenario("edge: all negative: no swap is ever needed", allNegative);

        // edge: all non-negative (0 included): no swap is ever needed
        int[] allNonnegative = {4, 0, 9, 15, 2, 8, 0, 11, 6, 3};
        runScenario("edge: all non-negative (0 included): no swap is ever needed", allNonnegative);

        // edge: already segregated: the pointers cross without any swap
        int[] already = {-5, -3, -8, -1, -9, 2, 4, 6, 8, 10, 12, 14};
        runScenario("edge: already segregated: the pointers cross without any swap", already);
    }
}
