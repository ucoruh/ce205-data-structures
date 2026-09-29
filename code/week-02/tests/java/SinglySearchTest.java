// Unit tests for code/week-02/java/SinglySearch.java: search().
// Independent oracle: index and comparisons are hand-counted from the input array (comparisons = the
// 1-based position of the match, or the full length when not found), never read from search()'s own trace.
public class SinglySearchTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }

    public static void main(String[] args) {
        int[] vals = {12, 45, 3, 78, 23, 56, 89, 1, 67, 34};
        SinglySearch.Node head = SinglySearch.buildList(vals);
        SinglySearch.SearchResult r;

        r = SinglySearch.search(head, 12); checkEq(r.index, 0, "found first idx"); checkEq(r.comparisons, 1, "found first cmp");
        r = SinglySearch.search(head, 23); checkEq(r.index, 4, "found middle idx"); checkEq(r.comparisons, 5, "found middle cmp");
        r = SinglySearch.search(head, 34); checkEq(r.index, 9, "found last idx"); checkEq(r.comparisons, 10, "found last cmp");

        r = SinglySearch.search(head, 999); checkEq(r.index, -1, "not found idx"); checkEq(r.comparisons, 10, "not found cmp");

        r = SinglySearch.search(null, 1); checkEq(r.index, -1, "empty list idx"); checkEq(r.comparisons, 0, "empty list cmp");

        SinglySearch.Node one = SinglySearch.buildList(new int[]{42});
        r = SinglySearch.search(one, 42); checkEq(r.index, 0, "one element found idx"); checkEq(r.comparisons, 1, "one element found cmp");
        r = SinglySearch.search(one, 7); checkEq(r.index, -1, "one element not found idx"); checkEq(r.comparisons, 1, "one element not found cmp");

        SinglySearch.Node two = SinglySearch.buildList(new int[]{10, 20});
        r = SinglySearch.search(two, 10); checkEq(r.index, 0, "two elements first idx"); checkEq(r.comparisons, 1, "two elements first cmp");
        r = SinglySearch.search(two, 20); checkEq(r.index, 1, "two elements second idx"); checkEq(r.comparisons, 2, "two elements second cmp");

        SinglySearch.Node dup = SinglySearch.buildList(new int[]{8, 15, 8, 22, 8});
        r = SinglySearch.search(dup, 8); checkEq(r.index, 0, "duplicates idx"); checkEq(r.comparisons, 1, "duplicates cmp");

        SinglySearch.Node extreme = SinglySearch.buildList(new int[]{-100, 0, Integer.MAX_VALUE, Integer.MIN_VALUE, 17});
        r = SinglySearch.search(extreme, -100); checkEq(r.index, 0, "negative idx"); checkEq(r.comparisons, 1, "negative cmp");
        r = SinglySearch.search(extreme, Integer.MAX_VALUE); checkEq(r.index, 2, "INT_MAX idx"); checkEq(r.comparisons, 3, "INT_MAX cmp");
        r = SinglySearch.search(extreme, Integer.MIN_VALUE); checkEq(r.index, 3, "INT_MIN idx"); checkEq(r.comparisons, 4, "INT_MIN cmp");

        SinglySearch.Node rev = SinglySearch.buildList(new int[]{9, 7, 5, 3, 1});
        r = SinglySearch.search(rev, 1); checkEq(r.index, 4, "reverse-sorted idx"); checkEq(r.comparisons, 5, "reverse-sorted cmp");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
