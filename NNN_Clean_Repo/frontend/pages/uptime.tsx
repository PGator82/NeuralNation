import { useEffect, useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'

const UPTIME = process.env.NEXT_PUBLIC_UPTIME_ADDRESS as `0x${string}`
const HEARTBEAT = process.env.NEXT_PUBLIC_HEARTBEAT_URL || ''

const ABI = [
  {"type":"function","name":"pending","stateMutability":"view","inputs":[{"name":"who","type":"address"}],"outputs":[{"type":"uint256"}]},
  {"type":"function","name":"claim","stateMutability":"nonpayable","inputs":[],"outputs":[]}
]

export default function Uptime(){
  const { address, isConnected } = useAccount()
  const { data: pending } = useReadContract({ address: UPTIME, abi: ABI, functionName: 'pending', args: [address!], query: { enabled: !!address } })
  const { writeContract, isPending } = useWriteContract()
  const [nodes, setNodes] = useState<any[]>([])
  const [err, setErr] = useState<string|undefined>()

  useEffect(()=>{
    if(!HEARTBEAT) return
    fetch(HEARTBEAT + '/nodes').then(r=>r.json()).then(j=> setNodes(j.nodes||[])).catch(e=> setErr(String(e)))
  }, [])

  return (
    <main style={{maxWidth:900,margin:'2rem auto',padding:'0 1rem'}}>
      <h1>Uptime Rewards</h1>

      <div className="card">
        <h2>Your Pending</h2>
        <p><b>{String(pending||0n)}</b> NNC wei</p>
        <button className="btn" disabled={isPending || !isConnected} onClick={async()=>{
          try{
            await writeContract({ address: UPTIME, abi: ABI, functionName: 'claim', args: [] })
            alert('Claim sent')
          }catch(e:any){ alert(e?.shortMessage||e?.message||'claim failed') }
        }}>Claim</button>
      </div>

      <div className="card">
        <h2>Nodes</h2>
        <p style={{opacity:.7}}>Source: {HEARTBEAT || '(not set)'}</p>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><th align="left">Status</th><th align="left">Node</th><th align="left">Wallet</th><th align="left">Uptime (24h)</th></tr></thead>
          <tbody>
            {nodes.map((n:any)=>(
              <tr key={n.nodeId}>
                <td>{n.online ? '🟢' : '🔴'}</td>
                <td style={{fontFamily:'monospace'}}>{n.nodeId}</td>
                <td style={{fontFamily:'monospace'}}>{n.wallet}</td>
                <td>{(n.uptimePct ?? 0).toFixed ? n.uptimePct.toFixed(1) : n.uptimePct}%</td>
              </tr>
            ))}
            {nodes.length===0 && <tr><td colSpan={4} style={{opacity:.7}}>No data</td></tr>}
          </tbody>
        </table>
      </div>

      {err && <div className="card"><b>Error:</b> {err}</div>}
    </main>
  )
}
