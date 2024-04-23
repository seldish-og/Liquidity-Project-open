import { ethers, providers, Signer } from 'ethers';
import * as express from 'express';
import sqlite3 from 'sqlite3';
import { TypedEmitter } from 'tiny-typed-emitter';
import {
	Chain,
	Network,
	NetworkConfig,
	WalletEvents
} from './types';
import { Auction, Deal } from './wallet';
export class MetamaskWallet extends TypedEmitter<WalletEvents> {
	public address?: string;
	public readonly name = 'metamask';
	public _chain: Chain = 'eth';
	private readonly contracts = {
		STAKE: '0x73eaD24A83df34dFAE3f7A18900266Abba351D4a',
		UNCX: '0xaDB2437e6F65682B85F814fBc12FeC0508A7B1D0'
	};
	private readonly _networks: NetworkConfig = {
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
	public readonly instances = new Map<Chain, providers.Provider>();
	private _provider?: any;
	private _signer?: Signer;
	private _contractInterface = require("./abi.json");

	constructor() {
		super();
		this.setInstances(this._networks[this._chain]);
		this._provider = new ethers.providers.JsonRpcProvider(this._networks[this._chain].rpcUrl);
	}

	private setInstances(network: Network) {
		const provider = new providers.JsonRpcProvider(network.rpcUrl);

		this.instances.set(this._chain, provider);
	}



	async connect() {
		try {
			const provider = new ethers.providers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/1NmwpIhZyYUqzGibxMvMmrLYpqCudm4h');
			
			const signer = provider.getSigner("0x73eaD24A83df34dFAE3f7A18900266Abba351D4a");
			
			const address = await signer.getAddress();
			console.log(address);
			// const address = "0x8fd624352279579a7c70814A4774c6772A9B99ab"
			this.address = address;
			this._signer = signer;
			console.log("subscribe");

			this.subscribeToDealActivated();
			this.subscribeToAuctionStarted();

			console.log("subscribed to deals and auctions");
		
		} catch (error) {
			console.error(error);
		}
	}


	public async disconnect() {
		this._provider?.removeAllListeners?.();
	}

	public async checkConnection() {
		console.log(this._provider, this._signer, this._signer);
	}

	public getAddr() {
		return this._signer?.getAddress();
	}


	async initializeDeal(lpToken: string, lockIndex: string, dealType: string, dealAmount: string, interestRate: string, loanDuration: string) {
		try {
			const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
			return await contract.initializeDeal(
				lpToken,
				ethers.utils.parseEther(lockIndex),
				ethers.utils.parseEther(dealType),
				ethers.utils.parseEther(dealAmount),
				ethers.utils.parseEther(interestRate),
				ethers.utils.parseEther(loanDuration)
			);
		} catch (e) {
			console.log(e);
		}
	}

	async makeDeal(dealId: number) {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
		return await contract.makeDeal(dealId);
	}

	async activateAuction(auctionId: number){
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
		return await contract.activateAuction(auctionId);

	}


	async cancelDeal(dealId: number) {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
		return await contract.cancelDeal(dealId);
	}


	async claimAuction(auctionId: number) {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
		return await contract.claimAuction(auctionId);
	}

	async startAuction(lockId: number, amount: string, startPrice: string, duration: number) {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
		return await contract.startAuction(lockId, ethers.utils.parseEther(amount), ethers.utils.parseEther(startPrice), duration);
	}

	
	private subscribeToDealActivated() {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._provider);
	
		// Subscribe to the "DealActivated" event
		contract.on("DealActivated", async (deal_id, activator) => {
			console.log("Deal activated with ID:", deal_id.toString());
	
			// Write event data to SQLite database
			const db = new sqlite3.Database('deals.db');
			db.serialize(() => {
				db.run(`CREATE TABLE IF NOT EXISTS deals (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					dealId INTEGER,
					activator TEXT
				)`);
	
				const stmt = db.prepare(`INSERT INTO deals (
					dealId,
					activator
				) VALUES (?, ?)`);
				
				stmt.run(
					deal_id.toString(),
					activator.toString()
				);
	
				stmt.finalize();
			});
	
			// Close the database connection
			db.close();
		});
	}

	
	private subscribeToAuctionStarted() {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._provider);
		
