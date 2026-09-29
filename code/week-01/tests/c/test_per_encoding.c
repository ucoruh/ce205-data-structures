/* Unit tests for code/week-01/c/per_encoding.c: pack_bits(buf, &bitpos, value, width).
 * Expected bytes are hand-computed bit by bit (MSB first, starting at *bitpos), independent of the function.
 */
#define main program_main
#include "../../c/per_encoding.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* width = 0: the field has only one possible value, so NO bits are written and bitpos is unchanged
     * (this is the whole point of PER: a [5,5] range needs zero bits on the wire) */
    {
        unsigned char buf[4] = {0};
        int bitpos = 0;
        pack_bits(buf, &bitpos, 123, 0);
        CHECK_EQ_INT(bitpos, 0);
        CHECK_EQ_INT(buf[0], 0);
    }

    /* one bit, value 1, at a fresh buffer: sets the top bit of byte 0 */
    {
        unsigned char buf[4] = {0};
        int bitpos = 0;
        pack_bits(buf, &bitpos, 1, 1);
        CHECK_EQ_INT(bitpos, 1);
        CHECK_EQ_INT(buf[0], 0x80);
    }

    /* one bit, value 0: buffer stays all zero, but bitpos still advances */
    {
        unsigned char buf[4] = {0};
        int bitpos = 0;
        pack_bits(buf, &bitpos, 0, 1);
        CHECK_EQ_INT(bitpos, 1);
        CHECK_EQ_INT(buf[0], 0);
    }

    /* full byte, value 0xFF, width 8: fills byte 0 completely */
    {
        unsigned char buf[4] = {0};
        int bitpos = 0;
        pack_bits(buf, &bitpos, 0xFF, 8);
        CHECK_EQ_INT(bitpos, 8);
        CHECK_EQ_INT(buf[0], 0xFF);
    }

    /* a nibble (4 bits) written into the top half of a byte: value 0b1010 -> byte = 0xA0 */
    {
        unsigned char buf[4] = {0};
        int bitpos = 0;
        pack_bits(buf, &bitpos, 0xA, 4);
        CHECK_EQ_INT(bitpos, 4);
        CHECK_EQ_INT(buf[0], 0xA0);
    }

    /* two consecutive fields fill exactly one byte: 3 bits of 5 (101) then 5 bits of 19 (10011)
     * -> concatenated bit string 10110011 = 0xB3 (hand-computed, not from calling pack_bits again) */
    {
        unsigned char buf[4] = {0};
        int bitpos = 0;
        pack_bits(buf, &bitpos, 5, 3);
        pack_bits(buf, &bitpos, 19, 5);
        CHECK_EQ_INT(bitpos, 8);
        CHECK_EQ_INT(buf[0], 0xB3);
    }

    /* a field starting mid-byte (bitpos = 3), width 4, all-one value: sets bits 3..6 of byte 0,
     * i.e. binary 00011110 = 0x1E */
    {
        unsigned char buf[4] = {0};
        int bitpos = 3;
        pack_bits(buf, &bitpos, 0xF, 4);
        CHECK_EQ_INT(bitpos, 7);
        CHECK_EQ_INT(buf[0], 0x1E);
    }

    /* a field spanning a byte boundary: bitpos = 6, width 4, value 0b1010 (10) -- two bits land in
     * byte 0 (the low 2 bits of the byte) and two bits land in byte 1 (the top 2 bits) */
    {
        unsigned char buf[4] = {0};
        int bitpos = 6;
        pack_bits(buf, &bitpos, 0xA, 4);
        CHECK_EQ_INT(bitpos, 10);
        CHECK_EQ_INT(buf[0], 0x02); /* bit pattern ...... 1 0 -> only the '1' (MSB of value) survives in byte 0 */
        CHECK_EQ_INT(buf[1], 0x80); /* the next '1' bit lands at the very top of byte 1 */
    }

    /* three fields packed back to back reproduce the note's worked example: name (0..255, 8 bits, value 82),
     * age (0..31, 5 bits, value 5), active (0..1, 1 bit, value 1) -> 82 = 01010010, 5 = 00101, 1 = 1
     * concatenated: 01010010 00101 1 = 0101 0010 0010 1 1xx -> bytes 0x52, 0x2C (top 6 bits used, low 2 unset) */
    {
        unsigned char buf[4] = {0};
        int bitpos = 0;
        pack_bits(buf, &bitpos, 82, 8);
        pack_bits(buf, &bitpos, 5, 5);
        pack_bits(buf, &bitpos, 1, 1);
        CHECK_EQ_INT(bitpos, 14);
        CHECK_EQ_INT(buf[0], 0x52);
        CHECK_EQ_INT(buf[1], 0x2C);
    }

    /* value larger than width bits wide: only the low `width` bits are used (the function's own doc
     * comment says "the low width bits of value" -- verify a value with extra high bits set is masked off) */
    {
        unsigned char buf[4] = {0};
        int bitpos = 0;
        pack_bits(buf, &bitpos, 0xFFA, 4); /* 0xFFA low 4 bits = 0xA */
        CHECK_EQ_INT(buf[0], 0xA0);
    }

    /* width 16 (the "hard" scenario's widest field): value 4000 = 0x0FA0, packed at a fresh byte boundary */
    {
        unsigned char buf[4] = {0};
        int bitpos = 0;
        pack_bits(buf, &bitpos, 4000, 16);
        CHECK_EQ_INT(bitpos, 16);
        CHECK_EQ_INT(buf[0], 0x0F);
        CHECK_EQ_INT(buf[1], 0xA0);
    }

    /* packing zero-width fields between real fields never disturbs neighbouring bits */
    {
        unsigned char buf[4] = {0};
        int bitpos = 0;
        pack_bits(buf, &bitpos, 5, 3);
        pack_bits(buf, &bitpos, 999, 0); /* range-of-size-1 field: no bits, bitpos unchanged */
        pack_bits(buf, &bitpos, 3, 3);
        CHECK_EQ_INT(bitpos, 6);
        CHECK_EQ_INT(buf[0], 0xAC); /* 101 011 00 = 10101100 = 0xAC */
    }

    TEST_SUMMARY();
}
