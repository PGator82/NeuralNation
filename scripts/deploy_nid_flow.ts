import { ethers } from "hardhat";
async function main(){
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const cap = ethers.parseUnits(process.env.NNC_CAP || "100000000", 18);
  const init = ethers.parseUnits(process.env.NNC_INIT || "10000000", 18);
  const NNC = await ethers.getContractFactory("NeuralNubianCoin");
  const nnc = await NNC.deploy(deployer.address, init, cap);
  await nnc.waitForDeployment();
  console.log("NNC:", await nnc.getAddress());
  const NID = await ethers.getContractFactory("NeuralID");
  const nid = await NID.deploy(process.env.NID_BASE_URI || "ipfs://neural-id/");
  await nid.waitForDeployment();
  console.log("NeuralID:", await nid.getAddress());
  await (await nid.setIssuer(deployer.address, true)).wait();
  const Minter = await ethers.getContractFactory("NeuralIDMinter");
  const fee = ethers.parseUnits(process.env.NID_FEE || "10", 18);
  const minter = await Minter.deploy(nnc, nid, fee);
  await minter.waitForDeployment();
  console.log("NeuralIDMinter:", await minter.getAddress());
  await (await nid.setIssuer(await minter.getAddress(), true)).wait();
  console.log("Minter is issuer now.");
}
main().catch(e=>{ console.error(e); process.exit(1); });
