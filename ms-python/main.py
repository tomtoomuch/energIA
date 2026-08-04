from fastapi import FastAPI
from pydantic import BaseModel
from .services.graph_loader import load_data, build_plants_index, build_regions_index, build_graph

app = FastAPI()

# Charger les données
data = load_data()
plants_index = build_plants_index(data)
regions_index = build_regions_index(data)

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool | None = None

@app.get("/")
def read_root():
    return {"Hello": "World"}

# Etablir une route pour récupérer la liste des centrales
@app.get("/plants")
def read_plants():
    return list(plants_index.values())

# Etablir une route pour récupérer la liste des régions
@app.get("/regions")
def read_regions():
    return list(regions_index.values())

# Etablir une route pour visualiser le réseau
@app.get("/network")
def read_network():
    return build_graph(data)

# Etablir une route pour lancer une simulation
@app.post("/simulate")

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}