/* Unit tests for week-14 java/ReplacementSelection.java */
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ReplacementSelectionTest {
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
        try (BufferedReader r = new BufferedReader(new FileReader(ReplacementSelection.labPath(name)))) {
            String line;
            while ((line = r.readLine()) != null)
                out.add(Integer.valueOf(line.trim()));
        }
        return out;
    }

    static void writeInput(String name, int[] vals) throws Exception {
        try (PrintWriter w = new PrintWriter(new FileWriter(ReplacementSelection.labPath(name)))) {
            for (int v : vals)
                w.println(v);
        }
    }

    /* Independent multiset check: every value in `expected` must appear in `got` exactly once,
     * counted by brute-force linear scan -- catches a value silently dropped, duplicated, or
     * corrupted while being moved between runs. */
    static void checkSameMultiset(List<Integer> got, int[] expected, String label) {
        checkEq(got.size(), expected.length, label + ": size");
        for (int e : expected) {
            int count = 0;
            for (int g : got)
                if (g == e)
                    count++;
            checkEq(count, 1, label + ": count of " + e);
        }
    }

    public static void main(String[] args) throws Exception {
        List<ReplacementSelection.Item> w1 = Arrays.asList(
            new ReplacementSelection.Item(5, ReplacementSelection.Tag.CURRENT),
            new ReplacementSelection.Item(2, ReplacementSelection.Tag.NEXT),
            new ReplacementSelection.Item(9, ReplacementSelection.Tag.CURRENT),
            new ReplacementSelection.Item(1, ReplacementSelection.Tag.NEXT));
        checkEq(ReplacementSelection.extractMinCurrent(w1), 0, "extractMinCurrent picks smallest CURRENT");

        List<ReplacementSelection.Item> w2 = Arrays.asList(
            new ReplacementSelection.Item(5, ReplacementSelection.Tag.NEXT),
            new ReplacementSelection.Item(2, ReplacementSelection.Tag.NEXT));
        checkEq(ReplacementSelection.extractMinCurrent(w2), -1, "extractMinCurrent: nothing CURRENT");

        List<ReplacementSelection.Item> w4 = Arrays.asList(
            new ReplacementSelection.Item(3, ReplacementSelection.Tag.CURRENT),
            new ReplacementSelection.Item(3, ReplacementSelection.Tag.CURRENT),
            new ReplacementSelection.Item(1, ReplacementSelection.Tag.CURRENT));
        checkEq(ReplacementSelection.extractMinCurrent(w4), 2, "extractMinCurrent ties break to true minimum");

        ReplacementSelection.LAB_DIR.mkdir();

        int[] vals = {40, 11, 27, 8, 33, 2, 45, 16, 38, 23, 5, 30};
        writeInput("t_in.txt", vals);
        int[] reads = {0}, writes = {0};
        List<String> runNames;
        try (BufferedReader rin = new BufferedReader(new FileReader(ReplacementSelection.labPath("t_in.txt")))) {
            runNames = ReplacementSelection.replacementSelection(rin, 4, reads, writes);
        }
        checkEq(runNames.size(), 2, "normal run count");
        checkEq(reads[0], 12, "normal reads");
        checkEq(writes[0], 12, "normal writes");
        List<Integer> run0 = readAll(runNames.get(0));
        for (int i = 1; i < run0.size(); i++)
            check(run0.get(i - 1) < run0.get(i), "run0 sorted at " + i);
        List<Integer> run1 = readAll(runNames.get(1));
        for (int i = 1; i < run1.size(); i++)
            check(run1.get(i - 1) < run1.get(i), "run1 sorted at " + i);
        checkEq(run0.size() + run1.size(), 12, "no value lost");
        ReplacementSelection.labPath(runNames.get(0)).delete();
        ReplacementSelection.labPath(runNames.get(1)).delete();

        int[] desc = new int[10];
        int k = 0;
        for (int v = 100; v >= 10; v -= 10)
            desc[k++] = v;
        writeInput("t_in2.txt", desc);
        int[] reads2 = {0}, writes2 = {0};
        List<String> names2;
        try (BufferedReader rin2 = new BufferedReader(new FileReader(ReplacementSelection.labPath("t_in2.txt")))) {
            names2 = ReplacementSelection.replacementSelection(rin2, 4, reads2, writes2);
        }
        checkEq(names2.size(), 3, "descending run count");
        /* every value is read exactly once and written exactly once, whatever the run
         * boundaries -- true by construction (one readInt per read, one println per extracted
         * item), so reads and writes must both equal n regardless of how many runs result */
        checkEq(reads2[0], 10, "descending reads");
        checkEq(writes2[0], 10, "descending writes");
        List<Integer> descRun0 = readAll(names2.get(0));
        List<Integer> descRun1 = readAll(names2.get(1));
        List<Integer> descRun2 = readAll(names2.get(2));
        checkEq(descRun0.size(), 4, "descending run0 length");
        checkEq(descRun1.size(), 4, "descending run1 length");
        checkEq(descRun2.size(), 2, "descending run2 length");
        /* worst case (strictly descending) means each run individually is forced down to
         * exactly RAM_SIZE, so it must ALSO come out sorted ascending within itself */
        for (int i = 1; i < descRun0.size(); i++) check(descRun0.get(i - 1) < descRun0.get(i), "descRun0 sorted at " + i);
        for (int i = 1; i < descRun1.size(); i++) check(descRun1.get(i - 1) < descRun1.get(i), "descRun1 sorted at " + i);
        for (int i = 1; i < descRun2.size(); i++) check(descRun2.get(i - 1) < descRun2.get(i), "descRun2 sorted at " + i);
        List<Integer> descAll = new ArrayList<>();
        descAll.addAll(descRun0); descAll.addAll(descRun1); descAll.addAll(descRun2);
        checkSameMultiset(descAll, desc, "descending multiset");
        for (String s : names2)
            ReplacementSelection.labPath(s).delete();

        int[] shuffled = {9, 3, 7, 1, 8, 2, 6, 4, 10, 5};
        writeInput("t_in3.txt", shuffled);
        int[] reads3 = {0}, writes3 = {0};
        List<String> names3;
        try (BufferedReader rin3 = new BufferedReader(new FileReader(ReplacementSelection.labPath("t_in3.txt")))) {
            names3 = ReplacementSelection.replacementSelection(rin3, 15, reads3, writes3);
        }
        checkEq(names3.size(), 1, "best case run count");
        checkEq(reads3[0], 10, "best case reads");
        checkEq(writes3[0], 10, "best case writes");
        List<Integer> sorted = readAll(names3.get(0));
        checkEq(sorted.size(), 10, "best case size");
        for (int i = 0; i < 10; i++)
            checkEq(sorted.get(i), i + 1, "best case sorted[" + i + "]");
        ReplacementSelection.labPath(names3.get(0)).delete();

        ReplacementSelection.labPath("t_in.txt").delete();
        ReplacementSelection.labPath("t_in2.txt").delete();
        ReplacementSelection.labPath("t_in3.txt").delete();
        ReplacementSelection.LAB_DIR.delete();
        check(!ReplacementSelection.LAB_DIR.exists(), "lab folder cleaned up");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
