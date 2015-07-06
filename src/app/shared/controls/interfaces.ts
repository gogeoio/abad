module gogeo {
  export interface Query {
    build(): any;
  }

  export interface IGeom {
    type: string;
  }

  export interface IPoint extends IGeom {
    coordinates: Array<number>;
  }

  export interface IGeomSpace extends IGeom {
    source: string;
    coordinates: Array<Array<Array<number>>>;
  }

  export interface IBucket {
    key: string;
    doc_count: number;
  }

  export interface IGogeoGeoAgg {
    doc_total: number;
    buckets_qtd: number;
    buckets: Array<IBucket>;
  }

  export interface IGogeoDocument {
    
  }

  export interface ICrimeDocument extends IGogeoDocument {

  }

  export interface IBusinessDocument extends IGogeoDocument {

  }

  export interface ICensusDocument extends IGogeoDocument {
    id: string;
    geo_id: string;
    geo_id2: string;
    families: number;
    nonfamily: number;
    households: number;
    total_pop: number;
    household_median_income: number;
  }

  export interface IDateRange {
    start: Date;
    end: Date;
  }

  export interface IDateHistogram {
    timestamp: number;
    date_string: string;
    count: number;
  }
}