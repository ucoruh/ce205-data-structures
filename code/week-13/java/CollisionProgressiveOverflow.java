import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.RandomAccessFile;

/* Week 13 -- File Organisation I
 * Progressive overflow (linear probing) on disk: one record per slot; if the home slot h(key) = key mod m is
 * occupied, probe the NEXT slot, wrapping around, until an empty slot is found, the key is already there
 * (duplicate), or every slot has been tried (file full). The table really lives on disk, inside a temporary
 * lab folder that main() creates and removes.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class CollisionProgressiveOverflow {
    static final int EMPTY = -1;

    static int poInsert(int[] table, int m, int key, int[] probes) {
        int h = key % m, i = h, tries = 0;
        while (tries < m) {
            probes[0]++;                                     // one slot probed = one disk access
            if (table[i] == EMPTY) { table[i] = key; return i; }     // home or next free slot
            if (table[i] == key) return -2;                          // duplicate key
            i = (i + 1) % m;                                         // progressive overflow: try the next slot
            tries++;
        }
        return -1;                                                   // every slot tried: file is full
    }

    /* ---- driver ------------------------------------------------------------ */

    static void runScenario(String label, File lab, int m, int[] keys) throws IOException {
        System.out.println("-- " + label + " --");
        int[] table = new int[m];
        for (int i = 0; i < m; i++) table[i] = EMPTY;
        int[] probes = { 0 };
        int inserted = 0, errors = 0;
        for (int key : keys) {
            int before = probes[0];
            int slot = poInsert(table, m, key, probes);
            if (slot >= 0) { inserted++; System.out.printf("  insert(%d): slot %d, %d probe(s)%n", key, slot, probes[0] - before); }
            else if (slot == -2) { errors++; System.out.printf("  insert(%d): duplicate key%n", key); }
            else { errors++; System.out.printf("  insert(%d): FILE FULL%n", key); }
        }

        File path = new File(lab, "table.dat");
        try (DataOutputStream out = new DataOutputStream(new FileOutputStream(path))) {
            for (int v : table) out.writeInt(v);
        }
        long size;
        try (RandomAccessFile r = new RandomAccessFile(path, "r")) { size = r.length(); }

        StringBuilder sb = new StringBuilder("  table:");
        for (int i = 0; i < m; i++) if (table[i] != EMPTY) sb.append(String.format(" [%d]=%d", i, table[i]));
        System.out.println(sb);
        System.out.printf("summary: %d request(s), %d inserted, %d error(s), %d probes total, %d B on disk%n%n",
                keys.length, inserted, errors, probes[0], size);
        path.delete();
    }

    public static void main(String[] args) throws IOException {
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_probing_lab_java");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();

        int[] normal = { 7, 20, 33, 3, 16, 29, 10, 23, 5, 18 };
        int[] hard = { 2, 13, 24, 35, 4, 15, 26, 6, 17, 8 };
        int[] edgeFull = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 45 };
        int[] edgeSameHome = { 3, 12, 21, 30, 39, 48, 57, 66, 75, 84 };

        runScenario("normal: m=13, 10 keys, moderate load (77%)", lab, 13, normal);
        runScenario("hard: m=11, 10 keys, heavy load (91%), long probe runs", lab, 11, hard);
        runScenario("edge: the file fills exactly, the 10th insert fails (file full)", lab, 9, edgeFull);
        runScenario("edge: every key shares the same home slot, the file fills", lab, 9, edgeSameHome);

        lab.delete();
    }
}
