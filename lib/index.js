Object.defineProperty(exports, "__esModule", { value: true });
const hapi_1 = require("hapi");
function DHapi() {
    return function (OriginalClassConstructor) {
        return class extends OriginalClassConstructor {
            constructor() {
                super();
                this.__seatbelt__ = 'server';
                this.__seatbelt_strap__ = function (routes) {
                    this.server = new hapi_1.Server();
                    this.port = process.env.port || 3000;
                    this.__controller_wrapper__ = function (route, req, reply) {
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
                    this.server.connection({ port: this.port });
                    if (routes && Array.isArray(routes)) {
                        routes.forEach((route) => {
                            route['__seatbelt_config__'].type.forEach((eachType) => {
                                route['__seatbelt_config__'].path.forEach((eachPath) => {
                                    this.server.route({
                                        method: eachType.toLowerCase(),
                                        path: eachPath,
                                        handler: (request, reply) => this.__controller_wrapper__(route, request, reply)
                                    });
                                });
                            });
                        });
                    }
                    this.server.start((err) => {
                        if (err) {
                            throw err;
                        }
                        console.log(`Server running at: ${this.server.info.uri}`);
                    });
                };
            }
            ;
        };
    };
}
exports.DHapi = DHapi;
