/* Week 9 -- Graph Algorithms
 * Maximum flow by EDMONDS-KARP: repeatedly BFS the RESIDUAL graph (an edge
 * may still be used if capacity minus flow already sent is positive) for
 * the SHORTEST augmenting path from s to t, push the bottleneck, and repeat
 * until no path remains. Pushing flow forward on an edge also opens
 * capacity on its REVERSE edge.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>

#define MAX_V 32
#define MAX_LBL 4
#define INF 1000000000

char label[MAX_V][MAX_LBL];
int vertex_count;
int cap_of[MAX_V][MAX_V];    /* residual capacity; reverse pairs start at 0 unless also a given edge */
int parent_of[MAX_V];

int bfs_augmenting_path(int vertex_cnt, int s, int t) {   /* shortest path using cap_of > 0 only */
    int visited[MAX_V] = {0}, queue_data[MAX_V], front = 0, rear = 0;
    visited[s] = 1; queue_data[rear] = s; rear++;
    while (front < rear) {
        int u = queue_data[front]; front++;
        for (int v = 0; v < vertex_cnt; v++)              /* alphabetical order */
            if (!visited[v] && cap_of[u][v] > 0) { visited[v] = 1; parent_of[v] = u; queue_data[rear] = v; rear++; }
    }
    return visited[t];
}

int edmonds_karp(int vertex_cnt, int s, int t) {
    int max_flow = 0;
    while (bfs_augmenting_path(vertex_cnt, s, t)) {
        int bottleneck = INF;
        for (int v = t; v != s; v = parent_of[v]) {
            int u = parent_of[v];
            if (cap_of[u][v] < bottleneck) bottleneck = cap_of[u][v];
        }
        for (int v = t; v != s; v = parent_of[v]) {
            int u = parent_of[v];
            cap_of[u][v] -= bottleneck;                      /* use up forward capacity */
            cap_of[v][u] += bottleneck;                      /* open up backward (undo) capacity */
        }
        max_flow += bottleneck;
    }
    return max_flow;
}

static int find_or_add_vertex(const char *lbl) {
    for (int i = 0; i < vertex_count; i++)
        if (strcmp(label[i], lbl) == 0) return i;
    strncpy(label[vertex_count], lbl, MAX_LBL - 1);
    label[vertex_count][MAX_LBL - 1] = '\0';
    return vertex_count++;
}

typedef struct { const char *a, *b; int cap; } EdgeIn;

static void run_scenario(const char *label_txt, const char *s_label, const char *t_label, EdgeIn edges[], int n) {
    printf("-- %s --\n", label_txt);
    vertex_count = 0;
    for (int i = 0; i < MAX_V; i++) for (int j = 0; j < MAX_V; j++) cap_of[i][j] = 0;
    for (int i = 0; i < n; i++) {
        int a = find_or_add_vertex(edges[i].a), b = find_or_add_vertex(edges[i].b);
        cap_of[a][b] = edges[i].cap;
    }
    int s = find_or_add_vertex(s_label), t = find_or_add_vertex(t_label);

    int max_flow = edmonds_karp(vertex_count, s, t);
    printf("max flow from %s to %s = %d\n\n", label[s], label[t], max_flow);
}

int main(void) {
    EdgeIn normal[] = {
        {"A", "B", 6}, {"A", "C", 4}, {"B", "C", 2}, {"B", "D", 5},
        {"C", "E", 4}, {"D", "E", 1}, {"D", "F", 4}, {"E", "F", 6},
        {"C", "D", 3}, {"A", "D", 2}
    };
    run_scenario("normal: 6 vertices, 10 edges, A to F", "A", "F", normal, 10);

    EdgeIn hard[] = {
        {"A", "B", 10}, {"A", "C", 8}, {"B", "C", 5}, {"B", "D", 5},
        {"C", "D", 3}, {"C", "E", 6}, {"D", "E", 2}, {"D", "F", 8},
        {"E", "F", 4}, {"E", "G", 6}, {"F", "H", 9}, {"G", "H", 7},
        {"F", "G", 3}, {"B", "E", 4}
    };
    run_scenario("hard: 8 vertices, 14 edges, A to H, needs several augmenting paths", "A", "H", hard, 14);

    EdgeIn no_path[] = {
        {"A", "B", 3}, {"B", "C", 4}, {"A", "C", 2}, {"C", "D", 5}, {"D", "E", 1},
        {"F", "G", 2}, {"G", "H", 6}, {"H", "I", 3}, {"I", "J", 4}, {"F", "J", 1}
    };
    run_scenario("edge: A and J are in two separate components -- max flow is 0", "A", "J", no_path, 10);

    EdgeIn two_vertices[] = { {"A", "B", 7} };
    run_scenario("edge: 2 vertices, 1 edge", "A", "B", two_vertices, 1);

    return 0;
}
