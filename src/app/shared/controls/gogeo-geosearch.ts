module gogeo {
  export class GogeoGeosearch {

    private requestData: any = {};

    geom: IGeom = null;
    buffer: number = 0;
    buffer_measure: string = null;
    q: any = {};
    limit: number = 0;
    fields: Array<string> = [];
    collection: string = null;

    constructor(
      private $http: ng.IHttpService,
      geom: IGeom,
      collection: string,
      buffer: number,
      buffer_measure: string,
      fields: Array<string>,
      limit: number,
      query?: any) {

      this.geom = geom;
      this.collection = collection;
      this.buffer = buffer;
      this.buffer_measure = buffer_measure;
      this.fields = fields;
      this.limit = limit;
      this.q = angular.toJson(query);
    }

    execute(resultHandler: (IGogeoDocument) => void) {
      var url = Configuration.makeUrl("geosearch", this.collection);

      this.requestData = {
        geom: this.geom,
        limit: this.limit,
        buffer: this.buffer,
        buffer_measure: this.buffer_measure,
        fields: this.fields,
        q: this.q,
        mapkey: Configuration.getMapKey()
      }

      return this.$http
        .post<Array<IGogeoDocument>>(url, this.requestData)
        .success(resultHandler);
    }

  }
}