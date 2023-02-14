import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type PassTonMainConfig = {};

export function passTonMainConfigToCell(config: PassTonMainConfig): Cell {
    return beginCell().endCell();
}

export class PassTonMain implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new PassTonMain(address);
    }

    static createFromConfig(config: PassTonMainConfig, code: Cell, workchain = 0) {
        const data = passTonMainConfigToCell(config);
        const init = { code, data };
        return new PassTonMain(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell().endCell(),
        });
    }
}
