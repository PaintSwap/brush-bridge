"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[785],{21785:function(e,a,t){t.d(a,{offchainLookup:function(){return offchainLookup},offchainLookupSignature:function(){return h}});var r=t(78407),s=t(96070),n=t(36117),o=t(29008);let OffchainLookupError=class OffchainLookupError extends n.G{constructor({callbackSelector:e,cause:a,data:t,extraData:r,sender:s,urls:n}){super(a.shortMessage||"An error occurred while fetching for an offchain result.",{cause:a,metaMessages:[...a.metaMessages||[],a.metaMessages?.length?"":[],"Offchain Gateway Call:",n&&["  Gateway URL(s):",...n.map(e=>`    ${(0,o.G)(e)}`)],`  Sender: ${s}`,`  Data: ${t}`,`  Callback selector: ${e}`,`  Extra data: ${r}`].flat(),name:"OffchainLookupError"})}};let OffchainLookupResponseMalformedError=class OffchainLookupResponseMalformedError extends n.G{constructor({result:e,url:a}){super("Offchain gateway response is malformed. Response data must be a hex value.",{metaMessages:[`Gateway URL: ${(0,o.G)(a)}`,`Response: ${(0,s.P)(e)}`],name:"OffchainLookupResponseMalformedError"})}};let OffchainLookupSenderMismatchError=class OffchainLookupSenderMismatchError extends n.G{constructor({sender:e,to:a}){super("Reverted sender address does not match target contract address (`to`).",{metaMessages:[`Contract address: ${a}`,`OffchainLookup sender address: ${e}`],name:"OffchainLookupSenderMismatchError"})}};var c=t(78863),f=t(86899),i=t(45444),u=t(61228),p=t(57040),d=t(15102);let h="0x556f1830",l={name:"OffchainLookup",type:"error",inputs:[{name:"sender",type:"address"},{name:"urls",type:"string[]"},{name:"callData",type:"bytes"},{name:"callbackFunction",type:"bytes4"},{name:"extraData",type:"bytes"}]};async function offchainLookup(e,{blockNumber:a,blockTag:t,data:s,to:n}){let{args:o}=(0,f.p)({data:s,abi:[l]}),[c,d,h,m,y]=o,{ccipRead:k}=e,w=k&&"function"==typeof k?.request?k.request:ccipRequest;try{if(!(0,u.E)(n,c))throw new OffchainLookupSenderMismatchError({sender:c,to:n});let s=await w({data:h,sender:c,urls:d}),{data:o}=await (0,r.R)(e,{blockNumber:a,blockTag:t,data:(0,p.zo)([m,(0,i.E)([{type:"bytes"},{type:"bytes"}],[s,y])]),to:n});return o}catch(e){throw new OffchainLookupError({callbackSelector:m,cause:e,data:s,extraData:y,sender:c,urls:d})}}async function ccipRequest({data:e,sender:a,urls:t}){let r=Error("An unknown error occurred.");for(let n=0;n<t.length;n++){let o=t[n],f=o.includes("{data}")?"GET":"POST",i="POST"===f?{data:e,sender:a}:void 0,u="POST"===f?{"Content-Type":"application/json"}:{};try{let t;let n=await fetch(o.replace("{sender}",a).replace("{data}",e),{body:JSON.stringify(i),headers:u,method:f});if(t=n.headers.get("Content-Type")?.startsWith("application/json")?(await n.json()).data:await n.text(),!n.ok){r=new c.Gg({body:i,details:t?.error?(0,s.P)(t.error):n.statusText,headers:n.headers,status:n.status,url:o});continue}if(!(0,d.v)(t)){r=new OffchainLookupResponseMalformedError({result:t,url:o});continue}return t}catch(e){r=new c.Gg({body:i,details:e.message,url:o})}}throw r}}}]);