/* Week 1 -- Introduction to Data Structures
 * Java has no pointer arithmetic -- array indexing is the only way to move between elements.
 * These scenarios still print the SAME "address = base + k * sizeof(type)" arithmetic as the C
 * version, using the type's C size, purely to compare the formula's result side by side; Java
 * itself never computes a real address, it only ever indexes with a[k].
 * Runs the same normal / hard / edge-case scenarios as the pointer-arithmetic animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class ArrayIndexing {
    static void runIntScenario(String label, long base, int[] values, int[] offsets) {
        int n = values.length, sizeofInt = 4;
        System.out.println("-- " + label + " (type = int, sizeof = " + sizeofInt + ") --");
        for (int k : offsets) {
            if (k < 0 || k >= n) {
                System.out.println("a[" + k + "] -> out of range: throws ArrayIndexOutOfBoundsException in real Java");
                continue;
            }
            long addr = base + (long) k * sizeofInt;
            System.out.println("p + " + k + " = " + addr + ", a[" + k + "] = " + values[k]);
        }
        System.out.println();
    }

    static void runDoubleScenario(String label, long base, double[] values, int[] offsets) {
        int n = values.length, sizeofDouble = 8;
        System.out.println("-- " + label + " (type = double, sizeof = " + sizeofDouble + ") --");
        for (int k : offsets) {
            if (k < 0 || k >= n) {
                System.out.println("a[" + k + "] -> out of range: throws ArrayIndexOutOfBoundsException in real Java");
                continue;
            }
            long addr = base + (long) k * sizeofDouble;
            System.out.printf("p + %d = %d, a[%d] = %.0f%n", k, addr, k, values[k]);
        }
        System.out.println();
    }

    static void runCharScenario(String label, long base, char[] values, int[] offsets) {
        int n = values.length, sizeofChar = 1;
        System.out.println("-- " + label + " (type = char, sizeof = " + sizeofChar + ") --");
        for (int k : offsets) {
            if (k < 0 || k >= n) {
                System.out.println("a[" + k + "] -> out of range: throws ArrayIndexOutOfBoundsException in real Java");
                continue;
            }
            long addr = base + (long) k * sizeofChar;
            System.out.println("p + " + k + " = " + addr + ", a[" + k + "] = " + (int) values[k]);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: int array, 5 valid offsets
        int[] normalValues = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        int[] normalOffsets = {0, 1, 2, 4, 9};
        runIntScenario("normal: int array, 5 valid offsets", 1000, normalValues, normalOffsets);

        // hard: double array (sizeof = 8), 7 offsets
        double[] hardValues = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        int[] hardOffsets = {0, 2, 5, 8, 11, 6, 3};
        runDoubleScenario("hard: double array (sizeof = 8), 7 offsets", 2000, hardValues, hardOffsets);

        // edge: out-of-range offsets, negative and beyond N
        int[] edgeValues = {4, 8, 15, 16, 23, 42, 8, 9, 15, 3};
        int[] edgeOffsets = {-1, 0, 5, 10, 15};
        runIntScenario("edge: out-of-range offsets (negative and beyond N)", 1000, edgeValues, edgeOffsets);

        // edge: char array (sizeof = 1), p + k coincides with k bytes
        char[] charValues = {65, 66, 67, 68, 69, 70, 71, 72, 73, 74};
        int[] charOffsets = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
        runCharScenario("edge: char array (sizeof = 1)", 500, charValues, charOffsets);
    }
}
