/* Unit tests for week-12 java/StringBuilderDemo.java */
public class StringBuilderDemoTest {
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
        StringBuilderDemo.Builder b;

        // -- empty builder: nothing appended yet --
        b = new StringBuilderDemo.Builder(4);
        checkEq(b.len, 0, "empty len");
        checkEq(b.cap, 4, "empty cap");
        checkEq(b.growths, 0, "empty growths");

        // -- a single character, well within capacity: no growth --
        b = new StringBuilderDemo.Builder(4);
        b.append('X');
        checkEq(b.len, 1, "single len");
        checkEq(b.cap, 4, "single cap");
        checkEq(b.growths, 0, "single growths");
        checkEq(b.buf[0], 'X', "single char");

        // -- exact fit: appending exactly cap characters triggers no growth at all --
        b = new StringBuilderDemo.Builder(4);
        for (int i = 0; i < 4; i++) b.append((char) ('A' + i));
        checkEq(b.len, 4, "exact fit len");
        checkEq(b.cap, 4, "exact fit cap");
        checkEq(b.growths, 0, "exact fit growths");
        check(new String(b.buf, 0, b.len).equals("ABCD"), "exact fit text");

        // -- one character past capacity: exactly one growth, capacity doubles --
        b = new StringBuilderDemo.Builder(4);
        for (int i = 0; i < 5; i++) b.append((char) ('A' + i));
        checkEq(b.len, 5, "past cap len");
        checkEq(b.cap, 8, "past cap doubled");
        checkEq(b.growths, 1, "past cap growths");
        check(new String(b.buf, 0, b.len).equals("ABCDE"), "past cap text");

        // -- every existing character survives a growth, not just the new one --
        b = new StringBuilderDemo.Builder(2);
        for (int i = 0; i < 10; i++) b.append((char) ('A' + i));
        checkEq(b.len, 10, "many growths len");
        check(new String(b.buf, 0, b.len).equals("ABCDEFGHIJ"), "many growths text");

        // -- the smallest possible start: initCap = 1, many growths back to back --
        b = new StringBuilderDemo.Builder(1);
        for (int i = 0; i < 10; i++) b.append((char) ('A' + i));
        checkEq(b.len, 10, "initCap1 len");
        checkEq(b.cap, 16, "initCap1 cap (1->2->4->8->16)");
        checkEq(b.growths, 4, "initCap1 growths");
        check(new String(b.buf, 0, b.len).equals("ABCDEFGHIJ"), "initCap1 text");

        // -- capacity doubles every time it grows, checked at each step --
        b = new StringBuilderDemo.Builder(2);
        int expectedCap = 2;
        for (int i = 0; i < 20; i++) {
            boolean wasFull = (b.len == b.cap);
            b.append('Q');
            if (wasFull) expectedCap *= 2;
            checkEq(b.cap, expectedCap, "doubling step " + i);
        }

        // -- all-equal characters: a long run of the same character --
        b = new StringBuilderDemo.Builder(4);
        for (int i = 0; i < 12; i++) b.append('Z');
        checkEq(b.len, 12, "all-equal len");
        boolean allZ = true;
        for (int i = 0; i < 12; i++) if (b.buf[i] != 'Z') allZ = false;
        check(allZ, "all-equal chars");

        // -- non-ASCII: the builder just stores chars, any code point works --
        b = new StringBuilderDemo.Builder(2);
        for (char c : "café".toCharArray()) b.append(c);
        checkEq(b.len, 4, "non-ASCII len");
        check(new String(b.buf, 0, b.len).equals("café"), "non-ASCII text");

        // -- a single-element initial capacity holding exactly one character: no growth --
        b = new StringBuilderDemo.Builder(1);
        b.append('Q');
        checkEq(b.len, 1, "cap1 len");
        checkEq(b.cap, 1, "cap1 cap");
        checkEq(b.growths, 0, "cap1 growths");

        // -- growths counter matches the number of doublings, not the number of appends --
        b = new StringBuilderDemo.Builder(10);
        for (int i = 0; i < 10; i++) b.append('M');   // exact fit, no growth
        checkEq(b.growths, 0, "growths before boundary");
        b.append('M');                                 // the 11th forces exactly one growth
        checkEq(b.growths, 1, "growths after boundary");
        checkEq(b.cap, 20, "cap after boundary");

        // -- integration: runScenario drives the real append/growth path without crashing --
        StringBuilderDemo.runScenario("unit-test integration", 4, "HELLOWORLD");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
