/* Week 9 -- Graph Algorithms
 * Floyd-Warshall all-pairs shortest paths: an N x N distance matrix, tried
 * as an intermediate stop vertex by vertex. For a fixed k, dist[i][k] and
 * dist[k][j] never change during that pass, so the matrix can be updated in
 * place. A negative diagonal entry dist[v][v] < 0 means v lies on a
 * negative cycle.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <string.h>

#define MAX_V 32
#define MAX_LBL 4
#define INF 1000000000

char label[MAX_V][MAX_LBL];
int vertex_count;
int dist[MAX_V][MAX_V];

void floyd_warshall(int vertex_cnt) {
    for (int k = 0; k < vertex_cnt; k++) {          /* try every vertex as an intermediate stop */
        for (int i = 0; i < vertex_cnt; i++) {
            for (int j = 0; j < vertex_cnt; j++) {
                if (dist[i][k] == INF || dist[k][j] == INF) continue;   /* no path through k */
                int through = dist[i][k] + dist[k][j];
                if (through < dist[i][j]) dist[i][j] = through;
            }
        }
    }
}

int has_negative_cycle(int vertex_cnt) {
    for (int v = 0; v < vertex_cnt; v++)
        if (dist[v][v] < 0) return 1;               /* a path from v back to v got shorter than 0 */
    return 0;
}

static int find_or_add_vertex(const char *lbl) {
    for (int i = 0; i < vertex_count; i++)
        if (strcmp(label[i], lbl) == 0) return i;
    strncpy(label[vertex_count], lbl, MAX_LBL - 1);
    label[vertex_count][MAX_LBL - 1] = '\0';
    return vertex_count++;
}

typedef struct { const char *a, *b; int w; } EdgeIn;

static void run_scenario(const char *label_txt, EdgeIn edges[], int n) {
    printf("-- %s --\n", label_txt);
    vertex_count = 0;
    for (int i = 0; i < n; i++) { find_or_add_vertex(edges[i].a); find_or_add_vertex(edges[i].b); }

    for (int i = 0; i < vertex_count; i++)
        for (int j = 0; j < vertex_count; j++)
            dist[i][j] = (i == j) ? 0 : INF;
    for (int i = 0; i < n; i++) {
        int a = find_or_add_vertex(edges[i].a), b = find_or_add_vertex(edges[i].b);
        if (edges[i].w < dist[a][b]) dist[a][b] = edges[i].w;
    }

    floyd_warshall(vertex_count);

    printf("distance matrix:\n");
    printf("   ");
    for (int j = 0; j < vertex_count; j++) printf(" %3s", label[j]);
    printf("\n");
    for (int i = 0; i < vertex_count; i++) {
        printf("%3s", label[i]);
        for (int j = 0; j < vertex_count; j++) {
            if (dist[i][j] == INF) printf(" inf");
            else printf(" %3d", dist[i][j]);
        }
        printf("\n");
    }

    int neg = has_negative_cycle(vertex_count);
    if (neg) {
        printf("negative cycle at:");
        for (int v = 0; v < vertex_count; v++) if (dist[v][v] < 0) printf(" %s", label[v]);
        printf("\n");
    } else {
        printf("no negative cycle\n");
    }
    printf("\n");
}

int main(void) {
    EdgeIn normal[] = {
        {"A", "B", 3}, {"A", "C", 8}, {"A", "E", -4}, {"B", "D", 1},
        {"B", "E", 7}, {"C", "B", 4}, {"D", "A", 2}, {"D", "C", -5},
        {"E", "D", 6}, {"C", "E", 2}
    };
    run_scenario("normal: 5 vertices, 10 edges, negative edges but no negative cycle", normal, 10);

    EdgeIn hard[] = {
        {"A", "B", 2}, {"B", "C", 3}, {"A", "C", 8}, {"C", "D", 1},
        {"D", "B", -2},
        {"X", "Y", 4}, {"Y", "Z", 2}, {"Z", "X", 1}, {"X", "Z", 9},
        {"Y", "X", 5}, {"Z", "Y", 3}
    };
    run_scenario("hard: 6 vertices, 11 edges, some pairs stay disconnected (distance remains inf)", hard, 11);

    EdgeIn negative_cycle[] = {
        {"A", "B", 1}, {"B", "C", 2}, {"C", "A", -4}, {"A", "D", 3},
        {"D", "E", 2}, {"B", "D", 5}, {"C", "E", 1}, {"D", "A", 6},
        {"E", "B", 2}, {"E", "C", 3}
    };
    run_scenario("edge: A-B-C-A is a negative cycle, 10 edges", negative_cycle, 10);

    EdgeIn two_vertices[] = { {"A", "B", 5} };
    run_scenario("edge: 2 vertices, 1 edge", two_vertices, 1);

    return 0;
}
