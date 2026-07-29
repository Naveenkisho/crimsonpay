/* ================= CrimsonPay demo — app.js =================
   Educational front-end only. No real money, no network calls.
   Everything persists to localStorage on this device.
============================================================ */
(() => {
'use strict';

/* ---------- constants ---------- */
const PRICE = { BTC:68000, ETH:3500, SOL:150, USDT:1, USDC:1 };
const COIN = {
  BTC:{name:'Bitcoin'}, ETH:{name:'Ethereum'}, SOL:{name:'Solana'},
  USDT:{name:'Tether'}, USDC:{name:'USD Coin'},
};
const NETWORKS = {
  BTC:[{n:'Bitcoin',fee:0.0002,eta:'~30 min'}],
  ETH:[{n:'ERC20',fee:0.0018,eta:'~3 min'},{n:'Arbitrum',fee:0.0002,eta:'~1 min'}],
  SOL:[{n:'Solana',fee:0.00005,eta:'~30 sec'}],
  USDT:[{n:'TRC20',fee:1,eta:'~2 min'},{n:'ERC20',fee:6,eta:'~3 min'},{n:'BEP20',fee:0.5,eta:'~1 min'}],
  USDC:[{n:'ERC20',fee:6,eta:'~3 min'},{n:'Solana',fee:0.5,eta:'~30 sec'},{n:'BEP20',fee:0.5,eta:'~1 min'}],
};
const FX = { USD:1, EUR:0.92, GBP:0.79, INR:83.2, AED:3.67, SGD:1.35 };
const SYM = { USD:'$', EUR:'€', GBP:'£', INR:'₹', AED:'AED ', SGD:'S$' };
const FEES = { topup:0.01, fx:0.012, atm:0.02, atmMin:2, spread:0.003, virtual:10, physical:100, replace:10 };
const DOCS = {
  India:[{name:'Aadhaar Card',ph:'1234 5678 9012'},{name:'PAN Card',ph:'ABCDE1234F'},{name:'Passport',ph:'A1234567'},{name:'Voter ID (EPIC)',ph:'ABC1234567'},{name:'Driving Licence',ph:'DL01 20110012345'}],
  'United States':[{name:'Passport',ph:'A12345678'},{name:"Driver's Licence",ph:'D1234-5678-9012'},{name:'State ID',ph:'State ID number'}],
  'United Kingdom':[{name:'Passport',ph:'123456789'},{name:'Driving Licence',ph:'MORGA657054AB9CD'},{name:'National ID',ph:'ID number'}],
  'United Arab Emirates':[{name:'Emirates ID',ph:'784-1990-1234567-1'},{name:'Passport',ph:'A1234567'}],
  Singapore:[{name:'NRIC / FIN',ph:'S1234567A'},{name:'Passport',ph:'E1234567X'}],
  _default:[{name:'Passport',ph:'A1234567'},{name:'National ID',ph:'ID number'},{name:'Driving Licence',ph:'Licence number'}],
};
const CARD_SPECS = {
  virtual:{ price:FEES.virtual, name:'Virtual Card', tag:'Instant issuance',
    benefits:['Ready to use in seconds','Online & in-app payments','Add to Apple Pay / Google Pay','Freeze & set limits anytime'],
    limits:[['Daily spend','$10,000'],['Monthly spend','$100,000'],['Per transaction','$5,000'],['ATM access','—']] },
  physical:{ price:FEES.physical, name:'Physical Card', tag:'Metal · shipped worldwide',
    benefits:['Everything in Virtual','Tap to pay in stores','ATM cash withdrawals','Premium metal design'],
    limits:[['Daily spend','$10,000'],['ATM / day','$1,000'],['Monthly spend','$100,000'],['Delivery','5–7 days']] },
};

/* ================= ICON SYSTEM ================= */
const ICONS = {
  home:'<path d="M4 11 12 4l8 7"/><path d="M6 9.6V20h12V9.6"/>',
  card:'<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 9.8h18"/>',
  activity:'<path d="M6.5 3h11v18l-2.75-2-2.75 2-2.75-2L6.5 21z"/><path d="M9.5 8.5h5M9.5 12h5"/>',
  fees:'<path d="M4 4.5h7.2l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-5.1 5.1a1.5 1.5 0 0 1-2.1 0L4 11.7z"/><circle cx="8.4" cy="8.4" r="1.2"/>',
  gift:'<rect x="4" y="9.5" width="16" height="10.5" rx="1.5"/><path d="M2.5 9.5h19M12 9.5V20"/><path d="M12 9.5C11 6 9.2 4.6 7.7 5.4 6 6.3 8 9.5 12 9.5zM12 9.5c1-3.5 2.8-4.9 4.3-4.1 1.7.9-.3 4.1-4.3 4.1z"/>',
  settings:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.4v3M12 18.6v3M2.4 12h3M18.6 12h3M5.1 5.1l2.1 2.1M16.8 16.8l2.1 2.1M18.9 5.1l-2.1 2.1M7.2 16.8l-2.1 2.1"/>',
  help:'<path d="M4 5h16v11H8.5L4 19.5z"/><path d="M9 10.5h.01M12 10.5h.01M15 10.5h.01"/>',
  moon:'<path d="M20.5 14.8A8.2 8.2 0 0 1 9.2 3.5 8.2 8.2 0 1 0 20.5 14.8z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2.4M12 19.6V22M3.5 3.5l1.7 1.7M18.8 18.8l1.7 1.7M2 12h2.4M19.6 12H22M3.5 20.5l1.7-1.7M18.8 5.2l1.7-1.7"/>',
  deposit:'<path d="M12 3.5v10.5M8 10.5l4 4 4-4"/><path d="M5 19.5h14"/>',
  withdraw:'<path d="M12 20.5V10M8 14l4-4 4 4"/><path d="M5 4.5h14"/>',
  convert:'<path d="M4.5 8.5h13l-3-3M19.5 15.5h-13l3 3"/>',
  send:'<path d="M21.5 2.5 10.5 13.5"/><path d="M21.5 2.5 14.5 21.5l-4-8.5-8.5-4z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  bell:'<path d="M6 9.5a6 6 0 0 1 12 0c0 4.5 1.8 5.8 2 6H4c.2-.2 2-1.5 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  eye:'<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
  'eye-off':'<path d="M4 4l16 16"/><path d="M9.6 5.8A9.9 9.9 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17.7 17.7 0 0 1-3.3 4.1M6.4 7.9A17.4 17.4 0 0 0 2 12s3.6 6.5 10 6.5a9.7 9.7 0 0 0 3.4-.6"/><path d="M9.9 10.1a2.6 2.6 0 0 0 3.7 3.7"/>',
  freeze:'<path d="M12 2.5v19M4 7l16 10M20 7 4 17"/><path d="M12 5.5 9.6 7.4M12 5.5l2.4 1.9M12 18.5l-2.4-1.9M12 18.5l2.4-1.9M4.6 8.2l.3 2.9M19.4 8.2l-.3 2.9M4.6 15.8l.3-2.9M19.4 15.8l-.3-2.9"/>',
  shield:'<path d="M12 3 5 6v5.2c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6z"/>',
  bolt:'<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11.5H12z"/>',
  phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  coins:'<ellipse cx="9" cy="6.5" rx="5.5" ry="2.8"/><path d="M3.5 6.5v4.3c0 1.5 2.5 2.8 5.5 2.8s5.5-1.3 5.5-2.8V6.5"/><path d="M14.5 11.2c2.6.2 4.5 1.4 4.5 2.8 0 1.5-2.5 2.8-5.5 2.8-1.3 0-2.5-.24-3.4-.63"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.6 6.5 12 13l8.4-6.5"/>',
  lock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  key:'<circle cx="8" cy="12" r="3.4"/><path d="M11.3 11H21M18.5 11v3M15.5 11v2.4"/>',
  check:'<path d="M4 12.5 9.5 18 20 6"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.4 2"/>',
  trash:'<path d="M4 6.5h16M9.5 6.5V4.5h5v2M6.5 6.5l1 13.5h9l1-13.5"/>',
  copy:'<rect x="9" y="9" width="11.5" height="11.5" rx="2"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/>',
  cart:'<circle cx="9.5" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3.5h2.5l2.3 12h11.4L21 7H6"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 20c0-4 3.4-6 7.5-6s7.5 2 7.5 6"/>',
  id:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.8" r="2"/><path d="M5.4 16c0-1.7 1.4-2.6 3.1-2.6s3.1.9 3.1 2.6M14 9.5h4M14 12.5h4M14 15.5h2.6"/>',
  sliders:'<path d="M4 8h9M17.5 8H20M4 16h2.5M11 16h9"/><circle cx="15" cy="8" r="2.3"/><circle cx="8.5" cy="16" r="2.3"/>',
  book:'<path d="M5.5 4H18a1 1 0 0 1 1 1v15.5H6.5a1.5 1.5 0 0 1-1.5-1.5V5.5A1.5 1.5 0 0 1 6.5 4"/><path d="M5 18.5A1.5 1.5 0 0 1 6.5 17H19M9 8.5h6"/>',
  info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.6h.01"/>',
  camera:'<rect x="3" y="7" width="18" height="13" rx="2.5"/><circle cx="12" cy="13.5" r="3.4"/><path d="M8.5 7 10 4.5h4L15.5 7"/>',
  upload:'<path d="M12 15.5V4.5M8 8l4-3.5 4 3.5"/><path d="M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15"/>',
  logout:'<path d="M15 5.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-.5"/><path d="M20 12H9m11 0-3.2-3.2M20 12l-3.2 3.2"/>',
  wallet:'<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h11a1.5 1.5 0 0 1 1.5 1.5v.5"/><rect x="3.5" y="7" width="17" height="12.5" rx="2.5"/><circle cx="16.5" cy="13.2" r="1.3"/>',
  diamond:'<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/>',
  spark:'<path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7z"/>',
  chat:'<path d="M4 5h16v11H8.5L4 19.5z"/><path d="M8 10h8M8 13h5"/>',
  calc:'<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8 6.5h8"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5v3.5M8.5 18h4"/>',
  scale:'<path d="M12 3v18M7 6h10M6 6 3.5 12h5zM18 6l-2.5 6h5zM3.5 12a2.5 2.5 0 0 0 5 0M15.5 12a2.5 2.5 0 0 0 5 0M8 21h8"/>',
};
function icon(name, cls){
  const p = ICONS[name]; if(!p) return '';
  return `<svg class="ic ${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}
/* filled multi-dot "more" */
function iconMore(){ return `<svg class="ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>`; }

/* real crypto coin logos */
const COINSVG = {
  BTC:'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#f7931a"/><path fill="#fff" d="M22 14.2c.27-1.83-1.12-2.81-3.02-3.47l.62-2.47-1.5-.38-.6 2.41c-.4-.1-.8-.19-1.2-.28l.6-2.42-1.5-.37-.62 2.46c-.32-.07-.64-.15-.95-.22v-.01l-2.07-.52-.4 1.6s1.11.26 1.09.27c.61.15.72.56.7.88l-.7 2.82c.04.01.1.03.16.05l-.16-.04-.98 3.96c-.08.18-.27.46-.7.36.02.02-1.09-.27-1.09-.27l-.74 1.72 1.95.49c.36.09.72.19 1.07.28l-.63 2.5 1.5.38.62-2.47c.41.11.8.21 1.19.31l-.61 2.46 1.5.37.63-2.5c2.56.49 4.49.29 5.3-2.03.65-1.86-.03-2.94-1.38-3.64.98-.23 1.72-.87 1.92-2.2zm-3.44 4.82c-.46 1.86-3.6.86-4.62.6l.83-3.32c1.02.26 4.28.76 3.79 2.72zm.47-4.85c-.42 1.69-3.03.83-3.88.62l.75-3.01c.85.21 3.58.6 3.13 2.39z"/></svg>',
  ETH:'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#627eea"/><g fill="#fff"><path fill-opacity=".6" d="M16.5 4v8.87l7.5 3.35z"/><path d="M16.5 4 9 16.22l7.5-3.35z"/><path fill-opacity=".6" d="M16.5 21.97V28l7.5-10.38z"/><path d="M16.5 28v-6.03L9 17.62z"/><path fill-opacity=".2" d="m16.5 20.57 7.5-4.35-7.5-3.34z"/><path fill-opacity=".6" d="M9 16.22l7.5 4.35v-7.7z"/></g></svg>',
  SOL:'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#131320"/><g fill="url(#cpSol)"><path d="M9.4 19.9a.7.7 0 0 1 .5-.2h13.1a.35.35 0 0 1 .25.6l-2.55 2.55a.7.7 0 0 1-.5.2H7.1a.35.35 0 0 1-.25-.6z"/><path d="M9.4 8.95a.7.7 0 0 1 .5-.2h13.1a.35.35 0 0 1 .25.6l-2.55 2.55a.7.7 0 0 1-.5.2H7.1a.35.35 0 0 1-.25-.6z"/><path d="M20.5 14.4a.7.7 0 0 0-.5-.2H6.9a.35.35 0 0 0-.25.6l2.55 2.55a.7.7 0 0 0 .5.2h13.1a.35.35 0 0 0 .25-.6z"/></g></svg>',
  USDT:'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#26a17b"/><path fill="#fff" d="M17.9 14.5v-2h4.6V9.4H9.5v3.1h4.6v2c-3.74.17-6.55.91-6.55 1.8s2.81 1.63 6.55 1.8v6.5h3.8v-6.5c3.73-.17 6.54-.91 6.54-1.8s-2.81-1.63-6.54-1.8zm0 3.05c-.09.01-.71.05-1.9.05-.95 0-1.6-.03-1.9-.05-3.28-.15-5.73-.72-5.73-1.4s2.45-1.26 5.73-1.4v2.22c.24.02.9.06 1.92.06 1.13 0 1.79-.05 1.88-.06v-2.22c3.27.15 5.71.72 5.71 1.4s-2.44 1.25-5.71 1.4z"/></svg>',
  USDC:'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#2775ca"/><path fill="#fff" d="M20.4 18.5c0-2.35-1.42-3.15-4.25-3.5-2.03-.27-2.43-.8-2.43-1.73s.67-1.53 2-1.53c1.2 0 1.87.4 2.2 1.4.07.2.27.33.47.33h.73a.45.45 0 0 0 .47-.47v-.06a3.28 3.28 0 0 0-2.93-2.67v-1.4a.47.47 0 0 0-.47-.46h-.68a.47.47 0 0 0-.47.46v.87c-2 .27-3.27 1.6-3.27 3.27 0 2.2 1.33 3.06 4.13 3.4 1.87.34 2.47.74 2.47 1.8s-.93 1.8-2.2 1.8c-1.73 0-2.33-.73-2.53-1.73a.48.48 0 0 0-.47-.37h-.78a.46.46 0 0 0-.47.46v.07a3.34 3.34 0 0 0 3.13 2.87v1.4c0 .26.2.46.47.46h.68a.47.47 0 0 0 .47-.46v-1.4c2-.34 3.33-1.74 3.33-3.55z"/><path fill="#fff" d="M13.13 23.4a7.8 7.8 0 0 1 0-14.7.49.49 0 0 0 .33-.47v-.6c0-.23-.13-.37-.37-.33a9.27 9.27 0 0 0 0 17.8c.24.04.37-.1.37-.33v-.6a.49.49 0 0 0-.33-.47zm5.74-14.7a7.8 7.8 0 0 1 0 14.7.49.49 0 0 0-.34.47v.6c0 .23.14.37.38.33a9.27 9.27 0 0 0 0-17.8c-.24-.04-.38.1-.38.33v.6c0 .21.14.4.34.47z"/></svg>',
};
function coinBadge(asset){ return `<span class="coin">${COINSVG[asset]||''}</span>`; }
function brand(){ return `${icon('diamond','diamond-mark')} CrimsonPay`; }

/* transaction-type icon names */
const TXICON = { deposit:'deposit', withdraw:'withdraw', card:'card', convert:'convert', send:'send', fee:'fees', topup:'withdraw', refund:'convert', purchase:'cart' };
/* notification icon names */

/* ---------- state ---------- */
const KEY = 'crimsonpay_v2';
let S;

function seed(){
  return {
    onboarded:false,
    adminMode:false,
    admin:{ pixel:'', api:'', deposits:defaultDeposits() },
    user:{ name:'Alex Morgan', email:'', phone:'' },
    kyc:'none',
    theme:'light',
    currency:'USD',
    language:'en',
    balanceHidden:false,
    twofa:false,
    passkey:false,
    prefs:{ tx:true, sec:true, news:false },
    autoTopup:false, largeAlerts:true, topupAsset:'USDT',
    assets:{ BTC:0, ETH:0, SOL:0, USDT:0, USDC:0 },
    cards:[],
    txs:[],
    addresses:[],
    sessions:[
      { id:id(), device:'This device · Web', loc:'Current session', current:true, when:'Active now' },
    ],
    referrals:[],
    notifs:[
      notif('spark','Welcome to CrimsonPay','Your account is ready. Get your card to start spending crypto.', false),
    ],
    refCode:'ALEX' + Math.floor(1000+Math.random()*9000),
  };
}
function tx(type,title,sub,amount,asset,daysAgo,extra={}){
  return Object.assign({ id:id(), type, title, sub, amount, asset, ts:Date.now()+daysAgo*864e5 }, extra);
}
function notif(ic,title,body,read){ return { id:id(), ic, title, body, ts:Date.now(), read }; }
function id(){ return Math.random().toString(36).slice(2,10); }

function load(){
  try{ const raw = localStorage.getItem(KEY); S = raw ? JSON.parse(raw) : seed(); }
  catch(e){ S = seed(); }
  if(!S || !S.assets) S = seed();
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }

/* ---------- money helpers ---------- */
function totalUSD(){ return Object.entries(S.assets).reduce((s,[k,v])=>s+v*PRICE[k],0); }
function cardsUSD(){ return S.cards.reduce((s,c)=>s+(c.balance||0),0); }
function fx(usd){ return usd * FX[S.currency]; }
function money(usd, opts={}){
  if(S.balanceHidden && !opts.force) return '••••';
  const v = fx(usd), sym = SYM[S.currency];
  const s = Math.abs(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  return (v<0?'-':'')+sym+s;
}
function moneyRaw(usd){ const sym=SYM[S.currency]; return sym+fx(usd).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}); }
function cryptoFmt(amount, asset){
  const d = (asset==='USDT'||asset==='USDC') ? 2 : (asset==='SOL'?3:6);
  return amount.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:d})+' '+asset;
}
function timeAgo(ts){
  const s=(Date.now()-ts)/1000;
  if(s<60) return 'just now';
  if(s<3600) return Math.floor(s/60)+'m ago';
  if(s<86400) return Math.floor(s/3600)+'h ago';
  const d=Math.floor(s/86400); return d===1?'yesterday':d+'d ago';
}

