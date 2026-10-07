(function(){
'use strict';
const P='gremio.v1.',base=document.body.dataset.base||'./';
const ui={
 toast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;clearTimeout(ui._t);ui._t=setTimeout(()=>t.textContent='',4000)},
 el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
};
/* store: única camada que toca localStorage; cai no conteúdo oficial (seed) se não houver dado local */
const store={
 get(k){try{const v=localStorage.getItem(P+k);if(v!==null)return JSON.parse(v)}catch(e){}
  return (window.GREMIO_SEED&&window.GREMIO_SEED[k])||[]},
 set(k,v){try{localStorage.setItem(P+k,JSON.stringify(v));return true}
  catch(e){ui.toast('Não foi possível salvar: armazenamento cheio ou bloqueado.');return false}}
};
ui.modal=function(title,nodes){let d=document.getElementById('dlg');
 if(!d){d=ui.el('dialog','dlg');d.id='dlg';d.setAttribute('aria-labelledby','dlgt');document.body.append(d);d.addEventListener('click',e=>{if(e.target===d)d.close()})}
 d.replaceChildren();const h=ui.el('h2',null,title);h.id='dlgt';const x=ui.el('button','btn','Fechar');x.type='button';x.onclick=()=>d.close();d.append(h,...nodes,x);d.showModal()};
const links=[['index.html','Início'],['calendario.html','Calendário'],['eventos.html','Eventos'],['propostas.html','Mural'],['integrantes.html','Integrantes'],['galeria.html','Galeria'],['contato.html','Contato']];
function shell(){
 const h=document.getElementById('header');
 h.innerHTML='<a class="skip" href="#main">Pular para o conteúdo</a><header class="top"><div class="wrap"><a class="brand" href="'+base+'" aria-label="Grêmio Desperta ETEC — início"><img src="'+base+'assets/logo.png" alt="Logo Desperta ETEC" height="48"></a><button class="burger" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav">☰</button><nav id="nav" aria-label="Principal"><ul></ul></nav></div></header>';
 const ul=h.querySelector('ul'),path=location.pathname.replace(/index\.html$/,'');
 links.forEach(([p,t])=>{const li=ui.el('li'),a=ui.el('a',null,t);a.href=base+p;
  const f=location.pathname.split('/').pop()||'index.html';if(f===p)a.setAttribute('aria-current','page');
  li.append(a);ul.append(li)});
 const b=h.querySelector('.burger'),n=h.querySelector('#nav');
 b.onclick=()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)};
 const m=window.GREMIO_SEED.contactEmail;
 document.getElementById('footer').innerHTML='<footer class="foot"><div class="wrap"><strong>Grêmio Estudantil Desperta ETEC</strong><p>Sua voz, nossa atitude.</p><p>Contato: <a href="mailto:'+m+'">'+m+'</a></p><p><small>© Grêmio Estudantil</small></p></div></footer><div id="toast" role="status" aria-live="polite"></div>';
}
const fmt=d=>d.split('-').reverse().join('/');
const events={
 end(e){return e.endDate&&e.endDate>=e.date?e.endDate:e.date},
 range(e){return e.endDate&&e.endDate>e.date?fmt(e.date)+' a '+fmt(e.endDate):fmt(e.date)},
 all(){return store.get('events').slice().sort((a,b)=>(a.date+(a.start||'')).localeCompare(b.date+(b.start||'')))},
 upcoming(n){const t=new Date().toLocaleDateString('sv-SE');return this.all().filter(e=>this.end(e)>=t).slice(0,n||99)},
 open(e){const n=[ui.el('span','badge',e.category||'Evento'),ui.el('p',null,'Data: '+this.range(e))];
  if(e.start)n.push(ui.el('p',null,'Horário: '+e.start));if(e.location)n.push(ui.el('p',null,'Local: '+e.location));
  n.push(ui.el('p',null,e.description||'Sem descrição.'));ui.modal(e.title,n)},
 card(e){const c=ui.el('article','card');c.tabIndex=0;c.setAttribute('role','button');c.setAttribute('aria-label','Ver detalhes: '+e.title);
  c.onclick=()=>this.open(e);c.onkeydown=k=>{if(k.key==='Enter'||k.key===' '){k.preventDefault();this.open(e)}};
  c.append(ui.el('span','badge',e.category||'Evento'),ui.el('h3',null,e.title),ui.el('p',null,this.range(e)+(e.start?' · '+e.start:'')+(e.location?' · '+e.location:'')));
  if(e.description)c.append(ui.el('p',null,e.description));c.append(ui.el('small','hint','Clique para ver detalhes'));return c},
 render(target,list,msg){target.replaceChildren();
  if(!list.length){target.append(ui.el('p','empty',msg||'Nenhum evento encontrado.'));return}
  list.forEach(e=>target.append(this.card(e)))}
};
const img=(file,max)=>new Promise((ok,no)=>{if(!/^image\/(jpeg|png|webp)$/.test(file.type))return no(new Error('Use JPG, PNG ou WebP.'));
 const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,max/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.8))};i.onerror=no;i.src=r.result};r.onerror=no;r.readAsDataURL(file)});
const mail=(v,sub,body)=>'mailto:'+store.get('contactEmail')+'?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(body);
window.Gremio={store,ui,events,img,mail};
document.addEventListener('DOMContentLoaded',()=>{shell();document.dispatchEvent(new Event('gremio:ready'))});
})();
