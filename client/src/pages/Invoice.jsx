import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const MOBILE_CSS = `
  @media (max-width: 768px) {
    .ca-sidebar { display: none !important; }
    .ca-bottom-nav { display: flex !important; }
    .ca-main-scroll { padding-bottom: 72px !important; }
    .ca-header-name { display: none !important; }
    .ca-inv-body { padding: 12px !important; }
    .ca-inv-header-pad { padding: 16px 14px 12px !important; }
    .ca-inv-section { padding: 12px 14px !important; }
    .ca-inv-table-pad { padding: 0 14px 8px !important; }
    .ca-inv-totals { padding: 0 14px 16px !important; }
    .ca-inv-words { margin: 0 14px 20px !important; }
    .ca-filter-row { flex-wrap: wrap !important; }
    .ca-filter-btns { flex-wrap: wrap !important; }
  }
  @media (max-width: 520px) {
    .ca-header { padding: 0 12px !important; }
    .ca-sum-grid { grid-template-columns: 1fr 1fr !important; }
    .ca-view-actions button { padding: 6px 10px !important; font-size: 11px !important; }
    .ca-view-topbar-title { display: none; }
  }
  .ca-bottom-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: #0f172a;
    height: 60px;
    z-index: 300;
    border-top: 1px solid #1e3a5f;
    overflow: hidden;
  }
  .ca-bnscroll {
    display: flex; width: 100%; height: 100%;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; padding: 0 4px; align-items: center;
  }
  .ca-bnscroll::-webkit-scrollbar { display: none; }
  .ca-bn-item {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2px; padding: 0 10px; border: none; background: none; cursor: pointer;
    color: #94a3b8; font-family: 'Segoe UI', sans-serif;
    min-width: 50px; flex-shrink: 0; position: relative; height: 100%;
  }
  .ca-bn-item.active { color: #3b82f6; }
  .ca-bn-item > span { font-size: 9px; font-weight: 600; white-space: nowrap; }
`;

const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const IC = {
  dash:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  works:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  clients:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  finance:"M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  add:"M12 5v14M5 12h14",
  attend:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87",
  cal:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  reimb:"M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  invoice:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  settings:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  plus:"M12 5v14M5 12h14",
  close:"M18 6L6 18M6 6l12 12",
  download:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  check:"M20 6L9 17l-5-5",
  whatsapp:"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  trash:"M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2",
};

const NAV_ITEMS = [
  {key:"dash",label:"Dash",icon:IC.dash},{key:"works",label:"Works",icon:IC.works},
  {key:"clients",label:"Clients",icon:IC.clients},{key:"finance",label:"Finance",icon:IC.finance},
  {key:"add",label:"Add",icon:IC.add},{key:"attend",label:"Attend",icon:IC.attend},
  {key:"cal",label:"Cal",icon:IC.cal},{key:"reimb",label:"Reimb",icon:IC.reimb},
  {key:"invoice",label:"Invoice",icon:IC.invoice},{key:"settings",label:"Settings",icon:IC.settings},
];
const ROUTES = {
  dash:"/dashboard",works:"/works",clients:"/clients",finance:"/finance",
  add:"/add-client",attend:"/attendance",cal:"/cal",
  reimb:"/reimbursement",invoice:"/invoice",settings:"/settings",
};

function Sidebar({ activeKey, onNav }) {
  return (
    <aside className="ca-sidebar" style={{width:72,background:"#0f172a",display:"flex",flexDirection:"column",alignItems:"center",padding:"12px 0",gap:2,flexShrink:0,overflowY:"auto"}}>
      {NAV_ITEMS.map(n=>(
        <button key={n.key} onClick={()=>onNav(n.key)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"9px 0",border:"none",background:"none",cursor:"pointer",width:"100%",position:"relative",color:n.key===activeKey?"#3b82f6":"#94a3b8",fontFamily:"'Segoe UI',sans-serif"}}>
          <Icon d={n.icon} size={21} stroke={n.key===activeKey?"#3b82f6":"#94a3b8"}/>
          <span style={{fontSize:10,fontWeight:600}}>{n.label}</span>
          {n.key===activeKey&&<div style={{position:"absolute",left:0,top:"15%",height:"70%",width:3,borderRadius:"0 3px 3px 0",background:"#3b82f6"}}/>}
        </button>
      ))}
    </aside>
  );
}

