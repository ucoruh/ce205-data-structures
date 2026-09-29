/* Unit tests for week-14 java/ExternalMergeSort.java */
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

public class ExternalMergeSortTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static List<Integer> readAll(String name) throws Exception {
        List<Integer> out = new ArrayList<>();
        try (BufferedReader r = new BufferedReader(new FileReader(ExternalMergeSort.labPath(name)))) {
            String line;
            while ((line = r.readLine()) != null)
                out.add(Integer.valueOf(line.trim()));
        }
        return out;
    }

    /* externalMergeSort() prints its final sorted run to stdout and deletes the file, so to
     * test the full end-to-end method (not just its createRuns/mergeGroup building blocks) this
     * captures stdout, runs it, and hands the captured text back to the caller. */
    static String captureRun(int[] keys, int runSize, int fanIn, int[] reads, int[] writes, int[] passes)
            throws Exception {
        PrintStream savedOut = System.out;
        ByteArrayOutputStream buf = new ByteArrayOutputStream();
        System.setOut(new PrintStream(buf));
        try {
            ExternalMergeSort.externalMergeSort(keys, runSize, fanIn, reads, writes, passes);
        } finally {
            System.setOut(savedOut);
        }
        return buf.toString();
    }

    /* Independent parse: pulls the space-separated integers that follow `marker` out of `text`. */
    static int[] parseIntsAfter(String text, String marker) {
        int start = text.indexOf(marker);
        if (start == -1)
            return new int[0];
        String rest = text.substring(start + marker.length());
        int end = rest.indexOf('\n');
        if (end != -1)
            rest = rest.substring(0, end);
        rest = rest.trim();
        if (rest.isEmpty())
            return new int[0];
        String[] parts = rest.split("\\s+");
        int[] out = new int[parts.length];
        for (int i = 0; i < parts.length; i++)
            out[i] = Integer.parseInt(parts[i]);
        return out;
    }

    public static void main(String[] args) throws Exception {
        ExternalMergeSort.LAB_DIR.mkdir();

        int[] input = {9, 2, 7, 4, 1, 8, 5};
        String[] names = new String[32];
        int[] writes = {0};
        int numRuns = ExternalMergeSort.createRuns(input, 3, names, writes);
        checkEq(numRuns, 3, "3 runs created from 7 values, RUN_SIZE=3");
        checkEq(writes[0], 3, "3 writes for run creation");
        List<Integer> run0 = readAll(names[0]);
        checkEq(run0.size(), 3, "run0 size");
        checkEq(run0.get(0), 2, "run0[0]");
        checkEq(run0.get(1), 7, "run0[1]");
        checkEq(run0.get(2), 9, "run0[2]");
        List<Integer> run2 = readAll(names[2]);
        checkEq(run2.size(), 1, "last run is partial");
        checkEq(run2.get(0), 5, "last run value");
        ExternalMergeSort.labPath(names[0]).delete();
        ExternalMergeSort.labPath(names[1]).delete();
        ExternalMergeSort.labPath(names[2]).delete();

        int[] singleIn = {5, 1, 4, 2, 3};
        String[] singleNames = new String[32];
        int[] w2 = {0};
        int n2 = ExternalMergeSort.createRuns(singleIn, 100, singleNames, w2);
        checkEq(n2, 1, "RUN_SIZE >= n makes one run");
        List<Integer> single = readAll(singleNames[0]);
        checkEq(single.size(), 5, "single run size");
        for (int i = 1; i < 5; i++)
            check(single.get(i - 1) < single.get(i), "single run sorted at " + i);
        ExternalMergeSort.labPath(singleNames[0]).delete();

        try (PrintWriter fa = new PrintWriter(new FileWriter(ExternalMergeSort.labPath("t_a.txt")))) {
            fa.println(1); fa.println(4); fa.println(7);
        }
        try (PrintWriter fb = new PrintWriter(new FileWriter(ExternalMergeSort.labPath("t_b.txt")))) {
            fb.println(2); fb.println(3); fb.println(9);
        }
        int[] reads = {0}, mwrites = {0};
        ExternalMergeSort.mergeGroup(new String[]{"t_a.txt", "t_b.txt"}, 2, "t_out.txt", reads, mwrites);
        checkEq(reads[0], 2, "merge reads");
        checkEq(mwrites[0], 1, "merge writes");
        List<Integer> merged = readAll("t_out.txt");
        int[] expected = {1, 2, 3, 4, 7, 9};
        checkEq(merged.size(), 6, "merged size");
        for (int i = 0; i < 6; i++)
            checkEq(merged.get(i), expected[i], "merged[" + i + "]");
        check(!ExternalMergeSort.labPath("t_a.txt").exists(), "merged-away input removed");
        ExternalMergeSort.labPath("t_out.txt").delete();

        ExternalMergeSort.labPath("t_empty.txt").createNewFile();
        try (PrintWriter fc = new PrintWriter(new FileWriter(ExternalMergeSort.labPath("t_c.txt")))) {
            fc.println(1); fc.println(2); fc.println(3);
        }
        int[] r2 = {0}, w3 = {0};
        ExternalMergeSort.mergeGroup(new String[]{"t_empty.txt", "t_c.txt"}, 2, "t_out2.txt", r2, w3);
        List<Integer> merged2 = readAll("t_out2.txt");
        checkEq(merged2.size(), 3, "empty-run merge size");
        checkEq(merged2.get(0), 1, "empty-run merge first value");
        ExternalMergeSort.labPath("t_out2.txt").delete();

        /* externalMergeSort end-to-end, ONE run: RUN_SIZE >= n means createRuns makes exactly
         * one run and the "while (numRuns > 1)" merge loop never executes at all -- reading
         * that loop condition (not running the program) is what tells us passes must be 0,
         * reads must be 0 (mergeGroup is never called) and writes must be 1 (the single run
         * file). The sorted content itself is checked against Arrays.sort() (the Java
         * library's own independent sort), not against anything externalMergeSort printed
         * before. */
        {
            int[] oneRun = {9, 3, 7, 1, 8, 2, 6, 4, 10, 5};
            int[] r = {0}, w = {0}, p = {0};
            String out = captureRun(oneRun, 100, 2, r, w, p);
            checkEq(p[0], 0, "one-run: passes");
            checkEq(w[0], 1, "one-run: writes");
            checkEq(r[0], 0, "one-run: reads");
            int[] got = parseIntsAfter(out, "sorted output:");
            int[] expect = oneRun.clone();
            java.util.Arrays.sort(expect);
            checkEq(got.length, 10, "one-run: sorted output length");
            for (int i = 0; i < Math.min(got.length, expect.length); i++)
                checkEq(got[i], expect[i], "one-run: sorted[" + i + "]");
            check(out.contains("pass 0: 1 runs created"), "one-run: pass-0 message");
        }

        /* externalMergeSort end-to-end, MANY runs/passes: 16 values, RUN_SIZE=2 -> 8 runs;
         * FAN_IN=2 merges pairs each pass, so the run count halves every pass: 8 -> 4 -> 2 -> 1,
         * exactly 3 passes (a plain ceil(log2(8)) count, derived from the numbers, not from
         * running the program). Every pass merges ALL of its runs in pairs (8, 4 and 2 are all
         * even), so every mergeGroup call handles exactly 2 runs: reads = 2 per merge * 7 merges
         * = 14, writes = 8 (createRuns) + 7 (one per merge) = 15. */
        {
            int[] manyKeys = {40, 11, 27, 8, 33, 2, 45, 16, 38, 23, 5, 30, 19, 44, 1, 50};
            int[] r = {0}, w = {0}, p = {0};
            String out = captureRun(manyKeys, 2, 2, r, w, p);
            checkEq(p[0], 3, "many-runs: passes");
            checkEq(w[0], 15, "many-runs: writes");
            checkEq(r[0], 14, "many-runs: reads");
            int[] got = parseIntsAfter(out, "sorted output:");
            int[] expect = manyKeys.clone();
            java.util.Arrays.sort(expect);
            checkEq(got.length, 16, "many-runs: sorted output length");
            for (int i = 0; i < Math.min(got.length, expect.length); i++)
                checkEq(got[i], expect[i], "many-runs: sorted[" + i + "]");
            check(out.contains("pass 0: 8 runs created"), "many-runs: pass-0 message");
            check(out.contains("pass 3: 1 run(s) remain"), "many-runs: pass-3 message");
        }

        ExternalMergeSort.LAB_DIR.delete();
        check(!ExternalMergeSort.LAB_DIR.exists(), "lab folder cleaned up");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
