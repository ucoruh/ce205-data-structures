// Unit tests for code/week-02/java/Josephus.java: josephus().
// Independent oracle: the classic recurrence J(1)=0, J(n)=(J(n-1)+k)%n (0-indexed survivor position),
// survivor = J(n)+1 -- a closed-form recurrence, not the linked-list simulation the program itself uses.
public class JosephusTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }

    static int bruteSurvivor(int n, int k) {
        int j = 0;
        for (int i = 2; i <= n; i++)
            j = (j + k) % i;
        return j + 1;
    }

    public static void main(String[] args) {
        checkEq(Josephus.josephus(10, 3), bruteSurvivor(10, 3), "n=10 k=3");
        checkEq(Josephus.josephus(12, 5), bruteSurvivor(12, 5), "n=12 k=5");
        checkEq(Josephus.josephus(10, 1), bruteSurvivor(10, 1), "n=10 k=1");
        checkEq(Josephus.josephus(1, 3), bruteSurvivor(1, 3), "n=1 k=3");

        checkEq(Josephus.josephus(1, 1), 1, "n=1 k=1");
        checkEq(Josephus.josephus(1, 100), 1, "n=1 large k");

        checkEq(Josephus.josephus(2, 1), bruteSurvivor(2, 1), "n=2 k=1 oracle");
        checkEq(Josephus.josephus(2, 1), 2, "n=2 k=1 value");
        checkEq(Josephus.josephus(2, 2), bruteSurvivor(2, 2), "n=2 k=2 oracle");
        checkEq(Josephus.josephus(2, 2), 1, "n=2 k=2 value");

        checkEq(Josephus.josephus(5, 1), 5, "k=1 survivor is last id (n=5)");
        checkEq(Josephus.josephus(20, 1), 20, "k=1 survivor is last id (n=20)");

        checkEq(Josephus.josephus(6, 6), bruteSurvivor(6, 6), "k == n");
        checkEq(Josephus.josephus(5, 2), bruteSurvivor(5, 2), "k < n");
        checkEq(Josephus.josephus(5, 17), bruteSurvivor(5, 17), "k > n");

        checkEq(Josephus.josephus(41, 3), 31, "classic n=41 k=3");
        checkEq(Josephus.josephus(41, 3), bruteSurvivor(41, 3), "classic n=41 k=3 oracle");

        for (int n = 1; n <= 15; n++)
            checkEq(Josephus.josephus(n, 2), bruteSurvivor(n, 2), "exhaustive n=" + n + " k=2");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
