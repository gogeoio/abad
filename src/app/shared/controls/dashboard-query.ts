module gogeo {
  export class DashboardQuery {
    requestData: any = {};

    constructor(private $http: ng.IHttpService, geomSpace: IGeomSpace) {
      
    }

    getMust() {
      return this.requestData.q.query.bool.must;
    }

    execute(resultHandler:(IGogeoGeoAgg) => void) {
      var url = Configuration.makeUrl("geoagg");

      this.requestData["mapkey"] = Configuration.getMapKey();

      return this.$http
        .post(url, this.requestData)
        .success(resultHandler);
    }
  }
}