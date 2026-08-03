"""Ce fichier trouve le chemin le moins cher entre deux centrales

Le "poids" utilisé ici est la distance en kilomètres (distance_km).
"""


def dijkstra(graph, start, end):

    if start not in graph:
        raise ValueError(f"Centrale de départ inconnue dans le graphe : {start}")
    if end not in graph:
        raise ValueError(f"Centrale d'arrivée inconnue dans le graphe : {end}")


    distances = {node: float("inf") for node in graph}
    distances[start] = 0

    previous = {}

    visited = set()

    while len(visited) < len(graph):

        current = None
        current_distance = float("inf")
        for node, dist in distances.items():
            if node not in visited and dist < current_distance:
                current = node
                current_distance = dist


        if current is None:
            break


        if current == end:
            break

        visited.add(current)


        for edge in graph[current]:
            if not edge["available"]:
                continue

            neighbor = edge["to"]
            weight = edge["distance_km"]
            new_distance = current_distance + weight

            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                previous[neighbor] = current

    if distances[end] == float("inf"):
        return None, None

    # reconstruction du chemin en remontant previous depuis end
    path = [end]
    node = end
    while node != start:
        node = previous[node]
        path.append(node)
    path.reverse()

    return path, distances[end]

