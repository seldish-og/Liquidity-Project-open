"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeNetwork = exports.serializeChainId = exports.handleMultipleWalletExtensions = void 0;
var ethers_1 = require("ethers");
function handleMultipleWalletExtensions(provider, predicate, defaultValue) {
    var _a;
    if (predicate === void 0) { predicate = function (p) { return p.isMetaMask; }; }
    if (defaultValue === void 0) { defaultValue = provider; }
    var _b = provider.providers, providers = _b === void 0 ? [] : _b;
    return (_a = providers.find(predicate)) !== null && _a !== void 0 ? _a : defaultValue;
}
exports.handleMultipleWalletExtensions = handleMultipleWalletExtensions;
function serializeChainId(chainId) {
    return ethers_1.utils.hexStripZeros(ethers_1.utils.hexlify(chainId));
}
exports.serializeChainId = serializeChainId;
function serializeNetwork(net) {
    return {
        chainId: serializeChainId(net.chainId),
        chainName: net.name,
        rpcUrls: [net.rpcUrl],
        blockExplorerUrls: [net.blockExplorerUrl],
        nativeCurrency: {
            name: net.name,
            symbol: net.symbol,
            decimals: 18,
        },
    };
}
exports.serializeNetwork = serializeNetwork;
