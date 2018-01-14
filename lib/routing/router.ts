import * as BaseRouter from 'koa-router'

export class Router extends BaseRouter {
    group(prefix: string | RegExp, ...middleware: Array<BaseRouter.IMiddleware | Function>): Router {
        const groupFunction: Function = middleware.pop()!;
        const groupRouter = new Router();
        groupFunction(groupRouter);
        middleware.push(groupRouter.routes(), groupRouter.allowedMethods());
        this.use(prefix, ...middleware as Array<BaseRouter.IMiddleware>);
        return this;
    }
}