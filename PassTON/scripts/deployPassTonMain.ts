import { toNano } from 'ton-core';
import { PassTonMain } from '../wrappers/PassTonMain';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const passTonMain = PassTonMain.createFromConfig({}, await compile('PassTonMain'));

    await provider.deploy(passTonMain, toNano('0.05'));

    const openedContract = provider.open(passTonMain);

    // run methods on `openedContract`
}
