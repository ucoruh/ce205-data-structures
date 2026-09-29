/* Week 2 -- Linked Lists, Arrays and Matrices
 * Singly linked list: insert at head, at tail (no tail field -- walks the
 * list), and after a given node. Matches the singly-insert.js animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class SinglyInsert {
    static class Node {
        int data;
        Node next;
        Node(int data) { this.data = data; }
    }

    static Node insertHead(Node head, int value) {
        Node n = new Node(value);
        n.next = head;        // new node points at the old head
        return n;              // new node is the head now
    }

    static Node insertTail(Node head, int value) {   // no tail field here: walks the list
        Node n = new Node(value);
        if (head == null)
            return n;
        Node cur = head;
        while (cur.next != null)     // walk to the last node: O(n)
            cur = cur.next;
        cur.next = n;
        return head;
    }

    static void insertAfter(Node prev, int value) {
        Node n = new Node(value);
        n.next = prev.next;    // STEP 1: new node first
        prev.next = n;         // STEP 2: then link prev to it
    }

    static Node find(Node head, int value) {
        for (Node cur = head; cur != null; cur = cur.next)
            if (cur.data == value)
                return cur;
        return null;
    }

    static void printList(Node head) {
        StringBuilder sb = new StringBuilder("list:");
        for (Node cur = head; cur != null; cur = cur.next) sb.append(' ').append(cur.data);
        System.out.println(sb);
    }

    // op tokens: "hV" = insertHead(V); "tV" = insertTail(V); "aX:V" = insertAfter(find(X), V)
    static Node runScenario(String label, String[] ops) {
        System.out.println("-- " + label + " --");
        Node head = null;
        printList(head);
        for (String op : ops) {
            char kind = op.charAt(0);
            if (kind == 'h') {
                int v = Integer.parseInt(op.substring(1));
                head = insertHead(head, v);
                System.out.println("insert_head(" + v + ")");   // trace text matches the C program's output
            } else if (kind == 't') {
                int v = Integer.parseInt(op.substring(1));
                head = insertTail(head, v);
                System.out.println("insert_tail(" + v + ")");
            } else if (kind == 'a') {
                String[] parts = op.substring(1).split(":");
                int target = Integer.parseInt(parts[0]), v = Integer.parseInt(parts[1]);
                Node prev = find(head, target);
                insertAfter(prev, v);
                System.out.println("insert_after(find(" + target + "), " + v + ")");
            }
            printList(head);
        }
        System.out.println();
        return head;
    }

    public static void main(String[] args) {
        // normal: 5 inserts at head, 5 at tail, then one after a node
        String[] normal = {"h7", "h3", "h9", "h1", "h8", "t2", "t10", "t4", "t6", "t5", "a8:777"};
        runScenario("normal: 5 inserts at head, 5 at tail, then one after a node", normal);

        // hard: 12 values (duplicates/negatives), insert after the FIRST match of a duplicate target
        String[] hard = {"t5", "t-3", "t5", "t0", "t-3", "t8", "t8", "t-1", "t2", "t-3", "t100", "t-100", "a-3:777"};
        runScenario("hard: 12 values (duplicates/negatives), insert after the FIRST match of a duplicate target", hard);

        // edge: insert into an empty list at the head
        String[] intoEmpty = {"h42"};
        runScenario("edge: insert into an empty list at the head", intoEmpty);

        // edge: insert right after the head and right after the tail (position k = 0 and k = last)
        String[] afterHeadTail = {"t10", "t20", "t30", "t40", "t50", "t60", "t70", "t80", "t90", "t100", "a10:111", "a100:222"};
        runScenario("edge: insert right after the head and right after the tail (position k = 0 and k = last)", afterHeadTail);
    }
}
