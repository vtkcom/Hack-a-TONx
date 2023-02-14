import { Blockchain } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { PassTonMain } from '../wrappers/PassTonMain';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('PassTonMain', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('PassTonMain');
    });

    it('should deploy', async () => {
        const blockchain = await Blockchain.create();

        const passTonMain = blockchain.openContract(PassTonMain.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await passTonMain.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: passTonMain.address,
            deploy: true,
        });
    });
});
