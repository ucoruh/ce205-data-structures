/* Week 3 -- Stacks and Queues
 * Tower of Hanoi, solved with recursion.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

static int move_count = 0;

static void move_disk(int n, char from, char to) {
    move_count++;
    printf("move %d: disk %d from %c to %c\n", move_count, n, from, to);
}

void tower_of_hanoi(int n, char from, char to, char via) {
    if (n == 0) return;                          /* nothing to move */
    tower_of_hanoi(n - 1, from, via, to);         /* move n-1 out of the way */
    move_disk(n, from, to);                       /* move the largest */
    tower_of_hanoi(n - 1, via, to, from);         /* put n-1 back on top */
}

static void run(const char *label, int n) {
    move_count = 0;
    printf("-- %s --\n", label);
    tower_of_hanoi(n, 'A', 'C', 'B');
    printf("total moves = %d\n\n", move_count);
}

int main(void) {
    run("normal: 4 disks (15 moves)", 4);
    run("hard: 5 disks (31 moves)", 5);
    run("edge: 1 disk, straight A to C", 1);

    return 0;
}
