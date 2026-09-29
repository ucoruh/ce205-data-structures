/* Week 10 -- Sorting
 * Radix sort, least-significant-digit first (LSD): run a STABLE counting
 * sort on one decimal digit at a time, starting at the ones place, up to
 * the highest place any value needs. Always 10 buckets. Prints the array
 * after every digit pass. Zero comparisons; total writes are reported.
 * CEN207 Data Structures (formerly CE205)
 */
public class RadixSortLsd {
    static int getDigit(int x, int place) { return (x / place) % 10; }

    static void printArray(int[] a) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) { sb.append(a[i]); if (i + 1 < a.length) sb.append(','); }
        sb.append(']');
        System.out.println(sb);
    }

    static int radixSortLsd(int[] a, int n) {
        int writes = 0;
        if (n <= 0) return writes;    // empty array: nothing to do, a[0] would be out of bounds
        int maxVal = a[0];
        for (int i = 1; i < n; i++) if (a[i] > maxVal) maxVal = a[i];

        for (int place = 1; maxVal / place > 0; place *= 10) {
            int[] count = new int[10];
            for (int i = 0; i < n; i++) { count[getDigit(a[i], place)]++; writes++; }
            for (int d = 1; d < 10; d++) count[d] += count[d - 1];

            int[] output = new int[n];
            for (int i = n - 1; i >= 0; i--) {
                int dgt = getDigit(a[i], place);
                output[count[dgt] - 1] = a[i];
                writes++;
                count[dgt]--;
            }
            for (int i = 0; i < n; i++) a[i] = output[i];
            System.out.printf("  place=%-4d -> ", place);
            printArray(a);
        }
        return writes;
    }

    static void runScenario(String label, int[] a) {
        System.out.println("-- " + label + " --");
        System.out.print("before: ");
        printArray(a);
        int writes = radixSortLsd(a, a.length);
        System.out.print("after:  ");
        printArray(a);
        System.out.println("total: 0 comparisons, " + writes + " writes");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {329, 457, 657, 839, 436, 720, 355, 21, 8, 100};
        int[] hard = {5, 45, 802, 3, 66, 913, 27, 8, 150, 999, 12, 300, 4, 88};
        int[] alreadySorted = {1, 12, 23, 34, 45, 56, 67, 78, 89, 90};
        int[] singleDigit = {4, 2, 9, 1, 7, 3, 8, 0, 6, 5};

        runScenario("normal: 10 values, up to 3 digits, 3 passes", normal);
        runScenario("hard: 14 values, mixed digit lengths", hard);
        runScenario("edge: already sorted -- every pass still runs", alreadySorted);
        runScenario("edge: all single-digit values -- only one pass", singleDigit);
    }
}
