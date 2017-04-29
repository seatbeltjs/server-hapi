import { Log } from '../../log';

export function DHapi(): any {
  return function(OriginalClassConstructor: any) {

    return function () {
      const origin = new OriginalClassConstructor();
      origin.__seatbelt__ = 'server';
      origin.__seatbelt_strap__ = function(classesByType: any) {
        this.log = new Log('Hapi');
        this.hapi = require('hapi');
        this.app = new this.hapi.Server();
        this.port = process.env.port || 3000;
        this.log = new Log('Express');
        this.__controller_wrapper__ = function (controllerFunctions: Function[], req: any, reply: Function) {
          const nextWrapper = (i: number): any => {
            if (!controllerFunctions[i]) {
              return reply({status: 'request failed'}).code(500);
            }
            return controllerFunctions[i]({
              req,
              reply,
              next: () => nextWrapper(++i),
              params: Object.assign(
                {},
                typeof req.params === 'object' ? req.params : {},
                typeof req.body === 'object' ? req.body : {}
                ,
                typeof req.payload === 'object' ? req.payload : {}
                ,
                typeof req.query === 'object' ? req.query : {}
              )
            });
          };
          nextWrapper(0);
        };

        this.app.connection({ port: this.port });

        if (classesByType['route']) {
          classesByType['route'].forEach((route: any) => {

            const policies: any[] = [];
            route.__seatbelt_config__.policies.forEach((routePolicyName: string) => {
              classesByType['policy'].forEach((policy: any) => {
                if (routePolicyName === policy.__name__) {
                  policies.push(policy.controller);
                }
              });
            });

            const policiesPlusController = [
              ...policies,
              route.controller
            ];

            route['__seatbelt_config__'].type.forEach((eachType: string) => {
              route['__seatbelt_config__'].path.forEach((eachPath: string) => {
                this.app.route({
                    method: eachType.toLowerCase(),
                    path: eachPath,
                    handler: (request: any, reply: any) => origin.__controller_wrapper__(policiesPlusController, request, reply)
                });
              });
            });
          });
        }

        this.app.start((err: Error) => {
          if (err) {
            throw err;
          }
          this.log.system(`Server running at: ${this.app.info.uri}`);
        });
      };
      return origin;
    };
  };
}