/* ---------- pseudo-QR (decorative only) ---------- */
function qr(text){
  let h=0; for(let i=0;i<text.length;i++){ h=(h*31+text.charCodeAt(i))>>>0; }
  const n=21, cells=[];
  let x=h||1;
  const rnd=()=>{ x^=x<<13;x>>>=0;x^=x>>17;x^=x<<5;x>>>=0;return x/4294967296; };
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    const finder=(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
    let on;
    if(finder){ const R=r<7?r:r-(n-7), C=c<7?c:c-(n-7); on=(R===0||R===6||C===0||C===6||(R>=2&&R<=4&&C>=2&&C<=4)); }
    else on=rnd()>.5;
    if(on) cells.push(`<rect x="${c}" y="${r}" width="1" height="1"/>`);
  }
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="#fff"/><g fill="#111">${cells.join('')}</g></svg>`;
  return 'data:image/svg+xml,'+encodeURIComponent(svg);
}
function defaultDeposits(){
  const out=[];
  Object.entries(NETWORKS).forEach(([asset,nets])=>nets.forEach(n=>out.push({asset,network:n.n,address:'',enabled:true})));
  return out;
}
function depoRow(asset, net){ return (S.admin&&S.admin.deposits||[]).find(x=>x.asset===asset&&x.network===net); }
function adminAddr(asset, net){ const d=depoRow(asset,net); return (d&&d.address)?d.address:fakeAddr(asset,net); }
function adminEnabled(asset, net){ const d=depoRow(asset,net); return d?d.enabled!==false:true; }
function enabledNetworks(asset){ return (NETWORKS[asset]||[]).filter(n=>adminEnabled(asset,n.n)); }
function enabledCoins(){ return Object.keys(COIN).filter(k=>enabledNetworks(k).length>0); }
function fakeAddr(asset, net){
  const hex='0123456789abcdef';
  const b58='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const r=(n,set=hex)=>Array.from({length:n},()=>set[Math.floor(Math.random()*set.length)]).join('');
  if(net==='TRC20') return 'T'+r(33,b58);
  if(net==='Solana' || (asset==='SOL'&&!net)) return r(44,b58);
  if(net==='Bitcoin' || (asset==='BTC'&&!net)) return 'bc1q'+r(38,'0123456789acdefghjklmnpqrstuvwxyz');
  return '0x'+r(40); // ERC20 / BEP20 / Arbitrum
}

/* ================= loading helpers ================= */
function spinner(cls){ return `<span class="spin ${cls||''}"></span>`; }
function showLoader(msg, sub){
  let el=document.getElementById('loader-overlay');
  if(!el){ el=document.createElement('div'); el.id='loader-overlay'; el.className='loader-overlay'; document.body.appendChild(el); }
  el.innerHTML = `<div class="logo center"><span class="logo-mark" data-icon="diamond"></span><span class="logo-text">CrimsonPay</span></div>
    <span class="spin lg"></span><div class="loader-msg">${msg}</div>${sub?`<div class="loader-sub">${sub}</div>`:''}`;
  el.querySelectorAll('[data-icon]').forEach(x=>x.innerHTML=icon(x.dataset.icon));
}
function hideLoader(){ const el=document.getElementById('loader-overlay'); if(el) el.remove(); }
function onboardBanner(){ return `<div class="onboard-banner">${icon('clock')} Finish in ~2 min to get your card</div>`; }

/* ================= view switching ================= */
const bodyEl = document.body;
let firstLoad=false;
function setView(v){ bodyEl.dataset.view=v; window.scrollTo(0,0); }
function gotoApp(fresh){
  setView('app');
  applyTheme();
  applyAdminMode();
  syncSettingsForm();
  firstLoad = !!fresh;
  showPanel('dashboard');
  updateBell();
}
function applyAdminMode(){
  document.body.dataset.admin = S.adminMode ? '1' : '';
  if(!S.adminMode){
    const active=document.querySelector('.setnav-item.active');
    if(active && active.dataset.tab==='business') showSetTab('profile');
  }
}

/* ================= panels ================= */
const TITLES = { dashboard:'Dashboard', cards:'Cards', txs:'Transactions', fees:'Fees', referral:'Refer & earn', settings:'Settings', help:'Help & support', admin:'Admin console' };
function showPanel(name){
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active', p.id==='panel-'+name));
  document.querySelectorAll('.navitem[data-panel]').forEach(n=>n.classList.toggle('active', n.dataset.panel===name));
  document.querySelectorAll('.bn-item[data-panel]').forEach(n=>n.classList.toggle('active', n.dataset.panel===name));
  document.getElementById('page-title').textContent = TITLES[name]||name;
  const R = { dashboard:renderDashboard, cards:renderCards, txs:renderTxs, fees:renderFees, referral:renderReferral, settings:()=>{}, help:()=>{}, admin:renderAdmin }[name];
  if(R) R();
  window.scrollTo(0,0);
}

/* ================= DASHBOARD ================= */
function dashboardSkeleton(){
  const sk=(w,h)=>`<span class="skel skel-line" style="width:${w};height:${h||'14px'}"></span>`;
  document.getElementById('d-total').innerHTML = sk('170px','36px');
  document.getElementById('d-total-sub').innerHTML = sk('210px');
  const rowSk = `<div class="skel-row"><span class="skel skel-circle"></span><span class="skel skel-line" style="flex:1"></span><span class="skel skel-line" style="width:60px"></span></div>`;
  document.getElementById('d-assets').innerHTML = rowSk+rowSk+rowSk;
  document.getElementById('d-recent').innerHTML = rowSk+rowSk;
  document.getElementById('d-card-teaser').innerHTML = `<span class="skel" style="height:150px;border-radius:14px"></span>`;
}
function renderDashboard(){
  if(firstLoad){ firstLoad=false; dashboardSkeleton(); setTimeout(()=>{ if(document.getElementById('panel-dashboard').classList.contains('active')) renderDashboardNow(); }, 900); return; }
  renderDashboardNow();
}
function renderDashboardNow(){
  renderKycBanner(document.getElementById('kyc-banner'));
  document.getElementById('d-cur-badge').textContent = S.currency;
  document.getElementById('d-total').textContent = money(totalUSD()+cardsUSD());
  const nAssets = Object.values(S.assets).filter(v=>v>0).length;
  document.getElementById('d-total-sub').textContent = S.balanceHidden ? '' : (nAssets
    ? `≈ ${cryptoFmt(totalUSD()/PRICE.BTC,'BTC')} · across ${nAssets} asset${nAssets>1?'s':''}`
    : 'No funds yet — deposit to get started');
  document.getElementById('eye-btn').innerHTML = icon(S.balanceHidden ? 'eye-off' : 'eye');

  const a = document.getElementById('d-assets');
  const rows = Object.entries(S.assets).filter(([k,v])=>v>0);
  a.innerHTML = rows.length ? rows.map(([k,v])=>`
    <div class="asset-row">
      ${coinBadge(k)}
      <div class="asset-mid"><b>${COIN[k].name}</b><small>${cryptoFmt(v,k)}</small></div>
      <div class="asset-right"><b>${money(v*PRICE[k])}</b><small>${moneyRaw(PRICE[k])}</small></div>
    </div>`).join('') : `<div class="empty-inline"><p class="muted">No assets yet.</p><button class="btn ghost sm" data-action="apply-card">${icon('card')} Get a card</button></div>`;

  const t = document.getElementById('d-card-teaser');
  if(S.cards.length){
    const c = S.cards[0];
    t.innerHTML = `
      <div class="row-between"><h3>My card</h3><button class="linklike" data-action="panel" data-panel="cards">Manage</button></div>
      <div class="dash-card-mini ${c.theme} ${c.frozen?'frozen':''}">
        <div class="row-between"><b class="cardbrand">${brand()}</b><span class="badge oncard">${c.type}</span></div>
        <div class="ca-num">•••• •••• •••• ${c.last4}</div>
        <div class="row-between" style="font-size:12px"><span>Balance</span><b>${money(c.balance,{force:true})}</b></div>
      </div>
      <button class="btn ghost block mt-s" data-action="topup-card" data-id="${c.id}">Top up card</button>`;
  } else {
    t.innerHTML = `
      <h3>Get your card</h3>
      <p class="muted" style="margin:8px 0 14px">Spend your crypto anywhere. Virtual from $10, physical from $100.</p>
      <button class="btn primary block" data-action="apply-card">${icon('plus')} Order a card</button>`;
  }

  renderTxRows(document.getElementById('d-recent'), S.txs.slice().sort((a,b)=>b.ts-a.ts).slice(0,5));
}

function renderKycBanner(el){
  if(!el) return;
  if(S.kyc==='verified'){ el.innerHTML=''; return; }
  if(S.kyc==='pending'){
    el.innerHTML = `<div class="kyc-banner pending"><span class="kb-ic">${icon('clock')}</span>
      <div class="kb-txt"><b>Verification in review</b><small>We're checking your details — usually done in a few seconds.</small></div></div>`;
    return;
  }
  el.innerHTML = `<div class="kyc-banner warn"><span class="kb-ic">${icon('id')}</span>
    <div class="kb-txt"><b>Verify your identity to unlock cards</b><small>Ordering a card and higher limits require a quick KYC check.</small></div>
    <button class="btn primary sm" data-action="start-kyc">Verify now</button></div>`;
}

