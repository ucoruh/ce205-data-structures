/* Unit tests for week-01 java/PerEncoding.java: packBits(buf, value, width), using the class's static
 * `bitpos` field (reset before each sequence). Expected bytes are hand-computed bit by bit, mirroring
 * code/week-01/tests/c/test_per_encoding.c.
 */
public class PerEncodingTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) {
        // width = 0: no bits written, bitpos unchanged
        {
            byte[] buf = new byte[4];
            PerEncoding.bitpos = 0;
            PerEncoding.packBits(buf, 123, 0);
            checkEq(PerEncoding.bitpos, 0, "width0 bitpos");
            checkEq(buf[0], 0, "width0 buf");
        }

        // one bit, value 1
        {
            byte[] buf = new byte[4];
            PerEncoding.bitpos = 0;
            PerEncoding.packBits(buf, 1, 1);
            checkEq(PerEncoding.bitpos, 1, "one bit bitpos");
            checkEq(buf[0] & 0xFF, 0x80, "one bit value");
        }

        // one bit, value 0
        {
            byte[] buf = new byte[4];
            PerEncoding.bitpos = 0;
            PerEncoding.packBits(buf, 0, 1);
            checkEq(buf[0] & 0xFF, 0, "one zero bit");
        }

        // full byte
        {
            byte[] buf = new byte[4];
            PerEncoding.bitpos = 0;
            PerEncoding.packBits(buf, 0xFF, 8);
            checkEq(PerEncoding.bitpos, 8, "full byte bitpos");
            checkEq(buf[0] & 0xFF, 0xFF, "full byte value");
        }

        // nibble into the top half of a byte
        {
            byte[] buf = new byte[4];
            PerEncoding.bitpos = 0;
            PerEncoding.packBits(buf, 0xA, 4);
            checkEq(buf[0] & 0xFF, 0xA0, "nibble value");
        }

        // two consecutive fields fill exactly one byte: 3 bits of 5, then 5 bits of 19 -> 0xB3
        {
            byte[] buf = new byte[4];
            PerEncoding.bitpos = 0;
            PerEncoding.packBits(buf, 5, 3);
            PerEncoding.packBits(buf, 19, 5);
            checkEq(PerEncoding.bitpos, 8, "two fields bitpos");
            checkEq(buf[0] & 0xFF, 0xB3, "two fields value");
        }

        // mid-byte start (bitpos = 3), width 4, all-one value -> 0x1E
        {
            byte[] buf = new byte[4];
            PerEncoding.bitpos = 3;
            PerEncoding.packBits(buf, 0xF, 4);
            checkEq(PerEncoding.bitpos, 7, "mid-byte bitpos");
            checkEq(buf[0] & 0xFF, 0x1E, "mid-byte value");
        }

        // spans a byte boundary: bitpos = 6, width 4, value 0b1010
        {
            byte[] buf = new byte[4];
            PerEncoding.bitpos = 6;
            PerEncoding.packBits(buf, 0xA, 4);
            checkEq(PerEncoding.bitpos, 10, "boundary bitpos");
            checkEq(buf[0] & 0xFF, 0x02, "boundary byte0");
            checkEq(buf[1] & 0xFF, 0x80, "boundary byte1");
        }

        // three fields: the note's worked example (82/8bits, 5/5bits, 1/1bit) -> 0x52, 0x2C
        {
            byte[] buf = new byte[4];
            PerEncoding.bitpos = 0;
            PerEncoding.packBits(buf, 82, 8);
            PerEncoding.packBits(buf, 5, 5);
            PerEncoding.packBits(buf, 1, 1);
            checkEq(PerEncoding.bitpos, 14, "worked example bitpos");
            checkEq(buf[0] & 0xFF, 0x52, "worked example byte0");
            checkEq(buf[1] & 0xFF, 0x2C, "worked example byte1");
        }

        // only the low `width` bits of value are used
        {
            byte[] buf = new byte[4];
            PerEncoding.bitpos = 0;
            PerEncoding.packBits(buf, 0xFFA, 4);
            checkEq(buf[0] & 0xFF, 0xA0, "masked value");
        }

        // width 16 at a byte-aligned start: big-endian 16-bit representation
        {
            byte[] buf = new byte[4];
            PerEncoding.bitpos = 0;
            PerEncoding.packBits(buf, 4000, 16);
            checkEq(PerEncoding.bitpos, 16, "16-bit bitpos");
            checkEq(buf[0] & 0xFF, 0x0F, "16-bit byte0");
            checkEq(buf[1] & 0xFF, 0xA0, "16-bit byte1");
        }

        // zero-width fields between real fields never disturb neighbouring bits
        {
            byte[] buf = new byte[4];
            PerEncoding.bitpos = 0;
            PerEncoding.packBits(buf, 5, 3);
            PerEncoding.packBits(buf, 999, 0);
            PerEncoding.packBits(buf, 3, 3);
            checkEq(PerEncoding.bitpos, 6, "zero-width bitpos");
            checkEq(buf[0] & 0xFF, 0xAC, "zero-width value");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
