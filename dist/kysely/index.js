import{c as O,f as k} from"../index-c0b43c1dd129ca28.js";var z=(B,f,D,p)=>{const M=I(f);return{currentOffset:K(B,f,D).catch(()=>0),rows:J(B,f,D,p).catch(()=>[]),totalRows:M.catch(()=>0)}},I=(B)=>B.select((f)=>f.fn.countAll().as("count")).executeTakeFirstOrThrow().then((f)=>f.count),J=(B,f,D,p)=>{if(f=f.limit(B.rowsPerPage),B.type==="offset"){f=f.offset(B.currentOffset);const M=B.sort.map((A)=>`${D}.${A.field} ${A.dir}`);return p(f.orderBy(M),M)}if(B.type==="cursor"){let M=B.sort.dir;if(B.direction==="before")M=k(M);const A=[`${D}.${B.sort.field} ${M}`];if(B.sort.field!==B.idColumn)A.push(`${D}.${B.idColumn} ${M}`);f=f.$call(E(B,D,M==="desc"?"<":">"));let L=p(f.orderBy(A),A);if(B.direction==="before")L=L.then((d)=>d.reverse());return L}return O(B)},K=async(B,f,D)=>{if(B.type==="offset")return B.currentOffset;if(B.type==="cursor"){if(!B.idCursor)return 0;if(B.sort.field!==B.idColumn&&!B.sortCursor)return 0;f=f.$call(E(B,D,B.sort.dir==="desc"?">":"<"));const p=await f.select((M)=>M.fn.countAll().as("count")).executeTakeFirstOrThrow().then((M)=>M.count);if(B.direction==="after")return p+1;if(B.direction==="before")return p-B.rowsPerPage;return O(B.direction)}return O(B)},E=(B,f,D)=>(p)=>{if(B.sort.field!==B.idColumn){if(B.idCursor&&B.sortCursor)p=p.where((M)=>M.or([M(`${f}.${B.sort.field}`,D,B.sortCursor),M.and([M(`${f}.${B.sort.field}`,"=",B.sortCursor),M(`${f}.${B.idColumn}`,D,B.idCursor)])]))}else if(B.idCursor)p=p.where(`${f}.${B.idColumn}`,D,B.idCursor);return p};var F=(B,f,D,p)=>{const M=z(B,f,D,p);return{...M,lastPageCursor:S(B,M.totalRows,f,D).catch(()=>null)}},S=async(B,f,D,p)=>{const M=await f;if(M<=B.rowsPerPage)return null;const{sort:A}=B,L=k(A?.dir??"asc");if(A)D=D.orderBy(`${p}.${A.field}`,L);if(A?.field!==B.idColumn)D=D.orderBy(`${p}.${B.idColumn}`,L);let d=M%B.rowsPerPage;if(d===0)d=B.rowsPerPage;D=D.offset(d),D=D.limit(1);const C=await D.select(`${p}.${B.idColumn}`).$if(!!A&&A.field!==B.idColumn,(H)=>H.select(`${p}.${A.field}`)).executeTakeFirst();if(!C)return null;return{id:C[B.idColumn],sort:A&&C[A.field]||void 0}};var G=(B,f,D,p)=>{return z(B,f,D,p)};function n(B,f,D,p){if(B.type==="offset")return G(B,f,D,p);if(B.type==="cursor")return F(B,f,D,p);return O(B)}export{n as createKyselyDataTableLoader};