/* ================= CARDS ================= */
function renderCards(){
  const root = document.getElementById('cards-root');
  let html = '';
  if(S.cards.length){
    html += `<div class="cards-grid">`;
    S.cards.forEach(c=>{ html += cardTile(c); });
    html += `<button class="card-apply" data-action="apply-card"><span class="apply-plus">${icon('plus')}</span><b>Add another card</b><small class="muted">Virtual $10 · Physical $100</small></button>`;
    html += `</div>`;
  } else {
    html = `<div class="card-box card-empty">
      <span class="empty-ic">${icon('card')}</span>
      <h3 style="margin:10px 0 4px">No cards yet</h3>
      <p class="muted" style="margin-bottom:16px">Order a virtual or physical CrimsonPay card to start spending your crypto.</p>
      <button class="btn primary" data-action="apply-card">Order a card</button>
    </div>`;
  }
  root.innerHTML = html;
}
function cardTile(c){
  const shipping = c.status==='shipping';
  const verified = S.kyc==='verified';
  const spentToday = c.spentToday||0;
  const use = c.limitDaily ? Math.min(100, spentToday/c.limitDaily*100) : 0;
  const pill = shipping ? `<span class="cd-pill ship">${icon('clock')} Shipping</span>`
    : !verified ? `<span class="cd-pill warn">${icon('id')} Verify to top up</span>`
    : c.frozen ? `<span class="cd-pill warn">${icon('freeze')} Frozen</span>`
    : `<span class="cd-pill ok">${icon('check')} Active</span>`;
  const feats = c.type==='physical'
    ? ['Tap to pay','ATM cash','Online &amp; app','Mobile wallet']
    : ['Online &amp; app','Mobile wallet','Subscriptions','No ATM'];
  return `<div class="card-wrap">
    <div class="mycard ${c.theme} ${c.frozen?'frozen':''}">
      <div class="row-between"><b class="cardbrand">${brand()}</b><span class="badge oncard">${c.type}</span></div>
      <div class="num">•••• •••• •••• ${c.last4}</div>
      <div class="row-between" style="font-size:12px;opacity:.9"><span>${c.holder}</span><span>exp ${c.exp}</span></div>
      <div class="row-between" style="font-size:13px;margin-top:6px"><span>Balance</span><b>${money(c.balance,{force:true})}</b></div>
      <div class="mycard-actions">
        <button class="mini-btn" data-action="topup-card" data-id="${c.id}">${icon('withdraw')} Top up</button>
        <button class="mini-btn" data-action="reveal-card" data-id="${c.id}">${icon('eye')} Details</button>
        <button class="mini-btn" data-action="freeze-card" data-id="${c.id}">${c.frozen?icon('sun')+' Unfreeze':icon('freeze')+' Freeze'}</button>
        ${c.type==='physical'?`<button class="mini-btn" data-action="card-atm" data-id="${c.id}">${icon('coins')} ATM</button>`:''}
        <button class="mini-btn" data-action="simulate-purchase" data-id="${c.id}">${icon('cart')} Spend</button>
        <button class="mini-btn" data-action="card-more" data-id="${c.id}">${iconMore()} More</button>
      </div>
    </div>
    <div class="card-details">
      <div class="cd-row"><span class="cd-k">Status</span>${pill}</div>
      ${shipping?shippingStepper(c):''}
      <div class="cd-row"><span class="cd-k">Spent today</span><b>${money(spentToday,{force:true})} <span class="muted">/ ${moneyRaw(c.limitDaily)}</span></b></div>
      <div class="cd-bar"><i style="width:${use}%"></i></div>
      <div class="cd-row"><span class="cd-k">Card type</span><b class="cap">${c.type} · ${c.theme}</b></div>
      <div class="cd-feats">${feats.map(f=>`<span class="feat-chip">${f}</span>`).join('')}</div>
      <button class="btn ghost sm block" data-action="card-limits" data-id="${c.id}">${icon('sliders')} Manage limits</button>
    </div>
  </div>`;
}
function shippingStepper(c){
  const steps=['Ordered','Printed','Shipped','Delivered'];
  const stage=c.shipStage||0;
  return `<div class="ship-track">${steps.map((s,i)=>
    `<div class="ship-step ${i<=stage?'done':''} ${i===stage?'cur':''}"><span class="ship-dot">${i<stage?icon('check'):''}</span><small>${s}</small></div>`
  ).join('')}</div>
  <button class="btn ghost sm block" data-action="ship-advance" data-id="${c.id}">${stage>=2?'Mark as delivered':'Advance shipping'}</button>`;
}
function advanceShip(cid){
  const c=getCard(cid); if(!c) return;
  c.shipStage=Math.min(3,(c.shipStage||0)+1);
  if(c.shipStage>=3){ c.status='active'; pushNotif('card','Card delivered','Your physical card has arrived — activate it by topping up.'); toast('Card delivered','ok'); }
  else toast('Shipping updated');
  save(); refreshAll();
}

/* ----- CARD: ATM (physical only) ----- */
function modalAtm(cid){
  const c=getCard(cid); if(!c) return;
  openModal('', ()=>{
    box.innerHTML = head('ATM cash withdrawal',`Physical card •••• ${c.last4}. Fee 2% (min $2).`) + `
      <label class="fld"><span>Amount (USD)</span><input class="input" id="atm-amt" type="number" placeholder="0.00"></label>
      <div class="chips" style="margin:-4px 0 12px">${[20,50,100,200].map(v=>`<button class="chip" data-v="${v}">$${v}</button>`).join('')}</div>
      <div class="review-list" id="atm-review"></div>
      <div class="muted xs" style="margin:6px 0 12px">Card balance ${money(c.balance,{force:true})} · spent today ${money(c.spentToday||0,{force:true})} / ${moneyRaw(c.limitDaily)}</div>
      <button class="btn primary block" id="atm-go">Withdraw cash</button>`;
    const calc=()=>{ const a=parseFloat(box.querySelector('#atm-amt').value)||0; const fee=a>0?Math.max(FEES.atmMin,a*FEES.atm):0;
      box.querySelector('#atm-review').innerHTML=`<div class="summary-line"><span>Cash</span><b>${moneyRaw(a)}</b></div><div class="summary-line"><span>ATM fee</span><b>${moneyRaw(fee)}</b></div><div class="summary-line total"><span>Debited from card</span><b>${moneyRaw(a+fee)}</b></div>`; };
    calc();
    box.querySelector('#atm-amt').oninput=calc;
    box.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{box.querySelector('#atm-amt').value=b.dataset.v;calc();});
    box.querySelector('#atm-go').onclick=()=>{
      const a=parseFloat(box.querySelector('#atm-amt').value)||0;
      if(a<=0) return toast('Enter an amount','err');
      if(c.frozen) return toast('Card is frozen','err');
      const fee=Math.max(FEES.atmMin,a*FEES.atm), total=a+fee;
      if((c.spentToday||0)+total>c.limitDaily) return toast('Exceeds daily limit','err');
      if(total>c.balance) return toast('Insufficient card balance','err');
      c.balance-=total; c.spentToday=(c.spentToday||0)+total;
      addTx('purchase','ATM withdrawal','Cash', -a,'USD');
      addTx('fee','ATM fee','2% · min $2', -fee,'USD');
      pushNotif('coins','ATM withdrawal',`${money(a,{force:true})} cash withdrawn.`);
      save(); box.innerHTML=resultCard('ok','Cash dispensed',`${money(a,{force:true})} withdrawn. Fee ${money(fee,{force:true})}.`); refreshAll();
    };
  });
}
function getCard(cid){ return S.cards.find(c=>c.id===cid); }

/* ================= TRANSACTIONS ================= */
let txFilter='all', txQuery='';
function txCategory(t){
  if(t.type==='deposit') return 'deposit';
  if(t.type==='withdraw') return 'withdraw';
  if(t.type==='convert') return 'convert';
  if(t.type==='send') return 'send';
  if(t.type==='fee') return 'fee';
  return 'card';
}
function renderTxs(){
  const list = document.getElementById('tx-list');
  let rows = S.txs.slice().sort((a,b)=>b.ts-a.ts);
  if(txFilter!=='all') rows = rows.filter(t=>txCategory(t)===txFilter);
  if(txQuery) rows = rows.filter(t=>(t.title+' '+t.sub).toLowerCase().includes(txQuery.toLowerCase()));
  renderTxRows(list, rows, true);
}
function renderTxRows(el, rows, full){
  if(!rows.length){ el.innerHTML=`<p class="muted" style="padding:16px 0">No transactions${txQuery?' match your search':''}.</p>`; return; }
  el.innerHTML = rows.map(t=>{
    const pos = t.amount>0;
    const amtStr = t.noamt ? '' : `<div class="tx-amt ${pos?'pos':'neg'}">${pos?'+':''}${money(t.amount,{force:true})}</div>`;
    return `<div class="tx-row">
      <div class="tx-ic">${icon(TXICON[t.type]||'activity')}</div>
      <div class="tx-mid"><b>${t.title}</b><small>${t.sub} · ${new Date(t.ts).toLocaleDateString()}${full?' '+new Date(t.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):''}</small></div>
      ${amtStr}
    </div>`;
  }).join('');
}
function addTx(type,title,sub,amount,asset,extra={}){
  S.txs.push(Object.assign({ id:id(), type, title, sub, amount, asset, ts:Date.now() }, extra));
}

/* ================= FEES ================= */
function renderFees(){
  const tb = document.querySelector('#fees-network tbody');
  const rows=[];
  Object.entries(NETWORKS).forEach(([asset,nets])=>{
    nets.forEach(net=>{
      rows.push(`<tr><td>${coinBadge(asset)} ${asset} · ${net.n}</td><td class="tr-r"><b>${cryptoFmt(net.fee,asset)}</b> <small class="muted">${net.eta}</small></td></tr>`);
    });
  });
  tb.innerHTML = rows.join('');
  updateFeeCalc();
}
function updateFeeCalc(){
  const amt = Math.max(0, parseFloat(document.getElementById('fee-calc').value)||0);
  const fee = amt*FEES.topup;
  document.getElementById('fc-fee').textContent = moneyRaw(fee);
  document.getElementById('fc-net').textContent = moneyRaw(amt-fee);
}

/* ================= REFERRAL ================= */
function renderReferral(){
  document.getElementById('ref-code').textContent = S.refCode;
  document.getElementById('ref-link').textContent = `https://crimsonpay.app/r/${S.refCode}`;
  const invited = S.referrals.length;
  const earned = S.referrals.filter(r=>r.status==='verified').reduce((s,r)=>s+r.reward,0);
  const pending = S.referrals.filter(r=>r.status==='pending').length*5;
  document.getElementById('ref-invited').textContent = invited;
  document.getElementById('ref-earned').textContent = '$'+earned;
  document.getElementById('ref-pending').textContent = '$'+pending;
  document.getElementById('ref-list').innerHTML = S.referrals.map(r=>`
    <div class="set-row"><div><b>${r.name}</b><small>${r.status==='verified'?'Verified · you earned $5':'Signed up · pending verification'}</small></div>
    <span class="badge ${r.status==='verified'?'ok':'warn'}">${r.status}</span></div>`).join('') || '<p class="muted">No invites yet.</p>';
}

