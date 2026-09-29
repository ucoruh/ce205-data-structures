/* Unit tests for week-12 java/CStringMemory.java */
public class CStringMemoryTest {
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
        boolean[] overflow = new boolean[1];
        int written;

        // -- normal fit: short string into a generous buffer --
        written = CStringMemory.safeStore("HI", 5, overflow);
        checkEq(written, 2, "normal written");
        check(!overflow[0], "normal no overflow");
        check(new String(CStringMemory.buf, 0, written).equals("HI"), "normal stored text");

        // -- exact fit: cap characters use every byte --
        written = CStringMemory.safeStore("ABC", 4, overflow);
        checkEq(written, 3, "exact written");
        check(!overflow[0], "exact no overflow");
        check(new String(CStringMemory.buf, 0, written).equals("ABC"), "exact stored text");

        // -- overflow: flagged, and the write never goes past index cap-1 --
        written = CStringMemory.safeStore("ABCDE", 3, overflow);
        checkEq(written, 3, "overflow written");
        check(overflow[0], "overflow flagged");
        checkEq(CStringMemory.buf[0], 'A', "overflow buf[0]");
        checkEq(CStringMemory.buf[1], 'B', "overflow buf[1]");
        checkEq(CStringMemory.buf[2], 'C', "overflow buf[2]");

        // -- empty source: the loop never runs, no overflow --
        written = CStringMemory.safeStore("", 5, overflow);
        checkEq(written, 0, "empty written");
        check(!overflow[0], "empty no overflow");

        // -- cap = 0: overflow is flagged on the very first character --
        written = CStringMemory.safeStore("X", 0, overflow);
        checkEq(written, 0, "cap0 written");
        check(overflow[0], "cap0 overflow");

        // -- cap = 1: a single character exactly fits --
        written = CStringMemory.safeStore("X", 1, overflow);
        checkEq(written, 1, "cap1 written");
        check(!overflow[0], "cap1 no overflow");
        check(new String(CStringMemory.buf, 0, written).equals("X"), "cap1 stored text");

        // -- cap = 1, 2-character source: overflow after the first character --
        written = CStringMemory.safeStore("XY", 1, overflow);
        checkEq(written, 1, "cap1 overflow written");
        check(overflow[0], "cap1 overflow flagged");
        checkEq(CStringMemory.buf[0], 'X', "cap1 overflow buf[0]");

        // -- duplicates: a run of identical characters is stored correctly --
        written = CStringMemory.safeStore("AAAAAAAAAA", CStringMemory.MAX_CAP, overflow);
        checkEq(written, 10, "duplicates written");
        check(!overflow[0], "duplicates no overflow");
        check(new String(CStringMemory.buf, 0, written).equals("AAAAAAAAAA"), "duplicates stored text");

        // -- no out-of-bounds write ever happens: sentinel bytes past cap stay untouched --
        for (int k = 0; k < CStringMemory.MAX_CAP; k++) CStringMemory.buf[k] = 'Z';
        written = CStringMemory.safeStore("ABCDEFGHIJKLMNOP", 5, overflow);
        checkEq(written, 5, "sentinel written");
        check(overflow[0], "sentinel overflow");
        boolean untouched = true;
        for (int k = 5; k < CStringMemory.MAX_CAP; k++) if (CStringMemory.buf[k] != 'Z') untouched = false;
        check(untouched, "bytes past cap remain untouched");

        // -- boundary: cap == MAX_CAP exactly still works --
        written = CStringMemory.safeStore("HELLOWORLD", CStringMemory.MAX_CAP, overflow);
        checkEq(written, 10, "max cap written");
        check(!overflow[0], "max cap no overflow");

        // -- non-ASCII: safeStore just copies chars, any code point works --
        written = CStringMemory.safeStore("café", CStringMemory.MAX_CAP, overflow);
        checkEq(written, 4, "non-ASCII written");
        check(!overflow[0], "non-ASCII no overflow");
        check(new String(CStringMemory.buf, 0, written).equals("café"), "non-ASCII stored text");

        // -- integration: runScenario drives the real safeStore path without crashing --
        CStringMemory.runScenario("unit-test integration", "TEST", 8);
        check(new String(CStringMemory.buf, 0, 4).equals("TEST"), "integration stored text");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
