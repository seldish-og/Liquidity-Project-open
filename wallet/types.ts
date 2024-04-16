import { providers } from 'ethers';
import { TypedEmitter } from 'tiny-typed-emitter';
import { z } from 'zod';

export const Chain = z.enum(['eth']);
export type Chain = z.infer<typeof Chain>;

export interface IWalletConnectedInfo {
	readonly chainId: number;
}

export const Network = z.object({
	name: z.string(),
	symbol: z.string(),
	chainId: z.number().int().positive(),
	rpcUrl: z.string().url(),
	blockExplorerUrl: z.string().url()
});
export type Network = z.infer<typeof Network>;
export const NetworkConfig = z.object({ eth: Network });
export type NetworkConfig = z.infer<typeof NetworkConfig>;

export interface IProviderRpcError extends Error {
	message: string;
	code: number;
	data?: unknown;
}

export class ProviderRpcError extends Error implements IProviderRpcError {
	code: number;
	data?: unknown;

	constructor(code: number, message: string, data?: unknown) {
		super(message);
		this.code = code;
		this.data = data;
	}
}

export interface WalletEvents {

}

export type InjectedProvider = providers.ExternalProvider & { isCoinbase?: boolean };
export type EthereumProvider =
	providers.ExternalProvider
	& Partial<TypedEmitter<WalletEvents>>
	& { chainId?: string }
	& { providers?: InjectedProvider[] };

export interface MetamaskWindow extends Window {
	ethereum?: EthereumProvider;
}