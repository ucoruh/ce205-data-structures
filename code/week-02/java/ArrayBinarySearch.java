/* Week 2 -- Linked Lists, Arrays and Matrices
 * Binary search in a sorted array.
 * CEN207 Data Structures (formerly CE205)
 */
public class ArrayBinarySearch {
    static int binarySearch(int[] arr, int target) {
        int lo = 0, hi = arr.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            System.out.println("  check index " + mid + ": value " + arr[mid]);
            if (arr[mid] == target)
                return mid;
            if (arr[mid] < target)
                lo = mid + 1;       // target is to the right
            else
                hi = mid - 1;       // target is to the left
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11, 13};

        System.out.println("sorted array: [1, 3, 5, 7, 9, 11, 13]");

        System.out.println("binary_search(9):");   // trace text matches the C program's output
        int a = binarySearch(arr, 9);
        System.out.println("-> index " + a);

        System.out.println("binary_search(4):");
        int b = binarySearch(arr, 4);
        System.out.println("-> index " + b);
    }
}
