"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function validate(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
        if (!result.success)
            return next(result.error);
        req.body = result.data.body ?? req.body;
        next();
    };
}
