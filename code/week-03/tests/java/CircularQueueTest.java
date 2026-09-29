/* Unit tests for week-03 java/CircularQueue.java
 * Extra focus: the full/empty distinction, since front == rear can happen at BOTH
 * states -- count is what must tell them apart. */
public class CircularQueueTest {
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
        CircularQueue s = new CircularQueue();

        // -- empty: dequeue is a clean underflow --
        checkEq(s.count, 0, "fresh count");
        check(s.dequeue() == null, "dequeue empty");

        // -- single round trip --
        s = new CircularQueue();
        check(s.enqueue(7), "enqueue(7)");
        checkEq(s.count, 1, "count after enqueue");
        checkEq(s.dequeue(), 7, "dequeue -> 7");
        checkEq(s.count, 0, "count after dequeue");

        // -- FIFO order --
        s = new CircularQueue();
        s.enqueue(10); s.enqueue(20); s.enqueue(30);
        checkEq(s.dequeue(), 10, "fifo 1"); checkEq(s.dequeue(), 20, "fifo 2"); checkEq(s.dequeue(), 30, "fifo 3");

        // -- overflow: fill a 4-slot queue exactly --
        s = new CircularQueue();
        s.cap = 4;
        check(s.enqueue(1) && s.enqueue(2) && s.enqueue(3) && s.enqueue(4), "fill 4 slots");
        checkEq(s.count, 4, "count full");
        check(!s.enqueue(5), "5th enqueue rejected");
        checkEq(s.count, 4, "count unchanged after overflow");

        // -- wraparound stays FIFO: six enqueues (with two dequeues forcing a wrap) --
        s = new CircularQueue();
        s.cap = 4;
        s.enqueue(1); s.enqueue(2); s.enqueue(3); s.enqueue(4);
        checkEq(s.dequeue(), 1, "wrap 1"); checkEq(s.dequeue(), 2, "wrap 2");
        s.enqueue(5); s.enqueue(6);
        checkEq(s.count, 4, "count full again after wrap");
        checkEq(s.dequeue(), 3, "wrap 3"); checkEq(s.dequeue(), 4, "wrap 4");
        checkEq(s.dequeue(), 5, "wrap 5"); checkEq(s.dequeue(), 6, "wrap 6");
        checkEq(s.count, 0, "count empty after full drain");
        check(s.dequeue() == null, "underflow again");

        // -- the full/empty ambiguity, unmistakable with a 1-slot queue: front == rear
        //    both when FULL (count 1) and when EMPTY (count 0) right after -- only
        //    count can tell them apart --
        s = new CircularQueue();
        s.cap = 1;
        check(s.enqueue(99), "enqueue into 1-slot");
        checkEq(s.front, s.rear, "indices coincide (full)");
        checkEq(s.count, 1, "count says FULL");
        check(!s.enqueue(100), "overflow 1-slot");
        checkEq(s.dequeue(), 99, "dequeue 1-slot");
        checkEq(s.front, s.rear, "indices coincide again (empty)");
        checkEq(s.count, 0, "count says EMPTY");
        check(s.dequeue() == null, "underflow 1-slot");
        check(s.enqueue(101), "1-slot reusable");
        checkEq(s.dequeue(), 101, "final dequeue 1-slot");

        // -- duplicates and negatives keep FIFO order --
        s = new CircularQueue();
        s.enqueue(-3); s.enqueue(-3); s.enqueue(5);
        checkEq(s.dequeue(), -3, "dup 1"); checkEq(s.dequeue(), -3, "dup 2"); checkEq(s.dequeue(), 5, "dup 3");

        // -- extreme values --
        s = new CircularQueue();
        s.enqueue(Integer.MIN_VALUE); s.enqueue(Integer.MAX_VALUE);
        checkEq(s.dequeue(), Integer.MIN_VALUE, "extreme 1"); checkEq(s.dequeue(), Integer.MAX_VALUE, "extreme 2");

        // -- integration: runScenario resets front/rear/count itself --
        s = new CircularQueue();
        CircularQueue.Op[] tiny = {
            new CircularQueue.Op(false, 1), new CircularQueue.Op(false, 2),
            new CircularQueue.Op(true, 0), new CircularQueue.Op(true, 0), new CircularQueue.Op(true, 0)
        };
        s.runScenario("unit-test integration", 5, tiny);
        checkEq(s.count, 0, "integration final count");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
