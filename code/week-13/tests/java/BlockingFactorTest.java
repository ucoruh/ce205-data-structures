import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/* Unit tests for week-13 java/BlockingFactor.java */
public class BlockingFactorTest {
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
        // -- blockCapacity: exact and non-exact division --
        checkEq(BlockingFactor.blockCapacity(20), 5, "blockCapacity(20)");
        checkEq(BlockingFactor.blockCapacity(24), 4, "blockCapacity(24)");
        checkEq(BlockingFactor.blockCapacity(60), 1, "blockCapacity(60)");
        checkEq(BlockingFactor.blockCapacity(101), 0, "blockCapacity(101)");
        checkEq(BlockingFactor.blockCapacity(1), 100, "blockCapacity(1)");

        // -- blockPut: does not flush until the block is full --
        List<Integer> buf = new ArrayList<>();
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        DataOutputStream out = new DataOutputStream(bytes);
        int[] written = { 0 };
        BlockingFactor.blockPut(buf, 5, 11, out, written);
        BlockingFactor.blockPut(buf, 5, 22, out, written);
        checkEq(written[0], 0, "blockPut: not full yet");
        checkEq(buf.size(), 2, "blockPut: buffer size");
        checkEq(buf.get(0), 11, "blockPut: buffer[0]");
        checkEq(buf.get(1), 22, "blockPut: buffer[1]");

        // -- blockPut: flushes exactly when the block reaches bf, and clears the buffer --
        buf = new ArrayList<>(); bytes = new ByteArrayOutputStream(); out = new DataOutputStream(bytes); written[0] = 0;
        for (int i = 0; i < 5; i++) BlockingFactor.blockPut(buf, 5, 100 + i, out, written);
        checkEq(written[0], 1, "blockPut: flush count");
        checkEq(buf.size(), 0, "blockPut: buffer cleared after flush");

        // -- blockPut: bf=1 flushes on every single key --
        buf = new ArrayList<>(); bytes = new ByteArrayOutputStream(); out = new DataOutputStream(bytes); written[0] = 0;
        BlockingFactor.blockPut(buf, 1, 7, out, written);
        checkEq(written[0], 1, "blockPut bf=1: first key");
        BlockingFactor.blockPut(buf, 1, 8, out, written);
        checkEq(written[0], 2, "blockPut bf=1: second key");

        // -- blockFlush: does nothing on an empty buffer --
        buf = new ArrayList<>(); bytes = new ByteArrayOutputStream(); out = new DataOutputStream(bytes); written[0] = 0;
        BlockingFactor.blockFlush(buf, out, written);
        checkEq(written[0], 0, "blockFlush: empty buffer writes nothing");

        // -- blockFlush: writes a partial buffer and reports it as one more write --
        buf = new ArrayList<>(); bytes = new ByteArrayOutputStream(); out = new DataOutputStream(bytes); written[0] = 0;
        BlockingFactor.blockPut(buf, 5, 1, out, written);
        BlockingFactor.blockPut(buf, 5, 2, out, written);
        BlockingFactor.blockPut(buf, 5, 3, out, written);
        checkEq(written[0], 0, "blockFlush: still buffering before flush");
        BlockingFactor.blockFlush(buf, out, written);
        checkEq(written[0], 1, "blockFlush: partial flush counted");
        checkEq(bytes.size(), 3 * 4, "blockFlush: only the 3 real keys were written, no padding");

        // -- integration: runScenario with a real lab folder, error path (bf=0) does not write --
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_blocking_lab_javatest");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();
        BlockingFactor.runScenario("unit-test error path", lab, 999, 10, new int[] { 1, 2, 3 });
        check(!new File(lab, "blocks.dat").exists(), "runScenario: error path writes nothing");

        // -- integration: runScenario with a normal case writes and then cleans up its own file --
        BlockingFactor.runScenario("unit-test normal path", lab, 20, 100, new int[] { 1, 2, 3, 4, 5, 6 });
        check(!new File(lab, "blocks.dat").exists(), "runScenario: cleans up its own file");
        lab.delete();

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
