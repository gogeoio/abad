/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
/// <reference path="../services/metrics.ts" />

/**
 * Created by danfma on 07/03/15.
 */

module gogeo {

  class DashboardMapController {
    static $inject = [
      "$scope",
      "$timeout",
      DashboardService.$named,
      MetricsService.$named
    ];

    _concavity: number = 1;
    _lastType: string = null;
    _lastObj: any = null;
    map: L.Map;
    popup: L.Popup;
    query: any = null;
    businessSelected: boolean = true;
    crimesSelected: boolean = false;
    mapTypes: Array<string> = [ "point", "cluster", "intensity" ];
    mapSelected: string = "point";
    baseLayers: L.FeatureGroup<L.ILayer> = null;
    layerGroup: L.LayerGroup<L.ILayer> = null;
    pointsGroup: L.FeatureGroup<L.ILayer> = null;
    hullsGroup: L.FeatureGroup<L.ILayer> = null;
    restricted: boolean = false;
    canOpenPopup: boolean = true;
    baseLayerSelected: string = "day";
    levent: any = null;
    layerNames: Array<string> = [
      Configuration.getBusinessCollection()
      // ,
      // Configuration.getCrimesCollection()
    ];

    constructor(
          private $scope:     ng.IScope,
          private $timeout:   ng.ITimeoutService,
          private service:    DashboardService,
          private metrics:    MetricsService) {
      this.layerGroup = L.layerGroup([]);
      this.baseLayers = L.featureGroup([]);
      this.pointsGroup = L.featureGroup([]);
      this.hullsGroup = L.featureGroup([]);
    }

    initialize(map: L.Map) {
      this.map = map;

      this.baseLayers.addLayer(this.getDayMap());
      this.map.addLayer(this.baseLayers);
      this.map.addLayer(this.pointsGroup);
      this.map.addLayer(this.hullsGroup);

      this.centerMap(-16.678308, -49.256830);

      this.service.pracasObservable
        .where(praca => praca != null)
        .throttle(200)
        .subscribe((praca) => this.addPracaConcaveHull(praca));

      this.service.vendedorObservable
        .where(vendedor => vendedor != null)
        .throttle(200)
        .subscribe((vendedor) => this.addVendedorConcaveHull(vendedor));
    }

    updateConvexHull() {
      this.hullsGroup.removeLayer(this._lastObj["polygon"]);
      this.pointsGroup.removeLayer(this._lastObj["points"]);
      this.addConcaveHull(this._lastType, this._lastObj, true);
    }

    addVendedorConcaveHull(vendObj: any) {
      this.addConcaveHull("vendedor", vendObj);
    }

    addPracaConcaveHull(pracaObj: any) {
      this.addConcaveHull("praca", pracaObj);
    }

    addConcaveHull(type: string, obj: any, forceUpdate?: boolean) {
      var polygon = obj["polygon"];
      var points = obj["points"];

      if (obj["enabled"]) {
        var pracaCod = parseInt(obj["id"]);

        this.addPoints(type, obj);

        if (!polygon || forceUpdate) {
          var request = null;

          if (type === "praca") {
            request = this.service.getPracaConvaveHull(pracaCod, this._concavity);
          } else {
            request = this.service.getVendedorConvaveHull(pracaCod, this._concavity);
          }

          request.then((result: any) => {
            var pointset = result["data"];
            polygon = L.polygon(pointset, {weight: 2, color: obj["color"]});
            obj["polygon"] = polygon;

            this.addPolygonToMap(polygon);
            this._lastType = type;
            this._lastObj = obj;
          });
        } else {
          this.addPolygonToMap(polygon);
          this._lastType = type;
          this._lastObj = obj;
        }

      } else {
        if (polygon) {
          this.hullsGroup.removeLayer(polygon);
        }
        if (points) {
          this.pointsGroup.removeLayer(points);
        }
      }
    }

    addPolygonToMap(polygon: L.Polygon) {
      this.hullsGroup.addLayer(polygon);
      this.map.fitBounds(polygon.getBounds());
      this.hullsGroup.bringToBack();
      this.pointsGroup.bringToFront();
    }

    onEachFeature(feature: any, layer: L.Marker) {
      var popupContent = "";

      if (feature["properties"]) {
        var prop = feature["properties"];

        popupContent = `
          <div class="container" style="width: 310px;">
            <div class="row">
              <div class="col-sm-12">
                <label for="cliente">Cliente</label>
              </div>
            </div>
            <div class="row" style="margin-bottom: 10px;">
              <div class="col-sm-12">
                <span id="cliente">${prop["cliente"]}</span>
              </div>
            </div>
          </div>
        `;
      }

      layer.bindPopup(popupContent);
    }