/* ================= ADMIN PANEL ================= */
let adminTab='users';
let ADMIN_SAMPLE=[
  { id:'s1', name:'Ananya Sharma', phone:'+91 98200 11210', email:'ananya.s@gmail.com', balance:342.50, kyc:'verified', cards:1, blocked:false },
  { id:'s2', name:'Rahul Verma',   phone:'+91 99870 44521', email:'rahulv@outlook.com',  balance:0,      kyc:'pending',  cards:0, blocked:false },
  { id:'s3', name:'Meera Nair',    phone:'+91 90350 88123', email:'meera.nair@gmail.com', balance:1580.00, kyc:'verified', cards:2, blocked:true },
];
function adminBlockedAny(){ return S.cards.some(c=>c.frozen); }
function renderAdmin(){
  const root=document.getElementById('admin-root'); if(!root) return;
  const users=[{id:'me',name:S.user.name,phone:S.user.phone||'—',email:S.user.email||'—',balance:totalUSD()+cardsUSD(),kyc:S.kyc,cards:S.cards.length,blocked:adminBlockedAny(),self:true}, ...ADMIN_SAMPLE];
  const totalUsers=users.length, verified=users.filter(u=>u.kyc==='verified').length, withCards=users.filter(u=>u.cards>0).length;
  root.innerHTML = `
    <div class="card-box">
      <div class="row-between"><div><h3>Admin console <span class="badge brand">Preview</span></h3><div class="admin-note">Front-end mock — reads local data now, connects to your server API once set.</div></div></div>
      <div class="stat-row" style="margin-top:14px">
        <div class="stat"><b>${totalUsers}</b><span>Users</span></div>
        <div class="stat"><b>${verified}</b><span>Verified</span></div>
        <div class="stat"><b>${withCards}</b><span>With cards</span></div>
      </div>
      <div class="admin-tabs chips" id="admin-tabs" style="margin-top:14px">
        <button class="chip ${adminTab==='users'?'active':''}" data-action="admin-tab" data-tab="users">Users</button>
        <button class="chip ${adminTab==='deposits'?'active':''}" data-action="admin-tab" data-tab="deposits">Deposits</button>
        <button class="chip ${adminTab==='notify'?'active':''}" data-action="admin-tab" data-tab="notify">Notifications</button>
        <button class="chip ${adminTab==='marketing'?'active':''}" data-action="admin-tab" data-tab="marketing">Marketing</button>
      </div>
    </div>
    <div id="admin-body" class="mt"></div>`;
  renderAdminBody(users);
}
function renderAdminBody(users){
  const b=document.getElementById('admin-body'); if(!b) return;
  if(adminTab==='users'){
    b.innerHTML = `<div class="card-box">
      <div class="row-between"><h3>Signups</h3><button class="btn ghost sm" data-action="admin-export">${icon('deposit')} Export CSV</button></div>
      <p class="muted xs" style="margin:4px 0 10px">Name &amp; number are captured at signup for marketing &amp; offers. (Consent required once live.)</p>
      <div class="table-scroll"><table class="utable">
        <thead><tr><th>User</th><th>Phone</th><th>Balance</th><th>KYC</th><th>Cards</th><th></th></tr></thead>
        <tbody>${users.map(u=>`<tr>
          <td><div class="u-name">${u.name}${u.self?' <span class="badge soft">you</span>':''}</div><div class="u-sub">${u.email}</div></td>
          <td>${u.phone}</td>
          <td>${money(u.balance,{force:true})}</td>
          <td><span class="badge ${u.kyc==='verified'?'ok':u.kyc==='pending'?'warn':'soft'}">${u.kyc}</span></td>
          <td>${u.cards}</td>
          <td>${u.cards>0?`<button class="btn ${u.blocked?'ghost':'danger'} sm" data-action="admin-block" data-id="${u.id}">${u.blocked?'Unblock':'Block'}</button>`:'<span class="muted xs">—</span>'}</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>`;
  } else if(adminTab==='deposits'){
    const dep=S.admin.deposits||[];
    b.innerHTML = `<div class="card-box">
      <div class="row-between"><h3>Deposit addresses</h3><button class="btn primary sm" data-action="admin-depo-add">${icon('plus')} Add coin</button></div>
      <p class="muted xs" style="margin:4px 0 12px">Set the receiving address per coin &amp; network, and turn deposits on/off. Users see enabled coins on the deposit &amp; top-up screens.</p>
      <div class="table-scroll"><table class="utable">
        <thead><tr><th>Coin</th><th>Network</th><th>Deposit address</th><th>Status</th><th></th></tr></thead>
        <tbody>${dep.map((d,i)=>`<tr>
          <td>${coinBadge(d.asset)} <b>${d.asset}</b></td>
          <td>${d.network}</td>
          <td><input class="input sm code-input dep-addr" data-i="${i}" value="${(d.address||'').replace(/"/g,'&quot;')}" placeholder="${fakeAddr(d.asset,d.network)}"></td>
          <td><label class="switch"><input type="checkbox" class="dep-en" data-i="${i}" ${d.enabled!==false?'checked':''}><span></span></label></td>
          <td><button class="iconbtn" data-action="admin-depo-del" data-i="${i}" title="Remove">${icon('trash')}</button></td>
        </tr>`).join('')}</tbody>
      </table></div>
      <button class="btn primary mt" data-action="admin-depo-save">Save deposit settings</button>
      <p class="admin-note">Placeholders shown until you set an address. Keep the "preview — do not send real funds" label live until your issuer &amp; backend are connected.</p>
    </div>`;
  } else if(adminTab==='notify'){
    b.innerHTML = `<div class="card-box">
      <h3>Send in-app notification</h3>
      <p class="muted">Broadcast a message to users — it appears in their in-app notification bell.</p>
      <label class="fld"><span>Title</span><input class="input" id="an-title" placeholder="A special offer for you"></label>
      <label class="fld"><span>Message</span><textarea class="input" id="an-msg" rows="3" placeholder="Get 5% cashback on card spends this week…"></textarea></label>
      <button class="btn primary" data-action="admin-send-notif">Send to users</button>
      <p class="admin-note">In this preview it posts to your own notification bell; on the server it fans out to all users.</p>
    </div>`;
  } else if(adminTab==='marketing'){
    b.innerHTML = `<div class="card-box">
      <h3>Tracking pixel</h3>
      <p class="muted">Paste your Meta / Google / analytics pixel. On your live server it's injected into every page's &lt;head&gt;.</p>
      <textarea class="input code-input" id="mk-pixel" rows="5" placeholder="<!-- Meta Pixel Code -->&#10;<script>...</script>"></textarea>
      <button class="btn primary mt-s" data-action="admin-save-pixel">Install pixel</button>
      <div id="mk-pixel-status">${S.admin.pixel?`<div class="pixel-status">${icon('check')} Pixel installed · activates on live site</div>`:''}</div>
      <p class="admin-note">Stored only — not executed inside this preview (arbitrary script injection is a security risk).</p>
    </div>
    <div class="card-box">
      <h3>Backend server</h3>
      <p class="muted">Point the app &amp; admin to your server once it's ready. Deposits, balances, cards and user data come from here.</p>
      <label class="fld"><span>API endpoint (IP : port)</span><input class="input code-input" id="mk-api" value="${(S.admin.api||'').replace(/"/g,'&quot;')}" placeholder="http://203.0.113.10:8080"></label>
      <button class="btn primary" data-action="admin-save-api">Save endpoint</button>
    </div>`;
    const px=document.getElementById('mk-pixel'); if(px) px.value=S.admin.pixel||'';
  }
}

/* ================= SETTINGS ================= */
function showSetTab(tab){
  document.querySelectorAll('.setnav-item').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  document.querySelectorAll('.set-sec').forEach(s=>s.classList.toggle('active', s.id==='set-'+tab));
  if(tab==='security') renderSessions();
  if(tab==='verify') renderKycCard();
  if(tab==='addresses') renderAddresses();
  if(tab==='prefs') syncTheme();
  if(tab==='business') renderBusiness();
}
function renderBusiness(){
  const market=parseFloat(document.getElementById('biz-market').value)||0;
  const cust=parseFloat(document.getElementById('biz-customer').value)||0;
  const vol=parseFloat(document.getElementById('biz-vol').value)||0;
  const margin=market-cust;
  const pct=market? (margin/market*100):0;
  const inr=v=>'₹'+v.toLocaleString(undefined,{maximumFractionDigits:2});
  const loss=margin<0;
  document.getElementById('biz-out').innerHTML = `
    <div class="row-between"><span>Margin per USDT</span><b class="${loss?'val-neg':'val-pos'}">${inr(margin)}</b></div>
    <div class="row-between"><span>Effective spread</span><b class="${loss?'val-neg':''}">${pct.toFixed(2)}%</b></div>
    <div class="row-between total"><span>Customer gets per 100 USDT</span><b>${inr(cust*100)}</b></div>
    ${loss?`<p class="muted xs" style="color:var(--danger);margin-top:6px">You're paying customers more than USDT costs you — every convert loses ${inr(-margin)}.</p>`:''}`;
  const rev=vol*margin;
  document.getElementById('biz-proj').innerHTML = `
    <div class="row-between"><span>Monthly volume</span><b>${vol.toLocaleString()} USDT</b></div>
    <div class="row-between total"><span>Est. monthly spread revenue</span><b class="${loss?'val-neg':'val-pos'}">${inr(rev)}</b></div>
    <div class="row-between"><span>≈ in USD</span><b>$${market?(rev/market).toLocaleString(undefined,{maximumFractionDigits:0}):0}</b></div>`;
}
function syncSettingsForm(){
  document.getElementById('p-name').value = S.user.name;
  document.getElementById('p-email').value = S.user.email;
  document.getElementById('p-phone').value = S.user.phone;
  document.getElementById('p-avatar').textContent = (S.user.name[0]||'A').toUpperCase();
  document.getElementById('u-avatar').textContent = (S.user.name[0]||'A').toUpperCase();
  document.getElementById('u-name').textContent = S.user.name;
  document.getElementById('u-email').textContent = S.user.email||'you@crimsonpay.app';
  document.getElementById('tg-2fa').checked = S.twofa;
  document.getElementById('tfa-badge').textContent = S.twofa?'On':'Off';
  document.getElementById('tfa-badge').className = 'badge '+(S.twofa?'ok':'soft');
  document.getElementById('tg-notif-tx').checked = S.prefs.tx;
  document.getElementById('tg-notif-sec').checked = S.prefs.sec;
  document.getElementById('tg-notif-news').checked = S.prefs.news;
  document.getElementById('tg-autotopup').checked = S.autoTopup;
  document.getElementById('tg-alerts').checked = S.largeAlerts;
  document.getElementById('sel-currency').value = S.currency;
  document.getElementById('sel-language').value = S.language;
  document.getElementById('sel-topup-asset').value = S.topupAsset;
  syncTheme();
}
function syncTheme(){
  document.querySelectorAll('#theme-seg .seg-btn').forEach(b=>b.classList.toggle('active', b.dataset.theme===S.theme));
}
function renderSessions(){
  document.getElementById('sessions').innerHTML = S.sessions.map(s=>`
    <div class="set-row">
      <div><b>${s.device} ${s.current?'<span class="badge ok">This device</span>':''}</b><small>${s.loc} · ${s.when}</small></div>
      ${s.current?'':`<button class="btn ghost sm" data-action="revoke-session" data-id="${s.id}">Sign out</button>`}
    </div>`).join('');
}
function renderAddresses(){
  const el = document.getElementById('addr-list');
  el.innerHTML = S.addresses.map(a=>`
    <div class="addr-item">
      ${coinBadge(a.asset)}
      <div class="addr-mid"><b>${a.label} · ${a.network}</b><small class="trunc">${a.address}</small></div>
      <button class="iconbtn" data-action="addr-del" data-id="${a.id}" title="Remove">${icon('trash')}</button>
    </div>`).join('') || '<p class="muted">No saved addresses.</p>';
}
function renderKycCard(){
  const el = document.getElementById('kyc-card'); if(!el) return;
  if(S.kyc==='verified'){
    el.innerHTML = `<h3>Identity verification</h3>
      <div class="kyc-banner ok"><span class="kb-ic">${icon('check')}</span><div class="kb-txt"><b>Verified</b><small>Your identity is confirmed. All limits unlocked.</small></div></div>`;
  } else if(S.kyc==='pending'){
    el.innerHTML = `<h3>Identity verification</h3>
      <div class="kyc-banner pending"><span class="kb-ic">${icon('clock')}</span><div class="kb-txt"><b>In review</b><small>Hang tight — approval usually lands within seconds.</small></div></div>`;
  } else {
    el.innerHTML = `<h3>Identity verification</h3>
      <p class="muted" style="margin:6px 0 14px">Complete a quick KYC check to order cards and raise limits.</p>
      <button class="btn primary" data-action="start-kyc">Start verification</button>`;
  }
}

/* ================= MODALS ================= */
const overlay = document.getElementById('modal-root');
const box = document.getElementById('modal-box');
let onModalMount=null;
function openModal(html, mount){
  box.className = 'modal card-box';
  box.innerHTML = html;
  overlay.classList.remove('hidden');
  onModalMount = mount||null;
  if(onModalMount) onModalMount(box);
}
function closeModal(){ overlay.classList.add('hidden'); box.innerHTML=''; onModalMount=null; }
overlay.addEventListener('click', e=>{ if(e.target===overlay) closeModal(); });
function head(title, sub){ return `<div class="modal-head"><div><h3>${title}</h3>${sub?`<p>${sub}</p>`:''}</div><button class="iconbtn" data-action="modal-close">${icon('x')}</button></div>`; }
function resultCard(kind, title, body, btn){
  return `<div class="center-txt"><div class="result-ic ${kind==='ok'?'ok':'warn'}">${icon(kind==='ok'?'check':'x')}</div>
    <h3>${title}</h3><p class="muted" style="margin:8px 0 16px">${body}</p>${btn||'<button class="btn primary block" data-action="modal-close">Done</button>'}</div>`;
}

/* ----- DEPOSIT ----- */
function modalDeposit(){
  const coins=enabledCoins(); let asset=coins.includes('USDT')?'USDT':coins[0]||'USDT';
  let nets=enabledNetworks(asset), net=nets[0]||NETWORKS[asset][0];
  openModal('', ()=>render());
  function render(){
    nets=enabledNetworks(asset); if(!nets.find(n=>n.n===net.n)) net=nets[0]||NETWORKS[asset][0];
    box.innerHTML = head('Deposit crypto','Send only the selected asset to this address.') + `
      <div class="asset-pick" id="dp-assets">
        ${enabledCoins().map(k=>`<div class="asset-opt ${k===asset?'sel':''}" data-k="${k}">${coinBadge(k)}<b>${k}</b><small>${COIN[k].name}</small></div>`).join('')}
      </div>
      <label class="fld"><span>Network</span></label>
      <div class="net-pick" id="dp-nets">
        ${nets.map((n,i)=>`<div class="net-opt ${n.n===net.n?'sel':''}" data-i="${i}"><span><b>${n.n}</b></span><small>fee ${cryptoFmt(n.fee,asset)} · ${n.eta}</small></div>`).join('')}
      </div>
      <div class="qr-box">
        <img class="qr-img" src="${qr(adminAddr(asset,net.n))}" alt="QR">
        <div class="addr-copy"><code id="dp-addr">${adminAddr(asset,net.n)}</code><button class="btn ghost sm" data-action="copy" data-copy-id="dp-addr">Copy</button></div>
        <small class="muted">Preview address — do not send real funds.</small>
      </div>
      <button class="btn primary block mt" data-action="sim-deposit" data-asset="${asset}">${icon('bolt')} Simulate incoming deposit</button>`;
    box.querySelector('#dp-assets').onclick = e=>{ const o=e.target.closest('.asset-opt'); if(!o)return; asset=o.dataset.k; net=enabledNetworks(asset)[0]||NETWORKS[asset][0]; render(); };
    box.querySelector('#dp-nets').onclick = e=>{ const o=e.target.closest('.net-opt'); if(!o)return; net=enabledNetworks(asset)[Number(o.dataset.i)]; render(); };
  }
}
function simDeposit(asset){
  const amt = asset==='BTC'?0.005: asset==='ETH'?0.1: asset==='SOL'?2: 250;
  S.assets[asset]=(S.assets[asset]||0)+amt;
  addTx('deposit',`Deposit · ${asset}`,`Network confirmed`, amt*PRICE[asset], asset);
  pushNotif('coins','Deposit received',`+${cryptoFmt(amt,asset)} credited to your balance.`);
  save(); closeModal(); toast(`Deposited ${cryptoFmt(amt,asset)}`,'ok'); refreshAll();
}

/* ----- WITHDRAW ----- */
function modalWithdraw(){
  let step=1, asset='USDT', net=NETWORKS[asset][0], amount=0, addr='';
  openModal('', ()=>render());
  function render(){
    if(step===1){
      box.innerHTML = head('Withdraw crypto','Send from your CrimsonPay balance to an external wallet.') + `
        <div class="asset-pick" id="wd-assets">
          ${Object.keys(COIN).filter(k=>S.assets[k]>0).map(k=>`<div class="asset-opt ${k===asset?'sel':''}" data-k="${k}">${coinBadge(k)}<b>${k}</b><small>${cryptoFmt(S.assets[k],k)}</small></div>`).join('')}
        </div>
        <div class="net-pick" id="wd-nets">
          ${NETWORKS[asset].map((n,i)=>`<div class="net-opt ${n.n===net.n?'sel':''}" data-i="${i}"><span><b>${n.n}</b></span><small>fee ${cryptoFmt(n.fee,asset)} · ${n.eta}</small></div>`).join('')}
        </div>
        <label class="fld"><span>Destination address</span><input class="input" id="wd-addr" placeholder="Paste wallet address" value="${addr}"></label>
        ${S.addresses.filter(a=>a.asset===asset).length?`<div class="chips" style="margin-bottom:12px">${S.addresses.filter(a=>a.asset===asset).map(a=>`<button class="chip" data-addr="${a.address}">${a.label}</button>`).join('')}</div>`:''}
        <label class="fld"><span>Amount (${asset})</span><input class="input" id="wd-amt" type="number" placeholder="0.00" value="${amount||''}"></label>
        <div class="row-between muted xs" style="margin:-6px 0 14px"><span>Available: ${cryptoFmt(S.assets[asset]||0,asset)}</span><button class="linklike" id="wd-max">Max</button></div>
        <button class="btn primary block" id="wd-next">Review withdrawal</button>`;
      box.querySelector('#wd-assets').onclick=e=>{const o=e.target.closest('.asset-opt');if(!o)return;asset=o.dataset.k;net=NETWORKS[asset][0];render();};
      box.querySelector('#wd-nets').onclick=e=>{const o=e.target.closest('.net-opt');if(!o)return;net=NETWORKS[asset][Number(o.dataset.i)];render();};
      box.querySelectorAll('[data-addr]').forEach(b=>b.onclick=()=>{addr=b.dataset.addr;box.querySelector('#wd-addr').value=addr;});
      box.querySelector('#wd-max').onclick=()=>{box.querySelector('#wd-amt').value=Math.max(0,S.assets[asset]-net.fee).toFixed(6);};
      box.querySelector('#wd-next').onclick=()=>{
        amount=parseFloat(box.querySelector('#wd-amt').value)||0; addr=box.querySelector('#wd-addr').value.trim();
        if(!addr) return toast('Enter a destination address','err');
        if(amount<=0) return toast('Enter an amount','err');
        if(amount+net.fee > S.assets[asset]) return toast('Insufficient balance (incl. network fee)','err');
        const dayLimit = S.kyc==='verified'?50000:1000;
        if(amount*PRICE[asset] > dayLimit) return toast(`Exceeds ${money(dayLimit,{force:true})} daily limit`,'err');
        step=2; render();
      };
    } else if(step===2){
      const netUsd=net.fee*PRICE[asset];
      box.innerHTML = head('Review withdrawal') + `
        <div class="review-list">
          <div class="summary-line"><span>Asset</span><b>${coinBadge(asset)} ${asset}</b></div>
          <div class="summary-line"><span>Network</span><b>${net.n}</b></div>
          <div class="summary-line"><span>To</span><b class="trunc" style="max-width:180px">${addr}</b></div>
          <div class="summary-line"><span>Amount</span><b>${cryptoFmt(amount,asset)}</b></div>
          <div class="summary-line"><span>Network fee</span><b>${cryptoFmt(net.fee,asset)}</b></div>
          <div class="summary-line total"><span>Total debit</span><b>${cryptoFmt(amount+net.fee,asset)}</b></div>
        </div>
        ${S.twofa?`<label class="fld"><span>2FA code</span><input class="input pinput" id="wd-2fa" maxlength="6" placeholder="000000"></label>`:''}
        <div class="chips"><button class="btn ghost" id="wd-back" style="flex:1">Back</button><button class="btn primary" id="wd-confirm" style="flex:2">Confirm withdrawal</button></div>`;
      box.querySelector('#wd-back').onclick=()=>{step=1;render();};
      box.querySelector('#wd-confirm').onclick=()=>{
        if(S.twofa){ const c=box.querySelector('#wd-2fa').value; if(!/^\d{6}$/.test(c)) return toast('Enter your 6-digit 2FA code','err'); }
        S.assets[asset]-= (amount+net.fee);
        addTx('withdraw',`Withdraw · ${asset}`,`${net.n} → ${addr.slice(0,10)}…`, -amount*PRICE[asset], asset);
        addTx('fee','Network fee',`${asset} ${net.n}`, -netUsd, asset);
        pushNotif('withdraw','Withdrawal sent',`${cryptoFmt(amount,asset)} on the way to your wallet.`);
        save(); step=3; render(); refreshAll();
      };
    } else {
      box.innerHTML = resultCard('ok','Withdrawal submitted',`${cryptoFmt(amount,asset)} is on its way via ${net.n}. ${net.eta} estimated.`);
    }
  }
}

/* ----- CONVERT ----- */
function modalConvert(){
  let from='ETH', to='USDT', amount=0;
  if(!(S.assets[from]>0)) from=Object.keys(COIN).find(k=>S.assets[k]>0)||'USDT';
  openModal('', ()=>render());
  function render(){
    const avail=S.assets[from]||0;
    const gross = amount*PRICE[from]/PRICE[to];
    const out = gross*(1-FEES.spread);
    box.innerHTML = head('Convert','Swap between assets instantly. 0.3% spread.') + `
      <label class="fld"><span>From</span>
        <select class="input" id="cv-from">${Object.keys(COIN).filter(k=>S.assets[k]>0).map(k=>`<option ${k===from?'selected':''}>${k}</option>`).join('')}</select></label>
      <label class="fld"><span>Amount (${from})</span><input class="input" id="cv-amt" type="number" value="${amount||''}" placeholder="0.00"></label>
      <div class="row-between muted xs" style="margin:-6px 0 12px"><span>Available: ${cryptoFmt(avail,from)}</span><button class="linklike" id="cv-max">Max</button></div>
      <div class="center-txt convert-arrow">${icon('convert')}</div>
      <label class="fld"><span>To</span>
        <select class="input" id="cv-to">${Object.keys(COIN).filter(k=>k!==from).map(k=>`<option ${k===to?'selected':''}>${k}</option>`).join('')}</select></label>
      <div class="review-list">
        <div class="summary-line"><span>Rate</span><b>1 ${from} ≈ ${(PRICE[from]/PRICE[to]).toLocaleString(undefined,{maximumFractionDigits:4})} ${to}</b></div>
        <div class="summary-line"><span>Spread (0.3%)</span><b>${cryptoFmt(gross*FEES.spread,to)}</b></div>
        <div class="summary-line total"><span>You receive</span><b>${cryptoFmt(out||0,to)}</b></div>
      </div>
      <button class="btn primary block" id="cv-go">Convert</button>`;
    box.querySelector('#cv-from').onchange=e=>{from=e.target.value; if(to===from) to=Object.keys(COIN).find(k=>k!==from); render();};
    box.querySelector('#cv-to').onchange=e=>{to=e.target.value; render();};
    box.querySelector('#cv-amt').oninput=e=>{amount=parseFloat(e.target.value)||0; render();};
    box.querySelector('#cv-max').onclick=()=>{amount=avail; render();};
    box.querySelector('#cv-go').onclick=()=>{
      amount=parseFloat(box.querySelector('#cv-amt').value)||0;
      if(amount<=0) return toast('Enter an amount','err');
      if(amount>avail) return toast('Insufficient balance','err');
      const outAmt = amount*PRICE[from]/PRICE[to]*(1-FEES.spread);
      S.assets[from]-=amount; S.assets[to]=(S.assets[to]||0)+outAmt;
      addTx('convert',`Converted ${from} → ${to}`,`${cryptoFmt(amount,from)} → ${cryptoFmt(outAmt,to)}`, 0, to, {noamt:true});
      save(); closeModal(); toast(`Converted to ${cryptoFmt(outAmt,to)}`,'ok'); refreshAll();
    };
  }
}

/* ----- SEND (internal) ----- */
function modalSend(){
  let asset='USDT', amount=0, to='';
  openModal('', ()=>render());
  function render(){
    box.innerHTML = head('Send to CrimsonPay user','Instant and free between CrimsonPay accounts.') + `
      <label class="fld"><span>Recipient (email or @username)</span><input class="input" id="sd-to" placeholder="friend@example.com" value="${to}"></label>
      <label class="fld"><span>Asset</span><select class="input" id="sd-asset">${Object.keys(COIN).filter(k=>S.assets[k]>0).map(k=>`<option ${k===asset?'selected':''}>${k}</option>`).join('')}</select></label>
      <label class="fld"><span>Amount (${asset})</span><input class="input" id="sd-amt" type="number" value="${amount||''}" placeholder="0.00"></label>
      <div class="muted xs" style="margin:-6px 0 14px">Available: ${cryptoFmt(S.assets[asset]||0,asset)}</div>
      <button class="btn primary block" id="sd-go">Send</button>`;
    box.querySelector('#sd-asset').onchange=e=>{asset=e.target.value;render();};
    box.querySelector('#sd-go').onclick=()=>{
      to=box.querySelector('#sd-to').value.trim(); amount=parseFloat(box.querySelector('#sd-amt').value)||0;
      if(!to) return toast('Enter a recipient','err');
      if(amount<=0) return toast('Enter an amount','err');
      if(amount>(S.assets[asset]||0)) return toast('Insufficient balance','err');
      S.assets[asset]-=amount;
      addTx('send',`Sent to ${to}`,`Internal transfer`, -amount*PRICE[asset], asset);
      pushNotif('send','Payment sent',`${cryptoFmt(amount,asset)} sent to ${to}.`);
      save(); closeModal(); toast('Sent!','ok'); refreshAll();
    };
  }
}

/* ----- CARD APPLY ----- */
function applyCard(){ openCardOrder(); }

function openCardOrder(){
  let step=1, type='virtual', theme='ruby', preview=1000+Math.floor(Math.random()*9000);
  openModal('', ()=>render());
  function render(){
    const s=CARD_SPECS[type], price=s.price;
    if(step===1){
      box.className='modal card-box sheet';
      box.innerHTML =
        `<div class="sheet-head">${head('Choose your card','Pick a card and colour, then pay securely with your wallet.')}</div>
         <div class="sheet-scroll"><div class="onboard-banner">${icon('wallet')} No identity check — continue directly to payment</div>
         <div class="cardopts" id="ca-opts">` + Object.entries(CARD_SPECS).map(([k,c])=>`
          <button class="cardopt ${k===type?'sel':''}" data-t="${k}">
            <div class="cardopt-top"><span class="cardopt-name">${c.name}</span><span class="cardopt-price">$${c.price}<small>one-time</small></span></div>
            <span class="badge soft">${c.tag}</span>
            <div class="cardopt-sub">Benefits</div>
            <ul class="check-list mini">${c.benefits.map(b=>`<li>${b}</li>`).join('')}</ul>
            <div class="cardopt-sub">Limits</div>
            <div class="cardopt-limits">${c.limits.map(l=>`<div class="row-between"><span>${l[0]}</span><b>${l[1]}</b></div>`).join('')}</div>
          </button>`).join('') + `</div>
         <div class="cardopt-sub" style="margin-top:2px">Card colour</div>
         <div class="color-picker" id="ca-theme">
           <button class="color-swatch ruby ${theme==='ruby'?'sel':''}" data-th="ruby"><span class="cs-dot"></span>Ruby</button>
           <button class="color-swatch onyx ${theme==='onyx'?'sel':''}" data-th="onyx"><span class="cs-dot"></span>Onyx</button>
         </div>
         <div class="cardopt-sub">Preview</div>
         <div class="mycard ${theme}">
           <div class="row-between"><b class="cardbrand">${brand()}</b><span class="badge oncard">${type}</span></div>
           <div class="num">•••• •••• •••• ${preview}</div>
           <div class="row-between" style="font-size:12px;opacity:.9"><span>${(S.user.name||'YOUR NAME').toUpperCase()}</span><span>NEW</span></div>
         </div>
         </div>
         <div class="sheet-foot"><button class="btn primary block" id="ca-next">Pay ${price} with wallet</button></div>`;
      box.querySelector('#ca-opts').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;type=b.dataset.t;render();};
      box.querySelector('#ca-theme').onclick=e=>{const b=e.target.closest('[data-th]');if(!b)return;theme=b.dataset.th;render();};
      box.querySelector('#ca-next').onclick=()=>{
        window.location.href=`/connect?amount=${price}&card=${encodeURIComponent(type)}&theme=${encodeURIComponent(theme)}`;
      };
    }
  }
}
function tronAddr(){ const b='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'; return 'T'+Array.from({length:33},()=>b[Math.floor(Math.random()*b.length)]).join(''); }
function txRef(){ const h='0123456789abcdef'; return '0x'+Array.from({length:40},()=>h[Math.floor(Math.random()*16)]).join(''); }
function cardNumber(){ let n='4291'; for(let i=0;i<12;i++) n+=Math.floor(Math.random()*10); return n; }
function expDate(){ const y=(new Date().getFullYear()+4)%100; const m=String(1+Math.floor(Math.random()*12)).padStart(2,'0'); return `${m}/${y}`; }

/* ----- CARD: TOP UP ----- */
function modalTopup(cid){
  const c=getCard(cid); if(!c) return;
  if(S.kyc!=='verified'){
    openModal(head('Verify to top up','Loading funds needs a completed identity check.') + `
      <div class="center-txt" style="padding:6px 0 14px"><div class="result-ic warn">${icon('id')}</div>
        <p class="muted">You can hold this card, but topping it up needs verification — just like a real card.</p></div>
      <button class="btn primary block" data-action="start-kyc">Verify now</button>
      <button class="btn ghost block mt-s" data-action="modal-close">Later</button>`);
    return;
  }
  const coins=enabledCoins(); let asset=coins.includes('USDT')?'USDT':coins[0]||'USDT';
  let net=enabledNetworks(asset)[0]||NETWORKS[asset][0];
  openModal('', ()=>render());
  function render(){
    const nets=enabledNetworks(asset); if(!nets.find(n=>n.n===net.n)) net=nets[0]||NETWORKS[asset][0];
    box.innerHTML = head('Top up card',`Send crypto to fund •••• ${c.last4}. Credited after 1% fee.`) + `
      <div class="asset-pick" id="tu-assets">
        ${enabledCoins().map(k=>`<div class="asset-opt ${k===asset?'sel':''}" data-k="${k}">${coinBadge(k)}<b>${k}</b><small>${COIN[k].name}</small></div>`).join('')}
      </div>
      <label class="fld"><span>Network</span></label>
      <div class="net-pick" id="tu-nets">
        ${nets.map((n,i)=>`<div class="net-opt ${n.n===net.n?'sel':''}" data-i="${i}"><span><b>${n.n}</b></span><small>fee ${cryptoFmt(n.fee,asset)} · ${n.eta}</small></div>`).join('')}
      </div>
      <div class="qr-box">
        <img class="qr-img" src="${qr(adminAddr(asset,net.n))}" alt="QR">
        <div class="addr-copy"><code id="tu-addr">${adminAddr(asset,net.n)}</code><button class="btn ghost sm" data-action="copy" data-copy-id="tu-addr">Copy</button></div>
        <small class="muted">Send ${asset} on ${net.n} to top up your card. Preview address — do not send real funds.</small>
      </div>
      <button class="btn primary block mt" id="tu-go">${icon('bolt')} Simulate top-up received</button>`;
    box.querySelector('#tu-assets').onclick=e=>{const o=e.target.closest('.asset-opt');if(!o)return;asset=o.dataset.k;net=enabledNetworks(asset)[0]||NETWORKS[asset][0];render();};
    box.querySelector('#tu-nets').onclick=e=>{const o=e.target.closest('.net-opt');if(!o)return;net=enabledNetworks(asset)[Number(o.dataset.i)];render();};
    box.querySelector('#tu-go').onclick=()=>{
      const usd = asset==='BTC'?300: asset==='ETH'?200: asset==='SOL'?100: 100;
      const credited = usd*(1-FEES.topup);
      c.balance += credited;
      addTx('topup','Card top-up',`${asset} · ${net.n}`, -usd, 'USD');
      addTx('fee','Top-up fee','1%', -usd*FEES.topup, 'USD');
      pushNotif('withdraw','Card topped up',`${moneyRaw(credited)} added to your card.`);
      save(); closeModal(); toast('Card topped up','ok'); refreshAll();
    };
  }
}

/* ----- CARD: REVEAL ----- */
function modalReveal(cid){
  const c=getCard(cid); if(!c) return;
  openModal(head('Card details','Keep these private.') + `
    <div class="mycard ${c.theme}" style="margin-bottom:16px">
      <div class="row-between"><b class="cardbrand">${brand()}</b><span class="badge oncard">${c.type}</span></div>
      <div class="num" style="font-size:17px">${c.number.replace(/(.{4})/g,'$1 ').trim()}</div>
      <div class="row-between" style="font-size:12px;opacity:.9"><span>${c.holder}</span><span>exp ${c.exp} · cvv ${c.cvv}</span></div>
    </div>
    <div class="review-list">
      <div class="summary-line"><span>Card number</span><b id="rv-num">${c.number}</b></div>
      <div class="summary-line"><span>Expiry</span><b>${c.exp}</b></div>
      <div class="summary-line"><span>CVV</span><b>${c.cvv}</b></div>
      ${c.type==='physical'?`<div class="summary-line"><span>PIN</span><b>${c.pin}</b></div>`:''}
    </div>
    <button class="btn ghost block" data-action="copy" data-copy-id="rv-num">Copy card number</button>
    <button class="btn primary block mt-s" data-action="add-wallet" data-id="${c.id}">${icon('phone')} Add to Apple / Google Pay</button>`);
}

/* ----- CARD: LIMITS ----- */
function modalLimits(cid){
  const c=getCard(cid); if(!c) return;
  const max=S.kyc==='verified'?10000:2000;
  openModal('', ()=>{
    box.innerHTML = head('Spending limits',`Daily limit for this ${c.type} card.`) + `
      <label class="fld"><span>Daily limit: <b id="lm-val">${moneyRaw(c.limitDaily)}</b></span>
        <input type="range" id="lm-range" min="100" max="${max}" step="100" value="${Math.min(c.limitDaily,max)}" style="width:100%"></label>
      <div class="row-between muted xs"><span>$100</span><span>${moneyRaw(max)}</span></div>
      <div class="set-row"><div><b>Online payments</b><small>Allow e-commerce & subscriptions</small></div><label class="switch"><input type="checkbox" id="lm-online" checked><span></span></label></div>
      <div class="set-row"><div><b>ATM withdrawals</b><small>${c.type==='physical'?'Cash access at ATMs':'Physical cards only'}</small></div><label class="switch"><input type="checkbox" id="lm-atm" ${c.type==='physical'?'checked':'disabled'}><span></span></label></div>
      <button class="btn primary block mt" id="lm-save">Save limits</button>`;
    const range=box.querySelector('#lm-range'), val=box.querySelector('#lm-val');
    range.oninput=()=>{ val.textContent=moneyRaw(Number(range.value)); };
    box.querySelector('#lm-save').onclick=()=>{ c.limitDaily=Number(range.value); save(); closeModal(); toast('Limits updated','ok'); };
  });
}

/* ----- CARD: MORE ----- */
function modalCardMore(cid){
  const c=getCard(cid); if(!c) return;
  openModal(head('Card options',`•••• ${c.last4} · ${c.type}`) + `
    ${c.type==='physical'?`<div class="set-row"><div><b>View PIN</b><small>4-digit ATM PIN</small></div><button class="btn ghost sm" data-action="card-pin" data-id="${c.id}">Show</button></div>`:''}
    <div class="set-row"><div><b>Add to mobile wallet</b><small>Apple Pay / Google Pay</small></div><button class="btn ghost sm" data-action="add-wallet" data-id="${c.id}">Add</button></div>
    <div class="set-row"><div><b>Replace card</b><small>New number · $10 fee</small></div><button class="btn ghost sm" data-action="replace-card" data-id="${c.id}">Replace</button></div>
    <div class="set-row"><div><b>Cancel card</b><small>Balance returns to USDT</small></div><button class="btn danger sm" data-action="cancel-card" data-id="${c.id}">Cancel</button></div>`);
}
function replaceCard(cid){
  const c=getCard(cid); if(!c) return;
  if((S.assets.USDT||0)<FEES.replace) return toast('Need $10 USDT for replacement fee','err');
  confirmModal('Replace card?', `A new card number will be issued and the old one deactivated. A ${money(FEES.replace,{force:true})} fee applies.`, 'Replace', ()=>{
    S.assets.USDT-=FEES.replace;
    const num=cardNumber(); c.number=num; c.last4=num.slice(-4); c.cvv=String(100+Math.floor(Math.random()*900)); c.exp=expDate(); c.frozen=false;
    addTx('fee','Card replacement','New card issued', -FEES.replace, 'USDT');
    save(); closeModal(); toast('New card issued','ok'); refreshAll();
  });
}
function cancelCard(cid){
  const c=getCard(cid); if(!c) return;
  confirmModal('Cancel this card?', `The remaining ${money(c.balance,{force:true})} balance will be returned to your USDT wallet. This cannot be undone.`, 'Cancel card', ()=>{
    if(c.balance>0){ S.assets.USDT=(S.assets.USDT||0)+c.balance; addTx('refund','Card balance returned',`•••• ${c.last4}`, c.balance,'USDT'); }
    S.cards=S.cards.filter(x=>x.id!==cid);
    save(); closeModal(); toast('Card cancelled','ok'); refreshAll();
  }, true);
}

/* ----- CARD: SIMULATE PURCHASE ----- */
function modalPurchase(cid){
  const c=getCard(cid); if(!c) return;
  const merchants=['Amazon','Netflix','Uber','Steam','Spotify','Apple','Starbucks','Booking.com'];
  openModal('', ()=>{
    box.innerHTML = head('Simulate a purchase',`Test spending on •••• ${c.last4}.`) + `
      <label class="fld"><span>Merchant</span><select class="input" id="pc-merch">${merchants.map(m=>`<option>${m}</option>`).join('')}</select></label>
      <label class="fld"><span>Amount (USD)</span><input class="input" id="pc-amt" type="number" placeholder="0.00"></label>
      <label class="chk"><input type="checkbox" id="pc-foreign"><span>Foreign currency (adds 1.2% FX fee)</span></label>
      <div class="muted xs" style="margin:10px 0 14px">Card balance: ${money(c.balance,{force:true})} · ${c.frozen?'Card is frozen':'Daily limit '+moneyRaw(c.limitDaily)}</div>
      <button class="btn primary block" id="pc-go">Charge card</button>`;
    box.querySelector('#pc-go').onclick=()=>{
      const merchant=box.querySelector('#pc-merch').value;
      const amount=parseFloat(box.querySelector('#pc-amt').value)||0;
      const foreign=box.querySelector('#pc-foreign').checked;
      if(amount<=0) return toast('Enter an amount','err');
      if(c.frozen) return declineP('Card is frozen');
      const fxFee = foreign? amount*FEES.fx : 0;
      const total = amount+fxFee;
      if((c.spentToday||0)+total>c.limitDaily) return declineP('Exceeds daily limit');
      if(total>c.balance) return declineP('Insufficient card balance');
      c.balance-=total; c.spentToday=(c.spentToday||0)+total;
      addTx('purchase',`${merchant}`,`Card payment${foreign?' · FX':''}`, -amount,'USD');
      if(fxFee>0) addTx('fee','Foreign exchange fee','1.2%', -fxFee,'USD');
      if(S.largeAlerts && amount>500) pushNotif('bell','Large payment',`${money(amount,{force:true})} at ${merchant}.`);
      else pushNotif('cart','Card payment',`${money(amount,{force:true})} at ${merchant}.`);
      save();
      box.innerHTML = resultCard('ok','Approved',`${money(amount,{force:true})} paid to ${merchant}.${foreign?' FX fee '+money(fxFee,{force:true})+'.':''}`);
      refreshAll();
    };
    function declineP(reason){ box.innerHTML = resultCard('warn','Declined',reason+'.','<button class="btn ghost block" data-action="modal-close">Close</button>'); }
  });
}

/* ----- KYC ----- */
function startKyc(){
  let step=1, name=S.user.name, nationality='India', docType=DOCS.India[0].name, docNumber='';
  const nations=Object.keys(DOCS).filter(k=>k!=='_default');
  openModal('', ()=>render());
  function render(){
    if(step===1){
      const docs=DOCS[nationality]||DOCS._default;
      if(!docs.find(d=>d.name===docType)) docType=docs[0].name;
      const cur=docs.find(d=>d.name===docType)||docs[0];
      box.innerHTML = onboardBanner() + head('Get your card · verify identity','Step 1 of 2 · Your details') + `
        <label class="fld"><span>Full name (as per document)</span><input class="input" id="k-name" value="${name}"></label>
        <label class="fld"><span>Nationality</span><select class="input" id="k-nat">${nations.map(c=>`<option ${c===nationality?'selected':''}>${c}</option>`).join('')}</select></label>
        <label class="fld"><span>Document type</span><select class="input" id="k-doc">${docs.map(d=>`<option ${d.name===docType?'selected':''}>${d.name}</option>`).join('')}</select></label>
        <label class="fld"><span>${cur.name} number</span><input class="input" id="k-docnum" placeholder="${cur.ph}" value="${docNumber}" autocomplete="off"></label>
        <label class="chk" style="margin:2px 0 14px"><input type="checkbox" id="k-terms"><span>I agree to the Terms &amp; Conditions and Privacy Policy</span></label>
        <button class="btn primary block" id="k-next">Next step</button>
        <p class="muted xs center-txt" style="margin-top:10px">Preview — please don't enter a real ID number.</p>`;
      const grab=()=>{ name=box.querySelector('#k-name').value; docNumber=box.querySelector('#k-docnum').value; };
      box.querySelector('#k-nat').onchange=e=>{ grab(); nationality=e.target.value; const d=DOCS[nationality]||DOCS._default; docType=d[0].name; render(); };
      box.querySelector('#k-doc').onchange=e=>{ grab(); docType=e.target.value; render(); };
      box.querySelector('#k-next').onclick=()=>{
        grab();
        if(!name.trim()) return toast('Enter your full name','err');
        if(!docNumber.trim()) return toast('Enter your '+cur.name+' number','err');
        if(!box.querySelector('#k-terms').checked) return toast('Please accept the Terms & Conditions','err');
        S.user.name=name.trim(); syncSettingsForm();
        step=2; render();
      };
    } else {
      box.innerHTML = onboardBanner() + head('Get your card · verify identity','Step 2 of 2 · Photo') + `
        <p class="muted" style="margin-bottom:10px">Add a photo of your ${docType} and a quick selfie.</p>
        <div class="uploadbox" id="k-upload"><span class="up-ic">${icon('camera')}</span><b>Photo of your ${docType}</b><small class="muted">Tap to capture · nothing is uploaded</small></div>
        <div class="uploadbox mt-s" id="k-selfie"><span class="up-ic">${icon('user')}</span><b>Take a selfie</b><small class="muted">Liveness check</small></div>
        <button class="btn primary block mt" id="k-submit">Submit for verification</button>
        <button class="btn ghost block mt-s" id="k-later">I'll do it later</button>
        <p class="muted xs center-txt" style="margin-top:8px">Skip and pick your card — verify before your first top-up.</p>`;
      const mark=el=>{ el.classList.add('done'); el.querySelector('b').textContent='Captured'; el.querySelector('.up-ic').innerHTML=icon('check'); };
      box.querySelector('#k-upload').onclick=e=>mark(e.currentTarget);
      box.querySelector('#k-selfie').onclick=e=>mark(e.currentTarget);
      box.querySelector('#k-later').onclick=()=>openCardOrder();
      box.querySelector('#k-submit').onclick=()=>{
        box.innerHTML = `<div class="pay-anim center-txt"><div class="pay-ring"></div><h3>Verifying your document…</h3><p class="muted">Checking your ${docType} details</p></div>`;
        setTimeout(()=>{
          S.kyc='pending'; save();
          box.innerHTML=`<div class="center-txt"><div class="result-ic warn">${icon('clock')}</div>
            <h3>Under review</h3><p class="muted" style="margin:8px 0 16px">Usually approved within seconds. You can pick your card in the meantime.</p>
            <button class="btn primary block" id="k-tocard">Continue to cards</button>
            <button class="btn ghost block mt-s" data-action="modal-close">Close</button></div>`;
          box.querySelector('#k-tocard').onclick=()=>openCardOrder();
          refreshAll();
          setTimeout(()=>{ if(S.kyc==='pending'){ S.kyc='verified'; save(); pushNotif('check','Verification approved','Your identity is confirmed.'); toast('Identity verified','ok'); refreshAll(); } }, 3500);
        }, 1600);
      };
    }
  }
}

