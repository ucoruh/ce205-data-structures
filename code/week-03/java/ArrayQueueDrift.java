/* Week 3 -- Stacks and Queues
 * Queue in a plain array and the drift problem.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class ArrayQueueDrift {
    static final int MAX_CAP = 12;
    int[] q = new int[MAX_CAP];
    int front = 0, rear = -1;
    int cap = MAX_CAP;          // capacity used by the current scenario

    static class Op {
        boolean isDeq;
        int value;
        Op(boolean isDeq, int value) { this.isDeq = isDeq; this.value = value; }
    }

    boolean enqueue(int x) {
        if (rear == cap - 1) return false;   // "full"?
        q[++rear] = x;
        return true;
    }

    Integer dequeue() {
        if (front > rear) return null;       // empty
        return q[front++];
    }

    void printState() {
        System.out.println("front = " + front + ", rear = " + rear);
    }

    void runScenario(String label, int scenarioCap, Op[] ops) {
        System.out.println("-- " + label + " --");
        front = 0; rear = -1; cap = scenarioCap;
        for (Op op : ops) {
            if (op.isDeq) {
                Integer out = dequeue();
                if (out != null)
                    System.out.println("dequeue() -> " + out);
                else
                    System.out.println("dequeue() -> false (queue is empty)");
            } else {
                boolean ok = enqueue(op.value);
                System.out.println("enqueue(" + op.value + ") -> " + ok);
            }
        }
        printState();
        System.out.println();
    }

    public static void main(String[] args) {
        ArrayQueueDrift s = new ArrayQueueDrift();

        // normal: fill 8 cells, remove 3, it still overflows (cap 8)
        Op[] normal = {
            new Op(false, 5), new Op(false, 12), new Op(false, 7), new Op(false, 19), new Op(false, 3),
            new Op(false, 27), new Op(false, 14), new Op(false, 8), new Op(true, 0), new Op(true, 0), new Op(true, 0),
            new Op(false, 99), new Op(false, 42)
        };
        s.runScenario("normal: fill 8 cells, remove 3, it still overflows (cap 8)", 8, normal);

        // hard: 15 mixed operations, drift builds up gradually (cap 6)
        Op[] hard = {
            new Op(false, 3), new Op(false, 8), new Op(false, 12), new Op(true, 0), new Op(false, 15), new Op(true, 0),
            new Op(false, 22), new Op(false, 6), new Op(true, 0), new Op(false, 31), new Op(true, 0), new Op(true, 0),
            new Op(false, 99), new Op(false, 44), new Op(false, 77)
        };
        s.runScenario("hard: 15 mixed operations, drift builds up gradually (cap 6)", 6, hard);

        // edge: dequeue on an empty queue, then 10 enqueues (cap 12)
        Op[] edge = {
            new Op(true, 0), new Op(true, 0), new Op(false, 5), new Op(false, 11), new Op(false, 3), new Op(false, 18),
            new Op(false, 9), new Op(false, 24), new Op(false, 7), new Op(false, 15), new Op(false, 2), new Op(false, 30),
            new Op(true, 0), new Op(true, 0)
        };
        s.runScenario("edge: dequeue on an empty queue, then 10 enqueues (cap 12)", 12, edge);
    }
}
