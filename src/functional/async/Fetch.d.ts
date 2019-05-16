import {Task} from '../core/Task';

type ObjectLiteral = { [key: string]: any } | string;

export const fetchTask: Task<ObjectLiteral>;
export const get: Task<ObjectLiteral>;
export const post: Task<ObjectLiteral>;
export const del: Task<ObjectLiteral>;
export const put: Task<ObjectLiteral>;
