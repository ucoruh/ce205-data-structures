/* Week 2 -- Linked Lists, Arrays and Matrices
 * Add two sparse matrices directly in triplet form: merge a[] and b[]
 * (both already sorted row-major) like the merge step of merge sort.
 * Matches the sparse-matrix-addition.js animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class SparseMatrixAddition {
    static class Triplet {
        int row, col, value;
        Triplet(int row, int col, int value) { this.row = row; this.col = col; this.value = value; }
    }

    // Both a[] and b[] must already be sorted in row-major order.
    static Triplet[] addSparse(Triplet[] a, Triplet[] b) {
        Triplet[] out = new Triplet[a.length + b.length];
        int i = 0, j = 0, k = 0;
        while (i < a.length && j < b.length) {
            if (a[i].row < b[j].row || (a[i].row == b[j].row && a[i].col < b[j].col)) {
                out[k++] = a[i++];                          // a's entry comes first
            } else if (a[i].row > b[j].row || (a[i].row == b[j].row && a[i].col > b[j].col)) {
                out[k++] = b[j++];                          // b's entry comes first
            } else {
                int sum = a[i].value + b[j].value;          // same cell in both
                if (sum != 0)
                    out[k++] = new Triplet(a[i].row, a[i].col, sum);
                i++;
                j++;
            }
        }
        while (i < a.length) out[k++] = a[i++];
        while (j < b.length) out[k++] = b[j++];
        Triplet[] trimmed = new Triplet[k];
        System.arraycopy(out, 0, trimmed, 0, k);
        return trimmed;
    }

    static void printTriplets(String label, Triplet[] t) {
        System.out.println(label + ":");
        for (Triplet e : t) System.out.println("  (" + e.row + ", " + e.col + ", " + e.value + ")");
    }

    static void runScenario(String label, Triplet[] a, Triplet[] b) {
        System.out.println("-- " + label + " --");
        printTriplets("a[]", a);
        printTriplets("b[]", b);
        Triplet[] sum = addSparse(a, b);
        printTriplets("sum", sum);
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 3x4, 6+6 triplets, some cells shared
        Triplet[] a1 = { new Triplet(0, 0, 4), new Triplet(0, 3, 2), new Triplet(1, 1, 5), new Triplet(2, 0, 3), new Triplet(2, 2, 7), new Triplet(2, 3, 1) };
        Triplet[] b1 = { new Triplet(0, 0, 6), new Triplet(0, 1, 3), new Triplet(1, 1, -2), new Triplet(1, 3, 8), new Triplet(2, 1, 4), new Triplet(2, 3, 9) };
        runScenario("normal: 3x4, 6+6 triplets, some cells shared", a1, b1);

        // hard: 4x4, 7+7 triplets, negative values, no cancellation
        Triplet[] a2 = { new Triplet(0, 1, -8), new Triplet(0, 2, 5), new Triplet(1, 0, 12), new Triplet(1, 3, -4), new Triplet(2, 2, 9), new Triplet(3, 0, -15), new Triplet(3, 3, 6) };
        Triplet[] b2 = { new Triplet(0, 1, 3), new Triplet(0, 3, 7), new Triplet(1, 0, -10), new Triplet(2, 1, 10), new Triplet(2, 2, -5), new Triplet(3, 0, 10), new Triplet(3, 2, 2) };
        runScenario("hard: 4x4, 7+7 triplets, negative values, no cancellation", a2, b2);

        // edge: 3x4, no shared cells: every triplet is simply copied through
        Triplet[] a3 = { new Triplet(0, 0, 3), new Triplet(0, 2, 5), new Triplet(1, 1, 7), new Triplet(2, 0, 9), new Triplet(2, 3, 2) };
        Triplet[] b3 = { new Triplet(0, 1, 4), new Triplet(0, 3, 6), new Triplet(1, 0, 8), new Triplet(1, 2, -3), new Triplet(2, 1, 10), new Triplet(2, 2, -7) };
        runScenario("edge: 3x4, no shared cells: every triplet is simply copied through", a3, b3);

        // edge: 3x3 (the program's own example, extended): three cells cancel out
        Triplet[] a4 = { new Triplet(0, 0, 5), new Triplet(0, 2, 3), new Triplet(1, 1, 4), new Triplet(1, 2, -6), new Triplet(2, 0, 2), new Triplet(2, 1, 9) };
        Triplet[] b4 = { new Triplet(0, 0, -5), new Triplet(0, 1, 7), new Triplet(1, 1, 6), new Triplet(1, 2, 6), new Triplet(2, 0, -2), new Triplet(2, 2, 9) };
        runScenario("edge: 3x3 (the program's own example, extended): three cells cancel out", a4, b4);
    }
}
