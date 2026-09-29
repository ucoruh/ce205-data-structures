import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;

/* Unit tests for week-13 java/BinarySearchSortedFile.java */
public class BinarySearchSortedFileTest {
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
        scratch = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_binsearch_lab_java_scratch.bin");
        try (RandomAccessFile w = new RandomAccessFile(scratch, "rw")) {
            w.setLength(0);
            for (int k : keys) w.writeInt(k);
        }
        return new RandomAccessFile(scratch, "r");
    }
    static void closeScratch(RandomAccessFile fp) throws IOException { fp.close(); scratch.delete(); }

    public static void main(String[] args) throws IOException {
        RandomAccessFile fp;
        int[] reads;

        // -- exactly one block (n <= BF): found in the single probe --
        int[] oneBlock = { 5, 10, 15, 20 };
        fp = writeScratch(oneBlock);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 1, 15, reads), 2, "one block: found");
        checkEq(reads[0], 1, "one block: reads");
        closeScratch(fp);

        // -- exactly one block: not found (a gap) still costs only 1 read --
        fp = writeScratch(oneBlock);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 1, 12, reads), -1, "one block: gap");
        checkEq(reads[0], 1, "one block gap: reads");
        closeScratch(fp);

        // -- found at the very first key --
        int[] a = { 3, 9, 14, 20, 27, 31, 38, 44, 50, 57, 63, 70 };
        fp = writeScratch(a);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 3, 3, reads), 0, "first key");
        closeScratch(fp);

        // -- found at the very last key --
        fp = writeScratch(a);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 3, 70, reads), 11, "last key");
        closeScratch(fp);

        // -- target below the minimum: not found --
        fp = writeScratch(a);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 3, 1, reads), -1, "below minimum");
        check(reads[0] >= 1 && reads[0] <= 3, "below minimum: reads bounded");
        closeScratch(fp);

        // -- target above the maximum: not found --
        fp = writeScratch(a);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 3, 999, reads), -1, "above maximum");
        closeScratch(fp);

        // -- target inside a block's range but absent: a gap --
        fp = writeScratch(a);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 3, 45, reads), -1, "gap inside range");
        closeScratch(fp);

        // -- sanity bound on a bigger file --
        int[] big = new int[24];
        for (int i = 0; i < 24; i++) big[i] = 2 + i * 3;
        fp = writeScratch(big);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 6, 71, reads), 23, "big file: found");
        check(reads[0] <= 4, "big file: reads bounded");
        closeScratch(fp);

        // -- negative and extreme keys round-trip correctly --
        int[] extreme = { Integer.MIN_VALUE, -100, 0, 100, Integer.MAX_VALUE };
        fp = writeScratch(extreme);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 2, Integer.MIN_VALUE, reads), 0, "extreme: MIN_VALUE");
        closeScratch(fp);
        fp = writeScratch(extreme);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 2, Integer.MAX_VALUE, reads), 4, "extreme: MAX_VALUE");
        closeScratch(fp);

        // -- empty file: zero blocks, search must terminate immediately with no probe --
        fp = writeScratch(new int[0]);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 0, 5, reads), -1, "empty file: not found");
        checkEq(reads[0], 0, "empty file: reads");
        closeScratch(fp);

        // -- exactly one real key (n=1, a single possibly-partial block): found and not found --
        int[] single = { 42 };
        fp = writeScratch(single);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 1, 42, reads), 0, "one key: found");
        checkEq(reads[0], 1, "one key: reads");
        closeScratch(fp);
        fp = writeScratch(single);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 1, 7, reads), -1, "one key: not found");
        checkEq(reads[0], 1, "one key not found: reads");
        closeScratch(fp);

        // -- exactly two keys (n=2, one partial block): both ends found, a value between them is a gap --
        int[] pair = { 10, 20 };
        fp = writeScratch(pair);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 1, 10, reads), 0, "two keys: first");
        closeScratch(fp);
        fp = writeScratch(pair);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 1, 20, reads), 1, "two keys: second");
        closeScratch(fp);
        fp = writeScratch(pair);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 1, 15, reads), -1, "two keys: gap between them");
        closeScratch(fp);

        // -- duplicate keys inside one block: traced by hand -- mid=1 (block [9,15,20,26]) too big for key=4,
        // so hi drops to block 0 ([2,4,4,4]); the block scan returns the FIRST matching index in that block --
        int[] dup = { 2, 4, 4, 4, 9, 15, 20, 26, 31, 37, 42, 48 };
        fp = writeScratch(dup);
        reads = new int[] { 0 };
        checkEq(BinarySearchSortedFile.bsearchFile(fp, 3, 4, reads), 1, "duplicates: first match in block");
        checkEq(reads[0], 2, "duplicates: reads");
        closeScratch(fp);

        // -- integration: runScenario writes a real file inside a real lab folder and cleans it up --
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_binsearch_lab_javatest");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();
        BinarySearchSortedFile.runScenario("unit-test integration", lab, new int[] { 2, 4, 6, 8, 10 }, 6);
        check(!new File(lab, "file.dat").exists(), "runScenario: cleans up its own file");
        lab.delete();

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
