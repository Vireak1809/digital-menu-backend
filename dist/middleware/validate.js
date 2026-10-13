"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schemas) => (req, _res, next) => {
    try {
        if (schemas.body)
            req.body = schemas.body.parse(req.body);
        if (schemas.params)
            req.params = schemas.params.parse(req.params);
        if (schemas.query) {
            Object.defineProperty(req, 'query', {
                configurable: true,
                enumerable: true,
                value: schemas.query.parse(req.query),
                writable: true,
            });
        }
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.validate = validate;
