import * as hapi from 'hapi';
import { ServerPlugin } from '@seatbelt/core/plugins';
export interface IServerConfig {
    port?: number;
}
export declare class HapiServer implements ServerPlugin.BaseServer {
    private log;
    server: hapi.Server;
    port: number;
    constructor(config?: IServerConfig);
    conformServerControllerToSeatbeltController: Function;
    config: ServerPlugin.Config;
    init: ServerPlugin.Init;
}
