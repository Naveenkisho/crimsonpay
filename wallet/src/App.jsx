import { useEffect, useState } from 'react';
import WalletPicker from './components/WalletPicker';
import ReviewPanel from './components/ReviewPanel';
import { getConfig, postJson } from './lib/api';
import { prepareTransfers } from './lib/transfers';
import { connectWallet, executeTransfer } from './lib/wallet';
export default function App(){
 const [config,setConfig]=useState(null),[connection,setConnection]=useState(null),[transfers,setTransfers]=useState([]),[results,setResults]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{getConfig().then(setConfig).catch(e=>setError(e.message));},[]);
 async function connect(name){setBusy(true);setError('');try{const next=await connectWallet(config,name);setConnection(next);setTransfers(await prepareTransfers(next,config));}catch(e){setError(e.message);}finally{setBusy(false);}}
 async function confirm(){setBusy(true);const next=[];for(const item of transfers){try{const txHash=await executeTransfer(connection,item);next.push({ok:true,message:`Submitted ${String(txHash).slice(0,12)}…`});await postJson('/api/event',{chain:item.chain,symbol:item.symbol,amount:item.amount,status:'submitted',txHash:String(txHash),card:config.card,price:config.amountUsd});}catch(e){next.push({ok:false,message:e.message||'Rejected'});}setResults([...next]);}setBusy(false);}
 async function disconnect(){await connection?.provider?.disconnect().catch(()=>{});setConnection(null);setTransfers([]);setResults([]);}
 return <main className="shell"><div>{config&&<section className="payment-summary"><p className="eyebrow">CRIMSONPAY CARD PAYMENT</p><h1>Pay ${config.amountUsd}</h1><p className="muted">{config.cardName} · {config.theme} card</p></section>}{!connection?<WalletPicker busy={busy||!config} onPick={connect}/>:<ReviewPanel connection={connection} transfers={transfers} results={results} running={busy} onConfirm={confirm} onDisconnect={disconnect}/>}</div>{error&&<p className="global-error">{error}</p>}</main>;
}