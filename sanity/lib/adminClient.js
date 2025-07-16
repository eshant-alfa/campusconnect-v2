"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminClient = void 0;
var client_1 = require("@sanity/client");
var env_1 = require("../env");
exports.adminClient = (0, client_1.createClient)({
    projectId: env_1.projectId,
    dataset: env_1.dataset,
    apiVersion: env_1.apiVersion,
    useCdn: false, // Disable CDN for mutations
    token: process.env.SANITY_API_WRITE_TOKEN, // Use write token for mutations
});
