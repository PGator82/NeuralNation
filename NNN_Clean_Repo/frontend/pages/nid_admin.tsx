import { useState } from 'react'
import { useWriteContract } from 'wagmi'
const NID = process.env.NEXT_PUBLIC_NEURALID_ADDRESS as `0x${string}`
const MINTER = process.env.NEXT_PUBLIC_NID_MINTER as `0x${string}`
const ABI_NID = [{"type":"function","name":"mint","stateMutability":"nonpayable","inputs":[{"name":"to","type":"address"},{"name":"hash","type":"bytes32"}],"outputs":[]}]
const ABI_MINTER = [{"type":"function","name":"setVerifier","stateMutability":"nonpayable","inputs":[{"name":"v","type":"address"},{"name":"ok","type":"bool"}],"outputs":[]},{"type":"function","name":"setFee","stateMutability":"nonpayable","inputs":[{"name":"fee","type":"uint256"}],"outputs":[]}]

export default function AdminNID(){
  const { writeContract, isPending } = useWriteContract()
  const [to,setTo]=useState('0x'); const [hash,setHash]=useState('0x'); const [verifier,setVerifier]=useState('0x'); const [fee,setFee]=useState('10000000000000000000')
  return (<main style={{maxWidth:720,margin:'2rem auto',padding:'0 1rem'}}>
    <h1>Neural ID Admin</h1>
    <div className="card"><h2>Mint (Issuer)</h2>
      <label>To</label><input value={to} onChange={e=>setTo(e.target.value)} style={{width:'100%',padding:8,margin:'8px 0'}}/>
      <label>Citizen Hash (bytes32)</label><input value={hash} onChange={e=>setHash(e.target.value)} style={{width:'100%',padding:8,margin:'8px 0'}}/>
      <button className="btn" onClick={async()=>{try{await writeContract({address:NID,abi:ABI_NID,functionName:'mint',args:[to as any, hash as any]}); alert('Minted');}catch(e:any){alert(e?.shortMessage||e?.message)}}} disabled={isPending}>Mint</button>
    </div>
    <div className="card"><h2>Verifiers</h2>
      <label>Verifier</label><input value={verifier} onChange={e=>setVerifier(e.target.value)} style={{width:'100%',padding:8,margin:'8px 0'}}/>
      <button className="btn" onClick={async()=>{try{await writeContract({address:MINTER,abi:ABI_MINTER,functionName:'setVerifier',args:[verifier as any, true]}); alert('Added');}catch(e:any){alert(e?.shortMessage||e?.message)}}} disabled={isPending}>Add Verifier</button>
    </div>
    <div className="card"><h2>Mint Fee</h2>
      <label>Fee (NNC wei)</label><input value={fee} onChange={e=>setFee(e.target.value)} style={{width:'100%',padding:8,margin:'8px 0'}}/>
      <button className="btn" onClick={async()=>{try{await writeContract({address:MINTER,abi:ABI_MINTER,functionName:'setFee',args:[BigInt(fee)]}); alert('Fee updated');}catch(e:any){alert(e?.shortMessage||e?.message)}}} disabled={isPending}>Update Fee</button>
    </div>
  </main>)
}
