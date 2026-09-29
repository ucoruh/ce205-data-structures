/* Week 6 -- Search and Hashing
 * The division hash function: h(k) = k mod m. Maps any integer key to a
 * table index in [0..m-1]. The extra "+ m) % m" guards against negative
 * keys. Prints each key's hash and whether it collides with an
 * already-occupied bucket.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

/* the extra "+ m) % m" guards against negative keys: in C, key % m can be negative when key < 0 */
int hash_division(int key, int m) {
    return ((key % m) + m) % m;
}

static void run_scenario(const char *label, int m, const int keys[], int n) {
    printf("-- %s --\n", label);
    printf("m = %d\n", m);
    int counts[64] = {0};
    int collisions = 0;
    for (int i = 0; i < n; i++) {
        int key = keys[i];
        int idx = hash_division(key, m);
        int collided = counts[idx] > 0;
        if (collided) collisions++;
        counts[idx]++;
        printf("  h(%d) = %d mod %d = %d%s\n", key, key, m, idx, collided ? " -- collision" : "");
    }
    int used = 0;
    for (int i = 0; i < m; i++) if (counts[i] > 0) used++;
    printf("summary: %d keys, %d collisions, %d/%d cells used\n\n", n, collisions, used, m);
}

int main(void) {
    int normal[] = {23, 44, 15, 77, 8, 62, 31, 50, 19, 96, 27, 5};
    int hard[] = {12, 23, 34, 45, 56, 67, 78, 89, 100, 111, 122, 133, 144};
    int power_of_10[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110};
    int prime_same_keys[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110};
    int negative_keys[] = {-3, -15, -27, 5, 18, -42, 33, -8, 50, -19, 7};

    run_scenario("normal: m = 11 (prime), 12 assorted keys", 11, normal, 12);
    run_scenario("hard: m = 11 is prime, but the keys are 11 apart: it still collides", 11, hard, 13);
    run_scenario("edge: m = 10 (a power of 10), keys that are multiples of 10: catastrophic clustering", 10, power_of_10, 11);
    run_scenario("edge: same keys, m = 13 (prime): perfect spread", 13, prime_same_keys, 11);
    run_scenario("edge: negative keys, without the guard the index would be negative", 11, negative_keys, 11);

    return 0;
}
