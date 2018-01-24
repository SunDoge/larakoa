import * as BaseRouter from 'koa-router';
import { Injectable, Inject } from 'injection-js';
import { Context } from 'koa';
import { Application } from '../application';

export type IMiddleware = BaseRouter.IMiddleware;

function trim(str: string) {
    return str.replace(/^\/+|\/+$/g, '');
}
// function isset(variable: any): boolean {
//     return variable != undefined;
// }

// function unset(variable: any) {
//     variable = undefined;
// }
function isObject(): boolean {
    return true;
}

export interface IAttributes {
    prefix?: string | null;
    suffix?: string;
    uses?: string;
    domain?: string;
    middleware?: string | Array<string>;
    namespace?: string | null;
    as?: string;
    // fn?: IMiddleware;
}

export interface IAction {
    prefix?: string | null;
    suffix?: string;
    uses?: string;
    domain?: string;
    middleware?: string | Array<string>;
    namespace?: string | null;
    as?: string;
    fn?: IMiddleware;
}


@Injectable()
export class Router {
    // group(prefix: string | RegExp, ...middleware: Array<BaseRouter.IMiddleware | Function>): Router {
    //     const groupFunction: Function = middleware.pop()!;
    //     const groupRouter = new Router();
    //     groupFunction(groupRouter);
    //     middleware.push(groupRouter.routes(), groupRouter.allowedMethods());
    //     this.use(prefix, ...middleware as Array<BaseRouter.IMiddleware>);
    //     return this;
    // }

    // group(prefix: string | RegExp, middleware: Array<IMiddleware>, groupFunction: (router: Router) => void): Router {
    //     const groupRouter = new Router();
    //     groupFunction(groupRouter);
    //     middleware.push(groupRouter.routes(), groupRouter.allowedMethods());
    //     this.use(prefix, ...middleware);
    //     return this;
    // }

    baseRouter: BaseRouter;
    groupStack: Array<IAttributes> = [];
    namedRoutes: Map<string, string> = new Map();
    _routes: Map<string, any> = new Map();
    app: Application;

    constructor(baseRouter: BaseRouter, @Inject('app') app: Application) {
        this.baseRouter = baseRouter;
        this.app = app;
    }

    group(attributes: IAttributes, callback: (router: Router) => void) {
        if (attributes.middleware != undefined && typeof attributes.middleware == 'string') {
            attributes.middleware = attributes.middleware.split('|');
        }

        this.updateGroupStack(attributes);

        callback(this);

        this.groupStack.pop();
    }

    updateGroupStack(attributes: IAttributes) {
        if (this.groupStack.length > 0) {
            attributes = this.mergeWithLastGroup(attributes);
        }

        this.groupStack.push(attributes);
    }

    mergeGroup(newGroup: IAttributes, oldGroup: IAttributes): any {

        newGroup.namespace = Router.formatUsesPrefix(newGroup, oldGroup);

        newGroup.prefix = Router.formatGroupPrefix(newGroup, oldGroup);

        if (newGroup.domain != undefined) {
            oldGroup.domain = undefined;
        }

        if (oldGroup.as != undefined) {
            newGroup.as = oldGroup.as + (newGroup.as != undefined) ? '.' + newGroup.as : '';
        }

        // null is also !isset(), use == undefined
        if (oldGroup.suffix != undefined && newGroup.suffix == undefined) {
            newGroup.suffix = oldGroup.suffix;
        }

        // return array_merge_recursive(Arr::except($old, ['namespace', 'prefix', 'as', 'suffix']), $new);
        let middleware: Array<string> = [];

        if (oldGroup.middleware != undefined) {
            middleware = middleware.concat(oldGroup.middleware);
        }

        if (newGroup.middleware != undefined) {
            middleware = middleware.concat(newGroup.middleware);
        }

        newGroup.middleware = middleware;
        // console.log('newGroup.middleware', middleware)
        return newGroup;
    }

    mergeWithLastGroup(newGroup: any) {
        return this.mergeGroup(newGroup, this.groupStack.slice(-1)[0]);
    }

    static formatUsesPrefix(newUses: IAttributes, oldUses: IAttributes): string | null {
        if (newUses.namespace != undefined) {
            return oldUses.namespace != undefined && newUses.namespace.indexOf('/') !== 0
                ? oldUses.namespace.replace(/^\/+|\/+$/g, '') + '/' + newUses.namespace.replace(/^\/+|\/+$/g, '')
                : newUses.namespace.replace(/^\/+|\/+$/g, '');
        }

        return oldUses.namespace != undefined ? oldUses.namespace : null;
    }

    static formatGroupPrefix(newGroup: IAttributes, oldGroup: IAttributes): string | null {
        const oldPrefix = oldGroup.prefix != undefined ? oldGroup.prefix : null;

        if (newGroup.prefix != undefined) {
            return (oldPrefix ? oldPrefix.replace(/^\/+|\/+$/g, '') : '') + '/' + newGroup.prefix.replace(/^\/+|\/+$/g, '');
        }
        return oldPrefix;
    }


