import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { keccak256, stringToBytes } from 'viem'

const NNC = process.env.NEXT_PUBLIC_NNC_ADDRESS as `0x${string}`
const MINTER = process.env.NEXT_PUBLIC_NID_MINTER as `0x${string}`
const ABI_ERC20 = [{"type":"function","name":"approve","stateMutability":"nonpayable","inputs":[{"name":"s","type":"address"},{"name":"amt","type":"uint256"}],"outputs":[{"type":"bool"}]}]
const ABI_MINTER = [{"type":"function","name":"mint","stateMutability":"nonpayable","inputs":[{"name":"citizenHash","type":"bytes32"},{"name":"sig","type":"bytes"}],"outputs":[]}]

export default function MintNID(){
  const { isConnected } = useAccount()
  const { writeContract, isPending } = useWriteContract()
  const [name,setName]=useState(''); const [cid,setCid]=useState(''); const [sig,setSig]=useState(''); const [note,setNote]=useState('')
  const citizenHash = keccak256(stringToBytes(`${name}:${cid}`))
  const approve = async ()=>{ try{ await writeContract({ address:NNC, abi:ABI_ERC20, functionName:'approve', args:[MINTER, 10n*10n**18n] }); setNote('Approved 10 NNC'); }catch(e:any){ setNote(e?.shortMessage||e?.message) } }
  const mint = async ()=>{ if(!isConnected) return alert('Connect'); try{ await writeContract({ address:MINTER, abi:ABI_MINTER, functionName:'mint', args:[citizenHash, sig as `0x${string}`] }); setNote('Mint sent'); }catch(e:any){ setNote(e?.shortMessage||e?.message) } }
  return (<main style={{maxWidth:720,margin:'2rem auto',padding:'0 1rem'}}>
    <h1>Mint Neural ID</h1>
    <label>Name/Handle</label><input value={name} onChange={e=>setName(e.target.value)} style={{width:'100%',padding:8,margin:'8px 0'}}/>
    <label>Proof IPFS CID</label><input value={cid} onChange={e=>setCid(e.target.value)} style={{width:'100%',padding:8,margin:'8px 0'}}/>
    <label>Verifier Signature (0x…)</label><input value={sig} onChange={e=>setSig(e.target.value)} style={{width:'100%',padding:8,margin:'8px 0'}}/>
    <div style={{display:'flex',gap:12}}><button className="btn" onClick={approve} disabled={isPending}>Approve NNC</button><button className="btn" onClick={mint} disabled={isPending}>Mint</button></div>
    <p style={{opacity:.7,marginTop:8}}>Citizen hash: <code>{citizenHash}</code></p>
    {note && <div className="card"><b>Note:</b> {note}</div>}
  </main>)
}
