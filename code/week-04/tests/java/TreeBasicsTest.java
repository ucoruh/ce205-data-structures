/* Unit tests for week-04 java/TreeBasics.java */
public class TreeBasicsTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) {
        TreeBasics.Node root, probe;

        // -- single node: a trivial tree is its own leaf, height 0, subtree size 1 --
        TreeBasics.Spec[] single = { new TreeBasics.Spec("R", null) };
        root = TreeBasics.buildTree(single);
        checkEq(TreeBasics.height(root), 0, "single height");
        checkEq(TreeBasics.subtreeSize(root), 1, "single subtree size");
        checkEq(root.children.size(), 0, "single child count");
        TreeBasics.computeDepths(root);
        checkEq(root.depth, 0, "single depth");
        check(root.parent == null, "single root has no parent");

        // -- chain (degenerate): 10 nodes, each with exactly one child --
        TreeBasics.Spec[] chain = {
            new TreeBasics.Spec("R", null), new TreeBasics.Spec("C1", "R"), new TreeBasics.Spec("C2", "C1"),
            new TreeBasics.Spec("C3", "C2"), new TreeBasics.Spec("C4", "C3"), new TreeBasics.Spec("C5", "C4"),
            new TreeBasics.Spec("C6", "C5"), new TreeBasics.Spec("C7", "C6"), new TreeBasics.Spec("C8", "C7"),
            new TreeBasics.Spec("C9", "C8")
        };
        root = TreeBasics.buildTree(chain);
        checkEq(TreeBasics.height(root), 9, "chain height");
        checkEq(TreeBasics.subtreeSize(root), 10, "chain subtree size");
        TreeBasics.computeDepths(root);
        checkEq(root.depth, 0, "chain root depth");
        probe = TreeBasics.byLabel.get("C9");
        check(probe != null, "chain find C9");
        checkEq(probe.depth, 9, "chain C9 depth");
        checkEq(probe.children.size(), 0, "chain C9 is a leaf");
        checkEq(TreeBasics.subtreeSize(probe), 1, "chain C9 subtree size");
        check(probe.parent == TreeBasics.byLabel.get("C8"), "chain C9 parent is C8");
        check(TreeBasics.byLabel.get("nope") == null, "chain label not found");

        // -- star: the root has 10 children, every child is a leaf --
        TreeBasics.Spec[] star = {
            new TreeBasics.Spec("R", null), new TreeBasics.Spec("L1", "R"), new TreeBasics.Spec("L2", "R"),
            new TreeBasics.Spec("L3", "R"), new TreeBasics.Spec("L4", "R"), new TreeBasics.Spec("L5", "R"),
            new TreeBasics.Spec("L6", "R"), new TreeBasics.Spec("L7", "R"), new TreeBasics.Spec("L8", "R"),
            new TreeBasics.Spec("L9", "R"), new TreeBasics.Spec("L10", "R")
        };
        root = TreeBasics.buildTree(star);
        checkEq(TreeBasics.height(root), 1, "star height");
        checkEq(root.children.size(), 10, "star root degree");
        checkEq(TreeBasics.subtreeSize(root), 11, "star subtree size");
        probe = TreeBasics.byLabel.get("L5");
        checkEq(TreeBasics.height(probe), 0, "star leaf height");
        checkEq(TreeBasics.subtreeSize(probe), 1, "star leaf subtree size");
        TreeBasics.computeDepths(root);
        checkEq(probe.depth, 1, "star leaf depth");
        check(probe.parent == root, "star leaf parent is root");
        int sibCount = 0;
        for (TreeBasics.Node c : root.children) if (c != probe) sibCount++;
        checkEq(sibCount, 9, "star sibling count");

        // -- bushy tree: A -> B,C,D ; B -> E,F ; C -> G ; D -> H,I,J ; E -> K
        //    depths: A0 B1 C1 D1 E2 F2 G2 H2 I2 J2 K3 -- hand-computed --
        TreeBasics.Spec[] normal = {
            new TreeBasics.Spec("A", null), new TreeBasics.Spec("B", "A"), new TreeBasics.Spec("C", "A"), new TreeBasics.Spec("D", "A"),
            new TreeBasics.Spec("E", "B"), new TreeBasics.Spec("F", "B"), new TreeBasics.Spec("G", "C"), new TreeBasics.Spec("H", "D"),
            new TreeBasics.Spec("I", "D"), new TreeBasics.Spec("J", "D"), new TreeBasics.Spec("K", "E")
        };
        root = TreeBasics.buildTree(normal);
        checkEq(TreeBasics.height(root), 3, "bushy height");
        checkEq(TreeBasics.subtreeSize(root), 11, "bushy subtree size");
        probe = TreeBasics.byLabel.get("D");
        checkEq(TreeBasics.subtreeSize(probe), 4, "bushy D subtree size");
        checkEq(probe.children.size(), 3, "bushy D degree");
        checkEq(TreeBasics.height(probe), 1, "bushy D height");
        probe = TreeBasics.byLabel.get("E");
        checkEq(TreeBasics.height(probe), 1, "bushy E height");
        checkEq(TreeBasics.subtreeSize(probe), 2, "bushy E subtree size");
        TreeBasics.computeDepths(root);
        checkEq(TreeBasics.byLabel.get("A").depth, 0, "bushy A depth");
        checkEq(TreeBasics.byLabel.get("B").depth, 1, "bushy B depth");
        checkEq(TreeBasics.byLabel.get("K").depth, 3, "bushy K depth");
        check(TreeBasics.byLabel.get("K").parent == TreeBasics.byLabel.get("E"), "bushy K parent is E");
        probe = TreeBasics.byLabel.get("G");
        checkEq(probe.parent.children.size(), 1, "bushy G is an only child");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
