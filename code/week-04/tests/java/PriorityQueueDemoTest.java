/* Unit tests for week-04 java/PriorityQueueDemo.java, mirroring tests/c/test_priority_queue_demo.c */
public class PriorityQueueDemoTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static int[] mId = new int[20], mKey = new int[20];
    static int mN;
    static void mReset() { mN = 0; }
    static void mAdd(int id, int key) { mId[mN] = id; mKey[mN] = key; mN++; }
    static void mRemove(int id) {
        for (int i = 0; i < mN; i++) if (mId[i] == id) { mId[i] = mId[mN - 1]; mKey[i] = mKey[mN - 1]; mN--; return; }
    }
    static void mUpdate(int id, int newKey) {
        for (int i = 0; i < mN; i++) if (mId[i] == id) { mKey[i] = newKey; return; }
    }
    static int mBestIdx() {
        int bi = 0;
        for (int i = 1; i < mN; i++) if (PriorityQueueDemo.kindIsMax ? mKey[i] > mKey[bi] : mKey[i] < mKey[bi]) bi = i;
        return bi;
    }
    static int mBestId() { return mId[mBestIdx()]; }
    static int mBestKey() { return mKey[mBestIdx()]; }
    static boolean isValidHeap() {
        for (int i = 1; i < PriorityQueueDemo.size; i++) {
            int p = (i - 1) / 2;
            if (PriorityQueueDemo.kindIsMax ? (PriorityQueueDemo.heap[i].key > PriorityQueueDemo.heap[p].key)
                                             : (PriorityQueueDemo.heap[i].key < PriorityQueueDemo.heap[p].key)) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        // -- insert + peek --
        PriorityQueueDemo.size = 0; PriorityQueueDemo.kindIsMax = false; mReset();
        int[] values = {15, 7, 22, 3, 18, 9, 30, 1, 25, 12};
        for (int i = 0; i < 10; i++) {
            PriorityQueueDemo.insert(i, values[i]);
            mAdd(i, values[i]);
            checkEq(PriorityQueueDemo.size, i + 1, "size after insert " + i);
            checkEq(PriorityQueueDemo.peek().key, mBestKey(), "peek key after insert " + i);
            checkEq(PriorityQueueDemo.peek().id, mBestId(), "peek id after insert " + i);
            check(isValidHeap(), "valid heap after insert " + i);
        }

        // -- findById --
        for (int id = 0; id < 10; id++) {
            int idx = PriorityQueueDemo.findById(id);
            check(idx >= 0 && idx < PriorityQueueDemo.size, "findById range " + id);
            checkEq(PriorityQueueDemo.heap[idx].id, id, "findById identity " + id);
        }
        checkEq(PriorityQueueDemo.findById(999), -1, "findById missing");

        // -- extract: must match the mirror's current best --
        for (int k = 0; k < 5; k++) {
            int wantId = mBestId(), wantKey = mBestKey();
            PriorityQueueDemo.Item got = PriorityQueueDemo.extract();
            checkEq(got.key, wantKey, "extract key " + k);
            checkEq(got.id, wantId, "extract id " + k);
            mRemove(wantId);
            checkEq(PriorityQueueDemo.size, 10 - k - 1, "size after extract " + k);
            check(isValidHeap(), "valid heap after extract " + k);
        }
        checkEq(PriorityQueueDemo.size, 5, "size after 5 extracts");

        // -- an id that was already extracted is no longer found (id 7, key 1, the global minimum) --
        checkEq(PriorityQueueDemo.findById(7), -1, "extracted id not found");

        // -- update_key: decrease-key must move the item to the root --
        int targetId = mId[0];
        PriorityQueueDemo.updateKey(targetId, -999);
        mUpdate(targetId, -999);
        checkEq(PriorityQueueDemo.peek().id, targetId, "decrease-key root id");
        checkEq(PriorityQueueDemo.peek().key, -999, "decrease-key root key");
        check(isValidHeap(), "valid heap after decrease-key");

        // -- update_key: increase-key --
        int victimId = mId[1 % mN];
        PriorityQueueDemo.updateKey(victimId, 100000);
        mUpdate(victimId, 100000);
        checkEq(PriorityQueueDemo.peek().id, mBestId(), "increase-key peek id");
        checkEq(PriorityQueueDemo.peek().key, mBestKey(), "increase-key peek key");
        check(isValidHeap(), "valid heap after increase-key");

        // -- update_key on a missing id: no-op --
        PriorityQueueDemo.Item before = PriorityQueueDemo.heap[0];
        PriorityQueueDemo.updateKey(12345, -1);
        checkEq(PriorityQueueDemo.heap[0].id, before.id, "no-op update id unchanged");
        checkEq(PriorityQueueDemo.heap[0].key, before.key, "no-op update key unchanged");

        // -- max-heap variant --
        PriorityQueueDemo.size = 0; PriorityQueueDemo.kindIsMax = true; mReset();
        int[] maxValues = {4, 19, 2, 40, 11, 27, 8, 33};
        for (int i = 0; i < 8; i++) {
            PriorityQueueDemo.insert(i, maxValues[i]);
            mAdd(i, maxValues[i]);
            checkEq(PriorityQueueDemo.peek().key, mBestKey(), "max-heap peek " + i);
        }
        check(isValidHeap(), "max-heap valid");

        // -- duplicates --
        PriorityQueueDemo.size = 0; PriorityQueueDemo.kindIsMax = false; mReset();
        for (int i = 0; i < 6; i++) { PriorityQueueDemo.insert(i, 7); mAdd(i, 7); }
        check(isValidHeap(), "dup valid heap");
        for (int i = 0; i < 6; i++) checkEq(PriorityQueueDemo.extract().key, 7, "dup extract " + i);
        checkEq(PriorityQueueDemo.size, 0, "dup final size");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
