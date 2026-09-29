/* Week 2 -- Linked Lists, Arrays and Matrices
 * Circular linked list: insert at the tail (no separate head field --
 * tail.next IS the head), delete by value, and a traversal that wraps
 * around. Matches the circular-linked-list.js animation.
 * CEN207 Data Structures (formerly CE205)
 */
public class CircularLinkedList {
    static class Node { int data; Node next; Node(int d) { data = d; } }

    static int listSize(Node tail) {
        if (tail == null) return 0;
        int n = 1;
        for (Node cur = tail.next; cur != tail; cur = cur.next) n++;
        return n;
    }

    // 'tail' always points at the last-inserted node; tail.next is the head.
    static Node insertTail(Node tail, int value) {
        Node n = new Node(value);
        if (tail == null) {
            n.next = n;              // a single node points at itself
            return n;
        }
        n.next = tail.next;          // new node -> old head
        tail.next = n;               // old tail -> new node
        return n;                    // new node is the new tail
    }

    // Deletes the FIRST node holding value, scanning forward from the head (no prev link to walk backward).
    // Returns the (possibly updated) tail; sets `found` to report success.
    static boolean found;
    static Node deleteValue(Node tail, int value) {
        found = false;
        if (tail == null) return null;                // empty list
        Node prev = tail, cur = tail.next;             // cur starts at the head
        int n = listSize(tail);
        for (int i = 0; i < n; i++) {
            if (cur.data == value) {
                found = true;
                if (cur == cur.next) {                 // the only node in the list
                    return null;                        // list becomes empty
                }
                prev.next = cur.next;                   // unlink cur
                return (cur == tail) ? prev : tail;
            }
            prev = cur;
            cur = cur.next;
        }
        return tail;                                    // not found: unchanged
    }

    static void traverse(Node tail, int laps, StringBuilder out) {
        Node head = tail.next;
        Node cur = head;
        int steps = listSize(tail) * laps;
        for (int i = 0; i < steps; i++) {
            out.append(' ').append(cur.data);
            cur = cur.next;
        }
    }

    // tokens: a plain number is insertTail(value); "dV" deletes value V
    static void runScenario(String label, String[] ops, int laps) {
        System.out.println("-- " + label + " --");
        Node tail = null;
        for (String op : ops) {
            if (op.charAt(0) == 'd') {
                int v = Integer.parseInt(op.substring(1));
                tail = deleteValue(tail, v);
                System.out.println("delete_value(" + v + "): " + (found ? "removed" : "not found"));
            } else {
                int v = Integer.parseInt(op);
                tail = insertTail(tail, v);
                System.out.println("insert_tail(" + v + ")");
            }
        }
        System.out.println("size = " + listSize(tail));
        if (tail != null) {
            StringBuilder sb = new StringBuilder("traverse(" + laps + " laps):");
            traverse(tail, laps, sb);
            System.out.println(sb);
        } else {
            System.out.println("traverse(" + laps + " laps): (empty)");
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 10 inserts, delete one value from the middle, 2 laps
        String[] normal = {"10", "20", "30", "40", "50", "d30", "60", "70", "80", "90", "100"};
        runScenario("normal: 10 inserts, delete one value from the middle, 2 laps", normal, 2);

        // hard: 12 inserts (duplicates), 2 deletes (one not found), 3 laps
        String[] hard = {"5", "5", "20", "30", "d5", "5", "40", "50", "5", "60", "70", "d12345", "80", "5"};
        runScenario("hard: 12 inserts (duplicates), 2 deletes (one not found), 3 laps", hard, 3);

        // edge: a single node: deleting it empties the list
        String[] oneNode = {"42", "d42"};
        runScenario("edge: a single node: deleting it empties the list", oneNode, 5);

        // edge: the first-inserted (head) node is deleted: tail->next changes
        String[] deleteHead = {"11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "d11"};
        runScenario("edge: the first-inserted (head) node is deleted: tail->next changes", deleteHead, 2);

        // edge: 10 inserts, an attempt to delete a value that is not in the list
        String[] notFound = {"3", "6", "9", "12", "15", "18", "21", "24", "27", "30", "d999"};
        runScenario("edge: 10 inserts, an attempt to delete a value that is not in the list", notFound, 2);
    }
}
