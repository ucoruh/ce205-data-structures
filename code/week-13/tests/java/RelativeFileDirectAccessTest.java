import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;

/* Unit tests for week-13 java/RelativeFileDirectAccess.java */
public class RelativeFileDirectAccessTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static File scratch;
    static RandomAccessFile makeFile(int total) throws IOException {
        scratch = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_relative_lab_java_scratch.bin");
        try (RandomAccessFile w = new RandomAccessFile(scratch, "rw")) {
            w.setLength(0);
            for (int i = 0; i < total; i++) w.writeInt(100 + i * 3);
        }
        return new RandomAccessFile(scratch, "r");
    }
    static void closeScratch(RandomAccessFile fp) throws IOException { fp.close(); scratch.delete(); }

    public static void main(String[] args) throws IOException {
        RandomAccessFile fp;
        int[] val = new int[1], reads;

        // -- rrn=0: block 0, offset 0 --
        fp = makeFile(13);
        reads = new int[] { 0 };
        checkEq(RelativeFileDirectAccess.directRead(fp, 13, 0, val, reads), 0, "rrn=0: rc");
        checkEq(val[0], 100, "rrn=0: value");
        checkEq(reads[0], 1, "rrn=0: reads");
        closeScratch(fp);

        // -- rrn in the middle of a block --
        fp = makeFile(13);
        reads = new int[] { 0 };
        checkEq(RelativeFileDirectAccess.directRead(fp, 13, 7, val, reads), 0, "rrn=7: rc");
        checkEq(val[0], 100 + 7 * 3, "rrn=7: value");
        checkEq(reads[0], 1, "rrn=7: reads");
        closeScratch(fp);

        // -- rrn at the very last valid position --
        fp = makeFile(13);
        reads = new int[] { 0 };
        checkEq(RelativeFileDirectAccess.directRead(fp, 13, 12, val, reads), 0, "rrn=12: rc");
        checkEq(val[0], 100 + 12 * 3, "rrn=12: value");
        closeScratch(fp);

        // -- negative rrn: invalid, no read performed --
        fp = makeFile(13);
        reads = new int[] { 0 };
        checkEq(RelativeFileDirectAccess.directRead(fp, 13, -1, val, reads), -1, "negative rrn: rc");
        checkEq(reads[0], 0, "negative rrn: reads");
        closeScratch(fp);

        // -- rrn == total: invalid --
        fp = makeFile(13);
        reads = new int[] { 0 };
        checkEq(RelativeFileDirectAccess.directRead(fp, 13, 13, val, reads), -1, "rrn==total: rc");
        checkEq(reads[0], 0, "rrn==total: reads");
        closeScratch(fp);

        // -- rrn far beyond the end: invalid --
        fp = makeFile(13);
        reads = new int[] { 0 };
        checkEq(RelativeFileDirectAccess.directRead(fp, 13, 1000, val, reads), -1, "far beyond: rc");
        closeScratch(fp);

        // -- the single record in a partial last block is still reachable --
        fp = makeFile(11);
        reads = new int[] { 0 };
        checkEq(RelativeFileDirectAccess.directRead(fp, 11, 10, val, reads), 0, "partial block: rc");
        checkEq(val[0], 100 + 10 * 3, "partial block: value");
        checkEq(reads[0], 1, "partial block: reads");
        closeScratch(fp);

        // -- one past the last partial block: invalid, no read (caught before probing) --
        fp = makeFile(11);
        reads = new int[] { 0 };
        checkEq(RelativeFileDirectAccess.directRead(fp, 11, 11, val, reads), -1, "past partial block: rc");
        checkEq(reads[0], 0, "past partial block: reads");
        closeScratch(fp);

        // -- exactly one record: only rrn=0 is valid --
        fp = makeFile(1);
        reads = new int[] { 0 };
        checkEq(RelativeFileDirectAccess.directRead(fp, 1, 0, val, reads), 0, "single record: rc");
        closeScratch(fp);
        fp = makeFile(1);
        reads = new int[] { 0 };
        checkEq(RelativeFileDirectAccess.directRead(fp, 1, 1, val, reads), -1, "single record out of range: rc");
        closeScratch(fp);

        // -- empty file (total=0): every rrn is out of range, caught before any read --
        fp = makeFile(0);
        reads = new int[] { 0 };
        checkEq(RelativeFileDirectAccess.directRead(fp, 0, 0, val, reads), -1, "empty file: rc");
        checkEq(reads[0], 0, "empty file: reads");
        closeScratch(fp);

        // -- every valid rrn in a file costs exactly one read --
        fp = makeFile(16);
        int totalReads = 0;
        for (int i = 0; i < 16; i++) { int[] one = { 0 }; RelativeFileDirectAccess.directRead(fp, 16, i, val, one); totalReads += one[0]; }
        checkEq(totalReads, 16, "every rrn costs one read");
        closeScratch(fp);

        // -- integration: runScenario writes a real file inside a real lab folder and cleans it up --
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_relative_lab_javatest");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();
        RelativeFileDirectAccess.runScenario("unit-test integration", lab, 5, new int[] { 0, 2, 4 });
        check(!new File(lab, "file.dat").exists(), "runScenario: cleans up its own file");
        lab.delete();

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
