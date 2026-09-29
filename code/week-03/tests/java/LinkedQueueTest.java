/* Unit tests for week-03 java/LinkedQueue.java */
public class LinkedQueueTest {
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
        LinkedQueue q = new LinkedQueue();

        // -- empty: dequeue is a clean underflow --
        check(q.front == null && q.rear == null, "fresh queue empty");
        check(q.dequeue() == null, "dequeue empty");

        // -- single round trip; rear resets to null too --
        q.enqueue(42);
        check(q.front == q.rear, "one node: front == rear");
        checkEq(q.dequeue(), 42, "dequeue -> 42");
        check(q.front == null && q.rear == null, "both reset after draining");

        // -- FIFO order --
        q.enqueue(10); q.enqueue(20); q.enqueue(30);
        checkEq(q.dequeue(), 10, "fifo 1"); checkEq(q.dequeue(), 20, "fifo 2"); checkEq(q.dequeue(), 30, "fifo 3");
        check(q.front == null && q.rear == null, "empty after fifo drain");

        // -- duplicates and negatives --
        q.enqueue(-4); q.enqueue(-4); q.enqueue(9);
        checkEq(q.dequeue(), -4, "dup 1"); checkEq(q.dequeue(), -4, "dup 2"); checkEq(q.dequeue(), 9, "dup 3");

        // -- extreme values --
        q.enqueue(Integer.MIN_VALUE); q.enqueue(Integer.MAX_VALUE);
        checkEq(q.dequeue(), Integer.MIN_VALUE, "extreme 1"); checkEq(q.dequeue(), Integer.MAX_VALUE, "extreme 2");

        // -- unbounded stress, in FIFO order --
        for (int i = 0; i < 500; i++) q.enqueue(i);
        int count = 0;
        while (q.front != null) { checkEq(q.dequeue(), count, "stress fifo order"); count++; }
        checkEq(count, 500, "stress count");

        // -- draining to empty then restarting works --
        q.enqueue(1); q.enqueue(2);
        q.dequeue(); q.dequeue();
        check(q.front == null && q.rear == null, "empty before restart");
        q.enqueue(99);
        check(q.front == q.rear, "restart: one node again");
        checkEq(q.dequeue(), 99, "restart dequeue");

        // -- integration --
        LinkedQueue.Op[] tiny = {
            new LinkedQueue.Op(false, 1), new LinkedQueue.Op(false, 2),
            new LinkedQueue.Op(true, 0), new LinkedQueue.Op(true, 0)
        };
        q.runScenario("unit-test integration", tiny);
        check(q.front == null && q.rear == null, "integration ends empty");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