function BottomNav({ activeKey, onNav }) {
  return (
    <nav className="ca-bottom-nav">
      <div className="ca-bnscroll">
        {NAV_ITEMS.map(n=>(
          <button key={n.key} className={`ca-bn-item ${n.key===activeKey?"active":""}`} onClick={()=>onNav(n.key)}>
            <Icon d={n.icon} size={20} stroke={n.key===activeKey?"#3b82f6":"#94a3b8"}/>
            <span>{n.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

const STATUS_COLOR = {
  "Pending":{bg:"#fef3c7",text:"#d97706",border:"#fcd34d"},
  "Paid":{bg:"#d1fae5",text:"#059669",border:"#6ee7b7"},
  "Partial":{bg:"#dbeafe",text:"#2563eb",border:"#93c5fd"},
};

function fmtINR(n){return Number(n||0).toLocaleString("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});}

function n2w(n){
  n=Math.round(Number(n||0));if(!n)return"Zero";
  const ones=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if(n<20)return ones[n];if(n<100)return tens[Math.floor(n/10)]+(n%10?" "+ones[n%10]:"");
  if(n<1000)return ones[Math.floor(n/100)]+" Hundred"+(n%100?" "+n2w(n%100):"");
  if(n<100000)return n2w(Math.floor(n/1000))+" Thousand"+(n%1000?" "+n2w(n%1000):"");
  if(n<10000000)return n2w(Math.floor(n/100000))+" Lakh"+(n%100000?" "+n2w(n%100000):"");
  return n2w(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+n2w(n%10000000):"");
}

function printInvoice(inv,settings){
  const subtotal=(inv.items||[]).reduce((s,i)=>s+Number(i.amount||0),0);
  const gstTotal=(inv.items||[]).reduce((s,i)=>s+(Number(i.amount||0)*Number(i.gst||0)/100),0);
  const total=subtotal+gstTotal;
  const html=`<!DOCTYPE html><html><head><title>Invoice ${inv.invoiceNo}</title><style>body{font-family:'Segoe UI',sans-serif;margin:0;padding:32px;color:#1e293b;font-size:13px;}*{box-sizing:border-box;}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #e2e8f0;}.firm-name{font-size:22px;font-weight:800;color:#0f172a;}.firm-sub{font-size:12px;color:#64748b;margin-top:4px;}.inv-badge{background:#fef3c7;color:#d97706;font-size:11px;font-weight:800;padding:5px 14px;border-radius:6px;display:inline-block;margin-bottom:10px;}.inv-grid{display:grid;grid-template-columns:auto auto;gap:3px 16px;font-size:12px;}.inv-grid .lbl{color:#94a3b8;font-weight:600;}.inv-grid .val{color:#1e293b;font-weight:700;}.section{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}.box{background:#f8fafc;border-radius:10px;padding:16px 18px;}.box-title{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;}.client-name{font-size:16px;font-weight:800;color:#0f172a;margin-bottom:4px;}.client-detail{font-size:12px;color:#64748b;margin-bottom:2px;}.svc-row{display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px;}table{width:100%;border-collapse:collapse;margin-bottom:20px;}th{padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;background:#f8fafc;border-bottom:1px solid #e2e8f0;}th.r,td.r{text-align:right;}td{padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;}.totals{display:flex;justify-content:flex-end;margin-bottom:20px;}.totals-box{width:280px;}.t-row{display:flex;justify-content:space-between;padding:7px 14px;font-size:13px;color:#64748b;}.t-total{display:flex;justify-content:space-between;padding:12px 14px;background:#0f172a;border-radius:8px;font-size:15px;font-weight:800;color:#fff;margin-top:4px;}.words{background:#f8fafc;border:1px dashed #e2e8f0;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:12px;}@media print{body{padding:0 16px;}}</style></head><body>
<div class="header"><div><div class="firm-name">${settings.firmName||"CA Office"}</div><div class="firm-sub">${settings.firmAddress||"Tamil Nadu, India"}</div>${settings.firmGST?`<div class="firm-sub">GSTIN: ${settings.firmGST}</div>`:""}</div><div style="text-align:right"><div class="inv-badge">TAX INVOICE</div><div class="inv-grid"><span class="lbl">INVOICE NO.</span><span class="val">${inv.invoiceNo}</span><span class="lbl">DATE</span><span class="val">${inv.invoiceDate||""}</span><span class="lbl">DUE DATE</span><span class="val">${inv.dueDate||""}</span></div></div></div>
<div class="section"><div class="box"><div class="box-title">Bill To</div><div class="client-name">${inv.clientName}</div>${inv.clientPan?`<div class="client-detail">PAN: ${inv.clientPan}</div>`:""} ${inv.clientContact?`<div class="client-detail">Contact: ${inv.clientContact}</div>`:""} ${inv.clientAddress?`<div class="client-detail">${inv.clientAddress}</div>`:""}</div><div class="box"><div class="box-title">Payment Details</div>${settings.bankName?`<div class="svc-row"><span>Bank:</span><span>${settings.bankName}</span></div>`:""} ${settings.accountNo?`<div class="svc-row"><span>Account:</span><span>${settings.accountNo}</span></div>`:""} ${settings.ifsc?`<div class="svc-row"><span>IFSC:</span><span>${settings.ifsc}</span></div>`:""} ${settings.upiId?`<div class="svc-row"><span>UPI:</span><span>${settings.upiId}</span></div>`:""}</div></div>
<table><thead><tr><th style="width:40px">S.No</th><th>Description</th><th>Period</th><th class="r">Amount (₹)</th><th class="r">GST %</th><th class="r">GST (₹)</th><th class="r">Total (₹)</th></tr></thead><tbody>${(inv.items||[]).map((item,i)=>{const g=Number(item.amount||0)*Number(item.gst||0)/100;return`<tr><td style="color:#94a3b8;font-weight:600">${i+1}</td><td><div style="font-weight:700;color:#1e293b">${item.description}</div>${item.notes?`<div style="font-size:11px;color:#94a3b8;margin-top:2px">${item.notes}</div>`:""}</td><td style="font-size:12px;color:#64748b">${item.period||""}</td><td class="r" style="font-weight:600">${fmtINR(item.amount)}</td><td class="r" style="color:#64748b">${item.gst||0}%</td><td class="r">${fmtINR(g)}</td><td class="r" style="font-weight:700">${fmtINR(Number(item.amount||0)+g)}</td></tr>`;}).join("")}</tbody></table>
<div class="totals"><div class="totals-box"><div class="t-row"><span>Subtotal</span><span>${fmtINR(subtotal)}</span></div><div class="t-row"><span>GST</span><span>${fmtINR(gstTotal)}</span></div><div class="t-total"><span>Total Amount</span><span>${fmtINR(total)}</span></div></div></div>
<div class="words"><span style="font-weight:600;color:#64748b">Amount in Words: </span><span style="font-style:italic;color:#1e293b">${n2w(total)} Rupees Only</span></div>
<div style="font-size:11px;color:#94a3b8;text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;">Thank you for your business! Payment due within 15 days.</div>
</body></html>`;
  const w=window.open("","_blank","width=900,height=700");w.document.write(html);w.document.close();setTimeout(()=>w.print(),600);
}

function InvoiceViewPage({inv,settings,onBack,onMarkPaid,onSendWhatsApp}){
  const subtotal=(inv.items||[]).reduce((s,i)=>s+Number(i.amount||0),0);
  const gstTotal=(inv.items||[]).reduce((s,i)=>s+(Number(i.amount||0)*Number(i.gst||0)/100),0);
  const total=subtotal+gstTotal;
  return(
    <div className="ca-main-scroll" style={{flex:1,overflowY:"auto",background:"#f1f5f9"}}>
      <div className="ca-header" style={{background:"#0f172a",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:"#7ab8f5",cursor:"pointer",fontSize:14,fontFamily:"'Segoe UI',sans-serif",flexShrink:0}}>← Back</button>
          <span className="ca-view-topbar-title" style={{color:"#fff",fontWeight:700,fontSize:14}}>#{inv.invoiceNo}</span>
          <span style={{background:STATUS_COLOR[inv.status]?.bg||"#fef3c7",color:STATUS_COLOR[inv.status]?.text||"#d97706",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,flexShrink:0}}>{inv.status}</span>
        </div>
        <div className="ca-view-actions" style={{display:"flex",gap:6}}>
          {inv.clientContact&&(<button onClick={onSendWhatsApp} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",background:"#25D366",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif",whiteSpace:"nowrap"}}><Icon d={IC.whatsapp} size={14} stroke="none" fill="#fff"/> WA</button>)}
          <button onClick={()=>printInvoice(inv,settings)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",background:"#3b82f6",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif",whiteSpace:"nowrap"}}><Icon d={IC.download} size={14} stroke="#fff"/> PDF</button>
          {inv.status!=="Paid"&&(<button onClick={onMarkPaid} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",background:"#10b981",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif",whiteSpace:"nowrap"}}><Icon d={IC.check} size={14} stroke="#fff" sw={2.5}/> Paid</button>)}
        </div>
      </div>
      <div className="ca-inv-body" style={{maxWidth:820,margin:"0 auto",padding:"20px 16px"}}>
        <div style={{background:"#fff",borderRadius:16,boxShadow:"0 4px 24px rgba(0,0,0,0.08)",overflow:"hidden"}}>
          <div className="ca-inv-header-pad" style={{display:"flex",flexWrap:"wrap",gap:16,justifyContent:"space-between",alignItems:"flex-start",padding:"24px 28px 20px",borderBottom:"2px solid #e2e8f0"}}>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:"#0f172a",marginBottom:3}}>{settings.firmName||"CA Office"}</div>
              <div style={{fontSize:12,color:"#64748b"}}>{settings.firmAddress||"Tamil Nadu, India"}</div>
              {settings.firmGST&&<div style={{fontSize:12,color:"#64748b"}}>GSTIN: {settings.firmGST}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{background:"#fef3c7",color:"#d97706",fontSize:11,fontWeight:800,padding:"5px 14px",borderRadius:6,display:"inline-block",marginBottom:10}}>TAX INVOICE</div>
              <div style={{display:"grid",gridTemplateColumns:"auto auto",gap:"3px 16px",fontSize:12}}>
                <span style={{color:"#94a3b8",fontWeight:600}}>INVOICE NO.</span><span style={{color:"#1e293b",fontWeight:700}}>{inv.invoiceNo}</span>
                <span style={{color:"#94a3b8",fontWeight:600}}>DATE</span><span style={{color:"#1e293b",fontWeight:700}}>{inv.invoiceDate}</span>
                <span style={{color:"#94a3b8",fontWeight:600}}>DUE DATE</span><span style={{color:"#1e293b",fontWeight:700}}>{inv.dueDate||"—"}</span>
              </div>
            </div>
          </div>
          <div className="ca-inv-section" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16,padding:"20px 28px"}}>
            <div style={{background:"#f8fafc",borderRadius:10,padding:"16px 18px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Bill To</div>
              <div style={{fontSize:16,fontWeight:800,color:"#0f172a",marginBottom:4}}>{inv.clientName}</div>
              {inv.clientPan&&<div style={{fontSize:12,color:"#64748b"}}>PAN: {inv.clientPan}</div>}
              {inv.clientContact&&<div style={{fontSize:12,color:"#64748b"}}>Contact: {inv.clientContact}</div>}
              {inv.clientAddress&&<div style={{fontSize:12,color:"#64748b"}}>{inv.clientAddress}</div>}
            </div>
            <div style={{background:"#f8fafc",borderRadius:10,padding:"16px 18px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Payment Details</div>
              {settings.bankName&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#475569",marginBottom:3}}><span>Bank:</span><span style={{fontWeight:600}}>{settings.bankName}</span></div>}
              {settings.accountNo&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#475569",marginBottom:3}}><span>Account:</span><span style={{fontWeight:600}}>{settings.accountNo}</span></div>}
              {settings.ifsc&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#475569",marginBottom:3}}><span>IFSC:</span><span style={{fontWeight:600}}>{settings.ifsc}</span></div>}
              {settings.upiId&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#475569",marginBottom:3}}><span>UPI:</span><span style={{fontWeight:600}}>{settings.upiId}</span></div>}
            </div>
          </div>
          <div className="ca-inv-table-pad" style={{padding:"0 28px 8px",overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:20}}>
              <thead><tr style={{background:"#f8fafc"}}>
                {["S.No","Description","Period","Amount (₹)","GST %","GST (₹)","Total (₹)"].map((h,i)=>(
                  <th key={h} style={{padding:"10px 14px",textAlign:i>2?"right":"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"1px solid #e2e8f0"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(inv.items||[]).map((item,i)=>{
                  const gstAmt=Number(item.amount||0)*Number(item.gst||0)/100;
                  const rowTotal=Number(item.amount||0)+gstAmt;
                  return(<tr key={i}>
                    <td style={{padding:"12px 14px",fontSize:13,borderBottom:"1px solid #f1f5f9",color:"#94a3b8",fontWeight:600}}>{i+1}</td>
                    <td style={{padding:"12px 14px",borderBottom:"1px solid #f1f5f9"}}><div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{item.description}</div>{item.notes&&<div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{item.notes}</div>}</td>
                    <td style={{padding:"12px 14px",fontSize:12,color:"#64748b",borderBottom:"1px solid #f1f5f9"}}>{item.period||"—"}</td>
                    <td style={{padding:"12px 14px",textAlign:"right",fontSize:13,fontWeight:600,color:"#1e293b",borderBottom:"1px solid #f1f5f9"}}>{fmtINR(item.amount)}</td>
                    <td style={{padding:"12px 14px",textAlign:"right",fontSize:13,color:"#64748b",borderBottom:"1px solid #f1f5f9"}}>{item.gst||0}%</td>
                    <td style={{padding:"12px 14px",textAlign:"right",fontSize:13,color:"#64748b",borderBottom:"1px solid #f1f5f9"}}>{fmtINR(gstAmt)}</td>
                    <td style={{padding:"12px 14px",textAlign:"right",fontSize:14,fontWeight:700,color:"#1e293b",borderBottom:"1px solid #f1f5f9"}}>{fmtINR(rowTotal)}</td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
          <div className="ca-inv-totals" style={{display:"flex",justifyContent:"flex-end",padding:"0 28px 20px"}}>
            <div style={{width:"100%",maxWidth:280}}>
              <div style={{display:"flex",justifyContent:"space-between",padding:"7px 14px",fontSize:13,color:"#64748b"}}><span>Subtotal</span><span>{fmtINR(subtotal)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"7px 14px",fontSize:13,color:"#64748b"}}><span>GST</span><span>{fmtINR(gstTotal)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"12px 14px",background:"#0f172a",borderRadius:8,fontSize:15,fontWeight:800,color:"#fff"}}><span>Total Amount</span><span>{fmtINR(total)}</span></div>
            </div>
          </div>
          <div className="ca-inv-words" style={{margin:"0 28px 24px",background:"#f8fafc",border:"1px dashed #e2e8f0",borderRadius:8,padding:"12px 16px"}}>
            <span style={{fontSize:12,color:"#64748b",fontWeight:600}}>Amount in Words: </span>
            <span style={{fontSize:12,color:"#1e293b",fontStyle:"italic"}}>{n2w(total)} Rupees Only</span>
          </div>
          <div style={{textAlign:"center",padding:"16px 0 24px",color:"#94a3b8",fontSize:12,borderTop:"1px solid #f1f5f9"}}>
            Thank you for your business! Payment due within 15 days.
          </div>
        </div>
      </div>
    </div>
  );
}

function NewInvoiceForm({onSaved,onCancel}){
  const [clients,setClients]=useState([]);
  const [allWorks,setAllWorks]=useState([]);
  const [settings,setSettings]=useState({});
  const [clientName,setClient]=useState("");
  const [items,setItems]=useState([]);
  const [invoiceDate,setDate]=useState(new Date().toISOString().split("T")[0]);
  const [dueDate,setDueDate]=useState("");
  const [saving,setSaving]=useState(false);
  const [msg,setMsg]=useState("");
  const inp={padding:"10px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,fontFamily:"'Segoe UI',sans-serif",color:"#1e293b",background:"#fff",outline:"none"};
  useEffect(()=>{axios.get(`${API}/works`).then(r=>setAllWorks(r.data||[]));axios.get(`${API}/api/settings`).then(r=>setSettings(r.data||{}));},[]);
  useEffect(()=>{const names=[...new Set(allWorks.map(w=>w.clientName).filter(Boolean))].sort();setClients(names);},[allWorks]);
  useEffect(()=>{
    if(!clientName){setItems([]);return;}
    const cWorks=allWorks.filter(w=>w.clientName===clientName);
    setItems(cWorks.map(w=>({workId:w.id,description:w.workNature||"Service",period:w.month||"",amount:Number(w.fees||0),gst:18,status:w.status,selected:w.status==="Completed",notes:""})));
  },[clientName,allWorks]);
  function toggleItem(i){setItems(prev=>prev.map((it,idx)=>idx===i?{...it,selected:!it.selected}:it));}
  function updateItem(i,field,val){setItems(prev=>prev.map((it,idx)=>idx===i?{...it,[field]:val}:it));}
  const selectedItems=items.filter(it=>it.selected);
  const subtotal=selectedItems.reduce((s,i)=>s+Number(i.amount||0),0);
  const gstTotal=selectedItems.reduce((s,i)=>s+(Number(i.amount||0)*Number(i.gst||0)/100),0);
  const grandTotal=subtotal+gstTotal;
  const clientInfo=allWorks.find(w=>w.clientName===clientName);
  async function handleSave(){
    if(!clientName){setMsg("Select a client");return;}
    if(selectedItems.length===0){setMsg("Select at least one work item");return;}
    setSaving(true);
    try{
      const payload={clientName,clientPan:clientInfo?.pan||"",clientContact:clientInfo?.contactNo||"",clientAddress:clientInfo?.address||"",invoiceDate,dueDate,items:selectedItems,subtotal,gstTotal,grandTotal,status:"Pending"};
      const res=await axios.post(`${API}/invoices`,payload);
      await Promise.all(selectedItems.map(it=>axios.patch(`${API}/works/${it.workId}`,{invoiceGenerated:"Yes"})));
      onSaved(res.data.id);
    }catch(e){setMsg("Failed to save invoice");}finally{setSaving(false);}
  }
  const STATUS_PILL={"Completed":"#10b981","In Progress":"#3b82f6","Pending":"#f59e0b","On Hold":"#8b5cf6"};
  return(
    <div className="ca-main-scroll" style={{flex:1,overflowY:"auto",background:"#f1f5f9"}}>
      <div className="ca-header" style={{background:"#0f172a",height:54,display:"flex",alignItems:"center",padding:"0 20px"}}>
        <button onClick={onCancel} style={{background:"none",border:"none",color:"#7ab8f5",cursor:"pointer",fontSize:14,fontFamily:"'Segoe UI',sans-serif",marginRight:12}}>← Back</button>
        <span style={{color:"#fff",fontWeight:700}}>New Invoice</span>
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:"18px 16px"}}>
        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",padding:"18px 20px",marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
            <div><label style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:6}}>Client *</label><select value={clientName} onChange={e=>setClient(e.target.value)} style={{...inp,width:"100%"}}><option value="">— Select Client —</option>{clients.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:6}}>Invoice Date</label><input type="date" value={invoiceDate} onChange={e=>setDate(e.target.value)} style={{...inp,width:"100%"}}/></div>
            <div><label style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:6}}>Due Date</label><input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={{...inp,width:"100%"}}/></div>
          </div>
          {clientInfo&&(<div style={{marginTop:12,padding:"10px 14px",background:"#f8fafc",borderRadius:8,fontSize:12,color:"#64748b"}}>{clientInfo.pan&&<span style={{marginRight:16}}>PAN: <strong>{clientInfo.pan}</strong></span>}{clientInfo.contactNo&&<span>Contact: <strong>{clientInfo.contactNo}</strong></span>}</div>)}
        </div>
        {items.length>0&&(
          <div style={{background:"#fff",borderRadius:14,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",overflow:"hidden",marginBottom:16}}>
            <div style={{padding:"14px 20px",borderBottom:"1px solid #f1f5f9",fontWeight:700,fontSize:15,color:"#1e293b"}}>Invoice Items</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"#f8fafc"}}><th style={{padding:"10px 14px",width:40}}></th>{["Particulars","Period","Amount (₹)","Discount (₹)","GST %","Total (₹)"].map(h=>(<th key={h} style={{padding:"10px 14px",textAlign:h.includes("₹")||h.includes("%")?"right":"left",fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"1px solid #e2e8f0"}}>{h}</th>))}</tr></thead>
                <tbody>{items.map((item,i)=>{
                  const gstAmt=Number(item.amount||0)*Number(item.gst||0)/100;
                  const rowTotal=Number(item.amount||0)+gstAmt;
                  const stColor=STATUS_PILL[item.status]||"#94a3b8";
                  return(<tr key={i} style={{background:item.selected?"#f0fdf4":"#fff",borderBottom:"1px solid #f8fafc"}}>
                    <td style={{padding:"12px 14px"}}><input type="checkbox" checked={!!item.selected} onChange={()=>toggleItem(i)} style={{width:16,height:16,accentColor:"#16a34a",cursor:"pointer"}}/></td>
                    <td style={{padding:"12px 14px"}}><div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{item.description}</div><span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,background:`${stColor}20`,color:stColor,marginTop:3,display:"inline-block"}}>{item.status}</span><input value={item.notes||""} onChange={e=>updateItem(i,"notes",e.target.value)} placeholder="Description…" style={{...inp,width:"100%",marginTop:6,fontSize:12,padding:"7px 10px"}}/></td>
                    <td style={{padding:"12px 14px",fontSize:12,color:"#64748b"}}>{item.period}</td>
                    <td style={{padding:"12px 14px"}}><input type="number" value={item.amount} onChange={e=>updateItem(i,"amount",e.target.value)} style={{...inp,width:90,textAlign:"right"}}/></td>
                    <td style={{padding:"12px 14px"}}><input value="0.00" readOnly style={{...inp,width:70,textAlign:"right",background:"#f8fafc",color:"#94a3b8"}}/></td>
                    <td style={{padding:"12px 14px"}}><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{color:"#64748b",fontSize:12}}>%</span><input type="number" value={item.gst} onChange={e=>updateItem(i,"gst",e.target.value)} style={{...inp,width:60,textAlign:"right"}}/></div></td>
                    <td style={{padding:"12px 14px",textAlign:"right",fontSize:13,fontWeight:700,color:"#1e293b"}}>{fmtINR(rowTotal)}</td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </div>
        )}
        {selectedItems.length>0&&(
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
            <div style={{background:"#fff",borderRadius:14,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",padding:"18px 20px",width:"100%",maxWidth:320}}>
              <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13,color:"#64748b"}}><span>Subtotal</span><span>{fmtINR(subtotal)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13,color:"#64748b"}}><span>IGST</span><span>{fmtINR(gstTotal)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontSize:16,fontWeight:800,color:"#1e293b",borderTop:"2px solid #e2e8f0",marginTop:6}}><span>Total Amount</span><span>{fmtINR(grandTotal)}</span></div>
            </div>
          </div>
        )}
        {msg&&<div style={{padding:"10px 14px",background:"#fee2e2",color:"#991b1b",borderRadius:8,marginBottom:12,fontSize:13}}>{msg}</div>}
        <button onClick={handleSave} disabled={saving||selectedItems.length===0} style={{padding:"13px 28px",background:"#0f172a",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif",opacity:saving||selectedItems.length===0?0.6:1}}>
          {saving?"Saving…":"Save Invoice"}
        </button>
      </div>
    </div>
  );
}

export default function Invoice(){
  const navigate=useNavigate();
  const user=JSON.parse(localStorage.getItem("cao_user")||'{"name":"Guest","role":"CA"}');
  const [invoices,setInvoices]=useState([]);
  const [settings,setSettings]=useState({});
  const [filter,setFilter]=useState("All");
  const [view,setView]=useState("list");
  const [selected,setSelected]=useState(null);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");

  function handleNav(key){const route=ROUTES[key];if(route)navigate(route);}

  useEffect(()=>{loadAll();axios.get(`${API}/api/settings`).then(r=>setSettings(r.data||{})).catch(()=>{});},[]);
  function loadAll(){setLoading(true);axios.get(`${API}/invoices`).then(r=>setInvoices(r.data||[])).catch(()=>{}).finally(()=>setLoading(false));}

  async function handleMarkPaid(id){
    await axios.patch(`${API}/invoices/${id}`,{status:"Paid"});
    setInvoices(prev=>prev.map(inv=>inv.id===id?{...inv,status:"Paid"}:inv));
    if(selected?.id===id)setSelected(prev=>({...prev,status:"Paid"}));
  }
  function handleSendWhatsApp(inv){
    const phone=inv.clientContact?.replace(/\D/g,"");
    if(!phone){alert("No contact number");return;}
    const msg=`Hello ${inv.clientName}, your invoice ${inv.invoiceNo} of amount ₹${Number(inv.grandTotal).toLocaleString("en-IN")} is ready. Please check and make the payment. Thank you!`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`,"_blank");
  }

  const filtered=invoices.filter(inv=>{
    const matchFilter=filter==="All"||inv.status===filter;
    const q=search.toLowerCase();
    const matchSearch=!q||inv.clientName?.toLowerCase().includes(q)||inv.invoiceNo?.toLowerCase().includes(q);
    return matchFilter&&matchSearch;
  });

  const pendingTotal=invoices.filter(i=>i.status==="Pending").reduce((s,i)=>s+Number(i.grandTotal||0),0);
  const paidTotal=invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+Number(i.grandTotal||0),0);

  const Shell=({children})=>(
    <div style={{display:"flex",height:"100vh",fontFamily:"'Segoe UI',sans-serif",background:"#f1f5f9",overflow:"hidden"}}>
      <style>{MOBILE_CSS}</style>
      <Sidebar activeKey="invoice" onNav={handleNav}/>
      {children}
      <BottomNav activeKey="invoice" onNav={handleNav}/>
    </div>
  );

  if(view==="new")return(<Shell><NewInvoiceForm onSaved={async(id)=>{loadAll();const r=await axios.get(`${API}/invoices/${id}`);setSelected(r.data);setView("detail");}} onCancel={()=>setView("list")}/></Shell>);
  if(view==="detail"&&selected)return(<Shell><InvoiceViewPage inv={selected} settings={settings} onBack={()=>setView("list")} onMarkPaid={()=>handleMarkPaid(selected.id)} onSendWhatsApp={()=>handleSendWhatsApp(selected)}/></Shell>);

  return(
    <Shell>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <header className="ca-header" style={{height:54,background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div><span style={{color:"#fff",fontWeight:700,fontSize:16}}>CA </span><span style={{color:"#3b82f6",fontWeight:700,fontSize:16}}>Office</span></div>
            <div style={{background:"#1e3a5f",color:"#60a5fa",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:6}}>{user.role}</div>
            <div className="ca-header-name" style={{color:"#fff",fontSize:12,fontWeight:600}}>{user.name.toUpperCase()}</div>
          </div>
          <button onClick={()=>setView("new")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#3b82f6",border:"none",borderRadius:9,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif",whiteSpace:"nowrap"}}>
            <Icon d={IC.plus} size={15} stroke="#fff" sw={2.5}/> New Invoice
          </button>
        </header>

        <div className="ca-main-scroll" style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"14px 16px 0",flexShrink:0}}>
            <div className="ca-sum-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
              {[
                {label:"Total Invoices",val:invoices.length,color:"#3b82f6",amount:null},
                {label:"Pending",val:invoices.filter(i=>i.status==="Pending").length,color:"#f59e0b",amount:pendingTotal},
                {label:"Paid",val:invoices.filter(i=>i.status==="Paid").length,color:"#10b981",amount:paidTotal},
              ].map(c=>(
                <div key={c.label} style={{background:"#fff",borderRadius:12,padding:"12px 14px",borderTop:`3px solid ${c.color}`,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                  <div style={{fontSize:22,fontWeight:800,color:c.color}}>{c.val}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>{c.label}</div>
                  {c.amount!=null&&<div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginTop:3}}>{fmtINR(c.amount)}</div>}
                </div>
              ))}
            </div>
            <div className="ca-filter-row" style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div className="ca-filter-btns" style={{display:"flex",gap:6}}>
                {["All","Pending","Paid"].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${filter===f?(f==="Paid"?"#10b981":f==="Pending"?"#f59e0b":"#3b82f6"):"#e2e8f0"}`,background:filter===f?(f==="Paid"?"#d1fae5":f==="Pending"?"#fef3c7":"#dbeafe"):"#fff",color:filter===f?(f==="Paid"?"#059669":f==="Pending"?"#d97706":"#2563eb"):"#64748b",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif",whiteSpace:"nowrap"}}>
                    {f==="All"?`All (${invoices.length})`:f==="Pending"?`⏳ Pending (${invoices.filter(i=>i.status==="Pending").length})`:`✅ Paid (${invoices.filter(i=>i.status==="Paid").length})`}
                  </button>
                ))}
              </div>
              <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,fontFamily:"'Segoe UI',sans-serif",outline:"none",background:"#fff",minWidth:0}}/>
            </div>
          </div>
          <div style={{flex:1,overflow:"auto",padding:"0 16px 16px"}}>
            <div style={{background:"#fff",borderRadius:14,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",overflow:"hidden"}}>
              {loading?(
                <div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8"}}>Loading invoices…</div>
              ):filtered.length===0?(
                <div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8",fontSize:14}}>
                  {filter==="Pending"?"No pending invoices":filter==="Paid"?"No paid invoices":"No invoices yet — click + New Invoice"}
                </div>
              ):(
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:580}}>
                    <thead><tr style={{background:"#0f172a"}}>
                      {["Date","Invoice No.","Client","Due Date","Total Amount","Status","Actions"].map(h=>(
                        <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#e2e8f0",textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"2px solid #1e3a5f",whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filtered.map((inv,idx)=>{
                        const sc=STATUS_COLOR[inv.status]||STATUS_COLOR["Pending"];
                        return(<tr key={inv.id} style={{background:idx%2===0?"#fff":"#f8fafc",borderBottom:"1px solid #f1f5f9"}} onMouseEnter={e=>e.currentTarget.style.background="#eff6ff"} onMouseLeave={e=>e.currentTarget.style.background=idx%2===0?"#fff":"#f8fafc"}>
                          <td style={{padding:"10px 12px",fontSize:13,color:"#64748b",whiteSpace:"nowrap"}}>{inv.invoiceDate||"—"}</td>
                          <td style={{padding:"10px 12px"}}><button onClick={()=>{setSelected(inv);setView("detail");}} style={{background:"none",border:"none",cursor:"pointer",color:"#3b82f6",fontWeight:700,fontSize:13,fontFamily:"'Segoe UI',sans-serif",textDecoration:"underline"}}>{inv.invoiceNo}</button></td>
                          <td style={{padding:"10px 12px",fontWeight:700,fontSize:13,color:"#1e293b"}}>{inv.clientName}</td>
                          <td style={{padding:"10px 12px",fontSize:13,color:"#64748b",whiteSpace:"nowrap"}}>{inv.dueDate||"—"}</td>
                          <td style={{padding:"10px 12px",fontSize:13,fontWeight:800,color:"#1e293b",whiteSpace:"nowrap"}}>{fmtINR(inv.grandTotal)}</td>
                          <td style={{padding:"10px 12px"}}><span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:sc.bg,color:sc.text,border:`1px solid ${sc.border}`,whiteSpace:"nowrap"}}>{inv.status}</span></td>
                          <td style={{padding:"10px 12px"}}><div style={{display:"flex",gap:5}}>
                            <button onClick={()=>{setSelected(inv);setView("detail");}} style={{padding:"5px 10px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:7,color:"#2563eb",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif"}}>View</button>
                            {inv.status!=="Paid"&&(<button onClick={()=>handleMarkPaid(inv.id)} style={{padding:"5px 10px",background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:7,color:"#059669",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif",whiteSpace:"nowrap"}}>Paid ✓</button>)}
                          </div></td>
                        </tr>);
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}