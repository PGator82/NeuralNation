import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv"; dotenv.config();
const config: HardhatUserConfig = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: { hardhat: {}, amoy: { url: process.env.AMOY_RPC || "https://rpc-amoy.polygon.technology", accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [], chainId: 80002 } },
  etherscan: { apiKey: { polygonAmoy: process.env.POLYGONSCAN_API_KEY || "" },
    customChains: [{ network: "polygonAmoy", chainId: 80002, urls: { apiURL: "https://api-amoy.polygonscan.com/api", browserURL: "https://amoy.polygonscan.com" } }] }
};
export default config;
