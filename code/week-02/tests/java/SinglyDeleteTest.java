// Unit tests for code/week-02/java/SinglyDelete.java: deleteValue().
// Independent oracle: each expected list content below is hand-computed from the operation sequence.
public class SinglyDeleteTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void assertList(String label, SinglyDelete.Node head, int[] expected) {
        SinglyDelete.Node cur = head;
        for (int i = 0; i < expected.length; i++) {
            if (cur == null) { check(false, label + ": list too short at " + i); return; }
            check(cur.data == expected[i], label + ": node " + i + " (got " + cur.data + ", expected " + expected[i] + ")");
            cur = cur.next;
        }
        check(cur == null, label + ": list longer than expected");
    }

    static SinglyDelete.Node build(int[] vals) {
        SinglyDelete.Node head = null;
        for (int v : vals) head = SinglyDelete.insertTail(head, v);
        return head;
    }

    public static void main(String[] args) {
        SinglyDelete.DeleteResult r;

        r = SinglyDelete.deleteValue(null, 5);
        check(!r.found, "delete on empty list: not found");
        check(r.head == null, "delete on empty list: head stays null");

        SinglyDelete.Node s = build(new int[]{99});
        r = SinglyDelete.deleteValue(s, 99); s = r.head;
        check(r.found, "single node deleted");
        check(s == null, "single node list now empty");
        r = SinglyDelete.deleteValue(s, 99); s = r.head;
        check(!r.found, "delete again from empty list: not found");
        check(s == null, "still empty");

        SinglyDelete.Node h = build(new int[]{1, 2, 3, 4, 5});
        r = SinglyDelete.deleteValue(h, 1); h = r.head;
        check(r.found, "head deleted: found");
        assertList("after deleting head", h, new int[]{2, 3, 4, 5});

        r = SinglyDelete.deleteValue(h, 3); h = r.head;
        check(r.found, "middle deleted: found");
        assertList("after deleting middle", h, new int[]{2, 4, 5});

        r = SinglyDelete.deleteValue(h, 5); h = r.head;
        check(r.found, "tail deleted: found");
        assertList("after deleting tail", h, new int[]{2, 4});

        r = SinglyDelete.deleteValue(h, 12345); h = r.head;
        check(!r.found, "not-found delete leaves found=false");
        assertList("unchanged after not-found delete", h, new int[]{2, 4});

        SinglyDelete.Node d = build(new int[]{7, 7, 3, 7});
        r = SinglyDelete.deleteValue(d, 7); d = r.head;
        check(r.found, "first duplicate found");
        assertList("first duplicate removed", d, new int[]{7, 3, 7});
        r = SinglyDelete.deleteValue(d, 7); d = r.head;
        assertList("second call removes the next 7", d, new int[]{3, 7});

        SinglyDelete.Node neg = build(new int[]{-5, 0, -10, 3});
        r = SinglyDelete.deleteValue(neg, 0); neg = r.head;
        check(r.found, "zero found");
        assertList("zero removed", neg, new int[]{-5, -10, 3});
        r = SinglyDelete.deleteValue(neg, -10); neg = r.head;
        check(r.found, "negative found");
        assertList("negative value removed", neg, new int[]{-5, 3});

        SinglyDelete.Node drain = build(new int[]{1, 2, 3});
        r = SinglyDelete.deleteValue(drain, 1); drain = r.head; check(r.found, "drain 1");
        r = SinglyDelete.deleteValue(drain, 2); drain = r.head; check(r.found, "drain 2");
        r = SinglyDelete.deleteValue(drain, 3); drain = r.head; check(r.found, "drain 3");
        check(drain == null, "fully drained");
        r = SinglyDelete.deleteValue(drain, 3); drain = r.head;
        check(!r.found, "delete from drained list: not found");
        check(drain == null, "still null");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
