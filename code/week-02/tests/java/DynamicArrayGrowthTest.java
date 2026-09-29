// Unit tests for code/week-02/java/DynamicArrayGrowth.java: append() and removeLast().
// Independent oracle: capacity/growths/shrinks/copies are hand-simulated from the growth rule (grow to
// cap*factor when full; shrink to cap/2 when size <= cap/4 and cap/2 >= cap0), not read from the program's
// own trace.
public class DynamicArrayGrowthTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }

    public static void main(String[] args) {
        // Scenario A: cap0=1, factor=2.0, no shrink -- 12 appends, checkpoints at every growth
        DynamicArrayGrowth.cap0 = 1; DynamicArrayGrowth.factor = 2.0; DynamicArrayGrowth.shrinkOn = false;
        DynamicArrayGrowth.copies = 0; DynamicArrayGrowth.growths = 0; DynamicArrayGrowth.shrinks = 0;
        DynamicArrayGrowth.DynArray a = new DynamicArrayGrowth.DynArray();
        a.cap = 1; a.size = 0; a.data = new int[a.cap];

        DynamicArrayGrowth.append(a, 5);
        checkEq(a.size, 1, "A size1"); checkEq(a.cap, 1, "A cap1"); checkEq(DynamicArrayGrowth.growths, 0, "A growths0");

        DynamicArrayGrowth.append(a, 12);
        checkEq(a.size, 2, "A size2"); checkEq(a.cap, 2, "A cap2"); checkEq(DynamicArrayGrowth.growths, 1, "A growths1");
        checkEq(DynamicArrayGrowth.copies, 1, "A copies1");

        DynamicArrayGrowth.append(a, 8);
        checkEq(a.cap, 4, "A cap4"); checkEq(DynamicArrayGrowth.growths, 2, "A growths2"); checkEq(DynamicArrayGrowth.copies, 3, "A copies3");

        DynamicArrayGrowth.append(a, 19); DynamicArrayGrowth.append(a, 3);
        checkEq(a.size, 5, "A size5"); checkEq(a.cap, 8, "A cap8"); checkEq(DynamicArrayGrowth.growths, 3, "A growths3");
        checkEq(DynamicArrayGrowth.copies, 7, "A copies7");

        DynamicArrayGrowth.append(a, 27); DynamicArrayGrowth.append(a, 14); DynamicArrayGrowth.append(a, 6);
        checkEq(a.size, 8, "A size8"); checkEq(a.cap, 8, "A cap8 still"); checkEq(DynamicArrayGrowth.growths, 3, "A growths3 still");

        DynamicArrayGrowth.append(a, 31);
        checkEq(a.cap, 16, "A cap16"); checkEq(DynamicArrayGrowth.growths, 4, "A growths4"); checkEq(DynamicArrayGrowth.copies, 15, "A copies15");

        DynamicArrayGrowth.append(a, 9); DynamicArrayGrowth.append(a, 22); DynamicArrayGrowth.append(a, 17);
        checkEq(a.size, 12, "A size12"); checkEq(a.cap, 16, "A cap16 final"); checkEq(DynamicArrayGrowth.growths, 4, "A growths4 final");
        checkEq(DynamicArrayGrowth.copies, 15, "A copies15 final");
        checkEq(a.data[0], 5, "A content[0]"); checkEq(a.data[11], 17, "A content[11]");

        // Scenario B: cap0=2, factor=2.0, shrink ON -- 12 appends then 9 removes
        DynamicArrayGrowth.cap0 = 2; DynamicArrayGrowth.factor = 2.0; DynamicArrayGrowth.shrinkOn = true;
        DynamicArrayGrowth.copies = 0; DynamicArrayGrowth.growths = 0; DynamicArrayGrowth.shrinks = 0;
        DynamicArrayGrowth.DynArray b = new DynamicArrayGrowth.DynArray();
        b.cap = 2; b.size = 0; b.data = new int[b.cap];
        int[] vals = {3, 8, 15, 1, 22, 9, 30, 4, 17, 6, 25, 11};
        for (int v : vals) DynamicArrayGrowth.append(b, v);
        checkEq(b.size, 12, "B size12"); checkEq(b.cap, 16, "B cap16"); checkEq(DynamicArrayGrowth.growths, 3, "B growths3");
        checkEq(DynamicArrayGrowth.copies, 14, "B copies14");

        for (int i = 0; i < 7; i++) DynamicArrayGrowth.removeLast(b);
        checkEq(b.size, 5, "B size5"); checkEq(b.cap, 16, "B cap16 pre-shrink"); checkEq(DynamicArrayGrowth.shrinks, 0, "B shrinks0");

        DynamicArrayGrowth.removeLast(b);
        checkEq(b.size, 4, "B size4"); checkEq(b.cap, 8, "B cap8 shrunk"); checkEq(DynamicArrayGrowth.shrinks, 1, "B shrinks1");
        checkEq(DynamicArrayGrowth.copies, 18, "B copies18");

        DynamicArrayGrowth.removeLast(b);
        checkEq(b.size, 3, "B size3"); checkEq(b.cap, 8, "B cap8 no further shrink"); checkEq(DynamicArrayGrowth.shrinks, 1, "B shrinks1 still");

        // Scenario C: removeLast on an EMPTY array must be a safe no-op
        DynamicArrayGrowth.cap0 = 4; DynamicArrayGrowth.factor = 2.0; DynamicArrayGrowth.shrinkOn = true;
        DynamicArrayGrowth.copies = 0; DynamicArrayGrowth.growths = 0; DynamicArrayGrowth.shrinks = 0;
        DynamicArrayGrowth.DynArray c = new DynamicArrayGrowth.DynArray();
        c.cap = 4; c.size = 0; c.data = new int[c.cap];
        DynamicArrayGrowth.removeLast(c);
        checkEq(c.size, 0, "C size0"); checkEq(c.cap, 4, "C cap4"); checkEq(DynamicArrayGrowth.shrinks, 0, "C shrinks0");

        // Scenario D: growth factor 1.5 -- smaller, more frequent growths (integer truncation each time)
        DynamicArrayGrowth.cap0 = 1; DynamicArrayGrowth.factor = 1.5; DynamicArrayGrowth.shrinkOn = false;
        DynamicArrayGrowth.copies = 0; DynamicArrayGrowth.growths = 0; DynamicArrayGrowth.shrinks = 0;
        DynamicArrayGrowth.DynArray d = new DynamicArrayGrowth.DynArray();
        d.cap = 1; d.size = 0; d.data = new int[d.cap];
        DynamicArrayGrowth.append(d, 4);
        checkEq(d.cap, 1, "D cap1");
        DynamicArrayGrowth.append(d, 9);
        checkEq(d.cap, 2, "D cap2"); checkEq(DynamicArrayGrowth.growths, 1, "D growths1");
        DynamicArrayGrowth.append(d, 15);
        checkEq(d.cap, 3, "D cap3"); checkEq(DynamicArrayGrowth.growths, 2, "D growths2");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
