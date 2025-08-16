import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  // If some files use a different pragma, add compilers like this:
  // solidity: {
  //   compilers: [
  //     { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  //     { version: "0.8.20", settings: { optimizer: { enabled: true, runs: 200 } } },
  //   ],
  // },
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology/",
      chainId: 80002,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: { polygonAmoy: process.env.POLYGONSCAN_API_KEY || "" },
  },
};
export default config;
