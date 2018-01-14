import { ReflectiveInjector, Injector, Provider } from 'injection-js';
import * as KoaApplication from 'koa';
import * as assert from 'assert';
import * as fs from 'fs'
import { Router } from './routing/router';
import { Server } from 'http'

type Options = { baseDir: string, type: any };

export class Application extends KoaApplication {

    options: Options;
    injector: Injector;
    providers: Provider[];
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
        this.bootstrapRouter();
    }

    bootstrapRouter() {
        this.router = new Router();
    }

    useRouter() {
        this.use(this.router.routes());
        this.use(this.router.allowedMethods());
    }


    register(provider: Provider) {
        this.providers.push(provider);
    }

    resolveAndCreate() {
        this.injector = ReflectiveInjector.resolveAndCreate(this.providers);
    }

    make(token: any, notFoundValue?: any): any {
        return this.injector.get(token, notFoundValue);
    }

    listen(...args: any[]): Server{

        this.useRouter();

        // Final works
        return super.listen(...args)
    }
}