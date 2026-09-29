/* Week 14 -- File Organisation II
 * Primary (sparse) index over a sorted file: one index entry per disk page.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class PrimaryIndex {
    static final int MAX_PAGES = 8;
    static final int MAX_BLOCK = 16;

    static class IndexEntry {
        int firstKey;
        int page;
    }

    static int findPage(IndexEntry[] index, int idxN, int key) {
        int page = -1;
        for (int i = 0; i < idxN; i++) {
            if (index[i].firstKey <= key)
                page = index[i].page; // keep the last entry that still fits
            else
                break; // index is sorted: later entries start too high
        }
        return page;
    }

    static boolean searchKey(int[][] data, int[] pageLen, IndexEntry[] index, int idxN,
                              int key, int[] outPage) {
        int page = findPage(index, idxN, key);
        if (page == -1)
            return false; // smaller than every key: guaranteed absent
        for (int i = 0; i < pageLen[page]; i++)
            if (data[page][i] == key) {
                outPage[0] = page;
                return true;
            }
        outPage[0] = page;
        return false;
    }

    static void runScenario(String label, int[] keys, int block, int[] queries) {
        System.out.println("-- " + label + " --");
        int[][] data = new int[MAX_PAGES][MAX_BLOCK];
        int[] pageLen = new int[MAX_PAGES];
        IndexEntry[] index = new IndexEntry[MAX_PAGES];
        int pages = 0;

        for (int i = 0; i < keys.length; i += block) {
            int len = 0;
            for (int j = i; j < i + block && j < keys.length; j++)
                data[pages][len++] = keys[j];
            pageLen[pages] = len;
            index[pages] = new IndexEntry();
            index[pages].firstKey = data[pages][0];
            index[pages].page = pages;
            pages++;
        }

        System.out.println("pages: " + pages);
        for (int p = 0; p < pages; p++) {
            StringBuilder sb = new StringBuilder("  page " + (p + 1) + ":");
            for (int i = 0; i < pageLen[p]; i++)
                sb.append(' ').append(data[p][i]);
            System.out.println(sb);
        }
        for (int q : queries) {
            int[] outPage = {-1};
            boolean found = searchKey(data, pageLen, index, pages, q, outPage);
            if (outPage[0] == -1)
                System.out.println("search(" + q + ") -> not found (below the first key, no page read)");
            else
                System.out.println("search(" + q + ") -> " + (found ? "found" : "not found") + " (page " + (outPage[0] + 1) + ")");
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normalKeys = {5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60};
        int[] normalQ = {22, 50, 3};
        runScenario("normal: 12 keys, block=4", normalKeys, 4, normalQ);

        int[] hardKeys = {2, 8, 14, 19, 23, 29, 34, 41, 47, 53, 58, 64, 69, 75, 81, 88};
        int[] hardQ = {29, 75, 90, 1, 88};
        runScenario("hard: 16 keys, block=3, partial last page", hardKeys, 3, hardQ);

        int[] singleKeys = {3, 6, 9, 12, 15, 18, 21, 24, 27, 30};
        int[] singleQ = {9, 25, 1};
        runScenario("edge: single page, block=12", singleKeys, 12, singleQ);

        int[] belowKeys = {100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155};
        int[] belowQ = {10, 50, 99};
        runScenario("edge: every query below range, block=4", belowKeys, 4, belowQ);
    }
}
