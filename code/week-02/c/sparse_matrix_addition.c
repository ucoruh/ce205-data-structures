/* Week 2 -- Linked Lists, Arrays and Matrices
 * Add two sparse matrices directly in triplet form: merge a[] and b[]
 * (both already sorted row-major) like the merge step of merge sort.
 * Matches the sparse-matrix-addition.js animation.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

typedef struct {
    int row, col, value;
} Triplet;

/* Both a[] and b[] must already be sorted in row-major order.
   Returns the number of entries written to out[]. */
int add_sparse(Triplet a[], int na, Triplet b[], int nb, Triplet out[]) {
    int i = 0, j = 0, k = 0;
    while (i < na && j < nb) {
        if (a[i].row < b[j].row || (a[i].row == b[j].row && a[i].col < b[j].col)) {
            out[k++] = a[i++];                       /* a's entry comes first */
        } else if (a[i].row > b[j].row || (a[i].row == b[j].row && a[i].col > b[j].col)) {
            out[k++] = b[j++];                       /* b's entry comes first */
        } else {
            int sum = a[i].value + b[j].value;       /* same cell in both */
            if (sum != 0) {
                out[k].row = a[i].row;
                out[k].col = a[i].col;
                out[k].value = sum;
                k++;
            }
            i++;
            j++;
        }
    }
    while (i < na) out[k++] = a[i++];
    while (j < nb) out[k++] = b[j++];
    return k;
}

static void print_triplets(const char *label, Triplet t[], int n) {
    printf("%s:\n", label);
    for (int i = 0; i < n; i++) printf("  (%d, %d, %d)\n", t[i].row, t[i].col, t[i].value);
}

static void run_scenario(const char *label, Triplet a[], int na, Triplet b[], int nb) {
    printf("-- %s --\n", label);
    print_triplets("a[]", a, na);
    print_triplets("b[]", b, nb);
    Triplet out[64];
    int k = add_sparse(a, na, b, nb, out);
    print_triplets("sum", out, k);
    printf("\n");
}

int main(void) {
    /* normal: 3x4, 6+6 triplets, some cells shared */
    Triplet a1[] = { {0, 0, 4}, {0, 3, 2}, {1, 1, 5}, {2, 0, 3}, {2, 2, 7}, {2, 3, 1} };
    Triplet b1[] = { {0, 0, 6}, {0, 1, 3}, {1, 1, -2}, {1, 3, 8}, {2, 1, 4}, {2, 3, 9} };
    run_scenario("normal: 3x4, 6+6 triplets, some cells shared", a1, 6, b1, 6);

    /* hard: 4x4, 7+7 triplets, negative values, no cancellation */
    Triplet a2[] = { {0, 1, -8}, {0, 2, 5}, {1, 0, 12}, {1, 3, -4}, {2, 2, 9}, {3, 0, -15}, {3, 3, 6} };
    Triplet b2[] = { {0, 1, 3}, {0, 3, 7}, {1, 0, -10}, {2, 1, 10}, {2, 2, -5}, {3, 0, 10}, {3, 2, 2} };
    run_scenario("hard: 4x4, 7+7 triplets, negative values, no cancellation", a2, 7, b2, 7);

    /* edge: 3x4, no shared cells: every triplet is simply copied through */
    Triplet a3[] = { {0, 0, 3}, {0, 2, 5}, {1, 1, 7}, {2, 0, 9}, {2, 3, 2} };
    Triplet b3[] = { {0, 1, 4}, {0, 3, 6}, {1, 0, 8}, {1, 2, -3}, {2, 1, 10}, {2, 2, -7} };
    run_scenario("edge: 3x4, no shared cells: every triplet is simply copied through", a3, 5, b3, 6);

    /* edge: 3x3 (the program's own example, extended): three cells cancel out */
    Triplet a4[] = { {0, 0, 5}, {0, 2, 3}, {1, 1, 4}, {1, 2, -6}, {2, 0, 2}, {2, 1, 9} };
    Triplet b4[] = { {0, 0, -5}, {0, 1, 7}, {1, 1, 6}, {1, 2, 6}, {2, 0, -2}, {2, 2, 9} };
    run_scenario("edge: 3x3 (the program's own example, extended): three cells cancel out", a4, 6, b4, 6);

    return 0;
}