/* ----- ADD ADDRESS ----- */
function modalAddAddr(){
  openModal(head('Add withdrawal address') + `
    <label class="fld"><span>Label</span><input class="input" id="na-label" placeholder="My Ledger"></label>
    <label class="fld"><span>Asset</span><select class="input" id="na-asset">${Object.keys(COIN).map(k=>`<option>${k}</option>`).join('')}</select></label>
    <label class="fld"><span>Network</span><select class="input" id="na-net"></select></label>
    <label class="fld"><span>Address</span><input class="input" id="na-addr" placeholder="Paste wallet address"></label>
    <button class="btn primary block" id="na-save">Save address</button>`, ()=>{
    const asset=box.querySelector('#na-asset'), net=box.querySelector('#na-net');
    const fill=()=>{ net.innerHTML=NETWORKS[asset.value].map(n=>`<option>${n.n}</option>`).join(''); };
    fill(); asset.onchange=fill;
    box.querySelector('#na-save').onclick=()=>{
      const label=box.querySelector('#na-label').value.trim(), address=box.querySelector('#na-addr').value.trim();
      if(!label||!address) return toast('Fill in all fields','err');
      S.addresses.push({ id:id(), label, asset:asset.value, network:net.value, address });
      save(); closeModal(); toast('Address saved','ok'); renderAddresses();
    };
  });
}

