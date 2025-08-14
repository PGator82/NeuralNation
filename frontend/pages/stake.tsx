import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
const NNC = process.env.NEXT_PUBLIC_NNC_ADDRESS as `0x${string}`
const NID = process.env.NEXT_PUBLIC_NEURALID_ADDRESS as `0x${string}`
const STAKING = process.env.NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`
const ABI_ERC20=[{"type":"function","name":"balanceOf","stateMutability":"view","inputs":[{"name":"a","type":"address"}],"outputs":[{"type":"uint256"}]},{"type":"function","name":"allowance","stateMutability":"view","inputs":[{"name":"o","type":"address"},{"name":"s","type":"address"}],"outputs":[{"type":"uint256"}]},{"type":"function","name":"approve","stateMutability":"nonpayable","inputs":[{"name":"s","type":"address"},{"name":"amt","type":"uint256"}],"outputs":[{"type":"bool"}]}]
const ABI_ERC721=[{"type":"function","name":"balanceOf","stateMutability":"view","inputs":[{"name":"a","type":"address"}],"outputs":[{"type":"uint256"}]}]
const ABI_STAKING=[{"type":"function","name":"stake","stateMutability":"nonpayable","inputs":[{"name":"amount","type":"uint256"}],"outputs":[]},{"type":"function","name":"unstake","stateMutability":"nonpayable","inputs":[{"name":"amount","type":"uint256"}],"outputs":[]},{"type":"function","name":"claim","stateMutability":"nonpayable","inputs":[],"outputs":[]},{"type":"function","name":"earned","stateMutability":"view","inputs":[{"name":"a","type":"address"}],"outputs":[{"type":"uint256"}]},{"type":"function","name":"userStake","stateMutability":"view","inputs":[{"name":"a","type":"address"}],"outputs":[{"type":"uint256"}]},{"type":"function","name":"minStakeTime","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}]},{"type":"function","name":"penaltyBips","stateMutability":"view","inputs":[],"outputs":[{"type":"uint16"}]}]
export default function StakeV2(){
  const { address, isConnected } = useAccount(); const { writeContract, isPending } = useWriteContract()
  const [amt,setAmt]=useState('0'); const [unstakeAmt,setUnstakeAmt]=useState('0'); const [msg,setMsg]=useState('')
  const { data:balNNC } = useReadContract({ address:NNC, abi:ABI_ERC20, functionName:'balanceOf', args:[address!], query:{ enabled:!!address } })
  const { data:allowance } = useReadContract({ address:NNC, abi:ABI_ERC20, functionName:'allowance', args:[address!,STAKING], query:{ enabled:!!address } })
  const { data:stakeBal } = useReadContract({ address:STAKING, abi:ABI_STAKING, functionName:'userStake', args:[address!], query:{ enabled:!!address } })
  const { data:earned } = useReadContract({ address:STAKING, abi:ABI_STAKING, functionName:'earned', args:[address!], query:{ enabled:!!address } })
  const { data:nidBal } = useReadContract({ address:NID, abi:ABI_ERC721, functionName:'balanceOf', args:[address!], query:{ enabled:!!address } })
  const { data:minStake } = useReadContract({ address:STAKING, abi:ABI_STAKING, functionName:'minStakeTime' })
  const { data:penalty } = useReadContract({ address:STAKING, abi:ABI_STAKING, functionName:'penaltyBips' })
  const hasNID = (nidBal as bigint||0n) > 0n
  const needsApprove = (()=>{ try{ return (allowance as bigint||0n) < BigInt(amt||'0') }catch{ return true } })()
  const doApprove=async()=>{ try{ await writeContract({ address:NNC, abi:ABI_ERC20, functionName:'approve', args:[STAKING, BigInt(amt)] }); setMsg('Approval sent') }catch(e:any){ setMsg(e?.shortMessage||e?.message||'approve failed') } }
  const doStake=async()=>{ if(!isConnected) return alert('Connect'); if(!hasNID) return alert('Neural ID required'); try{ await writeContract({ address:STAKING, abi:ABI_STAKING, functionName:'stake', args:[BigInt(amt)] }); setMsg('Stake sent') }catch(e:any){ setMsg(e?.shortMessage||e?.message||'stake failed') } }
  const doUnstake=async()=>{ try{ await writeContract({ address:STAKING, abi:ABI_STAKING, functionName:'unstake', args:[BigInt(unstakeAmt)] }); setMsg('Unstake sent') }catch(e:any){ setMsg(e?.shortMessage||e?.message||'unstake failed') } }
  const doClaim=async()=>{ try{ await writeContract({ address:STAKING, abi:ABI_STAKING, functionName:'claim', args:[] }); setMsg('Claim sent') }catch(e:any){ setMsg(e?.shortMessage||e?.message||'claim failed') } }
  return (<main style={{maxWidth:820,margin:'2rem auto',padding:'0 1rem'}}>
    <h1>Stake NNC (V2)</h1>
    <div className="card"><h2>Status</h2><p><b>Your NNC:</b> {String(balNNC||0n)}</p><p><b>Your Stake:</b> {String(stakeBal||0n)}</p><p><b>Earned:</b> {String(earned||0n)}</p><p><b>Neural ID:</b> {hasNID ? '✅ Present' : '❌ Missing'}</p><p><b>Unstake rules:</b> Min {String(minStake||0n)} sec, penalty {String(penalty||0)} bips</p></div>
    <div className="card"><h2>Stake</h2><label>Amount (wei)</label><input value={amt} onChange={e=>setAmt(e.target.value)} style={{width:'100%',padding:8,margin:'8px 0'}}/>{needsApprove && <button className="btn" onClick={doApprove} disabled={isPending}>Approve</button>}<button className="btn" onClick={doStake} disabled={isPending} style={{marginLeft:12}}>Stake</button></div>
    <div className="card"><h2>Unstake</h2><label>Amount (wei)</label><input value={unstakeAmt} onChange={e=>setUnstakeAmt(e.target.value)} style={{width:'100%',padding:8,margin:'8px 0'}}/><button className="btn" onClick={doUnstake} disabled={isPending}>Unstake</button></div>
    <div className="card"><h2>Claim Rewards</h2><button className="btn" onClick={doClaim} disabled={isPending}>Claim</button></div>
    {msg && <div className="card"><b>Note:</b> {msg}</div>}
  </main>)
}
