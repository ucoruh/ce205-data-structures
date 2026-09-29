/* Unit tests for week-09 java/MaxFlowEdmondsKarp.java */
public class MaxFlowEdmondsKarpTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static void resetCap() {
        for (int i = 0; i < MaxFlowEdmondsKarp.MAX_V; i++)
            for (int j = 0; j < MaxFlowEdmondsKarp.MAX_V; j++)
                MaxFlowEdmondsKarp.capOf[i][j] = 0;
    }

    public static void main(String[] args) {
        resetCap();
        MaxFlowEdmondsKarp.capOf[0][1] = 7;
        checkEq(MaxFlowEdmondsKarp.edmondsKarp(2, 0, 1), 7, "single edge");

        resetCap();
        checkEq(MaxFlowEdmondsKarp.edmondsKarp(2, 0, 1), 0, "no path");

        // note: s == t is deliberately NOT exercised here -- the animation's input parser
        // rejects it ("the source and the sink cannot be the same") precisely because
        // edmondsKarp has no base case for it: bfsAugmentingPath(s, s) trivially marks s
        // visited, so it would loop forever finding "paths" of length 0.

        resetCap();
        MaxFlowEdmondsKarp.capOf[0][1] = 3; MaxFlowEdmondsKarp.capOf[1][3] = 3;
        MaxFlowEdmondsKarp.capOf[0][2] = 4; MaxFlowEdmondsKarp.capOf[2][3] = 4;
        checkEq(MaxFlowEdmondsKarp.edmondsKarp(4, 0, 3), 7, "two parallel paths");

        resetCap();
        MaxFlowEdmondsKarp.capOf[0][1] = 10; MaxFlowEdmondsKarp.capOf[1][2] = 1; MaxFlowEdmondsKarp.capOf[2][3] = 10;
        checkEq(MaxFlowEdmondsKarp.edmondsKarp(4, 0, 3), 1, "single bottleneck edge");

        resetCap();
        MaxFlowEdmondsKarp.capOf[0][1] = 6; MaxFlowEdmondsKarp.capOf[0][2] = 4; MaxFlowEdmondsKarp.capOf[1][2] = 2; MaxFlowEdmondsKarp.capOf[1][3] = 5;
        MaxFlowEdmondsKarp.capOf[2][4] = 4; MaxFlowEdmondsKarp.capOf[3][4] = 1; MaxFlowEdmondsKarp.capOf[3][5] = 4; MaxFlowEdmondsKarp.capOf[4][5] = 6;
        MaxFlowEdmondsKarp.capOf[2][3] = 3; MaxFlowEdmondsKarp.capOf[0][3] = 2;
        checkEq(MaxFlowEdmondsKarp.edmondsKarp(6, 0, 5), 9, "classic textbook graph");

        resetCap();
        MaxFlowEdmondsKarp.capOf[0][1] = 5;
        check(!MaxFlowEdmondsKarp.bfsAugmentingPath(3, 0, 2), "bfs unreachable t");

        resetCap();
        MaxFlowEdmondsKarp.capOf[0][1] = 5; MaxFlowEdmondsKarp.capOf[1][2] = 3;
        check(MaxFlowEdmondsKarp.bfsAugmentingPath(3, 0, 2), "bfs reachable t");
        checkEq(MaxFlowEdmondsKarp.parentOf[2], 1, "bfs parent of 2");
        checkEq(MaxFlowEdmondsKarp.parentOf[1], 0, "bfs parent of 1");

        resetCap();
        MaxFlowEdmondsKarp.capOf[0][1] = 4;
        checkEq(MaxFlowEdmondsKarp.edmondsKarp(2, 0, 1), 4, "saturating flow");
        check(!MaxFlowEdmondsKarp.bfsAugmentingPath(2, 0, 1), "no path left after saturation");

        resetCap();
        MaxFlowEdmondsKarp.capOf[0][1] = 1; MaxFlowEdmondsKarp.capOf[0][2] = 1; MaxFlowEdmondsKarp.capOf[1][2] = 1; MaxFlowEdmondsKarp.capOf[1][3] = 1; MaxFlowEdmondsKarp.capOf[2][3] = 1;
        checkEq(MaxFlowEdmondsKarp.edmondsKarp(4, 0, 3), 2, "reverse residual back-and-forth");

        resetCap();
        MaxFlowEdmondsKarp.capOf[0][1] = 0; MaxFlowEdmondsKarp.capOf[0][2] = 3;
        check(!MaxFlowEdmondsKarp.bfsAugmentingPath(3, 0, 1), "zero capacity acts as no edge");
        checkEq(MaxFlowEdmondsKarp.edmondsKarp(3, 0, 1), 0, "zero capacity max flow");

        resetCap();
        MaxFlowEdmondsKarp.capOf[0][1] = 2; MaxFlowEdmondsKarp.capOf[1][2] = 2; MaxFlowEdmondsKarp.capOf[2][3] = 2;
        check(MaxFlowEdmondsKarp.bfsAugmentingPath(4, 0, 3), "3-hop path found");
        checkEq(MaxFlowEdmondsKarp.parentOf[3], 2, "3-hop parent of 3");
        checkEq(MaxFlowEdmondsKarp.parentOf[2], 1, "3-hop parent of 2");
        checkEq(MaxFlowEdmondsKarp.parentOf[1], 0, "3-hop parent of 1");
        checkEq(MaxFlowEdmondsKarp.edmondsKarp(4, 0, 3), 2, "3-hop max flow");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
