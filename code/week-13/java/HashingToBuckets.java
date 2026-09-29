import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

/* Week 13 -- File Organisation I
 * Hashing to buckets: h(key) = key mod m picks a HOME bucket; a bucket holds up to bf keys, and once it is full
 * an OVERFLOW block is allocated and chained onto it (bucket chaining) instead of searching elsewhere. Every
 * bucket and overflow block is a real block written to disk, inside a temporary lab folder that main() creates
 * and removes.
 * CEN207 Data Structures (formerly CE205)
 */
public class HashingToBuckets {
    static final int BF = 3;   // keys per bucket / overflow block

    static class Bucket { int[] keys = new int[BF]; int count = 0; int next = -1; }   // next = -1: no overflow yet

    static int bucketPut(Bucket[] b, int[] nblocks, int m, int key, int[] writes) {
        int h = key % m, cur = h;                       // home bucket
        while (b[cur].count == BF) {                     // this block is full
            if (b[cur].next < 0) {                         // no overflow yet: allocate one
                b[cur].next = nblocks[0]++;
                b[b[cur].next] = new Bucket();
                writes[0]++;                                 // the new, empty overflow block
            }
            cur = b[cur].next;                                // follow the chain
        }
        b[cur].keys[b[cur].count++] = key;
        writes[0]++;                                          // the block that now holds the key
        return h;
    }

    /* ---- driver ------------------------------------------------------------ */

    static final int MAXBLOCKS = 40;

    static void runScenario(String label, File lab, int m, int[] keys) throws IOException {
        System.out.println("-- " + label + " --");
        Bucket[] b = new Bucket[MAXBLOCKS];
        for (int i = 0; i < m; i++) b[i] = new Bucket();
        int[] nblocks = { m }, writes = { 0 };

        for (int key : keys) {
            int h = bucketPut(b, nblocks, m, key, writes);
            System.out.printf("  key %d -> home bucket %d%n", key, h);
        }

        File path = new File(lab, "buckets.dat");
        try (DataOutputStream out = new DataOutputStream(new FileOutputStream(path))) {
            for (int i = 0; i < nblocks[0]; i++) for (int k = 0; k < BF; k++) out.writeInt(b[i].keys[k]);
        }
        long size = path.length();

        for (int i = 0; i < m; i++) {
            StringBuilder sb = new StringBuilder("  bucket " + i + ":");
            for (int k = 0; k < b[i].count; k++) sb.append(' ').append(b[i].keys[k]);
            int nx = b[i].next;
            while (nx >= 0) {
                sb.append(" ->");
                for (int k = 0; k < b[nx].count; k++) sb.append(' ').append(b[nx].keys[k]);
                nx = b[nx].next;
            }
            System.out.println(sb);
        }
        System.out.printf("summary: %d keys, %d home bucket(s), %d overflow block(s) (%d blocks total, %d B on disk), %d writes%n%n",
                keys.length, m, nblocks[0] - m, nblocks[0], size, writes[0]);
        path.delete();
    }

    public static void main(String[] args) throws IOException {
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_buckets_lab_java");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();

        int[] normal = { 12, 7, 23, 18, 4, 29, 15, 31, 9, 26, 3, 37, 21 };
        int[] hard = { 4, 8, 12, 16, 20, 24, 1, 5, 9, 13, 17, 21, 2, 6 };
        int[] edgeAllSame = { 6, 12, 18, 24, 30, 36, 42, 48, 54, 60 };
        int[] edgeOneBucket = { 5, 11, 2, 19, 8, 14, 3, 27, 6, 10 };

        runScenario("normal: m=5, bf=3, 13 keys, little overflow", lab, 5, normal);
        runScenario("hard: m=4, 14 keys, several buckets chain", lab, 4, hard);
        runScenario("edge: all 10 keys hash to the same bucket (long chain)", lab, 6, edgeAllSame);
        runScenario("edge: m=1, one bucket, everything chains", lab, 1, edgeOneBucket);

        lab.delete();
    }
}
