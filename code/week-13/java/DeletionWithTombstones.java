import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.RandomAccessFile;

/* Week 13 -- File Organisation I
 * Deletion with tombstones: in a probed (linearly-hashed) file, deleting a record cannot just clear its slot to
 * EMPTY -- a later search for a DIFFERENT key that once probed past this slot would then stop too early and
 * wrongly report "not found". A TOMBSTONE ("something was here, keep looking") fixes this; a search skips over
 * tombstones but a later INSERT may reuse one. The table really lives on disk, inside a temporary lab folder
 * that main() creates and removes.
 * CEN207 Data Structures (formerly CE205)
 */
public class DeletionWithTombstones {
    static final int EMPTY = -1, TOMB = -2;   // TOMB = deleted marker: "something was here, keep looking"

    static int tsFind(int[] table, int m, int key) {
        int i = key % m, tries = 0;
        while (tries < m) {
            if (table[i] == EMPTY) return -1;         // truly empty: nothing was ever probed past here
            if (table[i] == key) return i;              // found
            i = (i + 1) % m; tries++;                    // TOMB or a different key: keep going
        }
        return -1;
    }

    static int tsDelete(int[] table, int m, int key) {
        int i = tsFind(table, m, key);
        if (i < 0) return -1;
        table[i] = TOMB;                                   // NOT EMPTY: later finds must not stop here
        return i;
    }

    static int tsInsert(int[] table, int m, int key) {
        int i = key % m, tries = 0;
        while (tries < m) {
            if (table[i] == EMPTY || table[i] == TOMB) { table[i] = key; return i; }   // reuse a tombstone
            if (table[i] == key) return -2;                 // duplicate
            i = (i + 1) % m; tries++;
        }
        return -1;                                           // file full
    }

    /* ---- driver ------------------------------------------------------------ */

    static void printTable(int[] table, int m) {
        StringBuilder sb = new StringBuilder("  table:");
        for (int i = 0; i < m; i++) {
            if (table[i] == EMPTY) continue;
            if (table[i] == TOMB) sb.append(String.format(" [%d]=DEL", i));
            else sb.append(String.format(" [%d]=%d", i, table[i]));
        }
        System.out.println(sb);
    }

    static void runScenario(String label, File lab, int m, int[] insertKeys, int[] deleteKeys,
                             int searchFound, int searchMissing, int reinsertKey) throws IOException {
        System.out.println("-- " + label + " --");
        int[] table = new int[m];
        for (int i = 0; i < m; i++) table[i] = EMPTY;

        for (int k : insertKeys) tsInsert(table, m, k);
        printTable(table, m);

        for (int k : deleteKeys) {
            int slot = tsDelete(table, m, k);
            System.out.printf("  delete(%d): %s%n", k, slot >= 0 ? "tombstone left" : "not found");
        }
        printTable(table, m);

        int f1 = tsFind(table, m, searchFound);
        System.out.printf("  find(%d): %s%n", searchFound, f1 >= 0 ? "found" : "not found");
        int f2 = tsFind(table, m, searchMissing);
        System.out.printf("  find(%d): %s%n", searchMissing, f2 >= 0 ? "found" : "not found");
        int r = tsInsert(table, m, reinsertKey);
        System.out.printf("  reinsert(%d): slot %d%n", reinsertKey, r);
        printTable(table, m);

        File path = new File(lab, "table.dat");
        try (DataOutputStream out = new DataOutputStream(new FileOutputStream(path))) {
            for (int v : table) out.writeInt(v);
        }
        long size;
        try (RandomAccessFile ra = new RandomAccessFile(path, "r")) { size = ra.length(); }
        System.out.printf("summary: %d B on disk%n%n", size);
        path.delete();
    }

    public static void main(String[] args) throws IOException {
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_tombstone_lab_java");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();

        int[] normalIns = { 5, 18, 31, 1, 2, 3, 4, 9, 10, 11, 12 };
        int[] normalDel = { 5 };
        int[] hardIns = { 2, 15, 28, 41, 54, 7, 8, 9, 10, 11, 0 };
        int[] hardDel = { 15, 41 };
        int[] edge1Ins = { 3, 14, 25, 0, 1, 2, 6, 7, 8, 9 };
        int[] edge1Del = { 3 };
        int[] edge2Ins = { 4, 15, 26, 22, 12, 13, 14, 18, 19, 20, 21 };
        int[] edge2Del = { 4, 15, 26 };

        runScenario("normal: m=13, the head of a 3-chain is deleted, search skips the tombstone",
                lab, 13, normalIns, normalDel, 18, 44, 57);
        runScenario("hard: m=13, two deletions in a 5-chain (two tombstones to skip)",
                lab, 13, hardIns, hardDel, 54, 67, 80);
        runScenario("edge: a key is deleted, then the very same key is reinserted",
                lab, 11, edge1Ins, edge1Del, 14, 36, 3);
        runScenario("edge: the file is completely full; a whole chain is deleted, no true-empty slot remains",
                lab, 11, edge2Ins, edge2Del, 18, 37, 37);

        lab.delete();
    }
}
