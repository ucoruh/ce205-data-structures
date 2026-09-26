/* Week 3 -- Stacks and Queues
 * Array-backed stack: overflow and underflow.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class ArrayStackOverflow {
    static final int MAX_CAP = 10;
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

    void runScenario(String label, int scenarioCap, Op[] ops) {
        System.out.println("-- " + label + " --");
        top = -1;
        cap = scenarioCap;
        for (Op op : ops) {
            if (op.isPop) {
                Integer out = pop();
                if (out != null)
                    System.out.println("pop() -> true, out = " + out);
                else
                    System.out.println("pop() -> false  (UNDERFLOW: the stack is empty)");
            } else {
                boolean ok = push(op.value);
                System.out.print("push(" + op.value + ") -> " + ok);
                if (!ok)
                    System.out.print("  (OVERFLOW: the stack is full)");
                System.out.println();
            }
        }
        System.out.println();
    }

    public static void main(String[] args) {
        ArrayStackOverflow s = new ArrayStackOverflow();

        // normal: 11 pushes into a 10-cell stack -- overflow on the last one
        Op[] normal = {
            new Op(false, 4), new Op(false, 15), new Op(false, 8), new Op(false, 23), new Op(false, 6),
            new Op(false, 31), new Op(false, 12), new Op(false, 27), new Op(false, 9), new Op(false, 18), new Op(false, 40)
        };
        s.runScenario("normal: 11 pushes into a 10-cell stack (overflow)", 10, normal);

        // hard: 10 pushes, then 13 pops -- underflow after draining
        Op[] hard = {
            new Op(false, 7), new Op(false, 19), new Op(false, 3), new Op(false, 26), new Op(false, 14),
            new Op(false, 8), new Op(false, 31), new Op(false, 22), new Op(false, 5), new Op(false, 17),
            new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0),
            new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0)
        };
        s.runScenario("hard: 10 pushes, then 13 pops (underflow after draining)", 10, hard);

        // edge: both failures in one run on a small stack (cap 6)
        Op[] edge = {
            new Op(false, 3), new Op(false, 9), new Op(false, 14), new Op(false, 2), new Op(false, 21), new Op(false, 6),
            new Op(false, 17), new Op(false, 8), new Op(false, 25), new Op(false, 11),
            new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0)
        };
        s.runScenario("edge: overflow and underflow in one run (cap 6)", 6, edge);
    }
}
