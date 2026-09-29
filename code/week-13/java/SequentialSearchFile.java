import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;

/* Week 13 -- File Organisation I
 * Sequential search of a file: blocks are read from disk in order, and every record inside a loaded block is
 * compared until the key is found or the file ends. The cost is measured in BLOCK READS. The file really lives
 * on disk, inside a temporary lab folder that main() creates and removes.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class SequentialSearchFile {
    static final int BF = 4;   // records per block

    static int seqSearchFile(RandomAccessFile fp, int n, int key, int[] blockReads, int[] comparisons) throws IOException {
        int[] buf = new int[BF];
        int nblocks = (n + BF - 1) / BF;
        for (int b = 0; b < nblocks; b++) {
            fp.seek((long) b * BF * 4);
            int cnt = 0;
            for (; cnt < BF && fp.getFilePointer() < fp.length(); cnt++) buf[cnt] = fp.readInt();   // one block read
            blockReads[0]++;
            for (int i = 0; i < cnt; i++) {
                comparisons[0]++;
                if (buf[i] == key) return b * BF + i;             // found
            }
        }
        return -1;                                                // not found: every block was read
    }

    /* ---- driver ------------------------------------------------------------ */

    static void runScenario(String label, File lab, int[] keys, int target) throws IOException {
        System.out.println("-- " + label + " --");
        File path = new File(lab, "file.dat");
        try (RandomAccessFile fp = new RandomAccessFile(path, "rw")) {
            for (int k : keys) fp.writeInt(k);
        }

        int[] reads = { 0 }, comparisons = { 0 };
        int idx;
        try (RandomAccessFile fp = new RandomAccessFile(path, "r")) {
            idx = seqSearchFile(fp, keys.length, target, reads, comparisons);
        }

        int nblocks = (keys.length + BF - 1) / BF;
        if (idx >= 0) System.out.printf("  search(%d): found at position %d, %d/%d block reads, %d comparisons%n", target, idx, reads[0], nblocks, comparisons[0]);
        else System.out.printf("  search(%d): not found, %d/%d block reads, %d comparisons%n", target, reads[0], nblocks, comparisons[0]);
        System.out.printf("summary: %d keys in %d block(s), bf=%d%n%n", keys.length, nblocks, BF);
        path.delete();
    }

    public static void main(String[] args) throws IOException {
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_seqsearch_lab_java");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();

        int[] normal = { 51, 8, 73, 20, 44, 12, 67, 29, 90, 3, 58, 36, 81 };
        int[] hard = { 15, 42, 7, 63, 28, 91, 50, 19, 77, 33, 5, 62, 95, 62 };
        int[] edgeNotFound = { 11, 34, 56, 9, 78, 23, 45, 67, 2, 88, 31, 60 };
        int[] edgeFirst = { 70, 14, 39, 82, 6, 55, 27, 48, 93, 11 };

        runScenario("normal: 13 keys, target in the middle (found in block 2)", lab, normal, 67);
        runScenario("hard: 14 keys, duplicate target in the last block (worst case)", lab, hard, 62);
        runScenario("edge: target absent, the whole file is scanned", lab, edgeNotFound, 999);
        runScenario("edge: target is the first record, best case (1 read)", lab, edgeFirst, 70);

        lab.delete();
    }
}
