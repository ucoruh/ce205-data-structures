/* Unit tests for week-09 c/max_flow_edmonds_karp.c */
#define main program_main
#include "../../c/max_flow_edmonds_karp.c"
#undef main
#include "../../../test_check.h"

static void reset_cap(void) { for (int i = 0; i < MAX_V; i++) for (int j = 0; j < MAX_V; j++) cap_of[i][j] = 0; }

int main(void) {
    /* -- single edge: max flow equals its capacity -- */
    reset_cap();
    cap_of[0][1] = 7;
    CHECK_EQ_INT(edmonds_karp(2, 0, 1), 7);

    /* -- no path at all: max flow is 0 -- */
    reset_cap();
    CHECK_EQ_INT(edmonds_karp(2, 0, 1), 0);

    /* -- note: s == t is deliberately NOT exercised here -- the animation's input parser
     *    rejects it ("the source and the sink cannot be the same") precisely because
     *    edmonds_karp has no base case for it: bfs_augmenting_path(s, s) trivially marks
     *    s visited, so it would loop forever finding "paths" of length 0. -- */

    /* -- two parallel-ish paths: total flow is the sum of both bottlenecks -- */
    reset_cap();
    cap_of[0][1] = 3; cap_of[1][3] = 3;
    cap_of[0][2] = 4; cap_of[2][3] = 4;
    CHECK_EQ_INT(edmonds_karp(4, 0, 3), 7);

    /* -- a single bottleneck edge caps the whole flow, even with generous edges around it -- */
    reset_cap();
    cap_of[0][1] = 10; cap_of[1][2] = 1; cap_of[2][3] = 10;
    CHECK_EQ_INT(edmonds_karp(4, 0, 3), 1);

    /* -- classic textbook graph: A->B:6 A->C:4 B->C:2 B->D:5 C->E:4 D->E:1 D->F:4 E->F:6 C->D:3 A->D:2 -- */
    reset_cap();
    cap_of[0][1] = 6; cap_of[0][2] = 4; cap_of[1][2] = 2; cap_of[1][3] = 5;
    cap_of[2][4] = 4; cap_of[3][4] = 1; cap_of[3][5] = 4; cap_of[4][5] = 6;
    cap_of[2][3] = 3; cap_of[0][3] = 2;
    CHECK_EQ_INT(edmonds_karp(6, 0, 5), 9);

    /* -- bfs_augmenting_path returns false when t is unreachable -- */
    reset_cap();
    cap_of[0][1] = 5;
    CHECK(!bfs_augmenting_path(3, 0, 2));

    /* -- bfs_augmenting_path returns true and records a parent chain when reachable -- */
    reset_cap();
    cap_of[0][1] = 5; cap_of[1][2] = 3;
    CHECK(bfs_augmenting_path(3, 0, 2));
    CHECK_EQ_INT(parent_of[2], 1);
    CHECK_EQ_INT(parent_of[1], 0);

    /* -- after edmonds_karp saturates a graph, no augmenting path remains -- */
    reset_cap();
    cap_of[0][1] = 4;
    CHECK_EQ_INT(edmonds_karp(2, 0, 1), 4);
    CHECK(!bfs_augmenting_path(2, 0, 1));

    /* -- a self-contained back-and-forth: a reverse residual edge lets a later
     *    path partially undo an earlier greedy choice, reaching the true max flow -- */
    reset_cap();
    cap_of[0][1] = 1; cap_of[0][2] = 1; cap_of[1][2] = 1; cap_of[1][3] = 1; cap_of[2][3] = 1;
    CHECK_EQ_INT(edmonds_karp(4, 0, 3), 2);

    /* -- a capacity of exactly 0 behaves as "no edge": BFS never crosses it -- */
    reset_cap();
    cap_of[0][1] = 0; cap_of[0][2] = 3;
    CHECK(!bfs_augmenting_path(3, 0, 1));
    CHECK_EQ_INT(edmonds_karp(3, 0, 1), 0);

    /* -- a 3-hop path: parent chain walks all the way back to the source -- */
    reset_cap();
    cap_of[0][1] = 2; cap_of[1][2] = 2; cap_of[2][3] = 2;
    CHECK(bfs_augmenting_path(4, 0, 3));
    CHECK_EQ_INT(parent_of[3], 2);
    CHECK_EQ_INT(parent_of[2], 1);
    CHECK_EQ_INT(parent_of[1], 0);
    CHECK_EQ_INT(edmonds_karp(4, 0, 3), 2);

    TEST_SUMMARY();
}
