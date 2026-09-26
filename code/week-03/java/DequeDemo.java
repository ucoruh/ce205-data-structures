/* Week 3 -- Stacks and Queues
 * Double-ended queue (deque): push/pop at both front and back.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
import java.util.ArrayDeque;
import java.util.Deque;

public class DequeDemo {
    Deque<Integer> d = new ArrayDeque<>();   // empty deque

    // "10" / "-3" -> push_back; "f5" / "f-3" -> push_front; "pb" -> pop_back; "pf" -> pop_front.
    void runToken(String tok) {
        if (tok.equals("pb")) {
            Integer out = d.pollLast();     // remove at rear, O(1); null if empty (underflow)
            if (out != null) System.out.println("pop_back() -> true, out = " + out);
            else System.out.println("pop_back() -> false (deque is empty)");
        } else if (tok.equals("pf")) {
            Integer out = d.pollFirst();    // remove at front, O(1); null if empty (underflow)
            if (out != null) System.out.println("pop_front() -> true, out = " + out);
            else System.out.println("pop_front() -> false (deque is empty)");
        } else if (tok.charAt(0) == 'f') {
            int v = Integer.parseInt(tok.substring(1));
            d.addFirst(v);                  // add at front, O(1)
            System.out.println("push_front(" + v + ")");
        } else {
            int v = Integer.parseInt(tok);
            d.addLast(v);                   // add at rear, O(1)
            System.out.println("push_back(" + v + ")");
        }
    }

    void printState() {
        StringBuilder sb = new StringBuilder("deque (front to back):");
        for (int v : d) sb.append(' ').append(v);
        if (d.isEmpty()) sb.append(" (empty)");
        System.out.println(sb);
    }

    void runScenario(String label, String[] tokens) {
        System.out.println("-- " + label + " --");
        d.clear();   // start each scenario empty
        for (String t : tokens) runToken(t);
        printState();
        System.out.println();
    }

    public static void main(String[] args) {
        DequeDemo demo = new DequeDemo();

        // normal: 10 operations, adding and removing at both ends
        String[] normal = {"10", "20", "f5", "pb", "f-3", "pf", "30", "f8", "pb", "40"};
        demo.runScenario("normal: 10 operations at both ends", normal);

        // hard: 14 operations, with negative values, frequent alternation
        String[] hard = {"5", "-8", "f12", "pb", "f-20", "pf", "15", "-3", "f7", "pb", "pf", "f-9", "22", "pb"};
        demo.runScenario("hard: 14 operations, negative values, frequent alternation", hard);

        // edge: only the back end -- the deque behaves like a stack
        String[] edge = {"10", "20", "pb", "30", "40", "pb", "50", "60", "pb", "70"};
        demo.runScenario("edge: only the back end (deque behaves like a stack)", edge);
    }
}
