/* Week 2 -- Linked Lists, Arrays and Matrices
 * A fixed-capacity array with a running size: insert at an index k
 * (shifting the tail right, from the end backwards) and delete at an index
 * k (shifting the tail left). Matches the array-insert-delete.js animation.
 * The animation gives each preset its own #define CAP; this program keeps
 * one array big enough for every scenario (MAX_CAP) and tracks the
 * scenario's own capacity in the runtime variable `cap`, so insert_at and
 * delete_at are otherwise identical to the animation's code panel.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#define MAX_CAP 16
static int arr[MAX_CAP];
static int size;
static int cap;              /* this scenario's capacity, <= MAX_CAP */

/* insert v at index k; shifts arr[k..size-1] right, from the end backwards */
bool insert_at(int k, int v) {
    if (size == cap)
        return false;            /* full: overflow, nothing inserted */
    for (int i = size; i > k; i--)
        arr[i] = arr[i - 1];    /* shift right */
    arr[k] = v;
    size++;
    return true;
}

/* delete the value at index k; shifts arr[k+1..size-1] left */
bool delete_at(int k) {
    if (size == 0)
        return false;            /* empty: underflow, nothing to delete */
    for (int i = k; i < size - 1; i++)
        arr[i] = arr[i + 1];    /* shift left */
    size--;
    return true;
}

static void print_array(void) {
    printf("arr:");
    for (int i = 0; i < size; i++) printf(" %d", arr[i]);
    printf("  [size=%d cap=%d]\n", size, cap);
}

/* tokens: "iK:V" = insert_at(K, V); "dK" = delete_at(K) */
static void run_scenario(const char *label, int scenario_cap, const char *ops[], int n) {
    printf("-- %s --\n", label);
    size = 0;
    cap = scenario_cap;
    print_array();
    for (int i = 0; i < n; i++) {
        const char *op = ops[i];
        if (op[0] == 'i') {
            int k, v;
            sscanf(op + 1, "%d:%d", &k, &v);
            bool ok = insert_at(k, v);
            printf("insert_at(%d, %d): %s\n", k, v, ok ? "ok" : "overflow, rejected");
        } else {
            int k = atoi(op + 1);
            bool ok = delete_at(k);
            printf("delete_at(%d): %s\n", k, ok ? "ok" : "underflow, rejected");
        }
        print_array();
    }
    printf("\n");
}

int main(void) {
    /* normal: 16-capacity: 10 appends, an insert at the front, a middle and a front delete */
    const char *normal[] = {"i0:10", "i1:20", "i2:30", "i3:40", "i4:50", "i5:60", "i6:70", "i7:80", "i8:90", "i9:100", "i0:5", "d5", "d0"};
    run_scenario("normal: 16-capacity: 10 appends, an insert at the front, a middle and a front delete", 16, normal, 13);

    /* hard: 14-capacity: frequent front inserts, negative/duplicate values, mixed deletes */
    const char *hard[] = {"i0:7", "i1:-3", "i2:15", "i0:-3", "i4:22", "i5:-3", "i0:99", "i7:-40", "i8:100", "i9:-100", "d3", "i9:50", "i10:60", "i0:1000", "d0", "d5"};
    run_scenario("hard: 14-capacity: frequent front inserts, negative/duplicate values, mixed deletes", 14, hard, 16);

    /* edge: overflow: fill a 10-capacity array, then an insert is rejected */
    const char *overflow[] = {"i0:3", "i1:6", "i2:9", "i3:12", "i4:15", "i5:18", "i6:21", "i7:24", "i8:27", "i9:30", "i4:777", "i0:111", "d3", "i3:888"};
    run_scenario("edge: overflow: fill a 10-capacity array, then an insert is rejected", 10, overflow, 14);

    /* edge: underflow: delete from an empty array, then fill it and drain it completely */
    const char *delete_empty[] = {"d0", "i0:5", "i1:15", "i2:25", "i3:35", "i4:45", "i5:55", "i6:65", "i7:75", "i8:85", "i9:95",
                                   "d0", "d0", "d0", "d0", "d0", "d0", "d0", "d0", "d0", "d0", "d0"};
    run_scenario("edge: underflow: delete from an empty array, then fill it and drain it completely", 12, delete_empty, 22);

    return 0;
}
