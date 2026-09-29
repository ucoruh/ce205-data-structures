import java.io.DataOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/* Week 13 -- File Organisation I
 * Blocking factor: how many fixed-size records fit in one disk block (bf), and the waste that comes with it --
 * internal fragmentation inside every full block, plus extra waste in a partial last block. Every block is
 * really written to a file inside a temporary lab folder that main() creates and removes.
 * CEN207 Data Structures (formerly CE205)
 */
public class BlockingFactor {
    static final int BLOCK_SIZE = 100;

    static int blockCapacity(int recSize) { return BLOCK_SIZE / recSize; }   // bf = floor(BLOCK_SIZE / recSize)

    static void blockPut(List<Integer> buf, int bf, int key, DataOutputStream out, int[] written) throws IOException {
        buf.add(key);
        if (buf.size() == bf) {                       // block full: flush it to disk
            for (int v : buf) out.writeInt(v);
            written[0]++;
            buf.clear();                              // start a new, empty block
        }
    }

    static void blockFlush(List<Integer> buf, DataOutputStream out, int[] written) throws IOException {
        if (!buf.isEmpty()) {                          // partial last block is still written, with waste
            for (int v : buf) out.writeInt(v);
            written[0]++;
        }
    }

    /* ---- driver ------------------------------------------------------------ */

    static void runScenario(String label, java.io.File lab, int recSize, int blockSize, int[] keys) throws IOException {
        System.out.println("-- " + label + " --");
        int bf = blockSize / recSize;
        System.out.printf("recSize=%d blockSize=%d -> bf=%d%n", recSize, blockSize, bf);
        if (bf < 1) {
            System.out.printf("ERROR: a record (%d B) does not fit in a block (%d B): no block can hold even one record.%n%n", recSize, blockSize);
            return;
        }

        java.io.File path = new java.io.File(lab, "blocks.dat");
        List<Integer> buf = new ArrayList<>();
        int[] written = { 0 };
        int fragTotal = 0;
        try (DataOutputStream out = new DataOutputStream(new FileOutputStream(path))) {
            for (int key : keys) {
                int before = written[0];
                blockPut(buf, bf, key, out, written);
                if (written[0] > before) {
                    int frag = blockSize - bf * recSize;
                    fragTotal += frag;
                    System.out.printf("  key %d -> block full, flushed (write #%d), %d B internal waste%n", key, written[0], frag);
                } else {
                    System.out.printf("  key %d -> buffer (%d/%d)%n", key, buf.size(), bf);
                }
            }
            int beforeFlush = written[0];
            int lastWaste = buf.isEmpty() ? 0 : (bf - buf.size()) * recSize;
            blockFlush(buf, out, written);
            if (written[0] > beforeFlush) {
                int lastFrag = blockSize - bf * recSize;
                fragTotal += lastFrag;
                System.out.printf("  final partial block -> flushed (write #%d), %d B internal waste + %d B last-block waste%n", written[0], lastFrag, lastWaste);
            }
            long size = path.length();
            System.out.printf("summary: %d keys -> %d block(s) written (%d B on disk), internal waste %d B, last-block waste %d B%n%n",
                    keys.length, written[0], size, fragTotal, lastWaste);
        }
        path.delete();
    }

    public static void main(String[] args) throws IOException {
        java.io.File lab = new java.io.File(System.getProperty("java.io.tmpdir"), "cen207_week13_blocking_lab_java");
        if (lab.exists()) for (java.io.File f : lab.listFiles()) f.delete();
        lab.mkdir();

        int[] normal = { 12, 45, 7, 89, 23, 56, 34, 78, 19, 61, 42, 90, 15 };
        int[] hard = { 8, 31, 55, 12, 47, 63, 29, 71, 18, 40, 52, 6, 84, 25 };
        int[] edgeTooBig = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
        int[] edgeExact = { 3, 66, 21, 48, 11, 77, 34, 59, 2, 91, 26, 44 };

        runScenario("normal: recSize=20, blockSize=100 (bf=5), 13 keys", lab, 20, 100, normal);
        runScenario("hard: recSize=24, blockSize=100 (bf=4), 14 keys", lab, 24, 100, hard);
        runScenario("edge: record bigger than block (bf=0, error)", lab, 60, 50, edgeTooBig);
        runScenario("edge: 12 keys divide bf=3 exactly, no last-block waste", lab, 30, 100, edgeExact);

        lab.delete();
    }
}
