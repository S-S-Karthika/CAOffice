import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageWrapper from "./PageWrapper";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const IC = ({ d, size=18, stroke="currentColor", fill="none", sw=1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const ICD = {
  plus:"M12 5v14M5 12h14", close:"M18 6L6 18M6 6l12 12",
  download:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  check:"M20 6L9 17l-5-5",
  whatsapp:"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
};

const STATUS_COLOR = {
  "Pending":{ bg:"#FEF3C7",text:"#D97706",border:"#FCD34D" },
  "Paid":   { bg:"#D1FAE5",text:"#059669",border:"#6EE7B7" },
  "Partial":{ bg:"#DBEAFE",text:"#2563EB",border:"#93C5FD" },
};

function fmtINR(n){ return Number(n||0).toLocaleString("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}); }

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
  const html=`<!DOCTYPE html><html><head><title>Invoice ${inv.invoiceNo}</title><style>body{font-family:'Segoe UI',sans-serif;margin:0;padding:32px;color:#1e293b;font-size:13px;}*{box-sizing:border-box;}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #e2e8f0;}.firm-name{font-size:22px;font-weight:800;color:#0f172a;}.firm-sub{font-size:12px;color:#64748b;margin-top:4px;}.inv-badge{background:#fef3c7;color:#d97706;font-size:11px;font-weight:800;padding:5px 14px;border-radius:6px;display:inline-block;margin-bottom:10px;}.inv-grid{display:grid;grid-template-columns:auto auto;gap:3px 16px;font-size:12px;}.lbl{color:#94a3b8;font-weight:600;}.val{color:#1e293b;font-weight:700;}section{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}.box{background:#f8fafc;border-radius:10px;padding:16px 18px;}.box-title{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;}.client-name{font-size:16px;font-weight:800;color:#0f172a;margin-bottom:4px;}.svc-row{display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px;}table{width:100%;border-collapse:collapse;margin-bottom:20px;}th{padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;background:#f8fafc;border-bottom:1px solid #e2e8f0;}th.r,td.r{text-align:right;}td{padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;}.totals{display:flex;justify-content:flex-end;margin-bottom:20px;}.totals-box{width:280px;}.t-row{display:flex;justify-content:space-between;padding:7px 14px;font-size:13px;color:#64748b;}.t-total{display:flex;justify-content:space-between;padding:12px 14px;background:#0f172a;border-radius:8px;font-size:15px;font-weight:800;color:#fff;margin-top:4px;}.words{background:#f8fafc;border:1px dashed #e2e8f0;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:12px;}@media print{body{padding:0 16px;}}</style></head><body>
<div class="header"><div><div class="firm-name">${settings.firmName||"CA Office"}</div><div class="firm-sub">${settings.firmAddress||"Tamil Nadu, India"}</div>${settings.firmGST?`<div class="firm-sub">GSTIN: ${settings.firmGST}</div>`:""}</div><div style="text-align:right"><div class="inv-badge">TAX INVOICE</div><div class="inv-grid"><span class="lbl">INV NO.</span><span class="val">${inv.invoiceNo}</span><span class="lbl">DATE</span><span class="val">${inv.invoiceDate||""}</span><span class="lbl">DUE</span><span class="val">${inv.dueDate||""}</span></div></div></div>
<section><div class="box"><div class="box-title">Bill To</div><div class="client-name">${inv.clientName}</div>${inv.clientPan?`<div style="font-size:12px;color:#64748b">PAN: ${inv.clientPan}</div>`:""} ${inv.clientContact?`<div style="font-size:12px;color:#64748b">Contact: ${inv.clientContact}</div>`:""}</div><div class="box"><div class="box-title">Payment Details</div>${settings.bankName?`<div class="svc-row"><span>Bank:</span><span>${settings.bankName}</span></div>`:""} ${settings.accountNo?`<div class="svc-row"><span>Account:</span><span>${settings.accountNo}</span></div>`:""} ${settings.ifsc?`<div class="svc-row"><span>IFSC:</span><span>${settings.ifsc}</span></div>`:""} ${settings.upiId?`<div class="svc-row"><span>UPI:</span><span>${settings.upiId}</span></div>`:""}</div></section>
<table><thead><tr><th>S.No</th><th>Description</th><th>Period</th><th class="r">Amount</th><th class="r">GST%</th><th class="r">GST</th><th class="r">Total</th></tr></thead><tbody>${(inv.items||[]).map((item,i)=>{const g=Number(item.amount||0)*Number(item.gst||0)/100;return`<tr><td style="color:#94a3b8">${i+1}</td><td><div style="font-weight:700">${item.description}</div></td><td style="color:#64748b">${item.period||""}</td><td class="r">${fmtINR(item.amount)}</td><td class="r" style="color:#64748b">${item.gst||0}%</td><td class="r">${fmtINR(g)}</td><td class="r" style="font-weight:700">${fmtINR(Number(item.amount||0)+g)}</td></tr>`;}).join("")}</tbody></table>
<div class="totals"><div class="totals-box"><div class="t-row"><span>Subtotal</span><span>${fmtINR(subtotal)}</span></div><div class="t-row"><span>GST</span><span>${fmtINR(gstTotal)}</span></div><div class="t-total"><span>Total</span><span>${fmtINR(total)}</span></div></div></div>
<div class="words"><span style="font-weight:600;color:#64748b">Amount in Words: </span><span style="font-style:italic">${n2w(total)} Rupees Only</span></div>
</body></html>`;
  const w=window.open("","_blank","width=900,height=700");w.document.write(html);w.document.close();setTimeout(()=>w.print(),600);
}

function InvoiceViewPage({ inv, settings, onBack, onMarkPaid, onSendWhatsApp }) {
  const subtotal=(inv.items||[]).reduce((s,i)=>s+Number(i.amount||0),0);
  const gstTotal=(inv.items||[]).reduce((s,i)=>s+(Number(i.amount||0)*Number(i.gst||0)/100),0);
  const total=subtotal+gstTotal;
  const sc=STATUS_COLOR[inv.status]||STATUS_COLOR["Pending"];
  const inp={padding:"10px 12px",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",fontSize:13,fontFamily:"var(--font)",color:"var(--text)",background:"var(--surface)",outline:"none"};
  return (
    <div style={{ flex:1,overflowY:"auto" }}>
      <div style={{ background:"var(--navy)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <button onClick={onBack} style={{ background:"none",border:"none",color:"#7ab8f5",cursor:"pointer",fontSize:13,fontFamily:"var(--font)",fontWeight:600 }}>← Back</button>
          <span style={{ color:"#fff",fontWeight:700,fontSize:13 }}>#{inv.invoiceNo}</span>
          <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:sc.bg,color:sc.text }}>{inv.status}</span>
        </div>
        <div style={{ display:"flex",gap:6 }}>
          {inv.clientContact&&<button onClick={onSendWhatsApp} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 12px",background:"#25D366",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)" }}><IC d={ICD.whatsapp} size={14} stroke="none" fill="#fff"/> WA</button>}
          <button onClick={()=>printInvoice(inv,settings)} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 12px",background:"var(--blue)",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)" }}><IC d={ICD.download} size={14} stroke="#fff"/> PDF</button>
          {inv.status!=="Paid"&&<button onClick={onMarkPaid} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 12px",background:"var(--green)",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)" }}><IC d={ICD.check} size={14} stroke="#fff" sw={2.5}/> Paid</button>}
        </div>
      </div>
      <div style={{ maxWidth:820,margin:"0 auto",padding:"20px 16px" }}>
        <div className="ca-card" style={{ overflow:"hidden" }}>
          <div style={{ display:"flex",flexWrap:"wrap",gap:16,justifyContent:"space-between",alignItems:"flex-start",padding:"24px 28px 20px",borderBottom:"2px solid var(--border)" }}>
            <div>
              <div style={{ fontSize:20,fontWeight:800,color:"var(--navy)",marginBottom:3 }}>{settings.firmName||"CA Office"}</div>
              <div style={{ fontSize:12,color:"var(--text3)" }}>{settings.firmAddress||"Tamil Nadu, India"}</div>
              {settings.firmGST&&<div style={{ fontSize:12,color:"var(--text3)" }}>GSTIN: {settings.firmGST}</div>}
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ background:"var(--amber-l)",color:"var(--amber)",fontSize:11,fontWeight:800,padding:"5px 14px",borderRadius:6,display:"inline-block",marginBottom:10 }}>TAX INVOICE</div>
              <div style={{ display:"grid",gridTemplateColumns:"auto auto",gap:"3px 16px",fontSize:12 }}>
                <span style={{ color:"var(--text4)",fontWeight:600 }}>INVOICE NO.</span><span style={{ color:"var(--text)",fontWeight:700 }}>{inv.invoiceNo}</span>
                <span style={{ color:"var(--text4)",fontWeight:600 }}>DATE</span><span style={{ color:"var(--text)",fontWeight:700 }}>{inv.invoiceDate}</span>
                <span style={{ color:"var(--text4)",fontWeight:600 }}>DUE DATE</span><span style={{ color:"var(--text)",fontWeight:700 }}>{inv.dueDate||"—"}</span>
              </div>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16,padding:"20px 28px" }}>
            <div style={{ background:"var(--surface2)",borderRadius:10,padding:"16px 18px" }}>
              <div style={{ fontSize:10,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10 }}>Bill To</div>
              <div style={{ fontSize:16,fontWeight:800,color:"var(--navy)",marginBottom:4 }}>{inv.clientName}</div>
              {inv.clientPan&&<div style={{ fontSize:12,color:"var(--text3)" }}>PAN: {inv.clientPan}</div>}
              {inv.clientContact&&<div style={{ fontSize:12,color:"var(--text3)" }}>Contact: {inv.clientContact}</div>}
            </div>
            <div style={{ background:"var(--surface2)",borderRadius:10,padding:"16px 18px" }}>
              <div style={{ fontSize:10,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10 }}>Payment Details</div>
              {settings.bankName&&<div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text3)",marginBottom:3 }}><span>Bank:</span><span style={{ fontWeight:600 }}>{settings.bankName}</span></div>}
              {settings.accountNo&&<div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text3)",marginBottom:3 }}><span>Account:</span><span style={{ fontWeight:600 }}>{settings.accountNo}</span></div>}
              {settings.ifsc&&<div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text3)",marginBottom:3 }}><span>IFSC:</span><span style={{ fontWeight:600 }}>{settings.ifsc}</span></div>}
              {settings.upiId&&<div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text3)",marginBottom:3 }}><span>UPI:</span><span style={{ fontWeight:600 }}>{settings.upiId}</span></div>}
            </div>
          </div>
          <div style={{ padding:"0 28px 8px",overflowX:"auto" }}>
            <table className="ca-tbl">
              <thead><tr>
                {["S.No","Description","Period","Amount (₹)","GST %","GST (₹)","Total (₹)"].map((h,i)=>(
                  <th key={h} style={{ textAlign:i>2?"right":"left" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(inv.items||[]).map((item,i)=>{
                  const gstAmt=Number(item.amount||0)*Number(item.gst||0)/100;
                  const rowTotal=Number(item.amount||0)+gstAmt;
                  return (<tr key={i}>
                    <td style={{ color:"var(--text4)" }}>{i+1}</td>
                    <td><div style={{ fontWeight:700,color:"var(--text)" }}>{item.description}</div>{item.notes&&<div style={{ fontSize:11,color:"var(--text4)",marginTop:1 }}>{item.notes}</div>}</td>
                    <td style={{ fontSize:12,color:"var(--text3)" }}>{item.period||"—"}</td>
                    <td style={{ textAlign:"right",fontWeight:600 }}>{fmtINR(item.amount)}</td>
                    <td style={{ textAlign:"right",color:"var(--text3)" }}>{item.gst||0}%</td>
                    <td style={{ textAlign:"right",color:"var(--text3)" }}>{fmtINR(gstAmt)}</td>
                    <td style={{ textAlign:"right",fontWeight:700,color:"var(--text)" }}>{fmtINR(rowTotal)}</td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display:"flex",justifyContent:"flex-end",padding:"0 28px 20px" }}>
            <div style={{ width:280 }}>
              <div style={{ display:"flex",justifyContent:"space-between",padding:"7px 14px",fontSize:13,color:"var(--text3)" }}><span>Subtotal</span><span>{fmtINR(subtotal)}</span></div>
              <div style={{ display:"flex",justifyContent:"space-between",padding:"7px 14px",fontSize:13,color:"var(--text3)" }}><span>GST</span><span>{fmtINR(gstTotal)}</span></div>
              <div style={{ display:"flex",justifyContent:"space-between",padding:"12px 14px",background:"var(--navy)",borderRadius:8,fontSize:15,fontWeight:800,color:"#fff" }}><span>Total Amount</span><span>{fmtINR(total)}</span></div>
            </div>
          </div>
          <div style={{ margin:"0 28px 24px",background:"var(--surface2)",border:"1px dashed var(--border2)",borderRadius:8,padding:"12px 16px" }}>
            <span style={{ fontSize:12,color:"var(--text3)",fontWeight:600 }}>Amount in Words: </span>
            <span style={{ fontSize:12,color:"var(--text)",fontStyle:"italic" }}>{n2w(total)} Rupees Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewInvoiceForm({ onSaved, onCancel }) {
  const [allWorks,setAllWorks]=useState([]);
  const [settings,setSettings]=useState({});
  const [clientName,setClient]=useState("");
  const [items,setItems]=useState([]);
  const [invoiceDate,setDate]=useState(new Date().toISOString().split("T")[0]);
  const [dueDate,setDueDate]=useState("");
  const [saving,setSaving]=useState(false);
  const [msg,setMsg]=useState("");
  const inp={padding:"10px 12px",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",fontSize:13,fontFamily:"var(--font)",color:"var(--text)",background:"var(--surface)",outline:"none"};
  useEffect(()=>{axios.get(`${API}/works`).then(r=>setAllWorks(r.data||[]));axios.get(`${API}/api/settings`).then(r=>setSettings(r.data||{}));},[]);
  const clients=[...new Set(allWorks.map(w=>w.clientName).filter(Boolean))].sort();
  useEffect(()=>{
    if(!clientName){setItems([]);return;}
    const cw=allWorks.filter(w=>w.clientName===clientName);
    setItems(cw.map(w=>({workId:w.id,description:w.workNature||"Service",period:w.month||"",amount:Number(w.fees||0),gst:18,status:w.status,selected:w.status==="Completed",notes:""})));
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
    if(!selectedItems.length){setMsg("Select at least one work item");return;}
    setSaving(true);
    try{
      const payload={clientName,clientPan:clientInfo?.pan||"",clientContact:clientInfo?.contactNo||"",clientAddress:clientInfo?.address||"",invoiceDate,dueDate,items:selectedItems,subtotal,gstTotal,grandTotal,status:"Pending"};
      const res=await axios.post(`${API}/invoices`,payload);
      await Promise.all(selectedItems.map(it=>axios.patch(`${API}/works/${it.workId}`,{invoiceGenerated:"Yes"})));
      onSaved(res.data.id);
    }catch{setMsg("Failed to save invoice");}finally{setSaving(false);}
  }
  const STATUS_PILL={"Completed":"var(--green)","In Progress":"var(--blue)","Pending":"var(--amber)","On Hold":"var(--purple)"};
  return (
    <div style={{ flex:1,overflowY:"auto",background:"var(--bg)" }}>
      <div style={{ background:"var(--navy)",height:52,display:"flex",alignItems:"center",padding:"0 20px",gap:12 }}>
        <button onClick={onCancel} style={{ background:"none",border:"none",color:"#7ab8f5",cursor:"pointer",fontSize:13,fontFamily:"var(--font)",fontWeight:600 }}>← Back</button>
        <span style={{ color:"#fff",fontWeight:700 }}>New Invoice</span>
      </div>
      <div style={{ maxWidth:900,margin:"0 auto",padding:"18px 16px" }}>
        <div className="ca-card" style={{ padding:"18px 20px",marginBottom:16 }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12 }}>
            <div><label className="ca-lbl">Client *</label><select value={clientName} onChange={e=>setClient(e.target.value)} style={{ width:"100%",padding:"10px 13px",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",fontFamily:"var(--font)",fontSize:13,color:"var(--text)",background:"var(--surface)",outline:"none",appearance:"none" }}><option value="">— Select Client —</option>{clients.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="ca-lbl">Invoice Date</label><input type="date" value={invoiceDate} onChange={e=>setDate(e.target.value)} className="ca-inp"/></div>
            <div><label className="ca-lbl">Due Date</label><input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="ca-inp"/></div>
          </div>
          {clientInfo&&<div style={{ marginTop:10,padding:"8px 12px",background:"var(--surface2)",borderRadius:8,fontSize:12,color:"var(--text3)" }}>{clientInfo.pan&&<span style={{ marginRight:14 }}>PAN: <strong>{clientInfo.pan}</strong></span>}{clientInfo.contactNo&&<span>Contact: <strong>{clientInfo.contactNo}</strong></span>}</div>}
        </div>
        {items.length>0&&(
          <div className="ca-card" style={{ overflow:"hidden",marginBottom:16 }}>
            <div style={{ padding:"14px 20px",borderBottom:"1px solid var(--border)",fontWeight:700,fontSize:15,color:"var(--text)" }}>Invoice Items</div>
            <div style={{ overflowX:"auto" }}>
              <table className="ca-tbl">
                <thead><tr><th style={{ width:40 }}></th><th>Particulars</th><th>Period</th><th style={{ textAlign:"right" }}>Amount (₹)</th><th style={{ textAlign:"right" }}>GST %</th><th style={{ textAlign:"right" }}>Total (₹)</th></tr></thead>
                <tbody>{items.map((item,i)=>{
                  const gstAmt=Number(item.amount||0)*Number(item.gst||0)/100;
                  const rowTotal=Number(item.amount||0)+gstAmt;
                  const stColor=STATUS_PILL[item.status]||"var(--text4)";
                  return(<tr key={i} style={{ background:item.selected?"var(--green-l)":"var(--surface)" }}>
                    <td><input type="checkbox" checked={!!item.selected} onChange={()=>toggleItem(i)} style={{ width:16,height:16,accentColor:"var(--green)",cursor:"pointer" }}/></td>
                    <td>
                      <div style={{ fontWeight:700,color:"var(--text)" }}>{item.description}</div>
                      <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,background:`${stColor}18`,color:stColor,marginTop:2,display:"inline-block" }}>{item.status}</span>
                      <input value={item.notes||""} onChange={e=>updateItem(i,"notes",e.target.value)} placeholder="Notes…" style={{ width:"100%",marginTop:5,padding:"6px 10px",border:"1.5px solid var(--border)",borderRadius:7,fontSize:12,outline:"none",fontFamily:"var(--font)" }}/>
                    </td>
                    <td style={{ fontSize:12,color:"var(--text3)" }}>{item.period}</td>
                    <td><input type="number" value={item.amount} onChange={e=>updateItem(i,"amount",e.target.value)} style={{ width:90,padding:"8px 10px",border:"1.5px solid var(--border)",borderRadius:7,fontSize:13,outline:"none",textAlign:"right",fontFamily:"var(--font)" }}/></td>
                    <td><input type="number" value={item.gst} onChange={e=>updateItem(i,"gst",e.target.value)} style={{ width:60,padding:"8px 10px",border:"1.5px solid var(--border)",borderRadius:7,fontSize:13,outline:"none",textAlign:"right",fontFamily:"var(--font)" }}/></td>
                    <td style={{ textAlign:"right",fontWeight:700,color:"var(--text)" }}>{fmtINR(rowTotal)}</td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </div>
        )}
        {selectedItems.length>0&&(
          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:16 }}>
            <div className="ca-card" style={{ padding:"18px 20px",width:"100%",maxWidth:300 }}>
              <div style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13,color:"var(--text3)" }}><span>Subtotal</span><span>{fmtINR(subtotal)}</span></div>
              <div style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13,color:"var(--text3)" }}><span>GST</span><span>{fmtINR(gstTotal)}</span></div>
              <div style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",fontSize:16,fontWeight:800,color:"var(--navy)",borderTop:"2px solid var(--border)",marginTop:6 }}><span>Total</span><span>{fmtINR(grandTotal)}</span></div>
            </div>
          </div>
        )}
        {msg&&<div className="ca-toast ca-toast-err">{msg}</div>}
        <button className="ca-btn-primary" style={{ padding:"13px 28px",fontSize:14,justifyContent:"center" }} onClick={handleSave} disabled={saving||!selectedItems.length}>
          {saving?<span className="ca-spin"/>:null}{saving?"Saving…":"Save Invoice"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN Invoice Page ──────────────────────────────────────────────────────────
export default function Invoice() {
  const navigate=useNavigate();
  const user=(()=>{try{return JSON.parse(localStorage.getItem("cao_user")||'{"name":"Guest","role":"CA"}');}catch{return{name:"Guest",role:"CA"};}})();
  const [invoices,setInvoices]=useState([]);
  const [settings,setSettings]=useState({});
  const [filter,setFilter]=useState("All");
  const [view,setView]=useState("list");
  const [selected,setSelected]=useState(null);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");

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

  // New invoice and detail views use PageWrapper's AppShell frame but need their own topbar for back button
  if (view==="new") return (
    <>
      <style>{require("./AppShell").SHELL_CSS||""}</style>
      <div style={{ display:"flex",height:"100vh",background:"var(--bg)",fontFamily:"var(--font)" }}>
        <NewInvoiceForm onSaved={async(id)=>{loadAll();const r=await axios.get(`${API}/invoices/${id}`);setSelected(r.data);setView("detail");}} onCancel={()=>setView("list")}/>
      </div>
    </>
  );

  if (view==="detail"&&selected) return (
    <>
      <style>{require("./AppShell").SHELL_CSS||""}</style>
      <div style={{ display:"flex",height:"100vh",background:"var(--bg)",fontFamily:"var(--font)",flexDirection:"column" }}>
        <InvoiceViewPage inv={selected} settings={settings} onBack={()=>setView("list")} onMarkPaid={()=>handleMarkPaid(selected.id)} onSendWhatsApp={()=>handleSendWhatsApp(selected)}/>
      </div>
    </>
  );

  return (
    <PageWrapper activeKey="invoice" title="Invoices" subtitle={`${invoices.length} total`}
      rightAction={
        <button className="ca-btn-blue" style={{ fontSize:12,padding:"7px 14px" }} onClick={()=>setView("new")}>
          <IC d={ICD.plus} size={14} stroke="#fff" sw={2.5}/> New Invoice
        </button>
      }>
      <div style={{ padding:"20px",maxWidth:1100,margin:"0 auto" }}>
        {/* Summary */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16 }}>
          {[
            { label:"Total Invoices", val:invoices.length,                           color:"var(--navy)",  amount:null },
            { label:"Pending",        val:invoices.filter(i=>i.status==="Pending").length, color:"var(--amber)", amount:pendingTotal },
            { label:"Paid",           val:invoices.filter(i=>i.status==="Paid").length,    color:"var(--green)", amount:paidTotal },
          ].map(c=>(
            <div key={c.label} className="ca-stat" style={{ borderTop:`3px solid ${c.color}` }}>
              <div style={{ fontSize:26,fontWeight:800,color:c.color }}>{c.val}</div>
              <div style={{ fontSize:11,color:"var(--text4)",marginTop:1 }}>{c.label}</div>
              {c.amount!=null&&<div style={{ fontSize:12,fontWeight:700,color:"var(--text)",marginTop:3 }}>{fmtINR(c.amount)}</div>}
            </div>
          ))}
        </div>
        {/* Filters + search */}
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap" }}>
          <div style={{ display:"flex",gap:6 }}>
            {["All","Pending","Paid"].map(f=>{
              const sc=f==="Paid"?STATUS_COLOR.Paid:f==="Pending"?STATUS_COLOR.Pending:{bg:"var(--blue-l)",text:"var(--blue)",border:"var(--blue-m)"};
              return (
                <button key={f} onClick={()=>setFilter(f)} style={{ padding:"6px 12px",borderRadius:20,border:`1.5px solid ${filter===f?sc.text:"var(--border)"}`,background:filter===f?sc.bg:"var(--surface)",color:filter===f?sc.text:"var(--text3)",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"var(--font)" }}>
                  {f==="All"?`All (${invoices.length})`:f==="Pending"?`⏳ Pending (${invoices.filter(i=>i.status==="Pending").length})`:`✅ Paid (${invoices.filter(i=>i.status==="Paid").length})`}
                </button>
              );
            })}
          </div>
          <div className="ca-search-wrap" style={{ flex:1,minWidth:160 }}>
            <IC d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" size={15} stroke="var(--text4)"/>
            <input className="ca-search-inp" placeholder="Search client, invoice…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>
        {/* Table */}
        <div className="ca-card" style={{ overflow:"hidden" }}>
          {loading ? (
            <div style={{ textAlign:"center",padding:"60px 0",color:"var(--text4)" }}>Loading invoices…</div>
          ) : filtered.length===0 ? (
            <div style={{ textAlign:"center",padding:"60px 0",color:"var(--text4)",fontSize:14 }}>
              {filter==="Pending"?"No pending invoices":filter==="Paid"?"No paid invoices":"No invoices yet — click + New Invoice"}
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table className="ca-tbl">
                <thead><tr>
                  <th>Date</th><th>Invoice No.</th><th>Client</th><th>Due Date</th><th>Total</th><th>Status</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map((inv,idx)=>{
                    const sc=STATUS_COLOR[inv.status]||STATUS_COLOR["Pending"];
                    return (<tr key={inv.id}>
                      <td style={{ fontSize:12,color:"var(--text4)",whiteSpace:"nowrap" }}>{inv.invoiceDate||"—"}</td>
                      <td><button onClick={()=>{setSelected(inv);setView("detail");}} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--blue)",fontWeight:700,fontSize:13,fontFamily:"var(--font)",textDecoration:"underline" }}>{inv.invoiceNo}</button></td>
                      <td style={{ fontWeight:700,color:"var(--text)" }}>{inv.clientName}</td>
                      <td style={{ fontSize:12,color:"var(--text4)",whiteSpace:"nowrap" }}>{inv.dueDate||"—"}</td>
                      <td style={{ fontWeight:800,color:"var(--text)",whiteSpace:"nowrap",fontFamily:"monospace" }}>{fmtINR(inv.grandTotal)}</td>
                      <td><span style={{ fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:sc.bg,color:sc.text,border:`1px solid ${sc.border}`,whiteSpace:"nowrap" }}>{inv.status}</span></td>
                      <td>
                        <div style={{ display:"flex",gap:5 }}>
                          <button onClick={()=>{setSelected(inv);setView("detail");}} style={{ padding:"5px 10px",background:"var(--blue-l)",border:"1px solid var(--blue-m)",borderRadius:7,color:"var(--blue)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)" }}>View</button>
                          {inv.status!=="Paid"&&<button onClick={()=>handleMarkPaid(inv.id)} style={{ padding:"5px 10px",background:"var(--green-l)",border:"1px solid #6EE7B7",borderRadius:7,color:"var(--green)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)",whiteSpace:"nowrap" }}>Paid ✓</button>}
                        </div>
                      </td>
                    </tr>);
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
