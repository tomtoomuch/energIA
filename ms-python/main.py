from fastapi import FastAPI
from pydantic import BaseModel
from ..ms-python.services.graph_loader import build_plants_index, build_regions_index, load_data

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool | None = None

@app.get("/")
def read_root():
    return {"Hello": "World"}

# Etablir une route pour récupérer la liste des centrales
@app.get("/plants")

# Etablir une route pour récupérer la liste des régions
@app.get("/regions")

# Etablir une route pour visualiser le réseau
@app.get("/network")

# Etablir une route pour lancer une simulation
@app.post("/simulate")

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}