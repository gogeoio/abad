///<reference path="./_references.d.ts"/>

module gogeo {

  export var settings;

  export class Configuration {
    static get apiUrl() {
      return "172.16.2.6:9090";
      // return <string> settings["api.url"];
    }

    static get tileUrl() {
      return "172.16.2.6:9090";
      // return <string> settings["tile.url"];
    }

    static get subdomains() {
      return [ ];
      // return <string[]> settings["subdomains"];
    }

    static makeUrl(path: string, collectionName?: string, service?: string): string {
      if (!collectionName) {
        collectionName = Configuration.getCollectionName();
      }
      path = [path, Configuration.getDatabaseName(), collectionName, service].join("/");
      path = path.replaceAll("//", "/");

      return Configuration.prefixUrl(path);
    }

    static prefixUrl(path: string): string {
      var serverUrl: string = Configuration.apiUrl;

      if (path.match(".*tile.png.*") || path.match(".*cluster.json.*") || path.match(".*aggregations.*")) {
        serverUrl = Configuration.tileUrl;
      }

      if (serverUrl && !serverUrl.endsWith("/")) {
        serverUrl = serverUrl + "/";
      }

      var url = "http://" + serverUrl + (path.startsWith("/") ? path.substring(1) : path);
      return url;
    }

    static getCensusFields(): Array<string> {
      return [
        "geo_id",
        "geo_id2",
        "families",
        "nonfamily",
        "households",
        "household_median_income",
        "white",
        "black",
        "indian",
        "asian",
        "hawaiian",
        "others",
        "two_races",
        "age_under_5",
        "age_5_19",
        "age_20_29",
        "age_30_44",
        "age_45_64",
        "age_85_over",
        "household_income_less_15k",
        "household_income_15k_35k",
        "household_income_35k_75k",
        "household_income_75k_150k",
        "household_income_150k_200k",
        "household_income_200k_more"
      ];
    }

    static getCollectionName(): string {
      return <string> settings["collection"];
    }

    static getBusinessCollection(): string {
      return "fonte";
    }

    static getCrimesCollection(): string {
      return "crimes";
    }

    static getCensusCollection(): string {
      return "census_sf";
    }

    static getCrimesCategory(): string {
      return "category";
    }

    static getMapKey(): string {
      // TODO: Export this to development/deployment config file
      return "123";
    }

    static getInterval(): string {
      // TODO: Export this to development/deployment config file
      return "day";
    }

    static getAggSize(): number {
      // TODO: Export this to development/deployment config file
      return 0;
    }

    static getDatabaseName(): string {
      // TODO: Export this to development/deployment config file
      return "db1";
    }

    static getExperimental(service: string): string {
      return "http://api.gogeo.io/2.0/" + service;
      // return "http://172.16.0.253:4141/" + service;
    }
  }

  var mod = angular.module("gogeo", ["ngRoute", "angular-capitalize-filter"])
    .config([
      "$routeProvider",
      ($routeProvider: ng.route.IRouteProvider) => {
        $routeProvider
          .when("/dashboard", {
            controller: "DashboardController",
            controllerAs: "dashboard",
            templateUrl: "dashboard/page.html",
            reloadOnSearch: false
          })
          .otherwise({
            redirectTo: "/dashboard",
            reloadOnSearch: false
          });
      }
    ]);

  export interface INamed {
    $named: string;
  }

  export interface INamedType extends Function, INamed {

  }

  export function registerController<T extends INamedType>(controllerType: T) {
    console.debug("registrando controlador: ", controllerType.$named);
    mod.controller(controllerType.$named, <Function> controllerType);
  }

  export function registerService<T extends INamedType>(serviceType: T) {
    console.debug("registrando serviço: ", serviceType.$named);
    mod.service(serviceType.$named, serviceType);
  }

  export function registerDirective(directiveName: string, config: any) {
    console.debug("registrando diretiva: ", directiveName);
    mod.directive(directiveName, config);
  }

  export function registerFilter(filterName: string, filter: (any) => string) {
    console.debug("registrando filtro: ", filterName);
    mod.filter(filterName, () => filter);
  }

}