/// <reference path="../../shell.ts" />
/// <reference path="../../shared/abstract-controller.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />

module gogeo {

  class DashboardController extends AbstractController {
    static $inject = [
      "$scope",
      DashboardService.$named
    ];

    constructor($scope:     ng.IScope,
          public service: DashboardService) {
      super($scope);
    }
  }

  registerDirective("dashboardHeader", () => {
    return {
      restrict: "C",
      templateUrl: "dashboard/controls/dashboard-header-template.html",
      controller: DashboardController,
      controllerAs: "header",
      bindToController: true,
      scope: true
    };
  });

}