var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const hapi = require("hapi");
const plugins_1 = require("@seatbelt/core/plugins");
const core_1 = require("@seatbelt/core");
let HapiServer = class HapiServer {
    constructor(config) {
        this.log = new core_1.Log('HapiServer');
        this.server = new hapi.Server();
        this.port = process.env.port || 3000;
        this.conformServerControllerToSeatbeltController = function (route, req, reply) {
            if (!route.controller) {
                return reply({ status: 'request failed' }).code(500);
            }
            const send = (status, body) => reply(body).code(status);
            const seatbeltResponse = {
                send,
                ok: (body) => send(200, body),
                created: (body) => send(201, body),
                badRequest: (body) => send(400, body),
                unauthorized: (body) => send(401, body),
                forbidden: (body) => send(403, body),
                notFound: (body) => send(404, body),
                serverError: (body) => send(500, body)
            };
            const seatbeltRequest = {
                allParams: Object.assign({}, typeof req.params === 'object' ? req.params : {}, typeof req.payload === 'object' ? req.payload : {}, typeof req.query === 'object' ? req.query : {})
            };
            return route.controller(seatbeltRequest, seatbeltResponse, {
                req,
                reply
            });
        };
        this.config = function (seatbelt) {
            const routes = seatbelt.plugins.route;
            this.server.connection({ port: this.port });
            if (routes && Array.isArray(routes)) {
                routes.forEach((route) => {
                    route['__routeConfig'].type.forEach((eachType) => {
                        route['__routeConfig'].path.forEach((eachPath) => {
                            this.server.route({
                                method: eachType.toLowerCase(),
                                path: eachPath,
                                handler: (request, reply) => this.conformServerControllerToSeatbeltController(route, request, reply)
                            });
                        });
                    });
                });
            }
        };
        this.init = function () {
            this.server.start((err) => {
                if (err) {
                    throw err;
                }
                this.log.system(`Server running at: ${this.server.info.uri}`);
            });
        };
        if (config) {
            if (config.port && typeof config.port === 'number') {
                this.port = config.port;
            }
        }
    }
};
HapiServer = __decorate([
    plugins_1.ServerPlugin.Register({
        name: 'HapiServer'
    })
], HapiServer);
exports.HapiServer = HapiServer;
