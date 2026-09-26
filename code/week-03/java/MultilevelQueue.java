/* Week 3 -- Stacks and Queues
 * Multilevel queue scheduling: three priority classes, each its own FIFO queue.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;

public class MultilevelQueue {
    static class Process {
        String name;
        int level;
        Process(String name, int level) { this.name = name; this.level = level; }
    }

    List<Deque<Process>> q = List.of(new ArrayDeque<>(),
            new ArrayDeque<>(), new ArrayDeque<>()); // system, interactive, batch

    void admit(Process p) {
        q.get(p.level).addLast(p);        // each class has its own queue
    }

    Process pickNext() {
        for (int lvl = 0; lvl < 3; lvl++)  // highest priority first
            if (!q.get(lvl).isEmpty())
                return q.get(lvl).pollFirst();
        return null;                        // all queues are empty
    }

    static String levelName(int lvl) {
        return lvl == 0 ? "system" : lvl == 1 ? "interactive" : "batch";
    }

    void runScenario(String label, Process[] arrivals) {
        System.out.println("-- " + label + " --");
        for (Deque<Process> queue : q) queue.clear();

        for (Process p : arrivals) {
            admit(p);
            System.out.println("admit(" + p.name + ", " + levelName(p.level) + ")");
        }

        StringBuilder order = new StringBuilder("service order:");
        Process p;
        while ((p = pickNext()) != null)
            order.append(' ').append(p.name);
        System.out.println(order);
        System.out.println();
    }

    public static void main(String[] args) {
        MultilevelQueue sched = new MultilevelQueue();

        // normal: 12 processes, evenly spread across three classes
        Process[] normal = {
            new Process("P1", 1), new Process("P2", 2), new Process("P3", 0), new Process("P4", 1),
            new Process("P5", 0), new Process("P6", 2), new Process("P7", 0), new Process("P8", 1),
            new Process("P9", 2), new Process("P10", 0), new Process("P11", 1), new Process("P12", 2)
        };
        sched.runScenario("normal: 12 processes, evenly spread across three classes", normal);

        // hard: 16 processes, back-to-back bursts within each class
        Process[] hard = {
            new Process("P1", 1), new Process("P2", 1), new Process("P3", 1), new Process("P4", 1),
            new Process("P5", 0), new Process("P6", 0), new Process("P7", 0), new Process("P8", 0),
            new Process("P9", 2), new Process("P10", 2), new Process("P11", 2), new Process("P12", 2),
            new Process("P13", 1), new Process("P14", 1), new Process("P15", 1), new Process("P16", 1)
        };
        sched.runScenario("hard: 16 processes, back-to-back bursts within each class", hard);

        // edge: starvation risk -- 1 early batch process among 9 system+interactive ones
        Process[] edge = {
            new Process("P1", 0), new Process("P2", 2), new Process("P3", 1), new Process("P4", 0),
            new Process("P5", 1), new Process("P6", 0), new Process("P7", 1), new Process("P8", 0),
            new Process("P9", 1), new Process("P10", 0)
        };
        sched.runScenario("edge: starvation risk, 1 early batch process among 9 others", edge);
    }
}
