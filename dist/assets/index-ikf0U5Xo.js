const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CW8hYF21.js","assets/index-CXATIzgh.js","assets/index-C685uZ3A.js","assets/index-CnHpQCC6.js","assets/index-CF0BtavD.js","assets/index-vvg_gp52.js","assets/index-BOC1FbRT.js","assets/index-o7Eh7dtK.js","assets/index-DI3HpnVS.js"])))=>i.map(i=>d[i]);
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(n){if(n.ep)return;n.ep=!0;const s=t(n);fetch(n.href,s)}})();class A{constructor(){this.db=null,this.DB_NAME="clawdroid_db",this.DB_VERSION=1}async init(){return new Promise((e,t)=>{const a=indexedDB.open(this.DB_NAME,this.DB_VERSION);a.onupgradeneeded=n=>{const s=n.target.result;if(!s.objectStoreNames.contains("messages")){const o=s.createObjectStore("messages",{keyPath:"id",autoIncrement:!0});o.createIndex("sessionId","sessionId",{unique:!1}),o.createIndex("timestamp","timestamp",{unique:!1})}s.objectStoreNames.contains("sessions")||s.createObjectStore("sessions",{keyPath:"id"}),s.objectStoreNames.contains("memory")||s.createObjectStore("memory",{keyPath:"key"}),s.objectStoreNames.contains("skills")||s.createObjectStore("skills",{keyPath:"id"}),s.objectStoreNames.contains("automations")||s.createObjectStore("automations",{keyPath:"id"}),s.objectStoreNames.contains("channels")||s.createObjectStore("channels",{keyPath:"id"})},a.onsuccess=n=>{this.db=n.target.result,e()},a.onerror=()=>t(a.error)})}async _put(e,t){return new Promise((a,n)=>{const s=this.db.transaction(e,"readwrite");s.objectStore(e).put(t),s.oncomplete=()=>a(),s.onerror=()=>n(s.error)})}async _get(e,t){return new Promise((a,n)=>{const o=this.db.transaction(e,"readonly").objectStore(e).get(t);o.onsuccess=()=>a(o.result),o.onerror=()=>n(o.error)})}async _getAll(e){return new Promise((t,a)=>{const s=this.db.transaction(e,"readonly").objectStore(e).getAll();s.onsuccess=()=>t(s.result||[]),s.onerror=()=>a(s.error)})}async _delete(e,t){return new Promise((a,n)=>{const s=this.db.transaction(e,"readwrite");s.objectStore(e).delete(t),s.oncomplete=()=>a(),s.onerror=()=>n(s.error)})}async _clear(e){return new Promise((t,a)=>{const n=this.db.transaction(e,"readwrite");n.objectStore(e).clear(),n.oncomplete=()=>t(),n.onerror=()=>a(n.error)})}async addMessage(e){return this._put("messages",{...e,timestamp:Date.now()})}async getMessages(e){return new Promise((t,a)=>{const o=this.db.transaction("messages","readonly").objectStore("messages").index("sessionId").getAll(e);o.onsuccess=()=>t(o.result||[]),o.onerror=()=>a(o.error)})}async clearMessages(e){const t=await this.getMessages(e),a=this.db.transaction("messages","readwrite"),n=a.objectStore("messages");return t.forEach(s=>n.delete(s.id)),new Promise(s=>{a.oncomplete=s})}async saveSession(e){return this._put("sessions",e)}async getSessions(){return this._getAll("sessions")}async deleteSession(e){return this._delete("sessions",e)}async setMemory(e,t){return this._put("memory",{key:e,value:t,updatedAt:Date.now()})}async getMemory(e){return(await this._get("memory",e))?.value??null}async getAllMemory(){return this._getAll("memory")}async saveSkill(e){return this._put("skills",e)}async getSkills(){return this._getAll("skills")}async deleteSkill(e){return this._delete("skills",e)}async saveAutomation(e){return this._put("automations",e)}async getAutomations(){return this._getAll("automations")}async deleteAutomation(e){return this._delete("automations",e)}async saveChannel(e){return this._put("channels",e)}async getChannels(){return this._getAll("channels")}async deleteChannel(e){return this._delete("channels",e)}getSetting(e,t=null){try{const a=localStorage.getItem(`claw_${e}`);return a!==null?JSON.parse(a):t}catch{return t}}setSetting(e,t){localStorage.setItem(`claw_${e}`,JSON.stringify(t))}}class T{constructor(e){this.storage=e,this.providers={openai:{name:"OpenAI",models:["gpt-4o","gpt-4o-mini","gpt-4-turbo","o3-mini"],endpoint:"https://api.openai.com/v1/chat/completions"},anthropic:{name:"Anthropic",models:["claude-sonnet-4-20250514","claude-3-5-haiku-20241022"],endpoint:"https://api.anthropic.com/v1/messages"},google:{name:"Google",models:["gemini-3.1-pro","gemini-3.1-flash","gemini-3.1-flash-lite","gemini-2.5-pro","gemini-2.5-flash","gemini-2.5-flash-lite","gemma-4-31b"],endpoint:"https://generativelanguage.googleapis.com/v1beta/models"},ollama:{name:"Ollama (Local)",models:["llama3","mistral","codellama"],endpoint:"http://localhost:11434/api/chat"},custom:{name:"Custom / Gateway",models:["default"],endpoint:""},nano:{name:"Google AI Edge",models:["default"],endpoint:"window.ai"}},this.conversationHistory=[],this.systemPrompt=`You are ClawDroid, a personal AI assistant running on the user's Android device. You are helpful, concise, and capable.
You have access to native Android capabilities. To use them, you MUST output a command in this exact format:
<tool_call>{"name": "methodName", "args": {"param1": "value"}}</tool_call>

Available tools:
- getBatteryInfo(): Get battery level and charging status.
- getDeviceInfo(): Get device model, OS, etc.
- getNetworkStatus(): Get wifi/cellular connection status.
- getCurrentPosition(): Get GPS coordinates.
- showToast(message): Show a popup notification on the screen.
- hapticFeedback(type): Vibrate the device (type: 'light', 'medium', 'heavy').
- runTermuxCommand(executable, args, background): Run a Termux API command (e.g. executable: '/data/data/com.termux/files/usr/bin/termux-camera-photo', args: ['-c', '0', '/sdcard/photo.jpg'], background: true).

If you use a tool, output ONLY the tool call, then wait for the tool result to be provided.`}getProvider(){return this.storage.getSetting("ai_provider","openai")}getModel(){return this.storage.getSetting("ai_model","gpt-4o-mini")}getApiKey(){return this.storage.getSetting("ai_api_key","")}getGatewayUrl(){return this.storage.getSetting("gateway_url","")}async sendMessage(e,t=null){const a=this.getProvider(),n=this.getModel(),s=this.getApiKey();this.conversationHistory.push({role:"user",content:e}),this.conversationHistory.length>40&&(this.conversationHistory=this.conversationHistory.slice(-40));try{let o=await this._callProvider(a,n,s);this.conversationHistory.push({role:"assistant",content:o});const c=o.match(/<tool_call>([\s\S]*?)<\/tool_call>/);if(c&&this.device)try{const r=JSON.parse(c[1].trim());let l="";if(this.device[r.name]){const g=r.args?Object.values(r.args):[],u=await this.device[r.name](...g);l=JSON.stringify(u||{success:!0})}else l=`Error: Tool ${r.name} not found`;this.conversationHistory.push({role:"user",content:`Tool result: ${l}`});const d=await this._callProvider(a,n,s);return this.conversationHistory.push({role:"assistant",content:d}),o+`

`+d}catch(r){return o+`

[Tool Execution Error: ${r.message}]`}return o}catch(o){const c=`⚠️ Error: ${o.message||"Failed to reach AI provider"}`;return this.conversationHistory.push({role:"assistant",content:c}),c}}async _callProvider(e,t,a){switch(e){case"openai":return await this._callOpenAI(t,a);case"anthropic":return await this._callAnthropic(t,a);case"google":return await this._callGoogle(t,a);case"ollama":return await this._callOllama(t);case"custom":return await this._callGateway(this.conversationHistory[this.conversationHistory.length-1].content);case"nano":return await this._callNano(this.conversationHistory[this.conversationHistory.length-1].content);default:return"No AI provider configured."}}async _callOpenAI(e,t,a){if(!t)return"Please set your OpenAI API key in Settings.";const n=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:e,stream:!1,messages:[{role:"system",content:this.systemPrompt},...this.conversationHistory]})});if(!n.ok)throw new Error(`OpenAI ${n.status}: ${await n.text()}`);return(await n.json()).choices?.[0]?.message?.content||"No response."}async _callAnthropic(e,t,a){if(!t)return"Please set your Anthropic API key in Settings.";const n=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":t,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:e,max_tokens:4096,system:this.systemPrompt,messages:this.conversationHistory.map(o=>({role:o.role,content:o.content}))})});if(!n.ok)throw new Error(`Anthropic ${n.status}: ${await n.text()}`);return(await n.json()).content?.[0]?.text||"No response."}async _callGoogle(e,t,a){if(!t)return"Please set your Google AI API key in Settings.";const n=`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent?key=${t}`,s=this.conversationHistory.map(r=>({role:r.role==="assistant"?"model":"user",parts:[{text:r.content}]})),o=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemInstruction:{parts:[{text:this.systemPrompt}]},contents:s})});if(!o.ok)throw new Error(`Google ${o.status}: ${await o.text()}`);return(await o.json()).candidates?.[0]?.content?.parts?.[0]?.text||"No response."}async _callOllama(e,t){const a=await fetch("http://localhost:11434/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:e,stream:!1,messages:[{role:"system",content:this.systemPrompt},...this.conversationHistory]})});if(!a.ok)throw new Error(`Ollama ${a.status}`);return(await a.json()).message?.content||"No response."}async _callGateway(e,t){const a=this.getGatewayUrl();if(!a)return"Please set your Gateway URL in Settings → Gateway.";const n=await fetch(`${a}/v1/responses`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({input:e})});if(!n.ok)throw new Error(`Gateway ${n.status}`);const s=await n.json();return s.output?.[0]?.content?.[0]?.text||s.response||"No response."}async _callNano(e){if(typeof window>"u"||!window.ai||!window.ai.languageModel)return"Google AI Edge (window.ai.languageModel) is not available on this device or browser. Ensure you are using a supported environment like Chrome 131+ with Gemini Nano enabled in flags.";try{const t=await window.ai.languageModel.create({systemPrompt:this.systemPrompt}),a=this.conversationHistory.map(s=>`${s.role==="user"?"User":"Assistant"}: ${s.content}`).join("\\n"),n=await t.prompt(a);return t.destroy(),n}catch(t){return`On-device AI error: ${t.message}`}}clearHistory(){this.conversationHistory=[]}}const I="modulepreload",L=function(i){return"/"+i},k={},m=function(e,t,a){let n=Promise.resolve();if(t&&t.length>0){let o=function(l){return Promise.all(l.map(d=>Promise.resolve(d).then(g=>({status:"fulfilled",value:g}),g=>({status:"rejected",reason:g}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),r=c?.nonce||c?.getAttribute("nonce");n=o(t.map(l=>{if(l=L(l),l in k)return;k[l]=!0;const d=l.endsWith(".css"),g=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${g}`))return;const u=document.createElement("link");if(u.rel=d?"stylesheet":I,d||(u.as="script"),u.crossOrigin="",u.href=l,r&&u.setAttribute("nonce",r),document.head.appendChild(u),d)return new Promise((v,p)=>{u.addEventListener("load",v),u.addEventListener("error",()=>p(new Error(`Unable to preload CSS for ${l}`)))})}))}function s(o){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=o,window.dispatchEvent(c),!c.defaultPrevented)throw o}return n.then(o=>{for(const c of o||[])c.status==="rejected"&&s(c.reason);return e().catch(s)})};class ${constructor(){this._capacitorAvailable=typeof window<"u"&&window.Capacitor}async getDeviceInfo(){if(this._capacitorAvailable)try{const{Device:e}=await m(async()=>{const{Device:t}=await import("./index-CW8hYF21.js");return{Device:t}},__vite__mapDeps([0,1]));return await e.getInfo()}catch{}return{platform:"web",model:navigator.userAgent,operatingSystem:navigator.platform,osVersion:"",manufacturer:"",isVirtual:!1,webViewVersion:""}}async getBatteryInfo(){if(this._capacitorAvailable)try{const{Device:e}=await m(async()=>{const{Device:t}=await import("./index-CW8hYF21.js");return{Device:t}},__vite__mapDeps([0,1]));return await e.getBatteryInfo()}catch{}if(navigator.getBattery){const e=await navigator.getBattery();return{batteryLevel:e.level,isCharging:e.charging}}return{batteryLevel:-1,isCharging:!1}}async getNetworkStatus(){if(this._capacitorAvailable)try{const{Network:e}=await m(async()=>{const{Network:t}=await import("./index-C685uZ3A.js");return{Network:t}},__vite__mapDeps([2,1]));return await e.getStatus()}catch{}return{connected:navigator.onLine,connectionType:navigator.onLine?"wifi":"none"}}async takePhoto(){if(this._capacitorAvailable)try{const{Camera:e,CameraResultType:t,CameraSource:a}=await m(async()=>{const{Camera:n,CameraResultType:s,CameraSource:o}=await import("./index-CnHpQCC6.js");return{Camera:n,CameraResultType:s,CameraSource:o}},__vite__mapDeps([3,1]));return await e.getPhoto({quality:90,allowEditing:!1,resultType:t.DataUrl,source:a.Camera})}catch(e){throw new Error(`Camera error: ${e.message}`)}throw new Error("Camera not available in browser mode")}async pickPhoto(){if(this._capacitorAvailable)try{const{Camera:e,CameraResultType:t,CameraSource:a}=await m(async()=>{const{Camera:n,CameraResultType:s,CameraSource:o}=await import("./index-CnHpQCC6.js");return{Camera:n,CameraResultType:s,CameraSource:o}},__vite__mapDeps([3,1]));return await e.getPhoto({quality:90,allowEditing:!1,resultType:t.DataUrl,source:a.Photos})}catch(e){throw new Error(`Gallery error: ${e.message}`)}return new Promise((e,t)=>{const a=document.createElement("input");a.type="file",a.accept="image/*",a.onchange=n=>{const s=n.target.files[0];if(!s)return t(new Error("No file selected"));const o=new FileReader;o.onload=()=>e({dataUrl:o.result}),o.readAsDataURL(s)},a.click()})}async getCurrentPosition(){if(this._capacitorAvailable)try{const{Geolocation:e}=await m(async()=>{const{Geolocation:t}=await import("./index-CF0BtavD.js");return{Geolocation:t}},__vite__mapDeps([4,1]));return await e.getCurrentPosition({enableHighAccuracy:!0})}catch(e){throw new Error(`Location error: ${e.message}`)}return new Promise((e,t)=>{navigator.geolocation.getCurrentPosition(a=>e({coords:{latitude:a.coords.latitude,longitude:a.coords.longitude,accuracy:a.coords.accuracy}}),a=>t(new Error(`Location: ${a.message}`)))})}async hapticFeedback(e="medium"){if(this._capacitorAvailable)try{const{Haptics:t,ImpactStyle:a}=await m(async()=>{const{Haptics:s,ImpactStyle:o}=await import("./index-vvg_gp52.js");return{Haptics:s,ImpactStyle:o}},__vite__mapDeps([5,1])),n={light:a.Light,medium:a.Medium,heavy:a.Heavy};await t.impact({style:n[e]||a.Medium})}catch{}}async shareContent(e,t,a){if(this._capacitorAvailable)try{const{Share:n}=await m(async()=>{const{Share:s}=await import("./index-BOC1FbRT.js");return{Share:s}},__vite__mapDeps([6,1]));await n.share({title:e,text:t,url:a,dialogTitle:"Share via ClawDroid"})}catch{}else navigator.share&&await navigator.share({title:e,text:t,url:a})}async showToast(e){if(this._capacitorAvailable)try{const{Toast:a}=await m(async()=>{const{Toast:n}=await import("./index-o7Eh7dtK.js");return{Toast:n}},__vite__mapDeps([7,1]));await a.show({text:e,duration:"short"});return}catch{}const t=document.createElement("div");t.textContent=e,Object.assign(t.style,{position:"fixed",bottom:"100px",left:"50%",transform:"translateX(-50%)",background:"#333",color:"#fff",padding:"10px 20px",borderRadius:"8px",fontSize:"14px",zIndex:"9999",animation:"msg-in 0.3s ease-out"}),document.body.appendChild(t),setTimeout(()=>{t.style.opacity="0",setTimeout(()=>t.remove(),300)},2500)}async runTermuxCommand(e,t=[],a=!0){if(this._capacitorAvailable)try{const{registerPlugin:n}=await m(async()=>{const{registerPlugin:o}=await import("./index-CXATIzgh.js");return{registerPlugin:o}},[]);return await n("Termux").runCommand({executable:e,args:t,background:a}),{success:!0,message:`Dispatched ${e} to Termux.`}}catch(n){throw new Error(`Termux error: ${n.message}`)}throw new Error("Termux API not available in browser mode")}}class P{constructor(){this._capacitorAvailable=typeof window<"u"&&window.Capacitor,this._nextId=1}async requestPermission(){if(this._capacitorAvailable)try{const{LocalNotifications:e}=await m(async()=>{const{LocalNotifications:a}=await import("./index-DI3HpnVS.js");return{LocalNotifications:a}},__vite__mapDeps([8,1]));return(await e.requestPermissions()).display==="granted"}catch{}return"Notification"in window?await Notification.requestPermission()==="granted":!1}async schedule(e,t,a=null,n=null){const s=n||this._nextId++;if(this._capacitorAvailable)try{const{LocalNotifications:o}=await m(async()=>{const{LocalNotifications:r}=await import("./index-DI3HpnVS.js");return{LocalNotifications:r}},__vite__mapDeps([8,1])),c={notifications:[{title:e,body:t,id:s,schedule:a?{at:new Date(a)}:void 0,smallIcon:"ic_stat_icon",iconColor:"#6366f1"}]};return await o.schedule(c),s}catch(o){console.warn("Notification failed:",o)}if("Notification"in window&&Notification.permission==="granted")if(a){const o=new Date(a).getTime()-Date.now();o>0&&setTimeout(()=>new Notification(e,{body:t}),o)}else new Notification(e,{body:t});return s}async cancel(e){if(this._capacitorAvailable)try{const{LocalNotifications:t}=await m(async()=>{const{LocalNotifications:a}=await import("./index-DI3HpnVS.js");return{LocalNotifications:a}},__vite__mapDeps([8,1]));await t.cancel({notifications:[{id:e}]})}catch{}}async cancelAll(){if(this._capacitorAvailable)try{const{LocalNotifications:e}=await m(async()=>{const{LocalNotifications:a}=await import("./index-DI3HpnVS.js");return{LocalNotifications:a}},__vite__mapDeps([8,1])),t=await e.getPending();t.notifications.length&&await e.cancel(t)}catch{}}}class D{constructor(e){this.storage=e,this.channelTypes=[{id:"whatsapp",name:"WhatsApp",icon:"💬",color:"channel-whatsapp",desc:"Connect via WhatsApp Business API or gateway bridge"},{id:"telegram",name:"Telegram",icon:"✈️",color:"channel-telegram",desc:"Connect via Telegram Bot API token"},{id:"discord",name:"Discord",icon:"🎮",color:"channel-discord",desc:"Connect via Discord bot token"},{id:"slack",name:"Slack",icon:"💼",color:"channel-slack",desc:"Connect via Slack app token"},{id:"signal",name:"Signal",icon:"🔒",color:"channel-signal",desc:"Connect via Signal CLI or gateway"},{id:"webchat",name:"WebChat",icon:"🌐",color:"channel-whatsapp",desc:"Built-in web chat interface"},{id:"matrix",name:"Matrix",icon:"🔷",color:"channel-telegram",desc:"Connect via Matrix/Element homeserver"},{id:"irc",name:"IRC",icon:"📡",color:"channel-discord",desc:"Connect to IRC networks"}],this.activePolls={},this.onMessageReceived=null}getChannelTypes(){return this.channelTypes}async getConnectedChannels(){return this.storage.getChannels()}async startPolling(){(await this.getConnectedChannels()).forEach(t=>{t.type==="telegram"&&this._startTelegramPolling(t)})}stopPolling(){for(const e in this.activePolls)this.activePolls[e]=!1}async connectChannel(e){const t={id:`${e.type}_${Date.now()}`,type:e.type,name:e.name||this.channelTypes.find(a=>a.id===e.type)?.name,config:e,status:"connected",connectedAt:Date.now()};return await this.storage.saveChannel(t),t.type==="telegram"&&this._startTelegramPolling(t),t}async disconnectChannel(e){this.activePolls[e]&&(this.activePolls[e]=!1),await this.storage.deleteChannel(e)}async sendToChannel(e,t){const a=(await this.getConnectedChannels()).find(s=>s.id===e);if(!a)throw new Error("Channel not found");const n=this.storage.getSetting("gateway_url","");if(n)try{await fetch(`${n}/api/channels/${a.type}/send`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({channel:a.config,message:t})})}catch(s){throw new Error(`Failed to send via gateway: ${s.message}`)}switch(a.type){case"telegram":return this._sendTelegram(a.config,t);case"discord":return this._sendDiscord(a.config,t);default:return{sent:!0,via:"local"}}}async _sendTelegram(e,t){if(!e.botToken||!e.chatId)throw new Error("Missing Telegram config");const a=await fetch(`https://api.telegram.org/bot${e.botToken}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:e.chatId,text:t,parse_mode:"Markdown"})});if(!a.ok)throw new Error(`Telegram error: ${a.status}`);return a.json()}async _sendDiscord(e,t){if(!e.webhookUrl)throw new Error("Missing Discord webhook URL");const a=await fetch(e.webhookUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:t,username:"ClawDroid"})});if(!a.ok)throw new Error(`Discord error: ${a.status}`);return{sent:!0}}_startTelegramPolling(e){if(this.activePolls[e.id])return;this.activePolls[e.id]=!0;let t=0;const a=async()=>{if(this.activePolls[e.id]){try{const s=await(await fetch(`https://api.telegram.org/bot${e.config.botToken}/getUpdates?offset=${t+1}&timeout=30`)).json();if(s.ok&&s.result)for(const o of s.result)t=o.update_id,o.message&&o.message.text&&o.message.chat.id.toString()===e.config.chatId.toString()&&Math.floor(Date.now()/1e3)-o.message.date<60&&this.onMessageReceived&&this.onMessageReceived(e.id,o.message.text)}catch(n){console.error("Telegram poll error",n)}this.activePolls[e.id]&&setTimeout(a,1e3)}};a()}}class M{constructor(e){this.storage=e,this.timers=new Map}async getAutomations(){return this.storage.getAutomations()}async createAutomation(e){const t={id:`auto_${Date.now()}`,name:e.name,description:e.description||"",trigger:e.trigger,triggerConfig:e.triggerConfig,action:e.action,actionConfig:e.actionConfig,enabled:!0,createdAt:Date.now(),lastRun:null,runCount:0};return await this.storage.saveAutomation(t),t.enabled&&this._scheduleAutomation(t),t}async toggleAutomation(e){const a=(await this.getAutomations()).find(n=>n.id===e);if(a)return a.enabled=!a.enabled,await this.storage.saveAutomation(a),a.enabled?this._scheduleAutomation(a):this._cancelAutomation(e),a}async deleteAutomation(e){this._cancelAutomation(e),await this.storage.deleteAutomation(e)}_scheduleAutomation(e){if(this._cancelAutomation(e.id),e.trigger==="interval"&&e.triggerConfig?.intervalMs){const t=setInterval(()=>this._runAutomation(e),e.triggerConfig.intervalMs);this.timers.set(e.id,t)}else e.trigger==="time"&&e.triggerConfig?.time&&this._scheduleDailyAt(e)}_scheduleDailyAt(e){const[t,a]=e.triggerConfig.time.split(":").map(Number),n=new Date,s=new Date(n);s.setHours(t,a,0,0),s<=n&&s.setDate(s.getDate()+1);const o=s.getTime()-n.getTime(),c=setTimeout(()=>{this._runAutomation(e),this._scheduleDailyAt(e)},o);this.timers.set(e.id,c)}async _runAutomation(e){e.lastRun=Date.now(),e.runCount++,await this.storage.saveAutomation(e),this.onAutomationRun&&this.onAutomationRun(e)}_cancelAutomation(e){this.timers.has(e)&&(clearInterval(this.timers.get(e)),clearTimeout(this.timers.get(e)),this.timers.delete(e))}startAll(){this.getAutomations().then(e=>{e.filter(t=>t.enabled).forEach(t=>this._scheduleAutomation(t))})}stopAll(){this.timers.forEach((e,t)=>this._cancelAutomation(t))}getPresets(){return[{name:"☀️ Daily Digest",description:"Get a morning summary of weather, calendar, and news",trigger:"time",triggerConfig:{time:"08:00"},action:"ai_message",actionConfig:{message:"Give me a morning digest: weather summary, top 3 news headlines, and any reminders for today."}},{name:"📊 System Check",description:"Check device battery and storage every 2 hours",trigger:"interval",triggerConfig:{intervalMs:72e5},action:"ai_message",actionConfig:{message:"Check my device status: battery level, storage usage, and network connectivity."}},{name:"🔔 Reminder Ping",description:"Send a reminder notification every hour",trigger:"interval",triggerConfig:{intervalMs:36e5},action:"notification",actionConfig:{title:"ClawDroid Reminder",body:"Time to take a break and stretch! 🧘"}},{name:"📬 Evening Wrap-up",description:"End-of-day summary at 9 PM",trigger:"time",triggerConfig:{time:"21:00"},action:"ai_message",actionConfig:{message:"Give me an evening wrap-up: summarize what we discussed today and any pending tasks."}}]}}class N{constructor(){this.recognition=null,this.synthesis=window.speechSynthesis||null,this.isListening=!1,this._initRecognition()}_initRecognition(){const e=window.SpeechRecognition||window.webkitSpeechRecognition;e&&(this.recognition=new e,this.recognition.continuous=!0,this.recognition.interimResults=!0,this.recognition.lang="en-US")}startListening(e,t){if(!this.recognition){t?.("Voice recognition not supported on this device.");return}this.isListening=!0;let a="";this.recognition.onresult=n=>{let s="";for(let o=n.resultIndex;o<n.results.length;o++){const c=n.results[o][0].transcript;n.results[o].isFinal?a+=c:s+=c}e?.(s||a)},this.recognition.onend=()=>{this.isListening=!1,t?.(a.trim())},this.recognition.onerror=n=>{this.isListening=!1,n.error!=="aborted"&&t?.(a.trim()||null)};try{this.recognition.start()}catch{}}stopListening(){this.isListening=!1;try{this.recognition?.stop()}catch{}}speak(e,t){if(!this.synthesis)return;this.synthesis.cancel();const a=new SpeechSynthesisUtterance(e);a.rate=1,a.pitch=1,a.volume=1;const s=this.synthesis.getVoices().find(o=>o.name.includes("Google")||o.name.includes("Enhanced")||o.name.includes("Natural"));s&&(a.voice=s),t&&(a.onend=t),this.synthesis.speak(a)}stopSpeaking(){this.synthesis?.cancel()}isSupported(){return!!(window.SpeechRecognition||window.webkitSpeechRecognition)}}function B(i,e){const t=e.storage.getSetting("current_session","default");i.innerHTML=`
    <div class="chat-container">
      <div class="chat-messages" id="chat-messages">
        <div class="chat-welcome" id="chat-welcome">
          <div class="chat-welcome-icon">🦞</div>
          <h2>Welcome to ClawDroid</h2>
          <p>Your personal AI assistant, running right on your device.<br>Ask anything, automate tasks, or manage your digital life.</p>
          <div class="chat-suggestions">
            <button class="suggestion-chip" data-msg="What can you do?">What can you do?</button>
            <button class="suggestion-chip" data-msg="Help me write a message">Write a message</button>
            <button class="suggestion-chip" data-msg="Show my device info">Device info</button>
            <button class="suggestion-chip" data-msg="Set up a daily reminder">Daily reminder</button>
            <button class="suggestion-chip" data-msg="Summarize my conversations">Summarize chats</button>
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <div class="chat-input-wrapper">
          <div class="chat-input-actions">
            <button class="chat-action-btn" id="btn-attach" title="Attach">📎</button>
            <button class="chat-action-btn" id="btn-camera" title="Camera">📷</button>
          </div>
          <textarea id="chat-input" rows="1" placeholder="Message ClawDroid..." autocomplete="off"></textarea>
          <button class="chat-send-btn" id="btn-send" title="Send">➤</button>
        </div>
      </div>
    </div>
  `;const a=document.getElementById("chat-messages"),n=document.getElementById("chat-input"),s=document.getElementById("btn-send"),o=document.getElementById("chat-welcome");O(a,o,e,t),n.addEventListener("input",()=>{n.style.height="auto",n.style.height=Math.min(n.scrollHeight,120)+"px",s.classList.toggle("has-text",n.value.trim().length>0)}),n.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),c())}),s.addEventListener("click",c),document.querySelectorAll(".suggestion-chip").forEach(r=>{r.addEventListener("click",()=>{n.value=r.dataset.msg,c()})}),document.getElementById("btn-attach")?.addEventListener("click",async()=>{try{(await e.device.pickPhoto())?.dataUrl&&(h(a,"user","[📎 Image attached]",t,e),h(a,"assistant","I can see you attached an image. Image analysis is available when connected to a vision-capable model (GPT-4o, Gemini Pro Vision).",t,e))}catch{}}),document.getElementById("btn-camera")?.addEventListener("click",async()=>{try{(await e.device.takePhoto())?.dataUrl&&(h(a,"user","[📷 Photo captured]",t,e),h(a,"assistant","Photo captured! Connect a vision-capable model to analyze images.",t,e))}catch(r){e.device.showToast(r.message)}});async function c(){const r=n.value.trim();if(!r)return;n.value="",n.style.height="auto",s.classList.remove("has-text"),o?.classList.add("hidden"),h(a,"user",r,t,e);const l=H(r,e);if(l){h(a,"assistant",l,t,e);return}const d=R(a);try{const g=await e.ai.sendMessage(r);d.remove(),h(a,"assistant",g,t,e),e.storage.getSetting("auto_speak",!1)&&e.voice.speak(g)}catch(g){d.remove(),h(a,"assistant",`⚠️ ${g.message}`,t,e)}}}async function O(i,e,t,a){try{const n=await t.storage.getMessages(a);n.length>0&&(e?.classList.add("hidden"),n.forEach(s=>{_(i,s.role,s.content,s.timestamp)}),i.scrollTop=i.scrollHeight)}catch{}}function h(i,e,t,a,n){_(i,e,t),i.scrollTop=i.scrollHeight,n.storage.addMessage({sessionId:a,role:e,content:t}),n.device.hapticFeedback("light")}function _(i,e,t,a=null){const s=(a?new Date(a):new Date).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),o=e==="assistant"?"🦞":"👤",c=j(t),r=document.createElement("div");r.className=`message ${e}`,r.innerHTML=`
    <div class="message-avatar">${o}</div>
    <div>
      <div class="message-content">${c}</div>
      <div class="message-time">${s}</div>
    </div>
  `,i.appendChild(r)}function j(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/```(\w*)\n?([\s\S]*?)```/g,"<pre><code>$2</code></pre>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/\n/g,"<br>")}function R(i){const e=document.createElement("div");return e.className="message assistant",e.innerHTML=`
    <div class="message-avatar">🦞</div>
    <div class="message-content">
      <div class="typing-indicator">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
      </div>
    </div>
  `,i.appendChild(e),i.scrollTop=i.scrollHeight,e}function H(i,e){const t=i.toLowerCase().trim();return t==="/clear"||t==="/reset"?(e.ai.clearHistory(),e.storage.clearMessages(e.storage.getSetting("current_session","default")),setTimeout(()=>e.navigateTo("chat"),100),null):((t==="/device"||t.includes("device info"))&&e.device.getDeviceInfo().then(a=>{e.device.showToast(`${a.platform} • ${a.model}`)}),null)}function q(i,e){i.innerHTML='<div class="page-container" id="channels-page"></div>',w(e)}async function w(i){const e=document.getElementById("channels-page");if(!e)return;const t=await i.channels.getConnectedChannels(),a=i.channels.getChannelTypes();e.innerHTML=`
    <div class="page-header">
      <h2>Channels</h2>
      <p>Connect messaging platforms to interact with ClawDroid from anywhere.</p>
    </div>
    ${t.length>0?`
      <div class="section-title">Connected</div>
      ${t.map(n=>{const s=a.find(o=>o.id===n.type)||{};return`
          <div class="card">
            <div class="card-row">
              <div class="channel-icon ${s.color||""}">${s.icon||"📡"}</div>
              <div style="flex:1">
                <div class="card-title">${n.name||s.name}</div>
                <div class="card-subtitle">Connected ${new Date(n.connectedAt).toLocaleDateString()}</div>
              </div>
              <span class="badge badge-success">Active</span>
            </div>
            <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
              <button class="btn btn-sm btn-secondary" onclick="document.dispatchEvent(new CustomEvent('ch-test',{detail:'${n.id}'}))">Test</button>
              <button class="btn btn-sm btn-danger" onclick="document.dispatchEvent(new CustomEvent('ch-disconnect',{detail:'${n.id}'}))">Disconnect</button>
            </div>
          </div>`}).join("")}
    `:""}
    <div class="section-title">Available Channels</div>
    ${a.map(n=>`
      <div class="card" style="cursor:pointer" onclick="document.dispatchEvent(new CustomEvent('ch-connect',{detail:'${n.id}'}))">
        <div class="card-row">
          <div class="channel-icon ${n.color}">${n.icon}</div>
          <div style="flex:1">
            <div class="card-title">${n.name}</div>
            <div class="card-subtitle">${n.desc}</div>
          </div>
          <span style="color:var(--text-muted);font-size:20px">›</span>
        </div>
      </div>
    `).join("")}
  `,document.addEventListener("ch-disconnect",async n=>{await i.channels.disconnectChannel(n.detail),i.device.showToast("Channel disconnected"),w(i)},{once:!0}),document.addEventListener("ch-test",async n=>{try{await i.channels.sendToChannel(n.detail,"🦞 Test message from ClawDroid!"),i.device.showToast("Test message sent!")}catch(s){i.device.showToast(s.message)}},{once:!0}),document.addEventListener("ch-connect",n=>{G(n.detail,i)},{once:!0})}function G(i,e){const a=e.channels.getChannelTypes().find(o=>o.id===i);if(!a)return;const n={telegram:`<div class="input-group"><label class="input-label">Bot Token</label><input class="input-field" id="cfg-token" placeholder="123456:ABC-DEF..."/></div>
               <div class="input-group"><label class="input-label">Chat ID</label><input class="input-field" id="cfg-chatid" placeholder="-1001234567890"/></div>`,discord:'<div class="input-group"><label class="input-label">Webhook URL</label><input class="input-field" id="cfg-webhook" placeholder="https://discord.com/api/webhooks/..."/></div>',slack:'<div class="input-group"><label class="input-label">Webhook URL</label><input class="input-field" id="cfg-webhook" placeholder="https://hooks.slack.com/services/..."/></div>',whatsapp:'<div class="input-group"><label class="input-label">Gateway Bridge URL</label><input class="input-field" id="cfg-bridge" placeholder="http://your-gateway:18789"/></div>',signal:'<div class="input-group"><label class="input-label">Signal CLI API URL</label><input class="input-field" id="cfg-bridge" placeholder="http://localhost:8080"/></div>',webchat:'<p style="color:var(--text-secondary);font-size:13px">WebChat is built-in. No configuration needed.</p>',matrix:`<div class="input-group"><label class="input-label">Homeserver URL</label><input class="input-field" id="cfg-bridge" placeholder="https://matrix.org"/></div>
             <div class="input-group"><label class="input-label">Access Token</label><input class="input-field" id="cfg-token" placeholder="syt_..."/></div>`,irc:`<div class="input-group"><label class="input-label">Server</label><input class="input-field" id="cfg-bridge" placeholder="irc.libera.chat:6697"/></div>
          <div class="input-group"><label class="input-label">Channel</label><input class="input-field" id="cfg-chatid" placeholder="#mychannel"/></div>`},s=document.createElement("div");s.className="modal-backdrop",s.innerHTML=`
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">${a.icon} Connect ${a.name}</span>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      ${n[i]||'<p style="color:var(--text-secondary)">Configuration via Gateway recommended.</p>'}
      <div style="margin-top:20px;display:flex;gap:8px">
        <button class="btn btn-primary btn-block" id="modal-save">Connect</button>
      </div>
    </div>
  `,document.body.appendChild(s),s.querySelector("#modal-close").onclick=()=>s.remove(),s.addEventListener("click",o=>{o.target===s&&s.remove()}),s.querySelector("#modal-save").onclick=async()=>{const o={type:i},c=s.querySelector("#cfg-token"),r=s.querySelector("#cfg-chatid"),l=s.querySelector("#cfg-webhook"),d=s.querySelector("#cfg-bridge");c&&(o.botToken=c.value),r&&(o.chatId=r.value),l&&(o.webhookUrl=l.value),d&&(o.bridgeUrl=d.value),await e.channels.connectChannel(o),e.device.showToast(`${a.name} connected!`),s.remove(),w(e)}}const U=[{id:"web-browse",name:"Web Browser",icon:"🌐",desc:"Search the web and fetch page content",tags:["browse","search","fetch"],enabled:!0,builtin:!0},{id:"file-manage",name:"File Manager",icon:"📁",desc:"Read, write, and organize files on device",tags:["files","storage","organize"],enabled:!0,builtin:!0},{id:"code-exec",name:"Code Runner",icon:"💻",desc:"Execute JavaScript code snippets locally",tags:["code","javascript","eval"],enabled:!0,builtin:!0},{id:"calendar",name:"Calendar",icon:"📅",desc:"Manage events, reminders, and schedules",tags:["calendar","events","schedule"],enabled:!1,builtin:!0},{id:"email",name:"Email Compose",icon:"✉️",desc:"Draft and prepare email messages",tags:["email","compose","draft"],enabled:!1,builtin:!0},{id:"translate",name:"Translator",icon:"🌍",desc:"Translate text between languages",tags:["translate","language","i18n"],enabled:!0,builtin:!0},{id:"summarize",name:"Summarizer",icon:"📝",desc:"Summarize long text, articles, and conversations",tags:["summarize","tldr","digest"],enabled:!0,builtin:!0},{id:"location",name:"Location",icon:"📍",desc:"Get current GPS location and nearby places",tags:["gps","location","map"],enabled:!1,builtin:!0},{id:"contacts",name:"Contacts",icon:"👥",desc:"Access and search device contacts",tags:["contacts","people","phone"],enabled:!1,builtin:!0},{id:"clipboard",name:"Clipboard",icon:"📋",desc:"Read and write to system clipboard",tags:["clipboard","copy","paste"],enabled:!0,builtin:!0},{id:"qr-scan",name:"QR Scanner",icon:"🔲",desc:"Scan QR codes and barcodes via camera",tags:["qr","barcode","scan"],enabled:!1,builtin:!0},{id:"notes",name:"Notes",icon:"🗒️",desc:"Create and manage persistent notes",tags:["notes","memo","write"],enabled:!0,builtin:!0}];function z(i,e){i.innerHTML='<div class="page-container" id="skills-page"></div>',C(e)}async function C(i){const e=document.getElementById("skills-page");if(!e)return;const t=await i.storage.getSkills(),a=[...U,...t],n=a.filter(o=>o.enabled),s=a.filter(o=>!o.enabled);e.innerHTML=`
    <div class="page-header">
      <h2>Skills</h2>
      <p>Manage capabilities that extend what ClawDroid can do.</p>
    </div>
    <button class="btn btn-secondary btn-block mb-8" id="btn-add-skill">+ Add Custom Skill</button>
    <div class="section-title">Enabled (${n.length})</div>
    ${n.map(o=>S(o)).join("")}
    <div class="section-title">Available (${s.length})</div>
    ${s.map(o=>S(o)).join("")}
  `,e.querySelectorAll(".skill-toggle").forEach(o=>{o.addEventListener("change",async c=>{const r=c.target.dataset.skillId,l=a.find(d=>d.id===r);l&&(l.enabled=c.target.checked,l.builtin?i.storage.setSetting(`skill_${r}`,l.enabled):await i.storage.saveSkill(l),i.device.showToast(`${l.name} ${l.enabled?"enabled":"disabled"}`))})}),document.getElementById("btn-add-skill")?.addEventListener("click",()=>V(i))}function S(i){return`
    <div class="card">
      <div class="skill-card">
        <div class="skill-icon">${i.icon}</div>
        <div class="skill-info">
          <div class="skill-name">${i.name}${i.builtin?"":' <span class="badge badge-info">Custom</span>'}</div>
          <div class="skill-desc">${i.desc}</div>
          <div class="skill-tags">${i.tags.map(e=>`<span class="skill-tag">${e}</span>`).join("")}</div>
        </div>
        <label class="toggle">
          <input type="checkbox" class="skill-toggle" data-skill-id="${i.id}" ${i.enabled?"checked":""} />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>`}function V(i){const e=document.createElement("div");e.className="modal-backdrop",e.innerHTML=`
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">🔧 Add Custom Skill</span>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="input-group"><label class="input-label">Skill Name</label><input class="input-field" id="skill-name" placeholder="My Custom Skill"/></div>
      <div class="input-group"><label class="input-label">Description</label><input class="input-field" id="skill-desc" placeholder="What does this skill do?"/></div>
      <div class="input-group"><label class="input-label">Icon (emoji)</label><input class="input-field" id="skill-icon" placeholder="🔧" maxlength="2"/></div>
      <div class="input-group"><label class="input-label">Tags (comma-separated)</label><input class="input-field" id="skill-tags" placeholder="tag1, tag2"/></div>
      <div class="input-group"><label class="input-label">System Prompt</label><textarea class="input-field" id="skill-prompt" rows="4" placeholder="Instructions for the AI when this skill is active..."></textarea></div>
      <button class="btn btn-primary btn-block mt-16" id="modal-save">Add Skill</button>
    </div>
  `,document.body.appendChild(e),e.querySelector("#modal-close").onclick=()=>e.remove(),e.addEventListener("click",t=>{t.target===e&&e.remove()}),e.querySelector("#modal-save").onclick=async()=>{const t=e.querySelector("#skill-name").value.trim();if(!t)return;const a={id:`custom_${Date.now()}`,name:t,desc:e.querySelector("#skill-desc").value.trim(),icon:e.querySelector("#skill-icon").value.trim()||"🔧",tags:e.querySelector("#skill-tags").value.split(",").map(n=>n.trim()).filter(Boolean),prompt:e.querySelector("#skill-prompt").value.trim(),enabled:!0,builtin:!1};await i.storage.saveSkill(a),i.device.showToast(`Skill "${t}" added!`),e.remove(),C(i)}}function J(i,e){i.innerHTML='<div class="page-container" id="auto-page"></div>',y(e)}async function y(i){const e=document.getElementById("auto-page");if(!e)return;const t=await i.automation.getAutomations(),a=i.automation.getPresets();e.innerHTML=`
    <div class="page-header">
      <h2>Automation</h2>
      <p>Schedule recurring tasks, reminders, and proactive workflows.</p>
    </div>
    <button class="btn btn-primary btn-block mb-8" id="btn-create-auto">⚡ Create Automation</button>
    ${t.length>0?`
      <div class="section-title">Active Automations</div>
      ${t.map(n=>`
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">${n.name}</div>
              <div class="card-subtitle">${n.description||W(n)}</div>
            </div>
            <label class="toggle">
              <input type="checkbox" data-auto-id="${n.id}" class="auto-toggle" ${n.enabled?"checked":""}/>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="card-body" style="margin-top:8px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>Runs: ${n.runCount||0} • Last: ${n.lastRun?new Date(n.lastRun).toLocaleString():"Never"}</span>
              <button class="btn btn-sm btn-danger" data-del-auto="${n.id}">Delete</button>
            </div>
          </div>
        </div>
      `).join("")}
    `:`
      <div class="empty-state" style="margin-top:20px">
        <div class="empty-state-icon">⚡</div>
        <h3>No automations yet</h3>
        <p>Create one or use a preset to get started.</p>
      </div>
    `}
    <div class="section-title">Quick Presets</div>
    ${a.map((n,s)=>`
      <div class="card" style="cursor:pointer" data-preset="${s}">
        <div class="card-row">
          <div style="flex:1">
            <div class="card-title">${n.name}</div>
            <div class="card-subtitle">${n.description}</div>
          </div>
          <span style="color:var(--accent-light);font-size:13px;font-weight:600">+ Add</span>
        </div>
      </div>
    `).join("")}
  `,e.querySelectorAll(".auto-toggle").forEach(n=>{n.addEventListener("change",async s=>{await i.automation.toggleAutomation(s.target.dataset.autoId),i.device.showToast("Automation updated")})}),e.querySelectorAll("[data-del-auto]").forEach(n=>{n.addEventListener("click",async()=>{await i.automation.deleteAutomation(n.dataset.delAuto),i.device.showToast("Automation deleted"),y(i)})}),e.querySelectorAll("[data-preset]").forEach(n=>{n.addEventListener("click",async()=>{const s=a[parseInt(n.dataset.preset)];await i.automation.createAutomation(s),i.device.showToast(`"${s.name}" added!`),y(i)})}),document.getElementById("btn-create-auto")?.addEventListener("click",()=>F(i))}function W(i){return i.trigger==="interval"?`Every ${Math.round((i.triggerConfig?.intervalMs||0)/6e4)} minutes`:i.trigger==="time"?`Daily at ${i.triggerConfig?.time||"??:??"}`:i.trigger}function F(i){const e=document.createElement("div");e.className="modal-backdrop",e.innerHTML=`
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">⚡ New Automation</span>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="input-group"><label class="input-label">Name</label><input class="input-field" id="auto-name" placeholder="My Automation"/></div>
      <div class="input-group"><label class="input-label">Description</label><input class="input-field" id="auto-desc" placeholder="What it does"/></div>
      <div class="input-group">
        <label class="input-label">Trigger</label>
        <select class="input-field" id="auto-trigger">
          <option value="interval">Interval (repeat)</option>
          <option value="time">Daily at time</option>
        </select>
      </div>
      <div id="trigger-config">
        <div class="input-group"><label class="input-label">Interval (minutes)</label><input class="input-field" id="auto-interval" type="number" value="60" min="1"/></div>
      </div>
      <div class="input-group">
        <label class="input-label">Action</label>
        <select class="input-field" id="auto-action">
          <option value="ai_message">Send AI Prompt</option>
          <option value="notification">Show Notification</option>
        </select>
      </div>
      <div class="input-group"><label class="input-label">Message / Prompt</label><textarea class="input-field" id="auto-message" rows="3" placeholder="What should ClawDroid do?"></textarea></div>
      <button class="btn btn-primary btn-block mt-16" id="modal-save">Create</button>
    </div>
  `,document.body.appendChild(e);const t=e.querySelector("#auto-trigger"),a=e.querySelector("#trigger-config");t.addEventListener("change",()=>{t.value==="time"?a.innerHTML='<div class="input-group"><label class="input-label">Time</label><input class="input-field" id="auto-time" type="time" value="08:00"/></div>':a.innerHTML='<div class="input-group"><label class="input-label">Interval (minutes)</label><input class="input-field" id="auto-interval" type="number" value="60" min="1"/></div>'}),e.querySelector("#modal-close").onclick=()=>e.remove(),e.addEventListener("click",n=>{n.target===e&&e.remove()}),e.querySelector("#modal-save").onclick=async()=>{const n=e.querySelector("#auto-name").value.trim();if(!n)return;const s=t.value,o=s==="interval"?{intervalMs:(parseInt(e.querySelector("#auto-interval")?.value)||60)*6e4}:{time:e.querySelector("#auto-time")?.value||"08:00"},c=e.querySelector("#auto-action").value,r=e.querySelector("#auto-message").value.trim();await i.automation.createAutomation({name:n,description:e.querySelector("#auto-desc").value.trim(),trigger:s,triggerConfig:o,action:c,actionConfig:{message:r,title:n,body:r}}),i.device.showToast(`"${n}" created!`),e.remove(),y(i)}}function Y(i,e){i.innerHTML=`
    <div class="page-container">
      <div class="page-header">
        <h2>Files</h2>
        <p>Browse and manage files accessible to ClawDroid.</p>
      </div>
      <div class="card">
        <div class="card-row">
          <div class="skill-icon" style="background:rgba(59,130,246,0.15)">📄</div>
          <div style="flex:1">
            <div class="card-title">App Documents</div>
            <div class="card-subtitle">Files created by ClawDroid</div>
          </div>
        </div>
      </div>
      <div id="file-list"></div>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn btn-primary" id="btn-new-file" style="flex:1">📝 New Note</button>
        <button class="btn btn-secondary" id="btn-import-file" style="flex:1">📥 Import File</button>
      </div>
      <div class="section-title">Saved Notes</div>
      <div id="notes-list"></div>
    </div>
  `,b(e),document.getElementById("btn-new-file")?.addEventListener("click",()=>x(e)),document.getElementById("btn-import-file")?.addEventListener("click",()=>Q(e))}async function b(i){const e=document.getElementById("notes-list");if(!e)return;const t=await i.storage.getMemory("notes"),a=t?JSON.parse(t):[];if(a.length===0){e.innerHTML=`
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <h3>No notes yet</h3>
        <p>Create your first note or import a file.</p>
      </div>`;return}e.innerHTML=a.map((n,s)=>`
    <div class="card" style="cursor:pointer" data-note="${s}">
      <div class="card-header">
        <div class="card-title">${n.title||"Untitled"}</div>
        <span class="card-subtitle">${new Date(n.updatedAt).toLocaleDateString()}</span>
      </div>
      <div class="card-body" style="margin-top:4px">${(n.content||"").substring(0,100)}${n.content?.length>100?"...":""}</div>
    </div>
  `).join(""),e.querySelectorAll("[data-note]").forEach(n=>{n.addEventListener("click",()=>{const s=parseInt(n.dataset.note);x(i,a[s],s)})})}function x(i,e=null,t=-1){const a=document.createElement("div");a.className="modal-backdrop",a.innerHTML=`
    <div class="modal" style="max-height:90vh">
      <div class="modal-header">
        <span class="modal-title">${e?"✏️ Edit Note":"📝 New Note"}</span>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="input-group"><label class="input-label">Title</label><input class="input-field" id="note-title" value="${e?.title||""}" placeholder="Note title"/></div>
      <div class="input-group"><label class="input-label">Content</label><textarea class="input-field" id="note-content" rows="10" placeholder="Write your note...">${e?.content||""}</textarea></div>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn btn-primary" id="note-save" style="flex:1">Save</button>
        ${e?'<button class="btn btn-danger" id="note-delete" style="flex:1">Delete</button>':""}
      </div>
    </div>
  `,document.body.appendChild(a),a.querySelector("#modal-close").onclick=()=>a.remove(),a.addEventListener("click",n=>{n.target===a&&a.remove()}),a.querySelector("#note-save").onclick=async()=>{const n=await i.storage.getMemory("notes"),s=n?JSON.parse(n):[],o={title:a.querySelector("#note-title").value.trim()||"Untitled",content:a.querySelector("#note-content").value,updatedAt:Date.now()};t>=0?s[t]=o:s.unshift(o),await i.storage.setMemory("notes",JSON.stringify(s)),i.device.showToast("Note saved!"),a.remove(),b(i)},a.querySelector("#note-delete")?.addEventListener("click",async()=>{const n=await i.storage.getMemory("notes"),s=n?JSON.parse(n):[];s.splice(t,1),await i.storage.setMemory("notes",JSON.stringify(s)),i.device.showToast("Note deleted"),a.remove(),b(i)})}function Q(i){const e=document.createElement("input");e.type="file",e.accept=".txt,.md,.json,.csv,.log",e.onchange=async t=>{const a=t.target.files[0];if(!a)return;const n=new FileReader;n.onload=async()=>{const s=await i.storage.getMemory("notes"),o=s?JSON.parse(s):[];o.unshift({title:a.name,content:n.result,updatedAt:Date.now()}),await i.storage.setMemory("notes",JSON.stringify(o)),i.device.showToast(`"${a.name}" imported!`),b(i)},n.readAsText(a)},e.click()}function K(i,e){const t=e.storage.getSetting("gateway_url",""),a=t?"checking":"disconnected";i.innerHTML=`
    <div class="page-container">
      <div class="page-header">
        <h2>Gateway</h2>
        <p>Connect to an OpenClaw gateway for full agent capabilities.</p>
      </div>
      <div class="card gateway-status-card">
        <div class="gateway-dot disconnected" id="gw-dot"></div>
        <div class="card-title" id="gw-status-text">${t?"Checking connection...":"Not Connected"}</div>
        <div class="card-subtitle" style="margin-top:4px" id="gw-url-display">${t||"No gateway configured"}</div>
      </div>
      <div class="section-title">Connection</div>
      <div class="card">
        <div class="input-group" style="margin-bottom:12px">
          <label class="input-label">Gateway URL</label>
          <input class="input-field" id="gw-url" value="${t}" placeholder="http://192.168.1.100:18789"/>
        </div>
        <div class="input-group" style="margin-bottom:12px">
          <label class="input-label">Auth Token (optional)</label>
          <input class="input-field" id="gw-token" type="password" value="${e.storage.getSetting("gateway_token","")}" placeholder="Bearer token or API key"/>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" id="btn-gw-connect" style="flex:1">Connect</button>
          <button class="btn btn-secondary" id="btn-gw-test">Test</button>
        </div>
      </div>
      <div class="section-title">What is the Gateway?</div>
      <div class="card">
        <div class="card-body">
          <p>The <strong>OpenClaw Gateway</strong> is the control plane that runs on your PC, Mac, or server. It provides:</p>
          <ul style="margin:8px 0;padding-left:20px;color:var(--text-secondary);font-size:13px;line-height:1.8">
            <li>🖥️ Full shell & file access on your computer</li>
            <li>🌐 Web browser automation</li>
            <li>📬 Multi-channel message routing</li>
            <li>🧠 Persistent memory & context</li>
            <li>⚡ Cron jobs & proactive tasks</li>
            <li>🔧 Custom skills & tools</li>
          </ul>
          <p style="margin-top:8px;font-size:12px;color:var(--text-muted)">Without a gateway, ClawDroid works as a standalone AI chat app using your API key directly.</p>
        </div>
      </div>
      <div class="section-title">Gateway Info</div>
      <div id="gw-info"></div>
      <div class="section-title">Setup Guide</div>
      <div class="card">
        <div class="card-body" style="font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.8;color:var(--text-secondary)">
          <p style="color:var(--text-primary);font-weight:600;margin-bottom:8px">Quick Setup on your PC:</p>
          <code style="display:block;background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;margin-bottom:8px">npm install -g openclaw@latest<br>openclaw onboard --install-daemon</code>
          <p style="margin-top:8px">Then enter your PC's local IP and port 18789 above.</p>
          <p style="margin-top:4px">Find your IP: <code>ipconfig</code> (Windows) or <code>ifconfig</code> (Mac/Linux)</p>
        </div>
      </div>
    </div>
  `,document.getElementById("btn-gw-connect")?.addEventListener("click",()=>{const n=document.getElementById("gw-url").value.trim().replace(/\/$/,""),s=document.getElementById("gw-token").value.trim();e.storage.setSetting("gateway_url",n),e.storage.setSetting("gateway_token",s),e.device.showToast(n?"Gateway URL saved!":"Gateway disconnected"),f(n,s,e)}),document.getElementById("btn-gw-test")?.addEventListener("click",()=>{const n=document.getElementById("gw-url").value.trim().replace(/\/$/,""),s=document.getElementById("gw-token").value.trim();f(n,s,e)}),t&&f(t,e.storage.getSetting("gateway_token",""),e)}async function f(i,e,t){const a=document.getElementById("gw-dot"),n=document.getElementById("gw-status-text"),s=document.getElementById("gw-info");if(!i){a?.classList.remove("connected"),a?.classList.add("disconnected"),n&&(n.textContent="Not Connected");return}n&&(n.textContent="Connecting...");try{const o={"Content-Type":"application/json"};e&&(o.Authorization=`Bearer ${e}`);const c=await fetch(`${i}/api/health`,{headers:o,signal:AbortSignal.timeout(5e3)});if(c.ok){a?.classList.remove("disconnected"),a?.classList.add("connected"),n&&(n.textContent="Connected ✓"),t.device.showToast("Gateway connected!");try{const r=await c.json();s&&(s.innerHTML=`
            <div class="card">
              <div class="card-body" style="font-size:13px">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Version</span><span style="color:var(--text-primary)">${r.version||"Unknown"}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Uptime</span><span style="color:var(--text-primary)">${r.uptime||"N/A"}</span></div>
                <div style="display:flex;justify-content:space-between"><span>Channels</span><span style="color:var(--text-primary)">${r.channels||"N/A"}</span></div>
              </div>
            </div>`)}catch{}}else throw new Error(`HTTP ${c.status}`)}catch(o){a?.classList.remove("connected"),a?.classList.add("disconnected"),n&&(n.textContent=`Connection failed: ${o.message}`),s&&(s.innerHTML="")}}function X(i,e){const t=e.storage.getSetting("ai_provider","openai"),a=e.storage.getSetting("ai_model","gpt-4o-mini"),n=e.storage.getSetting("ai_api_key",""),s=e.storage.getSetting("user_name","User"),o=e.storage.getSetting("auto_speak",!1);e.storage.getSetting("dark_mode",!0);const c={openai:["gpt-4o","gpt-4o-mini","gpt-4-turbo","o3-mini"],anthropic:["claude-sonnet-4-20250514","claude-3-5-haiku-20241022"],google:["gemini-3.1-pro","gemini-3.1-flash","gemini-3.1-flash-lite","gemini-2.5-pro","gemini-2.5-flash","gemini-2.5-flash-lite","gemma-4-31b"],ollama:["llama3","mistral","codellama","phi3"],custom:["default"],nano:["default"]};i.innerHTML=`
    <div class="page-container">
      <div class="page-header">
        <h2>Settings</h2>
        <p>Configure ClawDroid to your liking.</p>
      </div>

      <div class="section-title">Profile</div>
      <div class="card">
        <div class="input-group" style="margin-bottom:0">
          <label class="input-label">Display Name</label>
          <input class="input-field" id="set-name" value="${s}" placeholder="Your name"/>
        </div>
      </div>

      <div class="section-title">AI Provider</div>
      <div class="card">
        <div class="input-group">
          <label class="input-label">Provider</label>
          <select class="input-field" id="set-provider">
            <option value="openai" ${t==="openai"?"selected":""}>OpenAI</option>
            <option value="anthropic" ${t==="anthropic"?"selected":""}>Anthropic</option>
            <option value="google" ${t==="google"?"selected":""}>Google (Gemini)</option>
            <option value="nano" ${t==="nano"?"selected":""}>Google AI Edge (On-Device)</option>
            <option value="ollama" ${t==="ollama"?"selected":""}>Ollama (Local)</option>
            <option value="custom" ${t==="custom"?"selected":""}>Custom / Gateway</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Model</label>
          <select class="input-field" id="set-model">
            ${(c[t]||[]).map(l=>`<option value="${l}" ${l===a?"selected":""}>${l}</option>`).join("")}
          </select>
        </div>
        <div class="input-group" style="margin-bottom:0">
          <label class="input-label">API Key</label>
          <input class="input-field" id="set-apikey" type="password" value="${n}" placeholder="sk-... or your API key"/>
          <p style="font-size:11px;color:var(--text-muted);margin-top:4px">Stored locally on your device. Never sent anywhere except your chosen provider.</p>
        </div>
      </div>

      <div class="section-title">Voice</div>
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="card-title">Auto-Speak Responses</div>
            <div class="card-subtitle">Read AI responses aloud</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="set-autospeak" ${o?"checked":""}/>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="section-title">Device & Integrations</div>
      <div class="card" id="device-info-card">
        <div class="card-body" style="font-size:13px;color:var(--text-secondary)">Loading device info...</div>
      </div>
      <div class="card">
        <button class="btn btn-secondary btn-block" id="btn-test-termux">⚡ Test Termux Connection</button>
        <p style="font-size:11px;color:var(--text-muted);margin-top:8px;text-align:center;">This will send a 'termux-toast' command to verify the bridge.</p>
      </div>

      <div class="section-title">Data</div>
      <div class="card">
        <button class="btn btn-secondary btn-block mb-8" id="btn-export">📤 Export All Data</button>
        <button class="btn btn-secondary btn-block mb-8" id="btn-import">📥 Import Data</button>
        <button class="btn btn-danger btn-block" id="btn-clear">🗑️ Clear All Data</button>
      </div>

      <div class="section-title">About</div>
      <div class="card" style="text-align:center">
        <div style="font-size:40px;margin-bottom:8px">🦞</div>
        <div class="card-title" style="font-size:18px">ClawDroid</div>
        <div class="card-subtitle" style="margin-top:4px">Version 1.0.0</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:8px">
          Open-source Android alternative to OpenClaw.<br>
          Built with Capacitor • MIT License
        </div>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:16px">
          <button class="btn btn-sm btn-secondary" onclick="window.open('https://github.com/openclaw/openclaw','_blank')">GitHub</button>
          <button class="btn btn-sm btn-secondary" onclick="window.open('https://docs.openclaw.ai','_blank')">Docs</button>
        </div>
      </div>
      <div style="height:40px"></div>
    </div>
  `,document.getElementById("set-provider")?.addEventListener("change",l=>{const d=c[l.target.value]||["default"],g=document.getElementById("set-model");g.innerHTML=d.map(u=>`<option value="${u}">${u}</option>`).join("")});const r=()=>{e.storage.setSetting("user_name",document.getElementById("set-name")?.value||"User"),e.storage.setSetting("ai_provider",document.getElementById("set-provider")?.value),e.storage.setSetting("ai_model",document.getElementById("set-model")?.value),e.storage.setSetting("ai_api_key",document.getElementById("set-apikey")?.value),e.storage.setSetting("auto_speak",document.getElementById("set-autospeak")?.checked||!1),e.device.showToast("Settings saved!")};["set-name","set-provider","set-model","set-apikey"].forEach(l=>{document.getElementById(l)?.addEventListener("change",r)}),document.getElementById("set-autospeak")?.addEventListener("change",r),Z(e),document.getElementById("btn-test-termux")?.addEventListener("click",async()=>{try{await e.device.runTermuxCommand("/data/data/com.termux/files/usr/bin/termux-toast",["ClawDroid Termux Bridge is Working!"],!0),e.device.showToast("Test command sent to Termux!")}catch(l){e.device.showToast("Error: "+l.message)}}),document.getElementById("btn-export")?.addEventListener("click",async()=>{const l={messages:await e.storage._getAll("messages"),sessions:await e.storage._getAll("sessions"),memory:await e.storage._getAll("memory"),skills:await e.storage._getAll("skills"),automations:await e.storage._getAll("automations"),channels:await e.storage._getAll("channels"),exportedAt:new Date().toISOString()},d=new Blob([JSON.stringify(l,null,2)],{type:"application/json"}),g=URL.createObjectURL(d),u=document.createElement("a");u.href=g,u.download=`clawdroid-backup-${Date.now()}.json`,u.click(),URL.revokeObjectURL(g),e.device.showToast("Data exported!")}),document.getElementById("btn-import")?.addEventListener("click",()=>{const l=document.createElement("input");l.type="file",l.accept=".json",l.onchange=async d=>{const g=d.target.files[0];if(!g)return;const u=new FileReader;u.onload=async()=>{try{const v=JSON.parse(u.result);if(v.messages)for(const p of v.messages)await e.storage._put("messages",p);if(v.memory)for(const p of v.memory)await e.storage._put("memory",p);if(v.skills)for(const p of v.skills)await e.storage._put("skills",p);if(v.automations)for(const p of v.automations)await e.storage._put("automations",p);if(v.channels)for(const p of v.channels)await e.storage._put("channels",p);e.device.showToast("Data imported successfully!")}catch{e.device.showToast("Invalid backup file")}},u.readAsText(g)},l.click()}),document.getElementById("btn-clear")?.addEventListener("click",async()=>{confirm("This will delete ALL data including messages, notes, automations, and channels. Continue?")&&(await e.storage._clear("messages"),await e.storage._clear("sessions"),await e.storage._clear("memory"),await e.storage._clear("skills"),await e.storage._clear("automations"),await e.storage._clear("channels"),localStorage.clear(),e.ai.clearHistory(),e.device.showToast("All data cleared"),e.navigateTo("chat"))})}async function Z(i){const e=document.getElementById("device-info-card");if(e)try{const t=await i.device.getDeviceInfo(),a=await i.device.getBatteryInfo(),n=await i.device.getNetworkStatus(),s=a.batteryLevel>=0?Math.round(a.batteryLevel*100)+"%":"N/A";e.innerHTML=`
      <div class="card-body" style="font-size:13px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--text-secondary)">Platform</span><span>${t.platform||"Web"}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--text-secondary)">OS</span><span>${t.operatingSystem||"Unknown"} ${t.osVersion||""}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--text-secondary)">Model</span><span>${t.model||"Unknown"}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--text-secondary)">Battery</span><span>${s}${a.isCharging?" ⚡":""}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text-secondary)">Network</span><span>${n.connected?"🟢 "+(n.connectionType||"Connected"):"🔴 Offline"}</span></div>
      </div>
    `}catch{e.innerHTML='<div class="card-body" style="font-size:13px;color:var(--text-muted)">Could not fetch device info</div>'}}const ee=[{id:"chat",icon:"💬",label:"Chat"},{id:"channels",icon:"📡",label:"Channels"},{id:"skills",icon:"🔧",label:"Skills"},{id:"automation",icon:"⚡",label:"Automation"},{id:"files",icon:"📁",label:"Files"},{id:"gateway",icon:"🖥️",label:"Gateway"}];function te(i,e){i.innerHTML=`
    <div class="sidebar-header">
      <div class="sidebar-profile">
        <div class="profile-avatar">🦞</div>
        <div class="profile-info">
          <span class="profile-name">${e.storage.getSetting("user_name","User")}</span>
          <span class="profile-status"><span class="status-dot online"></span> Online</span>
        </div>
      </div>
    </div>
    <div class="sidebar-nav">
      ${ee.map(t=>`
        <button class="nav-item ${t.id===e.currentPage?"active":""}" data-page="${t.id}">
          <span style="font-size:18px">${t.icon}</span><span>${t.label}</span>
        </button>
      `).join("")}
      <div class="nav-divider"></div>
      <button class="nav-item ${e.currentPage==="settings"?"active":""}" data-page="settings">
        <span style="font-size:18px">⚙️</span><span>Settings</span>
      </button>
    </div>
    <div class="sidebar-footer">
      <span class="sidebar-version">ClawDroid v1.0.0 • Open Source</span>
    </div>
  `,i.querySelectorAll(".nav-item").forEach(t=>{t.addEventListener("click",()=>e.navigateTo(t.dataset.page))})}function E(i,e){const t=[{id:"chat",icon:"💬",label:"Chat"},{id:"channels",icon:"📡",label:"Channels"},{id:"skills",icon:"🔧",label:"Skills"},{id:"settings",icon:"⚙️",label:"Settings"}];i.innerHTML=t.map(a=>`
    <button class="bottom-nav-item ${a.id===e.currentPage?"active":""}" data-page="${a.id}">
      <span style="font-size:20px">${a.icon}</span><span>${a.label}</span>
    </button>
  `).join(""),i.querySelectorAll(".bottom-nav-item").forEach(a=>{a.addEventListener("click",()=>{e.navigateTo(a.dataset.page),E(i,e)})})}class ae{constructor(){this.currentPage="chat",this.storage=new A,this.ai=new T(this.storage),this.device=new $,this.ai.device=this.device,this.notifications=new P,this.channels=new D(this.storage),this.automation=new M(this.storage),this.voice=new N}async init(){await this.storage.init(),this.renderShell(),this.bindEvents(),setTimeout(()=>{document.getElementById("splash-screen")?.classList.add("fade-out"),document.getElementById("app")?.classList.remove("hidden"),setTimeout(()=>document.getElementById("splash-screen")?.remove(),500)},1800),this.navigateTo("chat"),this.notifications.requestPermission(),this.channels.onMessageReceived=async(e,t)=>{try{const a=await this.ai.sendMessage(t,null);await this.channels.sendToChannel(e,a)}catch(a){console.error("Failed to handle incoming channel message:",a)}},await this.channels.startPolling()}renderShell(){te(document.getElementById("sidebar"),this),E(document.getElementById("bottom-nav"),this)}bindEvents(){document.getElementById("btn-menu")?.addEventListener("click",()=>this.toggleSidebar()),document.getElementById("sidebar-overlay")?.addEventListener("click",()=>this.closeSidebar()),document.getElementById("btn-voice")?.addEventListener("click",()=>this.toggleVoice())}navigateTo(e){this.currentPage=e,this.closeSidebar();const t=document.getElementById("main-content"),a=document.getElementById("page-title"),n={chat:"ClawDroid",channels:"Channels",skills:"Skills",automation:"Automation",files:"Files",gateway:"Gateway",settings:"Settings"};a.textContent=n[e]||"ClawDroid",document.querySelectorAll(".nav-item, .bottom-nav-item").forEach(o=>{o.classList.toggle("active",o.dataset.page===e)});const s={chat:B,channels:q,skills:z,automation:J,files:Y,gateway:K,settings:X};s[e]&&s[e](t,this)}toggleSidebar(){document.getElementById("sidebar")?.classList.toggle("open"),document.getElementById("sidebar-overlay")?.classList.toggle("hidden")}closeSidebar(){document.getElementById("sidebar")?.classList.remove("open"),document.getElementById("sidebar-overlay")?.classList.add("hidden")}toggleVoice(){const e=document.getElementById("voice-overlay");e.classList.contains("hidden")?(e.classList.remove("hidden"),this.voice.startListening(t=>{document.getElementById("voice-transcript").textContent=t},t=>{if(e.classList.add("hidden"),this.voice.stopListening(),t&&this.currentPage==="chat"){const a=document.getElementById("chat-input");a&&(a.value=t,a.dispatchEvent(new Event("input")))}})):(e.classList.add("hidden"),this.voice.stopListening())}}document.addEventListener("DOMContentLoaded",()=>{new ae().init()});export{m as _};
