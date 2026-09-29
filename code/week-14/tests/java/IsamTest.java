/* Unit tests for week-14 java/Isam.java */
public class IsamTest {
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
        checkEq(Isam.findGroup(new int[0], 0, 50), 0, "findGroup empty");
        int[] l1 = {5, 30, 70};
        checkEq(Isam.findGroup(l1, 3, 4), 0, "findGroup below first group");
        checkEq(Isam.findGroup(l1, 3, 5), 0, "findGroup exact");
        checkEq(Isam.findGroup(l1, 3, 29), 0, "findGroup just below next");
        checkEq(Isam.findGroup(l1, 3, 30), 1, "findGroup middle");
        checkEq(Isam.findGroup(l1, 3, 999), 2, "findGroup beyond last");

        int[] l2 = {5, 15, 30, 45};
        checkEq(Isam.findPage(l2, 0, 1, 10), 0, "findPage 10");
        checkEq(Isam.findPage(l2, 0, 1, 20), 1, "findPage 20");
        checkEq(Isam.findPage(l2, 2, 3, 40), 2, "findPage 40");
        checkEq(Isam.findPage(l2, 2, 3, 999), 3, "findPage 999");

        Isam.Page[] pages = new Isam.Page[2];
        pages[0] = new Isam.Page();
        pages[0].keys[0] = 10; pages[0].keys[1] = 20; pages[0].len = 2;
        pages[1] = new Isam.Page();
        pages[1].keys[0] = 40; pages[1].keys[1] = 50; pages[1].len = 2;
        int[] idx1 = {10};

        Isam.isamInsert(pages, 2, 4, idx1, 1, 2, 15);
        checkEq(pages[0].len, 3, "len after direct insert");
        checkEq(pages[0].keys[0], 10, "keys[0] unchanged");
        checkEq(pages[0].keys[1], 15, "keys[1] inserted in sorted position");
        checkEq(pages[0].keys[2], 20, "keys[2] shifted");
        check(pages[0].overflowHead == null, "no overflow yet");

        Isam.isamInsert(pages, 2, 4, idx1, 1, 2, 25);
        checkEq(pages[0].len, 4, "len fills page exactly");
        check(pages[0].overflowHead == null, "still no overflow at 4/4");

        Isam.isamInsert(pages, 2, 4, idx1, 1, 2, 12);
        checkEq(pages[0].len, 4, "len unchanged: went to overflow");
        check(pages[0].overflowHead != null, "first overflow node created");
        checkEq(pages[0].overflowHead.key, 12, "first overflow key");
        check(pages[0].overflowHead == pages[0].overflowTail, "head == tail with one node");

        Isam.isamInsert(pages, 2, 4, idx1, 1, 2, 13);
        check(pages[0].overflowHead.next == pages[0].overflowTail, "second node chained after first");
        checkEq(pages[0].overflowTail.key, 13, "second overflow key");

        Isam.isamInsert(pages, 2, 4, idx1, 1, 2, 45);
        checkEq(pages[1].len, 3, "second page insert independent");
        check(pages[1].overflowHead == null, "second page has no overflow");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
