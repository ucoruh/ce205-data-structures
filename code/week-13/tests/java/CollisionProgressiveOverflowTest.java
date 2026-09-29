import java.io.File;
import java.io.IOException;

/* Unit tests for week-13 java/CollisionProgressiveOverflow.java */
public class CollisionProgressiveOverflowTest {
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
        int EMPTY = CollisionProgressiveOverflow.EMPTY;
        int[] table;
        int[] probes;

        // -- insert into an empty home slot: 1 probe --
        table = new int[9];
        for (int i = 0; i < 9; i++) table[i] = EMPTY;
        probes = new int[] { 0 };
        checkEq(CollisionProgressiveOverflow.poInsert(table, 9, 5, probes), 5, "home slot: index");
        checkEq(probes[0], 1, "home slot: probes");
        checkEq(table[5], 5, "home slot: value stored");

        // -- second key at the same home slot: probes past the first one --
        probes = new int[] { 0 };
        checkEq(CollisionProgressiveOverflow.poInsert(table, 9, 14, probes), 6, "collision: index");
        checkEq(probes[0], 2, "collision: probes");

        // -- wraparound: a key whose home is near the end probes past slot m-1 back to slot 0 --
        table = new int[] { 100, 101, 102, 103, EMPTY };
        probes = new int[] { 0 };
        checkEq(CollisionProgressiveOverflow.poInsert(table, 5, 3, probes), 4, "wraparound: index");
        checkEq(probes[0], 2, "wraparound: probes");

        // -- duplicate key: rejected --
        table = new int[9];
        for (int i = 0; i < 9; i++) table[i] = EMPTY;
        probes = new int[] { 0 };
        CollisionProgressiveOverflow.poInsert(table, 9, 20, probes);
        int before = probes[0];
        checkEq(CollisionProgressiveOverflow.poInsert(table, 9, 20, probes), -2, "duplicate: rc");
        check(probes[0] > before, "duplicate: still probed");

        // -- file full: every slot occupied, insert fails and leaves the table untouched --
        table = new int[] { 10, 11, 12, 13 };
        probes = new int[] { 0 };
        checkEq(CollisionProgressiveOverflow.poInsert(table, 4, 999, probes), -1, "file full: rc");
        checkEq(probes[0], 4, "file full: probes");
        checkEq(table[0], 10, "file full: slot0 untouched");
        checkEq(table[3], 13, "file full: slot3 untouched");

        // -- table with exactly one free slot: the insert succeeds, filling the file exactly --
        table = new int[] { 100, 101, 102, EMPTY, 104 };
        probes = new int[] { 0 };
        int slot = CollisionProgressiveOverflow.poInsert(table, 5, 3, probes);
        checkEq(slot, 3, "last free slot: index");
        checkEq(table[3], 3, "last free slot: value");

        // -- m=1: a single-slot table accepts exactly one key, then is always full --
        int[] one = { EMPTY };
        probes = new int[] { 0 };
        checkEq(CollisionProgressiveOverflow.poInsert(one, 1, 42, probes), 0, "single slot: first insert");
        probes = new int[] { 0 };
        checkEq(CollisionProgressiveOverflow.poInsert(one, 1, 43, probes), -1, "single slot: second insert fails");
        checkEq(probes[0], 1, "single slot: probes");

        // -- an extreme (but non-negative) key: record keys are identifiers, always >= 0 here --
        table = new int[9];
        for (int i = 0; i < 9; i++) table[i] = EMPTY;
        probes = new int[] { 0 };
        int s1 = CollisionProgressiveOverflow.poInsert(table, 9, Integer.MAX_VALUE, probes);
        check(s1 >= 0 && s1 < 9, "extreme key: valid slot");

        // -- integration: runScenario writes a real file inside a real lab folder and cleans it up --
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_probing_lab_javatest");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();
        CollisionProgressiveOverflow.runScenario("unit-test integration", lab, 5, new int[] { 1, 2, 3 });
        check(!new File(lab, "table.dat").exists(), "runScenario: cleans up its own file");
        lab.delete();

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
