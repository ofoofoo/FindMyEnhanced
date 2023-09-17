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

  const a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  const distance = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return distance;
}

export function getClosestBuilding(lat, lon, radius, buildings) {
  let closestBuilding = null;
  let closestDistance = Infinity;

  for (const buildingName in buildings) {
    if (buildings.hasOwnProperty(buildingName)) {
      const building = buildings[buildingName];
      const distance = haversineDistance(lat, lon, building.latitude, building.longitude);
      if (distance < radius && distance < closestDistance) {
        closestDistance = distance;
        closestBuilding = buildingName;
      }
    }
  }

  return closestBuilding ? closestBuilding : "None";
}

export function calculateHeatData(interactions, buildings) {
  interactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const timeSpent = {};
  const normalizedTimeSpent = {};
  let totalTime = 0;

  for (let i = 0; i < interactions.length; i++) {
    const current = interactions[i];
    const next = interactions[i + 1];

    const key = current.building;
    if (!timeSpent[key]) {
      timeSpent[key] = 0;
    }

    if (next) {
      const timeDifference = new Date(next.timestamp) - new Date(current.timestamp);
      timeSpent[key] += timeDifference;
      totalTime += timeDifference;
    } else {
      const timeDifference = new Date() - new Date(current.timestamp);
      timeSpent[key] += timeDifference;
      totalTime += timeDifference;
    }
  }

  for (const key in timeSpent) {
    normalizedTimeSpent[key] = timeSpent[key] / totalTime;
  }
  console.log(timeSpent);
  console.log(normalizedTimeSpent);

  const heatMapData = [];
  for (const buildingName in buildings) {
    const building = buildings[buildingName];
    const normalizedTime = normalizedTimeSpent[buildingName];
    if (normalizedTime !== undefined) {
      heatMapData.push([building.latitude, building.longitude, 5 + Math.sqrt(normalizedTime)]);
    }
  }

  return heatMapData;
}
