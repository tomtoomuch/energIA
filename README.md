



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