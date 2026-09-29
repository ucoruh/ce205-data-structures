/* Week 14 -- File Organisation II
 * Replacement selection: keep a small RAM window (a min-heap in practice); a record smaller
 * than the last one WRITTEN cannot extend the current run, so it is tagged for the NEXT run.
 * This makes runs longer than RAM -- about 2x on random data, one run in the best case, and
 * exactly RAM_SIZE in the worst case (strictly descending input).
 *
 * This program creates real files, but only inside a lab folder it creates itself; every file and
 * the folder are removed again before the program exits.
 * CEN207 Data Structures (formerly CE205)
 */
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

public class ReplacementSelection {
    static final File LAB_DIR = new File("lab_replacement_selection");

    static File labPath(String name) { return new File(LAB_DIR, name); }

    enum Tag { CURRENT, NEXT }

    static class Item {
        int val;
        Tag tag;
        Item(int val, Tag tag) { this.val = val; this.tag = tag; }
    }

    static int extractMinCurrent(List<Item> window) {
        int best = -1;
        for (int i = 0; i < window.size(); i++)
            if (window.get(i).tag == Tag.CURRENT && (best == -1 || window.get(i).val < window.get(best).val))
                best = i;
        return best;
    }

    static Integer readInt(BufferedReader r) throws IOException {
        String line = r.readLine();
        return line != null ? Integer.valueOf(line.trim()) : null;
    }

    static List<String> replacementSelection(BufferedReader in, int m, int[] reads, int[] writes) throws IOException {
        List<Item> window = new ArrayList<>();
        for (int i = 0; i < m; i++) {
            Integer v = readInt(in);
            if (v == null)
                break;
            window.add(new Item(v, Tag.CURRENT));
            reads[0]++;
        }
        int lastWritten = Integer.MIN_VALUE;
        List<String> runNames = new ArrayList<>();
        runNames.add("run_" + runNames.size() + ".txt");
        PrintWriter out = new PrintWriter(new FileWriter(labPath(runNames.get(runNames.size() - 1))));

        while (!window.isEmpty()) {
            int best = extractMinCurrent(window);
            if (best == -1) {
                for (Item it : window)
                    it.tag = Tag.CURRENT;
                lastWritten = Integer.MIN_VALUE;
                out.close();
                runNames.add("run_" + runNames.size() + ".txt");
                out = new PrintWriter(new FileWriter(labPath(runNames.get(runNames.size() - 1))));
                continue;
            }
            int val = window.get(best).val;
            out.println(val);
            writes[0]++;
            lastWritten = val;
            window.remove(best);
            Integer v = readInt(in);
            if (v != null) {
                reads[0]++;
                window.add(new Item(v, v >= lastWritten ? Tag.CURRENT : Tag.NEXT));
            }
        }
        out.close();
        return runNames;
    }

    static void runScenario(String label, int[] keys, int m) throws IOException {
        System.out.println("-- " + label + " --");
        System.out.println("RAM_SIZE=" + m);

        try (PrintWriter input = new PrintWriter(new FileWriter(labPath("input.txt")))) {
            for (int k : keys)
                input.println(k);
        }

        int[] reads = {0}, writes = {0};
        List<String> runNames;
        try (BufferedReader in = new BufferedReader(new FileReader(labPath("input.txt")))) {
            runNames = replacementSelection(in, m, reads, writes);
        }

        System.out.println("runs=" + runNames.size() + " reads=" + reads[0] + " writes=" + writes[0]);
        for (int r = 0; r < runNames.size(); r++) {
            StringBuilder sb = new StringBuilder("  run " + (r + 1) + ":");
            try (BufferedReader f = new BufferedReader(new FileReader(labPath(runNames.get(r))))) {
                String line;
                while ((line = f.readLine()) != null)
                    sb.append(' ').append(line.trim());
            }
            System.out.println(sb);
            labPath(runNames.get(r)).delete();
        }
        labPath("input.txt").delete();
        System.out.println();
    }

    public static void main(String[] args) throws IOException {
        LAB_DIR.mkdir(); // self-made lab folder; nothing is ever written outside it

        int[] normalKeys = {40, 11, 27, 8, 33, 2, 45, 16, 38, 23, 5, 30};
        runScenario("normal: RAM=4, 12 mixed values", normalKeys, 4);

        int[] hardKeys = {55, 12, 40, 3, 28, 61, 9, 47, 20, 34, 6, 52, 17, 44};
        runScenario("hard: RAM=3, 14 mixed values", hardKeys, 3);

        int[] descKeys = {100, 90, 80, 70, 60, 50, 40, 30, 20, 10};
        runScenario("edge: worst case, strictly descending input", descKeys, 4);

        int[] allKeys = {9, 3, 7, 1, 8, 2, 6, 4, 10, 5};
        runScenario("edge: best case, RAM >= n -- a single run", allKeys, 15);

        LAB_DIR.delete(); // clean up: the lab folder is empty and removed
    }
}
