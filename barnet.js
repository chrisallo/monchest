function e(e,t,i,n){return new(i||(i=Promise))((function(r,o){function s(e){try{d(n.next(e))}catch(e){o(e)}}function a(e){try{d(n.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?r(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(s,a)}d((n=n.apply(e,t||[])).next())}))}"function"==typeof SuppressedError&&SuppressedError;const t={encrypt:e=>JSON.stringify(e),decrypt:e=>JSON.parse(e)},i={a:100,n:"stacktrace"};class n{get reservedKeys(){return[`${this.name}.encryptcheck`]}resetIfEncryptionChanged(){return e(this,void 0,void 0,(function*(){const e=`${this.name}.encryptcheck`,t=yield this.get(e),n={encrypted:this.encryptionPolicy.encrypt(i)};if(t){t.encrypted!==n.encrypted&&(((...e)=>{console.warn(...e)})("Encryption algorithm has changed. Stored data would be cleared."),yield this.clear())}yield this.set(e,n)}))}createRawKey(e,t=0){return`${e}.${t}`}generateShardPostfixArray(e=1){return[...Array(e).keys()]}shardify(e){const{key:t,value:i}=e,n=this.encryptionPolicy.encrypt(i),r=Math.ceil(n.length/this.maxRawSize);return this.generateShardPostfixArray(r).map((e=>{const i={key:this.createRawKey(t,e),value:{data:n.substring(e*this.maxRawSize,(e+1)*this.maxRawSize)}};return 0===e&&(i.value.numberOfShards=r),i}))}constructor(e){const{name:i,maxRawSize:n,encryptionPolicy:r=t}=e;this.name=i,this.encryptionPolicy=r,this.maxRawSize=n?Math.max(n,10):4096}getAllKeys(){return e(this,void 0,void 0,(function*(){return(yield this.getAllRawKeys()).filter((e=>e.endsWith(".0"))).map((e=>e.replace(/\.0$/,""))).filter((e=>!this.reservedKeys.includes(e)))}))}get(t){return e(this,void 0,void 0,(function*(){const i=this.createRawKey(t),n=yield this.getRaw(i);if(n)try{const{data:i,numberOfShards:r}=n,o=r&&r>1?yield Promise.all(this.generateShardPostfixArray(r).map((n=>e(this,void 0,void 0,(function*(){if(n>0){const e=this.createRawKey(t,n),i=yield this.getRaw(e);return null==i?void 0:i.data}return i}))))):[i];return this.encryptionPolicy.decrypt(o.join(""))}catch(e){return null}return null}))}set(t,i){return e(this,void 0,void 0,(function*(){const e=this.shardify({key:t,value:i});yield this.setRaw(e)}))}setMany(t){return e(this,void 0,void 0,(function*(){const e=t.map((e=>this.shardify(e))).flat();yield this.setRaw(e)}))}remove(t){return e(this,void 0,void 0,(function*(){const e=this.createRawKey(t),i=yield this.getRaw(e);if(i){const{numberOfShards:e}=i;return yield this.removeRaw(this.generateShardPostfixArray(e).map((e=>this.createRawKey(t,e)))),!0}return!1}))}removeMany(t){return e(this,void 0,void 0,(function*(){const e=[];for(const i of t){const t=this.createRawKey(i),n=yield this.getRaw(t);if(n){const{numberOfShards:t}=n;e.push(...this.generateShardPostfixArray(t).map((e=>this.createRawKey(i,e))))}}e.length>0&&(yield this.removeRaw(e))}))}}const r=e=>new Promise((t=>{setTimeout(t,e)})),o={};class s extends n{constructor(e){var t,i,n;super(Object.assign(Object.assign({},e),{maxRawSize:null!==(t=e.maxRawSize)&&void 0!==t?t:10485760})),o[this.name]={},this.delay={read:null!==(i=e.readDelay)&&void 0!==i?i:0,write:null!==(n=e.writeDelay)&&void 0!==n?n:1}}get rawData(){return o[this.name]}init(){return e(this,void 0,void 0,(function*(){o[this.name]={}}))}clear(){return e(this,void 0,void 0,(function*(){yield r(this.delay.write),o[this.name]={}}))}getAllRawKeys(){return e(this,void 0,void 0,(function*(){return yield r(this.delay.read),Object.keys(o[this.name])}))}getRaw(t){var i;return e(this,void 0,void 0,(function*(){return yield r(this.delay.read),null!==(i=o[this.name][t])&&void 0!==i?i:null}))}setRaw(t){return e(this,void 0,void 0,(function*(){yield r(this.delay.write),t.forEach((e=>{o[this.name][e.key]=Object.assign({},e.value)}))}))}removeRaw(t){return e(this,void 0,void 0,(function*(){yield r(this.delay.write),t.forEach((e=>{o[this.name][e]&&delete o[this.name][e]}))}))}}var a;!function(e){e[e.STORAGE_NOT_AVAILABLE=300100]="STORAGE_NOT_AVAILABLE",e[e.STORAGE_NOT_INITIALIZED=300110]="STORAGE_NOT_INITIALIZED",e[e.DATA_ENCODING_FAILED=310400]="DATA_ENCODING_FAILED",e[e.DEBUGGING_MODE_REQUIRED=33e4]="DEBUGGING_MODE_REQUIRED"}(a||(a={}));class d extends Error{constructor(e){super(e.message),this.code=e.code}static get storageNotAvailable(){return new d({code:a.STORAGE_NOT_AVAILABLE,message:"Storage not available."})}static get storeNotInitialized(){return new d({code:a.STORAGE_NOT_AVAILABLE,message:"Storage is not initialized."})}static get dataEncodingFailed(){return new d({code:a.DATA_ENCODING_FAILED,message:"Failed to read data from Blob."})}static get debuggingModeRequired(){return new d({code:a.DEBUGGING_MODE_REQUIRED,message:"Debugging mode is required. Use BarnetMemoryStorage to enable the debugging mode."})}}const c=()=>"undefined"!=typeof document&&"undefined"!=typeof navigator&&"ReactNative"!==navigator.product;var l;!function(e){e[e.UNINITIALIZED=0]="UNINITIALIZED",e[e.OPENING=1]="OPENING",e[e.OPEN=2]="OPEN",e[e.CLOSED=3]="CLOSED"}(l||(l={}));const h="Barnet";class u extends n{constructor(e){super(Object.assign(Object.assign({},e),{maxRawSize:104857600})),this.openJobQueue=[],this.window="undefined"!=typeof window?window:void 0,this.indexedDb=this.window?this.window.indexedDB||this.window.mozIndexedDB||this.window.webkitIndexedDB||this.window.msIndexedDB:void 0}open(){return new Promise(((e,t)=>{if(this.indexedDb){this.state=l.OPENING;const i=this.indexedDb.open(this.name);i.addEventListener("upgradeneeded",(e=>{e.target.result.createObjectStore(h,{keyPath:"key"})})),i.addEventListener("success",(t=>{this.state=l.OPEN,this.database=t.target.result,this.openJobQueue.forEach((e=>e())),this.openJobQueue=[],this.database.onclose=()=>{this.database=void 0,this.state=l.OPENING,setTimeout((()=>{this.open()}),10)},e(this.database)})),i.addEventListener("error",(e=>{this.state=l.UNINITIALIZED,t(e.target.error)}))}else t(d.storageNotAvailable)}))}getObjectStore(t){return e(this,void 0,void 0,(function*(){if(this.database)return this.database.transaction(h,t).objectStore(h);switch(this.state){case l.UNINITIALIZED:case l.OPEN:throw d.storeNotInitialized;case l.OPENING:case l.CLOSED:return yield new Promise((e=>{this.openJobQueue.push((()=>e(this.getObjectStore(t))))}))}}))}init(){return e(this,void 0,void 0,(function*(){if(!this.window)throw d.storageNotAvailable;if(this.indexedDb=this.window.indexedDB||this.window.mozIndexedDB||this.window.webkitIndexedDB||this.window.msIndexedDB,!this.window||!c())throw d.storageNotAvailable;if(c()&&"string"==typeof navigator.userAgent&&navigator.userAgent.includes("Edge/")){if(!this.window.indexedDB&&(this.window.PointerEvent||this.window.MSPointerEvent))throw d.storageNotAvailable}else yield new Promise(((e,t)=>{if(this.indexedDb)try{const i=this.indexedDb.open("_testMozilla");i.onerror=()=>t(d.storageNotAvailable),i.onsuccess=()=>e()}catch(e){t(d.storageNotAvailable)}else t(d.storageNotAvailable)}));this.database=yield this.open(),yield this.resetIfEncryptionChanged()}))}clear(){return e(this,void 0,void 0,(function*(){const e=yield this.getObjectStore("readwrite");return yield new Promise(((t,i)=>{const n=e.clear();n.addEventListener("success",(()=>t())),n.addEventListener("error",(e=>i(e.target.error)))}))}))}getAllRawKeys(){return e(this,void 0,void 0,(function*(){const e=yield this.getObjectStore("readonly");return yield new Promise(((t,i)=>{const n=e.getAllKeys();n.addEventListener("success",(e=>t(e.target.result))),n.addEventListener("error",(e=>i(e.target.error)))}))}))}getRaw(t){return e(this,void 0,void 0,(function*(){const e=yield this.getObjectStore("readonly");return yield new Promise(((i,n)=>{const r=e.get(t);r.addEventListener("success",(e=>{var t;const n=null===(t=null==e?void 0:e.target)||void 0===t?void 0:t.result;i(null==n?void 0:n.value)})),r.addEventListener("error",(e=>n(e.target.error)))}))}))}setRaw(t){return e(this,void 0,void 0,(function*(){const e=yield this.getObjectStore("readwrite");yield Promise.all(t.map((t=>new Promise(((i,n)=>{const r=e.put(t);r.addEventListener("success",(e=>i())),r.addEventListener("error",(()=>n(new Error("Failed to write."))))})))))}))}removeRaw(t){return e(this,void 0,void 0,(function*(){const e=yield this.getObjectStore("readwrite");yield Promise.all(t.map((t=>new Promise(((i,n)=>{const r=e.delete(t);r.addEventListener("success",(()=>i(t))),r.addEventListener("error",(e=>n(e.target.error)))})))))}))}}var y,g;!function(e){e.Memory="memory",e.IndexedDB="indexeddb"}(y||(y={})),function(e){e.String="string",e.Object="json",e.Blob="binary",e.Unknown="unknown"}(g||(g={}));class v{constructor(e){const{name:t,debugMode:i=!1,storage:n=y.Memory,encryptionPolicy:r}=e;switch(this.name=t,this.storageInitialized=!1,this.debugMode=i,this.encryptionPolicy=r,n){case y.Memory:this.storage=new s({name:t,encryptionPolicy:r});break;case y.IndexedDB:this.storage=new u({name:t,encryptionPolicy:r})}}fallbackToMemoryStorage(){this.storage=new s({name:this.name,encryptionPolicy:this.encryptionPolicy})}guaranteeStorageInitialized(){return e(this,void 0,void 0,(function*(){if(this.storageInitialized)try{yield this.storage.init(),this.storageInitialized=!0}catch(e){if(e instanceof d&&e.code===a.STORAGE_NOT_AVAILABLE)this.fallbackToMemoryStorage(),yield this.guaranteeStorageInitialized()}}))}getMemoryStoreForDebugging(){if(this.debugMode&&this.storage instanceof s)return this.storage.rawData;throw d.debuggingModeRequired}save(t,i){var n;return e(this,void 0,void 0,(function*(){yield this.guaranteeStorageInitialized();const e={data:i,type:g.Unknown};i instanceof Blob?(e.data={dataUrl:yield new Promise(((e,t)=>{const n=new FileReader;n.onload=()=>e(n.result),n.onerror=()=>t(d.dataEncodingFailed),n.readAsDataURL(i)})),type:i.type},e.type=g.Blob):"object"==typeof i?e.type=g.Object:"string"==typeof i&&(e.type=g.String),yield null===(n=this.storage)||void 0===n?void 0:n.set(t,e)}))}load(t){var i;return e(this,void 0,void 0,(function*(){yield this.guaranteeStorageInitialized();const e=yield null===(i=this.storage)||void 0===i?void 0:i.get(t);if(e)switch(e.type){case g.Blob:{const{dataUrl:t,type:i}=e.data;if("undefined"!=typeof fetch){const e=yield fetch(t);return yield e.blob()}{const e=512,n=[],r=atob(t.split(",")[1]);for(let t=0;t<r.length;t+=e){const i=r.slice(t,t+e),o=new Array(i.length);for(let e=0;e<i.length;e++)o[e]=i.charCodeAt(e);n.push(new Uint8Array(o))}return new Blob(n,{type:i})}}case g.Object:case g.String:return e.data}return null}))}remove(t){var i;return e(this,void 0,void 0,(function*(){return yield this.guaranteeStorageInitialized(),yield null===(i=this.storage)||void 0===i?void 0:i.remove(t)}))}clear(){var t;return e(this,void 0,void 0,(function*(){yield this.guaranteeStorageInitialized(),yield null===(t=this.storage)||void 0===t?void 0:t.clear()}))}}export{v as Barnet,d as BarnetError,a as BarnetErrorCode,y as BarnetStorageType};