    addPoints(type: string, obj: any) {
      if (!obj["points"]) {
        var cod = parseInt(obj["id"]);
        var request = null;

        if (type === "praca") {
          request = this.service.getPracaPoints(cod);
        } else {
          request = this.service.getVendedorPoints(cod);
        }

        request.then((result: any) => {
          var geojsonData = result["data"];
          var geojson = L.geoJson(geojsonData, this.geoJsonOptions(obj));
          obj["points"] = geojson;
          this.pointsGroup.addLayer(geojson);
        });
      } else {
        this.pointsGroup.addLayer(obj["points"]);
      }
    }

    geoJsonOptions(obj: any) {
      var color = obj["color"];
      return {
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 4,
            fillColor: color,
            color: color,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
        },
        onEachFeature: this.onEachFeature
      };
    }

    private centerMap(lat: number, lng: number) {
      if (lat && lng) {
        var center = new L.LatLng(lat, lng);
        this.map.setView(center, 5);
      }
    }

    private getDayMap() {
      return new L.Google('ROADMAP');
    }

    private queryHandler(query: any) {
      if (JSON.stringify(query) !== JSON.stringify(this.query)) {
        this.query = query;
        this.updateLayer();
      } else {
        // same query, don't update the map
      }
    }

    private createLayers(layers: Array<string>, stylename?: string): Array<L.ILayer> {
      var array = [];

      layers.forEach((layerName) => {
        var url = this.configureUrl(layerName, stylename);
        var options = {
          subdomains: Configuration.subdomains
        };

        if (["point", "intensity"].indexOf(this.mapSelected) != (-1)) {
          array.push(L.tileLayer(url, options));
        } else if (this.mapSelected === 'cluster') {
          array.push(this.createClusterLayer(url));
        }
      });

      return array;
    }

    private configureUrl(collection: string, stylename?: string): string {
      var database = Configuration.getDatabaseName();
      var buffer = 8;
      var serviceName = "tile.png";

      if (this.mapSelected === "cluster") {
        serviceName = "cluster.json";
      }

      if (this.mapSelected === "intensity") {
        stylename = "gogeo_intensity";
      }

      if (collection === Configuration.getBusinessCollection()) {
        stylename = "gogeo_many_points";
      } else if (collection === Configuration.getCrimesCollection()) {
        stylename = "crimes_style";
      }

      var url = "/map/"
        + database + "/" +
        collection + "/{z}/{x}/{y}/"
        + serviceName + "?buffer=" + buffer + "&mapkey=123";

      if (stylename) {
        url = url + "&stylename=" + stylename;
      }

      if (this.query) {
        url = `${url}&q=${encodeURIComponent(angular.toJson(this.query))}`;
      }

      return Configuration.prefixUrl(url);
    }

    private updateLayer() {
      this.layerGroup.clearLayers();
      var layers = this.createLayers(this.layerNames);

      for (var i in layers) {
        this.layerGroup.addLayer(layers[i]);
      }
    }

    private createClusterLayer(url): L.ILayer {
      var options = {
        subdomains: Configuration.subdomains,
        useJsonP: false
      };

      return new L.TileCluster(url, options);
    }
  }

  registerDirective("dashboardMap", [
    "$timeout",
    ($timeout: ng.ITimeoutService) => {
      return {
        restrict: "C",
        templateUrl: "dashboard/controls/dashboard-map-template.html",
        controller: DashboardMapController,
        controllerAs: "map",
        bindToController: true,

        link(scope, element, attrs, controller:DashboardMapController) {
          var center = new L.LatLng(-16.678308, -49.256830);

          var options = {
            attributionControl: false,
            minZoom: 4,
            maxZoom: 18,
            center: center,
            zoom: 6
          };

          var mapContainerElement = element.find(".dashboard-map-container")[0];
          var map = L.map("map-container", options);

          controller.initialize(map);
          $timeout(() => map.invalidateSize(false), 1);

          scope.$on("$destroy", () => {
            map.remove();
          });
        }
      };
    }
  ]);

  registerDirective("errSrc", function() {
    return {
      link: function(scope, element, attrs) {
        element.bind("error", function() {
          if (attrs.src != attrs.errSrc) {
            attrs.$set("src", attrs.errSrc);
          }
        });
      }
    }
  });
}