export function DHapi(): any {
  return function(OriginalClassConstructor: new() => any) {
    return class extends OriginalClassConstructor {
      public __seatbelt__: string;
      public __seatbelt_strap__: Function;
      constructor() {
        super();
        this.__seatbelt__ = 'server';
        this.__seatbelt_strap__ = function(classesByType: any) {
          this.hapi = require('hapi');
          this.app = new this.hapi.Server();
          this.port = process.env.port || 3000;
          this.__controller_wrapper__ = function (controllerFunction: Function, req: any, reply: Function) {
            const nextWrapper = (i: number): any => {
              if (!controllerFunction) {
                return reply({status: 'request failed'}).code(500);
              }
              return controllerFunction({
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

          this.app.connection({ port: this.port });

          if (classesByType['route']) {
            classesByType['route'].forEach((route: any) => {

              route['__seatbelt_config__'].type.forEach((eachType: string) => {
                route['__seatbelt_config__'].path.forEach((eachPath: string) => {
                  this.app.route({
                    method: eachType.toLowerCase(),
                    path: eachPath,
                    handler: (request: any, reply: any) => this.__controller_wrapper__(route.controller, request, reply)
                  });
                });
              });
            });
          }

          this.app.start((err: Error) => {
            if (err) {
              throw err;
            }
            console.log(`Server running at: ${this.app.info.uri}`);
          });
        };
      };
    };
  };
}
