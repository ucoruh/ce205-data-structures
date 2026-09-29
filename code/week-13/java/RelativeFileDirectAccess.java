import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;

/* Week 13 -- File Organisation I
 * Relative (direct) file access: a record number (RRN) maps straight to a block and an offset by arithmetic --
 * block = rrn / bf, offset = rrn % bf -- so a record is fetched with exactly ONE block read and no searching at
 * all. The file really lives on disk, inside a temporary lab folder that main() creates and removes.
 * CEN207 Data Structures (formerly CE205)
 */
public class RelativeFileDirectAccess {
    static final int BF = 5;   // records per block

    static int directRead(RandomAccessFile fp, int total, int rrn, int[] out, int[] blockReads) throws IOException {
        if (rrn < 0 || rrn >= total) return -1;                    // invalid record number
        int block  = rrn / BF;
        int offset = rrn % BF;
        fp.seek((long) block * BF * 4);
        int[] buf = new int[BF];
        int cnt = 0;
        for (; cnt < BF && fp.getFilePointer() < fp.length(); cnt++) buf[cnt] = fp.readInt();   // exactly ONE read, always
        blockReads[0]++;
        if (offset >= cnt) return -1;                               // past the last, partial block
        out[0] = buf[offset];
        return 0;
    }

    /* ---- driver ------------------------------------------------------------ */

    static void runScenario(String label, File lab, int total, int[] requests) throws IOException {
        System.out.println("-- " + label + " --");
        File path = new File(lab, "file.dat");
        try (RandomAccessFile w = new RandomAccessFile(path, "rw")) {
            w.setLength(0);
            for (int i = 0; i < total; i++) w.writeInt(100 + i * 3);
        }

        int[] reads = { 0 };
        int errors = 0;
        try (RandomAccessFile fp = new RandomAccessFile(path, "r")) {
            for (int rrn : requests) {
                int[] val = new int[1];
                int rc = directRead(fp, total, rrn, val, reads);
                if (rc == 0) System.out.printf("  read(rrn=%d): value=%d (block=%d, offset=%d)%n", rrn, val[0], rrn / BF, rrn % BF);
                else { errors++; System.out.printf("  read(rrn=%d): invalid%n", rrn); }
            }
        }
        System.out.printf("summary: %d request(s), %d block reads, %d errors%n%n", requests.length, reads[0], errors);
        path.delete();
    }

    public static void main(String[] args) throws IOException {
        File lab = new File(System.getProperty("java.io.tmpdir"), "cen207_week13_relative_lab_java");
        if (lab.exists()) for (File f : lab.listFiles()) f.delete();
        lab.mkdir();

        runScenario("normal: bf=5, 13 records, 3 valid requests", lab, 13, new int[] { 7, 2, 12 });
        runScenario("hard: bf=5, 16 records, 5 requests at boundary offsets", lab, 16, new int[] { 0, 3, 4, 15, 8 });
        runScenario("edge: negative and out-of-range record numbers (errors)", lab, 12, new int[] { -1, 15, 5 });
        runScenario("edge: the single record in the last partial block + out of range", lab, 11, new int[] { 10, 9, 11 });

        lab.delete();
    }
}
