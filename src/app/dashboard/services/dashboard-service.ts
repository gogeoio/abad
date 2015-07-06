///<reference path="../../shell.ts" />
///<reference path="../../shared/controls/queries.ts"/>
///<reference path="../../shared/controls/dashboard-query.ts"/>
///<reference path="../../shared/controls/gogeo-geosearch.ts"/>
///<reference path="../../shared/controls/gogeo-geoagg.ts"/>
///<reference path="./metrics.ts"/>

/**
 * Created by danfma on 07/03/15.
 */

module gogeo {
  export class DashboardService {
    static $named = "dashboardService";
    static $inject = [
      "$q",
      "$http",
      "$location",
      "$timeout",
      "$routeParams"
    ];

    private _lastGeomSpace:IGeomSpace = null;
    private _loading: boolean = true;
    private _lastRadius: number = 0;

    private worldBound: IGeom = {
      type: "Polygon",
      coordinates: [
        [
        [
          -201.09375,
          -81.97243132048264
        ],
        [
          -201.09375,
          84.86578186731522
        ],
        [
          201.09375,
          84.86578186731522
        ],
        [
          201.09375,
          -81.97243132048264
        ],
        [
          -201.09375,
          -81.97243132048264
        ]
        ]
      ]
    };

    _lastQueryObservable = new Rx.BehaviorSubject<any>(null);
    _lastCircleObservable = new Rx.BehaviorSubject<L.LatLng>(null);
    _lastCensusObservable = new Rx.BehaviorSubject<Array<ICensusDocument>>(null);
    _lastPracasObservable = new Rx.BehaviorSubject<any>(null);
    _lastVendedorObservable = new Rx.BehaviorSubject<any>(null);

    constructor(private $q:     ng.IQService,
          private $http:        ng.IHttpService,
          private $location:    ng.ILocationService,
          private $timeout:     ng.ITimeoutService,
          private $routeParams: ng.route.IRouteParamsService) {
    }

    get loading(): boolean {
      return this._loading;
    }

    public isLoading(): boolean {
      return this._loading;
    }

    get queryObservable():Rx.Observable<any> {
      return this._lastQueryObservable;
    }

    get circleObservable():Rx.Observable<L.LatLng> {
      return this._lastCircleObservable;
    }

    get censusObservable():Rx.Observable<Array<ICensusDocument>> {
      return this._lastCensusObservable;
    }

    get pracasObservable():Rx.Observable<any> {
      return this._lastPracasObservable;
    }

    get vendedorObservable():Rx.Observable<any> {
      return this._lastVendedorObservable;
    }

    updatePracas(praca: any) {
      this._lastPracasObservable.onNext(praca);
    }

    updateVendedores(vendedor: any) {
      this._lastVendedorObservable.onNext(vendedor);
    }

    getRadius(): number {
      return this._lastRadius;
    }

    updateRadius(radius: number) {
      this._lastRadius = radius;
    }

    updateDashboardData(point: L.LatLng) {
      this._lastCircleObservable.onNext(point);
    }

    getVendedorConvaveHull(vendedor: number, concavity?: number) {
      var params = {
        q: this.getVendedorQuery(vendedor),
        concavity: concavity || 1
      };
      return this.getConcaveHull(params);
    }

    getPracaConvaveHull(praca: number, concavity?: number) {
      var params = {
        q: this.getPracaQuery(praca),
        concavity: concavity || 1
      };
      return this.getConcaveHull(params);
    }

    getVendedorPoints(vendedor: number) {
      var params = {
        fields: [ "cliente", "cod_praca", "cod_vendedor" ],
        q: this.getVendedorQuery(vendedor),
        limit: 500
      };
      return this.getPoints(params);
    }

    getPracaPoints(praca: number) {
      var params = {
        fields: [ "cliente", "cod_praca", "cod_vendedor" ],
        q: this.getPracaQuery(praca),
        limit: 500
      };
      return this.getPoints(params);
    }

    getVendedorQuery(vendedor: number) {
      return {
        query: {
          term: {
            cod_vendedor: vendedor
          }
        }
      };
    }

    getPracaQuery(praca: number) {
      return {
        query: {
          term: {
            cod_praca: praca
          }
        }
      };
    }

    getPoints(params) {
      var url = Configuration.getExperimental('geojson');
      return this.$http.get(url, {params: params});
    }

    getConcaveHull(params) {
      var url = Configuration.getExperimental('hull');
      return this.$http.get(url, {params: params});
    }

    updateCrimesDateHistogram(geom: IGeom, result: IGogeoGeoAgg) {
      var queries: Array<MatchPhraseQuery> = [];

      result.buckets.slice(0, 5).forEach((item: IBucket) => {
        var matchQuery = new MatchPhraseQuery(Configuration.getCrimesCategory(), item.key);
        queries.push(matchQuery);
      });

      var boolQuery = new BoolQuery();

      queries.forEach((q: Query) => {
        boolQuery.addMustQuery(q);
      });

      // console.log("matchQuery", JSON.stringify(boolQuery.build(), null, 2));
      // console.log();
    }

    businessGeoAgg(geom: IGeom) {
      return this.getGogeoGeoAgg(geom, Configuration.getBusinessCollection(), "state");
    }

    getGogeoGeoAgg(geom: IGeom, collectionName: string, field: string) {
      return new GogeoGeoagg(this.$http, geom, collectionName, field, this._lastRadius);
    }

    censusGeoSearch(geom: IGeom) {
      var fields = Configuration.getCensusFields();
      return new GogeoGeosearch(this.$http, geom, Configuration.getCensusCollection(), this._lastRadius, "kilometer", fields, 10);
    }

    updateCensus(geom: IGeom) {
      var ggsc = this.censusGeoSearch(geom);

      ggsc.execute((result: Array<ICensusDocument>) => {
        this._lastCensusObservable.onNext(result);
      });
    }

    private calculateNeSW(bounds: L.LatLngBounds) {
      var ne = new L.LatLng(bounds.getNorthEast().lng, bounds.getNorthEast().lat);
      var sw = new L.LatLng(bounds.getSouthWest().lng, bounds.getSouthWest().lat);

      return new NeSwPoint(ne, sw);
    }

    private pointToGeoJson(point: NeSwPoint): IGeomSpace {
      var ne = [point.ne.lat, point.ne.lng];
      var sw = [point.sw.lat, point.sw.lng];

      var nw = [sw[0], ne[1]];
      var se = [ne[0], sw[1]];

      var coordinates = [
        [
          sw, nw, ne, se, sw
        ]
      ];

      return {
        source: "mapBounds",
        type: "Polygon",
        coordinates: coordinates
      }
    }
  }

  registerService(DashboardService);
}