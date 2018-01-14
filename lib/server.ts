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
import * as Router from 'koa-router'
import { IRouterOptions } from 'koa-router'
import { Router as Router1 } from './routing/router'

const app = new Application();



// app.resolveAndCreate();

// const router: Router = app.make(Router); 
// var router = new Router();




// router.get('/:id', async ctx => {
//     console.log(ctx.params)
//     ctx.body = 'Hello World. id: ' + ctx.params['id'];
// });

app.router.group('/user', (router: Router) => {
    router.get('/', (ctx) => {
        ctx.body = 'hello, user';
    })
    router.get('/:id', (ctx) => {
        console.log(ctx.params);
        ctx.body = 'Hello World. id: ' + ctx.params['id'];
    });
});



app.listen(3000);



