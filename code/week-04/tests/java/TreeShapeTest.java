/* Unit tests for week-04 java/TreeShape.java
 * Every expected true/false below is hand-derived from the array layout (index arithmetic 2i+1/2i+2),
 * mirroring tests/c/test_tree_shape.c. */
public class TreeShapeTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static boolean balanced(TreeShape.Node n) { return TreeShape.checkBalance(n) != -1; }

    public static void main(String[] args) {
        int[] leafDepth;
        TreeShape.Node root;

        // -- empty tree: root itself is null --
        int[] emptyArr = { TreeShape.SLOT_NONE };
        root = TreeShape.buildTree(emptyArr, 1, 0);
        check(root == null, "empty root is null");
        check(TreeShape.isFull(root) == true, "empty full");
        check(TreeShape.isComplete(root) == true, "empty complete");
        leafDepth = new int[]{-1}; check(TreeShape.isPerfect(root, 0, leafDepth) == true, "empty perfect");
        check(TreeShape.isDegenerate(root) == true, "empty degenerate");
        check(balanced(root) == true, "empty balanced");

        // -- single node: trivially every shape property holds --
        int[] singleArr = { 42 };
        root = TreeShape.buildTree(singleArr, 1, 0);
        check(TreeShape.isFull(root) == true, "single full");
        check(TreeShape.isComplete(root) == true, "single complete");
        leafDepth = new int[]{-1}; check(TreeShape.isPerfect(root, 0, leafDepth) == true, "single perfect");
        checkEq(leafDepth[0], 0, "single leaf depth");
        check(TreeShape.isDegenerate(root) == true, "single degenerate");
        check(balanced(root) == true, "single balanced");

        // -- normal: 12 nodes, complete but NOT full (node "60" has only a left child) --
        int[] normalArr = {50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55};
        root = TreeShape.buildTree(normalArr, 12, 0);
        check(TreeShape.isFull(root) == false, "normal full");
        check(TreeShape.isComplete(root) == true, "normal complete");
        leafDepth = new int[]{-1}; check(TreeShape.isPerfect(root, 0, leafDepth) == false, "normal perfect");
        check(TreeShape.isDegenerate(root) == false, "normal degenerate");
        check(balanced(root) == true, "normal balanced");

        // -- hard: a full caterpillar, 17 nodes: full, not complete, not perfect, not degenerate, not balanced --
        root = TreeShape.buildFullCaterpillar(8, 100, 5);
        check(TreeShape.isFull(root) == true, "hard full");
        check(TreeShape.isComplete(root) == false, "hard complete");
        leafDepth = new int[]{-1}; check(TreeShape.isPerfect(root, 0, leafDepth) == false, "hard perfect");
        check(TreeShape.isDegenerate(root) == false, "hard degenerate");
        check(balanced(root) == false, "hard balanced");

        // -- edge: a perfect tree, 15 nodes --
        int[] perfectArr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
        root = TreeShape.buildTree(perfectArr, 15, 0);
        check(TreeShape.isFull(root) == true, "perfect full");
        check(TreeShape.isComplete(root) == true, "perfect complete");
        leafDepth = new int[]{-1}; check(TreeShape.isPerfect(root, 0, leafDepth) == true, "perfect perfect");
        checkEq(leafDepth[0], 3, "perfect leaf depth");
        check(TreeShape.isDegenerate(root) == false, "perfect degenerate");
        check(balanced(root) == true, "perfect balanced");

        // -- edge: a left-leaning chain (degenerate), 10 nodes --
        int[] chainValues = {90, 84, 78, 72, 66, 60, 54, 48, 42, 36};
        root = TreeShape.buildLeftChain(chainValues);
        check(TreeShape.isFull(root) == false, "chain full");
        check(TreeShape.isComplete(root) == false, "chain complete");
        check(TreeShape.isDegenerate(root) == true, "chain degenerate");
        check(balanced(root) == false, "chain balanced");
        checkEq(root.value, 90, "chain root value");
        checkEq(root.left.left.value, 78, "chain third node down");
        check(root.right == null, "chain root has no right child");

        // -- edge: complete but NOT full, 10 nodes --
        int[] completeNotFullArr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        root = TreeShape.buildTree(completeNotFullArr, 10, 0);
        check(TreeShape.isFull(root) == false, "cnf full");
        check(TreeShape.isComplete(root) == true, "cnf complete");
        check(TreeShape.isDegenerate(root) == false, "cnf degenerate");
        check(balanced(root) == true, "cnf balanced");

        // -- edge: balanced but NOT complete, 11 nodes --
        int[] balancedNotCompleteArr = {1, 2, 3, 4, 5, 6, 7, 8, TreeShape.SLOT_NONE, 9, TreeShape.SLOT_NONE, 10, TreeShape.SLOT_NONE, 11};
        root = TreeShape.buildTree(balancedNotCompleteArr, 14, 0);
        check(TreeShape.isComplete(root) == false, "bnc complete");
        check(TreeShape.isDegenerate(root) == false, "bnc degenerate");
        check(balanced(root) == true, "bnc balanced");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
