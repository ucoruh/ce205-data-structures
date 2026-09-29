/* Unit tests for code/week-01/c/tlv_encoding.c: encode_tlv(out, tag, value, len) -- BER TLV, short-form length.
 * Expected bytes are hand-encoded (tag byte, length byte, then the raw value bytes), independent of the function.
 */
#define main program_main
#include "../../c/tlv_encoding.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* normal: the note's own example, a 3-byte UTF8String "Rex" (0x52 0x65 0x78) */
    {
        unsigned char out[16];
        const unsigned char value[] = {0x52, 0x65, 0x78};
        int len = encode_tlv(out, TAG_UTF8STRING, value, 3);
        CHECK_EQ_INT(len, 5); /* 1 tag + 1 length + 3 value bytes */
        CHECK_EQ_INT(out[0], 0x0C); /* TAG_UTF8STRING */
        CHECK_EQ_INT(out[1], 0x03); /* length = 3 */
        CHECK_EQ_INT(out[2], 0x52);
        CHECK_EQ_INT(out[3], 0x65);
        CHECK_EQ_INT(out[4], 0x78);
    }

    /* one-byte INTEGER value (age = 5) */
    {
        unsigned char out[16];
        unsigned char value = 5;
        int len = encode_tlv(out, TAG_INTEGER, &value, 1);
        CHECK_EQ_INT(len, 3);
        CHECK_EQ_INT(out[0], 0x02); /* TAG_INTEGER */
        CHECK_EQ_INT(out[1], 0x01);
        CHECK_EQ_INT(out[2], 5);
    }

    /* empty value: len = 0, still writes tag and length=0, no content bytes, returns 2 */
    {
        unsigned char out[16] = {0xAA, 0xAA, 0xAA};
        int len = encode_tlv(out, TAG_UTF8STRING, out, 0); /* value pointer unused when len = 0 */
        CHECK_EQ_INT(len, 2);
        CHECK_EQ_INT(out[0], 0x0C);
        CHECK_EQ_INT(out[1], 0x00);
    }

    /* single-byte value */
    {
        unsigned char out[16];
        unsigned char value = 0xFF;
        int len = encode_tlv(out, TAG_INTEGER, &value, 1);
        CHECK_EQ_INT(len, 3);
        CHECK_EQ_INT(out[2], 0xFF);
    }

    /* two-byte value */
    {
        unsigned char out[16];
        const unsigned char value[] = {0x01, 0x02};
        int len = encode_tlv(out, TAG_INTEGER, value, 2);
        CHECK_EQ_INT(len, 4);
        CHECK_EQ_INT(out[1], 2);
        CHECK_EQ_INT(out[2], 0x01);
        CHECK_EQ_INT(out[3], 0x02);
    }

    /* the SEQUENCE tag, wrapping already-encoded TLV bytes (nested encoding, as main() does) */
    {
        unsigned char name_tlv[16], age_tlv[16], content[32], record[32];
        int name_len = encode_tlv(name_tlv, TAG_UTF8STRING, (const unsigned char *) "Rex", 3);
        int age_len = encode_tlv(age_tlv, TAG_INTEGER, (const unsigned char[]) {5}, 1);
        for (int i = 0; i < name_len; i++) content[i] = name_tlv[i];
        for (int i = 0; i < age_len; i++) content[name_len + i] = age_tlv[i];
        int record_len = encode_tlv(record, TAG_SEQUENCE, content, name_len + age_len);
        CHECK_EQ_INT(record_len, 2 + name_len + age_len);
        CHECK_EQ_INT(record[0], 0x30); /* TAG_SEQUENCE */
        CHECK_EQ_INT(record[1], name_len + age_len); /* length = the two inner TLVs' combined size */
        /* the SEQUENCE's content is byte-for-byte the concatenation of the two inner TLVs */
        for (int i = 0; i < name_len + age_len; i++)
            CHECK_EQ_INT(record[2 + i], content[i]);
    }

    /* a length right at the edge of the short form (127, the largest value a single length byte can hold) */
    {
        unsigned char out[140];
        unsigned char value[127];
        for (int i = 0; i < 127; i++) value[i] = (unsigned char) i;
        int len = encode_tlv(out, TAG_UTF8STRING, value, 127);
        CHECK_EQ_INT(len, 129);
        CHECK_EQ_INT(out[1], 127);
        CHECK_EQ_INT(out[2], 0);
        CHECK_EQ_INT(out[128], 126);
    }

    /* the tag byte is written verbatim, whatever value is passed (not limited to the three named constants) */
    {
        unsigned char out[8];
        unsigned char value = 1;
        int len = encode_tlv(out, 0x81, &value, 1);
        CHECK_EQ_INT(out[0], 0x81);
        CHECK_EQ_INT(len, 3);
    }

    /* the three named tag constants have the values the BER standard assigns */
    {
        CHECK_EQ_INT(TAG_INTEGER, 0x02);
        CHECK_EQ_INT(TAG_UTF8STRING, 0x0C);
        CHECK_EQ_INT(TAG_SEQUENCE, 0x30);
    }

    /* encode_tlv does not modify the source value buffer (only reads it) */
    {
        unsigned char out[16];
        unsigned char value[] = {9, 8, 7};
        encode_tlv(out, TAG_UTF8STRING, value, 3);
        CHECK_EQ_INT(value[0], 9);
        CHECK_EQ_INT(value[1], 8);
        CHECK_EQ_INT(value[2], 7);
    }

    TEST_SUMMARY();
}
