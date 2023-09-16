function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;

    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    lat1 = toRadians(lat1);
    lon1 = toRadians(lon1);
    lat2 = toRadians(lat2);
    lon2 = toRadians(lon2);

    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;

    const a = Math.pow(Math.sin(dlat / 2), 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.pow(Math.sin(dlon / 2), 2);

    const distance = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return distance;
}

export function getClosestBuilding(lat, lon, radius, buildingsJSON) {
    let closestBuilding = null;
    let closestDistance = Infinity;

    for (const buildingName in buildingsJSON) {
        if (buildingsJSON.hasOwnProperty(buildingName)) {
            const building = buildingsJSON[buildingName];
            const distance = haversineDistance(lat, lon, building.latitude, building.longitude);

            if (distance < radius && distance < closestDistance) {
                closestDistance = distance;
                closestBuilding = buildingName;
            }
        }
    }

    return closestBuilding ? closestBuilding : "None";
}