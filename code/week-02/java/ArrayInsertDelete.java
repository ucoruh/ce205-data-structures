/* Week 2 -- Linked Lists, Arrays and Matrices
 * A fixed-capacity array with a running size: insert at an index k
 * (shifting the tail right, from the end backwards) and delete at an index
 * k (shifting the tail left). Matches the array-insert-delete.js animation.
 * The animation gives each preset its own capacity constant; this program
 * keeps one array big enough for every scenario (MAX_CAP) and tracks the
 * scenario's own capacity in the runtime field `cap`, so insertAt and
 * deleteAt are otherwise identical to the animation's code panel.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class ArrayInsertDelete {
    static final int MAX_CAP = 16;
    static int[] arr = new int[MAX_CAP];
    static int size;
    static int cap;              // this scenario's capacity, <= MAX_CAP

    // insert v at index k; shifts arr[k..size-1] right, from the end backwards
    static boolean insertAt(int k, int v) {
        if (size == cap)
            return false;            // full: overflow, nothing inserted
        for (int i = size; i > k; i--)
            arr[i] = arr[i - 1];    // shift right
        arr[k] = v;
        size++;
        return true;
    }

    // delete the value at index k; shifts arr[k+1..size-1] left
    static boolean deleteAt(int k) {
        if (size == 0)
            return false;            // empty: underflow, nothing to delete
        for (int i = k; i < size - 1; i++)
            arr[i] = arr[i + 1];    // shift left
        size--;
        return true;
    }

    static void printArray() {
        StringBuilder sb = new StringBuilder("arr:");
        for (int i = 0; i < size; i++) sb.append(' ').append(arr[i]);
        sb.append("  [size=").append(size).append(" cap=").append(cap).append(']');
        System.out.println(sb);
    }

    // tokens: "iK:V" = insertAt(K, V); "dK" = deleteAt(K)
    static void runScenario(String label, int scenarioCap, String[] ops) {
        System.out.println("-- " + label + " --");
        size = 0;
        cap = scenarioCap;
        printArray();
        for (String op : ops) {
            if (op.charAt(0) == 'i') {
                String[] parts = op.substring(1).split(":");
                int k = Integer.parseInt(parts[0]), v = Integer.parseInt(parts[1]);
                boolean ok = insertAt(k, v);
                System.out.println("insert_at(" + k + ", " + v + "): " + (ok ? "ok" : "overflow, rejected"));
            } else {
                int k = Integer.parseInt(op.substring(1));
                boolean ok = deleteAt(k);
                System.out.println("delete_at(" + k + "): " + (ok ? "ok" : "underflow, rejected"));
            }
            printArray();
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 16-capacity: 10 appends, an insert at the front, a middle and a front delete
        String[] normal = {"i0:10", "i1:20", "i2:30", "i3:40", "i4:50", "i5:60", "i6:70", "i7:80", "i8:90", "i9:100", "i0:5", "d5", "d0"};
        runScenario("normal: 16-capacity: 10 appends, an insert at the front, a middle and a front delete", 16, normal);

        // hard: 14-capacity: frequent front inserts, negative/duplicate values, mixed deletes
        String[] hard = {"i0:7", "i1:-3", "i2:15", "i0:-3", "i4:22", "i5:-3", "i0:99", "i7:-40", "i8:100", "i9:-100", "d3", "i9:50", "i10:60", "i0:1000", "d0", "d5"};
        runScenario("hard: 14-capacity: frequent front inserts, negative/duplicate values, mixed deletes", 14, hard);

        // edge: overflow: fill a 10-capacity array, then an insert is rejected
        String[] overflow = {"i0:3", "i1:6", "i2:9", "i3:12", "i4:15", "i5:18", "i6:21", "i7:24", "i8:27", "i9:30", "i4:777", "i0:111", "d3", "i3:888"};
        runScenario("edge: overflow: fill a 10-capacity array, then an insert is rejected", 10, overflow);

        // edge: underflow: delete from an empty array, then fill it and drain it completely
        String[] deleteEmpty = {"d0", "i0:5", "i1:15", "i2:25", "i3:35", "i4:45", "i5:55", "i6:65", "i7:75", "i8:85", "i9:95",
                                 "d0", "d0", "d0", "d0", "d0", "d0", "d0", "d0", "d0", "d0", "d0"};
        runScenario("edge: underflow: delete from an empty array, then fill it and drain it completely", 12, deleteEmpty);
    }
}
