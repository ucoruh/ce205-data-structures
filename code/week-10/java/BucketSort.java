/* Week 10 -- Sorting
 * Bucket sort: for values in [0, 99], distribute into 10 buckets by the
 * tens digit, sort each bucket with insertion sort, then concatenate.
 * Prints the bucket contents and the final result; comparisons/moves are
 * counted (comparisons come from the within-bucket insertion sorts).
 * CEN207 Data Structures (formerly CE205)
 */
public class BucketSort {
    static final int BUCKETS = 10;
    static final int MAX_N = 20;
    static int comparisons, moves;

    static String arrStr(int[] a, int n) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < n; i++) { sb.append(a[i]); if (i + 1 < n) sb.append(','); }
        sb.append(']');
        return sb.toString();
    }

    static void bucketSort(int[] a, int n, int maxVal) {
        int[][] bucket = new int[BUCKETS][MAX_N];
        int[] bucketLen = new int[BUCKETS];
        for (int i = 0; i < n; i++) {
            int b = (a[i] * BUCKETS) / (maxVal + 1);
            bucket[b][bucketLen[b]++] = a[i];
            moves++;
        }
        int k = 0;
        for (int b = 0; b < BUCKETS; b++) {
            for (int x = 1; x < bucketLen[b]; x++) {
                int key = bucket[b][x], y = x - 1;
                while (y >= 0) {
                    comparisons++;
                    if (bucket[b][y] <= key) break;
                    bucket[b][y + 1] = bucket[b][y];
                    moves++;
                    y--;
                }
                bucket[b][y + 1] = key;
            }
            if (bucketLen[b] > 0) System.out.println("  bucket[" + b + "] (" + (10 * b) + "-" + (10 * b + 9) + ") = " + arrStr(bucket[b], bucketLen[b]));
            for (int i = 0; i < bucketLen[b]; i++) { a[k++] = bucket[b][i]; moves++; }
        }
    }

    static void runScenario(String label, int[] a) {
        System.out.println("-- " + label + " --");
        System.out.println("before: " + arrStr(a, a.length));
        comparisons = 0; moves = 0;
        bucketSort(a, a.length, 99);
        System.out.println("after:  " + arrStr(a, a.length));
        System.out.println("total: " + comparisons + " comparisons, " + moves + " moves");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {42, 8, 77, 15, 91, 33, 56, 24, 68, 5};
        int[] hard = {42, 45, 8, 77, 71, 15, 91, 33, 38, 56, 24, 68, 5, 3};
        int[] sameBucket = {40, 41, 42, 43, 44, 45, 46, 47, 48, 49};
        int[] alreadySorted = {2, 12, 22, 33, 44, 55, 66, 77, 88, 99};

        runScenario("normal: 10 values, 0-99, spread well across the buckets", normal);
        runScenario("hard: 14 values, some buckets collide", hard);
        runScenario("edge: all in one bucket -- worst case, degrades to O(n^2)", sameBucket);
        runScenario("edge: already sorted", alreadySorted);
    }
}
