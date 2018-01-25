import {Context} from 'koa'

export class Controller {
    // validate(ctx: Context, rules: {}, messages: {}, customAttribute: {}) {

    // }

    // getValidationFactory() {

    // }

    ctx: Context;

    setContext(ctx: Context): Controller {
        this.ctx = ctx;
        return this;
    }
}