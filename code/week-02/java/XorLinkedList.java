/* Week 2 -- Linked Lists, Arrays and Matrices
 * XOR linked list: one field, npx, holds XOR(prev, next) instead of two
 * separate pointers. Java has no pointer arithmetic: each node's "address"
 * is its index in a small pool array. Matches the xor-linked-list.js
 * animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class XorLinkedList {
    static final int NONE = 0;   // 0 means "no node" (real nodes live at indices 1..n)
    static class Node { int data; int npx; }   // XOR of the POOL INDEX of prev and of next
    static Node[] pool = new Node[100];
    static int count = 0;

    static int allocate(int value) {
        count++;
        pool[count] = new Node();
        pool[count].data = value;
        return count;
    }

    static int insertHead(int head, int[] tail, int value) {
        int n = allocate(value);
        pool[n].npx = NONE ^ head;                 // prev = NONE, next = old head
        if (head != NONE) {
            int headNext = pool[head].npx ^ NONE;  // old head's prev was NONE
            pool[head].npx = n ^ headNext;         // old head's prev becomes n
        } else tail[0] = n;                        // first node is both head and tail
        return n;
    }

    static int insertTail(int[] head, int tail, int value) {
        int n = allocate(value);
        pool[n].npx = tail ^ NONE;                 // prev = old tail, next = NONE
        if (tail != NONE) {
            int tailNext = pool[tail].npx ^ NONE;  // old tail's next was NONE
            pool[tail].npx = n ^ tailNext;         // old tail's next becomes n
        } else head[0] = n;                        // first node is both head and tail
        return n;
    }

    static void traverseForward(int head, StringBuilder out) {
        int prev = NONE, cur = head;
        while (cur != NONE) {
            out.append(' ').append(pool[cur].data);
            int next = pool[cur].npx ^ prev;
            prev = cur; cur = next;
        }
    }

    static void traverseBackward(int tail, StringBuilder out) {
        int next = NONE, cur = tail;
        while (cur != NONE) {
            out.append(' ').append(pool[cur].data);
            int prev = pool[cur].npx ^ next;
            next = cur; cur = prev;
        }
    }

    // tokens: a plain number is insertHead(value); "tV" is insertTail(value)
    static void runScenario(String label, String[] ops) {
        System.out.println("-- " + label + " --");
        int[] head = {NONE}, tail = {NONE};
        for (String op : ops) {
            if (op.charAt(0) == 't') {
                int v = Integer.parseInt(op.substring(1));
                int n = insertTail(head, tail[0], v);
                tail[0] = n;
                System.out.println("insert_tail(" + v + ")");
            } else {
                int v = Integer.parseInt(op);
                int n = insertHead(head[0], tail, v);
                head[0] = n;
                System.out.println("insert_head(" + v + ")");
            }
        }
        StringBuilder fwd = new StringBuilder("forward: ");
        traverseForward(head[0], fwd);
        System.out.println(fwd);
        StringBuilder bwd = new StringBuilder("backward:");
        traverseBackward(tail[0], bwd);
        System.out.println(bwd);
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 10 nodes, inserted one by one with insert_head
        String[] normal = {"100", "90", "80", "70", "60", "50", "40", "30", "20", "10"};
        runScenario("normal: 10 nodes, inserted one by one with insert_head", normal);

        // hard: 12 nodes (duplicates/negatives)
        String[] hard = {"-100", "100", "-3", "2", "-1", "8", "8", "-3", "0", "5", "-3", "5"};
        runScenario("hard: 12 nodes (duplicates/negatives)", hard);

        // edge: 10 nodes, inserted one by one with insert_tail (FIFO order)
        String[] tailBasic = {"t10", "t20", "t30", "t40", "t50", "t60", "t70", "t80", "t90", "t100"};
        runScenario("edge: 10 nodes, inserted one by one with insert_tail (FIFO order)", tailBasic);

        // edge: 12 nodes, mixing insert_head and insert_tail
        String[] mixed = {"10", "t20", "30", "t40", "50", "t60", "70", "t80", "90", "t100", "110", "t120"};
        runScenario("edge: 12 nodes, mixing insert_head and insert_tail", mixed);
    }
}
