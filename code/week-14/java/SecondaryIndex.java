/* Week 14 -- File Organisation II
 * Dense secondary index: one index entry per RECORD, sorted by a key that repeats.
 * CEN207 Data Structures (formerly CE205)
 */
import java.util.Arrays;
import java.util.Comparator;

public class SecondaryIndex {
    static final int MAX_RECORDS = 16;

    static class IndexEntry {
        int key;
        int slot;
        IndexEntry(int key, int slot) { this.key = key; this.slot = slot; }
    }

    // Search a dense, sorted index for every record whose key matches; matching entries cluster
    // together because the index is sorted, so a single pass collects them all.
    static int searchDense(IndexEntry[] index, int n, int key, int[] matches, int maxMatches) {
        int count = 0;
        for (int i = 0; i < n; i++) {
            if (index[i].key == key) {
                if (count < maxMatches)
                    matches[count] = index[i].slot; // remember which record matched
                count++;
            } else if (count > 0) {
                break; // dense + sorted: matches always cluster together
            }
        }
        return count;
    }

    static void runScenario(String label, int[] keys, int block, int[] queries) {
        System.out.println("-- " + label + " --");
        System.out.println("records: " + keys.length + ", block=" + block);

        IndexEntry[] index = new IndexEntry[keys.length];
        for (int i = 0; i < keys.length; i++)
            index[i] = new IndexEntry(keys[i], i);
        Arrays.sort(index, Comparator.<IndexEntry>comparingInt(e -> e.key).thenComparingInt(e -> e.slot));

        for (int q : queries) {
            int[] matches = new int[MAX_RECORDS];
            int count = searchDense(index, keys.length, q, matches, MAX_RECORDS);
            StringBuilder sb = new StringBuilder("search(" + q + ") -> " + count + " match(es):");
            for (int i = 0; i < count; i++) {
                int slot = matches[i];
                sb.append(" page").append(slot / block + 1).append(".slot").append(slot % block);
            }
            System.out.println(sb);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normalKeys = {3, 1, 4, 1, 2, 3, 1, 4, 2, 3, 1, 4};
        int[] normalQ = {1, 5, 4};
        runScenario("normal: 12 records, block=4", normalKeys, 4, normalQ);

        int[] hardKeys = {2, 5, 1, 3, 5, 4, 1, 5, 2, 3, 5, 1, 4, 2};
        int[] hardQ = {5, 9, 4};
        runScenario("hard: 14 records, block=3", hardKeys, 3, hardQ);

        int[] sameKeys = {7, 7, 7, 7, 7, 7, 7, 7, 7, 7};
        int[] sameQ = {7, 3};
        runScenario("edge: all 10 records share one key", sameKeys, 4, sameQ);

        int[] uniqueKeys = {40, 10, 30, 20, 50, 15, 25, 35, 45, 5};
        int[] uniqueQ = {30, 99, 5};
        runScenario("edge: no duplicate keys", uniqueKeys, 5, uniqueQ);
    }
}