/* ----- ADMIN: ADD DEPOSIT COIN ----- */
function modalAddDepo(){
  openModal(head('Add deposit coin','New coin / network for deposits.') + `
    <label class="fld"><span>Coin</span><select class="input" id="ad-asset">${Object.keys(COIN).map(k=>`<option>${k}</option>`).join('')}</select></label>
    <label class="fld"><span>Network</span><input class="input" id="ad-net" placeholder="TRC20 / ERC20 / BEP20 / Solana…"></label>
    <label class="fld"><span>Deposit address (optional)</span><input class="input code-input" id="ad-addr" placeholder="Leave blank for a placeholder"></label>
    <button class="btn primary block" id="ad-save">Add coin</button>`, ()=>{
    box.querySelector('#ad-save').onclick=()=>{
      const asset=box.querySelector('#ad-asset').value, network=box.querySelector('#ad-net').value.trim()||'Network', address=box.querySelector('#ad-addr').value.trim();
      S.admin.deposits.push({asset,network,address,enabled:false});
      save(); closeModal(); toast('Coin added','ok'); renderAdmin();
    };
  });
}

/* ----- CHANGE PASSWORD ----- */
function modalChangePass(){
  openModal(head('Change password') + `
    <label class="fld"><span>Current password</span><input class="input" type="password" placeholder="••••••••"></label>
    <label class="fld"><span>New password</span><input class="input" id="cp-new" type="password" placeholder="8+ characters"></label>
    <label class="fld"><span>Confirm new password</span><input class="input" id="cp-conf" type="password" placeholder="Repeat"></label>
    <button class="btn primary block" id="cp-save">Update password</button>`, ()=>{
    box.querySelector('#cp-save').onclick=()=>{
      const n=box.querySelector('#cp-new').value, c=box.querySelector('#cp-conf').value;
      if(n.length<8) return toast('Password too short','err');
      if(n!==c) return toast('Passwords do not match','err');
      closeModal(); toast('Password updated','ok');
      if(S.prefs.sec) pushNotif('lock','Password changed','Your password was updated just now.');
    };
  });
}

