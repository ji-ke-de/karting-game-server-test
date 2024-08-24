// ContractAPI.ts
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { KeyringPair } from '@polkadot/keyring/types';
import { Keyring } from '@polkadot/keyring';

export class ContractAPI {
  private api!: ApiPromise;
  private contract!: ContractPromise;
  private signer!: KeyringPair;

  constructor(
    private wsEndpoint: string,
    private contractAddress: string,
    private contractAbi: any
  ) {}

  async init() {
    // 连接到 Substrate 节点
    const wsProvider = new WsProvider(this.wsEndpoint);
    this.api = await ApiPromise.create({ provider: wsProvider });

    // 创建合约实例
    this.contract = new ContractPromise(this.api, this.contractAbi, this.contractAddress);

    // 创建签名者
    const keyring = new Keyring({ type: 'sr25519' });
    this.signer = keyring.addFromUri('//Alice'); // 使用 Alice 测试账户，实际使用时应该使用真实账户
  }

  async updateScore(score: number): Promise<void> {
    if (!this.api || !this.contract) {
      throw new Error('Contract API not initialized');
    }

    // 调用合约的 update_score 方法
    const gasLimit = -1; // 设置为 -1 以使用默认值
    const value = 0; // 如果方法不需要转账 native token，设为 0

    const { gasRequired, result, output } = await this.contract.query.updateScore(
      this.signer.address,
      { gasLimit, value },
      score
    );

    if (result.isOk) {
      // 执行实际交易
      await this.contract.tx
        .updateScore({ gasLimit, value }, score)
        .signAndSend(this.signer, (result) => {
          if (result.status.isInBlock) {
            console.log('Transaction included in block');
          } else if (result.status.isFinalized) {
            console.log('Transaction finalized');
          }
        });
    } else {
      console.error('Error calling update_score:', result.asErr);
    }
  }
}