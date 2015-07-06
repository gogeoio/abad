/**
 * Created by danfma on 09/03/15.
 */
///<reference path="./_references.d.ts"/>
var gogeo;
(function (gogeo) {
    gogeo.settings;
    var Configuration = (function () {
        function Configuration() {
        }
        Object.defineProperty(Configuration, "apiUrl", {
            get: function () {
                return "172.16.2.6:9090";
                // return <string> settings["api.url"];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Configuration, "tileUrl", {
            get: function () {
                return "172.16.2.6:9090";
                // return <string> settings["tile.url"];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Configuration, "subdomains", {
            get: function () {
                return [];
                // return <string[]> settings["subdomains"];
            },
            enumerable: true,
            configurable: true
        });
        Configuration.makeUrl = function (path, collectionName, service) {
            if (!collectionName) {
                collectionName = Configuration.getCollectionName();
            }
            path = [path, Configuration.getDatabaseName(), collectionName, service].join("/");
            path = path.replaceAll("//", "/");
            return Configuration.prefixUrl(path);
        };
        Configuration.prefixUrl = function (path) {
            var serverUrl = Configuration.apiUrl;
            if (path.match(".*tile.png.*") || path.match(".*cluster.json.*") || path.match(".*aggregations.*")) {
                serverUrl = Configuration.tileUrl;
            }
            if (serverUrl && !serverUrl.endsWith("/")) {
                serverUrl = serverUrl + "/";
            }
            var url = "http://" + serverUrl + (path.startsWith("/") ? path.substring(1) : path);
            return url;
        };
        Configuration.getCensusFields = function () {
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
        };
        Configuration.getCollectionName = function () {
            return gogeo.settings["collection"];
        };
        Configuration.getBusinessCollection = function () {
            return "fonte";
        };
        Configuration.getCrimesCollection = function () {
            return "crimes";
        };
        Configuration.getCensusCollection = function () {
            return "census_sf";
        };
        Configuration.getCrimesCategory = function () {
            return "category";
        };
        Configuration.getMapKey = function () {
            // TODO: Export this to development/deployment config file
            return "123";
        };
        Configuration.getInterval = function () {
            // TODO: Export this to development/deployment config file
            return "day";
        };
        Configuration.getAggSize = function () {
            // TODO: Export this to development/deployment config file
            return 0;
        };
        Configuration.getDatabaseName = function () {
            // TODO: Export this to development/deployment config file
            return "db1";
        };
        Configuration.getExperimental = function (service) {
            return "http://api.gogeo.io/2.0/" + service;
            // return "http://172.16.0.253:4141/" + service;
        };
        return Configuration;
    })();
    gogeo.Configuration = Configuration;
    var mod = angular.module("gogeo", ["ngRoute", "angular-capitalize-filter"]).config([
        "$routeProvider",
        function ($routeProvider) {
            $routeProvider.when("/dashboard", {
                controller: "DashboardController",
                controllerAs: "dashboard",
                templateUrl: "dashboard/page.html",
                reloadOnSearch: false
            }).otherwise({
                redirectTo: "/dashboard",
                reloadOnSearch: false
            });
        }
    ]);
    function registerController(controllerType) {
        console.debug("registrando controlador: ", controllerType.$named);
        mod.controller(controllerType.$named, controllerType);
    }
    gogeo.registerController = registerController;
    function registerService(serviceType) {
        console.debug("registrando serviço: ", serviceType.$named);
        mod.service(serviceType.$named, serviceType);
    }
    gogeo.registerService = registerService;
    function registerDirective(directiveName, config) {
        console.debug("registrando diretiva: ", directiveName);
        mod.directive(directiveName, config);
    }
    gogeo.registerDirective = registerDirective;
    function registerFilter(filterName, filter) {
        console.debug("registrando filtro: ", filterName);
        mod.filter(filterName, function () { return filter; });
    }
    gogeo.registerFilter = registerFilter;
})(gogeo || (gogeo = {}));
/// <reference path="../shell.ts"/>
/**
 * Created by danfma on 05/03/15.
 */
var gogeo;
(function (gogeo) {
    var DashboardController = (function () {
        function DashboardController() {
        }
        DashboardController.$named = "DashboardController";
        return DashboardController;
    })();
    gogeo.DashboardController = DashboardController;
    gogeo.registerController(DashboardController);
})(gogeo || (gogeo = {}));
///<reference path="../shell.ts" />
/**
 * Created by danfma on 17/03/15.
 */
var gogeo;
(function (gogeo) {
    var AbstractController = (function () {
        /**
         * Construtor
         */
        function AbstractController($scope) {
            this.$scope = $scope;
            this.subscriptions = [];
        }
        /**
         * Inicializa este controlador.
         */
        AbstractController.prototype.initialize = function () {
            var _this = this;
            var selfProperty = Enumerable.from(this.$scope).where(function (x) { return x.value === _this; }).select(function (x) { return x.key; }).firstOrDefault();
            this.propertyName = selfProperty;
            this.$scope.$on("$destroy", function () { return _this.dispose(); });
        };
        AbstractController.prototype.dispose = function () {
            for (var i = 0; i < this.subscriptions.length; i++) {
                var subscription = this.subscriptions[i];
                subscription.dispose();
            }
            this.subscriptions = null;
        };
        AbstractController.prototype.evalProperty = function (path) {
            return this.$scope.$eval(this.propertyName + "." + path);
        };
        /**
         * Observa uma determinada propriedade desta instância.
         */
        AbstractController.prototype.watch = function (property, handler, objectEquality) {
            if (objectEquality === void 0) { objectEquality = false; }
            return this.$scope.$watch(this.propertyName + "." + property, handler, objectEquality);
        };
        /**
         * Observa uma determinada propriedade desta instância.
         */
        AbstractController.prototype.watchCollection = function (property, handler) {
            return this.$scope.$watchCollection(this.propertyName + "." + property, handler);
        };
        /**
         * Observer uma determinada propriedade desta instância de forma reativa.
         */
        AbstractController.prototype.watchAsObservable = function (property, isCollection, objectEquality) {
            var _this = this;
            if (isCollection === void 0) { isCollection = false; }
            if (objectEquality === void 0) { objectEquality = false; }
            return Rx.Observable.createWithDisposable(function (observer) {
                var dispose;
                if (isCollection) {
                    dispose = _this.watchCollection(property, function (value) {
                        observer.onNext(value);
                    });
                }
                else {
                    dispose = _this.watch(property, function (value) {
                        observer.onNext(value);
                    }, objectEquality);
                }
                return {
                    dispose: function () {
                        dispose();
                    }
                };
            });
        };
        AbstractController.prototype.watchObjectAsObservable = function (property) {
            return this.watchAsObservable(property, undefined, true);
        };
        AbstractController.prototype.releaseOnDestroy = function (subscription) {
            if (subscription)
                this.subscriptions.push(subscription);
        };
        return AbstractController;
    })();
    gogeo.AbstractController = AbstractController;
})(gogeo || (gogeo = {}));
/// <reference path="../shell.ts"/>
/**
 * Created by danfma on 05/03/15.
 */
var gogeo;
(function (gogeo) {
    var WelcomeController = (function () {
        function WelcomeController() {
        }
        WelcomeController.$named = "WelcomeController";
        return WelcomeController;
    })();
    gogeo.WelcomeController = WelcomeController;
    gogeo.registerController(WelcomeController);
})(gogeo || (gogeo = {}));
var gogeo;
(function (gogeo) {
    var DashboardQuery = (function () {
        function DashboardQuery($http, geomSpace) {
            this.$http = $http;
            this.requestData = {};
        }
        DashboardQuery.prototype.getMust = function () {
            return this.requestData.q.query.bool.must;
        };
        DashboardQuery.prototype.execute = function (resultHandler) {
            var url = gogeo.Configuration.makeUrl("geoagg");
            this.requestData["mapkey"] = gogeo.Configuration.getMapKey();
            return this.$http.post(url, this.requestData).success(resultHandler);
        };
        return DashboardQuery;
    })();
    gogeo.DashboardQuery = DashboardQuery;
})(gogeo || (gogeo = {}));
///<reference path="./interfaces.ts" />
var gogeo;
(function (gogeo) {
    var NeSwPoint = (function () {
        function NeSwPoint(ne, sw) {
            this.ne = ne;
            this.sw = sw;
        }
        return NeSwPoint;
    })();
    gogeo.NeSwPoint = NeSwPoint;
    var BoolQuery = (function () {
        function BoolQuery() {
            this.requestData = {
                must: []
            };
        }
        BoolQuery.prototype.addMustQuery = function (q) {
            this.requestData["must"].push(q.build()["query"]);
        };
        BoolQuery.prototype.build = function () {
            return {
                query: {
                    bool: this.requestData
                }
            };
        };
        return BoolQuery;
    })();
    gogeo.BoolQuery = BoolQuery;
    var MatchPhraseQuery = (function () {
        function MatchPhraseQuery(field, term) {
            this.query = {};
            this.query[field] = term;
        }
        MatchPhraseQuery.prototype.build = function () {
            return {
                query: {
                    match_phrase: this.query
                }
            };
        };
        return MatchPhraseQuery;
    })();
    gogeo.MatchPhraseQuery = MatchPhraseQuery;
    var SourceTermQuery = (function () {
        function SourceTermQuery(term) {
            this.term = term;
        }
        SourceTermQuery.prototype.build = function () {
            return {
                query: {
                    term: {
                        source: this.term
                    }
                }
            };
        };
        return SourceTermQuery;
    })();
    gogeo.SourceTermQuery = SourceTermQuery;
})(gogeo || (gogeo = {}));
var gogeo;
(function (gogeo) {
    var GogeoGeosearch = (function () {
        function GogeoGeosearch($http, geom, collection, buffer, buffer_measure, fields, limit, query) {
            this.$http = $http;
            this.requestData = {};
            this.geom = null;
            this.buffer = 0;
            this.buffer_measure = null;
            this.q = {};
            this.limit = 0;
            this.fields = [];
            this.collection = null;
            this.geom = geom;
            this.collection = collection;
            this.buffer = buffer;
            this.buffer_measure = buffer_measure;
            this.fields = fields;
            this.limit = limit;
            this.q = angular.toJson(query);
        }
        GogeoGeosearch.prototype.execute = function (resultHandler) {
            var url = gogeo.Configuration.makeUrl("geosearch", this.collection);
            this.requestData = {
                geom: this.geom,
                limit: this.limit,
                buffer: this.buffer,
                buffer_measure: this.buffer_measure,
                fields: this.fields,
                q: this.q,
                mapkey: gogeo.Configuration.getMapKey()
            };
            return this.$http.post(url, this.requestData).success(resultHandler);
        };
        return GogeoGeosearch;
    })();
    gogeo.GogeoGeosearch = GogeoGeosearch;
})(gogeo || (gogeo = {}));
var gogeo;
(function (gogeo) {
    var GogeoGeoagg = (function () {
        function GogeoGeoagg($http, geom, collection, field, buffer, size) {
            this.$http = $http;
            this.params = {};
            this.collection = null;
            this.collection = collection;
            if (!size) {
                size = 50;
            }
            this.params = {
                mapkey: gogeo.Configuration.getMapKey(),
                geom: geom,
                field: field,
                agg_size: size,
                buffer: buffer,
                measure_buffer: "kilometer"
            };
        }
        GogeoGeoagg.prototype.execute = function (resultHandler) {
            var url = gogeo.Configuration.makeUrl("geoagg", this.collection);
            var requestData = this.params;
            return this.$http.post(url, requestData).success(resultHandler);
        };
        return GogeoGeoagg;
    })();
    gogeo.GogeoGeoagg = GogeoGeoagg;
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-service.ts" />
var gogeo;
(function (gogeo) {
    var MetricsService = (function () {
        function MetricsService($scope, $location, service) {
            this.$scope = $scope;
            this.$location = $location;
            this.service = service;
            this._lastGeom = null;
            this._lastBucketResult = null;
            this._lastTerms = null;
            this._lastDateRange = null;
            this._lastPlace = null;
            this.firstGeom = false;
            this.firstBucket = false;
            this.firstTerms = false;
            this.firstDate = false;
            this.firstPlace = false;
            this.firstThematic = false;
            this.firstMapType = false;
            this.initialize();
        }
        MetricsService.prototype.initialize = function () {
        };
        MetricsService.$named = "metricsService";
        MetricsService.$inject = [
            "$rootScope",
            "$location",
            "dashboardService"
        ];
        return MetricsService;
    })();
    gogeo.MetricsService = MetricsService;
    gogeo.registerService(MetricsService);
})(gogeo || (gogeo = {}));
///<reference path="../../shell.ts" />
///<reference path="../../shared/controls/queries.ts"/>
///<reference path="../../shared/controls/dashboard-query.ts"/>
///<reference path="../../shared/controls/gogeo-geosearch.ts"/>
///<reference path="../../shared/controls/gogeo-geoagg.ts"/>
///<reference path="./metrics.ts"/>
/**
 * Created by danfma on 07/03/15.
 */
var gogeo;
(function (gogeo) {
    var DashboardService = (function () {
        function DashboardService($q, $http, $location, $timeout, $routeParams) {
            this.$q = $q;
            this.$http = $http;
            this.$location = $location;
            this.$timeout = $timeout;
            this.$routeParams = $routeParams;
            this._lastGeomSpace = null;
            this._loading = true;
            this._lastRadius = 0;
            this.worldBound = {
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
            this._lastQueryObservable = new Rx.BehaviorSubject(null);
            this._lastCircleObservable = new Rx.BehaviorSubject(null);
            this._lastCensusObservable = new Rx.BehaviorSubject(null);
            this._lastPracasObservable = new Rx.BehaviorSubject(null);
            this._lastVendedorObservable = new Rx.BehaviorSubject(null);
        }
        Object.defineProperty(DashboardService.prototype, "loading", {
            get: function () {
                return this._loading;
            },
            enumerable: true,
            configurable: true
        });
        DashboardService.prototype.isLoading = function () {
            return this._loading;
        };
        Object.defineProperty(DashboardService.prototype, "queryObservable", {
            get: function () {
                return this._lastQueryObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "circleObservable", {
            get: function () {
                return this._lastCircleObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "censusObservable", {
            get: function () {
                return this._lastCensusObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "pracasObservable", {
            get: function () {
                return this._lastPracasObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "vendedorObservable", {
            get: function () {
                return this._lastVendedorObservable;
            },
            enumerable: true,
            configurable: true
        });
        DashboardService.prototype.updatePracas = function (praca) {
            this._lastPracasObservable.onNext(praca);
        };
        DashboardService.prototype.updateVendedores = function (vendedor) {
            this._lastVendedorObservable.onNext(vendedor);
        };
        DashboardService.prototype.getRadius = function () {
            return this._lastRadius;
        };
        DashboardService.prototype.updateRadius = function (radius) {
            this._lastRadius = radius;
        };
        DashboardService.prototype.updateDashboardData = function (point) {
            this._lastCircleObservable.onNext(point);
        };
        DashboardService.prototype.getVendedorConvaveHull = function (vendedor, concavity) {
            var params = {
                q: this.getVendedorQuery(vendedor),
                concavity: concavity || 1
            };
            return this.getConcaveHull(params);
        };
        DashboardService.prototype.getPracaConvaveHull = function (praca, concavity) {
            var params = {
                q: this.getPracaQuery(praca),
                concavity: concavity || 1
            };
            return this.getConcaveHull(params);
        };
        DashboardService.prototype.getVendedorPoints = function (vendedor) {
            var params = {
                fields: ["cliente", "cod_praca", "cod_vendedor"],
                q: this.getVendedorQuery(vendedor),
                limit: 500
            };
            return this.getPoints(params);
        };
        DashboardService.prototype.getPracaPoints = function (praca) {
            var params = {
                fields: ["cliente", "cod_praca", "cod_vendedor"],
                q: this.getPracaQuery(praca),
                limit: 500
            };
            return this.getPoints(params);
        };
        DashboardService.prototype.getVendedorQuery = function (vendedor) {
            return {
                query: {
                    term: {
                        cod_vendedor: vendedor
                    }
                }
            };
        };
        DashboardService.prototype.getPracaQuery = function (praca) {
            return {
                query: {
                    term: {
                        cod_praca: praca
                    }
                }
            };
        };
        DashboardService.prototype.getPoints = function (params) {
            var url = gogeo.Configuration.getExperimental('geojson');
            return this.$http.get(url, { params: params });
        };
        DashboardService.prototype.getConcaveHull = function (params) {
            var url = gogeo.Configuration.getExperimental('hull');
            return this.$http.get(url, { params: params });
        };
        DashboardService.prototype.updateCrimesDateHistogram = function (geom, result) {
            var queries = [];
            result.buckets.slice(0, 5).forEach(function (item) {
                var matchQuery = new gogeo.MatchPhraseQuery(gogeo.Configuration.getCrimesCategory(), item.key);
                queries.push(matchQuery);
            });
            var boolQuery = new gogeo.BoolQuery();
            queries.forEach(function (q) {
                boolQuery.addMustQuery(q);
            });
            // console.log("matchQuery", JSON.stringify(boolQuery.build(), null, 2));
            // console.log();
        };
        DashboardService.prototype.businessGeoAgg = function (geom) {
            return this.getGogeoGeoAgg(geom, gogeo.Configuration.getBusinessCollection(), "state");
        };
        DashboardService.prototype.getGogeoGeoAgg = function (geom, collectionName, field) {
            return new gogeo.GogeoGeoagg(this.$http, geom, collectionName, field, this._lastRadius);
        };
        DashboardService.prototype.censusGeoSearch = function (geom) {
            var fields = gogeo.Configuration.getCensusFields();
            return new gogeo.GogeoGeosearch(this.$http, geom, gogeo.Configuration.getCensusCollection(), this._lastRadius, "kilometer", fields, 10);
        };
        DashboardService.prototype.updateCensus = function (geom) {
            var _this = this;
            var ggsc = this.censusGeoSearch(geom);
            ggsc.execute(function (result) {
                _this._lastCensusObservable.onNext(result);
            });
        };
        DashboardService.prototype.calculateNeSW = function (bounds) {
            var ne = new L.LatLng(bounds.getNorthEast().lng, bounds.getNorthEast().lat);
            var sw = new L.LatLng(bounds.getSouthWest().lng, bounds.getSouthWest().lat);
            return new gogeo.NeSwPoint(ne, sw);
        };
        DashboardService.prototype.pointToGeoJson = function (point) {
            var ne = [point.ne.lat, point.ne.lng];
            var sw = [point.sw.lat, point.sw.lng];
            var nw = [sw[0], ne[1]];
            var se = [ne[0], sw[1]];
            var coordinates = [
                [
                    sw,
                    nw,
                    ne,
                    se,
                    sw
                ]
            ];
            return {
                source: "mapBounds",
                type: "Polygon",
                coordinates: coordinates
            };
        };
        DashboardService.$named = "dashboardService";
        DashboardService.$inject = [
            "$q",
            "$http",
            "$location",
            "$timeout",
            "$routeParams"
        ];
        return DashboardService;
    })();
    gogeo.DashboardService = DashboardService;
    gogeo.registerService(DashboardService);
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../../dashboard/services/dashboard-service.ts" />
/**
 * Created by danfma on 06/03/15.
 */
var gogeo;
(function (gogeo) {
    var DataRangeController = (function () {
        function DataRangeController($scope, service) {
            this.$scope = $scope;
            this.service = service;
            this.min = null;
            this.max = null;
        }
        DataRangeController.prototype.initialize = function () {
        };
        DataRangeController.$inject = [
            "$scope",
            gogeo.DashboardService.$named
        ];
        return DataRangeController;
    })();
    gogeo.registerDirective("daterange", function () {
        return {
            restrict: "E",
            template: "\n                <div class=\"input-group daterange\">\n                    <input \n                        id=\"startRange\"\n                        class=\"form-control\"\n                        type=\"text\"\n                        data-provide=\"datepicker\"\n                        data-date-clear-btn=\"true\"\n                        data-date-start-date=\"{{range.min}}\"\n                        data-date-end-date=\"{{range.max}}\"\n                        data-date-autoclose=\"true\"\n                        ng-model=\"startDate\"/>\n                    <span class=\"input-group-addon\">\n                        <i class=\"glyphicon glyphicon-calendar\"></i>\n                    </span>\n                    <input\n                        id=\"endRange\"\n                        class=\"form-control\"\n                        type=\"text\"\n                        data-provide=\"datepicker\"\n                        data-date-clear-btn=\"true\"\n                        data-date-start-date=\"{{range.min}}\"\n                        data-date-end-date=\"{{range.max}}\"\n                        data-date-autoclose=\"true\"\n                        ng-model=\"endDate\"/>\n                </div>",
            scope: {
                startDate: "=",
                endDate: "="
            },
            controller: DataRangeController,
            controllerAs: "range",
            link: function (scope, element, attrs, controller) {
                controller.initialize();
            }
        };
    });
})(gogeo || (gogeo = {}));
var gogeo;
(function (gogeo) {
    var GogeoAgg = (function () {
        function GogeoAgg($http) {
            this.$http = $http;
            this.params = {};
            this.collection = null;
        }
        return GogeoAgg;
    })();
    gogeo.GogeoAgg = GogeoAgg;
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/**
 * Created by danfma on 05/03/15.
 */
var gogeo;
(function (gogeo) {
    angular.module("gogeo").directive("welcomeMap", [
        function () {
            return {
                restrict: "C",
                // template: "<div></div>",
                link: function (scope, element, attrs) {
                    var rawElement = element[0];
                    var url = "http://api.gogeo.io/1.0/map/" + gogeo.Configuration.getDatabaseName() + "/" + gogeo.Configuration.getCollectionName() + "/{z}/{x}/{y}/tile.png?mapkey=" + gogeo.Configuration.getMapKey() + "&stylename=gogeo_many_points";
                    var initialPos = L.latLng(43.717232, -92.353034);
                    var map = L.map("welcome-map").setView(initialPos, 5);
                    map.addLayer(L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
                        attribution: 'Mapbox <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>'
                    }));
                    L.tileLayer(url).addTo(map);
                    scope.$on("destroy", function () { return map.remove(); });
                }
            };
        }
    ]);
})(gogeo || (gogeo = {}));
/**
 * Created by danfma on 07/03/15.
 */
var gogeo;
(function (gogeo) {
    function prefix(eventName) {
        return "gogeo:" + eventName;
    }
    var DashboardEvent = (function () {
        function DashboardEvent() {
        }
        DashboardEvent.mapLoaded = prefix("dashboard:mapLoaded");
        return DashboardEvent;
    })();
    gogeo.DashboardEvent = DashboardEvent;
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
var gogeo;
(function (gogeo) {
    var DashboardDetailsController = (function () {
        function DashboardDetailsController($scope, $interval, $filter, service) {
            this.$scope = $scope;
            this.$interval = $interval;
            this.$filter = $filter;
            this.service = service;
        }
        DashboardDetailsController.prototype.initialize = function () {
        };
        DashboardDetailsController.$inject = [
            "$scope",
            "$interval",
            "$filter",
            gogeo.DashboardService.$named
        ];
        return DashboardDetailsController;
    })();
    gogeo.registerDirective("dashboardDetails", function () {
        return {
            restrict: "CE",
            templateUrl: "dashboard/controls/dashboard-details-template.html",
            controller: DashboardDetailsController,
            controllerAs: "details",
            bindToController: true,
            scope: true,
            link: function (scope, element, attrs, controller) {
                controller.initialize();
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../../shared/abstract-controller.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var gogeo;
(function (gogeo) {
    var DashboardController = (function (_super) {
        __extends(DashboardController, _super);
        function DashboardController($scope, service) {
            _super.call(this, $scope);
            this.service = service;
        }
        DashboardController.$inject = [
            "$scope",
            gogeo.DashboardService.$named
        ];
        return DashboardController;
    })(gogeo.AbstractController);
    gogeo.registerDirective("dashboardHeader", function () {
        return {
            restrict: "C",
            templateUrl: "dashboard/controls/dashboard-header-template.html",
            controller: DashboardController,
            controllerAs: "header",
            bindToController: true,
            scope: true
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
/// <reference path="../services/metrics.ts" />
/**
 * Created by danfma on 07/03/15.
 */
var gogeo;
(function (gogeo) {
    var DashboardMapController = (function () {
        function DashboardMapController($scope, $timeout, service, metrics) {
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.service = service;
            this.metrics = metrics;
            this._concavity = 0.5;
            this._lastType = null;
            this._lastObj = null;
            this.query = null;
            this.businessSelected = true;
            this.crimesSelected = false;
            this.mapTypes = ["point", "cluster", "intensity"];
            this.mapSelected = "point";
            this.baseLayers = null;
            this.layerGroup = null;
            this.pointsGroup = null;
            this.hullsGroup = null;
            this.restricted = false;
            this.canOpenPopup = true;
            this.baseLayerSelected = "day";
            this.levent = null;
            this.layerNames = [
                gogeo.Configuration.getBusinessCollection()
            ];
            this.layerGroup = L.layerGroup([]);
            this.baseLayers = L.featureGroup([]);
            this.pointsGroup = L.featureGroup([]);
            this.hullsGroup = L.featureGroup([]);
        }
        DashboardMapController.prototype.initialize = function (map) {
            var _this = this;
            this.map = map;
            this.baseLayers.addLayer(this.getDayMap());
            this.map.addLayer(this.baseLayers);
            this.map.addLayer(this.pointsGroup);
            this.map.addLayer(this.hullsGroup);
            this.centerMap(-16.678308, -49.256830);
            this.service.pracasObservable.where(function (praca) { return praca != null; }).throttle(200).subscribe(function (praca) { return _this.addPracaConcaveHull(praca); });
            this.service.vendedorObservable.where(function (vendedor) { return vendedor != null; }).throttle(200).subscribe(function (vendedor) { return _this.addVendedorConcaveHull(vendedor); });
        };
        DashboardMapController.prototype.updateConvexHull = function () {
            this.hullsGroup.removeLayer(this._lastObj["polygon"]);
            this.pointsGroup.removeLayer(this._lastObj["points"]);
            this.addConcaveHull(this._lastType, this._lastObj, true);
        };
        DashboardMapController.prototype.addVendedorConcaveHull = function (vendObj) {
            this.addConcaveHull("vendedor", vendObj);
        };
        DashboardMapController.prototype.addPracaConcaveHull = function (pracaObj) {
            this.addConcaveHull("praca", pracaObj);
        };
        DashboardMapController.prototype.addConcaveHull = function (type, obj, forceUpdate) {
            var _this = this;
            var polygon = obj["polygon"];
            var points = obj["points"];
            if (obj["enabled"]) {
                var pracaCod = parseInt(obj["id"]);
                this.addPoints(type, obj);
                if (!polygon || forceUpdate) {
                    var request = null;
                    if (type === "praca") {
                        request = this.service.getPracaConvaveHull(pracaCod, this._concavity);
                    }
                    else {
                        request = this.service.getVendedorConvaveHull(pracaCod, this._concavity);
                    }
                    request.then(function (result) {
                        var pointset = result["data"];
                        polygon = L.polygon(pointset, { weight: 2, color: obj["color"] });
                        obj["polygon"] = polygon;
                        _this.addPolygonToMap(polygon);
                        _this._lastType = type;
                        _this._lastObj = obj;
                    });
                }
                else {
                    this.addPolygonToMap(polygon);
                    this._lastType = type;
                    this._lastObj = obj;
                }
            }
            else {
                if (polygon) {
                    this.hullsGroup.removeLayer(polygon);
                }
                if (points) {
                    this.pointsGroup.removeLayer(points);
                }
            }
        };
        DashboardMapController.prototype.addPolygonToMap = function (polygon) {
            this.hullsGroup.addLayer(polygon);
            this.map.fitBounds(polygon.getBounds());
            this.hullsGroup.bringToBack();
            this.pointsGroup.bringToFront();
        };
        DashboardMapController.prototype.onEachFeature = function (feature, layer) {
            var popupContent = "";
            if (feature["properties"]) {
                var prop = feature["properties"];
                popupContent = "\n          <div class=\"container\" style=\"width: 310px;\">\n            <div class=\"row\">\n              <div class=\"col-sm-12\">\n                <label for=\"cliente\">Cliente</label>\n              </div>\n            </div>\n            <div class=\"row\" style=\"margin-bottom: 10px;\">\n              <div class=\"col-sm-12\">\n                <span id=\"cliente\">" + prop["cliente"] + "</span>\n              </div>\n            </div>\n          </div>\n        ";
            }
            layer.bindPopup(popupContent);
        };
        DashboardMapController.prototype.addPoints = function (type, obj) {
            var _this = this;
            if (!obj["points"]) {
                var cod = parseInt(obj["id"]);
                var request = null;
                if (type === "praca") {
                    request = this.service.getPracaPoints(cod);
                }
                else {
                    request = this.service.getVendedorPoints(cod);
                }
                request.then(function (result) {
                    var geojsonData = result["data"];
                    var geojson = L.geoJson(geojsonData, _this.geoJsonOptions(obj));
                    obj["points"] = geojson;
                    _this.pointsGroup.addLayer(geojson);
                });
            }
            else {
                this.pointsGroup.addLayer(obj["points"]);
            }
        };
        DashboardMapController.prototype.geoJsonOptions = function (obj) {
            var color = obj["color"];
            return {
                pointToLayer: function (feature, latlng) {
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
        };
        DashboardMapController.prototype.centerMap = function (lat, lng) {
            if (lat && lng) {
                var center = new L.LatLng(lat, lng);
                this.map.setView(center, 5);
            }
        };
        DashboardMapController.prototype.getDayMap = function () {
            return new L.Google('ROADMAP');
        };
        DashboardMapController.prototype.queryHandler = function (query) {
            if (JSON.stringify(query) !== JSON.stringify(this.query)) {
                this.query = query;
                this.updateLayer();
            }
            else {
            }
        };
        DashboardMapController.prototype.createLayers = function (layers, stylename) {
            var _this = this;
            var array = [];
            layers.forEach(function (layerName) {
                var url = _this.configureUrl(layerName, stylename);
                var options = {
                    subdomains: gogeo.Configuration.subdomains
                };
                if (["point", "intensity"].indexOf(_this.mapSelected) != (-1)) {
                    array.push(L.tileLayer(url, options));
                }
                else if (_this.mapSelected === 'cluster') {
                    array.push(_this.createClusterLayer(url));
                }
            });
            return array;
        };
        DashboardMapController.prototype.configureUrl = function (collection, stylename) {
            var database = gogeo.Configuration.getDatabaseName();
            var buffer = 8;
            var serviceName = "tile.png";
            if (this.mapSelected === "cluster") {
                serviceName = "cluster.json";
            }
            if (this.mapSelected === "intensity") {
                stylename = "gogeo_intensity";
            }
            if (collection === gogeo.Configuration.getBusinessCollection()) {
                stylename = "gogeo_many_points";
            }
            else if (collection === gogeo.Configuration.getCrimesCollection()) {
                stylename = "crimes_style";
            }
            var url = "/map/" + database + "/" + collection + "/{z}/{x}/{y}/" + serviceName + "?buffer=" + buffer + "&mapkey=123";
            if (stylename) {
                url = url + "&stylename=" + stylename;
            }
            if (this.query) {
                url = "" + url + "&q=" + encodeURIComponent(angular.toJson(this.query));
            }
            return gogeo.Configuration.prefixUrl(url);
        };
        DashboardMapController.prototype.updateLayer = function () {
            this.layerGroup.clearLayers();
            var layers = this.createLayers(this.layerNames);
            for (var i in layers) {
                this.layerGroup.addLayer(layers[i]);
            }
        };
        DashboardMapController.prototype.createClusterLayer = function (url) {
            var options = {
                subdomains: gogeo.Configuration.subdomains,
                useJsonP: false
            };
            return new L.TileCluster(url, options);
        };
        DashboardMapController.$inject = [
            "$scope",
            "$timeout",
            gogeo.DashboardService.$named,
            gogeo.MetricsService.$named
        ];
        return DashboardMapController;
    })();
    gogeo.registerDirective("dashboardMap", [
        "$timeout",
        function ($timeout) {
            return {
                restrict: "C",
                templateUrl: "dashboard/controls/dashboard-map-template.html",
                controller: DashboardMapController,
                controllerAs: "map",
                bindToController: true,
                link: function (scope, element, attrs, controller) {
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
                    $timeout(function () { return map.invalidateSize(false); }, 1);
                    scope.$on("$destroy", function () {
                        map.remove();
                    });
                }
            };
        }
    ]);
    gogeo.registerDirective("errSrc", function () {
        return {
            link: function (scope, element, attrs) {
                element.bind("error", function () {
                    if (attrs.src != attrs.errSrc) {
                        attrs.$set("src", attrs.errSrc);
                    }
                });
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
var gogeo;
(function (gogeo) {
    gogeo.registerDirective("dashboardPanel", function () {
        return {
            restrict: "C",
            link: function (scope, element, attributes) {
                function adjustSizes() {
                    var body = $(document.body);
                    var size = {
                        width: body.innerWidth(),
                        height: body.innerHeight()
                    };
                    var $top = element.find(".dashboard-top-panel");
                    var $center = element.find(".dashboard-center-panel");
                    $top.height($top.attr("data-height") + "px");
                    $center.height(size.height - $top.height());
                }
                $(window).on("resize", adjustSizes);
                adjustSizes(); // forcing the first resize
                scope.$on("destroy", function () {
                    $(window).off("resize", adjustSizes);
                });
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-service.ts" />
var gogeo;
(function (gogeo) {
    var ObjListController = (function () {
        function ObjListController($scope, service) {
            this.$scope = $scope;
            this.service = service;
            this.colors = [
                "green",
                "red",
                "#660033",
                "orange",
                "blue",
                "purple",
                "#3399FF"
            ];
            this.type = "";
            this.list = [];
        }
        ObjListController.prototype.initialize = function (type, ids) {
            var _this = this;
            this.type = type;
            ids.forEach(function (id) {
                var colorIndex = _this.list.length % _this.colors.length;
                var item = {
                    id: id,
                    enabled: false,
                    points: null,
                    polygon: null,
                    color: _this.colors[colorIndex]
                };
                _this.list.push(item);
            });
        };
        ObjListController.prototype.toggle = function (obj) {
            obj["enabled"] = !obj["enabled"];
            if (this.type === "praca") {
                this.service.updatePracas(obj);
            }
            else {
                this.service.updateVendedores(obj);
            }
        };
        ObjListController.$inject = [
            "$scope",
            gogeo.DashboardService.$named
        ];
        return ObjListController;
    })();
    gogeo.registerDirective("objList", function () {
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
            link: function (scope, element, attrs, controller) {
                controller.initialize(attrs["type"], attrs["ids"].split(";"));
            }
        };
    });
})(gogeo || (gogeo = {}));
