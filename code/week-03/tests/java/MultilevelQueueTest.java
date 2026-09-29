/* Unit tests for week-03 java/MultilevelQueue.java */
public class MultilevelQueueTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(Object actual, Object expected, String label) {
        checks++;
        boolean eq = (actual == null) ? (expected == null) : actual.equals(expected);
        if (!eq) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) {
        MultilevelQueue sched = new MultilevelQueue();

        // -- everything empty: pickNext returns null, not a crash --
        check(sched.pickNext() == null, "pickNext on empty");

        // -- one process, level 0 --
        sched = new MultilevelQueue();
        sched.admit(new MultilevelQueue.Process("P1", 0));
        MultilevelQueue.Process p = sched.pickNext();
        check(p != null, "pickNext returns a process");
        checkEq(p.name, "P1", "picked name");
        checkEq(p.level, 0, "picked level");
        check(sched.pickNext() == null, "drained: nothing left");

        // -- priority ordering regardless of admission order --
        sched = new MultilevelQueue();
        sched.admit(new MultilevelQueue.Process("B", 2));
        sched.admit(new MultilevelQueue.Process("I", 1));
        sched.admit(new MultilevelQueue.Process("S", 0));
        checkEq(sched.pickNext().name, "S", "priority 1st");
        checkEq(sched.pickNext().name, "I", "priority 2nd");
        checkEq(sched.pickNext().name, "B", "priority 3rd");

        // -- FIFO within one level --
        sched = new MultilevelQueue();
        sched.admit(new MultilevelQueue.Process("P1", 1));
        sched.admit(new MultilevelQueue.Process("P2", 1));
        sched.admit(new MultilevelQueue.Process("P3", 1));
        checkEq(sched.pickNext().name, "P1", "fifo 1");
        checkEq(sched.pickNext().name, "P2", "fifo 2");
        checkEq(sched.pickNext().name, "P3", "fifo 3");

        // -- a fresh higher-priority arrival still cuts in front of older lower-level work --
        sched = new MultilevelQueue();
        sched.admit(new MultilevelQueue.Process("Sys1", 0));
        sched.admit(new MultilevelQueue.Process("Batch1", 2));
        checkEq(sched.pickNext().name, "Sys1", "system first");
        sched.admit(new MultilevelQueue.Process("Sys2", 0));
        checkEq(sched.pickNext().name, "Sys2", "fresh system still cuts ahead of batch");
        checkEq(sched.pickNext().name, "Batch1", "batch only once system/interactive are empty");

        // -- levelName covers all three classes --
        checkEq(MultilevelQueue.levelName(0), "system", "levelName 0");
        checkEq(MultilevelQueue.levelName(1), "interactive", "levelName 1");
        checkEq(MultilevelQueue.levelName(2), "batch", "levelName 2");

        // -- no fixed-capacity overflow risk: the Java version uses ArrayDeque, which
        //    grows, unlike the C version's fixed QCAP ring buffer -- admitting many
        //    more than any C preset ever does must still come back out in full, FIFO --
        sched = new MultilevelQueue();
        int n = 100;
        for (int i = 0; i < n; i++) sched.admit(new MultilevelQueue.Process("Q" + i, 0));
        int served = 0;
        MultilevelQueue.Process out;
        while ((out = sched.pickNext()) != null) {
            checkEq(out.name, "Q" + served, "large-batch fifo order");
            served++;
        }
        checkEq(served, n, "large-batch total served");

        // -- integration: runScenario clears every level itself --
        sched = new MultilevelQueue();
        MultilevelQueue.Process[] tiny = {
            new MultilevelQueue.Process("X1", 0), new MultilevelQueue.Process("X2", 1), new MultilevelQueue.Process("X3", 2)
        };
        sched.runScenario("unit-test integration", tiny);
        check(sched.pickNext() == null, "integration drains everything");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
