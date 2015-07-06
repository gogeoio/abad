/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-service.ts" />

module gogeo {

  export class MetricsService {
    static $named = "metricsService";

    static $inject = [
      "$rootScope",
      "$location",
      "dashboardService"
    ];

    private _lastGeom: IGeomSpace = null;
    private _lastBucketResult: IBucket = null;
    private _lastTerms: Array<string> = null;
    private _lastDateRange: IDateRange = null;
    private _lastPlace: string = null;

    private firstGeom: boolean = false;
    private firstBucket: boolean = false;
    private firstTerms: boolean = false;
    private firstDate: boolean = false;
    private firstPlace: boolean = false;
    private firstThematic: boolean = false;
    private firstMapType: boolean = false;

    constructor(private $scope: ng.IScope,
                private $location: ng.ILocationService,
                private service: DashboardService) {

      this.initialize();
    }

    initialize() {
    }
  }

  registerService(MetricsService);
}