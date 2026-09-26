/* Week 3 -- Stacks and Queues
 * Tower of Hanoi, solved with recursion.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class Hanoi {
    static int moveCount = 0;

    static void moveDisk(int n, char from, char to) {
        moveCount++;
        System.out.println("move " + moveCount + ": disk " + n + " from " + from + " to " + to);
    }

    void towerOfHanoi(int n, char from, char to, char via) {
        if (n == 0) return;                          // nothing to move
        towerOfHanoi(n - 1, from, via, to);           // move n-1 out of the way
        moveDisk(n, from, to);                        // move the largest
        towerOfHanoi(n - 1, via, to, from);           // put n-1 back on top
    }

    void run(String label, int n) {
        moveCount = 0;
        System.out.println("-- " + label + " --");
        towerOfHanoi(n, 'A', 'C', 'B');
        System.out.println("total moves = " + moveCount);
        System.out.println();
    }

    public static void main(String[] args) {
        Hanoi h = new Hanoi();
        h.run("normal: 4 disks (15 moves)", 4);
        h.run("hard: 5 disks (31 moves)", 5);
        h.run("edge: 1 disk, straight A to C", 1);
    }
}
