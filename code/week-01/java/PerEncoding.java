/* Week 1 -- Introduction to Data Structures
 * PER-style encoding: every field is packed into the MINIMUM number of bits its own
 * [min, max] range needs -- no tags, no length bytes, byte-aligned only at the very end.
 * Runs the same normal / hard / edge-case scenarios as the per-encoding animation.
 * CEN207 Data Structures (formerly CE205)
 */
public class PerEncoding {
    static class Field {
        String name; int min, max, value;
        Field(String name, int min, int max, int value) { this.name = name; this.min = min; this.max = max; this.value = value; }
    }

    static int bitpos;

    // Pack the low `width` bits of `value` into buf, starting at bit offset bitpos (MSB first).
    static void packBits(byte[] buf, int value, int width) {
        for (int i = width - 1; i >= 0; i--) {
            int bit = (value >> i) & 1;
            int byteIndex = bitpos / 8;
            int bitIndex = 7 - (bitpos % 8);
            if (bit != 0)
                buf[byteIndex] |= (byte) (1 << bitIndex);
            bitpos++;
        }
    }

    static void runScenario(String label, Field[] fields) {
        System.out.println("-- " + label + " --");
        byte[] buf = new byte[64];
        bitpos = 0;
        for (Field f : fields) {
            // width = 0 when max == min: only one possible value, so NO bits are sent -- the
            // receiver already knows it from the schema.
            int width = (f.max == f.min) ? 0 : (int) Math.ceil(Math.log(f.max - f.min + 1) / Math.log(2));
            packBits(buf, f.value - f.min, width);
            System.out.printf("  %-8s [%4d..%-4d] value=%-4d -> %d bit%s%n", f.name, f.min, f.max, f.value, width, width == 1 ? "" : "s");
        }
        int totalBits = bitpos;
        int totalBytes = (bitpos + 7) / 8;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < totalBytes; i++) sb.append(String.format(" %02X", buf[i]));
        System.out.println("total: " + totalBits + " significant bits, " + totalBytes + " bytes:" + sb);
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 10 fields: name characters, an age, a few constrained numbers
        Field[] normal = {
            new Field("name0", 0, 255, 82), new Field("name1", 0, 255, 101), new Field("name2", 0, 255, 120),
            new Field("age", 0, 31, 5), new Field("active", 0, 1, 1), new Field("score", 0, 100, 87),
            new Field("level", 0, 7, 3), new Field("flag", 0, 1, 0), new Field("code", 0, 15, 9), new Field("temp", -20, 50, 22)
        };
        runScenario("normal: 10 fields, name characters, an age, a few constrained numbers", normal);

        // hard: 14 fields: wide ranges, widths up to 16 bits
        Field[] hard = {
            new Field("id", 0, 65535, 4000), new Field("name0", 0, 255, 82), new Field("name1", 0, 255, 101), new Field("name2", 0, 255, 120),
            new Field("name3", 0, 255, 84), new Field("age", 0, 31, 20), new Field("active", 0, 1, 0), new Field("score", 0, 1000, 999),
            new Field("level", 0, 7, 7), new Field("flag", 0, 1, 1), new Field("code", 0, 15, 0), new Field("temp", -50, 50, -30),
            new Field("ratio", 0, 9, 4), new Field("extra", 0, 3, 2)
        };
        runScenario("hard: 14 fields, wide ranges, widths up to 16 bits", hard);

        // edge: a range of size 1 needs 0 bits
        Field[] rangeSizeOne = {
            new Field("version", 1, 1, 1), new Field("name0", 0, 255, 82), new Field("name1", 0, 255, 101), new Field("name2", 0, 255, 120),
            new Field("age", 0, 31, 5), new Field("active", 0, 1, 1), new Field("score", 0, 100, 50), new Field("level", 0, 7, 3),
            new Field("flag", 0, 1, 0), new Field("code", 0, 15, 9)
        };
        runScenario("edge: a range of size 1 (0 bits)", rangeSizeOne);

        // edge: values sit at the very top of their range
        Field[] topOfRange = {
            new Field("name0", 0, 255, 82), new Field("name1", 0, 255, 101), new Field("name2", 0, 255, 120),
            new Field("age", 0, 31, 31), new Field("active", 0, 1, 1), new Field("score", 0, 100, 100), new Field("level", 0, 7, 3),
            new Field("flag", 0, 1, 0), new Field("code", 0, 15, 9), new Field("temp", -20, 50, 22)
        };
        runScenario("edge: values sit at the very top of their range", topOfRange);
    }
}
