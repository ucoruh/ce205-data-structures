/* Week 3 -- Stacks and Queues
 * Circular queue: index arithmetic wraps with (i + 1) % cap.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class CircularQueue {
    static final int MAX_CAP = 12;
    int[] q = new int[MAX_CAP];
    int front = 0, rear = -1, count = 0;
    int cap = MAX_CAP;           // capacity used by the current scenario

    static class Op {
        boolean isDeq;
        int value;
        Op(boolean isDeq, int value) { this.isDeq = isDeq; this.value = value; }
    }

    boolean enqueue(int x) {
        if (count == cap)          // full?
            return false;          // overflow
        rear = (rear + 1) % cap;   // wrap around
        q[rear] = x;
        count++;
        return true;
    }

    Integer dequeue() {
        if (count == 0)            // empty?
            return null;           // underflow
        int out = q[front];
        front = (front + 1) % cap;
        count--;
        return out;
    }

    void printState() {
        System.out.println("front = " + front + ", rear = " + rear + ", count = " + count);
    }

    void runScenario(String label, int scenarioCap, Op[] ops) {
        System.out.println("-- " + label + " --");
        front = 0; rear = -1; count = 0; cap = scenarioCap;
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
        CircularQueue s = new CircularQueue();

        // normal: moderate mixing in 10 cells, one wrap-around
        Op[] normal = {
            new Op(false, 4), new Op(false, 15), new Op(false, 8), new Op(false, 23), new Op(false, 6), new Op(false, 31),
            new Op(true, 0), new Op(true, 0), new Op(true, 0),
            new Op(false, 12), new Op(false, 27), new Op(false, 9), new Op(false, 18), new Op(false, 33)
        };
        s.runScenario("normal: moderate mixing in 10 cells, one wrap-around (cap 10)", 10, normal);

        // hard: long mixing in 9 cells, several wrap-arounds
        Op[] hard = {
            new Op(false, 7), new Op(false, 19), new Op(false, 3), new Op(false, 26), new Op(true, 0), new Op(true, 0),
            new Op(false, 11), new Op(false, 34), new Op(false, 8), new Op(false, 22), new Op(true, 0), new Op(true, 0), new Op(true, 0),
            new Op(false, 15), new Op(false, 29), new Op(false, 6), new Op(false, 17), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0),
            new Op(false, 21), new Op(false, 9), new Op(false, 32)
        };
        s.runScenario("hard: long mixing in 9 cells, several wrap-arounds (cap 9)", 9, hard);

        // edge: completely full, a real overflow
        Op[] edge = {
            new Op(false, 5), new Op(false, 13), new Op(false, 8), new Op(false, 21), new Op(false, 34),
            new Op(false, 2), new Op(false, 17), new Op(false, 29), new Op(false, 41), new Op(false, 50)
        };
        s.runScenario("edge: completely full, a real overflow (cap 8)", 8, edge);
    }
}
