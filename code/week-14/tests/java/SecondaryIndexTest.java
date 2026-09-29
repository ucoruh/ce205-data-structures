/* Unit tests for week-14 java/SecondaryIndex.java */
public class SecondaryIndexTest {
    static int checks = 0, failures = 0;
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static SecondaryIndex.IndexEntry e(int key, int slot) { return new SecondaryIndex.IndexEntry(key, slot); }

    public static void main(String[] args) {
        int[] matches = new int[SecondaryIndex.MAX_RECORDS];

        checkEq(SecondaryIndex.searchDense(new SecondaryIndex.IndexEntry[0], 0, 5, matches, SecondaryIndex.MAX_RECORDS), 0, "empty index");

        SecondaryIndex.IndexEntry[] one = {e(7, 0)};
        checkEq(SecondaryIndex.searchDense(one, 1, 7, matches, SecondaryIndex.MAX_RECORDS), 1, "single match");
        checkEq(matches[0], 0, "single match slot");
        checkEq(SecondaryIndex.searchDense(one, 1, 8, matches, SecondaryIndex.MAX_RECORDS), 0, "single no match");

        SecondaryIndex.IndexEntry[] startDup = {e(1, 10), e(1, 11), e(2, 12), e(3, 13), e(4, 14)};
        checkEq(SecondaryIndex.searchDense(startDup, 5, 1, matches, SecondaryIndex.MAX_RECORDS), 2, "duplicates at start");
        checkEq(matches[0], 10, "start dup slot 0");
        checkEq(matches[1], 11, "start dup slot 1");

        SecondaryIndex.IndexEntry[] midDup = {e(1, 0), e(2, 1), e(2, 2), e(2, 3), e(5, 4)};
        checkEq(SecondaryIndex.searchDense(midDup, 5, 2, matches, SecondaryIndex.MAX_RECORDS), 3, "duplicates in middle");
        checkEq(matches[0], 1, "mid dup first slot");
        checkEq(matches[2], 3, "mid dup last slot");

        SecondaryIndex.IndexEntry[] endDup = {e(1, 0), e(2, 1), e(9, 2), e(9, 3)};
        checkEq(SecondaryIndex.searchDense(endDup, 4, 9, matches, SecondaryIndex.MAX_RECORDS), 2, "duplicates at end");

        SecondaryIndex.IndexEntry[] allSame = {e(6, 0), e(6, 1), e(6, 2), e(6, 3)};
        checkEq(SecondaryIndex.searchDense(allSame, 4, 6, matches, SecondaryIndex.MAX_RECORDS), 4, "all entries share one key");

        SecondaryIndex.IndexEntry[] unique = {e(1, 0), e(2, 1), e(3, 2), e(4, 3)};
        checkEq(SecondaryIndex.searchDense(unique, 4, 3, matches, SecondaryIndex.MAX_RECORDS), 1, "no duplicates");
        checkEq(matches[0], 2, "no duplicates slot");

        checkEq(SecondaryIndex.searchDense(unique, 4, 0, matches, SecondaryIndex.MAX_RECORDS), 0, "smaller than every key");
        checkEq(SecondaryIndex.searchDense(unique, 4, 99, matches, SecondaryIndex.MAX_RECORDS), 0, "larger than every key");

        SecondaryIndex.IndexEntry[] manyDup = {e(5, 0), e(5, 1), e(5, 2), e(5, 3), e(5, 4), e(5, 5)};
        int[] smallBuf = new int[2];
        checkEq(SecondaryIndex.searchDense(manyDup, 6, 5, smallBuf, 2), 6, "true count exceeds buffer");
        checkEq(smallBuf[0], 0, "small buffer slot 0");
        checkEq(smallBuf[1], 1, "small buffer slot 1");

        SecondaryIndex.IndexEntry[] neg = {e(-5, 0), e(-3, 1), e(-3, 2)};
        checkEq(SecondaryIndex.searchDense(neg, 3, -3, matches, SecondaryIndex.MAX_RECORDS), 2, "negative keys");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
