/* Week 10 -- Sorting
 * Stability, demonstrated directly: the same key+tag records are sorted by
 * key with insertion sort (stable: strict `>` in the while condition means
 * equal keys never cross) and with selection sort (unstable: a long-range
 * swap can jump a record past another with an equal key). Prints both
 * results so the tag order for tied keys can be compared by eye.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

typedef struct { int key; char tag; } Rec;

static void print_records(const Rec a[], int n) {
    printf("[");
    for (int i = 0; i < n; i++) printf("%d%c%s", a[i].key, a[i].tag, i + 1 < n ? " " : "");
    printf("]\n");
}

void insertion_sort_stable(Rec a[], int n) {
    for (int i = 1; i < n; i++) {
        Rec key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j].key > key.key) {   /* strict >: equal keys never cross */
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}

void selection_sort_unstable(Rec a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++)
            if (a[j].key < a[min_idx].key) min_idx = j;
        if (min_idx != i) {
            Rec tmp = a[i]; a[i] = a[min_idx]; a[min_idx] = tmp;   /* can jump a tie out of order */
        }
    }
}

static void run_scenario(const char *label, Rec src[], int n) {
    printf("-- %s --\n", label);
    printf("before:            ");
    print_records(src, n);

    Rec a1[16]; for (int i = 0; i < n; i++) a1[i] = src[i];
    insertion_sort_stable(a1, n);
    printf("stable (insert):   ");
    print_records(a1, n);

    Rec a2[16]; for (int i = 0; i < n; i++) a2[i] = src[i];
    selection_sort_unstable(a2, n);
    printf("unstable (select): ");
    print_records(a2, n);
    printf("\n");
}

int main(void) {
    Rec normal[] = {{5, 'a'}, {2, 'a'}, {5, 'b'}, {8, 'a'}, {2, 'b'}, {5, 'c'}, {1, 'a'}, {8, 'b'}, {2, 'c'}, {9, 'a'}};
    Rec all_equal[] = {{6, 'a'}, {6, 'b'}, {6, 'c'}, {6, 'd'}, {6, 'e'}, {6, 'f'}, {6, 'g'}, {6, 'h'}, {6, 'i'}, {6, 'j'}};
    Rec already_sorted[] = {{1, 'a'}, {2, 'a'}, {2, 'b'}, {3, 'a'}, {4, 'a'}, {4, 'b'}, {5, 'a'}, {6, 'a'}, {6, 'b'}, {7, 'a'}};
    Rec no_ties[] = {{9, 'a'}, {3, 'a'}, {7, 'a'}, {1, 'a'}, {5, 'a'}, {2, 'a'}, {8, 'a'}, {4, 'a'}, {6, 'a'}, {0, 'a'}};

    run_scenario("normal: 10 records, three groups of equal keys", normal, 10);
    run_scenario("edge: all keys equal -- the whole array is one tie group", all_equal, 10);
    run_scenario("edge: already-sorted keys, with ties present", already_sorted, 10);
    run_scenario("edge: no ties at all -- both sorts give the identical result", no_ties, 10);

    return 0;
}
