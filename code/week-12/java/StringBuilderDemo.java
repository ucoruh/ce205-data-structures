/* Week 12 -- Strings: Structures and Algorithms
 * Growable string buffer, built by hand (java.lang.StringBuilder does exactly this internally). Characters
 * are appended one at a time; when full, a new array double the size is allocated, every existing character
 * is copied across, then the new character is written. Amortized O(1) append.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class StringBuilderDemo {
    static class Builder {
        char[] buf;
        int len;
        int cap;
        int growths;

        Builder(int initCap) {
            cap = initCap;
            buf = new char[cap];
            len = 0;
            growths = 0;
        }

        void append(char c) {
            if (len == cap) {                          // full: grow before writing
                cap = cap * 2;
                char[] bigger = new char[cap];
                System.arraycopy(buf, 0, bigger, 0, len);   // copies every old byte across
                buf = bigger;
                growths++;
            }
            buf[len] = c;
            len++;
        }
    }

    static void runScenario(String label, int initCap, String chars) {
        System.out.println("-- " + label + " --");
        System.out.println("initCap = " + initCap + ", appending \"" + chars + "\" (" + chars.length() + " letters)");
        Builder b = new Builder(initCap);
        for (int i = 0; i < chars.length(); i++) b.append(chars.charAt(i));
        System.out.println("result: \"" + new String(b.buf, 0, b.len) + "\", len = " + b.len + ", finalCap = " + b.cap + ", growths = " + b.growths);
        System.out.println();
    }

    public static void main(String[] args) {
        runScenario("normal: initCap=4", 4, "HELLOWORLD");
        runScenario("hard: initCap=2, many growths back to back", 2, "ALGORITHMSDATA");
        runScenario("edge: initCap=10, exact fit, no growth at all", 10, "ABCDEFGHIJ");
        runScenario("edge: initCap=1, the smallest possible start", 1, "ABCDEFGHIJ");
        runScenario("edge: initCap=9, a single growth right at the boundary", 9, "ABCDEFGHIJ");
    }
}
