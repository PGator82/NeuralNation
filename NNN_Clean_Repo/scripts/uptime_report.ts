import 'dotenv/config'
import fetch from 'node-fetch'
import { ethers } from 'ethers'

/**
 * ENV:
 *  RPC=... (Polygon/Amoy)
 *  ORACLE_KEY=0x...
 *  UPTIME=0xUptimeRewards
 *  HEARTBEAT_URL=http://localhost:8788/nodes
 *  WEEKLY_BUDGET=10000 (NNC with 18 decimals handled on-chain; send human-readable here)
 */

const RPC = process.env.RPC as string
const ORACLE_KEY = process.env.ORACLE_KEY as string
const UPTIME = process.env.UPTIME as string
const HEARTBEAT_URL = process.env.HEARTBEAT_URL || 'http://localhost:8788/nodes'
const WEEKLY_BUDGET = process.env.WEEKLY_BUDGET || '10000'

if(!RPC || !ORACLE_KEY || !UPTIME){ throw new Error('Set RPC, ORACLE_KEY, UPTIME') }

const ABI_UPTIME = [
  {"name":"report","type":"function","stateMutability":"nonpayable","inputs":[
    {"name":"addrs","type":"address[]"},
    {"name":"pct","type":"uint16[]"},
    {"name":"periodStart","type":"uint256"},
    {"name":"periodEnd","type":"uint256"}],"outputs":[]},
  {"name":"weeklyBudget","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}]}
] as const

async function main(){
  const prov = new ethers.JsonRpcProvider(RPC)
  const wallet = new ethers.Wallet(ORACLE_KEY, prov)
  const c = new ethers.Contract(UPTIME, ABI_UPTIME, wallet)

  // fetch nodes
  const r = await fetch(HEARTBEAT_URL)
  const json = await r.json() as any
  const nodes = (json.nodes||[]).filter((n:any)=>n.online)

  if(nodes.length===0){ console.log('No online nodes. Skipping.'); return }

  const addrs = nodes.map((n:any)=> ethers.getAddress(n.wallet))
  const pct = nodes.map((n:any)=> Math.max(0, Math.min(10000, Math.round((n.uptimePct||0)*100)))) // convert 0-100 => bips

  const now = Math.floor(Date.now()/1000)
  const start = now - 7*24*3600
  const end = now

  const tx = await c.report(addrs, pct, start, end)
  console.log('report tx:', tx.hash)
  await tx.wait()
  console.log('done. nodes:', nodes.length)
}

main().catch(e=>{ console.error(e); process.exit(1) })
