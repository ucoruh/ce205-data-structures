/* Week 3 -- Stacks and Queues
 * Linked-list stack: push and pop.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class LinkedStackPushPop {
    static class Node {
        int data;
        Node next;
    }
    Node top = null;           // empty stack

    static class Op {
        boolean isPop;
        int value;
        Op(boolean isPop, int value) { this.isPop = isPop; this.value = value; }
    }

    void push(int x) {
        Node n = new Node();
        n.data = x;
        n.next = top;
        top = n;
    }

    Integer pop() {
        if (top == null) return null;
        Node tmp = top;
        int out = tmp.data;
        top = top.next;
        // the garbage collector frees tmp
        return out;
    }

    void printStack() {
        StringBuilder sb = new StringBuilder("stack (top to bottom):");
        for (Node n = top; n != null; n = n.next)
            sb.append(' ').append(n.data);
        if (top == null)
            sb.append(" (empty)");
        System.out.println(sb);
    }

    void runScenario(String label, Op[] ops) {
        System.out.println("-- " + label + " --");
        top = null;   // start each scenario empty
        printStack();
        for (Op op : ops) {
            if (op.isPop) {
                Integer out = pop();
                if (out != null)
                    System.out.println("pop() -> true, out = " + out);
                else
                    System.out.println("pop() -> false (stack is empty)");
            } else {
                push(op.value);
                System.out.println("push(" + op.value + ")");
            }
            printStack();
        }
        System.out.println();
    }

    public static void main(String[] args) {
        LinkedStackPushPop s = new LinkedStackPushPop();

        // normal: 12 pushes, then 3 pops
        Op[] normal = {
            new Op(false, 12), new Op(false, 7), new Op(false, 25), new Op(false, 3), new Op(false, 18),
            new Op(false, 9), new Op(false, 30), new Op(false, 14), new Op(false, 5), new Op(false, 21),
            new Op(false, 16), new Op(false, 40), new Op(true, 0), new Op(true, 0), new Op(true, 0)
        };
        s.runScenario("normal: 12 pushes, then 3 pops", normal);

        // hard: pop every node one by one -- even the last one is popped
        Op[] hard = {
            new Op(false, 4), new Op(false, 15), new Op(false, 8), new Op(false, 23), new Op(false, 6),
            new Op(false, 31), new Op(false, 12), new Op(false, 27), new Op(false, 9), new Op(false, 18),
            new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0),
            new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0), new Op(true, 0)
        };
        s.runScenario("hard: pop every node one by one (10 pushes, 10 pops)", hard);

        // edge: pop on an empty stack, then 10 pushes
        Op[] edge = {
            new Op(true, 0), new Op(false, 7), new Op(false, 19), new Op(false, 3), new Op(false, 26),
            new Op(false, 14), new Op(false, 8), new Op(false, 31), new Op(false, 22), new Op(false, 5), new Op(false, 17), new Op(true, 0)
        };
        s.runScenario("edge: pop on an empty stack, then 10 pushes", edge);
    }
}
