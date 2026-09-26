/* Week 1 -- Introduction to Data Structures
 * A miniature PER-style encoding: no tags, no length for the fixed-size
 * name field, and age packed into just the bits its range needs.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

/* Pack the low `width` bits of `value` into buf, starting at bit offset *bitpos (MSB first). */
static void pack_bits(unsigned char *buf, int *bitpos, unsigned int value, int width) {
    for (int i = width - 1; i >= 0; i--) {
        int bit = (int) ((value >> i) & 1u);
        int byte_index = *bitpos / 8;
        int bit_index = 7 - (*bitpos % 8);
        if (bit)
            buf[byte_index] |= (unsigned char) (1u << bit_index);
        (*bitpos)++;
    }
}

int main(void) {
    unsigned char per[4] = {0};   /* 32 bits: 24 (name) + 5 (age) + 3 padding */
    int bitpos = 0;
    const char name[] = "Rex";

    for (int i = 0; i < 3; i++)
        pack_bits(per, &bitpos, (unsigned char) name[i], 8);   /* fixed size: no length needed */
    pack_bits(per, &bitpos, 5, 5);                              /* age, constrained to 0..31: 5 bits */

    printf("PER: %d significant bits (no tags, no length for name, age in 5 bits), packed into %d bytes:",
           bitpos, (bitpos + 7) / 8);
    for (int i = 0; i < 4; i++)
        printf(" %02X", per[i]);
    printf("\n");

    printf("BER (Section 6.5) used 10 bytes (80 bits) for the same record.\n");

    return 0;
}
