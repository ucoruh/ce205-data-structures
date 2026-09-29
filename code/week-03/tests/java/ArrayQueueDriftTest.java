/* Unit tests for week-03 java/ArrayQueueDrift.java
 * This queue is deliberately naive (the drift bug is the lesson): once `rear` reaches
 * cap-1 it never comes back down, so the queue reports "full" even after elements
 * have been dequeued and slots at the front are wasted. */
public class ArrayQueueDriftTest {
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
        ArrayQueueDrift s = new ArrayQueueDrift();

        // -- empty: dequeue is a clean underflow --
        check(s.dequeue() == null, "dequeue empty");

        // -- single round trip --
        s = new ArrayQueueDrift();
        check(s.enqueue(7), "enqueue(7)");
        checkEq(s.dequeue(), 7, "dequeue -> 7");
        check(s.dequeue() == null, "empty again");

        // -- FIFO order --
        s = new ArrayQueueDrift();
        s.enqueue(10); s.enqueue(20); s.enqueue(30);
        checkEq(s.dequeue(), 10, "fifo 1"); checkEq(s.dequeue(), 20, "fifo 2"); checkEq(s.dequeue(), 30, "fifo 3");

        // -- "full" at rear == cap - 1 --
        s = new ArrayQueueDrift();
        s.cap = 4;
        s.enqueue(1); s.enqueue(2); s.enqueue(3); s.enqueue(4);
        checkEq(s.rear, 3, "rear at cap-1");
        check(!s.enqueue(5), "rejected at rear == cap-1");

        // -- the drift bug itself: dequeuing does not free rear-side space --
        s = new ArrayQueueDrift();
        s.cap = 4;
        s.enqueue(1); s.enqueue(2); s.enqueue(3); s.enqueue(4);
        checkEq(s.dequeue(), 1, "drift dequeue 1");
        checkEq(s.dequeue(), 2, "drift dequeue 2");
        check(!s.enqueue(99), "still rejected: this is the drift bug, not a fresh one");
        checkEq(s.front, 2, "front advanced");
        checkEq(s.rear, 3, "rear never moved back");
        checkEq(s.dequeue(), 3, "drift dequeue 3"); checkEq(s.dequeue(), 4, "drift dequeue 4");
        check(s.dequeue() == null, "genuinely empty now (front > rear)");

        // -- duplicates and negatives --
        s = new ArrayQueueDrift();
        s.enqueue(-8); s.enqueue(-8); s.enqueue(6);
        checkEq(s.dequeue(), -8, "dup 1"); checkEq(s.dequeue(), -8, "dup 2"); checkEq(s.dequeue(), 6, "dup 3");

        // -- extreme values --
        s = new ArrayQueueDrift();
        s.enqueue(Integer.MIN_VALUE); s.enqueue(Integer.MAX_VALUE);
        checkEq(s.dequeue(), Integer.MIN_VALUE, "extreme 1"); checkEq(s.dequeue(), Integer.MAX_VALUE, "extreme 2");

        // -- one-slot queue --
        s = new ArrayQueueDrift();
        s.cap = 1;
        check(s.enqueue(1), "enqueue 1-slot");
        check(!s.enqueue(2), "overflow 1-slot");
        checkEq(s.dequeue(), 1, "dequeue 1-slot");
        check(s.dequeue() == null, "underflow 1-slot");

        // -- integration --
        s = new ArrayQueueDrift();
        ArrayQueueDrift.Op[] tiny = {
            new ArrayQueueDrift.Op(false, 1), new ArrayQueueDrift.Op(false, 2),
            new ArrayQueueDrift.Op(true, 0), new ArrayQueueDrift.Op(true, 0), new ArrayQueueDrift.Op(true, 0)
        };
        s.runScenario("unit-test integration", 3, tiny);
        checkEq(s.front, 2, "integration final front");
        checkEq(s.rear, 1, "integration final rear");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
