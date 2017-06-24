import { Server } from 'hapi';
import { Log } from '@seatbelt/core';
export declare class HapiServer {
    log: Log;
    server: Server;
    port: number;
    conformHapiControllerToSeatbeltController: Function;
    config: Function;
    init: Function;
}
export declare const server: HapiServer;
