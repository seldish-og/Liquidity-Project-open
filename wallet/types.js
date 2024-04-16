"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderRpcError = exports.NetworkConfig = exports.Network = exports.Chain = void 0;
var zod_1 = require("zod");
exports.Chain = zod_1.z.enum(['eth']);
exports.Network = zod_1.z.object({
    name: zod_1.z.string(),
    symbol: zod_1.z.string(),
    chainId: zod_1.z.number().int().positive(),
    rpcUrl: zod_1.z.string().url(),
    blockExplorerUrl: zod_1.z.string().url()
});
exports.NetworkConfig = zod_1.z.object({ eth: exports.Network });
var ProviderRpcError = /** @class */ (function (_super) {
    __extends(ProviderRpcError, _super);
    function ProviderRpcError(code, message, data) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.data = data;
        return _this;
    }
    return ProviderRpcError;
}(Error));
exports.ProviderRpcError = ProviderRpcError;
