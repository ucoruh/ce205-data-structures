/* Week 1 -- Introduction to Data Structures
 * A miniature PER-style encoding: no tags, no length for the fixed-size
 * name field, and age packed into just the bits its range needs.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class PerEncoding {
    static int bitpos;

    /* Pack the low `width` bits of `value` into buf, starting at bit offset bitpos (MSB first). */
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

    public static void main(String[] args) {
        byte[] per = new byte[4];   // 32 bits: 24 (name) + 5 (age) + 3 padding
        bitpos = 0;
        String name = "Rex";

        for (int i = 0; i < 3; i++)
            packBits(per, name.charAt(i), 8);   // fixed size: no length needed
        packBits(per, 5, 5);                     // age, constrained to 0..31: 5 bits

        StringBuilder sb = new StringBuilder();
        for (byte b : per)
            sb.append(String.format("%02X ", b));
        System.out.println("PER: " + bitpos + " significant bits (no tags, no length for name, age in 5 bits), packed into "
                + ((bitpos + 7) / 8) + " bytes: " + sb.toString().trim());
        System.out.println("BER (Section 6.5) used 10 bytes (80 bits) for the same record.");
    }
}
