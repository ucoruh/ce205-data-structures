// Unit tests for code/week-02/java/SinglyReverse.java: reverse().
// Independent oracle: the expected reversed content is the input array read backwards (hand-indexed),
// never produced by calling reverse() a second time to "check itself".
public class SinglyReverseTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void assertList(String label, SinglyReverse.Node head, int[] expected) {
        SinglyReverse.Node cur = head;
        for (int i = 0; i < expected.length; i++) {
            if (cur == null) { check(false, label + ": list too short at " + i); return; }
            check(cur.data == expected[i], label + ": node " + i + " (got " + cur.data + ", expected " + expected[i] + ")");
            cur = cur.next;
        }
        check(cur == null, label + ": list longer than expected");
    }

    public static void main(String[] args) {
        int[] normal = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        SinglyReverse.Node h1 = SinglyReverse.buildList(normal);
        h1 = SinglyReverse.reverse(h1);
        assertList("normal reversed", h1, new int[]{100, 90, 80, 70, 60, 50, 40, 30, 20, 10});
        h1 = SinglyReverse.reverse(h1);
        assertList("double reverse restores original", h1, normal);

        SinglyReverse.Node h2 = SinglyReverse.buildList(new int[]{5, -3, 5, 0, -3, 8});
        h2 = SinglyReverse.reverse(h2);
        assertList("hard reversed", h2, new int[]{8, -3, 0, 5, -3, 5});

        SinglyReverse.Node h3 = SinglyReverse.reverse(null);
        check(h3 == null, "empty list reversed is null");

        SinglyReverse.Node h4 = SinglyReverse.buildList(new int[]{7});
        h4 = SinglyReverse.reverse(h4);
        assertList("single node reversed", h4, new int[]{7});

        SinglyReverse.Node h5 = SinglyReverse.buildList(new int[]{1, 2});
        h5 = SinglyReverse.reverse(h5);
        assertList("two nodes reversed", h5, new int[]{2, 1});

        SinglyReverse.Node h6 = SinglyReverse.buildList(new int[]{Integer.MAX_VALUE, 0, Integer.MIN_VALUE});
        h6 = SinglyReverse.reverse(h6);
        assertList("extreme values reversed", h6, new int[]{Integer.MIN_VALUE, 0, Integer.MAX_VALUE});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
