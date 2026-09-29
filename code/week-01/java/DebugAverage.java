/* Week 1 -- Introduction to Data Structures
 * averageBuggy() truncates because of integer division; averageFixed() casts to double first.
 * Runs the same normal / hard / edge-case scenarios as the debugger-stepping animation.
 * CEN207 Data Structures (formerly CE205)
 */
public class DebugAverage {
    static int averageBuggy(int[] arr) {
        if (arr.length == 0) return 0;
        int sum = 0;
        for (int x : arr) sum += x;
        return sum / arr.length;          // bug: integer division truncates
    }

    static double averageFixed(int[] arr) {
        if (arr.length == 0) return 0.0;
        int sum = 0;
        for (int x : arr) sum += x;
        return (double) sum / arr.length; // fix: promote to double before dividing
    }

    static void runScenario(String label, int[] arr) {
        System.out.println("-- " + label + " --");
        StringBuilder sb = new StringBuilder("arr:");
        for (int v : arr) sb.append(' ').append(v);
        sb.append("  (n = ").append(arr.length).append(')');
        System.out.println(sb);
        System.out.println("average_buggy  -> " + averageBuggy(arr));
        System.out.printf("average_fixed  -> %.2f%n%n", averageFixed(arr));
    }

    public static void main(String[] args) {
        // normal: 10 elements, the bug shows
        int[] normal = {7, 8, 8, 9, 6, 10, 7, 8, 9, 9};
        runScenario("normal: 10 elements, the bug shows", normal);

        // hard: 16 elements, negative values
        int[] hard = {-5, 3, -8, 12, -1, 7, -10, 4, 9, -6, 2, -3, 8, -7, 1, 5};
        runScenario("hard: 16 elements, negative values", hard);

        // edge: empty array, the division-by-zero guard
        runScenario("edge: empty array (division-by-zero guard)", new int[0]);

        // edge: a single element
        int[] single = {7};
        runScenario("edge: a single element", single);
    }
}
