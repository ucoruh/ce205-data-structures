/* Unit tests for week-09 c/floyd_warshall.c */
#define main program_main
#include "../../c/floyd_warshall.c"
#undef main
#include "../../../test_check.h"

static void init_n(int n) {
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            dist[i][j] = (i == j) ? 0 : INF;
}

int main(void) {
    /* -- 0 vertices: every loop is a no-op, vacuously no negative cycle -- */
    floyd_warshall(0);
    CHECK(!has_negative_cycle(0));

    /* -- 1 vertex: distance to itself is 0, never negative -- */
    init_n(1);
    floyd_warshall(1);
    CHECK_EQ_INT(dist[0][0], 0);
    CHECK(!has_negative_cycle(1));

    /* -- 2 vertices, one direct edge, no reverse: dist[1][0] stays inf -- */
    init_n(2);
    dist[0][1] = 5;
    floyd_warshall(2);
    CHECK_EQ_INT(dist[0][1], 5);
    CHECK_EQ_INT(dist[1][0], INF);

    /* -- triangle: the shortcut through the intermediate vertex is found -- */
    init_n(3);
    dist[0][1] = 10; dist[0][2] = 2; dist[2][1] = 3;
    floyd_warshall(3);
    CHECK_EQ_INT(dist[0][1], 5);   /* 0->2->1 = 2+3, cheaper than direct 10 */

    /* -- disconnected pair: unreachable stays inf after the algorithm -- */
    init_n(4);
    dist[0][1] = 1; dist[2][3] = 1;
    floyd_warshall(4);
    CHECK_EQ_INT(dist[0][2], INF);
    CHECK_EQ_INT(dist[0][3], INF);
    CHECK_EQ_INT(dist[0][1], 1);
    CHECK_EQ_INT(dist[2][3], 1);

    /* -- chain of 4: all-pairs distances accumulate correctly -- */
    init_n(4);
    dist[0][1] = 2; dist[1][2] = 3; dist[2][3] = 4;
    floyd_warshall(4);
    CHECK_EQ_INT(dist[0][2], 5);
    CHECK_EQ_INT(dist[0][3], 9);
    CHECK_EQ_INT(dist[1][3], 7);

    /* -- no negative cycle: a positive-weight triangle -- */
    init_n(3);
    dist[0][1] = 1; dist[1][2] = 1; dist[2][0] = 1;
    floyd_warshall(3);
    CHECK(!has_negative_cycle(3));

    /* -- classic negative cycle: A>B>C>A totals -1 -- */
    init_n(3);
    dist[0][1] = 1; dist[1][2] = 2; dist[2][0] = -4;
    floyd_warshall(3);
    CHECK(has_negative_cycle(3));
    CHECK(dist[0][0] < 0);

    /* -- a negative EDGE without a cycle is fine, no false positive -- */
    init_n(3);
    dist[0][1] = -5; dist[1][2] = 2;
    floyd_warshall(3);
    CHECK(!has_negative_cycle(3));
    CHECK_EQ_INT(dist[0][2], -3);

    /* -- a zero-weight self-loop-like round trip (0 cost) is not "negative" -- */
    init_n(2);
    dist[0][1] = 3; dist[1][0] = -3;
    floyd_warshall(2);
    CHECK(!has_negative_cycle(2));
    CHECK_EQ_INT(dist[0][0], 0);

    /* -- multiple intermediate vertices: the true shortest path may need 2 hops -- */
    init_n(5);
    dist[0][1] = 1; dist[1][2] = 1; dist[2][3] = 1; dist[3][4] = 1; dist[0][4] = 10;
    floyd_warshall(5);
    CHECK_EQ_INT(dist[0][4], 4);

    TEST_SUMMARY();
}
