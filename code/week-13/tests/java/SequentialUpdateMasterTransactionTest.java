import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.IOException;

/* Unit tests for week-13 java/SequentialUpdateMasterTransaction.java */
public class SequentialUpdateMasterTransactionTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static ByteArrayOutputStream bytes;
    static DataOutputStream openOut() { bytes = new ByteArrayOutputStream(); return new DataOutputStream(bytes); }
    static int[] readAll(int maxPairs) {
        byte[] raw = bytes.toByteArray();
        int n = raw.length / 8;
        int[] out = new int[2 * Math.min(n, maxPairs)];
        int p = 0;
        for (int i = 0; i < Math.min(n, maxPairs); i++) {
            int key = ((raw[p] & 0xFF) << 24) | ((raw[p + 1] & 0xFF) << 16) | ((raw[p + 2] & 0xFF) << 8) | (raw[p + 3] & 0xFF);
            int val = ((raw[p + 4] & 0xFF) << 24) | ((raw[p + 5] & 0xFF) << 16) | ((raw[p + 6] & 0xFF) << 8) | (raw[p + 7] & 0xFF);
            out[2 * i] = key; out[2 * i + 1] = val;
            p += 8;
        }
        return out;
    }
    static SequentialUpdateMasterTransaction.Rec rec(int k, int v) { return new SequentialUpdateMasterTransaction.Rec(k, v); }
    static SequentialUpdateMasterTransaction.Txn txn(int k, char op, int v) { return new SequentialUpdateMasterTransaction.Txn(k, op, v); }

    public static void main(String[] args) throws IOException {
        DataOutputStream out;
        int[] written, deleted, errors;

        // -- master key smaller than transaction key: copied unchanged --
        out = openOut(); written = new int[] { 0 }; deleted = new int[] { 0 }; errors = new int[] { 0 };
        SequentialUpdateMasterTransaction.mergeUpdate(new SequentialUpdateMasterTransaction.Rec[] { rec(5, 50), rec(10, 100) }, 2,
                new SequentialUpdateMasterTransaction.Txn[] { txn(20, 'A', 200) }, 1, out, written, deleted, errors);
        checkEq(written[0], 3, "copy unchanged: written");
        int[] r = readAll(3);
        checkEq(r[0], 5, "copy unchanged: key0"); checkEq(r[1], 50, "copy unchanged: val0");
        checkEq(r[4], 20, "copy unchanged: key2"); checkEq(r[5], 200, "copy unchanged: val2");

        // -- add: transaction key not in master, between two master keys --
        out = openOut(); written = new int[] { 0 }; deleted = new int[] { 0 }; errors = new int[] { 0 };
        SequentialUpdateMasterTransaction.mergeUpdate(new SequentialUpdateMasterTransaction.Rec[] { rec(5, 50), rec(15, 150) }, 2,
                new SequentialUpdateMasterTransaction.Txn[] { txn(10, 'A', 100) }, 1, out, written, deleted, errors);
        checkEq(written[0], 3, "add between: written");
        checkEq(errors[0], 0, "add between: errors");

        // -- change/delete on a key not in the master: error, nothing written for it --
        out = openOut(); written = new int[] { 0 }; deleted = new int[] { 0 }; errors = new int[] { 0 };
        SequentialUpdateMasterTransaction.mergeUpdate(new SequentialUpdateMasterTransaction.Rec[] { rec(5, 50), rec(15, 150) }, 2,
                new SequentialUpdateMasterTransaction.Txn[] { txn(10, 'C', 999) }, 1, out, written, deleted, errors);
        checkEq(written[0], 2, "change missing: written");
        checkEq(errors[0], 1, "change missing: errors");

        out = openOut(); written = new int[] { 0 }; deleted = new int[] { 0 }; errors = new int[] { 0 };
        SequentialUpdateMasterTransaction.mergeUpdate(new SequentialUpdateMasterTransaction.Rec[] { rec(5, 50), rec(15, 150) }, 2,
                new SequentialUpdateMasterTransaction.Txn[] { txn(10, 'D', 0) }, 1, out, written, deleted, errors);
        checkEq(written[0], 2, "delete missing: written");
        checkEq(errors[0], 1, "delete missing: errors");

        // -- add on an EXISTING key: duplicate error, but the original record is kept --
        out = openOut(); written = new int[] { 0 }; deleted = new int[] { 0 }; errors = new int[] { 0 };
        SequentialUpdateMasterTransaction.mergeUpdate(new SequentialUpdateMasterTransaction.Rec[] { rec(10, 100) }, 1,
                new SequentialUpdateMasterTransaction.Txn[] { txn(10, 'A', 999) }, 1, out, written, deleted, errors);
        checkEq(written[0], 1, "duplicate add: written");
        checkEq(errors[0], 1, "duplicate add: errors");
        r = readAll(1);
        checkEq(r[1], 100, "duplicate add: keeps the OLD value");

        // -- change on an existing key: value replaced --
        out = openOut(); written = new int[] { 0 }; deleted = new int[] { 0 }; errors = new int[] { 0 };
        SequentialUpdateMasterTransaction.mergeUpdate(new SequentialUpdateMasterTransaction.Rec[] { rec(10, 100) }, 1,
                new SequentialUpdateMasterTransaction.Txn[] { txn(10, 'C', 999) }, 1, out, written, deleted, errors);
        checkEq(written[0], 1, "change: written");
        r = readAll(1);
        checkEq(r[1], 999, "change: new value");

        // -- delete on an existing key: dropped, nothing written for it --
        out = openOut(); written = new int[] { 0 }; deleted = new int[] { 0 }; errors = new int[] { 0 };
        SequentialUpdateMasterTransaction.mergeUpdate(new SequentialUpdateMasterTransaction.Rec[] { rec(10, 100), rec(20, 200) }, 2,
                new SequentialUpdateMasterTransaction.Txn[] { txn(10, 'D', 0) }, 1, out, written, deleted, errors);
        checkEq(written[0], 1, "delete existing: written");
        checkEq(deleted[0], 1, "delete existing: deleted");
        r = readAll(1);
        checkEq(r[0], 20, "delete existing: remaining key");

        // -- leftover master after transactions are exhausted --
        out = openOut(); written = new int[] { 0 }; deleted = new int[] { 0 }; errors = new int[] { 0 };
        SequentialUpdateMasterTransaction.mergeUpdate(new SequentialUpdateMasterTransaction.Rec[] { rec(1, 1), rec(2, 2), rec(3, 3) }, 3,
                new SequentialUpdateMasterTransaction.Txn[] { txn(1, 'D', 0) }, 1, out, written, deleted, errors);
        checkEq(written[0], 2, "leftover master: written");
        checkEq(deleted[0], 1, "leftover master: deleted");

        // -- leftover (trailing) transactions after master is exhausted --
        out = openOut(); written = new int[] { 0 }; deleted = new int[] { 0 }; errors = new int[] { 0 };
        SequentialUpdateMasterTransaction.mergeUpdate(new SequentialUpdateMasterTransaction.Rec[] { rec(1, 1) }, 1,
                new SequentialUpdateMasterTransaction.Txn[] { txn(5, 'A', 50), txn(6, 'D', 0), txn(7, 'C', 70) }, 3, out, written, deleted, errors);
        checkEq(written[0], 2, "trailing: written");
        checkEq(errors[0], 2, "trailing: errors");

        // -- Integer.MIN_VALUE/MAX_VALUE round-trip through key and val unchanged (traced by hand) --
        out = openOut(); written = new int[] { 0 }; deleted = new int[] { 0 }; errors = new int[] { 0 };
        SequentialUpdateMasterTransaction.mergeUpdate(
                new SequentialUpdateMasterTransaction.Rec[] { rec(Integer.MIN_VALUE, 1), rec(0, 2), rec(Integer.MAX_VALUE, 3) }, 3,
                new SequentialUpdateMasterTransaction.Txn[] { txn(Integer.MIN_VALUE, 'C', Integer.MAX_VALUE), txn(Integer.MAX_VALUE, 'C', Integer.MIN_VALUE) }, 2,
                out, written, deleted, errors);
        checkEq(written[0], 3, "extreme: written");
        checkEq(errors[0], 0, "extreme: errors");
        r = readAll(3);
        checkEq(r[0], Integer.MIN_VALUE, "extreme: key0"); checkEq(r[1], Integer.MAX_VALUE, "extreme: val0");
        checkEq(r[4], Integer.MAX_VALUE, "extreme: key2"); checkEq(r[5], Integer.MIN_VALUE, "extreme: val2");

        // -- empty master: every transaction is either an add or an error --
        out = openOut(); written = new int[] { 0 }; deleted = new int[] { 0 }; errors = new int[] { 0 };
        SequentialUpdateMasterTransaction.mergeUpdate(new SequentialUpdateMasterTransaction.Rec[0], 0,
                new SequentialUpdateMasterTransaction.Txn[] { txn(1, 'A', 10), txn(2, 'D', 0) }, 2, out, written, deleted, errors);
        checkEq(written[0], 1, "empty master: written");
        checkEq(errors[0], 1, "empty master: errors");

        // -- empty transactions: every master record is copied unchanged --
        out = openOut(); written = new int[] { 0 }; deleted = new int[] { 0 }; errors = new int[] { 0 };
        SequentialUpdateMasterTransaction.mergeUpdate(new SequentialUpdateMasterTransaction.Rec[] { rec(1, 1), rec(2, 2) }, 2,
                new SequentialUpdateMasterTransaction.Txn[0], 0, out, written, deleted, errors);
        checkEq(written[0], 2, "empty transactions: written");
        checkEq(deleted[0], 0, "empty transactions: deleted");
        checkEq(errors[0], 0, "empty transactions: errors");

        // -- integration: runScenario writes a real file inside a real lab folder and cleans it up --
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_seqjoin_lab_javatest");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();
        SequentialUpdateMasterTransaction.runScenario("unit-test integration", lab,
                new SequentialUpdateMasterTransaction.Rec[] { rec(1, 10), rec(2, 20) },
                new SequentialUpdateMasterTransaction.Txn[] { txn(3, 'A', 30) });
        check(!new File(lab, "newmaster.dat").exists(), "runScenario: cleans up its own file");
        lab.delete();

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
