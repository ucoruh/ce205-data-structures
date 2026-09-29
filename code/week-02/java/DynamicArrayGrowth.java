/* Week 2 -- Linked Lists, Arrays and Matrices
 * A dynamic array: append n values into a block that starts tiny and grows
 * by a factor whenever it is full; count every element copy to show why
 * appending is amortized O(1) even though a single growing append is
 * O(n). Matches the dynamic-array-growth.js animation. The animation bakes
 * cap0/factor/shrink into the source text per preset; this program keeps
 * them as runtime fields set per scenario, so resize/append/removeLast are
 * otherwise identical to the animation's code panel.
 * CEN207 Data Structures (formerly CE205)
 */
public class DynamicArrayGrowth {
    static class DynArray {
        int[] data;
        int size;
        int cap;
    }

    static double factor;   // growth factor, e.g. 2 or 1.5
    static int cap0;        // starting capacity, for the shrink floor
    static boolean shrinkOn; // whether removeLast shrinks at all
    static int copies;      // total elements copied by resizes, this scenario
    static int growths, shrinks;

    static void resize(DynArray a, int newCap) {
        int[] fresh = new int[newCap];
        for (int i = 0; i < a.size; i++)
            fresh[i] = a.data[i];        // copy every element to the new block
        copies += a.size;
        a.data = fresh;                  // old block is now garbage -- freed by the GC
        a.cap = newCap;
    }

    static void append(DynArray a, int v) {
        if (a.size == a.cap) {
            int newCap = (int) (a.cap * factor);   // growth factor `factor`
            if (newCap <= a.cap) newCap = a.cap + 1;
            resize(a, newCap);           // full: grow before writing
            growths++;
        }
        a.data[a.size++] = v;
    }

    static void removeLast(DynArray a) {
        if (a.size == 0) return;
        a.size--;
        if (shrinkOn && a.size <= a.cap / 4 && a.cap / 2 >= cap0) {
            resize(a, a.cap / 2);        // quarter full: shrink to save memory
            shrinks++;
        }
    }

    static void printArray(DynArray a) {
        StringBuilder sb = new StringBuilder("arr:");
        for (int i = 0; i < a.size; i++) sb.append(' ').append(a.data[i]);
        sb.append("  [size=").append(a.size).append(" cap=").append(a.cap).append(']');
        System.out.println(sb);
    }

    // tokens: "aV" = append(V); "r" = removeLast()
    static void runScenario(String label, int scenarioCap0, double scenarioFactor, boolean scenarioShrink, String[] ops) {
        System.out.println("-- " + label + " --");
        cap0 = scenarioCap0;
        factor = scenarioFactor;
        shrinkOn = scenarioShrink;
        copies = 0; growths = 0; shrinks = 0;
        DynArray a = new DynArray();
        a.cap = cap0;
        a.size = 0;
        a.data = new int[cap0];
        printArray(a);
        for (String op : ops) {
            if (op.charAt(0) == 'a') {
                int v = Integer.parseInt(op.substring(1));
                append(a, v);
                System.out.println("da_append(" + v + ")");
            } else {
                removeLast(a);
                System.out.println("da_remove_last()");
            }
            printArray(a);
        }
        System.out.println("growths=" + growths + " shrinks=" + shrinks + " copies=" + copies);
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: cap0=1, factor 2: 12 appends, total copies < 2n
        String[] normal = {"a5", "a12", "a8", "a19", "a3", "a27", "a14", "a6", "a31", "a9", "a22", "a17"};
        runScenario("normal: cap0=1, factor 2: 12 appends, total copies < 2n", 1, 2.0, false, normal);

        // hard: cap0=2, factor 2: 14 appends with 2 removes in between (no shrinking)
        String[] hard = {"a10", "a-4", "a21", "a7", "r", "a33", "a-15", "a2", "a40", "r", "a18", "a-9", "a25", "a11", "a6", "a29"};
        runScenario("hard: cap0=2, factor 2: 14 appends with 2 removes in between (no shrinking)", 2, 2.0, false, hard);

        // edge: growth factor 1.5 (instead of 2): more frequent, smaller growths
        String[] factor15 = {"a4", "a9", "a15", "a2", "a23", "a8", "a31", "a6", "a19", "a1", "a27", "a13"};
        runScenario("edge: growth factor 1.5 (instead of 2): more frequent, smaller growths", 1, 1.5, false, factor15);

        // edge: shrinking: capacity halves once the array is only a quarter full
        String[] shrinkQuarter = {"a3", "a8", "a15", "a1", "a22", "a9", "a30", "a4", "a17", "a6", "a25", "a11", "r", "r", "r", "r", "r", "r", "r", "r", "r"};
        runScenario("edge: shrinking: capacity halves once the array is only a quarter full", 2, 2.0, true, shrinkQuarter);
    }
}
