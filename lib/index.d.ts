import * as hapi from 'hapi';
import { ServerPlugin } from '@seatbelt/core/plugins';
import { Log } from '@seatbelt/core';
export interface IServerConfig {
    port?: number;
}
export declare class HapiServer implements ServerPlugin.BaseServer {
    log: Log;
    server: hapi.Server;
    port: number;
    constructor(config?: IServerConfig);
    conformServerControllerToSeatbeltController: Function;
    config: ServerPlugin.Config;
    init: ServerPlugin.Init;
}
