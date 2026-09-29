/* Week 1 -- Introduction to Data Structures
 * Preview of Week 2: the same values laid out as a contiguous array versus individually
 * created linked nodes; compare reaching element k: 1 step in the array vs k hops in the list.
 * Runs the same normal / hard / edge-case scenarios as the array-vs-linked-preview animation.
 * Real addresses vary from run to run (and between C and Java), so this prints a deterministic
 * stand-in instead: the array's byte OFFSET from its base (base + i*4, the real formula the
 * hardware uses) and the linked list's POSITION ("node #i"); the C and Java outputs are then
 * byte-identical and testable. The point -- one index calculation vs k pointer hops -- still holds.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class ArrayVsLinkedPreview {
    static class Node {
        int data;
        Node next;
        Node(int data, Node next) { this.data = data; this.next = next; }
    }

    static void runScenario(String label, int[] values, int k) {
        System.out.println("-- " + label + " --");
        int n = values.length;

        System.out.println("array (contiguous, indexed access):");
        for (int i = 0; i < n; i++)
            System.out.println("  arr[" + i + "] = " + values[i] + " at base+" + (i * 4));
        System.out.println("array access: arr[" + k + "] = " + values[k] + ", ONE index calculation (base + " + k + "*4). O(1).");

        Node head = null;
        for (int i = n - 1; i >= 0; i--)
            head = new Node(values[i], head);

        System.out.println("linked list (separate nodes, connected by pointers):");
        int idx = 0;
        for (Node p = head; p != null; p = p.next, idx++) {
            if (p.next != null)
                System.out.println("  node #" + idx + ": data = " + p.data + ", next -> node #" + (idx + 1));
            else
                System.out.println("  node #" + idx + ": data = " + p.data + ", next -> NULL");
        }

        Node reached = head;
        int hops = 0;
        for (int h = 0; h < k; h++) { reached = reached.next; hops++; }
        System.out.println("linked access: reached node with data = " + reached.data + " after " + hops
                + " hop" + (hops == 1 ? "" : "s") + ". O(n).");
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 10 values, k = 4 (in the middle)
        int[] normal = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        runScenario("normal: 10 values, k = 4 (in the middle)", normal, 4);

        // hard: 16 values, k = 13 (near the end)
        int[] hard = {11, 22, 33, 44, 55, 66, 77, 88, 99, 111, 122, 133, 144, 155, 166, 177};
        runScenario("hard: 16 values, k = 13 (near the end)", hard, 13);

        // edge: k = 0, the first element
        int[] first = {7, 14, 21, 28, 35, 42, 49, 56, 63, 70};
        runScenario("edge: k = 0, the first element", first, 0);

        // edge: k = the last index, the most hops
        int[] last = {3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36};
        runScenario("edge: k = the last index, the most hops", last, 11);
    }
}
