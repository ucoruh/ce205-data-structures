/* Unit tests for week-03 java/DequeDemo.java
 * The Java version only exposes runToken(String) (push_back/push_front/pop_back/
 * pop_front have no separate public entry points), so these tests drive it the same
 * way the program's own main() does, and inspect the underlying ArrayDeque `d`. */
public class DequeDemoTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) {
        DequeDemo demo = new DequeDemo();

        // -- empty deque: both ends report underflow cleanly (no exception escapes) --
        check(demo.d.isEmpty(), "fresh deque empty");
        demo.runToken("pb");
        demo.runToken("pf");
        check(demo.d.isEmpty(), "still empty after both-ends underflow");

        // -- push_back then pop_back: round trip --
        demo.runToken("5");
        checkEq(demo.d.peekLast(), 5, "push_back(5) at back");
        demo.runToken("pb");
        check(demo.d.isEmpty(), "empty after pop_back");

        // -- push_front then pop_front: round trip --
        demo.runToken("f6");
        checkEq(demo.d.peekFirst(), 6, "push_front(6) at front");
        demo.runToken("pf");
        check(demo.d.isEmpty(), "empty after pop_front");

        // -- two pushes at the back, remove from the front (FIFO-style) --
        demo.runToken("1"); demo.runToken("2");
        checkEq(demo.d.peekFirst(), 1, "front after two push_back");
        demo.runToken("pf"); demo.runToken("pb");
        check(demo.d.isEmpty(), "empty again");

        // -- two pushes at the front: LIFO-style at that end --
        demo.runToken("f1"); demo.runToken("f2");   // front to back: 2, 1
        Object[] arr = demo.d.toArray();
        checkEq((Integer) arr[0], 2, "front-to-back[0] after two push_front");
        checkEq((Integer) arr[1], 1, "front-to-back[1] after two push_front");
        demo.runToken("pf"); demo.runToken("pf");

        // -- mixed ends, independent hand trace:
        //    push_back(1) -> [1]; push_front(2) -> [2,1]; push_back(3) -> [2,1,3]
        //    pop_front -> 2, leaves [1,3]; pop_back -> 3, leaves [1]; pop_front -> 1 --
        demo.runToken("1"); demo.runToken("f2"); demo.runToken("3");
        checkEq(demo.d.pollFirst(), 2, "mixed pop_front -> 2");
        checkEq(demo.d.pollLast(), 3, "mixed pop_back -> 3");
        checkEq(demo.d.pollFirst(), 1, "mixed pop_front -> 1");
        check(demo.d.isEmpty(), "empty after mixed trace");

        // -- negative values --
        demo.runToken("-7"); demo.runToken("f-9");
        checkEq(demo.d.peekFirst(), -9, "negative at front");
        checkEq(demo.d.peekLast(), -7, "negative at back");
        demo.runToken("pf"); demo.runToken("pb");

        // -- extreme values at both ends --
        demo.runToken(String.valueOf(Integer.MIN_VALUE));
        demo.runToken("f" + Integer.MAX_VALUE);
        checkEq(demo.d.peekFirst(), Integer.MAX_VALUE, "extreme at front");
        checkEq(demo.d.peekLast(), Integer.MIN_VALUE, "extreme at back");
        demo.runToken("pf"); demo.runToken("pb");

        // -- integration: runScenario clears the deque itself and includes an
        //    underflow at both ends --
        String[] tiny = {"pb", "pf", "1", "f2", "pb", "pf"};
        demo.runScenario("unit-test integration", tiny);
        check(demo.d.isEmpty(), "integration ends empty");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
