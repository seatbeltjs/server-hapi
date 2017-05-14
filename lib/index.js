"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function DHapi() {
    return function (OriginalClassConstructor) {
        return class extends OriginalClassConstructor {
            constructor() {
                super();
                this.__seatbelt__ = 'server';
                this.__seatbelt_strap__ = function (classesByType) {
                    this.hapi = require('hapi');
                    this.app = new this.hapi.Server();
                    this.port = process.env.port || 3000;
                    this.__controller_wrapper__ = function (controllerFunction, req, reply) {
                        const nextWrapper = (i) => {
                            if (!controllerFunction) {
                                return reply({ status: 'request failed' }).code(500);
                            }
                            return controllerFunction({
                                send: (...params) => reply(...params),
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
                            route['__seatbelt_config__'].type.forEach((eachType) => {
                                route['__seatbelt_config__'].path.forEach((eachPath) => {
                                    this.app.route({
                                        method: eachType.toLowerCase(),
                                        path: eachPath,
                                        handler: (request, reply) => this.__controller_wrapper__(route.controller, request, reply)
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
            }
            ;
        };
    };
}
exports.DHapi = DHapi;
