import { ReflectiveInjector, Injector, Provider, Injectable } from 'injection-js';
import * as KoaApplication from 'koa';
import * as assert from 'assert';
import * as fs from 'fs'
import * as Cookies from 'cookies';
import * as accepts from 'accepts';
import { Router } from './routing/router';
import * as BaseRouter from 'koa-router';
import * as path from 'path';
import { IncomingMessage, ServerResponse, Server } from 'http';

export type Options = { baseDir: string, type: any };

export class Application extends KoaApplication {

    options: Options;
    injector: Injector;
    providers: Array<Provider>;
    router: Router;

    constructor(options: Options = { baseDir: process.cwd(), type: 'application' }) {

        assert(typeof options.baseDir === 'string', 'options.baseDir required, and must be a string');
        assert(fs.existsSync(options.baseDir), `Directory ${options.baseDir} not exists`);
        assert(fs.statSync(options.baseDir).isDirectory(), `Directory ${options.baseDir} is not a directory`);
        assert(options.type === 'application' || options.type === 'agent', 'options.type should be application or agent');

        super();

        this.options = options;
        this.providers = [];


        // Final works
        this.bootstrapContainer();
        this.bootstrapRouter();
    }

    bootstrapRouter() {
        this.router = this.make(Router);
    }

    useRouter() {
        this.use(this.router.routes());
        this.use(this.router.allowedMethods());
    }

    bootstrapContainer() {
        this.register({ provide: 'app', useValue: this });
        this.register({ provide: 'app', useValue: this });
        this.register({ provide: Application, useValue: this });
        this.registerContainerAliases();
        this.resolveAndCreate();
    }

    registerContainerAliases() {
        // test router
        this.register([
            { provide: BaseRouter, useFactory: function () { return new BaseRouter(); } },
            Router
        ]);
    }

    register(provider: Provider | Array<Provider>) {
        if (provider instanceof Array) {
            this.providers = this.providers.concat(provider);
        } else {
            this.providers.push(provider);
        }
    }

    resolveAndCreate() {
        this.injector = ReflectiveInjector.resolveAndCreate(this.providers);
    }

    make(token: any, notFoundValue?: any): any {
        return this.injector.get(token, notFoundValue);
    }

    // getCallable(callable: string| Array<string>): Function {
    //     if (typeof callable == 'string') {
    //         callable = callable.split('@');
    //     }

    //     const className = callable[0];
    //     const methodName = callable[1];

    //     return this.make(className)[methodName];
    // }

    listen(...args: any[]): Server {

        this.useRouter();

        // Final works
        return super.listen(...args)
    }

    // createContext(req: IncomingMessage, res: ServerResponse): KoaApplication.Context {
    //     const context = Object.create(this.context);
    //     const request = context.request = Object.create(this.request);
    //     const response = context.response = Object.create(this.response);
    //     context.app = request.app = response.app = this;
    //     context.req = request.req = response.req = req;
    //     context.res = request.res = response.res = res;
    //     request.ctx = response.ctx = context;
    //     request.response = response;
    //     response.request = request;
    //     context.originalUrl = request.originalUrl = req.url;
    //     context.cookies = new Cookies(req, res, {
    //         keys: this.keys,
    //         secure: request.secure
    //     });
    //     request.ip = request.ips[0] || req.socket.remoteAddress || '';
    //     context.accept = request.accept = accepts(req);
    //     context.state = {};
    //     return context;
    // }
}