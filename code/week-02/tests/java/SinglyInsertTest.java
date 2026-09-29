// Unit tests for code/week-02/java/SinglyInsert.java: insertHead(), insertTail(), insertAfter(), find().
// Independent oracle: each expected list content below is hand-computed from the operation sequence.
// insertAfter's documented precondition is prev != null (found via find()); every call here respects it.
public class SinglyInsertTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void assertList(String label, SinglyInsert.Node head, int[] expected) {
        SinglyInsert.Node cur = head;
        for (int i = 0; i < expected.length; i++) {
            if (cur == null) { check(false, label + ": list too short at " + i); return; }
            check(cur.data == expected[i], label + ": node " + i + " (got " + cur.data + ", expected " + expected[i] + ")");
            cur = cur.next;
        }
        check(cur == null, label + ": list longer than expected");
    }

    public static void main(String[] args) {
        SinglyInsert.Node h = null;
        h = SinglyInsert.insertHead(h, 10);
        assertList("single head", h, new int[]{10});
        h = SinglyInsert.insertHead(h, 20);
        h = SinglyInsert.insertHead(h, 30);
        assertList("three heads (LIFO)", h, new int[]{30, 20, 10});

        SinglyInsert.Node t = null;
        t = SinglyInsert.insertTail(t, 1);
        assertList("single tail", t, new int[]{1});
        t = SinglyInsert.insertTail(t, 2);
        t = SinglyInsert.insertTail(t, 3);
        assertList("three tails (FIFO)", t, new int[]{1, 2, 3});

        SinglyInsert.Node m = null;
        m = SinglyInsert.insertHead(m, 5);
        m = SinglyInsert.insertTail(m, 6);
        m = SinglyInsert.insertHead(m, 4);
        m = SinglyInsert.insertTail(m, 7);
        assertList("mixed head/tail", m, new int[]{4, 5, 6, 7});

        check(SinglyInsert.find(m, 4) == m, "find head");
        check(SinglyInsert.find(m, 6).data == 6, "find middle");
        check(SinglyInsert.find(m, 7).next == null, "find last");
        check(SinglyInsert.find(m, 999) == null, "find missing");
        check(SinglyInsert.find(null, 1) == null, "find on empty list");

        SinglyInsert.insertAfter(SinglyInsert.find(m, 4), 100);
        assertList("insert_after head", m, new int[]{4, 100, 5, 6, 7});

        SinglyInsert.insertAfter(SinglyInsert.find(m, 7), 200);
        assertList("insert_after tail", m, new int[]{4, 100, 5, 6, 7, 200});
        check(SinglyInsert.find(m, 200).next == null, "new tail's next is null");

        SinglyInsert.insertAfter(SinglyInsert.find(m, 5), 300);
        assertList("insert_after middle", m, new int[]{4, 100, 5, 300, 6, 7, 200});

        SinglyInsert.Node d = null;
        d = SinglyInsert.insertTail(d, 8);
        d = SinglyInsert.insertTail(d, 3);
        d = SinglyInsert.insertTail(d, 8);
        d = SinglyInsert.insertTail(d, 3);
        check(SinglyInsert.find(d, 8) != null && SinglyInsert.find(d, 8).next.data == 3, "find first duplicate 8");
        SinglyInsert.insertAfter(SinglyInsert.find(d, 3), 999);
        assertList("insert_after with duplicate target", d, new int[]{8, 3, 999, 8, 3});

        SinglyInsert.Node n = null;
        n = SinglyInsert.insertHead(n, -5);
        n = SinglyInsert.insertTail(n, -10);
        n = SinglyInsert.insertHead(n, 0);
        assertList("negative values", n, new int[]{0, -5, -10});
        check(SinglyInsert.find(n, -10) != null, "find negative value");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
