var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const hapi_1 = require("hapi");
const core_1 = require("@seatbelt/core");
let HapiServer = class HapiServer {
    constructor() {
        this.log = new core_1.Log('HapiServer');
        this.server = new hapi_1.Server();
        this.port = process.env.port || 3000;
        this.conformHapiControllerToSeatbeltController = function (route, req, reply) {
            const nextWrapper = (i) => {
                if (!route.controller) {
                    return reply({ status: 'request failed' }).code(500);
                }
                return route.controller({
                    send: (...params) => reply(...params),
                    params: Object.assign({}, typeof req.params === 'object' ? req.params : {}, typeof req.body === 'object' ? req.body : {}, typeof req.payload === 'object' ? req.payload : {}, typeof req.query === 'object' ? req.query : {})
                }, {
                    req,
                    reply
                });
            };
            nextWrapper(0);
        };
        this.config = function (routes) {
            this.server.connection({ port: this.port });
            if (routes && Array.isArray(routes)) {
                routes.forEach((route) => {
                    route['__seatbelt_config__'].type.forEach((eachType) => {
                        route['__seatbelt_config__'].path.forEach((eachPath) => {
                            this.server.route({
                                method: eachType.toLowerCase(),
                                path: eachPath,
                                handler: (request, reply) => this.conformHapiControllerToSeatbeltController(route, request, reply)
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
    }
};
HapiServer = __decorate([
    DRegisterServer()
], HapiServer);
exports.HapiServer = HapiServer;
exports.server = new HapiServer();
