/* Week 2 -- Linked Lists, Arrays and Matrices
 * Singly linked list: iterative reverse with three pointers (prev, curr,
 * next). Matches the singly-reverse.js animation.
 * CEN207 Data Structures (formerly CE205)
 */
public class SinglyReverse {
    static class Node {
        int data;
        Node next;
        Node(int data) { this.data = data; }
    }

    static Node reverse(Node head) {
        Node prev = null;
        Node curr = head;
        while (curr != null) {
            Node next = curr.next;    // save the rest of the list
            curr.next = prev;          // flip this node's arrow
            prev = curr;                // prev catches up
            curr = next;                // curr moves on
        }
        return prev;                    // prev is the new head
    }

    static Node buildList(int[] values) {
        Node head = null, tail = null;
        for (int v : values) {
            Node node = new Node(v);
            if (tail == null) head = node; else tail.next = node;
            tail = node;
        }
        return head;
    }

    static void printList(Node head) {
        StringBuilder sb = new StringBuilder("list:");
        for (Node cur = head; cur != null; cur = cur.next) sb.append(' ').append(cur.data);
        System.out.println(sb);
    }

    static void runScenario(String label, int[] values) {
        System.out.println("-- " + label + " --");
        Node head = buildList(values);
        printList(head);
        head = reverse(head);
        System.out.println("reverse():");
        printList(head);
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 10 nodes
        int[] normal = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        runScenario("normal: 10 nodes", normal);

        // hard: 20 nodes (duplicates/negatives, two rows)
        int[] hard = {5, -3, 5, 0, -3, 8, 8, -1, 2, -3, 100, -100, 7, 7, -50, 63, -8, 19, 0, 44};
        runScenario("hard: 20 nodes (duplicates/negatives, two rows)", hard);

        // edge: empty list
        runScenario("edge: empty list", new int[]{});

        // edge: a single node
        runScenario("edge: a single node", new int[]{7});

        // edge: two nodes
        runScenario("edge: two nodes", new int[]{1, 2});
    }
}
