import * as hapi from 'hapi';
import { Server } from '@seatbelt/core/lib/server';
import { Log } from '@seatbelt/core';

export interface IServerConfig {
  port?: number;
}

@Server.Register()
export class HapiServer implements Server.BaseServer {
  public log: Log = new Log('HapiServer');
  public server: hapi.Server = new hapi.Server();
  public port: number = process.env.port || 3000;

  public constructor(config?: IServerConfig) {
    if (config) {
      if (config.port && typeof config.port === 'number') {
        this.port = config.port;
      }
    }
  }

  public conformServerControllerToSeatbeltController: Function = function (route: Server.Route, req: hapi.Request, reply: hapi.ReplyNoContinue) {
    if (!route.controller) {
      return reply({status: 'request failed'}).code(500);
    }

    const seatbeltResponse: Server.Response = {
      send: (status: number, body: Object) => {
         return reply(body).code(status);
      }
    };

    const seatbeltRequest: Server.Request = {
      allParams: Object.assign(
        {},
        typeof req.params === 'object' ? req.params : {},
        typeof req.payload === 'object' ? req.payload : {},
        typeof req.query === 'object' ? req.query : {}
      )
    };

    return route.controller(
      seatbeltRequest,
      seatbeltResponse,
      {
        req,
        reply
     }
    );
  };

  public config: Server.Config = function(routes: Server.Route[]) {
    this.server.connection({ port: this.port });
    if (routes && Array.isArray(routes)) {
      routes.forEach((route: Server.Route) => {
        route['__seatbeltConfig'].type.forEach((eachType: string) => {
          route['__seatbeltConfig'].path.forEach((eachPath: string) => {
            this.server.route({
              method: eachType.toLowerCase(),
              path: eachPath,
              handler: (request: hapi.Request, reply: hapi.Response) => this.conformServerControllerToSeatbeltController(route, request, reply)
            });
          });
        });
      });
    }
  };

  public init: Server.Init = function() {
    this.server.start((err: Error) => {
      if (err) {
        throw err;
      }
      this.log.system(`Server running at: ${this.server.info.uri}`);
    });
  };
}
