/* Week 14 -- File Organisation II
 * Extendible hashing: an in-memory directory of 2^global_depth pointers selects a bucket by
 * the key's last global_depth bits; a full bucket splits, doubling the directory first if its
 * local_depth had caught up to global_depth.
 * CEN207 Data Structures (formerly CE205)
 */
import java.util.ArrayList;
import java.util.List;

public class ExtendibleHashing {
    static class Bucket {
        List<Integer> keys = new ArrayList<>();
        int localDepth;
    }

    static int lastBits(int key, int depth) { return depth == 0 ? 0 : (key & ((1 << depth) - 1)); }

    static class Hash {
        List<Bucket> buckets = new ArrayList<>();
        List<Integer> dir = new ArrayList<>();
        int globalDepth;
    }

    static void insertKey(Hash h, int capacity, int key) {
        int idx = lastBits(key, h.globalDepth);
        int b = h.dir.get(idx);
        Bucket bucket = h.buckets.get(b);
        if (bucket.keys.size() < capacity) {
            bucket.keys.add(key); // room: just write
            return;
        }
        if (bucket.localDepth == h.globalDepth) {
            int oldSize = h.dir.size();
            for (int i = 0; i < oldSize; i++)
                h.dir.add(h.dir.get(i)); // every slot duplicated; memory only
            h.globalDepth++;
        }
        bucket.localDepth++;
        int nb = h.buckets.size();
        Bucket newBucket = new Bucket();
        newBucket.localDepth = bucket.localDepth;
        h.buckets.add(newBucket);
        int splitBit = bucket.localDepth - 1;
        for (int i = 0; i < h.dir.size(); i++)
            if (h.dir.get(i) == b && ((i >> splitBit) & 1) == 1)
                h.dir.set(i, nb);
        List<Integer> oldKeys = bucket.keys;
        bucket.keys = new ArrayList<>();
        for (int k : oldKeys) {
            if (((k >> splitBit) & 1) == 1)
                newBucket.keys.add(k);
            else
                bucket.keys.add(k);
        }
        insertKey(h, capacity, key); // retry
    }

    static void runScenario(String label, int capacity, int[] keys) {
        System.out.println("-- " + label + " --");
        System.out.println("CAPACITY=" + capacity);
        Hash h = new Hash();
        Bucket b0 = new Bucket();
        h.buckets.add(b0);
        h.dir.add(0);

        for (int key : keys)
            insertKey(h, capacity, key);

        System.out.println("global_depth=" + h.globalDepth + " directory_size=" + h.dir.size() + " buckets=" + h.buckets.size());
        for (int b = 0; b < h.buckets.size(); b++) {
            StringBuilder sb = new StringBuilder("  bucket " + (b + 1) + " (local_depth=" + h.buckets.get(b).localDepth + "):");
            for (int k : h.buckets.get(b).keys)
                sb.append(' ').append(k);
            System.out.println(sb);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normalKeys = {9, 20, 15, 3, 25, 12, 7, 30, 1, 18};
        runScenario("normal: capacity=2, 10 keys", 2, normalKeys);

        int[] hardKeys = {1, 3, 5, 7, 9, 11, 13, 17, 19, 21, 23, 25};
        runScenario("hard: capacity=2, 12 odd numbers", 2, hardKeys);

        int[] skewedKeys = {8, 24, 40, 56, 72, 88, 104, 120, 136, 152};
        runScenario("edge: all keys are 8 mod 16 -- cascading splits", 2, skewedKeys);

        int[] neverKeys = {41, 7, 23, 58, 14, 33, 2, 47, 19, 36};
        runScenario("edge: capacity=10, never splits", 10, neverKeys);
    }
}
