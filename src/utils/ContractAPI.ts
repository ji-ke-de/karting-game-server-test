import {
  contractQuery,
  contractTx,
  getBalance,
  getDeploymentContract,
  rococo,
  transferBalance,
} from "@scio-labs/use-inkathon";
import fs from "fs";
const  CONTRACT_METADATA = require("./GameScore.json");

// import CONTRACT_METADATA from "./GameScore.json";
import { initPolkadotJs } from "./initPolkadotJs";
import { ContractPromise } from "@polkadot/api-contract";
import { IKeyringPair } from "@polkadot/types/types";
import { ApiPromise } from "@polkadot/api";

export class ContractAPI {
  private contract: ContractPromise | null = null;
  private alice: IKeyringPair | null = null;
  private bob: IKeyringPair | null = null;
  private pair: IKeyringPair | null = null;
  private api: ApiPromise | null = null;

  constructor() {}

  async init() {
    const CONTRACT_METADATA = fs.readFileSync("./GameScore.json", "utf8");
    const chainId = rococo.network;
    const accountUri = "//Alice";
    const {
      api,
      decimals,
      symbol,
      keyring,
      account: alice,
    } = await initPolkadotJs(chainId, accountUri);

    this.api = api;
    this.bob = keyring.addFromUri("//Bob");
    this.alice = alice;
    const MNEMONIC =
      "fine undo assault symbol achieve emerge shed half mystery metal describe shop";
    this.pair = keyring.createFromUri(MNEMONIC);
    const getDeployments = [
      {
        contractId: "kartingGame",
        networkId: rococo.network,
        abi: CONTRACT_METADATA,
        address: "5DFzDyFTrHdVnDStYNj5RNGweGBkcp2UDmVGzJCQjhS6Kmep",
      },
    ];

    const contract = getDeploymentContract(
      api,
      getDeployments,
      "kartingGame",
      chainId
    );
    this.contract = contract!;
  }

  async updateScore(roomId: string, player: string, score: number) {
    if (this.api && this.pair && this.contract) {
      const {result} = await contractTx(
        this.api,
        this.pair,
        this.contract,
        "updateScore",
        {},
        [roomId, player, score]
      );
      if (result) {
        console.log("Success", result.toHuman());
      } else {
        console.error("Error", result);
      }
    }
  }

  async getRoomScore(roomId: string) {
    if (this.api && this.alice && this.pair && this.contract) {
      const { gasRequired, storageDeposit, result, output } =
        await contractQuery(
          this.api,
          this.alice.address,
          this.contract,
          "getRoomScore",
          {},
          [roomId]
        );
      console.log("a", result.toHuman());
      if (result.isOk) {
        console.log("Success", output?.toHuman());
      } else {
        console.error("Error", result.asErr);
      }
    }
  }
}

async function main() {
  const contractApi = new ContractAPI();
  await contractApi.init();
  contractApi.updateScore("1", "sss", 10);
  contractApi.getRoomScore("1");

}

main();
