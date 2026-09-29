/* Week 6 -- Search and Hashing
 * The division hash function: h(k) = k mod m. Maps any integer key to a
 * table index in [0..m-1]. The extra "+ m) % m" guards against negative
 * keys. Prints each key's hash and whether it collides with an
 * already-occupied bucket.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class HashDivision {
    // the extra "+ m) % m" guards against negative keys: in Java, key % m can be negative when key < 0
    static int hashDivision(int key, int m) {
        return ((key % m) + m) % m;
    }

    static void runScenario(String label, int m, int[] keys) {
        System.out.println("-- " + label + " --");
        System.out.println("m = " + m);
        int[] counts = new int[64];
        int collisions = 0;
        for (int key : keys) {
            int idx = hashDivision(key, m);
            boolean collided = counts[idx] > 0;
            if (collided) collisions++;
            counts[idx]++;
            System.out.println("  h(" + key + ") = " + key + " mod " + m + " = " + idx + (collided ? " -- collision" : ""));
        }
        int used = 0;
        for (int i = 0; i < m; i++) if (counts[i] > 0) used++;
        System.out.println("summary: " + keys.length + " keys, " + collisions + " collisions, " + used + "/" + m + " cells used");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {23, 44, 15, 77, 8, 62, 31, 50, 19, 96, 27, 5};
        int[] hard = {12, 23, 34, 45, 56, 67, 78, 89, 100, 111, 122, 133, 144};
        int[] powerOf10 = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110};
        int[] primeSameKeys = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110};
        int[] negativeKeys = {-3, -15, -27, 5, 18, -42, 33, -8, 50, -19, 7};

        runScenario("normal: m = 11 (prime), 12 assorted keys", 11, normal);
        runScenario("hard: m = 11 is prime, but the keys are 11 apart: it still collides", 11, hard);
        runScenario("edge: m = 10 (a power of 10), keys that are multiples of 10: catastrophic clustering", 10, powerOf10);
        runScenario("edge: same keys, m = 13 (prime): perfect spread", 13, primeSameKeys);
        runScenario("edge: negative keys, without the guard the index would be negative", 11, negativeKeys);
    }
}
