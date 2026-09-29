import java.io.File;
import java.io.IOException;

/* Unit tests for week-13 java/HashingToBuckets.java */
public class HashingToBucketsTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) throws IOException {
        HashingToBuckets.Bucket[] b = new HashingToBuckets.Bucket[HashingToBuckets.MAXBLOCKS];
        int[] nblocks, writes;

        // -- one key: goes straight into its home bucket --
        for (int i = 0; i < 5; i++) b[i] = new HashingToBuckets.Bucket();
        nblocks = new int[] { 5 }; writes = new int[] { 0 };
        int h = HashingToBuckets.bucketPut(b, nblocks, 5, 12, writes);
        checkEq(h, 2, "home bucket of 12");
        checkEq(b[2].count, 1, "bucket 2 count");
        checkEq(b[2].keys[0], 12, "bucket 2 key");
        checkEq(writes[0], 1, "writes after 1 insert");
        checkEq(nblocks[0], 5, "no overflow allocated");

        // -- filling a bucket exactly to bf: still no overflow --
        for (int i = 0; i < 5; i++) b[i] = new HashingToBuckets.Bucket();
        nblocks = new int[] { 5 }; writes = new int[] { 0 };
        HashingToBuckets.bucketPut(b, nblocks, 5, 2, writes);
        HashingToBuckets.bucketPut(b, nblocks, 5, 7, writes);
        HashingToBuckets.bucketPut(b, nblocks, 5, 12, writes);
        checkEq(b[2].count, 3, "bucket exactly full");
        checkEq(b[2].next, -1, "no overflow yet");
        checkEq(nblocks[0], 5, "nblocks unchanged");
        checkEq(writes[0], 3, "writes after 3 inserts");

        // -- one more key into a full bucket: allocates exactly one overflow block --
        HashingToBuckets.bucketPut(b, nblocks, 5, 17, writes);
        checkEq(nblocks[0], 6, "one overflow block allocated");
        check(b[2].next >= 5, "chain points to a new block");
        checkEq(b[b[2].next].count, 1, "overflow block has 1 key");
        checkEq(b[b[2].next].keys[0], 17, "overflow block key");
        checkEq(writes[0], 5, "writes: 3 inserts + 1 block + 1 insert");

        // -- a second overflow block chains onto the first, not onto the home bucket --
        HashingToBuckets.bucketPut(b, nblocks, 5, 22, writes);
        checkEq(nblocks[0], 6, "reused ov0");
        checkEq(b[b[2].next].count, 2, "ov0 has 2 keys");
        HashingToBuckets.bucketPut(b, nblocks, 5, 27, writes);
        checkEq(b[b[2].next].count, 3, "ov0 full (3/3)");
        HashingToBuckets.bucketPut(b, nblocks, 5, 32, writes);
        checkEq(nblocks[0], 7, "second overflow allocated");
        int ov0 = b[2].next, ov1 = b[ov0].next;
        check(ov1 >= 5 && ov1 != ov0, "second overflow is a distinct block");
        checkEq(b[ov1].count, 1, "ov1 has 1 key");
        checkEq(b[ov1].keys[0], 32, "ov1 key");

        // -- m=1: every key shares the one bucket, chain grows every bf keys --
        for (int i = 0; i < HashingToBuckets.MAXBLOCKS; i++) b[i] = new HashingToBuckets.Bucket();
        nblocks = new int[] { 1 }; writes = new int[] { 0 };
        int[] keys = { 5, 11, 2, 19, 8, 14, 3, 27, 6 };
        for (int k : keys) HashingToBuckets.bucketPut(b, nblocks, 1, k, writes);
        checkEq(nblocks[0], 3, "9 keys / bf=3 -> 3 blocks");
        int total = b[0].count, nx = b[0].next;
        while (nx >= 0) { total += b[nx].count; nx = b[nx].next; }
        checkEq(total, 9, "every key accounted for");

        // -- every distinct key ends up somewhere in the structure --
        boolean[] found = new boolean[9];
        nx = 0;
        while (nx >= 0) {
            for (int kk = 0; kk < b[nx].count; kk++)
                for (int i = 0; i < 9; i++) if (b[nx].keys[kk] == keys[i]) found[i] = true;
            nx = b[nx].next;
        }
        boolean allFound = true;
        for (boolean f : found) if (!f) allFound = false;
        check(allFound, "no key was lost");

        // -- zero keys: no bucketPut call at all, structure stays exactly as initialised --
        for (int i = 0; i < 5; i++) b[i] = new HashingToBuckets.Bucket();
        nblocks = new int[] { 5 }; writes = new int[] { 0 };
        checkEq(nblocks[0], 5, "zero keys: nblocks unchanged");
        checkEq(writes[0], 0, "zero keys: no writes");
        for (int i = 0; i < 5; i++) {
            checkEq(b[i].count, 0, "zero keys: bucket count");
            checkEq(b[i].next, -1, "zero keys: bucket next");
        }

        // -- integration: runScenario writes a real file inside a real lab folder and cleans it up --
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_buckets_lab_javatest");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();
        HashingToBuckets.runScenario("unit-test integration", lab, 3, new int[] { 1, 2, 3, 4, 5 });
        check(!new File(lab, "buckets.dat").exists(), "runScenario: cleans up its own file");
        lab.delete();

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
