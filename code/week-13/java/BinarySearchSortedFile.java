import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;

/* Week 13 -- File Organisation I
 * Binary search of a SORTED file: jump to the middle BLOCK (compare the key to the block's first and last
 * key), then scan only inside that one block -- O(log numBlocks) block reads instead of O(numBlocks). The
 * file really lives on disk, inside a temporary lab folder that main() creates and removes.
 * CEN207 Data Structures (formerly CE205)
 */
public class BinarySearchSortedFile {
    static final int BF = 4;   // records per block; the whole file is sorted by key

    static int bsearchFile(RandomAccessFile fp, int nblocks, int key, int[] blockReads) throws IOException {
        int lo = 0, hi = nblocks - 1;
        int[] buf = new int[BF];
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            fp.seek((long) mid * BF * 4);
            int cnt = 0;
            for (; cnt < BF && fp.getFilePointer() < fp.length(); cnt++) buf[cnt] = fp.readInt();   // one block read
            blockReads[0]++;
            if (key < buf[0]) {
                hi = mid - 1;                                   // whole block is too big: go left
            } else if (key > buf[cnt - 1]) {
                lo = mid + 1;                                   // whole block is too small: go right
            } else {
                for (int i = 0; i < cnt; i++)                   // key's block found: scan inside it
                    if (buf[i] == key) return mid * BF + i;
                return -1;                                       // in range but absent: a gap
            }
        }
        return -1;                                                // outside the file's key range
    }

    /* ---- driver ------------------------------------------------------------ */

    static void runScenario(String label, File lab, int[] keys, int target) throws IOException {
        System.out.println("-- " + label + " --");
        File path = new File(lab, "file.dat");
        try (RandomAccessFile fp = new RandomAccessFile(path, "rw")) {
            for (int k : keys) fp.writeInt(k);
        }

        int nblocks = (keys.length + BF - 1) / BF;
        int[] reads = { 0 };
        int idx;
        try (RandomAccessFile fp = new RandomAccessFile(path, "r")) {
            idx = bsearchFile(fp, nblocks, target, reads);
        }

        if (idx >= 0) System.out.printf("  search(%d): found at position %d, %d/%d block reads%n", target, idx, reads[0], nblocks);
        else System.out.printf("  search(%d): not found, %d/%d block reads%n", target, reads[0], nblocks);
        System.out.printf("summary: %d keys in %d block(s), bf=%d%n%n", keys.length, nblocks, BF);
        path.delete();
    }

    public static void main(String[] args) throws IOException {
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_binsearch_lab_java");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();

        int[] normal = { 3, 9, 14, 20, 27, 31, 38, 44, 50, 57, 63, 70 };
        int[] hard = new int[24];
        for (int i = 0; i < 24; i++) hard[i] = 2 + i * 3;   // 6 blocks: worst case needs 3 probes
        int[] edgeGap = { 4, 11, 19, 26, 33, 40, 48, 55, 62, 69, 77, 85 };

        runScenario("normal: bf=4, 12 sorted keys, target found in the 2nd probed block", lab, normal, 63);
        runScenario("hard: bf=4, 24 sorted keys (6 blocks), worst case needs 3 probes", lab, hard, 71);
        runScenario("edge: target is inside a block's range but absent (a gap)", lab, edgeGap, 45);
        runScenario("edge: target is outside the file's key range (below the minimum)", lab, edgeGap, 1);

        lab.delete();
    }
}
