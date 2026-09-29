/* Week 14 -- File Organisation II
 * ISAM: a two-level index over a sorted primary data area, plus an overflow area
 * (a linked chain) for keys that no longer fit their home page.
 * CEN207 Data Structures (formerly CE205)
 */
public class Isam {
    static final int MAX_PAGES = 8;
    static final int MAX_BLOCK = 8;
    static final int MAX_GROUPS = 8;

    static class OverflowNode {
        int key;
        OverflowNode next;
    }

    static class Page {
        int[] keys = new int[MAX_BLOCK]; // holds up to BLOCK keys: the page's capacity
        int len;                          // how many of those slots are currently used
        OverflowNode overflowHead;
        OverflowNode overflowTail;
    }

    static int findGroup(int[] l1Key, int l1n, int key) {
        int g = 0;
        for (int i = 0; i < l1n; i++) {
            if (l1Key[i] <= key)
                g = i;
            else
                break;
        }
        return g;
    }

    static int findPage(int[] l2Key, int lo, int hi, int key) {
        int page = lo;
        for (int i = lo; i <= hi; i++) {
            if (l2Key[i] <= key)
                page = i;
            else
                break;
        }
        return page;
    }

    // block = a page's CAPACITY (how many keys it can hold before it overflows).
    static void isamInsert(Page[] pages, int numPages, int block, int[] l1Key, int l1n, int group, int key) {
        int g = findGroup(l1Key, l1n, key);
        int lo = g * group, hi = lo + group - 1;
        if (hi > numPages - 1)
            hi = numPages - 1;
        int[] l2Key = new int[MAX_PAGES];
        for (int i = 0; i < numPages; i++)
            l2Key[i] = pages[i].keys[0];
        int page = findPage(l2Key, lo, hi, key);

        if (pages[page].len < block) {
            int i = pages[page].len - 1;
            while (i >= 0 && pages[page].keys[i] > key) {
                pages[page].keys[i + 1] = pages[page].keys[i];
                i--;
            }
            pages[page].keys[i + 1] = key;
            pages[page].len++;
            System.out.println("insert(" + key + ") -> page " + (page + 1) + " (" + pages[page].len + "/" + block + ")");
        } else {
            OverflowNode node = new OverflowNode();
            node.key = key;
            if (pages[page].overflowTail == null)
                pages[page].overflowHead = node;
            else
                pages[page].overflowTail.next = node;
            pages[page].overflowTail = node;
            System.out.println("insert(" + key + ") -> page " + (page + 1) + " is full: OVERFLOW");
        }
    }

    static void printPages(Page[] pages, int numPages) {
        for (int p = 0; p < numPages; p++) {
            StringBuilder sb = new StringBuilder("  page " + (p + 1) + ":");
            for (int i = 0; i < pages[p].len; i++)
                sb.append(' ').append(pages[p].keys[i]);
            if (pages[p].overflowHead != null) {
                sb.append("  overflow:");
                for (OverflowNode n = pages[p].overflowHead; n != null; n = n.next)
                    sb.append(' ').append(n.key);
            }
            System.out.println(sb);
        }
    }

    // fill = keys per page when the file is first built (fill <= block, leaving block-fill free slots).
    static void runScenario(String label, int[] keys, int block, int fill, int group, int[] inserts) {
        System.out.println("-- " + label + " --");
        Page[] pages = new Page[MAX_PAGES];
        int numPages = 0;
        for (int i = 0; i < keys.length; i += fill) {
            pages[numPages] = new Page();
            int len = 0;
            for (int j = i; j < i + fill && j < keys.length; j++)
                pages[numPages].keys[len++] = keys[j];
            pages[numPages].len = len;
            numPages++;
        }
        int[] l1Key = new int[MAX_GROUPS];
        int l1n = 0;
        for (int g = 0; g * group < numPages; g++)
            l1Key[l1n++] = pages[g * group].keys[0];

        System.out.println("pages: " + numPages + " (fill=" + fill + ", capacity=" + block + "), level-1 groups: " + l1n);
        for (int key : inserts)
            isamInsert(pages, numPages, block, l1Key, l1n, group, key);
        printPages(pages, numPages);
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normalKeys = {5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60};
        int[] normalIns = {22, 38, 39};
        runScenario("normal: 12 keys, block=4, fill=3 (1 overflow)", normalKeys, 4, 3, 2, normalIns);

        int[] hardKeys = {2, 8, 14, 19, 23, 29, 34, 41, 47, 53, 58, 64, 69, 75, 81, 88};
        int[] hardIns = {24, 25, 26};
        runScenario("hard: 16 keys, block=4, fill=2, chained overflow", hardKeys, 4, 2, 3, hardIns);

        int[] noOfKeys = {4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59};
        int[] noOfIns = {11, 46, 12, 47};
        runScenario("edge: plenty of free room, no overflow", noOfKeys, 8, 3, 2, noOfIns);

        int[] allOfKeys = {10, 12, 20, 22, 30, 32, 40, 42, 50, 52};
        int[] allOfIns = {11, 21, 31, 41};
        runScenario("edge: fill=block=2, every insert overflows", allOfKeys, 2, 2, 3, allOfIns);
    }
}
