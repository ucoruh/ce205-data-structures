/* Week 2 -- Linked Lists, Arrays and Matrices
 * The Josephus problem: n people in a circle, every k-th one eliminated,
 * who survives? Solved with a circular linked list. Matches the josephus.js
 * animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class Josephus {
    static class Node { int id; Node next; Node(int id) { this.id = id; } }

    static Node buildCircle(int n) {
        Node head = null, tail = null;
        for (int i = 1; i <= n; i++) {
            Node node = new Node(i);
            if (tail == null) head = node; else tail.next = node;
            tail = node;
        }
        tail.next = head;    // close the circle
        return head;
    }

    static int josephus(int n, int k) {
        Node head = buildCircle(n);
        Node prev = head;
        while (prev.next != head)    // find the node before head
            prev = prev.next;

        Node cur = head;
        int remaining = n;
        while (remaining > 1) {
            for (int step = 1; step < k; step++) {   // count k-1 steps forward
                prev = cur;
                cur = cur.next;
            }
            System.out.println("eliminate " + cur.id);
            prev.next = cur.next;     // remove cur from the circle
            cur = prev.next;
            remaining--;
        }
        return cur.id;                 // the sole survivor
    }

    static void runScenario(String label, int n, int k) {
        System.out.println("-- " + label + " --");
        System.out.println("n=" + n + " k=" + k);
        int survivor = josephus(n, k);
        System.out.println("survivor = " + survivor);
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: n = 10, k = 3
        runScenario("normal: n = 10, k = 3", 10, 3);

        // hard: n = 12, k = 5
        runScenario("hard: n = 12, k = 5", 12, 5);

        // edge: n = 10, k = 1: eliminate in plain order
        runScenario("edge: n = 10, k = 1: eliminate in plain order", 10, 1);

        // edge: n = 1: nobody to eliminate
        runScenario("edge: n = 1: nobody to eliminate", 1, 3);
    }
}
