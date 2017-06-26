import * as hapi from 'hapi';
import { ServerPlugin } from '@seatbelt/core/plugins';
import { Log } from '@seatbelt/core';

export interface IServerConfig {
  port?: number;
}

@ServerPlugin.Register({
  name: 'HapiServer'
})
export class HapiServer implements ServerPlugin.BaseServer {
  private log: Log = new Log('HapiServer');
  public server: hapi.Server = new hapi.Server();
  public port: number = process.env.port || 3000;

  public constructor(config?: IServerConfig) {
    if (config) {
      if (config.port && typeof config.port === 'number') {
        this.port = config.port;
      }
    }
  }

  public conformServerControllerToSeatbeltController: Function = function (route: ServerPlugin.Route, req: hapi.Request, reply: hapi.ReplyNoContinue) {
    if (!route.controller) {
      return reply({status: 'request failed'}).code(500);
    }

    const seatbeltResponse: ServerPlugin.Response = {
      send: (status: number, body: Object) => {
         return reply(body).code(status);
      }
    };

    const seatbeltRequest: ServerPlugin.Request = {
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

  public config: ServerPlugin.Config = function(seatbelt: any) {
    const routes: ServerPlugin.Route[] = seatbelt.plugins.route;

    this.server.connection({ port: this.port });
    if (routes && Array.isArray(routes)) {
      routes.forEach((route: ServerPlugin.Route) => {
        route['__routeConfig'].type.forEach((eachType: string) => {
          route['__routeConfig'].path.forEach((eachPath: string) => {
            this.ServerPlugin.route({
              method: eachType.toLowerCase(),
              path: eachPath,
              handler: (request: hapi.Request, reply: hapi.Response) => this.conformServerControllerToSeatbeltController(route, request, reply)
            });
          });
        });
      });
    }
  };

  public init: ServerPlugin.Init = function() {
    this.server.start((err: Error) => {
      if (err) {
        throw err;
      }
      this.log.system(`Server running at: ${this.ServerPlugin.info.uri}`);
    });
  };
}
