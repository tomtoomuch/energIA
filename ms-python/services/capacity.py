# Calcul de la puissance mobilisable pour une centrale


def dispatchable_margin(plant):


    sim = plant["simulation"]

    if not sim["available"]:
        return 0.0

    margin = sim["soft_upper_bound_mw"] - sim["initial_output_mw"]
    return max(0.0, margin)


def ramp_limit(plant):
    """Vitesse maximale de montée en puissance (MW / 15 minutes) pour cette centrale."""
    return plant["simulation"]["max_ramp_up_mw_per_15_min"]


def dispatchable_margins_all(data):
    """Pareil que dispatchable_margin, mais pour toutes les centrales à la fois."""
    return {plant["id"]: dispatchable_margin(plant) for plant in data["plants"]}


if __name__ == "__main__":
    from graph_loader import load_data

    data = load_data()
    margins = dispatchable_margins_all(data)

    for plant_id, margin in margins.items():
        print(plant_id, margin)