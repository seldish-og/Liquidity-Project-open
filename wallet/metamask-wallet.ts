import { ethers, providers, Signer, utils } from 'ethers';
import * as express from 'express';
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
		STAKE: '0x8fd624352279579a7c70814A4774c6772A9B99ab',
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
	private _contractInterface = new utils.Interface([
		'function initializeDeal(address lpToken, uint256 lockIndex, uint256 dealType, uint256 dealAmount, uint256 interestRate, uint256 loanDuration) nonpayable',
		'function activateDeal(uint256 dealId) external',
		'function makeDeal(uint256 dealId) external payable',
		'function cancelDeal(uint256 dealId) nonpayable',
		'function repayLoan(uint256 dealId) payable',
		'function claimCollateral(uint256 dealId) nonpayable',
		'function startAuction(address lpToken, uint256 lockIndex, uint256 amount, uint256 startPrice, uint256 duration) nonpayable',
		'function makeBid(uint256 auctionId) nonpayable',
		'function withdrawAuctionLiquidity(uint256 auctionId) nonpayable',
		'function claimAuction(uint256 auctionId) nonpayable',

		// Определения функций из UniswapV2Locker
		'function getUserNumLockedTokens(address) view returns (uint256)',
		'function getUserLockedTokenAtIndex(address, uint256) view returns (address)',
		'function getUserNumLocksForToken(address, address) view returns (uint256)',
		'function getUserLockForTokenAtIndex(address, address, uint256) view returns (uint256, uint256, uint256, uint256, uint256, address)',

		//read methods
		'function getUserDeals(address) external view returns (uint256[])',
		'function getUserAuction(address) external view returns (uint256[])',
		'function nextAuctionId() view returns (uint256)',
		'function getAuction(uint256 auctionId) view returns (address owner, address highestBidOwner, address lpToken, uint256 lockIndex, uint256 startPrice, uint256 duration, uint256 startTime, bool isActive)',
		'function nextDealId() view returns (uint256)',
		'function getDeal(uint256) view returns (address, address, uint256, uint256, uint256, uint256, uint256, uint256, address, bool, bool)'
	]);

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
			
			const signer = provider.getSigner("0x8fd624352279579a7c70814A4774c6772A9B99ab");
			
			const address = await signer.getAddress();
			console.log(address);
			// const address = "0x8fd624352279579a7c70814A4774c6772A9B99ab"
			this.address = address;
			this._signer = signer;
		
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

	async makeBid(auctionId: number, bidAmount: string) {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
		return await contract.makeBid(auctionId, ethers.utils.parseEther(bidAmount));
	}

	async cancelDeal(dealId: number) {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
		return await contract.cancelDeal(dealId);
	}

	async claimCollateral(dealId: number) {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
		return await contract.claimCollateral(dealId);
	}

	async repayLoan(dealId: number, amount: string) {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
		return await contract.repayLoan(dealId, ethers.utils.parseEther(amount));
	}

	async withdrawAuctionLiquidity(auctionId: number) {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
		return await contract.withdrawAuctionLiquidity(auctionId);
	}

	async claimAuction(auctionId: number) {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
		return await contract.claimAuction(auctionId);
	}

	async startAuction(lockId: number, amount: string, startPrice: string, duration: number) {
		const contract = new ethers.Contract(this.contracts.STAKE, this._contractInterface, this._signer);
		return await contract.startAuction(lockId, ethers.utils.parseEther(amount), ethers.utils.parseEther(startPrice), duration);
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

app.get('/get_all_deals', async (req, res) => {
    try {
		await wallet.connect();
        const allDeals = await wallet.getAllDeals();

		console.log(allDeals)

        res.send(allDeals);
    } catch (e) {
        res.status(500).send('Error connecting to wallet');
    }
});

app.get('/get_all_auctions', async (req, res) => {
    try {
		await wallet.connect();
        const allAuctions = await wallet.getAllAuctions();

		console.log(allAuctions)

        res.send(allAuctions);
    } catch (e) {
        res.status(500).send('Error connecting to wallet');
    }
});

app.get('/accept_deal', async (req, res) => {
    try {
		await wallet.connect();
        const accepted_deal = await wallet.makeDeal(Number(req.query.deal_id));

		console.log(accepted_deal)

        res.send(accepted_deal);
    } catch (e) {
        res.status(500).send('Error connecting to wallet');
    }
});
app.get('/cancel_deal', async (req, res) => {
    try {
		await wallet.connect();
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