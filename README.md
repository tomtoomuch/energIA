



graph_loader.py
    Ce fichier transforme les données brutes du JSON (centrales, liaisons) en une structure que le programme peut utiliser facilement pour calculer des chemins — un graphe
    
    
    
    load_data(path) : ouvre le fichier JSON et le transforme en dictionnaire Python. Rien de plus qu'une lecture de fichier.
    
    build_graph(data) : c'est la partie importante. Elle prend les  liaisons du JSON (plant_edges) 
    et construit un dictionnaire où chaque centrale connaît la liste de ses voisins directs,
    avec pour chacun la distance, les pertes, et la capacité de la liaison. 
    Comme chaque liaison va dans les deux sens, elle l'ajoute deux fois (une fois pour chaque centrale concernée) — 
    sinon on pourrait aller de A vers B mais pas l'inverse.
    
    build_plants_index(data) et build_regions_index(data) : deux dictionnaires bonus, pour retrouver rapidement 
    les infos complètes d'une centrale ou d'une région à partir de son identifiant,
    sans reparcourir toute la liste à chaque fois. 
    Utile pour les étapes suivantes (calcul de marge, priorité locale).
    
    Ce fichier ne connaît ni Flask ni les routes HTTP — il ne fait que manipuler des données. 
    C'est ce que le brief demande ("le code algorithmique séparé des routes HTTP"), et ça permet de le tester tout seul, sans lancer le serveur.
    
    lancer python graph_loader.py


dijkstra.py
    Ce fichier trouve le chemin le moins cher entre deux centrales, en passant par le réseau de liaisons — c'est
    l'algorithme de Dijkstra, qu'on a écrit nous-mêmes sans bibliothèque
    
    On part d'une centrale de départ. On ne connaît encore la distance vers aucune autre centrale 
    (distance "infinie" pour toutes, sauf 0 pour le départ). Ensuite, à chaque tour, on va toujours voir en premier 
    la centrale la plus proche qu'on connaît déjà — jamais une piste au hasard. À partir de cette centrale, 
    on regarde ses voisins directs dans le graphe : si passer par elle donne un chemin plus court que ce qu'on
    savait avant, on met à jour la distance. On répète ça jusqu'à avoir atteint la centrale d'arrivée, ou jusqu'à
    ne plus pouvoir avancer.
    
    3 variables à connaître
    distances : la meilleure distance connue jusqu'ici pour chaque centrale.
    previous : par quelle centrale on est passé juste avant, pour pouvoir reconstruire le chemin complet à la fin
    (sinon on connaît juste la distance, pas le trajet).
    visited : les centrales déjà "réglées", pour ne pas repasser dessus inutilement.

