import { Server } from 'hapi';
import { DServerRegister, IServerRequest, IServerResponse, IServerRoute, Log } from '@seatbelt/core';

@DRegisterServer()
export class HapiServer {
  public log: Log = new Log('HapiServer');
  public server: Server = new Server();
  public port: number = process.env.port || 3000;
  public conformHapiControllerToSeatbeltController: Function = function (route: any, req: any, reply: Function) {
    const nextWrapper = (i: number): any => {
      if (!route.controller) {
        return reply({status: 'request failed'}).code(500);
      }
      return route.controller({
        send: (...params: any[]) => reply(...params),
        params: Object.assign(
          {},
          typeof req.params === 'object' ? req.params : {},
          typeof req.body === 'object' ? req.body : {}
          ,
          typeof req.payload === 'object' ? req.payload : {}
          ,
          typeof req.query === 'object' ? req.query : {}
        )
      }, {
        req,
        reply
      });
    };
    nextWrapper(0);
  };
  public config: Function = function(routes: any[]) {
    this.server.connection({ port: this.port });
    if (routes && Array.isArray(routes)) {
      routes.forEach((route: any) => {
        route['__seatbelt_config__'].type.forEach((eachType: string) => {
          route['__seatbelt_config__'].path.forEach((eachPath: string) => {
            this.server.route({
              method: eachType.toLowerCase(),
              path: eachPath,
              handler: (request: any, reply: any) => this.conformHapiControllerToSeatbeltController(route, request, reply)
            });
          });
        });
      });
    }
  };
  public init: Function = function() {
    this.server.start((err: Error) => {
      if (err) {
        throw err;
      }
      this.log.system(`Server running at: ${this.server.info.uri}`);
    });
  };
}

export const server: HapiServer = new HapiServer();
