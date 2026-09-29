/* Unit tests for week-10 java/StabilityDemo.java */
public class StabilityDemoTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) { checks++; if (!cond) { failures++; System.out.println("FAIL: " + label); } }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static boolean keysEqual(StabilityDemo.Rec[] a, int[] keys) {
        if (a.length != keys.length) return false;
        for (int i = 0; i < a.length; i++) if (a[i].key != keys[i]) return false;
        return true;
    }
    static boolean tagsEqual(StabilityDemo.Rec[] a, char[] tags) {
        if (a.length != tags.length) return false;
        for (int i = 0; i < a.length; i++) if (a[i].tag != tags[i]) return false;
        return true;
    }
    static StabilityDemo.Rec[] recs(Object... pairs) {
        StabilityDemo.Rec[] out = new StabilityDemo.Rec[pairs.length / 2];
        for (int i = 0; i < out.length; i++) out[i] = new StabilityDemo.Rec((Integer) pairs[2 * i], (Character) pairs[2 * i + 1]);
        return out;
    }

    public static void main(String[] args) {
        StabilityDemo.Rec[] aEmpty = recs(); StabilityDemo.insertionSortStable(aEmpty); StabilityDemo.selectionSortUnstable(aEmpty);
        checkEq(aEmpty.length, 0, "empty array stays empty");

        StabilityDemo.Rec[] a0 = recs(5, 'a'); StabilityDemo.insertionSortStable(a0);
        checkEq(a0[0].key, 5, "one element");

        StabilityDemo.Rec[] a1 = recs(1, 'a', 2, 'a'); StabilityDemo.insertionSortStable(a1);
        check(keysEqual(a1, new int[]{1, 2}), "two ordered");

        StabilityDemo.Rec[] a2 = recs(2, 'a', 1, 'a'); StabilityDemo.selectionSortUnstable(a2);
        check(keysEqual(a2, new int[]{1, 2}), "two unordered");

        StabilityDemo.Rec[] a3 = recs(3, 'a', 3, 'b'); StabilityDemo.insertionSortStable(a3);
        check(tagsEqual(a3, new char[]{'a', 'b'}), "two equal keys keep tag order");

        StabilityDemo.Rec[] a4 = recs(5,'a',2,'a',5,'b',8,'a',2,'b',5,'c',1,'a',8,'b',2,'c',9,'a');
        StabilityDemo.insertionSortStable(a4);
        check(keysEqual(a4, new int[]{1,2,2,2,5,5,5,8,8,9}), "normal keys sorted");
        check(tagsEqual(a4, new char[]{'a','a','b','c','a','b','c','a','b','a'}), "normal tag order preserved");

        StabilityDemo.Rec[] a5 = recs(6,'a',6,'b',6,'c',6,'d',6,'e'); StabilityDemo.insertionSortStable(a5);
        check(tagsEqual(a5, new char[]{'a','b','c','d','e'}), "all keys equal, tag order preserved");

        StabilityDemo.Rec[] a6a = recs(9,'a',3,'a',7,'a',1,'a',5,'a',2,'a',8,'a',4,'a',6,'a',0,'a');
        StabilityDemo.Rec[] a6b = recs(9,'a',3,'a',7,'a',1,'a',5,'a',2,'a',8,'a',4,'a',6,'a',0,'a');
        StabilityDemo.insertionSortStable(a6a); StabilityDemo.selectionSortUnstable(a6b);
        int[] want6 = {0,1,2,3,4,5,6,7,8,9};
        check(keysEqual(a6a, want6), "no ties: stable matches expected"); check(keysEqual(a6b, want6), "no ties: unstable matches expected");

        StabilityDemo.Rec[] a7 = recs(4,'a',1,'a',4,'b',2,'a',4,'c'); StabilityDemo.selectionSortUnstable(a7);
        check(keysEqual(a7, new int[]{1, 2, 4, 4, 4}), "unstable sort keys still correct");

        StabilityDemo.Rec[] a8 = recs(7,'a',6,'a',6,'b',5,'a',4,'a',4,'b',3,'a',2,'a',2,'b',1,'a');
        StabilityDemo.insertionSortStable(a8);
        check(keysEqual(a8, new int[]{1,2,2,3,4,4,5,6,6,7}), "reverse-sorted keys sorted");
        check(tagsEqual(a8, new char[]{'a','a','b','a','a','b','a','a','b','a'}), "reverse-sorted tag order preserved");

        StabilityDemo.Rec[] a9 = recs(-5,'a',2147483647,'a',-2147483648,'a',0,'a');
        StabilityDemo.insertionSortStable(a9);
        check(keysEqual(a9, new int[]{-2147483648, -5, 0, 2147483647}), "negative/extreme keys sorted");

        StabilityDemo.Rec[] a10 = recs(1,'a',2,'a',2,'b',3,'a',4,'a',4,'b',5,'a',6,'a',6,'b',7,'a');
        StabilityDemo.insertionSortStable(a10);
        check(tagsEqual(a10, new char[]{'a','a','b','a','a','b','a','a','b','a'}), "already-sorted keys tag order unchanged");

        StabilityDemo.Rec[] a11a = recs(5,'a',2,'a',5,'b',8,'a',2,'b');
        StabilityDemo.Rec[] a11b = recs(5,'a',2,'a',5,'b',8,'a',2,'b');
        StabilityDemo.insertionSortStable(a11a); StabilityDemo.selectionSortUnstable(a11b);
        int sum1 = 0, sum2 = 0;
        for (StabilityDemo.Rec r : a11a) sum1 += r.key;
        for (StabilityDemo.Rec r : a11b) sum2 += r.key;
        checkEq(sum1, 22, "stable sum oracle"); checkEq(sum2, 22, "unstable sum oracle");

        StabilityDemo.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
