import * as hapi from 'hapi';
import { Server } from '@seatbelt/core/lib/server';
import { Log } from '@seatbelt/core';
export interface IServerConfig {
    port?: number;
}
export declare class HapiServer implements Server.BaseServer {
    log: Log;
    server: hapi.Server;
    port: number;
    constructor(config?: IServerConfig);
    conformServerControllerToSeatbeltController: Function;
    config: Server.Config;
    init: Server.Init;
}
