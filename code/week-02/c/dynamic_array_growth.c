/* Week 2 -- Linked Lists, Arrays and Matrices
 * A dynamic array: append n values into a block that starts tiny and grows
 * by a factor whenever it is full; count every element copy to show why
 * appending is amortized O(1) even though a single growing append is
 * O(n). Matches the dynamic-array-growth.js animation. The animation bakes
 * cap0/factor/shrink into the source text per preset; this program keeps
 * them as runtime globals set per scenario, so da_resize/da_append/
 * da_remove_last are otherwise identical to the animation's code panel.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    int size;
    int cap;
} DynArray;

static double factor;   /* growth factor, e.g. 2 or 1.5 */
static int cap0;        /* starting capacity, for the shrink floor */
static int shrink_on;   /* whether da_remove_last shrinks at all */
static int copies;      /* total elements copied by resizes, this scenario */
static int growths, shrinks;

static void da_resize(DynArray *a, int new_cap) {
    int *fresh = malloc(new_cap * sizeof(int));
    for (int i = 0; i < a->size; i++)
        fresh[i] = a->data[i];      /* copy every element to the new block */
    copies += a->size;
    free(a->data);                  /* old block is freed */
    a->data = fresh;
    a->cap = new_cap;
}

void da_append(DynArray *a, int v) {
    if (a->size == a->cap) {
        int new_cap = (int)(a->cap * factor);   /* growth factor `factor` */
        if (new_cap <= a->cap) new_cap = a->cap + 1;
        da_resize(a, new_cap);       /* full: grow before writing */
        growths++;
    }
    a->data[a->size++] = v;
}

void da_remove_last(DynArray *a) {
    if (a->size == 0) return;
    a->size--;
    if (shrink_on && a->size <= a->cap / 4 && a->cap / 2 >= cap0) {
        da_resize(a, a->cap / 2);    /* quarter full: shrink to save memory */
        shrinks++;
    }
}

static void print_array(DynArray *a) {
    printf("arr:");
    for (int i = 0; i < a->size; i++) printf(" %d", a->data[i]);
    printf("  [size=%d cap=%d]\n", a->size, a->cap);
}

/* tokens: "aV" = da_append(V); "r" = da_remove_last() */
static void run_scenario(const char *label, int scenario_cap0, double scenario_factor, int scenario_shrink, const char *ops[], int n) {
    printf("-- %s --\n", label);
    cap0 = scenario_cap0;
    factor = scenario_factor;
    shrink_on = scenario_shrink;
    copies = 0; growths = 0; shrinks = 0;
    DynArray a;
    a.cap = cap0;
    a.size = 0;
    a.data = malloc((size_t) cap0 * sizeof(int));
    print_array(&a);
    for (int i = 0; i < n; i++) {
        const char *op = ops[i];
        if (op[0] == 'a') {
            int v = atoi(op + 1);
            da_append(&a, v);
            printf("da_append(%d)\n", v);
        } else {
            da_remove_last(&a);
            printf("da_remove_last()\n");
        }
        print_array(&a);
    }
    printf("growths=%d shrinks=%d copies=%d\n\n", growths, shrinks, copies);
    free(a.data);
}

int main(void) {
    /* normal: cap0=1, factor 2: 12 appends, total copies < 2n */
    const char *normal[] = {"a5", "a12", "a8", "a19", "a3", "a27", "a14", "a6", "a31", "a9", "a22", "a17"};
    run_scenario("normal: cap0=1, factor 2: 12 appends, total copies < 2n", 1, 2.0, 0, normal, 12);

    /* hard: cap0=2, factor 2: 14 appends with 2 removes in between (no shrinking) */
    const char *hard[] = {"a10", "a-4", "a21", "a7", "r", "a33", "a-15", "a2", "a40", "r", "a18", "a-9", "a25", "a11", "a6", "a29"};
    run_scenario("hard: cap0=2, factor 2: 14 appends with 2 removes in between (no shrinking)", 2, 2.0, 0, hard, 16);

    /* edge: growth factor 1.5 (instead of 2): more frequent, smaller growths */
    const char *factor15[] = {"a4", "a9", "a15", "a2", "a23", "a8", "a31", "a6", "a19", "a1", "a27", "a13"};
    run_scenario("edge: growth factor 1.5 (instead of 2): more frequent, smaller growths", 1, 1.5, 0, factor15, 12);

    /* edge: shrinking: capacity halves once the array is only a quarter full */
    const char *shrink_quarter[] = {"a3", "a8", "a15", "a1", "a22", "a9", "a30", "a4", "a17", "a6", "a25", "a11", "r", "r", "r", "r", "r", "r", "r", "r", "r"};
    run_scenario("edge: shrinking: capacity halves once the array is only a quarter full", 2, 2.0, 1, shrink_quarter, 21);

    return 0;
}
