/// <reference path="../leaflet/leaflet.d.ts"/>

interface LGeoStatic {
  circle(center: L.LatLng, radius: number, options?: any): L.Polygon;
}

declare var LGeo: LGeoStatic;