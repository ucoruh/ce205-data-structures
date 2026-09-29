/* Week 2 -- Linked Lists, Arrays and Matrices
 * Doubly linked list: insert at the front, at the back and after a given
 * value, delete anywhere by value, and traverse backwards. Matches the
 * doubly-linked-list.js animation.
 * CEN207 Data Structures (formerly CE205)
 */
public class DoublyLinkedList {
    static class Node { int data; Node prev, next; Node(int d) { data = d; } }
    static class List { Node head, tail; }

    static void insertHead(List list, int value) {
        Node n = new Node(value);
        n.next = list.head;
        if (list.head != null) list.head.prev = n;  // old head now has a prev
        list.head = n;
        if (list.tail == null) list.tail = n;
    }

    static void insertTail(List list, int value) {
        Node n = new Node(value);
        n.prev = list.tail;
        if (list.tail != null) list.tail.next = n;  // old tail now has a next
        list.tail = n;
        if (list.head == null) list.head = n;
    }

    static boolean insertAfter(List list, int target, int value) {
        for (Node cur = list.head; cur != null; cur = cur.next) {
            if (cur.data == target) {
                Node n = new Node(value);
                n.prev = cur; n.next = cur.next;
                if (cur.next != null) cur.next.prev = n; else list.tail = n;  // cur was the tail
                cur.next = n;
                return true;
            }
        }
        return false;                                    // target not found
    }

    static boolean deleteValue(List list, int value) {
        for (Node cur = list.head; cur != null; cur = cur.next) {
            if (cur.data == value) {
                if (cur.prev != null) cur.prev.next = cur.next; else list.head = cur.next;
                if (cur.next != null) cur.next.prev = cur.prev; else list.tail = cur.prev;
                return true;
            }
        }
        return false;
    }

    static void printBackward(List list, StringBuilder out) {
        for (Node cur = list.tail; cur != null; cur = cur.prev)
            out.append(' ').append(cur.data);
    }

    static void printForward(List list) {
        StringBuilder sb = new StringBuilder("forward: ");
        for (Node cur = list.head; cur != null; cur = cur.next) sb.append(' ').append(cur.data);
        System.out.println(sb);
    }

    // tokens: "hV" = insertHead(V); "tV" = insertTail(V); "aX:V" = insertAfter(X, V);
    // "dV" = deleteValue(V); "b" = print backward
    static void runScenario(String label, String[] ops) {
        System.out.println("-- " + label + " --");
        List list = new List();
        for (String op : ops) {
            char kind = op.charAt(0);
            if (kind == 'h') {
                int v = Integer.parseInt(op.substring(1));
                insertHead(list, v);
                System.out.println("insert_head(" + v + ")");
            } else if (kind == 't') {
                int v = Integer.parseInt(op.substring(1));
                insertTail(list, v);
                System.out.println("insert_tail(" + v + ")");
            } else if (kind == 'a') {
                String[] parts = op.substring(1).split(":");
                int target = Integer.parseInt(parts[0]), v = Integer.parseInt(parts[1]);
                boolean ok = insertAfter(list, target, v);
                System.out.println("insert_after(" + target + ", " + v + "): " + (ok ? "inserted" : "not found"));
            } else if (kind == 'd') {
                int v = Integer.parseInt(op.substring(1));
                boolean ok = deleteValue(list, v);
                System.out.println("delete_value(" + v + "): " + (ok ? "removed" : "not found"));
            } else if (kind == 'b') {
                StringBuilder sb = new StringBuilder("backward:");
                printBackward(list, sb);
                System.out.println(sb);
                continue;
            }
            printForward(list);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 10 nodes (alternating front/back), delete a middle node, traverse backward
        String[] normal = {"t10", "h20", "t30", "h40", "t50", "h60", "t70", "h80", "t90", "h100", "d50", "b"};
        runScenario("normal: 10 nodes (alternating front/back), delete a middle node, traverse backward", normal);

        // hard: 12 nodes, duplicates/negatives; the FIRST match of a duplicate -3 is deleted
        String[] hard = {"t5", "h-3", "t5", "h0", "t-3", "h8", "t8", "h-1", "t2", "h-3", "t100", "h-100", "d-3", "b"};
        runScenario("hard: 12 nodes, duplicates/negatives; the FIRST match of a duplicate -3 is deleted", hard);

        // edge: a single node: insert it, then delete it (the list is empty again)
        String[] singleElement = {"h5", "d5", "b"};
        runScenario("edge: a single node: insert it, then delete it (the list is empty again)", singleElement);

        // edge: insert after the node tail points to: the new node becomes the new tail
        String[] insertAfterTail = {"t10", "t20", "t30", "t40", "t50", "t60", "t70", "t80", "t90", "t100", "a100:105", "b"};
        runScenario("edge: insert after the node tail points to: the new node becomes the new tail", insertAfterTail);

        // edge: trying to insert after a value that is not in the list
        String[] insertAfterNotFound = {"t10", "t20", "t30", "t40", "t50", "t60", "t70", "t80", "t90", "t100", "a99999:1", "b"};
        runScenario("edge: trying to insert after a value that is not in the list", insertAfterNotFound);
    }
}
