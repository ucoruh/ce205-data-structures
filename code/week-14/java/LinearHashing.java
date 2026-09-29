/* Week 14 -- File Organisation II
 * Linear hashing: no directory at all. Buckets split in round-robin order (bucket n, then
 * n+1, ...), triggered by ANY overflow; a key's address is a simple modulo, bumped to the
 * next level only when its home bucket has already been split this round.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
import java.util.ArrayList;
import java.util.List;

public class LinearHashing {
    static int address(int key, int n0, int level, int n) {
        int a = key % (n0 * (1 << level));
        if (a < n)
            a = key % (n0 * (1 << (level + 1)));
        return a;
    }

    static class Hash {
        List<List<Integer>> buckets = new ArrayList<>();
        int level;
        int n;
    }

    static void split(Hash h, int n0) {
        int newIndex = n0 * (1 << h.level) + h.n;
        List<Integer> old = h.buckets.get(h.n);
        h.buckets.set(h.n, new ArrayList<>());
        while (h.buckets.size() <= newIndex)
            h.buckets.add(new ArrayList<>());
        for (int k : old) {
            int a2 = k % (n0 * (1 << (h.level + 1)));
            h.buckets.get(a2 == newIndex ? newIndex : h.n).add(k);
        }
        h.n++;
        if (h.n == n0 * (1 << h.level)) {
            h.n = 0;
            h.level++;
        }
    }

    static void insertKey(Hash h, int n0, int capacity, int key) {
        int a = address(key, n0, h.level, h.n);
        h.buckets.get(a).add(key); // always fits: an overflowing bucket just grows
        if (h.buckets.get(a).size() > capacity)
            split(h, n0); // ANY overflow triggers splitting bucket n
    }

    static void runScenario(String label, int n0, int capacity, int[] keys) {
        System.out.println("-- " + label + " --");
        System.out.println("N0=" + n0 + " CAPACITY=" + capacity);
        Hash h = new Hash();
        for (int i = 0; i < n0; i++)
            h.buckets.add(new ArrayList<>());

        for (int key : keys)
            insertKey(h, n0, capacity, key);

        System.out.println("level=" + h.level + " n=" + h.n + " buckets=" + h.buckets.size());
        for (int b = 0; b < h.buckets.size(); b++) {
            StringBuilder sb = new StringBuilder("  bucket " + (b + 1) + ":");
            for (int k : h.buckets.get(b))
                sb.append(' ').append(k);
            System.out.println(sb);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normalKeys = {9, 20, 15, 3, 25, 12, 7, 30, 1, 18};
        runScenario("normal: N0=4, capacity=2, 10 keys", 4, 2, normalKeys);

        int[] hardKeys = {4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48};
        runScenario("hard: N0=4, capacity=2, 12 multiples of 4", 4, 2, hardKeys);

        int[] oneKeys = {0, 11, 22, 33, 44, 55, 66, 77, 88, 99};
        runScenario("edge: N0=10, exactly 1 key per bucket, no overflow", 10, 2, oneKeys);

        int[] tightKeys = {5, 3, 8, 2, 7, 4, 9, 6, 11, 10};
        runScenario("edge: N0=2, capacity=1, frequent splits", 2, 1, tightKeys);
    }
}
