/* Week 3 -- Stacks and Queues
 * Array-backed stack: push and pop.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class ArrayStackPushPop {
    static final int MAX_CAP = 12;
    int[] data = new int[MAX_CAP];
    int top = -1;           // empty stack
    int cap = MAX_CAP;       // capacity used by the current scenario

    static class Op {
        boolean isPop;
        int value;
        Op(boolean isPop, int value) { this.isPop = isPop; this.value = value; }
    }

    boolean push(int x) {
        if (top == cap - 1)  // full?
            return false;    // overflow
        top = top + 1;
        data[top] = x;
        return true;
    }

    Integer pop() {
        if (top == -1)       // empty?
            return null;     // underflow
        int out = data[top];
        top = top - 1;
        return out;
    }

    void printStack() {
        StringBuilder sb = new StringBuilder("stack (bottom to top):");
        for (int i = 0; i <= top; i++)
            sb.append(' ').append(data[i]);
        if (top == -1)
            sb.append(" (empty)");
        sb.append("  [top = ").append(top).append(']');
        System.out.println(sb);
    }

    void runScenario(String label, int scenarioCap, Op[] ops) {
        System.out.println("-- " + label + " --");
        top = -1;
        cap = scenarioCap;
        printStack();
        for (Op op : ops) {
            if (op.isPop) {
                Integer out = pop();
                if (out != null)
                    System.out.println("pop() -> true, out = " + out);
                else
                    System.out.println("pop() -> false (stack is empty)");
            } else {
                boolean ok = push(op.value);
                System.out.println("push(" + op.value + ") -> " + ok);
            }
            printStack();
        }
        System.out.println();
    }

    public static void main(String[] args) {
        ArrayStackPushPop s = new ArrayStackPushPop();

        // normal: 10 pushes, then 4 pops
        Op[] normal = {
            new Op(false, 12), new Op(false, 7), new Op(false, 25), new Op(false, 3), new Op(false, 18),
            new Op(false, 9), new Op(false, 30), new Op(false, 14), new Op(false, 5), new Op(false, 21),
            new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0)
        };
        s.runScenario("normal: 10 pushes, then 4 pops (cap 12)", 12, normal);

        // hard: 18 mixed operations
        Op[] hard = {
            new Op(false, 40), new Op(false, 11), new Op(true, 0), new Op(false, 27), new Op(false, 8),
            new Op(false, 33), new Op(true, 0), new Op(true, 0), new Op(false, 16), new Op(false, 2),
            new Op(false, 45), new Op(false, 19), new Op(true, 0), new Op(false, 7), new Op(false, 38),
            new Op(false, 23), new Op(false, 10), new Op(true, 0)
        };
        s.runScenario("hard: 18 mixed operations (cap 12)", 12, hard);

        // edge: overflow -- 11 pushes into a 10-cell stack
        Op[] edge = {
            new Op(false, 4), new Op(false, 15), new Op(false, 8), new Op(false, 16), new Op(false, 23),
            new Op(false, 42), new Op(false, 11), new Op(false, 6), new Op(false, 29), new Op(false, 37),
            new Op(false, 50), new Op(true, 0)
        };
        s.runScenario("edge: overflow, 11 pushes into a 10-cell stack (cap 10)", 10, edge);
    }
}
