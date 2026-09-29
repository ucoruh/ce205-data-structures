import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.IOException;

/* Unit tests for week-13 java/RecordsAndFields.java */
public class RecordsAndFieldsTest {
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
        ByteArrayOutputStream buf;
        DataOutputStream out;
        int n;

        // -- writeFixed: short name is padded with '_' --
        buf = new ByteArrayOutputStream(); out = new DataOutputStream(buf);
        n = RecordsAndFields.writeFixed(out, 101, "ANN", 91);
        checkEq(n, 4 + RecordsAndFields.NAME_FIXED + 4, "writeFixed short: return size");
        checkEq(buf.size(), 4 + RecordsAndFields.NAME_FIXED + 4, "writeFixed short: bytes on stream");
        DataInputStream in = new DataInputStream(new ByteArrayInputStream(buf.toByteArray()));
        checkEq(in.readInt(), 101, "writeFixed short: id");
        byte[] nameBytes = new byte[RecordsAndFields.NAME_FIXED];
        in.readFully(nameBytes);
        check(new String(nameBytes).equals("ANN_____"), "writeFixed short: padded name");
        checkEq(in.readInt(), 91, "writeFixed short: score");

        // -- writeFixed: name exactly NAME_FIXED long -- no padding, no truncation --
        buf = new ByteArrayOutputStream(); out = new DataOutputStream(buf);
        RecordsAndFields.writeFixed(out, 1, "ABCDEFGH", 0);
        in = new DataInputStream(new ByteArrayInputStream(buf.toByteArray()));
        in.readInt(); in.readFully(nameBytes);
        check(new String(nameBytes).equals("ABCDEFGH"), "writeFixed exact: unpadded name");

        // -- writeFixed: name longer than NAME_FIXED -- truncated --
        buf = new ByteArrayOutputStream(); out = new DataOutputStream(buf);
        RecordsAndFields.writeFixed(out, 2, "ABCDEFGHIJ", 0);
        in = new DataInputStream(new ByteArrayInputStream(buf.toByteArray()));
        in.readInt(); in.readFully(nameBytes);
        check(new String(nameBytes).equals("ABCDEFGH"), "writeFixed long: truncated to 8");

        // -- writeFixed: empty name -- all padding --
        buf = new ByteArrayOutputStream(); out = new DataOutputStream(buf);
        RecordsAndFields.writeFixed(out, 3, "", 0);
        in = new DataInputStream(new ByteArrayInputStream(buf.toByteArray()));
        in.readInt(); in.readFully(nameBytes);
        check(new String(nameBytes).equals("________"), "writeFixed empty: fully padded");

        // -- writeFixed: Integer.MIN_VALUE / MAX_VALUE round-trip through id and score --
        buf = new ByteArrayOutputStream(); out = new DataOutputStream(buf);
        RecordsAndFields.writeFixed(out, Integer.MAX_VALUE, "X", Integer.MIN_VALUE);
        in = new DataInputStream(new ByteArrayInputStream(buf.toByteArray()));
        checkEq(in.readInt(), Integer.MAX_VALUE, "writeFixed extreme: id MAX_VALUE");
        in.readFully(nameBytes);
        checkEq(in.readInt(), Integer.MIN_VALUE, "writeFixed extreme: score MIN_VALUE");

        // -- writeFixed: every record is always the same size, whatever the content --
        buf = new ByteArrayOutputStream(); out = new DataOutputStream(buf);
        int s1 = RecordsAndFields.writeFixed(out, 1, "", 0);
        int s2 = RecordsAndFields.writeFixed(out, 2, "ABCDEFGHIJKLMNOP", 0);
        checkEq(s1, s2, "writeFixed: constant size regardless of content");

        // -- writeDelim: short name -- id/score not actually written, just name + '|' --
        buf = new ByteArrayOutputStream(); out = new DataOutputStream(buf);
        n = RecordsAndFields.writeDelim(out, 101, "ANN", 91);
        checkEq(n, 4 + 3 + 1 + 4, "writeDelim short: return size");
        checkEq(buf.size(), 4, "writeDelim short: bytes on stream");
        check(buf.toString("US-ASCII").equals("ANN|"), "writeDelim short: content");

        // -- writeDelim: empty name -- just the delimiter --
        buf = new ByteArrayOutputStream(); out = new DataOutputStream(buf);
        n = RecordsAndFields.writeDelim(out, 1, "", 0);
        checkEq(n, 4 + 0 + 1 + 4, "writeDelim empty: return size");
        checkEq(buf.size(), 1, "writeDelim empty: bytes on stream");

        // -- writeDelim: long name does NOT get truncated (unlike writeFixed) --
        buf = new ByteArrayOutputStream(); out = new DataOutputStream(buf);
        n = RecordsAndFields.writeDelim(out, 1, "ABCDEFGHIJKLMNOP", 0);
        checkEq(n, 4 + 16 + 1 + 4, "writeDelim long: return size");
        checkEq(buf.size(), 17, "writeDelim long: bytes on stream");

        // -- writeLenPrefixed: short name -- 1 length byte + the name bytes --
        buf = new ByteArrayOutputStream(); out = new DataOutputStream(buf);
        n = RecordsAndFields.writeLenPrefixed(out, 101, "ANN", 91);
        checkEq(n, 4 + 1 + 3 + 4, "writeLenPrefixed short: return size");
        checkEq(buf.size(), 1 + 3, "writeLenPrefixed short: bytes on stream");
        byte[] raw = buf.toByteArray();
        checkEq(raw[0] & 0xFF, 3, "writeLenPrefixed short: length byte");
        check(new String(raw, 1, 3).equals("ANN"), "writeLenPrefixed short: name bytes");

        // -- writeLenPrefixed: empty name -- length byte 0, nothing after it --
        buf = new ByteArrayOutputStream(); out = new DataOutputStream(buf);
        RecordsAndFields.writeLenPrefixed(out, 1, "", 0);
        checkEq(buf.size(), 1, "writeLenPrefixed empty: bytes on stream");
        checkEq(buf.toByteArray()[0] & 0xFF, 0, "writeLenPrefixed empty: length byte 0");

        // -- writeLenPrefixed: long name does NOT get truncated either --
        buf = new ByteArrayOutputStream(); out = new DataOutputStream(buf);
        n = RecordsAndFields.writeLenPrefixed(out, 1, "ABCDEFGHIJKLMNOP", 0);
        checkEq(n, 4 + 1 + 16 + 4, "writeLenPrefixed long: return size");

        // -- integration: runScenario writes real files inside a real lab folder and cleans up --
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_records_lab_javatest");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();
        RecordsAndFields.RecIn[] tiny = {
            new RecordsAndFields.RecIn(1, "A", 10), new RecordsAndFields.RecIn(2, "BBBBBBBBBB", 20)
        };
        RecordsAndFields.runScenario("unit-test integration", lab, tiny);
        check(!new File(lab, "fixed.dat").exists(), "runScenario: cleans up its own files");
        lab.delete();

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
