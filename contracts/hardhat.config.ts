import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env") });

let POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

// Ensure a valid private key is used even if the placeholder is still in the .env file
if (POLYGON_PRIVATE_KEY === "deployer-wallet-private-key") {
  POLYGON_PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000001";
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    amoy: {
      url: process.env.NEXT_PUBLIC_POLYGON_RPC || "https://rpc-amoy.polygon.technology",
      accounts: [POLYGON_PRIVATE_KEY],
      chainId: 80002,
    },
  },
};

export default config;
