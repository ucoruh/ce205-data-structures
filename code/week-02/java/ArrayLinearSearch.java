/* Week 2 -- Linked Lists, Arrays and Matrices
 * Linear search in an (unsorted) array.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class ArrayLinearSearch {
    static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            System.out.println("  check index " + i + ": value " + arr[i]);
            if (arr[i] == target)
                return i;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {5, 2, 9, 1, 7};

        System.out.println("array: [5, 2, 9, 1, 7]");

        System.out.println("linear_search(9):");   // trace text matches the C program's output
        int a = linearSearch(arr, 9);
        System.out.println("-> index " + a);

        System.out.println("linear_search(4):");
        int b = linearSearch(arr, 4);
        System.out.println("-> index " + b);
    }
}
