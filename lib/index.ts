import * as hapi from 'hapi';
import { ServerPlugin } from '@seatbelt/core/plugins';
import { Log, Route } from '@seatbelt/core';

export interface IServerConfig {
  port?: number;
}

@ServerPlugin.Register({
  name: 'HapiServer'
})
export class HapiServer implements ServerPlugin.BaseInterface {
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

  public conformServerControllerToSeatbeltController: Function = function (route: ServerPlugin.RouteInterface, req: hapi.Request, reply: hapi.ReplyNoContinue) {
    if (!route.controller) {
      return reply({status: 'request failed'}).code(500);
    }

    const send = (status: number, body: Object) => reply(body).code(status);

    const seatbeltResponse: Route.Response.BaseInterface = {
      send,
      ok: (body: Object) => send(200, body),
      created: (body: Object) => send(201, body),
      badRequest: (body: Object) => send(400, body),
      unauthorized: (body: Object) => send(401, body),
      forbidden: (body: Object) => send(403, body),
      notFound: (body: Object) => send(404, body),
      serverError: (body: Object) => send(500, body)
    };

    const seatbeltRequest: Route.Request.BaseInterface = {
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

  public config: ServerPlugin.Config = function(seatbelt: any, cb: Function) {
    const routes: ServerPlugin.RouteInterface[] = seatbelt.plugins.route;

    this.server.connection({ port: this.port });
    if (routes && Array.isArray(routes)) {
      routes.forEach((route: ServerPlugin.RouteInterface) => {
        route['__routeConfig'].type.forEach((eachType: string) => {
          route['__routeConfig'].path.forEach((eachPath: string) => {
            this.server.route({
              method: eachType.toLowerCase(),
              path: eachPath,
              handler: (request: hapi.Request, reply: hapi.Response) => this.conformServerControllerToSeatbeltController(route, request, reply)
            });
          });
        });
      });
    }
    cb();
  };

  public init: ServerPlugin.Init = function() {
    this.server.start((err: Error) => {
      if (err) {
        throw err;
      }
      this.log.system(`Server running at: ${this.server.info.uri}`);
    });
  };
}
