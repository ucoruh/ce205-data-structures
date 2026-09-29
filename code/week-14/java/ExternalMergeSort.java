/* Week 14 -- File Organisation II
 * External merge sort: Pass 0 sorts RUN_SIZE-record chunks in RAM and writes them out as sorted
 * RUN FILES; later passes k-way MERGE up to FAN_IN runs at a time, reading one small buffer (a
 * single next value) per run file, until a single sorted run remains.
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
import java.util.Arrays;

public class ExternalMergeSort {
    static final File LAB_DIR = new File("lab_external_merge_sort");

    static File labPath(String name) { return new File(LAB_DIR, name); }

    // Phase 1: RUN_SIZE-record chunks, sorted in RAM, written out as run files (+1 write per run).
    static int createRuns(int[] input, int runSize, String[] names, int[] writes) throws IOException {
        int r = 0;
        for (int i = 0; i < input.length; i += runSize) {
            int len = Math.min(runSize, input.length - i);
            int[] chunk = Arrays.copyOfRange(input, i, i + len);
            Arrays.sort(chunk);
            names[r] = "run_" + r + ".txt";
            try (PrintWriter out = new PrintWriter(new FileWriter(labPath(names[r])))) {
                for (int v : chunk)
                    out.println(v);
            }
            writes[0]++;
            r++;
        }
        return r;
    }

    // Merge g run files into one new run file: ONE small read buffer per run (its next unread
    // value), never the whole run in RAM.
    static void mergeGroup(String[] names, int g, String outName, int[] reads, int[] writes) throws IOException {
        BufferedReader[] in = new BufferedReader[g];
        Integer[] val = new Integer[g];
        for (int i = 0; i < g; i++) {
            in[i] = new BufferedReader(new FileReader(labPath(names[i])));
            String line = in[i].readLine();
            val[i] = line != null ? Integer.valueOf(line.trim()) : null;
            reads[0]++;
        }
        try (PrintWriter out = new PrintWriter(new FileWriter(labPath(outName)))) {
            while (true) {
                int best = -1;
                for (int i = 0; i < g; i++)
                    if (val[i] != null && (best == -1 || val[i] < val[best]))
                        best = i;
                if (best == -1)
                    break;
                out.println(val[best]);
                String line = in[best].readLine();
                val[best] = line != null ? Integer.valueOf(line.trim()) : null;
            }
        }
        writes[0]++;
        for (int i = 0; i < g; i++) {
            in[i].close();
            labPath(names[i]).delete(); // the merged-away run is no longer needed
        }
    }

    static void externalMergeSort(int[] input, int runSize, int fanIn, int[] reads, int[] writes, int[] passes) throws IOException {
        String[] names = new String[32];
        int numRuns = createRuns(input, runSize, names, writes);
        System.out.println("pass 0: " + numRuns + " runs created");

        passes[0] = 0;
        while (numRuns > 1) {
            passes[0]++;
            String[] next = new String[32];
            int nextN = 0;
            for (int g = 0; g < numRuns; g += fanIn) {
                int glen = Math.min(fanIn, numRuns - g);
                if (glen == 1) {
                    next[nextN] = names[g]; // lone run: carry forward, no I/O
                } else {
                    next[nextN] = "pass" + passes[0] + "_" + nextN + ".txt";
                    mergeGroup(Arrays.copyOfRange(names, g, g + glen), glen, next[nextN], reads, writes);
                }
                nextN++;
            }
            names = next;
            numRuns = nextN;
            System.out.println("pass " + passes[0] + ": " + numRuns + " run(s) remain");
        }

        StringBuilder sb = new StringBuilder("sorted output:");
        try (BufferedReader r = new BufferedReader(new FileReader(labPath(names[0])))) {
            String line;
            while ((line = r.readLine()) != null)
                sb.append(' ').append(line.trim());
        }
        System.out.println(sb);
        labPath(names[0]).delete();
    }

    static void runScenario(String label, int[] keys, int runSize, int fanIn) throws IOException {
        System.out.println("-- " + label + " --");
        System.out.println("RUN_SIZE=" + runSize + " FAN_IN=" + fanIn);
        int[] reads = {0}, writes = {0}, passes = {0};
        externalMergeSort(keys, runSize, fanIn, reads, writes, passes);
        System.out.println("passes=" + passes[0] + " reads=" + reads[0] + " writes=" + writes[0]);
        System.out.println();
    }

    public static void main(String[] args) throws IOException {
        LAB_DIR.mkdir(); // self-made lab folder; nothing is ever written outside it

        int[] normalKeys = {40, 11, 27, 8, 33, 2, 45, 16, 38, 23, 5, 30};
        runScenario("normal: 12 values, RUN_SIZE=4, FAN_IN=2", normalKeys, 4, 2);

        int[] hardKeys = {55, 12, 40, 3, 28, 61, 9, 47, 20, 34, 6, 52, 17, 44};
        runScenario("hard: 14 values, RUN_SIZE=3, FAN_IN=3", hardKeys, 3, 3);

        int[] oneRunKeys = {9, 3, 7, 1, 8, 2, 6, 4, 10, 5};
        runScenario("edge: RUN_SIZE >= n, done in one pass", oneRunKeys, 12, 2);

        int[] tinyKeys = {9, 3, 7, 1, 8, 2, 6, 4, 10, 5};
        runScenario("edge: RUN_SIZE=1, many passes", tinyKeys, 1, 2);

        LAB_DIR.delete(); // clean up: the lab folder is empty and removed
    }
}
