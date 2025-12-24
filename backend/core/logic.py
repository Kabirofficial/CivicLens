import math
from geopy.geocoders import Nominatim

DEPT_ROADS = "Roads Dept"
DEPT_WASTE = "Sanitation Dept"

geolocator = Nominatim(user_agent="CivicLens_Project_v1")


def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def assign_department(category: str):
    if category in ["pothole", "major_crack"]:
        return DEPT_ROADS
    elif category in ["overflowing", "garbage_pile", "full"]:
        return DEPT_WASTE
    return "General"


def get_location_details(lat: float, lon: float):
    try:
        location = geolocator.reverse((lat, lon), exactly_one=True)
        if not location:
            return None, None, None

        address_dict = location.raw.get("address", {})
        full_address = location.address
        city = (
            address_dict.get("city")
            or address_dict.get("town")
            or address_dict.get("village")
            or address_dict.get("county")
        )
        state = address_dict.get("state")

        return full_address, city, state
    except Exception:
        return "Unknown Location", "Unknown", "Unknown"
