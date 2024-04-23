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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetamaskWallet = void 0;
var ethers_1 = require("ethers");
var express = require("express");
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var MetamaskWallet = /** @class */ (function (_super) {
    __extends(MetamaskWallet, _super);
    // private _contractInterface = new utils.Interface([
    // 	'event AuctionStarted(uint256 auctionId, address borrower, address lpToken, uint256 lockIndex, uint256 dealAmount, uint256 interestRate, uint256 loanDuration)',
    // 	'event DealInitialized(uint256 dealId, address borrower, address lpToken, uint256 lockIndex, uint256 dealAmount, uint256 interestRate, uint256 loanDuration)',
    // 	'function initializeDeal(address lpToken, uint256 lockIndex, uint256 dealType, uint256 dealAmount, uint256 interestRate, uint256 loanDuration) nonpayable',
    // 	'function activateDeal(uint256 dealId) external',
    // 	'function makeDeal(uint256 dealId) external payable',
    // 	'function cancelDeal(uint256 dealId) nonpayable',
    // 	'function repayLoan(uint256 dealId) payable',
    // 	'function claimCollateral(uint256 dealId) nonpayable',
    // 	'function startAuction(address lpToken, uint256 lockIndex, uint256 amount, uint256 startPrice, uint256 duration) nonpayable',
    // 	'function makeBid(uint256 auctionId) nonpayable',
    // 	'function withdrawAuctionLiquidity(uint256 auctionId) nonpayable',
    // 	'function claimAuction(uint256 auctionId) nonpayable',
    // 	// Определения функций из UniswapV2Locker
    // 	'function getUserNumLockedTokens(address) view returns (uint256)',
    // 	'function getUserLockedTokenAtIndex(address, uint256) view returns (address)',
    // 	'function getUserNumLocksForToken(address, address) view returns (uint256)',
    // 	'function getUserLockForTokenAtIndex(address, address, uint256) view returns (uint256, uint256, uint256, uint256, uint256, address)',
    // 	//read methods
    // 	'function getUserDeals(address) external view returns (uint256[])',
    // 	'function getUserAuction(address) external view returns (uint256[])',
    // 	'function nextAuctionId() view returns (uint256)',
    // 	'function getAuction(uint256 auctionId) view returns (address owner, address highestBidOwner, address lpToken, uint256 lockIndex, uint256 startPrice, uint256 duration, uint256 startTime, bool isActive)',
    // 	'function nextDealId() view returns (uint256)',
    // 	'function getDeal(uint256) view returns (address, address, uint256, uint256, uint256, uint256, uint256, uint256, address, bool, bool)'
    // ]);
    function MetamaskWallet() {
        var _this = _super.call(this) || this;
        _this.name = 'metamask';
        _this._chain = 'eth';
        _this.contracts = {
            STAKE: '0x73eaD24A83df34dFAE3f7A18900266Abba351D4a',
            UNCX: '0xaDB2437e6F65682B85F814fBc12FeC0508A7B1D0'
        };
        _this._networks = {
            // polygon: {
            // 	name: 'Polygon Mainnet',
            // 	symbol: 'MATIC',
            // 	rpcUrl: 'https://polygon-rpc.com',
            // 	chainId: 137,
            // 	blockExplorerUrl: 'https://polygonscan.com'
            // }
            eth: {
                name: 'Sepolia',
                symbol: 'ETH',
                rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/1NmwpIhZyYUqzGibxMvMmrLYpqCudm4h',
                chainId: 11155111,
                blockExplorerUrl: 'https://sepolia.etherscan.io'
            }
        };
        _this.instances = new Map();
        _this._contractInterface = require("./abi.json");
        _this.setInstances(_this._networks[_this._chain]);
        _this._provider = new ethers_1.ethers.providers.JsonRpcProvider(_this._networks[_this._chain].rpcUrl);
        return _this;
    }
    MetamaskWallet.prototype.setInstances = function (network) {
        var provider = new ethers_1.providers.JsonRpcProvider(network.rpcUrl);
        this.instances.set(this._chain, provider);
    };
    MetamaskWallet.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var provider, signer, address, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        provider = new ethers_1.ethers.providers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/1NmwpIhZyYUqzGibxMvMmrLYpqCudm4h');
                        signer = provider.getSigner("0x73eaD24A83df34dFAE3f7A18900266Abba351D4a");
                        return [4 /*yield*/, signer.getAddress()];
                    case 1:
                        address = _a.sent();
                        console.log(address);
                        // const address = "0x8fd624352279579a7c70814A4774c6772A9B99ab"
                        this.address = address;
                        this._signer = signer;
                        console.log("object");
                        this.subscribeToDealActivated();
                        console.log("sds");
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MetamaskWallet.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                (_b = (_a = this._provider) === null || _a === void 0 ? void 0 : _a.removeAllListeners) === null || _b === void 0 ? void 0 : _b.call(_a);
                return [2 /*return*/];
            });
        });
    };
    MetamaskWallet.prototype.checkConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log(this._provider, this._signer, this._signer);
                return [2 /*return*/];
            });
        });
    };
    MetamaskWallet.prototype.getAddr = function () {
        var _a;
        return (_a = this._signer) === null || _a === void 0 ? void 0 : _a.getAddress();
    };
    MetamaskWallet.prototype.initializeDeal = function (lpToken, lockIndex, dealType, dealAmount, interestRate, loanDuration) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        contract = new ethers_1.ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
                        return [4 /*yield*/, contract.initializeDeal(lpToken, ethers_1.ethers.utils.parseEther(lockIndex), ethers_1.ethers.utils.parseEther(dealType), ethers_1.ethers.utils.parseEther(dealAmount), ethers_1.ethers.utils.parseEther(interestRate), ethers_1.ethers.utils.parseEther(loanDuration))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        e_1 = _a.sent();
                        console.log(e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MetamaskWallet.prototype.makeDeal = function (dealId) {
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
                        return [4 /*yield*/, contract.makeDeal(dealId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MetamaskWallet.prototype.makeBid = function (auctionId, bidAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
                        return [4 /*yield*/, contract.makeBid(auctionId, ethers_1.ethers.utils.parseEther(bidAmount))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MetamaskWallet.prototype.cancelDeal = function (dealId) {
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
                        return [4 /*yield*/, contract.cancelDeal(dealId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MetamaskWallet.prototype.claimCollateral = function (dealId) {
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
                        return [4 /*yield*/, contract.claimCollateral(dealId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MetamaskWallet.prototype.repayLoan = function (dealId, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
                        return [4 /*yield*/, contract.repayLoan(dealId, ethers_1.ethers.utils.parseEther(amount))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MetamaskWallet.prototype.withdrawAuctionLiquidity = function (auctionId) {
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
                        return [4 /*yield*/, contract.withdrawAuctionLiquidity(auctionId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MetamaskWallet.prototype.claimAuction = function (auctionId) {
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
                        return [4 /*yield*/, contract.claimAuction(auctionId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MetamaskWallet.prototype.startAuction = function (lockId, amount, startPrice, duration) {
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
                        return [4 /*yield*/, contract.startAuction(lockId, ethers_1.ethers.utils.parseEther(amount), ethers_1.ethers.utils.parseEther(startPrice), duration)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MetamaskWallet.prototype.subscribeToDealActivated = function () {
        var contract = new ethers_1.ethers.Contract(this.contracts.STAKE, this._contractInterface, this._provider);
        contract.on("AuctionActivated", function (auctionId, activator) {
            console.log("Deal activated with ID:", auctionId.toString());
            // Now you have the deal ID, you can cancel it or perform any other action
            // Call cancelDeal function with the obtained deal ID
            // this.cancelDeal(dealId);
        });
    };
    MetamaskWallet.prototype.getAllDeals = function () {
        return __awaiter(this, void 0, void 0, function () {
            var contract, nextDealId, dealsPromises, i, resolvedDeals, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!this._provider) {
                            throw new Error('Provider is not initialized');
                        }
                        contract = new ethers_1.ethers.Contract(this.contracts.STAKE, // Адрес вашего контракта
                        this._contractInterface, // ABI вашего контракта
                        this._signer // Инициализированный провайдер
                        );
                        return [4 /*yield*/, contract.nextDealId()];
                    case 1:
                        nextDealId = _a.sent();
                        dealsPromises = [];
                        for (i = 0; i < nextDealId; i++) {
                            dealsPromises.push(contract.getDeal(i).then(function (deal) { return ({
                                borrower: deal[0],
                                lpToken: deal[1],
                                lockIndex: deal[2].toNumber(),
                                dealType: deal[3].toNumber(),
                                dealAmount: deal[4].toNumber(),
                                interestRate: deal[5].toNumber(),
                                loanDuration: deal[6].toNumber(),
                                startTime: deal[7].toNumber(),
                                lender: deal[8],
                                isRepaid: deal[9],
                                isActive: deal[10]
                            }); }));
                        }
                        return [4 /*yield*/, Promise.all(dealsPromises)];
                    case 2:
                        resolvedDeals = _a.sent();
                        console.log(resolvedDeals);
                        return [2 /*return*/, __spreadArray(__spreadArray([], resolvedDeals, true), [{
                                    borrower: 'string',
                                    lpToken: 'string',
                                    lockIndex: 0,
                                    dealType: 0,
                                    dealAmount: 0,
                                    interestRate: 0,
                                    loanDuration: 0,
                                    startTime: 0,
                                    lender: 'string',
                                    isRepaid: false,
                                    isActive: false
                                }], false)];
                    case 3:
                        e_2 = _a.sent();
                        console.error(e_2);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MetamaskWallet.prototype.getAllAuctions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var contract, nextAuctionId, auctionsPromises, i, resolvedAuctions, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!this._provider) {
                            throw new Error('Provider is not initialized');
                        }
                        contract = new ethers_1.ethers.Contract(this.contracts.STAKE, // Адрес вашего контракта
                        this._contractInterface, // ABI вашего контракта
                        this._signer // Инициализированный провайдер
                        );
                        return [4 /*yield*/, contract.nextAuctionId()];
                    case 1:
                        nextAuctionId = _a.sent();
                        auctionsPromises = [];
                        for (i = 0; i < nextAuctionId; i++) {
                            auctionsPromises.push(contract.getDeal(i).then(function (auction) { return ({
                                owner: auction[0],
                                highestBidOwner: auction[1],
                                lpToken: auction[2],
                                lockIndex: auction[3].toNumber(),
                                startPrice: auction[4].toNumber(),
                                duration: auction[5].toNumber(),
                                startTime: auction[6].toNumber(),
                                isActive: auction[7],
                            }); }));
                        }
                        return [4 /*yield*/, Promise.all(auctionsPromises)];
                    case 2:
                        resolvedAuctions = _a.sent();
                        console.log(resolvedAuctions);
                        return [2 /*return*/, __spreadArray(__spreadArray([], resolvedAuctions, true), [{
                                    owner: 'string',
                                    highestBidOwner: 'string',
                                    lpToken: 'string',
                                    lockIndex: 0,
                                    startPrice: 0,
                                    duration: 0,
                                    startTime: 0,
                                    isActive: false
                                }], false)];
                    case 3:
                        e_3 = _a.sent();
                        console.error(e_3);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return MetamaskWallet;
}(tiny_typed_emitter_1.TypedEmitter));
exports.MetamaskWallet = MetamaskWallet;
var app = express();
var wallet = new MetamaskWallet();
wallet.connect();
app.get('/get_all_deals', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var allDeals, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, wallet.getAllDeals()];
            case 1:
                allDeals = _a.sent();
                console.log(allDeals);
                res.send(allDeals);
                return [3 /*break*/, 3];
            case 2:
                e_4 = _a.sent();
                res.status(500).send('Error connecting to wallet');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/get_all_auctions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var allAuctions, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, wallet.getAllAuctions()];
            case 1:
                allAuctions = _a.sent();
                console.log(allAuctions);
                res.send(allAuctions);
                return [3 /*break*/, 3];
            case 2:
                e_5 = _a.sent();
                res.status(500).send('Error connecting to wallet');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/accept_deal', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accepted_deal, e_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, wallet.makeDeal(Number(req.query.deal_id))];
            case 1:
                accepted_deal = _a.sent();
                console.log(accepted_deal);
                res.send(accepted_deal);
                return [3 /*break*/, 3];
            case 2:
                e_6 = _a.sent();
                res.status(500).send('Error connecting to wallet');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/cancel_deal', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var canceled_deal, e_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log(Number(req.query.deal_id));
                return [4 /*yield*/, wallet.cancelDeal(Number(req.query.deal_id))];
            case 1:
                canceled_deal = _a.sent();
                console.log(canceled_deal);
                res.send(canceled_deal);
                return [3 /*break*/, 3];
            case 2:
                e_7 = _a.sent();
                res.status(500).send('Error connecting to wallet');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
var port = process.env.PORT || 3000;
app.listen(port, function () { return console.log("Server listening on port ".concat(port)); });
// npx tsc metamask-wallet.ts  
// node metamask-wallet.js   