    addRoute(method: string | Array<string>, uri: string, action: any) {
        action = this.parseAction(action);

        let attributes = null;

        if (this.hasGroupStack()) {
            attributes = this.mergeWithLastGroup({});
        }

        if (attributes && attributes instanceof Object) {
            if (attributes.prefix != undefined) {
                uri = attributes.prefix.replace(/^\/+|\/+$/g, '') + '/' + uri.replace(/^\/+|\/+$/g, '');
            }

            if (attributes.suffix != undefined) {
                // rtrim suffix
                uri = uri.replace(/^\/+|\/+$/g, '') + attributes.suffix.replace(/\/+$/g, '');
            }

            action = this.mergeGroupAttributes(action, attributes);
        }

        uri = '/' + uri.replace(/^\/+|\/+$/g, '');

        if (action.as != undefined) {
            this.namedRoutes.set(action.as, uri);
        }

        if (method instanceof Object) {
            for (let verb of method) {
                // (this.baseRouter as any)[verb]();
                this._routes.set(verb + uri, { method: verb, uri: uri, action: action });
            }
        } else {
            this._routes.set(method + uri, { method: method, uri: uri, action: action });
        }
    }

    parseAction(action: any): any {
        if (typeof action == 'string') {
            return { uses: action };
        } else if (typeof action == 'function') {
            return { fn: action }
        }
        console.log('action', action)
        if (action.middleware != undefined && typeof action.middleware == 'string') {
            action.middleware = action.middleware.split('|');
            console.log(action.middleware);
        }

        return action;
    }

    hasGroupStack(): boolean {
        return this.groupStack.length > 0;
    }

    mergeGroupAttributes(action: any, attributes: IAttributes): any {
        const namespace = attributes.namespace ? attributes.namespace : null;
        const middleware = attributes.middleware ? attributes.middleware as Array<string> : null;
        const as = attributes.as ? attributes.as : null;

        return this.mergeNamespaceGroup(
            this.mergeMiddlewareGroup(
                this.mergeAsGroup(action, as),
                middleware
            ),
            namespace
        );
    }

    mergeNamespaceGroup(action: any, namespace: string | null = null): any {
        if (namespace && action.uses != undefined) {
            action.uses = namespace + '/' + action.uses;
        }

        return action;
    }

    mergeMiddlewareGroup(action: any, middleware: Array<string> | null = null): any {
        if (middleware) {
            if (action.middleware != undefined) {
                action.middleware = middleware.concat(action.middleware);
            } else {
                action.middleware = middleware;
            }
        }
        return action;
    }

    mergeAsGroup(action: any, as: string | null = null): any {
        if (as && as.length > 0) {
            if (action.as != undefined) {
                action.as = as + '.' + action.as;
            } else {
                action.as = as;
            }
        }

        return action;
    }

    get(uri: string, action: IAction| IMiddleware): Router {
        this.addRoute('get', uri, action);
        return this;
    }

    post(uri: string, action: IAction| IMiddleware): Router {
        this.addRoute('post', uri, action);
        return this;
    }

    put(uri: string, action: IAction| IMiddleware): Router {
        this.addRoute('put', uri, action);
        return this;
    }

    patch(uri: string, action: IAction| IMiddleware): Router {
        this.addRoute('patch', uri, action);
        return this;
    }

    del(uri: string, action: IAction| IMiddleware): Router {
        this.addRoute('del', uri, action);
        return this;
    }

    delete(uri: string, action: IAction| IMiddleware): Router {
        this.addRoute('delete', uri, action);
        return this;
    }

    all(uri: string, action: IAction| IMiddleware): Router {
        this.addRoute('all', uri, action);
        return this;
    }

    static url(path: string | RegExp, params: Object): string {
        return BaseRouter.url(path, params);
    }

    redirect(source: string, destination: string, code?: number): Router {
        return this.baseRouter.redirect.apply(this);
    }

    getRoutes(): any {

        return this._routes;

    }

    routes(): BaseRouter.IMiddleware {
        this._routes.forEach((route) => {
            this.parseRoute(route);
        })

        return this.baseRouter.routes();
    }

    parseRoute(route: any) {
        let middleware: Array<IMiddleware> = [];

        // if (route.action) {

        
        if (route.action.middleware) {
            
            for (let m of route.action.middleware) {
                middleware.push(this.app.make(m))
                console.log('m = ', m)
            }
        }

        if (route.action.uses) {
            const callable = route.action.uses.split('@');
            const className = callable[0];
            const methodName = callable[1];
            middleware.push(async (ctx: Context) => {
                await (ctx.app as Application).make(className).setContext(ctx)[methodName];
            });
        } else if (route.action.fn) {
            middleware.push(route.action.fn)
        }

        // }

        if (route.as) {
            (this.baseRouter as any)[route.method](route.as, route.uri, ...middleware);
        } else {
            (this.baseRouter as any)[route.method](route.uri, ...middleware);
        }
    }

    allowedMethods() {
        return this.baseRouter.allowedMethods();
    }
}