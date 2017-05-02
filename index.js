"use strict";
exports.__esModule = true;
var log_1 = require("../core/src/log");
function DHapi() {
    return function (OriginalClassConstructor) {
        return function () {
            var origin = new OriginalClassConstructor();
            origin.__seatbelt__ = 'server';
            origin.__seatbelt_strap__ = function (classesByType) {
                var _this = this;
                this.log = new log_1.Log('Hapi');
                this.hapi = require('hapi');
                this.app = new this.hapi.Server();
                this.port = process.env.port || 3000;
                this.log = new log_1.Log('Express');
                this.__controller_wrapper__ = function (controllerFunctions, req, reply) {
                    var nextWrapper = function (i) {
                        if (!controllerFunctions[i]) {
                            return reply({ status: 'request failed' }).code(500);
                        }
                        return controllerFunctions[i]({
                            req: req,
                            reply: reply,
                            next: function () { return nextWrapper(++i); },
                            params: Object.assign({}, typeof req.params === 'object' ? req.params : {}, typeof req.body === 'object' ? req.body : {}, typeof req.payload === 'object' ? req.payload : {}, typeof req.query === 'object' ? req.query : {})
                        });
                    };
                    nextWrapper(0);
                };
                this.app.connection({ port: this.port });
                if (classesByType['route']) {
                    classesByType['route'].forEach(function (route) {
                        var policies = [];
                        route.__seatbelt_config__.policies.forEach(function (routePolicyName) {
                            classesByType['policy'].forEach(function (policy) {
                                if (routePolicyName === policy.__name__) {
                                    policies.push(policy.controller);
                                }
                            });
                        });
                        var policiesPlusController = policies.concat([
                            route.controller
                        ]);
                        route['__seatbelt_config__'].type.forEach(function (eachType) {
                            route['__seatbelt_config__'].path.forEach(function (eachPath) {
                                _this.app.route({
                                    method: eachType.toLowerCase(),
                                    path: eachPath,
                                    handler: function (request, reply) { return origin.__controller_wrapper__(policiesPlusController, request, reply); }
                                });
                            });
                        });
                    });
                }
                this.app.start(function (err) {
                    if (err) {
                        throw err;
                    }
                    _this.log.system("Server running at: " + _this.app.info.uri);
                });
            };
            return origin;
        };
    };
}
exports.DHapi = DHapi;