		// Subscribe to the "AuctionStarted" event
		contract.on("AuctionStarted", async (auctionId, owner, lpToken, lockIndex, startPrice, immediatelySellPrice, bidStep, duration, immediatelySell) => {
			console.log("Auction started with ID:", auctionId.toString());
	
			// Write event data to SQLite database
			const db = new sqlite3.Database('auctions.db');
			db.serialize(() => {
				db.run(`CREATE TABLE IF NOT EXISTS auctions (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					auctionId INTEGER,
					owner TEXT,
					lpToken TEXT,
					lockIndex INTEGER,
					startPrice REAL,
					immediatelySellPrice REAL,
					bidStep REAL,
					duration INTEGER,
					immediatelySell INTEGER
				)`);
	
				const stmt = db.prepare(`INSERT INTO auctions (
					auctionId,
					owner,
					lpToken,
					lockIndex,
					startPrice,
					immediatelySellPrice,
					bidStep,
					duration,
					immediatelySell
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
				
				stmt.run(
					auctionId.toString(),
					owner.toString(),
					lpToken.toString(),
					lockIndex.toString(),
					startPrice.toString(),
					immediatelySellPrice.toString(),
					bidStep.toString(),
					duration.toString(),
					immediatelySell.toString()
				);
	
				stmt.finalize();
			});
	
			// Close the database connection
			db.close();
		});
	}
	public async getAllDeals(): Promise<Deal[]> {
		try {
			if (!this._provider) {
				throw new Error('Provider is not initialized');
			}

			const contract = new ethers.Contract(
				this.contracts.STAKE, // Адрес вашего контракта
				this._contractInterface, // ABI вашего контракта
				this._signer // Инициализированный провайдер
			);

			const nextDealId = await contract.nextDealId();
			const dealsPromises = [] as any;

			for (let i = 0; i < nextDealId; i++) {
				dealsPromises.push(contract.getDeal(i).then((deal: any) => ({
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
				})));
			}

			// Ожидание выполнения всех промисов
			const resolvedDeals = await Promise.all(dealsPromises);

			console.log(resolvedDeals);


			return [...resolvedDeals, {
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
			}];
		} catch (e) {
			console.error(e);
			return [];
		}
	}

	public async getAllAuctions(): Promise<Auction[]> {
		try {

			if (!this._provider) {
				throw new Error('Provider is not initialized');
			}

			const contract = new ethers.Contract(
				this.contracts.STAKE, // Адрес вашего контракта
				this._contractInterface, // ABI вашего контракта
				this._signer // Инициализированный провайдер
			);

			// Получаем значение nextAuctionId
			const nextAuctionId = await contract.nextAuctionId();
			const auctionsPromises = [] as any;

			for (let i = 0; i < nextAuctionId; i++) {
				auctionsPromises.push(contract.getDeal(i).then((auction: any) => ({
					owner: auction[0],
					highestBidOwner: auction[1],
					lpToken: auction[2],
					lockIndex: auction[3].toNumber(),
					startPrice: auction[4].toNumber(),
					duration: auction[5].toNumber(),
					startTime: auction[6].toNumber(),
					isActive: auction[7],
				})));
			}

			// Ожидание выполнения всех промисов
			const resolvedAuctions = await Promise.all(auctionsPromises);

			console.log(resolvedAuctions);

			return [...resolvedAuctions,
				{
					owner: 'string',
					highestBidOwner: 'string',
					lpToken: 'string',
					lockIndex: 0,
					startPrice: 0,
					duration: 0,
					startTime: 0,
					isActive: false
				}
			];
		} catch (e) {
			console.error(e);
			return [];
		}
	}
}
const app = express();
const wallet = new MetamaskWallet();
wallet.connect();

app.get('/get_all_deals', async (req, res) => {
    try {
        const allDeals = await wallet.getAllDeals();

		console.log(allDeals)

        res.send(allDeals);
    } catch (e) {
        res.status(500).send('Error connecting to wallet');
    }
});

app.get('/get_all_auctions', async (req, res) => {
    try {
        const allAuctions = await wallet.getAllAuctions();

		console.log(allAuctions)

        res.send(allAuctions);
    } catch (e) {
        res.status(500).send('Error connecting to wallet');
    }
});

app.get('/accept_deal', async (req, res) => {
    try {
		
        const accepted_deal = await wallet.makeDeal(Number(req.query.deal_id));

		console.log(accepted_deal)

        res.send(accepted_deal);
    } catch (e) {
        res.status(500).send('Error connecting to wallet');
    }
});
app.get('/cancel_deal', async (req, res) => {
    try {
		console.log(Number(req.query.deal_id));
        const canceled_deal = await wallet.cancelDeal(Number(req.query.deal_id));

		console.log(canceled_deal)

        res.send(canceled_deal);
    } catch (e) {
        res.status(500).send('Error connecting to wallet');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

// npx tsc metamask-wallet.ts  
// node metamask-wallet.js   