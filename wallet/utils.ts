import {EthereumProvider, InjectedProvider, Network} from './types';
import {utils} from "ethers";
export function handleMultipleWalletExtensions(
    provider: EthereumProvider,
    predicate = (p: InjectedProvider) => p.isMetaMask,
    defaultValue = provider
) {
    const {providers = []} = provider;
    return providers.find(predicate) ?? defaultValue;
}
export function serializeChainId(chainId: number) {
    return utils.hexStripZeros(utils.hexlify(chainId));
}
export function serializeNetwork(net: Network) {
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