/* ----- 2FA SETUP ----- */
function modal2FA(enable){
  if(!enable){ S.twofa=false; save(); syncSettingsForm(); toast('Two-factor disabled'); return; }
  const secret='JBSWY3DPEHPK3PXP';
  openModal(head('Enable two-factor auth','Scan with Google Authenticator, Authy, etc.') + `
    <div class="qr-box"><img class="qr-img" src="${qr('otpauth://'+secret)}" alt="2FA QR"><div class="addr-copy"><code>${secret}</code><button class="btn ghost sm" data-action="copy-text" data-text="${secret}">Copy</button></div></div>
    <label class="fld mt"><span>Enter 6-digit code to confirm</span><input class="input pinput" id="tfa-code" maxlength="6" placeholder="000000"></label>
    <button class="btn primary block" id="tfa-confirm">Enable 2FA</button>`, ()=>{
    box.querySelector('#tfa-confirm').onclick=()=>{
      const c=box.querySelector('#tfa-code').value;
      if(!/^\d{6}$/.test(c)) return toast('Enter the 6-digit code','err');
      S.twofa=true; save(); closeModal(); syncSettingsForm(); toast('Two-factor enabled','ok');
      if(S.prefs.sec) pushNotif('lock','2FA enabled','Two-factor authentication is now protecting your account.');
    };
  });
  document.getElementById('tg-2fa').checked = false;
}

/* ----- CONFIRM DIALOG ----- */
function confirmModal(title, body, confirmLabel, onYes, danger){
  openModal(head(title) + `<p class="muted" style="margin-bottom:18px">${body}</p>
    <div class="chips"><button class="btn ghost" data-action="modal-close" style="flex:1">Cancel</button>
    <button class="btn ${danger?'danger':'primary'}" id="cf-yes" style="flex:2">${confirmLabel}</button></div>`, ()=>{
    box.querySelector('#cf-yes').onclick=onYes;
  });
}

/* ----- LEGAL ----- */
function modalLegal(){
  openModal(head('Terms & Privacy') + `
    <div style="max-height:50vh;overflow:auto;font-size:14px;color:var(--ink2);line-height:1.6">
      <p><b>This is a preview build under development.</b> CrimsonPay is not yet a licensed financial institution, is not affiliated with any real company, and processes no real money, cryptocurrency, or personal data. Card issuance goes live only after a licensed issuing partner is connected.</p>
      <p style="margin-top:10px">All balances, addresses, card numbers and transactions shown are generated locally in your browser and stored only in this browser's localStorage. Nothing is transmitted to any server.</p>
      <p style="margin-top:10px">Do not enter real passwords, real crypto wallet keys, real card numbers, or any genuinely sensitive information.</p>
      <p style="margin-top:10px">Use the "Reset data" option any time to clear everything.</p>
    </div>
    <button class="btn primary block mt" data-action="modal-close">Close</button>`);
}

/* ================= NOTIFICATIONS ================= */
function pushNotif(ic,title,body){
  S.notifs.unshift(notif(ic,title,body,false));
  if(S.notifs.length>30) S.notifs.length=30;
  updateBell();
}
function updateBell(){
  const n=S.notifs.filter(x=>!x.read).length;
  const b=document.getElementById('bell-badge');
  b.textContent=n; b.classList.toggle('hidden', n===0);
}
function openDrawer(){
  const list=document.getElementById('notif-list');
  list.innerHTML = S.notifs.map(n=>`
    <div class="notif-item ${n.read?'':'unread'}">
      <div class="notif-ic">${icon(ICONS[n.ic]?n.ic:'bell')}</div>
      <div><b>${n.title}</b><small>${n.body}</small><div class="notif-time">${timeAgo(n.ts)}</div></div>
    </div>`).join('') || '<p class="muted">No notifications.</p>';
  document.getElementById('drawer').classList.remove('hidden');
  document.getElementById('drawer-overlay').classList.remove('hidden');
}
function closeDrawer(){ document.getElementById('drawer').classList.add('hidden'); document.getElementById('drawer-overlay').classList.add('hidden'); }

/* ================= THEME ================= */
function applyTheme(){
  document.documentElement.dataset.theme=S.theme;
  const dark=S.theme==='dark';
  const ic=document.getElementById('theme-ic'), lb=document.getElementById('theme-label');
  if(ic) ic.innerHTML=icon(dark?'sun':'moon');
  if(lb) lb.textContent=dark?'Light mode':'Dark mode';
}
function setTheme(t){ S.theme=t; save(); applyTheme(); syncTheme(); }

