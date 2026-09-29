/* Unit tests for week-01 java/TlvEncoding.java: encodeTlv(tag, value) -- BER TLV, short-form length.
 * Expected bytes are hand-encoded, independent of the method under test (mirrors the C test).
 */
public class TlvEncodingTest {
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
        // normal: "Rex" as a UTF8String
        {
            byte[] out = TlvEncoding.encodeTlv(TlvEncoding.TAG_UTF8STRING, new byte[] {0x52, 0x65, 0x78});
            checkEq(out.length, 5, "Rex length");
            checkEq(out[0] & 0xFF, 0x0C, "Rex tag");
            checkEq(out[1] & 0xFF, 0x03, "Rex length byte");
            checkEq(out[2] & 0xFF, 0x52, "Rex value[0]");
            checkEq(out[3] & 0xFF, 0x65, "Rex value[1]");
            checkEq(out[4] & 0xFF, 0x78, "Rex value[2]");
        }

        // one-byte INTEGER value
        {
            byte[] out = TlvEncoding.encodeTlv(TlvEncoding.TAG_INTEGER, new byte[] {5});
            checkEq(out.length, 3, "age length");
            checkEq(out[0] & 0xFF, 0x02, "age tag");
            checkEq(out[1] & 0xFF, 0x01, "age length byte");
            checkEq(out[2], 5, "age value");
        }

        // empty value: length 0, still tag + length byte, no content
        {
            byte[] out = TlvEncoding.encodeTlv(TlvEncoding.TAG_UTF8STRING, new byte[0]);
            checkEq(out.length, 2, "empty length");
            checkEq(out[0] & 0xFF, 0x0C, "empty tag");
            checkEq(out[1] & 0xFF, 0x00, "empty length byte");
        }

        // single-byte 0xFF value
        {
            byte[] out = TlvEncoding.encodeTlv(TlvEncoding.TAG_INTEGER, new byte[] {(byte) 0xFF});
            checkEq(out.length, 3, "0xFF length");
            checkEq(out[2] & 0xFF, 0xFF, "0xFF value");
        }

        // two-byte value
        {
            byte[] out = TlvEncoding.encodeTlv(TlvEncoding.TAG_INTEGER, new byte[] {0x01, 0x02});
            checkEq(out.length, 4, "two-byte length");
            checkEq(out[1] & 0xFF, 2, "two-byte length byte");
            checkEq(out[2] & 0xFF, 0x01, "two-byte value[0]");
            checkEq(out[3] & 0xFF, 0x02, "two-byte value[1]");
        }

        // nested SEQUENCE, wrapping already-encoded TLVs (as main() does)
        {
            byte[] nameTlv = TlvEncoding.encodeTlv(TlvEncoding.TAG_UTF8STRING, "Rex".getBytes(java.nio.charset.StandardCharsets.UTF_8));
            byte[] ageTlv = TlvEncoding.encodeTlv(TlvEncoding.TAG_INTEGER, new byte[] {5});
            java.io.ByteArrayOutputStream content = new java.io.ByteArrayOutputStream();
            content.writeBytes(nameTlv);
            content.writeBytes(ageTlv);
            byte[] record = TlvEncoding.encodeTlv(TlvEncoding.TAG_SEQUENCE, content.toByteArray());
            checkEq(record.length, 2 + nameTlv.length + ageTlv.length, "record length");
            checkEq(record[0] & 0xFF, 0x30, "record tag");
            checkEq(record[1] & 0xFF, nameTlv.length + ageTlv.length, "record length byte");
            byte[] expectedContent = content.toByteArray();
            for (int i = 0; i < expectedContent.length; i++)
                checkEq(record[2 + i], expectedContent[i], "record content byte " + i);
        }

        // length at the edge of the short form (127)
        {
            byte[] value = new byte[127];
            for (int i = 0; i < 127; i++) value[i] = (byte) i;
            byte[] out = TlvEncoding.encodeTlv(TlvEncoding.TAG_UTF8STRING, value);
            checkEq(out.length, 129, "127-byte length");
            checkEq(out[1] & 0xFF, 127, "127-byte length byte");
            checkEq(out[2], 0, "127-byte first content byte");
            checkEq(out[128], 126, "127-byte last content byte");
        }

        // arbitrary tag byte written verbatim
        {
            byte[] out = TlvEncoding.encodeTlv(0x81, new byte[] {1});
            checkEq(out[0] & 0xFF, 0x81, "arbitrary tag");
        }

        // the three named tag constants
        checkEq(TlvEncoding.TAG_INTEGER, 0x02, "TAG_INTEGER");
        checkEq(TlvEncoding.TAG_UTF8STRING, 0x0C, "TAG_UTF8STRING");
        checkEq(TlvEncoding.TAG_SEQUENCE, 0x30, "TAG_SEQUENCE");

        // encodeTlv does not modify the source value array
        {
            byte[] value = {9, 8, 7};
            TlvEncoding.encodeTlv(TlvEncoding.TAG_UTF8STRING, value);
            checkEq(value[0], 9, "value[0] unmodified");
            checkEq(value[1], 8, "value[1] unmodified");
            checkEq(value[2], 7, "value[2] unmodified");
        }

        // toHex() formats bytes as space-separated uppercase pairs, trimmed
        check(TlvEncoding.toHex(new byte[] {0x0C, 0x03}).equals("0C 03"), "toHex format");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
