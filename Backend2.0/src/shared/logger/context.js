import { AsyncLocalStorage } from "node:async_hooks";

const als = new AsyncLocalStorage();

const getContext = () => als.getStore() || {};

export { als, getContext };
