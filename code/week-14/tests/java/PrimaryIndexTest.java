/* Unit tests for week-14 java/PrimaryIndex.java */
public class PrimaryIndexTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static PrimaryIndex.IndexEntry entry(int firstKey, int page) {
        PrimaryIndex.IndexEntry e = new PrimaryIndex.IndexEntry();
        e.firstKey = firstKey;
        e.page = page;
        return e;
    }

    public static void main(String[] args) {
        // -- findPage: empty index --
        checkEq(PrimaryIndex.findPage(new PrimaryIndex.IndexEntry[0], 0, 42), -1, "findPage empty");

        // -- findPage: single entry --
        PrimaryIndex.IndexEntry[] one = {entry(10, 0)};
        checkEq(PrimaryIndex.findPage(one, 1, 10), 0, "findPage one exact");
        checkEq(PrimaryIndex.findPage(one, 1, 50), 0, "findPage one above");
        checkEq(PrimaryIndex.findPage(one, 1, 9), -1, "findPage one below");

        // -- findPage: several entries --
        PrimaryIndex.IndexEntry[] idx = {entry(5, 0), entry(20, 1), entry(35, 2), entry(50, 3)};
        checkEq(PrimaryIndex.findPage(idx, 4, 4), -1, "findPage below first key");
        checkEq(PrimaryIndex.findPage(idx, 4, 5), 0, "findPage exact first_key");
        checkEq(PrimaryIndex.findPage(idx, 4, 19), 0, "findPage just below next page");
        checkEq(PrimaryIndex.findPage(idx, 4, 20), 1, "findPage exact middle first_key");
        checkEq(PrimaryIndex.findPage(idx, 4, 49), 2, "findPage below last first_key");
        checkEq(PrimaryIndex.findPage(idx, 4, 999), 3, "findPage far beyond last key");

        // -- searchKey: 3 pages of 4 --
        int[][] data = {{5, 10, 15, 20}, {25, 30, 35, 40}, {45, 50, 55, 60}};
        int[] pageLen = {4, 4, 4};
        PrimaryIndex.IndexEntry[] searchIdx = {entry(5, 0), entry(25, 1), entry(45, 2)};
        int[] outPage = {-1};

        check(PrimaryIndex.searchKey(data, pageLen, searchIdx, 3, 30, outPage), "search 30 found");
        checkEq(outPage[0], 1, "search 30 page");
        check(PrimaryIndex.searchKey(data, pageLen, searchIdx, 3, 5, outPage), "search first key overall");
        checkEq(outPage[0], 0, "search 5 page");
        check(PrimaryIndex.searchKey(data, pageLen, searchIdx, 3, 60, outPage), "search last key overall");
        checkEq(outPage[0], 2, "search 60 page");
        check(!PrimaryIndex.searchKey(data, pageLen, searchIdx, 3, 22, outPage), "search 22 absent");
        checkEq(outPage[0], 0, "search 22 page still reported");
        outPage[0] = -1;
        check(!PrimaryIndex.searchKey(data, pageLen, searchIdx, 3, 1, outPage), "search below every key");
        checkEq(outPage[0], -1, "search below every key: outPage untouched");

        // -- single-page file --
        int[][] singleData = {{1, 2, 3}};
        int[] singleLen = {3};
        PrimaryIndex.IndexEntry[] singleIdx = {entry(1, 0)};
        check(PrimaryIndex.searchKey(singleData, singleLen, singleIdx, 1, 2, outPage), "single page found");
        check(!PrimaryIndex.searchKey(singleData, singleLen, singleIdx, 1, 99, outPage), "single page not found");

        // -- negative keys --
        int[][] negData = {{-30, -20, -10}};
        int[] negLen = {3};
        PrimaryIndex.IndexEntry[] negIdx = {entry(-30, 0)};
        check(PrimaryIndex.searchKey(negData, negLen, negIdx, 1, -20, outPage), "negative key found");
        outPage[0] = -1;
        check(!PrimaryIndex.searchKey(negData, negLen, negIdx, 1, -31, outPage), "negative key below range");
        checkEq(outPage[0], -1, "negative key below range: outPage untouched");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