/* ================= TOAST ================= */
function toast(msg,kind){
  const wrap=document.getElementById('toasts');
  const el=document.createElement('div');
  el.className='toast '+(kind||'');
  el.innerHTML=(kind==='ok'?icon('check'):kind==='err'?icon('info'):'')+`<span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(10px)'; setTimeout(()=>el.remove(),300); }, 2600);
}

/* ================= CSV / EXPORT ================= */
function exportCsv(){
  const rows=[['Date','Type','Title','Detail','Asset','Amount (USD)']];
  S.txs.slice().sort((a,b)=>b.ts-a.ts).forEach(t=>rows.push([new Date(t.ts).toISOString(),t.type,t.title,t.sub,t.asset||'',t.noamt?'':t.amount]));
  const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  downloadBlob(csv,'crimsonpay-transactions.csv','text/csv');
  toast('CSV downloaded','ok');
}
function exportData(){
  downloadBlob(JSON.stringify(S,null,2),'crimsonpay-data.json','application/json');
  toast('Data exported','ok');
}
function downloadBlob(content,name,type){
  const blob=new Blob([content],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

/* ================= COPY ================= */
function copyText(text){
  if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(()=>toast('Copied','ok'),()=>fallback()); }
  else fallback();
  function fallback(){ const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');toast('Copied','ok');}catch(e){toast('Copy failed','err');} ta.remove(); }
}

/* ================= refresh helper ================= */
function refreshAll(){
  const active=document.querySelector('.panel.active');
  if(active){ const name=active.id.replace('panel-',''); const R={dashboard:renderDashboard,cards:renderCards,txs:renderTxs,fees:renderFees,referral:renderReferral}[name]; if(R) R(); }
  updateBell();
  const cur=document.querySelector('.setnav-item.active'); if(cur && bodyEl.dataset.view==='app') showSetTab(cur.dataset.tab);
}

/* ================= AUTH ================= */
function switchAuthTab(tab){
  document.querySelectorAll('#auth-tabs .tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
  document.getElementById('form-signin').classList.toggle('hidden', tab!=='signin');
  document.getElementById('form-signup').classList.toggle('hidden', tab!=='signup');
}
function doLogin(){
  const email=document.getElementById('si-email').value.trim();
  S.user.email = email || S.user.email || 'you@crimsonpay.app';
  S.onboarded=true; save();
  showLoader('Signing you in…','Loading your account');
  setTimeout(()=>{ hideLoader(); gotoApp(true); toast('Welcome back','ok'); }, 1200);
}
function doSignup(){
  const name=document.getElementById('su-name').value.trim();
  const email=document.getElementById('su-email').value.trim();
  if(!name) return toast('Enter your name','err');
  if(!document.getElementById('su-terms').checked) return toast('Please accept the terms','err');
  S.user.name=name; S.user.email=email||'you@crimsonpay.app'; S.onboarded=true; S.refCode=name.slice(0,4).toUpperCase().padEnd(4,'X')+Math.floor(1000+Math.random()*9000);
  save();
  showLoader('Creating your account…','Setting up your wallet');
  setTimeout(()=>{ hideLoader(); gotoApp(true); toast('Account created','ok'); }, 1500);
}
function demoLogin(){
  S.user.email=S.user.email||'you@crimsonpay.app'; S.onboarded=true; save(); gotoApp(); toast('Account loaded','ok');
}
/* pre-populated test account for workflow checks (?test=1) */
function testAccount(){
  const s=seed();
  s.onboarded=true; s.kyc='verified';
  s.user={ name:'Test User', email:'test@crimsonpay.app', phone:'+91 90000 00000' };
  s.assets={ BTC:0.008, ETH:0.35, SOL:4, USDT:640.5, USDC:120 };
  s.addresses=[ { id:id(), label:'My Ledger', asset:'USDT', network:'TRC20', address:'TQn9Y2khDkU8wZv3q7Jd6mP4rWx1aBcE5f' } ];
  const num=cardNumber();
  s.cards=[ { id:id(), type:'virtual', theme:'ruby', holder:'TEST USER', number:num, last4:num.slice(-4),
    exp:expDate(), cvv:String(100+Math.floor(Math.random()*900)), pin:String(1000+Math.floor(Math.random()*9000)),
    balance:180, frozen:false, spentToday:45, shipStage:0, limitDaily:10000, status:'active' } ];
  s.txs=[
    tx('deposit','Deposit · USDT','TRC20 network', +500, 'USDT', -5),
    tx('deposit','Deposit · ETH','ERC20 network', +1225, 'ETH', -4),
    tx('topup','Card top-up','from USDT', -100, 'USDT', -3),
    tx('fee','Top-up fee','1%', -1, 'USDT', -3),
    tx('purchase','Netflix','Card payment', -15, 'USD', -2),
    tx('purchase','Amazon','Card payment', -30, 'USD', -1),
    tx('fee','Virtual Card issuance','One-time card fee', -10, 'USDT', -6),
  ];
  s.referrals=[ { name:'Jordan P.', status:'verified', reward:5 }, { name:'Sam K.', status:'pending', reward:0 } ];
  s.notifs=[ notif('spark','Welcome to CrimsonPay','Test account ready — explore the full workflow.', false) ];
  s.refCode='TEST'+Math.floor(1000+Math.random()*9000);
  return s;
}

/* ================= EVENT DELEGATION ================= */
document.addEventListener('click', e=>{
  const t=e.target.closest('[data-action]'); if(!t) return;
  const a=t.dataset.action;
  const cid=t.dataset.id;
  switch(a){
    case 'goto-auth': setView('auth'); switchAuthTab(t.dataset.mode==='signup'?'signup':'signin'); if(t.dataset.mode==='demo'){ demoLogin(); } break;
    case 'goto-landing': setView('landing'); break;
    case 'auth-tab': switchAuthTab(t.dataset.tab); break;
    case 'login': doLogin(); break;
    case 'signup': doSignup(); break;
    case 'demo-login': demoLogin(); break;
    case 'forgot': toast('Password reset isn\'t available in this preview'); break;
    case 'logout': confirmModal('Log out?','You can sign back in any time — your data stays on this device.','Log out',()=>{ closeModal(); setView('landing'); toast('Logged out'); }); break;
    case 'panel': showPanel(t.dataset.panel); break;
    case 'settab': showSetTab(t.dataset.tab); break;

    case 'theme-toggle': setTheme(S.theme==='dark'?'light':'dark'); break;
    case 'theme-set': setTheme(t.dataset.theme); break;

    case 'open-deposit': modalDeposit(); break;
    case 'open-withdraw': modalWithdraw(); break;
    case 'open-convert': modalConvert(); break;
    case 'open-send': modalSend(); break;
    case 'sim-deposit': simDeposit(t.dataset.asset); break;
    case 'toggle-bal': S.balanceHidden=!S.balanceHidden; save(); renderDashboard(); break;

    case 'apply-card': applyCard(); break;
    case 'topup-card': modalTopup(cid); break;
    case 'reveal-card': modalReveal(cid); break;
    case 'freeze-card': { const c=getCard(cid); if(c){ c.frozen=!c.frozen; save(); toast(c.frozen?'Card frozen':'Card unfrozen'); refreshAll(); } } break;
    case 'card-limits': modalLimits(cid); break;
    case 'card-more': modalCardMore(cid); break;
    case 'card-atm': modalAtm(cid); break;
    case 'ship-advance': advanceShip(cid); break;
    case 'simulate-purchase': modalPurchase(cid); break;
    case 'replace-card': replaceCard(cid); break;
    case 'cancel-card': cancelCard(cid); break;
    case 'card-pin': { const c=getCard(cid); if(c) openModal(head('Card PIN') + `<div class="center-txt"><div class="pin-big">${c.pin}</div><p class="muted">Your 4-digit ATM PIN. Keep it secret.</p><button class="btn primary block mt" data-action="modal-close">Close</button></div>`); } break;
    case 'add-wallet': closeModal(); toast('Added to mobile wallet','ok'); break;

    case 'start-kyc': startKyc(); break;

    case 'tx-filter': txFilter=t.dataset.f; document.querySelectorAll('#tx-filters .chip').forEach(c=>c.classList.toggle('active',c.dataset.f===txFilter)); renderTxs(); break;
    case 'tx-csv': exportCsv(); break;

    case 'copy': { const el=document.getElementById(t.dataset.copyId); if(el) copyText(el.textContent.trim()); } break;
    case 'copy-text': copyText(t.dataset.text); break;

    case 'save-profile': S.user.name=document.getElementById('p-name').value||S.user.name; S.user.email=document.getElementById('p-email').value; S.user.phone=document.getElementById('p-phone').value; save(); syncSettingsForm(); toast('Profile saved','ok'); break;
    case 'avatar-change': toast('Avatar uses your initial for now'); break;
    case 'change-pass': modalChangePass(); break;
    case 'passkey-add': S.passkey=true; save(); toast('Passkey added','ok'); if(S.prefs.sec) pushNotif('key','Passkey added','A new passkey can now sign you in.'); break;
    case 'revoke-session': S.sessions=S.sessions.filter(s=>s.id!==cid); save(); renderSessions(); toast('Signed out of device','ok'); break;
    case 'addr-add': modalAddAddr(); break;
    case 'addr-del': confirmModal('Remove address?','This saved address will be deleted.','Remove',()=>{ S.addresses=S.addresses.filter(x=>x.id!==cid); save(); closeModal(); renderAddresses(); toast('Address removed'); },true); break;
    case 'export-data': exportData(); break;
    case 'legal': modalLegal(); break;
    case 'reset-demo': confirmModal('Reset data?','All balances, cards, transactions and settings return to defaults.','Reset',()=>{ localStorage.removeItem(KEY); S=seed(); S.onboarded=true; S.user.email='you@crimsonpay.app'; save(); applyTheme(); syncSettingsForm(); closeModal(); showPanel('dashboard'); toast('Data reset','ok'); },true); break;
    case 'close-account': confirmModal('Close account?','This erases your entire account from this browser.','Close account',()=>{ localStorage.removeItem(KEY); S=seed(); closeModal(); setView('landing'); toast('Account closed'); },true); break;

    case 'support-send': { const msg=document.getElementById('sup-msg'); if(!msg.value.trim()) return toast('Write a message first','err'); msg.value=''; toast('Message sent — we\'ll reply shortly','ok'); pushNotif('chat','Support ticket created','Thanks! Our team will get back to you shortly.'); } break;

    case 'admin-exit': S.adminMode=false; save(); applyAdminMode(); showSetTab('profile'); toast('Admin mode off — Revenue model hidden'); break;
    case 'admin-tab': adminTab=t.dataset.tab; renderAdmin(); break;
    case 'admin-block': {
      if(cid==='me'){ const blk=!adminBlockedAny(); S.cards.forEach(c=>c.frozen=blk); save(); toast(blk?'User cards blocked':'User cards unblocked'); }
      else { const u=ADMIN_SAMPLE.find(x=>x.id===cid); if(u){ u.blocked=!u.blocked; toast(u.blocked?`${u.name} blocked`:`${u.name} unblocked`); } }
      renderAdmin(); refreshAll();
    } break;
    case 'admin-send-notif': {
      const ti=document.getElementById('an-title'), ms=document.getElementById('an-msg');
      if(!ti.value.trim()||!ms.value.trim()) return toast('Enter a title and message','err');
      pushNotif('gift', ti.value.trim(), ms.value.trim()); ti.value=''; ms.value='';
      toast('Notification sent to users','ok');
    } break;
    case 'admin-save-pixel': { const px=document.getElementById('mk-pixel'); S.admin.pixel=px.value; save(); document.getElementById('mk-pixel-status').innerHTML=S.admin.pixel?`<div class="pixel-status">${icon('check')} Pixel installed · activates on live site</div>`:''; toast(S.admin.pixel?'Pixel saved (activates on live server)':'Pixel cleared','ok'); } break;
    case 'admin-save-api': { S.admin.api=document.getElementById('mk-api').value.trim(); save(); toast(S.admin.api?'Server endpoint saved':'Endpoint cleared','ok'); } break;
    case 'admin-export': exportCsv(); break;
    case 'admin-depo-save': {
      document.querySelectorAll('.dep-addr').forEach(inp=>{ const i=+inp.dataset.i; if(S.admin.deposits[i]) S.admin.deposits[i].address=inp.value.trim(); });
      document.querySelectorAll('.dep-en').forEach(cb=>{ const i=+cb.dataset.i; if(S.admin.deposits[i]) S.admin.deposits[i].enabled=cb.checked; });
      save(); toast('Deposit settings saved','ok'); renderAdmin();
    } break;
    case 'admin-depo-del': { const i=+t.dataset.i; S.admin.deposits.splice(i,1); save(); toast('Coin removed'); renderAdmin(); } break;
    case 'admin-depo-add': modalAddDepo(); break;

    case 'notif-open': openDrawer(); break;
    case 'notif-close': closeDrawer(); break;
    case 'notif-readall': S.notifs.forEach(n=>n.read=true); save(); updateBell(); openDrawer(); break;

    case 'modal-close': closeModal(); break;
  }
});

/* change / input listeners */
document.addEventListener('change', e=>{
  const el=e.target;
  if(el.id==='tg-2fa'){ modal2FA(el.checked); }
  else if(el.id==='tg-notif-tx'){ S.prefs.tx=el.checked; save(); }
  else if(el.id==='tg-notif-sec'){ S.prefs.sec=el.checked; save(); }
  else if(el.id==='tg-notif-news'){ S.prefs.news=el.checked; save(); }
  else if(el.id==='tg-autotopup'){ S.autoTopup=el.checked; save(); toast(el.checked?'Auto top-up on':'Auto top-up off'); }
  else if(el.id==='tg-alerts'){ S.largeAlerts=el.checked; save(); }
  else if(el.id==='sel-currency'){ S.currency=el.value; save(); refreshAll(); const ls=document.getElementById('ln-currency'); if(ls) ls.value=el.value; toast('Currency: '+el.value); }
  else if(el.id==='ln-currency'){ S.currency=el.value; save(); const ss=document.getElementById('sel-currency'); if(ss) ss.value=el.value; }
  else if(el.id==='sel-language'){ S.language=el.value; save(); toast('Language updated (English text shown)'); }
  else if(el.id==='sel-topup-asset'){ S.topupAsset=el.value; save(); }
});
document.addEventListener('input', e=>{
  if(e.target.id==='fee-calc') updateFeeCalc();
  if(e.target.id==='tx-search'){ txQuery=e.target.value; renderTxs(); }
  if(e.target.id && e.target.id.indexOf('biz-')===0) renderBusiness();
});

/* ================= INIT ================= */
function injectStaticIcons(){
  document.querySelectorAll('[data-icon]').forEach(el=>{ el.innerHTML = icon(el.dataset.icon); });
}
function injectDefs(){
  if(document.getElementById('cp-defs')) return;
  const wrap=document.createElement('div');
  wrap.id='cp-defs';
  wrap.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  wrap.setAttribute('aria-hidden','true');
  wrap.innerHTML='<svg width="0" height="0"><defs><linearGradient id="cpSol" x1="2" y1="22" x2="26" y2="8" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#9945ff"/><stop offset="1" stop-color="#14f195"/></linearGradient></defs></svg>';
  document.body.appendChild(wrap);
}
load();
let __enterApp=false;
try{
  const params=new URLSearchParams(location.search);
  if(params.has('test')){ S=testAccount(); save(); __enterApp=true; }
  if(params.has('admin')){ S.adminMode = params.get('admin')!=='0'; save(); }
}catch(e){}
injectDefs();
applyTheme();
applyAdminMode();
injectStaticIcons();
if(__enterApp) gotoApp(true);
})();
