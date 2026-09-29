// Unit tests for code/week-02/java/SkipList.java: insert() and search().
// Independent oracle: (1) search's found/not-found result is cross-checked against a brute-force linear
// scan of the inserted values (a completely different algorithm from the level-skipping walk);
// (2) the level-0 sorted order is cross-checked against an insertion sort of the inserted values (also a
// different algorithm), never against search()'s own idea of what is present.
public class SkipListTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static boolean bruteContains(int[] values, int target) {
        for (int v : values) if (v == target) return true;
        return false;
    }

    static int[] insertionSort(int[] a) {
        int[] r = a.clone();
        for (int i = 1; i < r.length; i++) {
            int key = r[i], j = i - 1;
            while (j >= 0 && r[j] > key) { r[j + 1] = r[j]; j--; }
            r[j + 1] = key;
        }
        return r;
    }

    static void assertSortedOrder(String label, SkipList.SList sl, int[] inserted) {
        int[] expected = insertionSort(inserted);
        SkipList.Node cur = sl.header.forward[0];
        for (int i = 0; i < expected.length; i++) {
            if (cur == null) { check(false, label + ": level-0 list too short at " + i); return; }
            check(cur.value == expected[i], label + ": level-0[" + i + "] (got " + cur.value + ", expected " + expected[i] + ")");
            cur = cur.forward[0];
        }
        check(cur == null, label + ": level-0 list longer than expected");
    }

    public static void main(String[] args) {
        SkipList.SList sl = new SkipList.SList();
        int[] normalV = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        int[] normalL = {1, 2, 1, 2, 1, 2, 1, 2, 1, 2};
        for (int i = 0; i < 10; i++) SkipList.insert(sl, normalV[i], normalL[i], false);
        assertSortedOrder("normal", sl, normalV);
        check(SkipList.search(sl, 80).found == bruteContains(normalV, 80), "80 matches brute force");
        check(SkipList.search(sl, 80).found, "80 found");
        check(SkipList.search(sl, 999).found == bruteContains(normalV, 999), "999 matches brute force");
        check(!SkipList.search(sl, 999).found, "999 not found");
        check(SkipList.search(sl, 10).found, "first key found");
        check(SkipList.search(sl, 100).found, "last key found");

        SkipList.SList empty = new SkipList.SList();
        check(!SkipList.search(empty, 5).found, "empty skip list: not found, no crash");

        SkipList.SList single = new SkipList.SList();
        SkipList.insert(single, 42, 1, false);
        check(SkipList.search(single, 42).found, "single key found");
        check(!SkipList.search(single, 7).found, "single key: other value not found");

        SkipList.SList flat = new SkipList.SList();
        int[] flatV = {5, 3, 9, 1, 7};
        int[] flatL = {1, 1, 1, 1, 1};
        for (int i = 0; i < 5; i++) SkipList.insert(flat, flatV[i], flatL[i], false);
        assertSortedOrder("no express lane", flat, flatV);
        check(SkipList.search(flat, 1).found, "flat: min found");
        check(SkipList.search(flat, 9).found, "flat: max found");
        check(!SkipList.search(flat, 4).found, "flat: absent value not found");

        SkipList.SList dup = new SkipList.SList();
        int[] dupV = {10, 20, 10, 30};
        int[] dupL = {1, 2, 1, 1};
        for (int i = 0; i < 4; i++) SkipList.insert(dup, dupV[i], dupL[i], false);
        assertSortedOrder("duplicates", dup, dupV);
        check(SkipList.search(dup, 10).found, "duplicate key found");

        SkipList.SList neg = new SkipList.SList();
        int[] negV = {50, -20, 10, -20, 30};
        int[] negL = {1, 2, 1, 1, 2};
        for (int i = 0; i < 5; i++) SkipList.insert(neg, negV[i], negL[i], false);
        assertSortedOrder("negative values, out of order", neg, negV);
        check(SkipList.search(neg, -20).found, "negative key found");
        check(!SkipList.search(neg, -999).found, "negative absent key not found");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
