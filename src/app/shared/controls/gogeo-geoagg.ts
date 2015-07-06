module gogeo {

  export class GogeoGeoagg {
    private params: any = {};
    private collection: string = null;

    constructor(
      private $http: ng.IHttpService,
      geom: IGeom,
      collection: string,
      field: string,
      buffer: number,
      size?: number) {

      this.collection = collection;

      if (!size) {
        size = 50;
      }

      this.params = {
        mapkey: Configuration.getMapKey(),
        geom: geom,
        field: field,
        agg_size: size,
        buffer: buffer,
        measure_buffer: "kilometer"
      };
    }

    execute(resultHandler: (IGogeoGeoAgg) => void) {
      var url = Configuration.makeUrl("geoagg", this.collection);
      var requestData = this.params;

      return this.$http
        .post<IGogeoGeoAgg>(url, requestData)
        .success(resultHandler);
    }
  }
}