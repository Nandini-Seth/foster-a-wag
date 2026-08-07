"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/me/route";
exports.ids = ["app/api/auth/me/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.ts&appDir=%2FUsers%2Fnandiniseth%2FCode%2FFosterAWagVersions%2Ffoster-a-wag%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnandiniseth%2FCode%2FFosterAWagVersions%2Ffoster-a-wag&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.ts&appDir=%2FUsers%2Fnandiniseth%2FCode%2FFosterAWagVersions%2Ffoster-a-wag%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnandiniseth%2FCode%2FFosterAWagVersions%2Ffoster-a-wag&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_nandiniseth_Code_FosterAWagVersions_foster_a_wag_app_api_auth_me_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/me/route.ts */ \"(rsc)/./app/api/auth/me/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/me/route\",\n        pathname: \"/api/auth/me\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/me/route\"\n    },\n    resolvedPagePath: \"/Users/nandiniseth/Code/FosterAWagVersions/foster-a-wag/app/api/auth/me/route.ts\",\n    nextConfigOutput,\n    userland: _Users_nandiniseth_Code_FosterAWagVersions_foster_a_wag_app_api_auth_me_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/me/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGbWUlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkZtZSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkZtZSUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRm5hbmRpbmlzZXRoJTJGQ29kZSUyRkZvc3RlckFXYWdWZXJzaW9ucyUyRmZvc3Rlci1hLXdhZyUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZuYW5kaW5pc2V0aCUyRkNvZGUlMkZGb3N0ZXJBV2FnVmVyc2lvbnMlMkZmb3N0ZXItYS13YWcmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ2dDO0FBQzdHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZm9zdGVyLWEtd2FnLz8wNmE0Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9uYW5kaW5pc2V0aC9Db2RlL0Zvc3RlckFXYWdWZXJzaW9ucy9mb3N0ZXItYS13YWcvYXBwL2FwaS9hdXRoL21lL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL21lL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9tZVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC9tZS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9uYW5kaW5pc2V0aC9Db2RlL0Zvc3RlckFXYWdWZXJzaW9ucy9mb3N0ZXItYS13YWcvYXBwL2FwaS9hdXRoL21lL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hdXRoL21lL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.ts&appDir=%2FUsers%2Fnandiniseth%2FCode%2FFosterAWagVersions%2Ffoster-a-wag%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnandiniseth%2FCode%2FFosterAWagVersions%2Ffoster-a-wag&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/me/route.ts":
/*!**********************************!*\
  !*** ./app/api/auth/me/route.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_session__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/session */ \"(rsc)/./lib/session.ts\");\n\n\nasync function GET() {\n    const session = await (0,_lib_session__WEBPACK_IMPORTED_MODULE_1__.getSession)();\n    if (!session.isLoggedIn) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            isLoggedIn: false\n        });\n    }\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        isLoggedIn: true,\n        userId: session.userId,\n        role: session.role,\n        email: session.email,\n        profileId: session.profileId\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvbWUvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQTJDO0FBQ0E7QUFFcEMsZUFBZUU7SUFDcEIsTUFBTUMsVUFBVSxNQUFNRix3REFBVUE7SUFDaEMsSUFBSSxDQUFDRSxRQUFRQyxVQUFVLEVBQUU7UUFDdkIsT0FBT0oscURBQVlBLENBQUNLLElBQUksQ0FBQztZQUFFRCxZQUFZO1FBQU07SUFDL0M7SUFDQSxPQUFPSixxREFBWUEsQ0FBQ0ssSUFBSSxDQUFDO1FBQ3ZCRCxZQUFZO1FBQ1pFLFFBQVFILFFBQVFHLE1BQU07UUFDdEJDLE1BQU1KLFFBQVFJLElBQUk7UUFDbEJDLE9BQU9MLFFBQVFLLEtBQUs7UUFDcEJDLFdBQVdOLFFBQVFNLFNBQVM7SUFDOUI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2Zvc3Rlci1hLXdhZy8uL2FwcC9hcGkvYXV0aC9tZS9yb3V0ZS50cz9jNzIzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcbmltcG9ydCB7IGdldFNlc3Npb24gfSBmcm9tICdAL2xpYi9zZXNzaW9uJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVCgpIHtcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlc3Npb24oKTtcbiAgaWYgKCFzZXNzaW9uLmlzTG9nZ2VkSW4pIHtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBpc0xvZ2dlZEluOiBmYWxzZSB9KTtcbiAgfVxuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgIGlzTG9nZ2VkSW46IHRydWUsXG4gICAgdXNlcklkOiBzZXNzaW9uLnVzZXJJZCxcbiAgICByb2xlOiBzZXNzaW9uLnJvbGUsXG4gICAgZW1haWw6IHNlc3Npb24uZW1haWwsXG4gICAgcHJvZmlsZUlkOiBzZXNzaW9uLnByb2ZpbGVJZCxcbiAgfSk7XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZ2V0U2Vzc2lvbiIsIkdFVCIsInNlc3Npb24iLCJpc0xvZ2dlZEluIiwianNvbiIsInVzZXJJZCIsInJvbGUiLCJlbWFpbCIsInByb2ZpbGVJZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/me/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/session.ts":
/*!************************!*\
  !*** ./lib/session.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getSession: () => (/* binding */ getSession),\n/* harmony export */   sessionOptions: () => (/* binding */ sessionOptions)\n/* harmony export */ });\n/* harmony import */ var iron_session__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! iron-session */ \"(rsc)/./node_modules/iron-session/dist/index.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\n\nconst sessionOptions = {\n    password: process.env.SESSION_SECRET || \"foster-a-wag-secret-key-min-32-chars-!!\",\n    cookieName: \"foster-a-wag-session\",\n    cookieOptions: {\n        secure: \"development\" === \"production\",\n        maxAge: 60 * 60 * 24 * 7\n    }\n};\nasync function getSession() {\n    const session = await (0,iron_session__WEBPACK_IMPORTED_MODULE_1__.getIronSession)(await (0,next_headers__WEBPACK_IMPORTED_MODULE_0__.cookies)(), sessionOptions);\n    if (!session.isLoggedIn) {\n        session.isLoggedIn = false;\n    }\n    return session;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc2Vzc2lvbi50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQThEO0FBQ3ZCO0FBVWhDLE1BQU1FLGlCQUFpQztJQUM1Q0MsVUFBVUMsUUFBUUMsR0FBRyxDQUFDQyxjQUFjLElBQUk7SUFDeENDLFlBQVk7SUFDWkMsZUFBZTtRQUNiQyxRQUFRTCxrQkFBeUI7UUFDakNNLFFBQVEsS0FBSyxLQUFLLEtBQUs7SUFDekI7QUFDRixFQUFFO0FBRUssZUFBZUM7SUFDcEIsTUFBTUMsVUFBVSxNQUFNWiw0REFBY0EsQ0FBYyxNQUFNQyxxREFBT0EsSUFBSUM7SUFDbkUsSUFBSSxDQUFDVSxRQUFRQyxVQUFVLEVBQUU7UUFDdkJELFFBQVFDLFVBQVUsR0FBRztJQUN2QjtJQUNBLE9BQU9EO0FBQ1QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mb3N0ZXItYS13YWcvLi9saWIvc2Vzc2lvbi50cz8xZGUxIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldElyb25TZXNzaW9uLCBTZXNzaW9uT3B0aW9ucyB9IGZyb20gJ2lyb24tc2Vzc2lvbic7XG5pbXBvcnQgeyBjb29raWVzIH0gZnJvbSAnbmV4dC9oZWFkZXJzJztcblxuZXhwb3J0IGludGVyZmFjZSBTZXNzaW9uRGF0YSB7XG4gIHVzZXJJZD86IHN0cmluZztcbiAgcm9sZT86ICdGT1NURVInIHwgJ1JFU0NVRScgfCAnQURNSU4nO1xuICBlbWFpbD86IHN0cmluZztcbiAgcHJvZmlsZUlkPzogc3RyaW5nO1xuICBpc0xvZ2dlZEluOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3Qgc2Vzc2lvbk9wdGlvbnM6IFNlc3Npb25PcHRpb25zID0ge1xuICBwYXNzd29yZDogcHJvY2Vzcy5lbnYuU0VTU0lPTl9TRUNSRVQgfHwgJ2Zvc3Rlci1hLXdhZy1zZWNyZXQta2V5LW1pbi0zMi1jaGFycy0hIScsXG4gIGNvb2tpZU5hbWU6ICdmb3N0ZXItYS13YWctc2Vzc2lvbicsXG4gIGNvb2tpZU9wdGlvbnM6IHtcbiAgICBzZWN1cmU6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicsXG4gICAgbWF4QWdlOiA2MCAqIDYwICogMjQgKiA3LCAvLyA3IGRheXNcbiAgfSxcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTZXNzaW9uKCkge1xuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0SXJvblNlc3Npb248U2Vzc2lvbkRhdGE+KGF3YWl0IGNvb2tpZXMoKSwgc2Vzc2lvbk9wdGlvbnMpO1xuICBpZiAoIXNlc3Npb24uaXNMb2dnZWRJbikge1xuICAgIHNlc3Npb24uaXNMb2dnZWRJbiA9IGZhbHNlO1xuICB9XG4gIHJldHVybiBzZXNzaW9uO1xufVxuIl0sIm5hbWVzIjpbImdldElyb25TZXNzaW9uIiwiY29va2llcyIsInNlc3Npb25PcHRpb25zIiwicGFzc3dvcmQiLCJwcm9jZXNzIiwiZW52IiwiU0VTU0lPTl9TRUNSRVQiLCJjb29raWVOYW1lIiwiY29va2llT3B0aW9ucyIsInNlY3VyZSIsIm1heEFnZSIsImdldFNlc3Npb24iLCJzZXNzaW9uIiwiaXNMb2dnZWRJbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/session.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/iron-webcrypto","vendor-chunks/iron-session","vendor-chunks/cookie","vendor-chunks/uncrypto"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.ts&appDir=%2FUsers%2Fnandiniseth%2FCode%2FFosterAWagVersions%2Ffoster-a-wag%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnandiniseth%2FCode%2FFosterAWagVersions%2Ffoster-a-wag&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();