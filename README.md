

 ms-python/services/ graph_loader.py
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


 ms-python/services/dijkstra.py
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

ms-python/services/capacity.py
    Ce fichier calcule combien de MW en plus chaque centrale peut encore produire, 
    avant d'atteindre sa limite de sécurité.
    
    chaque centrale a une limite haute qu'elle ne doit jamais dépasser (soft_upper_bound_mw, 
    fixée à 95% de sa puissance installée — une marge de sécurité).
    Elle a aussi une production actuelle (initial_output_mw). La différence entre les deux, c'est ce qu'elle
    peut encore donner : marge = limite − production actuelle.
    
    Pourquoi on garde ramp_limit séparée : une centrale peut avoir beaucoup de marge (par exemple 600 MW),
    mais elle ne peut pas monter en puissance instantanément — elle a une vitesse maximale de montée par tranche de 
    15 minutes (max_ramp_up_mw_per_15_min). On garde cette info à part pour l'instant, parce qu'elle servira plus 
    tard, quand on répartira vraiment la demande entre les centrales (on ne pourra jamais dépasser ni la marge, ni la rampe).
    
    Le cas d'une centrale indisponible : si available est à False dans le JSON, la fonction retourne 0 directement 
    — on ne peut rien demander à une centrale hors service, peu importe sa marge théorique.
    
    le fichier JSON contient déjà, pour chaque centrale, un champ initial_dispatchable_margin_mw — une valeur de 
    référence. Notre fonction dispatchable_margin doit retourner exactement ce nombre. Par exemple pour golfech, 
    le JSON dit 89, et notre fonction doit donner 89.0. C'est une vérification simple et convaincante à
    montrer   otre calcul retombe sur les chiffres officiels du jeu de données 
