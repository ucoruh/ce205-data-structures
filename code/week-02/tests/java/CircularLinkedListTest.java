// Unit tests for code/week-02/java/CircularLinkedList.java: insertTail(), deleteValue(), listSize().
// Independent oracle: each expected ring content below is hand-computed from the operation sequence; the
// wraparound is checked structurally (walking listSize(tail) steps from the head must land back on the
// head), not by calling traverse() (which only prints).
public class CircularLinkedListTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void assertRing(String label, CircularLinkedList.Node tail, int[] expected) {
        int n = expected.length;
        check(CircularLinkedList.listSize(tail) == n, label + ": list_size (got " + CircularLinkedList.listSize(tail) + ", expected " + n + ")");
        if (n == 0) { check(tail == null, label + ": tail is null"); return; }
        CircularLinkedList.Node head = tail.next;
        CircularLinkedList.Node cur = head;
        for (int i = 0; i < n; i++) {
            check(cur.data == expected[i], label + ": node " + i + " (got " + cur.data + ", expected " + expected[i] + ")");
            cur = cur.next;
        }
        check(cur == head, label + ": ring did not close after " + n + " steps");
    }

    public static void main(String[] args) {
        CircularLinkedList.Node r1 = CircularLinkedList.insertTail(null, 10);
        assertRing("single node", r1, new int[]{10});
        check(r1.next == r1, "single node self-loop");

        r1 = CircularLinkedList.insertTail(r1, 20);
        r1 = CircularLinkedList.insertTail(r1, 30);
        r1 = CircularLinkedList.insertTail(r1, 40);
        assertRing("four tails", r1, new int[]{10, 20, 30, 40});

        r1 = CircularLinkedList.deleteValue(r1, 20);
        check(CircularLinkedList.found, "found middle");
        assertRing("after deleting middle", r1, new int[]{10, 30, 40});

        r1 = CircularLinkedList.deleteValue(r1, 40);
        check(CircularLinkedList.found, "found old tail");
        assertRing("after deleting old tail", r1, new int[]{10, 30});
        check(r1.data == 30, "tail now names the new last node");

        r1 = CircularLinkedList.deleteValue(r1, 10);
        check(CircularLinkedList.found, "found head");
        assertRing("after deleting head", r1, new int[]{30});
        check(r1.next == r1, "single node again");

        r1 = CircularLinkedList.deleteValue(r1, 30);
        check(CircularLinkedList.found, "found last node");
        check(r1 == null, "ring now empty");

        CircularLinkedList.Node emptyResult = CircularLinkedList.deleteValue(null, 1);
        check(!CircularLinkedList.found, "delete from empty ring: not found");
        check(emptyResult == null, "delete from empty ring: still null");

        CircularLinkedList.Node r2 = CircularLinkedList.insertTail(null, 1);
        r2 = CircularLinkedList.insertTail(r2, 2);
        r2 = CircularLinkedList.insertTail(r2, 3);
        CircularLinkedList.Node before = r2;
        r2 = CircularLinkedList.deleteValue(r2, 999);
        check(!CircularLinkedList.found, "not-found delete");
        check(r2 == before, "tail reference unchanged");
        assertRing("unchanged after not-found delete", r2, new int[]{1, 2, 3});

        CircularLinkedList.Node r3 = CircularLinkedList.insertTail(null, 5);
        r3 = CircularLinkedList.insertTail(r3, 8);
        r3 = CircularLinkedList.insertTail(r3, 5);
        r3 = CircularLinkedList.insertTail(r3, 8);
        r3 = CircularLinkedList.deleteValue(r3, 5);
        check(CircularLinkedList.found, "found first duplicate");
        assertRing("first duplicate removed", r3, new int[]{8, 5, 8});

        CircularLinkedList.Node r4 = CircularLinkedList.insertTail(null, -5);
        r4 = CircularLinkedList.insertTail(r4, -10);
        r4 = CircularLinkedList.insertTail(r4, 0);
        assertRing("negative values", r4, new int[]{-5, -10, 0});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
