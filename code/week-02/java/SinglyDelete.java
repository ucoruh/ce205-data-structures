/* Week 2 -- Linked Lists, Arrays and Matrices
 * Singly linked list: delete by value (head, a middle node, the tail, a
 * value not present, and deleting from an empty list). Matches the
 * singly-delete.js animation.
 * CEN207 Data Structures (formerly CE205)
 */
public class SinglyDelete {
    static class Node {
        int data;
        Node next;
        Node(int data) { this.data = data; }
    }

    static class DeleteResult {
        Node head;
        boolean found;
        DeleteResult(Node head, boolean found) { this.head = head; this.found = found; }
    }

    static DeleteResult deleteValue(Node head, int value) {
        if (head == null)
            return new DeleteResult(null, false);

        if (head.data == value)              // removing the head itself
            return new DeleteResult(head.next, true);

        Node prev = head;
        Node cur = head.next;
        while (cur != null) {
            if (cur.data == value) {
                prev.next = cur.next;        // skip over cur: the bypass arrow
                return new DeleteResult(head, true);
            }
            prev = cur;
            cur = cur.next;
        }
        return new DeleteResult(head, false); // value not found
    }

    static Node insertTail(Node head, int value) {
        Node n = new Node(value);
        if (head == null)
            return n;
        Node cur = head;
        while (cur.next != null)
            cur = cur.next;
        cur.next = n;
        return head;
    }

    static void printList(Node head) {
        StringBuilder sb = new StringBuilder("list:");
        for (Node cur = head; cur != null; cur = cur.next) sb.append(' ').append(cur.data);
        System.out.println(sb);
    }

    // tokens: a plain number inserts it at the tail while building the list; "dV" deletes value V
    static Node runScenario(String label, String[] ops) {
        System.out.println("-- " + label + " --");
        Node head = null;
        int removedCount = 0, notFoundCount = 0;
        for (String op : ops) {
            if (op.charAt(0) == 'd') {
                int v = Integer.parseInt(op.substring(1));
                DeleteResult r = deleteValue(head, v);
                head = r.head;
                if (r.found) { removedCount++; System.out.println("delete_value(" + v + "): removed"); }
                else { notFoundCount++; System.out.println("delete_value(" + v + "): not found"); }
            } else {
                int v = Integer.parseInt(op);
                head = insertTail(head, v);
                System.out.println("insert_tail(" + v + ")");
            }
            printList(head);
        }
        System.out.println("removed=" + removedCount + ", not_found=" + notFoundCount);
        System.out.println();
        return head;
    }

    public static void main(String[] args) {
        // normal: 10 nodes, delete the head, then delete a middle node
        String[] normal = {"10", "20", "30", "40", "50", "60", "70", "80", "90", "100", "d10", "d60"};
        runScenario("normal: 10 nodes, delete the head, then delete a middle node", normal);

        // hard: 12 nodes with duplicate 5s: the head copy goes first, then a middle copy
        String[] hard = {"5", "5", "20", "30", "5", "40", "50", "5", "60", "70", "80", "5", "d5", "d5"};
        runScenario("hard: 12 nodes with duplicate 5s: the head copy goes first, then a middle copy", hard);

        // edge: a single node: delete it, then delete again from the now-empty list
        String[] singleThenEmpty = {"99", "d99", "d99"};
        runScenario("edge: a single node: delete it, then delete again from the now-empty list", singleThenEmpty);

        // edge: 10 nodes: delete the tail, then delete a value that is not present
        String[] tailAndMissing = {"10", "20", "30", "40", "50", "60", "70", "80", "90", "100", "d100", "d12345"};
        runScenario("edge: 10 nodes: delete the tail, then delete a value that is not present", tailAndMissing);
    }
}
