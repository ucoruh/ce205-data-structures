/* Week 2 -- Linked Lists, Arrays and Matrices
 * Singly linked list: linear search with a comparison count. Matches the
 * singly-search.js animation.
 * CEN207 Data Structures (formerly CE205)
 */
public class SinglySearch {
    static class Node {
        int data;
        Node next;
        Node(int data) { this.data = data; }
    }

    static class SearchResult {
        int index;
        int comparisons;
        SearchResult(int index, int comparisons) { this.index = index; this.comparisons = comparisons; }
    }

    static SearchResult search(Node head, int value) {
        int index = 0, comparisons = 0;
        for (Node cur = head; cur != null; cur = cur.next) {
            comparisons++;
            if (cur.data == value)
                return new SearchResult(index, comparisons);      // found at this position
            index++;
        }
        return new SearchResult(-1, comparisons);                 // not found
    }

    static Node buildList(int[] values) {
        Node head = null, tail = null;
        for (int v : values) {
            Node node = new Node(v);
            if (tail == null) head = node; else tail.next = node;
            tail = node;
        }
        return head;
    }

    static void runScenario(String label, int[] values, int[] queries) {
        System.out.println("-- " + label + " --");
        Node head = buildList(values);
        StringBuilder sb = new StringBuilder("list:");
        for (int v : values) sb.append(' ').append(v);
        System.out.println(sb);
        for (int q : queries) {
            SearchResult r = search(head, q);
            System.out.println("search(" + q + ") = index " + r.index + ", comparisons " + r.comparisons);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 10 values, the target is in the middle
        int[] normal = {12, 45, 3, 78, 23, 56, 89, 1, 67, 34};
        runScenario("normal: 10 values, the target is in the middle", normal, new int[]{23});

        // hard: 12 values with duplicates -- the first match wins
        int[] hard = {8, 15, 8, 22, 40, 8, 55, 61, 8, 70, 80, 90};
        runScenario("hard: 12 values with duplicates -- the first match wins", hard, new int[]{8});

        // edge: the first element, the last element, and a value that is not present
        int[] firstLast = {12, 45, 3, 78, 23, 56, 89, 1, 67, 34};
        runScenario("edge: the first element, the last element, and a value that is not present", firstLast, new int[]{12, 34, 999});

        // edge: search on an empty list
        int[] empty = {};
        runScenario("edge: search on an empty list", empty, new int[]{1});
    }
}
