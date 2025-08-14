import { ethers } from "hardhat";
async function main(){
  const [d] = await ethers.getSigners();
  console.log("Deployer:", d.address);
  const NNC = await ethers.getContractFactory("NeuralNubianCoin");
  const cap = ethers.parseUnits(process.env.NNC_CAP || "100000000", 18);
  const init = ethers.parseUnits(process.env.NNC_INIT || "10000000", 18);
  const nnc = await NNC.deploy(d.address, init, cap); await nnc.waitForDeployment(); console.log("NNC:", await nnc.getAddress());
  const NID = await ethers.getContractFactory("NeuralID");
  const nid = await NID.deploy(process.env.NID_BASE_URI || "ipfs://neural-id/"); await nid.waitForDeployment(); console.log("NeuralID:", await nid.getAddress()); await (await nid.setIssuer(d.address, true)).wait();
  const Minter = await ethers.getContractFactory("NeuralIDMinter");
  const fee = ethers.parseUnits(process.env.NID_FEE || "10", 18);
  const minter = await Minter.deploy(nnc, nid, fee); await minter.waitForDeployment(); console.log("NeuralIDMinter:", await minter.getAddress()); await (await nid.setIssuer(await minter.getAddress(), true)).wait();
  const Staking = await ethers.getContractFactory("NNCStakingV2");
  const rate = ethers.parseUnits(process.env.NNC_REWARD_RATE || "0.000001", 18);
  const minStake = BigInt(process.env.MIN_STAKE_TIME || (7*24*60*60).toString()); const penalty = Number(process.env.PENALTY_BIPS || "500");
  const staking = await Staking.deploy(await nnc.getAddress(), await nid.getAddress(), rate, minStake, penalty); await staking.waitForDeployment();
  console.log("NNCStakingV2:", await staking.getAddress());
}
main().catch(e=>{ console.error(e); process.exit(1); });
