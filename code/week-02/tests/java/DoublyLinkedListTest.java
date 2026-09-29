// Unit tests for code/week-02/java/DoublyLinkedList.java: insertHead(), insertTail(), insertAfter(),
// deleteValue(). Independent oracle: each expected content below is hand-computed from the operation
// sequence; backward traversal is checked structurally against the SAME expected array read backwards
// (never by calling printBackward(), which only prints), and head.prev / tail.next boundaries are
// asserted explicitly every time.
public class DoublyLinkedListTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void assertList(String label, DoublyLinkedList.List list, int[] expected) {
        int n = expected.length;
        if (n == 0) {
            check(list.head == null && list.tail == null, label + ": expected empty list");
            return;
        }
        check(list.head.prev == null, label + ": head.prev is null");
        DoublyLinkedList.Node cur = list.head;
        for (int i = 0; i < n; i++) {
            if (cur == null) { check(false, label + ": forward too short at " + i); return; }
            check(cur.data == expected[i], label + ": fwd node " + i + " (got " + cur.data + ", expected " + expected[i] + ")");
            cur = cur.next;
        }
        check(cur == null, label + ": forward longer than expected");

        check(list.tail.next == null, label + ": tail.next is null");
        cur = list.tail;
        for (int i = n - 1; i >= 0; i--) {
            if (cur == null) { check(false, label + ": backward too short at " + i); return; }
            check(cur.data == expected[i], label + ": bwd node " + i + " (got " + cur.data + ", expected " + expected[i] + ")");
            cur = cur.prev;
        }
        check(cur == null, label + ": backward longer than expected");
    }

    public static void main(String[] args) {
        DoublyLinkedList.List list = new DoublyLinkedList.List();

        DoublyLinkedList.insertHead(list, 5);
        assertList("single node", list, new int[]{5});
        DoublyLinkedList.insertTail(list, 6);
        DoublyLinkedList.insertHead(list, 4);
        DoublyLinkedList.insertTail(list, 7);
        assertList("mixed head/tail", list, new int[]{4, 5, 6, 7});

        check(DoublyLinkedList.insertAfter(list, 5, 100), "insert_after middle succeeds");
        assertList("insert_after middle", list, new int[]{4, 5, 100, 6, 7});

        check(DoublyLinkedList.insertAfter(list, 7, 200), "insert_after tail succeeds");
        assertList("insert_after tail", list, new int[]{4, 5, 100, 6, 7, 200});
        check(list.tail.data == 200, "new tail data");

        check(DoublyLinkedList.insertAfter(list, 4, 300), "insert_after head succeeds");
        assertList("insert_after head", list, new int[]{4, 300, 5, 100, 6, 7, 200});

        check(!DoublyLinkedList.insertAfter(list, 99999, 1), "insert_after missing target rejected");
        assertList("unchanged after not-found insert_after", list, new int[]{4, 300, 5, 100, 6, 7, 200});

        check(DoublyLinkedList.deleteValue(list, 100), "delete middle succeeds");
        assertList("after deleting middle", list, new int[]{4, 300, 5, 6, 7, 200});
        check(DoublyLinkedList.deleteValue(list, 4), "delete head succeeds");
        assertList("after deleting head", list, new int[]{300, 5, 6, 7, 200});
        check(DoublyLinkedList.deleteValue(list, 200), "delete tail succeeds");
        assertList("after deleting tail", list, new int[]{300, 5, 6, 7});

        check(!DoublyLinkedList.deleteValue(list, 999999), "delete missing value rejected");
        assertList("unchanged after not-found delete", list, new int[]{300, 5, 6, 7});

        DoublyLinkedList.List single = new DoublyLinkedList.List();
        DoublyLinkedList.insertHead(single, 42);
        check(DoublyLinkedList.deleteValue(single, 42), "single node deleted");
        assertList("single node deleted -> empty", single, new int[]{});

        DoublyLinkedList.List dup = new DoublyLinkedList.List();
        DoublyLinkedList.insertTail(dup, 8); DoublyLinkedList.insertTail(dup, 3);
        DoublyLinkedList.insertTail(dup, 8); DoublyLinkedList.insertTail(dup, 3);
        check(DoublyLinkedList.deleteValue(dup, 8), "delete first duplicate");
        assertList("first duplicate removed", dup, new int[]{3, 8, 3});

        DoublyLinkedList.List neg = new DoublyLinkedList.List();
        DoublyLinkedList.insertTail(neg, -5); DoublyLinkedList.insertTail(neg, 0); DoublyLinkedList.insertTail(neg, -10);
        assertList("negative values", neg, new int[]{-5, 0, -10});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
