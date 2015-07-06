/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-service.ts" />

module gogeo {

  class ObjListController {
    static $inject = [
      "$scope",
      DashboardService.$named
    ];

    private colors: Array<string> = [
      "green",
      "red",
      "#660033",
      "orange",
      "blue",
      "purple",
      "#3399FF"
    ];

    private type: string = "";
    private list: Array<any> = [];

    constructor(private $scope: ng.IScope,
          private service: DashboardService) {
    }

    initialize(type: string, ids: Array<string>) {
      this.type = type;
      ids.forEach((id) => {
        var colorIndex = this.list.length % this.colors.length;
        var item = {
          id: id,
          enabled: false,
          points: null,
          polygon: null,
          color: this.colors[colorIndex]
        };
        this.list.push(item);
      });
    }

    toggle(obj: any) {
      obj["enabled"] = !obj["enabled"];

      if (this.type === "praca") {
        this.service.updatePracas(obj);
      } else {
        this.service.updateVendedores(obj);
      }
    }
  }

  registerDirective("objList", () => {
    return {
      restrict: "CE",
      templateUrl: "dashboard/controls/obj-list-template.html",
      controller: ObjListController,
      controllerAs: "objList",
      bindToController: true,
      scope: {
        type: "=",
        ids: "="
      },

      link(scope, element, attrs, controller:ObjListController) {
        controller.initialize(attrs["type"], attrs["ids"].split(";"));
      }
    };
  });
}