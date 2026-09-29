// Unit tests for code/week-02/java/ArrayInsertDelete.java: insertAt() and deleteAt().
// Independent oracle: each expected array state below is hand-computed from the operation sequence,
// never read back from arr[] before being asserted.
public class ArrayInsertDeleteTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void checkState(String label, int[] expected) {
        check(ArrayInsertDelete.size == expected.length, label + ": size (got " + ArrayInsertDelete.size + ", expected " + expected.length + ")");
        for (int i = 0; i < expected.length && i < ArrayInsertDelete.size; i++)
            check(ArrayInsertDelete.arr[i] == expected[i], label + ": arr[" + i + "] (got " + ArrayInsertDelete.arr[i] + ", expected " + expected[i] + ")");
    }

    public static void main(String[] args) {
        // Scenario A: cap=5, a full cycle -- front/middle/end inserts, overflow, front/middle/end deletes, underflow
        ArrayInsertDelete.size = 0; ArrayInsertDelete.cap = 5;
        check(ArrayInsertDelete.insertAt(0, 10), "A: insert_at(0,10)");
        checkState("A: after insert_at(0,10)", new int[]{10});

        check(ArrayInsertDelete.insertAt(1, 20), "A: insert_at(1,20)");
        checkState("A: after insert_at(1,20)", new int[]{10, 20});

        check(ArrayInsertDelete.insertAt(0, 5), "A: insert_at(0,5)");
        checkState("A: after insert_at(0,5)", new int[]{5, 10, 20});

        check(ArrayInsertDelete.insertAt(2, 15), "A: insert_at(2,15)");
        checkState("A: after insert_at(2,15)", new int[]{5, 10, 15, 20});

        check(ArrayInsertDelete.insertAt(4, 99), "A: insert_at(4,99)");
        checkState("A: after insert_at(4,99)", new int[]{5, 10, 15, 20, 99});

        check(!ArrayInsertDelete.insertAt(2, 777), "A: overflow rejected");
        checkState("A: after rejected overflow insert", new int[]{5, 10, 15, 20, 99});

        check(ArrayInsertDelete.deleteAt(0), "A: delete_at(0)");
        checkState("A: after delete_at(0)", new int[]{10, 15, 20, 99});

        check(ArrayInsertDelete.deleteAt(3), "A: delete_at(3)");
        checkState("A: after delete_at(3)", new int[]{10, 15, 20});

        check(ArrayInsertDelete.deleteAt(1), "A: delete_at(1)");
        checkState("A: after delete_at(1)", new int[]{10, 20});

        check(ArrayInsertDelete.deleteAt(0), "A: delete_at(0) #2");
        checkState("A: after delete_at(0) #2", new int[]{20});

        check(ArrayInsertDelete.deleteAt(0), "A: delete_at(0) #3");
        checkState("A: now empty", new int[]{});

        check(!ArrayInsertDelete.deleteAt(0), "A: underflow rejected");

        // Scenario B: cap=1, single-slot array
        ArrayInsertDelete.size = 0; ArrayInsertDelete.cap = 1;
        check(ArrayInsertDelete.insertAt(0, 42), "B: single slot filled");
        checkState("B: filled", new int[]{42});
        check(!ArrayInsertDelete.insertAt(0, 99), "B: immediate overflow");
        checkState("B: unchanged after overflow", new int[]{42});
        check(ArrayInsertDelete.deleteAt(0), "B: emptied");
        checkState("B: empty", new int[]{});
        check(!ArrayInsertDelete.deleteAt(0), "B: immediate underflow");
        check(ArrayInsertDelete.insertAt(0, 7), "B: reused after empty");
        checkState("B: reused", new int[]{7});

        // Scenario C: cap=4, duplicates and INT_MIN/INT_MAX/negative values
        ArrayInsertDelete.size = 0; ArrayInsertDelete.cap = 4;
        check(ArrayInsertDelete.insertAt(0, Integer.MIN_VALUE), "C: insert MIN");
        check(ArrayInsertDelete.insertAt(1, Integer.MAX_VALUE), "C: insert MAX");
        check(ArrayInsertDelete.insertAt(1, -5), "C: insert -5 middle");
        checkState("C: three inserted", new int[]{Integer.MIN_VALUE, -5, Integer.MAX_VALUE});
        check(ArrayInsertDelete.insertAt(3, -5), "C: insert duplicate -5");
        checkState("C: full with duplicate -5", new int[]{Integer.MIN_VALUE, -5, Integer.MAX_VALUE, -5});
        check(!ArrayInsertDelete.insertAt(0, 999), "C: overflow");
        check(ArrayInsertDelete.deleteAt(1), "C: delete first -5");
        checkState("C: after removing first -5", new int[]{Integer.MIN_VALUE, Integer.MAX_VALUE, -5});
        check(ArrayInsertDelete.deleteAt(2), "C: delete second -5");
        checkState("C: after removing second -5", new int[]{Integer.MIN_VALUE, Integer.MAX_VALUE});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
