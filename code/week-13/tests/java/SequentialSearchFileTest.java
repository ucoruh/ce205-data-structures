import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;

/* Unit tests for week-13 java/SequentialSearchFile.java */
public class SequentialSearchFileTest {
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
    static RandomAccessFile writeScratch(int[] keys) throws IOException {
        scratch = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_seqsearch_lab_java_scratch.bin");
        try (RandomAccessFile w = new RandomAccessFile(scratch, "rw")) {
            w.setLength(0);
            for (int k : keys) w.writeInt(k);
        }
        return new RandomAccessFile(scratch, "r");
    }
    static void closeScratch(RandomAccessFile fp) throws IOException { fp.close(); scratch.delete(); }

    public static void main(String[] args) throws IOException {
        RandomAccessFile fp;
        int[] reads, comparisons;
        int idx;

        // -- found in the first block, first record: best case, 1 read, 1 comparison --
        int[] a = { 5, 8, 13, 21, 34, 55, 89 };
        fp = writeScratch(a);
        reads = new int[] { 0 }; comparisons = new int[] { 0 };
        idx = SequentialSearchFile.seqSearchFile(fp, 7, 5, reads, comparisons);
        checkEq(idx, 0, "first block first record: index");
        checkEq(reads[0], 1, "first block first record: reads");
        checkEq(comparisons[0], 1, "first block first record: comparisons");
        closeScratch(fp);

        // -- found in the last block, last record: worst found case --
        fp = writeScratch(a);
        reads = new int[] { 0 }; comparisons = new int[] { 0 };
        idx = SequentialSearchFile.seqSearchFile(fp, 7, 89, reads, comparisons);
        checkEq(idx, 6, "last block last record: index");
        checkEq(reads[0], 2, "last block last record: reads");
        checkEq(comparisons[0], 7, "last block last record: comparisons");
        closeScratch(fp);

        // -- not found: every block is read, every record compared --
        fp = writeScratch(a);
        reads = new int[] { 0 }; comparisons = new int[] { 0 };
        idx = SequentialSearchFile.seqSearchFile(fp, 7, 999, reads, comparisons);
        checkEq(idx, -1, "not found: index");
        checkEq(reads[0], 2, "not found: reads");
        checkEq(comparisons[0], 7, "not found: comparisons");
        closeScratch(fp);

        // -- duplicates: the FIRST occurrence is returned --
        int[] d = { 1, 9, 9, 9, 2 };
        fp = writeScratch(d);
        reads = new int[] { 0 }; comparisons = new int[] { 0 };
        idx = SequentialSearchFile.seqSearchFile(fp, 5, 9, reads, comparisons);
        checkEq(idx, 1, "duplicates: first occurrence");
        closeScratch(fp);

        // -- one record: found --
        int[] one = { 42 };
        fp = writeScratch(one);
        reads = new int[] { 0 }; comparisons = new int[] { 0 };
        checkEq(SequentialSearchFile.seqSearchFile(fp, 1, 42, reads, comparisons), 0, "one record found");
        checkEq(reads[0], 1, "one record found: reads");
        closeScratch(fp);

        // -- one record: not found --
        fp = writeScratch(one);
        reads = new int[] { 0 }; comparisons = new int[] { 0 };
        checkEq(SequentialSearchFile.seqSearchFile(fp, 1, 7, reads, comparisons), -1, "one record not found");
        checkEq(reads[0], 1, "one record not found: reads");
        checkEq(comparisons[0], 1, "one record not found: comparisons");
        closeScratch(fp);

        // -- exactly one full block (n == BF): still exactly one read --
        int[] exact = { 10, 20, 30, 40 };
        fp = writeScratch(exact);
        reads = new int[] { 0 }; comparisons = new int[] { 0 };
        checkEq(SequentialSearchFile.seqSearchFile(fp, 4, 40, reads, comparisons), 3, "exact block: index");
        checkEq(reads[0], 1, "exact block: reads");
        closeScratch(fp);

        // -- negative and extreme keys round-trip correctly --
        int[] extreme = { Integer.MIN_VALUE, -5, 0, 5, Integer.MAX_VALUE };
        fp = writeScratch(extreme);
        reads = new int[] { 0 }; comparisons = new int[] { 0 };
        checkEq(SequentialSearchFile.seqSearchFile(fp, 5, Integer.MIN_VALUE, reads, comparisons), 0, "extreme: MIN_VALUE");
        closeScratch(fp);
        fp = writeScratch(extreme);
        reads = new int[] { 0 }; comparisons = new int[] { 0 };
        checkEq(SequentialSearchFile.seqSearchFile(fp, 5, Integer.MAX_VALUE, reads, comparisons), 4, "extreme: MAX_VALUE");
        closeScratch(fp);

        // -- empty file (n=0): zero blocks, search terminates immediately --
        fp = writeScratch(new int[0]);
        reads = new int[] { 0 }; comparisons = new int[] { 0 };
        checkEq(SequentialSearchFile.seqSearchFile(fp, 0, 5, reads, comparisons), -1, "empty file: not found");
        checkEq(reads[0], 0, "empty file: reads");
        checkEq(comparisons[0], 0, "empty file: comparisons");
        closeScratch(fp);

        // -- integration: runScenario writes a real file inside a real lab folder and cleans it up --
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_seqsearch_lab_javatest");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();
        SequentialSearchFile.runScenario("unit-test integration", lab, new int[] { 3, 6, 9, 12, 15 }, 9);
        check(!new File(lab, "file.dat").exists(), "runScenario: cleans up its own file");
        lab.delete();

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
