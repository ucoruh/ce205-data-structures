/* Week 3 -- Stacks and Queues
 * Recursion: countdown, with a corrected base case (n <= 0).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class RecursionCountdown {
    static void countdown(int n) {
        if (n <= 0) {                // base case: fixed, was `n == 0`
            System.out.println("Liftoff!");
            return;
        }
        System.out.println(n);
        countdown(n - 1);            // recursive case
    }

    static void run(String label, int n) {
        System.out.println("-- " + label + " --");
        countdown(n);
        System.out.println();
    }

    public static void main(String[] args) {
        run("normal: countdown from 10", 10);
        run("hard: countdown from 15, a deeper call stack", 15);
        run("edge: n = 0, straight to the base case", 0);
        run("edge: n = -4, negative input still stops in one call", -4);
    }
}
