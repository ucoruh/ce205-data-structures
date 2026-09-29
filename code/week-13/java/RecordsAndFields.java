import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/* Week 13 -- File Organisation I
 * Records and fields: the same records are written to three REAL files, one per layout --
 * fixed-length (padded/truncated to NAME_FIXED bytes), delimited (name + '|'), and length-prefixed
 * (1-byte length + name). The files are created only inside a temporary lab folder that main()
 * creates and removes.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class RecordsAndFields {
    static final int NAME_FIXED = 8;

    static int writeFixed(DataOutputStream out, int id, String name, int score) throws IOException {
        out.writeInt(id);
        byte[] raw = name.getBytes(StandardCharsets.US_ASCII);
        int n = raw.length;
        if (n >= NAME_FIXED) {                    // too long: truncate, data is lost
            out.write(raw, 0, NAME_FIXED);
        } else {
            out.write(raw);
            for (int i = n; i < NAME_FIXED; i++) out.write('_');   // pad with filler bytes
        }
        out.writeInt(score);
        return 4 + NAME_FIXED + 4;
    }

    static int writeDelim(DataOutputStream out, int id, String name, int score) throws IOException {
        // id and score are still fixed 4-byte fields; only name is variable here
        byte[] raw = name.getBytes(StandardCharsets.US_ASCII);
        out.write(raw); out.writeByte('|');
        return 4 + raw.length + 1 + 4;
    }

    static int writeLenPrefixed(DataOutputStream out, int id, String name, int score) throws IOException {
        // id and score are still fixed 4-byte fields; only the name is variable here
        byte[] raw = name.getBytes(StandardCharsets.US_ASCII);
        out.writeByte(raw.length);            // 1-byte length prefix
        out.write(raw);
        return 4 + 1 + raw.length + 4;
    }

    /* ---- driver ------------------------------------------------------------ */

    static class RecIn { int id; String name; int score; RecIn(int i, String n, int s) { id = i; name = n; score = s; } }

    static void runScenario(String label, File lab, RecIn[] recs) throws IOException {
        System.out.println("-- " + label + " --");
        File fixedFile = new File(lab, "fixed.dat"), delimFile = new File(lab, "delim.dat"), lenFile = new File(lab, "lenpfx.dat");
        int wasted = 0, truncated = 0;
        try (DataOutputStream fixedOut = new DataOutputStream(new FileOutputStream(fixedFile));
             DataOutputStream delimOut = new DataOutputStream(new FileOutputStream(delimFile));
             DataOutputStream lenOut = new DataOutputStream(new FileOutputStream(lenFile))) {
            for (RecIn r : recs) {
                int nlen = r.name.getBytes(StandardCharsets.US_ASCII).length;
                writeFixed(fixedOut, r.id, r.name, r.score);
                writeDelim(delimOut, r.id, r.name, r.score);
                writeLenPrefixed(lenOut, r.id, r.name, r.score);
                if (nlen >= NAME_FIXED) truncated++; else wasted += NAME_FIXED - nlen;
                System.out.printf("  id=%-4d name=\"%-10s\" (%2d B) score=%-4d%s%n",
                        r.id, r.name, nlen, r.score, nlen >= NAME_FIXED ? "  -- truncated in fixed.dat!" : "");
            }
        }
        long szf = fixedFile.length(), szd = delimFile.length(), szl = lenFile.length();
        System.out.printf("  fixed.dat  = %d B (expected %d, %d B wasted, %d truncated)%n", szf, recs.length * (8 + NAME_FIXED), wasted, truncated);
        System.out.printf("  delim.dat  = %d B%n", szd);
        System.out.printf("  lenpfx.dat = %d B%n", szl);
        System.out.printf("summary: %d records, fixed saves nothing here (%d B) but reads back at a constant stride;%n" +
                "         delim/lenpfx are %d B smaller, but need parsing to find record boundaries.%n%n",
                recs.length, szf, szf - szd);
        fixedFile.delete(); delimFile.delete(); lenFile.delete();
    }

    public static void main(String[] args) throws IOException {
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_records_lab_java");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();

        RecIn[] normal = {
            new RecIn(101, "ANN", 91), new RecIn(102, "BOB", 77), new RecIn(103, "CARL", 85), new RecIn(104, "DEE", 60), new RecIn(105, "ED", 99),
            new RecIn(106, "FAY", 72), new RecIn(107, "GUS", 88), new RecIn(108, "HAL", 65), new RecIn(109, "IVY", 93), new RecIn(110, "JOE", 58), new RecIn(111, "KIM", 80)
        };
        RecIn[] mixed = {
            new RecIn(201, "AL", 70), new RecIn(202, "BRENDA", 84), new RecIn(203, "CARLITOX", 66), new RecIn(204, "DOMINIQUE", 91), new RecIn(205, "ED", 55),
            new RecIn(206, "FRANCESCA", 62), new RecIn(207, "GIA", 89), new RecIn(208, "HECTOR", 73), new RecIn(209, "IRA", 95), new RecIn(210, "JULIETTE", 68),
            new RecIn(211, "KEN", 81), new RecIn(212, "LIONEL", 77), new RecIn(213, "MAX", 90)
        };
        RecIn[] edgeEmptyLong = {
            new RecIn(301, "", 40), new RecIn(302, "ALEXANDRIA", 71), new RecIn(303, "A", 50), new RecIn(304, "BO", 61), new RecIn(305, "CHRISTOPHERSON", 82),
            new RecIn(306, "", 30), new RecIn(307, "D", 45), new RecIn(308, "EIGHTCHRS", 59), new RecIn(309, "F", 66), new RecIn(310, "GABRIELLA", 74), new RecIn(311, "H", 53)
        };
        RecIn[] edgeAllTruncated = {
            new RecIn(401, "ABCDEFGHIJ", 10), new RecIn(402, "KLMNOPQRST", 20), new RecIn(403, "UVWXYZABCD", 30), new RecIn(404, "EFGHIJKLMN", 40),
            new RecIn(405, "OPQRSTUVWX", 50), new RecIn(406, "YZABCDEFGH", 60), new RecIn(407, "IJKLMNOPQR", 70), new RecIn(408, "STUVWXYZAB", 80),
            new RecIn(409, "CDEFGHIJKL", 90), new RecIn(410, "MNOPQRSTUV", 15)
        };

        runScenario("normal: 11 records, short names (padding, no truncation)", lab, normal);
        runScenario("hard: 13 records, mixed lengths", lab, mixed);
        runScenario("edge: empty name and a very long name", lab, edgeEmptyLong);
        runScenario("edge: every name longer than 8 characters", lab, edgeAllTruncated);

        lab.delete();
    }
}
