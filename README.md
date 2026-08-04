# Projet ENERGIA : Système d'aide à la décision pour le pilotage de parc nucléaire

Ce projet est une intervention complète visant à moderniser le système d'aide à la décision (SAD) d'un grand compte du secteur de l'énergie. Son objectif principal est de déterminer, en temps réel et de manière optimale, un ajustement des ressources de production capable de satisfaire les besoins énergétiques fluctuants observés sur le réseau nucléaire, ou de quantifier précisément le déficit en cas d'impossibilité de couverture.

## Architecture globale du système

Le système est conçu selon une architecture orientée microservices pour garantir la scalabilité et l'isolation des préoccupations (separation of concerns). Le flux de données suit un chemin strict, passant toujours par une passerelle unique.

### Schéma de flux séquentiel

```mermaid
---
config:
  layout: elk
title: Architecture Prototyppe Moteur Prescriptif ENERGIA
---
sequenceDiagram
    participant C as Client (Application Externe)
    participant G as Gateway Express (Passerelle A.P.I.)
    participant P as Microservice Python (Flask Backend)
    participant A as Algorithm Core (modélisation graph et scoring)

    C->>G: 1. Requête HTTP (Nécessité énergétique)
    Note over G: Traitement de l'authentification et du formatage des données.
    G->>P: 2. Transfert de la requête au micro-service Python (http://ms-python:8000)
    P->>A: 3. Initialisation du traitement (Chargement Graphique + Calcul)
    Note over A: Dijkstra, Calcul des capacités disponibles, Scoring multi-critères.
    A-->>P: 4. Résultat calculé (Plan de répartition optimal ou déficit).
    P-->>G: 5. Réponse structurée et formatée.
    G-->>C: 6. Retour à l'utilisateur final.
```

### Composants techniques principaux

* **Gateway Express (gateway/):** la passerelle API (Node.js/Express).
    C'est le seul point d'entrée autorisé pour tout client externe. Elle gère le routage, la validation des requêtes et assure que les communications internes se font via un protocole strict vers le backend Python.

* **Service Python (ms-python/):** le cœur de la logique métier.
    Ce micro-service implémente l'ensemble des calculs complexes : modélisation du réseau, algorithmes de cheminement et d'optimisation. Il est construit en utilisant Flask pour exposer ses fonctionnalités via une API REST interne.

* **Moteur algorithmique (modélisation graph) : ** les traitements lourds
    **Modélisation :** Traitement des données du parc nucléaire (nodes/sommets = centrales, edges/arêtes = liaisons).
    **Optimisation de cheminement :** Implémentation de l'algorithme de Dijkstra pour trouver le chemin le plus court entre deux points dans le réseau maillé.
    **Calcul des capacités disponibles :** Détermination de la puissance disponible en fonction du minimum entre les limites supérieures (soft upper bound) et la rampe de montée maximale (max_ramp_up_mw_per_15_min).

#### ms-python/services/**graph_loader.py**

Ce fichier transforme les données brutes du JSON (centrales, liaisons) en une structure que le programme peut utiliser facilement pour calculer des chemins — un graphe

* **load_data(path) :** ouvre le fichier JSON et le transforme en dictionnaire Python. Rien de plus qu'une lecture de fichier.

* **build_graph(data) :** c'est la partie importante. Elle prend les liaisons du JSON (plant_edges) et construit un dictionnaire où chaque centrale connaît la liste de ses voisins directs, avec pour chacun la distance, les pertes, et la capacité de la liaison. Comme chaque liaison va dans les deux sens, elle l'ajoute deux fois (une fois pour chaque centrale concernée) — sinon on pourrait aller de A vers B mais pas l'inverse.

* **build_plants_index(data)** et **build_regions_index(data) :** deux dictionnaires bonus, pour retrouver rapidement les infos complètes d'une centrale ou d'une région à partir de son identifiant, sans reparcourir toute la liste à chaque fois. Utile pour les étapes suivantes (calcul de marge, priorité locale).

>Ce fichier n'intègre ni Flask ni les routes HTTP — il ne fait que manipuler des données, dans le respect du principe de séparation des responsabilités. C'est ce que le brief demande ("le code algorithmique séparé des routes HTTP"), et ça permet de le tester tout seul, sans lancer le serveur.
>Pour tester, lancer un terminal et appeller : ```python graph_loader.py```

#### ms-python/services/**dijkstra.py**

Ce fichier trouve le chemin le moins cher entre deux centrales, en passant par le réseau de liaisons — c'est
l'algorithme de Dijkstra, qu'on a écrit nous-mêmes sans bibliothèque

On part d'une centrale de départ. On ne connaît encore la distance vers aucune autre centrale 
(distance "infinie" pour toutes, sauf 0 pour le départ). Ensuite, à chaque tour, on va toujours voir en premier 
la centrale la plus proche qu'on connaît déjà — jamais une piste au hasard. À partir de cette centrale, 
on regarde ses voisins directs dans le graphe : si passer par elle donne un chemin plus court que ce qu'on
savait avant, on met à jour la distance. On répète ça jusqu'à avoir atteint la centrale d'arrivée, ou jusqu'à
ne plus pouvoir avancer.

