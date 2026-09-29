import java.io.File;
import java.io.IOException;

/* Unit tests for week-13 java/DeletionWithTombstones.java */
public class DeletionWithTombstonesTest {
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
        int EMPTY = DeletionWithTombstones.EMPTY, TOMB = DeletionWithTombstones.TOMB;
        int[] table = new int[9];

        // -- find on an empty table: not found immediately --
        for (int i = 0; i < 9; i++) table[i] = EMPTY;
        checkEq(DeletionWithTombstones.tsFind(table, 9, 5), -1, "empty table: not found");

        // -- insert then find: found at its home slot --
        DeletionWithTombstones.tsInsert(table, 9, 5);
        checkEq(DeletionWithTombstones.tsFind(table, 9, 5), 5, "insert then find");

        // -- delete a key that is not present: no-op --
        checkEq(DeletionWithTombstones.tsDelete(table, 9, 999), -1, "delete missing key");

        // -- delete an existing key: slot becomes TOMB --
        checkEq(DeletionWithTombstones.tsDelete(table, 9, 5), 5, "delete existing key");
        checkEq(table[5], TOMB, "slot becomes TOMB");

        // -- find on a deleted key: not found --
        checkEq(DeletionWithTombstones.tsFind(table, 9, 5), -1, "find deleted key");

        // -- classic tombstone scenario: delete the head of a probe chain, the tail must still be found --
        for (int i = 0; i < 9; i++) table[i] = EMPTY;
        DeletionWithTombstones.tsInsert(table, 9, 2);
        DeletionWithTombstones.tsInsert(table, 9, 11);
        DeletionWithTombstones.tsInsert(table, 9, 20);
        DeletionWithTombstones.tsDelete(table, 9, 2);
        checkEq(table[2], TOMB, "head becomes tombstone");
        checkEq(DeletionWithTombstones.tsFind(table, 9, 11), 3, "skips one tombstone");
        checkEq(DeletionWithTombstones.tsFind(table, 9, 20), 4, "skips tombstone and an occupied slot");

        // -- genuinely absent key with the same home still stops at a true empty slot --
        checkEq(DeletionWithTombstones.tsFind(table, 9, 29), -1, "absent key stops at real empty");

        // -- insert reuses a tombstone instead of probing further --
        int slot = DeletionWithTombstones.tsInsert(table, 9, 38);
        checkEq(slot, 2, "insert reuses tombstone slot");
        checkEq(table[2], 38, "tombstone slot now holds new key");

        // -- delete then reinsert the SAME key: lands back at the same slot --
        for (int i = 0; i < 9; i++) table[i] = EMPTY;
        DeletionWithTombstones.tsInsert(table, 9, 7);
        int home = DeletionWithTombstones.tsFind(table, 9, 7);
        DeletionWithTombstones.tsDelete(table, 9, 7);
        checkEq(DeletionWithTombstones.tsInsert(table, 9, 7), home, "reinsert same key: same slot");

        // -- a fully-tombstoned table: find must terminate, not loop forever --
        int[] full = new int[5];
        for (int i = 0; i < 5; i++) full[i] = TOMB;
        checkEq(DeletionWithTombstones.tsFind(full, 5, 123), -1, "fully tombstoned: find terminates");

        // -- insert into a fully-tombstoned table reuses the very first slot it tries --
        for (int i = 0; i < 5; i++) full[i] = TOMB;
        checkEq(DeletionWithTombstones.tsInsert(full, 5, 3), 3, "fully tombstoned: insert reuses home slot");

        // -- m=1: delete then find then reinsert, all on the single slot --
        int[] one = { EMPTY };
        DeletionWithTombstones.tsInsert(one, 1, 9);
        checkEq(DeletionWithTombstones.tsDelete(one, 1, 9), 0, "m=1: delete");
        checkEq(DeletionWithTombstones.tsFind(one, 1, 9), -1, "m=1: find after delete");
        checkEq(DeletionWithTombstones.tsInsert(one, 1, 9), 0, "m=1: reinsert");

        // -- integration: runScenario writes a real file inside a real lab folder and cleans it up --
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_tombstone_lab_javatest");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();
        DeletionWithTombstones.runScenario("unit-test integration", lab, 7, new int[] { 1, 2, 3 }, new int[] { 2 }, 1, 99, 9);
        check(!new File(lab, "table.dat").exists(), "runScenario: cleans up its own file");
        lab.delete();

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
