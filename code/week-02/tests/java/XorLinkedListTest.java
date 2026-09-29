// Unit tests for code/week-02/java/XorLinkedList.java: insertHead(), insertTail().
// Independent oracle: the expected forward/backward VALUE sequences are hand-derived from insertHead =
// LIFO / insertTail = FIFO semantics, computed before any call into the program. Reading the sequence back
// out of the XOR-encoded chain necessarily XORs npx with a known neighbor (there is no other way to recover
// "next" from a single combined field) -- the checked VALUES are the independent part.
public class XorLinkedListTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static int[] walkForward(int head) {
        int[] out = new int[32];
        int n = 0, prev = XorLinkedList.NONE, cur = head;
        while (cur != XorLinkedList.NONE) {
            out[n++] = XorLinkedList.pool[cur].data;
            int next = XorLinkedList.pool[cur].npx ^ prev;
            prev = cur; cur = next;
        }
        return java.util.Arrays.copyOf(out, n);
    }

    static int[] walkBackward(int tail) {
        int[] out = new int[32];
        int n = 0, next = XorLinkedList.NONE, cur = tail;
        while (cur != XorLinkedList.NONE) {
            out[n++] = XorLinkedList.pool[cur].data;
            int prev = XorLinkedList.pool[cur].npx ^ next;
            next = cur; cur = prev;
        }
        return java.util.Arrays.copyOf(out, n);
    }

    static void assertSequence(String label, int[] actual, int[] expected) {
        check(actual.length == expected.length, label + ": length (got " + actual.length + ", expected " + expected.length + ")");
        for (int i = 0; i < Math.min(actual.length, expected.length); i++)
            check(actual[i] == expected[i], label + ": [" + i + "] (got " + actual[i] + ", expected " + expected[i] + ")");
    }

    public static void main(String[] args) {
        int head = XorLinkedList.NONE, tail = XorLinkedList.NONE;
        int[] tailBox = {tail};
        int n1 = XorLinkedList.insertHead(head, tailBox, 10); head = n1; tail = tailBox[0];
        int n2 = XorLinkedList.insertHead(head, tailBox, 20); head = n2; tail = tailBox[0];
        int n3 = XorLinkedList.insertHead(head, tailBox, 30); head = n3; tail = tailBox[0];
        assertSequence("insert_head forward (LIFO)", walkForward(head), new int[]{30, 20, 10});
        assertSequence("insert_head backward (insertion order)", walkBackward(tail), new int[]{10, 20, 30});
        check(head == n3, "head is last inserted"); check(tail == n1, "tail is first inserted");

        head = XorLinkedList.NONE; tail = XorLinkedList.NONE;
        int[] headBox = {head};
        int t1 = XorLinkedList.insertTail(headBox, tail, 1); tail = t1; head = headBox[0];
        int t2 = XorLinkedList.insertTail(headBox, tail, 2); tail = t2; head = headBox[0];
        int t3 = XorLinkedList.insertTail(headBox, tail, 3); tail = t3; head = headBox[0];
        assertSequence("insert_tail forward (FIFO)", walkForward(head), new int[]{1, 2, 3});
        assertSequence("insert_tail backward (reverse)", walkBackward(tail), new int[]{3, 2, 1});
        check(head == t1, "head is first inserted"); check(tail == t3, "tail is last inserted");

        head = XorLinkedList.NONE; tail = XorLinkedList.NONE; tailBox[0] = tail;
        int s = XorLinkedList.insertHead(head, tailBox, 77); head = s; tail = tailBox[0];
        check(head == tail, "single node: head == tail");
        assertSequence("single node forward", walkForward(head), new int[]{77});
        assertSequence("single node backward", walkBackward(tail), new int[]{77});

        head = XorLinkedList.NONE; tail = XorLinkedList.NONE; headBox[0] = head;
        int s2 = XorLinkedList.insertTail(headBox, tail, 88); tail = s2; head = headBox[0];
        check(head == tail, "single tail-inserted node: head == tail");
        assertSequence("single tail-inserted node", walkForward(head), new int[]{88});

        head = XorLinkedList.NONE; tail = XorLinkedList.NONE;
        tailBox[0] = tail; headBox[0] = head;
        int m = XorLinkedList.insertHead(head, tailBox, 5); head = m; tail = tailBox[0];
        headBox[0] = head;
        m = XorLinkedList.insertTail(headBox, tail, 6); tail = m; head = headBox[0];
        tailBox[0] = tail;
        m = XorLinkedList.insertHead(head, tailBox, 4); head = m; tail = tailBox[0];
        headBox[0] = head;
        m = XorLinkedList.insertTail(headBox, tail, 7); tail = m; head = headBox[0];
        assertSequence("mixed forward", walkForward(head), new int[]{4, 5, 6, 7});
        assertSequence("mixed backward", walkBackward(tail), new int[]{7, 6, 5, 4});

        head = XorLinkedList.NONE; tail = XorLinkedList.NONE; headBox[0] = head;
        m = XorLinkedList.insertTail(headBox, tail, -3); tail = m; head = headBox[0];
        headBox[0] = head;
        m = XorLinkedList.insertTail(headBox, tail, -3); tail = m; head = headBox[0];
        headBox[0] = head;
        m = XorLinkedList.insertTail(headBox, tail, 0); tail = m; head = headBox[0];
        assertSequence("duplicates/negatives forward", walkForward(head), new int[]{-3, -3, 0});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
