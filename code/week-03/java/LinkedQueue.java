/* Week 3 -- Stacks and Queues
 * Linked-list queue: enqueue and dequeue.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class LinkedQueue {
    static class QNode {
        int data;
        QNode next;
    }
    QNode front = null, rear = null;      // empty queue

    static class Op {
        boolean isDeq;
        int value;
        Op(boolean isDeq, int value) { this.isDeq = isDeq; this.value = value; }
    }

    void enqueue(int x) {
        QNode n = new QNode();
        n.data = x; n.next = null;
        if (rear == null) front = rear = n;   // first node
        else { rear.next = n; rear = n; }
    }

    Integer dequeue() {
        if (front == null) return null;    // underflow
        QNode tmp = front;
        int out = tmp.data;
        front = front.next;
        if (front == null) rear = null;    // became empty
        return out;
    }

    void runScenario(String label, Op[] ops) {
        System.out.println("-- " + label + " --");
        front = null; rear = null;   // start each scenario empty
        for (Op op : ops) {
            if (op.isDeq) {
                Integer out = dequeue();
                if (out != null)
                    System.out.println("dequeue() -> true, out = " + out);
                else
                    System.out.println("dequeue() -> false (queue is empty)");
            } else {
                enqueue(op.value);
                System.out.println("enqueue(" + op.value + ")");
            }
        }
        System.out.println();
    }

    public static void main(String[] args) {
        LinkedQueue q = new LinkedQueue();

        // normal: 12 enqueues, 3 dequeues along the way
        Op[] normal = {
            new Op(false, 15), new Op(false, 23), new Op(false, 8), new Op(false, 42), new Op(false, 19), new Op(true, 0),
            new Op(false, 31), new Op(false, 7), new Op(false, 56), new Op(true, 0),
            new Op(false, 12), new Op(false, 44), new Op(true, 0), new Op(false, 9), new Op(false, 27)
        };
        q.runScenario("normal: 12 enqueues, 3 dequeues along the way", normal);

        // hard: 17 enqueues, 3 dequeues
        Op[] hard = {
            new Op(false, 5), new Op(false, 12), new Op(false, 33), new Op(false, 8), new Op(false, 19), new Op(true, 0),
            new Op(false, 27), new Op(false, 41), new Op(false, 3), new Op(false, 55), new Op(false, 16), new Op(true, 0),
            new Op(false, 38), new Op(false, 9), new Op(false, 22), new Op(false, 47), new Op(false, 14), new Op(true, 0),
            new Op(false, 6), new Op(false, 29)
        };
        q.runScenario("hard: 17 enqueues, 3 dequeues", hard);

        // edge: drain to empty -- rear becomes null too, then it restarts
        Op[] edge = {
            new Op(false, 10), new Op(false, 20), new Op(false, 30), new Op(false, 40), new Op(false, 50),
            new Op(false, 60), new Op(false, 70), new Op(false, 80), new Op(false, 90), new Op(false, 100),
            new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0),
            new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0),
            new Op(false, 999)
        };
        q.runScenario("edge: drain to empty, then restart", edge);
    }
}
