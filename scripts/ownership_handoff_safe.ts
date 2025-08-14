import { ethers } from "hardhat";
async function main(){
  const SAFE = process.env.SAFE as string; if(!SAFE) throw new Error("Set SAFE");
  const list = [process.env.NNC, process.env.NID, process.env.MINTER, process.env.STAKING].filter(Boolean) as string[];
  const ABI=[{"name":"transferOwnership","type":"function","inputs":[{"name":"newOwner","type":"address"}]}];
  const [admin]=await ethers.getSigners(); console.log("Admin", admin.address, "→ SAFE", SAFE);
  for(const addr of list){ const c=new ethers.Contract(addr, ABI, admin); console.log("Xfer", addr); await (await c.transferOwnership(SAFE)).wait(); }
}
main().catch(e=>{ console.error(e); process.exit(1); });
