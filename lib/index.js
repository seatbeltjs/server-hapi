"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function DHapi() {
    return function (OriginalClassConstructor) {
        return function () {
            const origin = new OriginalClassConstructor();
            origin.__seatbelt__ = 'server';
            origin.__seatbelt_strap__ = function (classesByType) {
                this.hapi = require('hapi');
                this.app = new this.hapi.Server();
                this.port = process.env.port || 3000;
                this.__controller_wrapper__ = function (controllerFunctions, req, reply) {
                    const nextWrapper = (i) => {
                        if (!controllerFunctions[i]) {
                            return reply({ status: 'request failed' }).code(500);
                        }
                        return controllerFunctions[i]({
                            send: (...params) => reply(...params),
                            next: () => nextWrapper(1 + i),
                            params: Object.assign({}, typeof req.params === 'object' ? req.params : {}, typeof req.body === 'object' ? req.body : {}, typeof req.payload === 'object' ? req.payload : {}, typeof req.query === 'object' ? req.query : {})
                        }, {
                            req,
                            reply
                        });
                    };
                    nextWrapper(0);
                };
                this.app.connection({ port: this.port });
                if (classesByType['route']) {
                    classesByType['route'].forEach((route) => {
                        const policies = [];
                        route.__seatbelt_config__.policies.forEach((routePolicyName) => {
                            classesByType['policy'].forEach((policy) => {
                                if (routePolicyName === policy.__name__) {
                                    policies.push(policy.controller);
                                }
                            });
                        });
                        const policiesPlusController = [
                            ...policies,
                            route.controller
                        ];
                        route['__seatbelt_config__'].type.forEach((eachType) => {
                            route['__seatbelt_config__'].path.forEach((eachPath) => {
                                this.app.route({
                                    method: eachType.toLowerCase(),
                                    path: eachPath,
                                    handler: (request, reply) => origin.__controller_wrapper__(policiesPlusController, request, reply)
                                });
                            });
                        });
                    });
                }
                this.app.start((err) => {
                    if (err) {
                        throw err;
                    }
                    console.log(`Server running at: ${this.app.info.uri}`);
                });
            };
            return origin;
        };
    };
}
exports.DHapi = DHapi;
