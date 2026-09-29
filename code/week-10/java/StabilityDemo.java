/* Week 10 -- Sorting
 * Stability, demonstrated directly: the same key+tag records are sorted by
 * key with insertion sort (stable: strict > in the while condition means
 * equal keys never cross) and with selection sort (unstable: a long-range
 * swap can jump a record past another with an equal key). Prints both
 * results so the tag order for tied keys can be compared by eye.
 * CEN207 Data Structures (formerly CE205)
 */
public class StabilityDemo {
    static class Rec {
        int key; char tag;
        Rec(int key, char tag) { this.key = key; this.tag = tag; }
    }

    static String recordsStr(Rec[] a) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) { sb.append(a[i].key).append(a[i].tag); if (i + 1 < a.length) sb.append(' '); }
        sb.append(']');
        return sb.toString();
    }

    static void insertionSortStable(Rec[] a) {
        int n = a.length;
        for (int i = 1; i < n; i++) {
            Rec key = a[i];
            int j = i - 1;
            while (j >= 0 && a[j].key > key.key) {   // strict >: equal keys never cross
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = key;
        }
    }

    static void selectionSortUnstable(Rec[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++)
                if (a[j].key < a[minIdx].key) minIdx = j;
            if (minIdx != i) {
                Rec tmp = a[i]; a[i] = a[minIdx]; a[minIdx] = tmp;   // can jump a tie out of order
            }
        }
    }

    static Rec[] clone(Rec[] src) {
        Rec[] out = new Rec[src.length];
        for (int i = 0; i < src.length; i++) out[i] = new Rec(src[i].key, src[i].tag);
        return out;
    }

    static void runScenario(String label, Rec[] src) {
        System.out.println("-- " + label + " --");
        System.out.println("before:            " + recordsStr(src));

        Rec[] a1 = clone(src);
        insertionSortStable(a1);
        System.out.println("stable (insert):   " + recordsStr(a1));

        Rec[] a2 = clone(src);
        selectionSortUnstable(a2);
        System.out.println("unstable (select): " + recordsStr(a2));
        System.out.println();
    }

    public static void main(String[] args) {
        Rec[] normal = {new Rec(5, 'a'), new Rec(2, 'a'), new Rec(5, 'b'), new Rec(8, 'a'), new Rec(2, 'b'),
                         new Rec(5, 'c'), new Rec(1, 'a'), new Rec(8, 'b'), new Rec(2, 'c'), new Rec(9, 'a')};
        Rec[] allEqual = {new Rec(6, 'a'), new Rec(6, 'b'), new Rec(6, 'c'), new Rec(6, 'd'), new Rec(6, 'e'),
                           new Rec(6, 'f'), new Rec(6, 'g'), new Rec(6, 'h'), new Rec(6, 'i'), new Rec(6, 'j')};
        Rec[] alreadySorted = {new Rec(1, 'a'), new Rec(2, 'a'), new Rec(2, 'b'), new Rec(3, 'a'), new Rec(4, 'a'),
                                new Rec(4, 'b'), new Rec(5, 'a'), new Rec(6, 'a'), new Rec(6, 'b'), new Rec(7, 'a')};
        Rec[] noTies = {new Rec(9, 'a'), new Rec(3, 'a'), new Rec(7, 'a'), new Rec(1, 'a'), new Rec(5, 'a'),
                         new Rec(2, 'a'), new Rec(8, 'a'), new Rec(4, 'a'), new Rec(6, 'a'), new Rec(0, 'a')};

        runScenario("normal: 10 records, three groups of equal keys", normal);
        runScenario("edge: all keys equal -- the whole array is one tie group", allEqual);
        runScenario("edge: already-sorted keys, with ties present", alreadySorted);
        runScenario("edge: no ties at all -- both sorts give the identical result", noTies);
    }
}
