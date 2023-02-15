import {
    Address,
    beginCell,
    BitString,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Dictionary,
    Sender,
    toNano,
} from 'ton-core';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { Blockchain } from '@ton-community/sandbox';

export default class PassTon implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createForDeploy(code: Cell): PassTon {
        const data = beginCell().endCell();
        const workchain = 0; // deploy to workchain 0
        const address = contractAddress(workchain, { code, data });
        return new PassTon(address, { code, data });
    }

    async sendDeploy(provider: ContractProvider, via: Sender) {
        await provider.internal(via, {
            value: '0.01', // send 0.01 TON to contract for rent
            bounce: false,
        });
    }

    createRandomMail(seed: number) {
        var randomMail = 'test' + seed + '@gmail.com';
        return randomMail;
    }

    createRandomPassword(seed: number) {
        var randomPass = 'test' + seed;
        return randomPass;
    }

    async sendTx(provider: ContractProvider, via: Sender, walletId: number, appId: number) {
        const dataBody = 'test@gmail.com';
        const password = '12345' + appId;
        const messageBody = beginCell()
            .storeUint(1, 1)
            .storeUint(walletId, 256)
            .storeUint(appId, 16)
            .storeBits(new BitString(Buffer.from(dataBody + '|', 'utf8'), 0, 360))
            .storeBits(new BitString(Buffer.from(password, 'utf8'), 0, 240))
            .endCell();

        await provider.internal(via, {
            value: toNano('0.1'),
            body: messageBody,
        });
    }

    async getter(provider: ContractProvider) {
        const { stack } = await provider.get('userData', [
            {
                type: 'int',
                value: BigInt(1),
            },
        ]);
        const mainDictionaryOfUser = stack.readCell().beginParse();

        console.log(mainDictionaryOfUser);
        return stack;
    }
}

export async function run(provider: NetworkProvider) {
    const contract = PassTon.createForDeploy(await compile('PassTon'));
    const blockchain = await Blockchain.create();
    const user = await blockchain.treasury('EQAo6ZtTJ45DaY7Ow5HKL6f9xy4AwJoRvMTNJhdl7v6e_RfG');
    const passToMain = blockchain.openContract(contract);

    await passToMain.sendDeploy(user.getSender());

    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            await passToMain.sendTx(user.getSender(), i, 1000 + j);
        }
    }

    const result = await passToMain.getter();

    console.log(result);
}
