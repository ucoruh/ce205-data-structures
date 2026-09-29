/* Unit tests for week-14 java/ExtendibleHashing.java */
public class ExtendibleHashingTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    /* Independent structural invariant of extendible hashing (textbook fact, true for ANY
     * correct implementation, not derived from this program's output): the number of directory
     * slots that point at bucket b must be exactly 2^(globalDepth - localDepth[b]), and no
     * localDepth may exceed globalDepth. */
    static void checkDirInvariant(ExtendibleHashing.Hash h, String label) {
        checkEq(h.dir.size(), 1 << h.globalDepth, label + ": dirSize == 2^globalDepth");
        for (int b = 0; b < h.buckets.size(); b++) {
            ExtendibleHashing.Bucket bucket = h.buckets.get(b);
            check(bucket.localDepth <= h.globalDepth, label + ": localDepth <= globalDepth (bucket " + b + ")");
            int count = 0;
            for (int p : h.dir)
                if (p == b)
                    count++;
            checkEq(count, 1 << (h.globalDepth - bucket.localDepth), label + ": dir slots pointing at bucket " + b);
        }
        check(h.buckets.size() <= h.dir.size(), label + ": bucketCount <= dirSize");
    }

    /* Independent lookup: scans every bucket directly (does not use the directory routing at
     * all), so it can catch a key that insertKey placed in the wrong bucket. */
    static int countKey(ExtendibleHashing.Hash h, int key) {
        int hits = 0;
        for (ExtendibleHashing.Bucket b : h.buckets)
            for (int k : b.keys)
                if (k == key)
                    hits++;
        return hits;
    }

    public static void main(String[] args) {
        checkEq(ExtendibleHashing.lastBits(0, 0), 0, "lastBits(0,0)");
        checkEq(ExtendibleHashing.lastBits(255, 0), 0, "lastBits(255,0)");
        checkEq(ExtendibleHashing.lastBits(-7, 0), 0, "lastBits(-7,0)");

        checkEq(ExtendibleHashing.lastBits(0b1011, 1), 1, "lastBits depth1");
        checkEq(ExtendibleHashing.lastBits(0b1011, 2), 3, "lastBits depth2");
        checkEq(ExtendibleHashing.lastBits(0b1011, 3), 3, "lastBits depth3");
        checkEq(ExtendibleHashing.lastBits(0b1011, 4), 11, "lastBits depth4");
        checkEq(ExtendibleHashing.lastBits(8, 3), 0, "lastBits(8,3)");
        checkEq(ExtendibleHashing.lastBits(8, 4), 8, "lastBits(8,4)");

        ExtendibleHashing.Hash h1 = new ExtendibleHashing.Hash();
        h1.buckets.add(new ExtendibleHashing.Bucket());
        h1.dir.add(0);
        int[] neverKeys = {41, 7, 23, 58, 14, 33, 2, 47, 19, 36};
        for (int k : neverKeys)
            ExtendibleHashing.insertKey(h1, 10, k);
        checkEq(h1.buckets.size(), 1, "never-splits bucket count");
        checkEq(h1.globalDepth, 0, "never-splits global depth");
        checkEq(h1.dir.size(), 1, "never-splits directory size");
        checkEq(h1.buckets.get(0).keys.size(), 10, "never-splits bucket load");
        checkDirInvariant(h1, "never-splits");
        for (int k : neverKeys)
            checkEq(countKey(h1, k), 1, "never-splits key present once: " + k);

        ExtendibleHashing.Hash h2 = new ExtendibleHashing.Hash();
        h2.buckets.add(new ExtendibleHashing.Bucket());
        h2.dir.add(0);
        ExtendibleHashing.insertKey(h2, 2, 1);
        ExtendibleHashing.insertKey(h2, 2, 3);
        checkEq(h2.buckets.size(), 1, "two odd keys: no split yet");
        checkEq(h2.globalDepth, 0, "two odd keys: depth still 0");
        checkEq(h2.buckets.get(0).keys.size(), 2, "two odd keys: bucket load");

        ExtendibleHashing.insertKey(h2, 2, 2);
        checkEq(h2.globalDepth, 1, "third (even) key forces one split");
        checkEq(h2.dir.size(), 2, "directory doubled once");
        checkEq(h2.buckets.size(), 2, "bucket count after split");
        int total = 0;
        for (ExtendibleHashing.Bucket b : h2.buckets)
            total += b.keys.size();
        checkEq(total, 3, "no key lost or duplicated");
        checkDirInvariant(h2, "single-split");
        checkEq(countKey(h2, 1), 1, "single-split key 1 present once");
        checkEq(countKey(h2, 2), 1, "single-split key 2 present once");
        checkEq(countKey(h2, 3), 1, "single-split key 3 present once");

        ExtendibleHashing.Hash h3 = new ExtendibleHashing.Hash();
        h3.buckets.add(new ExtendibleHashing.Bucket());
        h3.dir.add(0);
        int[] skewedKeys = {8, 24, 40, 56, 72, 88, 104, 120, 136, 152};
        for (int k : skewedKeys)
            ExtendibleHashing.insertKey(h3, 2, k);
        int total3 = 0;
        for (ExtendibleHashing.Bucket b : h3.buckets)
            total3 += b.keys.size();
        checkEq(total3, 10, "skewed preset keeps every key");
        check(h3.globalDepth >= 4, "skewed preset needed real depth");
        for (int p : h3.dir) {
            check(p >= 0, "directory entry non-negative");
            check(p < h3.buckets.size(), "directory entry in range");
        }
        checkDirInvariant(h3, "skewed");
        for (int k : skewedKeys)
            checkEq(countKey(h3, k), 1, "skewed key present once: " + k);

        /* Directory doubling MANY times in a row. All 10 keys share their lowest 5 bits (every
         * one is 5 mod 32), so by the pigeonhole principle no globalDepth <= 5 can ever separate
         * them -- lastBits(key, depth<=5) is identical for all ten, so they would all still
         * route to one bucket and keep overflowing capacity=2. The directory must therefore
         * double at least 6 times (size 1 -> 64, globalDepth >= 6) before the 6th bit (the first
         * bit these values actually differ on) can separate them. This bound comes from the key
         * values themselves, not from running the program. */
        ExtendibleHashing.Hash h4 = new ExtendibleHashing.Hash();
        h4.buckets.add(new ExtendibleHashing.Bucket());
        h4.dir.add(0);
        int[] mod32Keys = {5, 37, 69, 101, 133, 165, 197, 229, 261, 293};
        for (int k : mod32Keys)
            checkEq(k % 32, 5, "mod32 fixture sanity: " + k);
        for (int k : mod32Keys)
            ExtendibleHashing.insertKey(h4, 2, k);
        check(h4.globalDepth >= 6, "mod32 preset needed >=6 doublings");
        checkEq(h4.dir.size(), 1 << h4.globalDepth, "mod32 dirSize == 2^globalDepth");
        int total4 = 0;
        for (ExtendibleHashing.Bucket b : h4.buckets)
            total4 += b.keys.size();
        checkEq(total4, 10, "mod32 keeps every key");
        checkDirInvariant(h4, "mod32");
        for (int k : mod32Keys)
            checkEq(countKey(h4, k), 1, "mod32 key present once: " + k);

        /* capacity=1, 8 distinct keys covering EVERY 3-bit pattern (0..7). Pigeonhole: any
         * globalDepth <= 2 gives at most 4 directory slots for these 8 distinct values, so at
         * least two of them must always collide in the same bucket -- with capacity=1 that is an
         * immediate overflow, so globalDepth must reach at least 3 (dirSize >= 8). This holds
         * for ANY insertion order, purely from counting the 8 distinct keys against <=4 slots. */
        ExtendibleHashing.Hash h5 = new ExtendibleHashing.Hash();
        h5.buckets.add(new ExtendibleHashing.Bucket());
        h5.dir.add(0);
        int[] cap1Keys = {0, 1, 2, 3, 4, 5, 6, 7};
        for (int k : cap1Keys)
            ExtendibleHashing.insertKey(h5, 1, k);
        check(h5.globalDepth >= 3, "cap1 preset needed >=3 doublings");
        checkEq(h5.dir.size(), 1 << h5.globalDepth, "cap1 dirSize == 2^globalDepth");
        int total5 = 0;
        for (ExtendibleHashing.Bucket b : h5.buckets) {
            check(b.keys.size() <= 1, "cap1: never more than one key per bucket");
            total5 += b.keys.size();
        }
        checkEq(total5, 8, "cap1 keeps every key");
        checkDirInvariant(h5, "cap1");
        for (int k : cap1Keys)
            checkEq(countKey(h5, k), 1, "cap1 key present once: " + k);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
