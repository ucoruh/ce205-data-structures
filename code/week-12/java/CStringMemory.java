/* Week 12 -- Strings: Structures and Algorithms
 * C string memory: a char array plus the '\0' convention, strlen(), and a buffer-overflow edge case that is
 * FLAGGED but never executed. Java strings carry their own length, so the overflow danger below is really a
 * C-only bug; we reproduce the same bounded-array exercise here so the two languages can be compared side by
 * side, with the identical safety guard.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class CStringMemory {
    static final int MAX_CAP = 16;
    static char[] buf = new char[MAX_CAP];

    // Copies src into buf, character by character, but never writes past index cap-1. Returns the number of
    // characters actually written; overflow[0] is set to true if src needed more room than cap allowed.
    static int safeStore(String src, int cap, boolean[] overflow) {
        int i = 0;
        while (i < src.length()) {
            if (i == cap) break;      // would need buf[cap]: out of bounds -- stop, never write it
            buf[i] = src.charAt(i);
            i++;
        }
        overflow[0] = (i < src.length());
        return i;
    }

    static void runScenario(String label, String text, int cap) {
        System.out.println("-- " + label + " --");
        System.out.println("cap = " + cap + ", source = \"" + text + "\" (" + text.length() + " letters)");
        boolean[] overflow = new boolean[1];
        int written = safeStore(text, cap, overflow);
        if (overflow[0]) {
            System.out.println("overflow flagged after " + written + " bytes: buf[" + cap + "] would be out of bounds (valid indices 0.." + (cap - 1) + ") -- stopped, never executed");
        } else {
            String stored = new String(buf, 0, written);
            System.out.println("stored \"" + stored + "\", strlen = " + stored.length());
        }
        System.out.println();
    }

    public static void main(String[] args) {
        runScenario("normal: cap=16, comfortable fit", "HELLOWORLD", 16);
        runScenario("hard: cap=12, 1 byte of slack", "ALGORITHMS", 12);
        runScenario("edge: cap=11, exact fit (0 bytes slack)", "ALGORITHMS", 11);
        runScenario("edge: cap=8, overflow -- flagged, never executed", "STRUCTURES", 8);
        runScenario("edge: cap=16, repeated character", "AAAAAAAAAA", 16);
    }
}
