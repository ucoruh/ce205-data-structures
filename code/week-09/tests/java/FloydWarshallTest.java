/* Unit tests for week-09 java/FloydWarshall.java */
public class FloydWarshallTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static void initN(int n) {
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                FloydWarshall.dist[i][j] = (i == j) ? 0 : FloydWarshall.INF;
    }

    public static void main(String[] args) {
        FloydWarshall.floydWarshall(0);
        check(!FloydWarshall.hasNegativeCycle(0), "0 vertices vacuously no negative cycle");

        initN(1);
        FloydWarshall.floydWarshall(1);
        checkEq(FloydWarshall.dist[0][0], 0, "1 vertex self dist");
        check(!FloydWarshall.hasNegativeCycle(1), "1 vertex no negative cycle");

        initN(2);
        FloydWarshall.dist[0][1] = 5;
        FloydWarshall.floydWarshall(2);
        checkEq(FloydWarshall.dist[0][1], 5, "one edge forward");
        checkEq(FloydWarshall.dist[1][0], FloydWarshall.INF, "one edge no reverse");

        initN(3);
        FloydWarshall.dist[0][1] = 10; FloydWarshall.dist[0][2] = 2; FloydWarshall.dist[2][1] = 3;
        FloydWarshall.floydWarshall(3);
        checkEq(FloydWarshall.dist[0][1], 5, "triangle shortcut found");

        initN(4);
        FloydWarshall.dist[0][1] = 1; FloydWarshall.dist[2][3] = 1;
        FloydWarshall.floydWarshall(4);
        checkEq(FloydWarshall.dist[0][2], FloydWarshall.INF, "disconnected pair 1");
        checkEq(FloydWarshall.dist[0][3], FloydWarshall.INF, "disconnected pair 2");
        checkEq(FloydWarshall.dist[0][1], 1, "disconnected pair component 1 intact");
        checkEq(FloydWarshall.dist[2][3], 1, "disconnected pair component 2 intact");

        initN(4);
        FloydWarshall.dist[0][1] = 2; FloydWarshall.dist[1][2] = 3; FloydWarshall.dist[2][3] = 4;
        FloydWarshall.floydWarshall(4);
        checkEq(FloydWarshall.dist[0][2], 5, "chain of 4: 0 to 2");
        checkEq(FloydWarshall.dist[0][3], 9, "chain of 4: 0 to 3");
        checkEq(FloydWarshall.dist[1][3], 7, "chain of 4: 1 to 3");

        initN(3);
        FloydWarshall.dist[0][1] = 1; FloydWarshall.dist[1][2] = 1; FloydWarshall.dist[2][0] = 1;
        FloydWarshall.floydWarshall(3);
        check(!FloydWarshall.hasNegativeCycle(3), "positive triangle no negative cycle");

        initN(3);
        FloydWarshall.dist[0][1] = 1; FloydWarshall.dist[1][2] = 2; FloydWarshall.dist[2][0] = -4;
        FloydWarshall.floydWarshall(3);
        check(FloydWarshall.hasNegativeCycle(3), "classic negative cycle detected");
        check(FloydWarshall.dist[0][0] < 0, "classic negative cycle diagonal negative");

        initN(3);
        FloydWarshall.dist[0][1] = -5; FloydWarshall.dist[1][2] = 2;
        FloydWarshall.floydWarshall(3);
        check(!FloydWarshall.hasNegativeCycle(3), "negative edge without cycle no false positive");
        checkEq(FloydWarshall.dist[0][2], -3, "negative edge without cycle distance");

        initN(2);
        FloydWarshall.dist[0][1] = 3; FloydWarshall.dist[1][0] = -3;
        FloydWarshall.floydWarshall(2);
        check(!FloydWarshall.hasNegativeCycle(2), "zero-sum round trip no negative cycle");
        checkEq(FloydWarshall.dist[0][0], 0, "zero-sum round trip diagonal");

        initN(5);
        FloydWarshall.dist[0][1] = 1; FloydWarshall.dist[1][2] = 1; FloydWarshall.dist[2][3] = 1; FloydWarshall.dist[3][4] = 1; FloydWarshall.dist[0][4] = 10;
        FloydWarshall.floydWarshall(5);
        checkEq(FloydWarshall.dist[0][4], 4, "multi-hop shortest path beats direct edge");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
