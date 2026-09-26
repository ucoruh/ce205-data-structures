/* Week 1 -- Introduction to Data Structures
 * Two references can alias the same heap object; when no reference is left,
 * the object becomes eligible for garbage collection.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class ReferenceAliasing {
    static class Counter {
        int value;
        Counter(int value) { this.value = value; }
    }

    public static void main(String[] args) {
        Counter a = new Counter(1);
        Counter b = a;              // b is an ALIAS: same object, not a copy

        System.out.println("a.value = " + a.value + ", b.value = " + b.value);
        System.out.println("a and b refer to the same object: " + (a == b));

        b.value = 99;                // changing through b is visible through a too
        System.out.println("after b.value = 99: a.value = " + a.value);

        a = null;                    // one reference gone; still reachable through b
        System.out.println("a = " + a + ", b.value = " + b.value);

        b = null;                    // last reference gone: now eligible for GC
        System.out.println("b = " + b + " (the Counter object has no reachable reference left)");
    }
}
