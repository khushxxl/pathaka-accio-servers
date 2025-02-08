import { NextFunction, Request, Response } from 'express';

const removeEmptyObjectsAndArrays = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    for (const key in req.body) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            const element = req.body[key];
            // check if any of the keys is an empty object and delete it if so
            if (
                JSON.stringify(element) === '{}' &&
                Object.keys(element).length === 0
            ) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete req.body[key];
            }
            // check if any of the keys is an empty array and delete it if so
            if (Array.isArray(element) && !element.length) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete req.body[key];
            }
        }
    }
    next();
};

export { removeEmptyObjectsAndArrays };