**3 variables à connaître**
    **distances :** la meilleure distance connue jusqu'ici pour chaque centrale.
    **previous :** par quelle centrale on est passé juste avant, pour pouvoir reconstruire le chemin complet à la fin (sinon on connaît juste la distance, pas le trajet).
    **visited :** les centrales déjà "réglées", pour ne pas repasser dessus inutilement.

#### ms-python/services/**capacity.py**

Ce fichier calcule combien de MW en plus chaque centrale peut encore produire, avant d'atteindre sa limite de sécurité.

Chaque centrale a une limite haute qu'elle ne doit jamais dépasser (soft_upper_bound_mw - fixée à 95% de sa puissance installée - une marge de sécurité).
Elle a aussi une production actuelle (initial_output_mw). La différence entre les deux, c'est ce qu'elle peut encore donner : marge = limite − production actuelle.

Pourquoi on garde ramp_limit séparée : une centrale peut avoir beaucoup de marge (par exemple 600 MW), mais elle ne peut pas monter en puissance instantanément — elle a une vitesse maximale de montée par tranche de 15 minutes (max_ramp_up_mw_per_15_min). On garde cette info à part pour l'instant, parce qu'elle servira plus tard, quand on répartira vraiment la demande entre les centrales (on ne pourra jamais dépasser ni la marge, ni la rampe).

Le cas d'une centrale indisponible : si available est à False dans le JSON, la fonction retourne 0 directement — on ne peut rien demander à une centrale hors service, peu importe sa marge théorique.

le fichier JSON contient déjà, pour chaque centrale, un champ initial_dispatchable_margin_mw — une valeur de référence. Notre fonction dispatchable_margin doit retourner exactement ce nombre. Par exemple pour Golfech, le JSON dit 89, et notre fonction doit donner 89.0. C'est une vérification simple et convaincante à montrer notre calcul retombe sur les chiffres officiels du jeu de données.

### Données utilisées

Les données sont structurées autour des trois piliers suivants :

* **Graphe du réseau :** Représentation physique des centrales et liaisons (pondérées par la distance, les pertes techniques et la capacité maximale).
* **Données géographiques :** Incluant la segmentation en régions et un inventaire de centrales.
* **Besoin régional :** Le flux d'entrée qui déclenche toute simulation (le besoin de MW).

### Méthodologie algorithmique détaillée

L'algorithme principal est une cascade séquentielle de calculs visant à produire le plan optimal avec le score minimal.
**Priorisation des Sources :** La recherche priorise toujours les centrales locales (dans la région demandée) avant d'explorer tout le graphe via Dijkstra, garantissant une logique opérationnelle terrain.

**Calcul du Score Global :** Chaque centrale candidate reçoit un score composite pour évaluer son meilleur rôle dans la réponse énergétique :
\[
\text{Score} = (\text{Distance}_{\text{km}} \times 1.0) + (\text{Pertes}_{\%} \times 45.0) + ((\text{Taux de Charge Final})^4 \times 900.0) + \text{Pénalité Technique} \times 200.0 - [250 \text{ si centrale locale}]
\]Le plus petit score indique la candidate la plus performante pour répondre au besoin global.

**Répartition de la demande :** Les candidates sont triées par ordre croissant de leur Score. La demande est ensuite distribuée séquentiellement à chaque centrale, en respectant sa marge disponible (sans dépasser ni le plafond ni les limites des liaisons).

**Cas d'échec :** Si le total cumulé des MW disponibles reste inférieur au besoin initial, le système doit impérativement répondre avec le nombre exact de MWh manquants et un message clair.

### Tests Unitaires

Le système doit être robuste et le test des comportements suivants est crucial :

* Chemin simple Dijkstra fonctionnel
* Scénario d'absence de chemin viable (connectivité rompue)
* Calcul précis de la capacité disponible en cas de contrainte technique
* Satisfaction totale ou partielle de la demande énergétique simulée

## Démarrage et utilisation

### Prérequis techniques

* **Python :** Des dépendances spécifiques sont listées dans ms-python/requirements.txt.
* **Node.js :** La passerelle d'API requiert un environnement Node.js actif.

### Lancement de l'environnement (via Docker)

L'environnement complet est géré via le fichier docker-compose.yml à la racine :
```docker compose up --build```

**Ce processus lance simultanément :**

* Le micro-service Python (ms-python) écoutant sur le port 8000 (interne).
* La passerelle Node.js (gateway) écoutant sur le port 3000 (externe).

### Terminaisons _(Endpoints)_ de l'API  exposé(e)s

| Service         | Endpoint  | Méthode  | Description                                                   |
| --------------- | --------- | -------- | ------------------------------------------------------------- |
| Gateway Express | /gateway  | GET/POST | Point d'entrée client pour toute simulation                   |
| ms Python       | /plants   | GET      | Récupère la liste de toutes les centrales du parc             |
| ms Python       | /regions  | GET      | Liste des régions géographiques couvertes                     |
| ms Python       | /network  | GET      | Détails structurels et topologiques du réseau                 |
| ms Python       | /simulate | POST     | Endpoint principal. Reçoit un besoin énergétique et déclenche |

**Important :**
Le client ne doit jamais communiquer directement avec le service Python.
Toute interaction doit passer par la Gateway Express (port 3000).
