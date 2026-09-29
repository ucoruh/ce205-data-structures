/* Week 1 -- Introduction to Data Structures
 * PER-style encoding: every field is packed into the MINIMUM number of bits its own
 * [min, max] range needs -- no tags, no length bytes, byte-aligned only at the very end.
 * Runs the same normal / hard / edge-case scenarios as the per-encoding animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <math.h>
#include <stdio.h>

typedef struct { const char *name; int min; int max; int value; } Field;

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

static void run_scenario(const char *label, const Field fields[], int count) {
    printf("-- %s --\n", label);
    unsigned char buf[64] = {0};
    int bitpos = 0;
    for (int i = 0; i < count; i++) {
        const Field *f = &fields[i];
        /* width = 0 when max == min: only one possible value, so NO bits are sent -- the
           receiver already knows it from the schema. */
        int width = (f->max == f->min) ? 0 : (int) ceil(log2((double) (f->max - f->min + 1)));
        pack_bits(buf, &bitpos, (unsigned) (f->value - f->min), width);
        printf("  %-8s [%4d..%-4d] value=%-4d -> %d bit%s\n", f->name, f->min, f->max, f->value, width, width == 1 ? "" : "s");
    }
    int totalBits = bitpos;
    int totalBytes = (bitpos + 7) / 8;
    printf("total: %d significant bits, %d bytes:", totalBits, totalBytes);
    for (int i = 0; i < totalBytes; i++)
        printf(" %02X", buf[i]);
    printf("\n\n");
}

int main(void) {
    /* normal: 10 fields: name characters, an age, a few constrained numbers */
    Field normal[] = {
        {"name0", 0, 255, 82}, {"name1", 0, 255, 101}, {"name2", 0, 255, 120},
        {"age", 0, 31, 5}, {"active", 0, 1, 1}, {"score", 0, 100, 87},
        {"level", 0, 7, 3}, {"flag", 0, 1, 0}, {"code", 0, 15, 9}, {"temp", -20, 50, 22}
    };
    run_scenario("normal: 10 fields, name characters, an age, a few constrained numbers", normal, 10);

    /* hard: 14 fields: wide ranges, widths up to 16 bits */
    Field hard[] = {
        {"id", 0, 65535, 4000}, {"name0", 0, 255, 82}, {"name1", 0, 255, 101}, {"name2", 0, 255, 120},
        {"name3", 0, 255, 84}, {"age", 0, 31, 20}, {"active", 0, 1, 0}, {"score", 0, 1000, 999},
        {"level", 0, 7, 7}, {"flag", 0, 1, 1}, {"code", 0, 15, 0}, {"temp", -50, 50, -30},
        {"ratio", 0, 9, 4}, {"extra", 0, 3, 2}
    };
    run_scenario("hard: 14 fields, wide ranges, widths up to 16 bits", hard, 14);

    /* edge: a range of size 1 needs 0 bits */
    Field rangeSizeOne[] = {
        {"version", 1, 1, 1}, {"name0", 0, 255, 82}, {"name1", 0, 255, 101}, {"name2", 0, 255, 120},
        {"age", 0, 31, 5}, {"active", 0, 1, 1}, {"score", 0, 100, 50}, {"level", 0, 7, 3},
        {"flag", 0, 1, 0}, {"code", 0, 15, 9}
    };
    run_scenario("edge: a range of size 1 (0 bits)", rangeSizeOne, 10);

    /* edge: values sit at the very top of their range */
    Field topOfRange[] = {
        {"name0", 0, 255, 82}, {"name1", 0, 255, 101}, {"name2", 0, 255, 120},
        {"age", 0, 31, 31}, {"active", 0, 1, 1}, {"score", 0, 100, 100}, {"level", 0, 7, 3},
        {"flag", 0, 1, 0}, {"code", 0, 15, 9}, {"temp", -20, 50, 22}
    };
    run_scenario("edge: values sit at the very top of their range", topOfRange, 10);

    return 0;
}
