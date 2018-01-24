// import * as Koa from 'koa';

// const app = new Koa();

// // x-response-time

// app.use(async (ctx, next) => {
//   const start = Date.now();
//   await next();
//   const ms = Date.now() - start;
//   ctx.set('X-Response-Time', `${ms}ms`);
//   console.log('X-Response-Time', `${ms}ms`);
// });

// // logger

// app.use(async (ctx, next) => {
//   const start = Date.now();
//   await next();
//   const ms = Date.now() - start;
//   console.log(`${ctx.method} ${ctx.url} - ${ms}`);
// });

// // response

// app.use(async ctx => {
//   ctx.body = 'Hello World';
// });

// app.listen(3000);


import 'reflect-metadata'
import { ReflectiveInjector, Injectable, Inject, ResolvedReflectiveProvider } from 'injection-js';
import { Injector } from 'injection-js/injector';
import { Application } from './application'
import { Controller } from './routing/controller';
import * as BaseRouter from 'koa-router';
import { Context } from 'koa';
import { Router } from './routing/router';
// import * as Router from 'koa-router'
// import { IRouterOptions } from 'koa-router'
// import { Router as Router1 } from './routing/router'

const app = new Application();


// app.register({provide: BaseRouter, useFactory: function() {return new BaseRouter();} });
// app.register(Router)
// app.resolveAndCreate();

async function responseTime(ctx: Context, next: Function) {
    const start = Date.now();
    await next();
    const ms = Date.now() - start + 100;
    ctx.set('X-Response-Time', `${ms}ms`);
}

app.register({
    provide: 'api', useValue: responseTime
});



// app.use(app.make('api'));

// const router: Router = app.make(Router);
// app.router.group({ namespace: 'test/namespace' }, (router) => {
//     router.group({ prefix: 'group' }, () => {
//         router.group({ middleware: 'api' }, () => {
//             router.get('/', { fn: async (ctx) => { ctx.body = 'fuck'; } });
//         })
//     });
// });

app.router.get('/', async (ctx) => {
    ctx.body = JSON.stringify({
        'code': 'ok',
        'error': false,
        'payload': 'Hello World'
    });
});

// var router = new Router();

// console.log(app.router._routes);


// router.get('/:id', async ctx => {
//     console.log(ctx.params)
//     ctx.body = 'Hello World. id: ' + ctx.params['id'];
// });





const port = 3000;

console.log('listen on', port);
app.listen(port);



