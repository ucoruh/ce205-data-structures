import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.RandomAccessFile;

/* Week 13 -- File Organisation I
 * Sequential update: merge a SORTED transaction file into a SORTED master file in one pass, producing a new
 * master file. Every transaction is add / change / delete; a change or delete on a key that is not in the
 * master is an error, and adding a key that already exists is also an error. The new master really lives on
 * disk, inside a temporary lab folder that main() creates and removes.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class SequentialUpdateMasterTransaction {
    static class Rec { int key, val; Rec(int k, int v) { key = k; val = v; } }
    static class Txn { int key; char op; int val; Txn(int k, char o, int v) { key = k; op = o; val = v; } }

    static int mergeUpdate(Rec[] master, int nm, Txn[] txn, int nt, DataOutputStream out,
                           int[] written, int[] deleted, int[] errors) throws IOException {
        int i = 0, j = 0;
        while (i < nm && j < nt) {
            if (master[i].key < txn[j].key) {                // master record has no transaction: copy it
                out.writeInt(master[i].key); out.writeInt(master[i].val); written[0]++; i++;
            } else if (master[i].key > txn[j].key) {          // transaction key is not in master (yet)
                if (txn[j].op == 'A') {
                    out.writeInt(txn[j].key); out.writeInt(txn[j].val); written[0]++;
                } else { errors[0]++; }                       // change/delete: key not found
                j++;
            } else {                                          // same key: transaction applies to this record
                if (txn[j].op == 'A') {                                   // duplicate add: keep the original, flag the error
                    out.writeInt(master[i].key); out.writeInt(master[i].val); written[0]++; errors[0]++;
                }
                else if (txn[j].op == 'C') {
                    out.writeInt(master[i].key); out.writeInt(txn[j].val); written[0]++;
                } else { deleted[0]++; }                      // 'D': record is dropped, nothing written
                i++; j++;
            }
        }
        while (i < nm) { out.writeInt(master[i].key); out.writeInt(master[i].val); written[0]++; i++; }   // leftover master
        while (j < nt) {                                                                                   // leftover transactions
            if (txn[j].op == 'A') {
                out.writeInt(txn[j].key); out.writeInt(txn[j].val); written[0]++;
            } else { errors[0]++; }
            j++;
        }
        return written[0];
    }

    /* ---- driver ------------------------------------------------------------ */

    static void runScenario(String label, File lab, Rec[] master, Txn[] txn) throws IOException {
        System.out.println("-- " + label + " --");
        File path = new File(lab, "newmaster.dat");
        int[] written = { 0 }, deleted = { 0 }, errors = { 0 };
        try (DataOutputStream out = new DataOutputStream(new FileOutputStream(path))) {
            mergeUpdate(master, master.length, txn, txn.length, out, written, deleted, errors);
        }

        StringBuilder sb = new StringBuilder("  new master:");
        try (RandomAccessFile in = new RandomAccessFile(path, "r")) {
            while (in.getFilePointer() < in.length()) {
                int k = in.readInt(), v = in.readInt();
                sb.append(' ').append(k).append(':').append(v);
            }
        }
        System.out.println(sb);
        System.out.printf("summary: %d master, %d transactions -> written=%d deleted=%d errors=%d%n%n",
                master.length, txn.length, written[0], deleted[0], errors[0]);
        path.delete();
    }

    public static void main(String[] args) throws IOException {
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_seqjoin_lab_java");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();

        Rec[] normalM = { new Rec(5, 10), new Rec(10, 20), new Rec(15, 30), new Rec(20, 40), new Rec(25, 50), new Rec(30, 60), new Rec(35, 70), new Rec(40, 80), new Rec(45, 90), new Rec(50, 100) };
        Txn[] normalT = { new Txn(8, 'A', 16), new Txn(15, 'C', 999), new Txn(25, 'D', 0), new Txn(42, 'A', 84), new Txn(50, 'C', 500), new Txn(60, 'A', 120) };

        Rec[] hardM = { new Rec(2, 6), new Rec(6, 18), new Rec(10, 30), new Rec(14, 42), new Rec(18, 54), new Rec(22, 66), new Rec(26, 78), new Rec(30, 90), new Rec(34, 102), new Rec(38, 114), new Rec(42, 126) };
        Txn[] hardT = { new Txn(5, 'A', 15), new Txn(12, 'A', 36), new Txn(13, 'A', 39), new Txn(18, 'C', 999), new Txn(22, 'D', 0), new Txn(34, 'C', 111), new Txn(40, 'A', 120), new Txn(50, 'A', 150) };

        Rec[] dupM = { new Rec(3, 103), new Rec(7, 107), new Rec(11, 111), new Rec(15, 115), new Rec(19, 119), new Rec(23, 123), new Rec(27, 127), new Rec(31, 131), new Rec(35, 135), new Rec(39, 139) };
        Txn[] dupT = { new Txn(7, 'A', 777), new Txn(11, 'C', 555), new Txn(39, 'C', 999), new Txn(45, 'A', 900), new Txn(50, 'D', 0) };

        Rec[] trailM = { new Rec(1, 2), new Rec(4, 8), new Rec(7, 14), new Rec(10, 20), new Rec(13, 26), new Rec(16, 32), new Rec(19, 38), new Rec(22, 44), new Rec(25, 50), new Rec(28, 56) };
        Txn[] trailT = { new Txn(5, 'D', 0), new Txn(30, 'A', 60), new Txn(35, 'C', 999), new Txn(40, 'A', 80), new Txn(45, 'D', 0), new Txn(50, 'A', 100) };

        runScenario("normal: 10 master, 6 valid transactions", lab, normalM, normalT);
        runScenario("hard: 11 master, 8 transactions (back-to-back adds)", lab, hardM, hardT);
        runScenario("edge: adding an existing key + acting on a missing key (errors)", lab, dupM, dupT);
        runScenario("edge: master runs out, trailing transactions (some invalid)", lab, trailM, trailT);

        lab.delete();
    }
}
