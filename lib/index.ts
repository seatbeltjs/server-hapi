import { Server } from 'hapi';

export function DHapi(): any {
  return function(OriginalClassConstructor: new() => any) {
    return class extends OriginalClassConstructor {
      public __seatbelt__: string;
      public __seatbelt_strap__: Function;
      constructor() {
        super();
        this.__seatbelt__ = 'server';
        this.__seatbelt_strap__ = function(routes: any[]) {
          this.server = new Server();
          this.port = process.env.port || 3000;
          this.__controller_wrapper__ = function (route: any, req: any, reply: Function) {
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
          this.server.connection({ port: this.port });

          if (routes && Array.isArray(routes)) {
            routes.forEach((route: any) => {
              route['__seatbelt_config__'].type.forEach((eachType: string) => {
                route['__seatbelt_config__'].path.forEach((eachPath: string) => {
                  this.server.route({
                    method: eachType.toLowerCase(),
                    path: eachPath,
                    handler: (request: any, reply: any) => this.__controller_wrapper__(route, request, reply)
                  });
                });
              });
            });
          }

          this.server.start((err: Error) => {
            if (err) {
              throw err;
            }
            console.log(`Server running at: ${this.server.info.uri}`);
          });
        };
      };
    };
  };
}
