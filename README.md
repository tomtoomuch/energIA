<!-- README.md -->
# README

## Définition du projet

### Contexte

Intervention pour un grand compte de l'énergie souhaitant moderniser son système d'aide à la décision pour le pilotage de son parc nucléaire. Le besoin identifié est clair : les besoins en énergie, en fonction des fluctuations de consommation doivent être détecter et déclencher un ajustement des ressources de production qui satisferont ce besoin, ou ne pourront pas.

### Données

Données disponibles au format JSON -> importation dans mongoDB ?

### Architecture

```mermaid
---
config:
  layout: elk
---
sequenceDiagram
    participant Client
    participant GatewayExpress as Gateway Express
    participant ServicePython as Service Python (Flask)
    participant Algorithm as Algorithm (Graph + Dijkstra + Score)

    Client->>GatewayExpress: Request
    GatewayExpress->>ServicePython: Forward Request
    ServicePython->>Algorithm: Process with Graph & Dijkstra
    Algorithm->>Algorithm: Calculate Shortest Path
    Algorithm->>Algorithm: Compute Score
    Algorithm-->>ServicePython: Return Result
    ServicePython-->>GatewayExpress: Response
    GatewayExpress-->>Client: Return Response
```

## Installation


## Utilisation





