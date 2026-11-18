/* Speranza Ops — mise à jour de la collection depuis une capture de l'écran
   « Collections > Schémas » du jeu. Aucune IA : on mesure la couleur des cases.
   Une case acquise a un fond bleu de plan technique, une case manquante est noire.
   La grille du jeu suit l'ordre de window.BLUEPRINTS (17 colonnes). */
(() => {
  'use strict';
  const O=window.OPS,{$,$$,esc,BP,actions}=O,COLS=17,ROWS=Math.ceil(BP.length/COLS);
  const prefix=a=>{const p=new Float64Array(a.length+1);for(let i=0;i<a.length;i++)p[i+1]=p[i]+a[i];return p;};
  // Cherche le pas et le décalage d'un « peigne » de cases (largeur 0,92 pas) qui recouvre le mieux le bleu.
  function comb(profile,lo,hi,fixed){
    const P=prefix(profile),n=profile.length,sum=(a,b)=>P[Math.max(0,Math.min(n,Math.round(b)))]-P[Math.max(0,Math.min(n,Math.round(a)))];
    let best={score:-1};
    for(let p=fixed||lo;p<=(fixed||hi);p+=fixed?1:.25){
      for(let o=0;o<p;o+=.5){
        let inside=0,total=0;
        for(let x=o;x<n;x+=p){inside+=sum(x+.04*p,x+.88*p);total+=sum(x,x+p);}
        total+=sum(0,o);
        const score=total?inside/total*Math.sqrt(inside):0; // favorise un bleu concentré dans les cases
        if(score>best.score)best={score,p,o,ratio:total?inside/total:0};
      }
      if(fixed)break;
    }
    return best;
  }
  function analyze(img){
    const W0=img.naturalWidth||img.width,H0=img.naturalHeight||img.height,s=Math.min(1,1280/W0),W=Math.round(W0*s),H=Math.round(H0*s);
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(img,0,0,W,H);
    const px=cx.getImageData(0,0,W,H).data,blue=new Uint8Array(W*H),col=new Float64Array(W),row=new Float64Array(H);
    for(let y=0,i=0;y<H;y++)for(let x=0;x<W;x++,i++){const r=px[i*4],g=px[i*4+1],b=px[i*4+2];if(b>70&&b>r*1.6&&b>g*1.6){blue[i]=1;col[x]++;row[y]++;}}
    const totalBlue=col.reduce((a,b)=>a+b,0);
    if(totalBlue<W*H*.002)throw Error('Aucune case de schéma acquise n’a été trouvée. Capture l’écran Collections > Schémas en entier.');
    const cx1=comb(col,W*.03,W*.085);
    if(cx1.ratio<.8)throw Error('La grille des schémas n’a pas été reconnue. Capture l’écran Collections > Schémas en entier, sans fenêtre par-dessus.');
    const p=cx1.p,cy1=comb(row,0,0,p);
    const band=(profile,o)=>{const P=prefix(profile),list=[];for(let k=0,x=o;x+p*.5<profile.length;x+=p,k++){const v=P[Math.min(profile.length,Math.round(x+.88*p))]-P[Math.round(x+.04*p)];list.push(v);}const max=Math.max(...list);return list.map(v=>v>max*.08);};
    const cb=band(col,cx1.o),rb=band(row,cy1.o);
    const first=b=>b.indexOf(true),last=b=>b.lastIndexOf(true);
    // Si la première colonne ou la première rangée est entièrement manquante, on se cale sur les marges habituelles du jeu.
    const pick=(lo,hi,count,o,expected,size)=>{let best=lo,d=1e9;for(let k=Math.max(0,hi-count+1);k<=lo;k++){const dist=Math.abs(o+k*p-expected);if(o+(k+count)*p<=size+p*.2&&dist<d){d=dist;best=k;}}return best;};
    const c0=pick(first(cb),last(cb),COLS,cx1.o,W*.025,W),r0=pick(first(rb),last(rb),ROWS,cy1.o,H*.268,H);
    const x0=cx1.o+c0*p,y0=cy1.o+r0*p,ratios=[];
    for(let n=0;n<BP.length;n++){
      const ax=Math.round(x0+(n%COLS)*p+.05*p),ay=Math.round(y0+Math.floor(n/COLS)*p+.05*p),w=Math.round(.82*p),h=Math.round(.64*p);let c=0;
      for(let y=ay;y<ay+h&&y<H;y++)for(let x=ax;x<ax+w&&x<W;x++)if(y>=0&&x>=0)c+=blue[y*W+x];
      ratios.push(c/(w*h));
    }
    return {x0:x0/s,y0:y0/s,pitch:p/s,owned:ratios.map(r=>r>.06),unsure:ratios.map(r=>r>.015&&r<.11),W:W0,H:H0};
  }
  let state=null;
  function intro(error=''){
    O.openSheet('<h2>Importer une capture du jeu</h2><p>Dans ARC Raiders, ouvre <b>Collections › Schémas</b>, fais une capture d’écran, puis dépose-la ici. Le site lit la grille et coche pour toi les schémas acquis.</p>'+
      (error?'<p class="notice">'+esc(error)+'</p>':'')+
      '<label class="dropzone" id="capDrop"><input type="file" id="capFile" accept="image/*"><b>Choisir une image</b><span>ou la glisser ici, ou la coller avec Ctrl + V</span></label>'+
      '<p class="fine">L’image reste sur ton appareil : rien n’est envoyé. Tu vérifies le résultat avant de l’appliquer au profil « '+esc(O.P.name()||'—')+' ».</p>',{wide:true,label:'Importer une capture'});
    const drop=$('#capDrop');
    $('#capFile').onchange=e=>take(e.target.files[0]);
    drop.ondragover=e=>{e.preventDefault();drop.dataset.over='';};drop.ondragleave=()=>delete drop.dataset.over;
    drop.ondrop=e=>{e.preventDefault();take(e.dataTransfer.files[0]);};
  }
  async function take(file){
    if(!file||!file.type.startsWith('image/')){intro('Ce fichier n’est pas une image.');return;}
    const url=URL.createObjectURL(file),img=new Image();
    try{img.src=url;await img.decode();state={url,...analyze(img)};review();}
    catch(err){URL.revokeObjectURL(url);intro(err.message||'Image illisible.');}
  }
  function review(){
    const s=state,gw=s.pitch*COLS,gh=s.pitch*ROWS,n=s.owned.filter(Boolean).length,doubt=s.unsure.filter(Boolean).length;
    const cur=new Set(O.P.owned()),add=BP.filter((b,i)=>s.owned[i]&&!cur.has(b.id)),del=BP.filter((b,i)=>!s.owned[i]&&cur.has(b.id));
    const names=l=>l.slice(0,6).map(b=>esc(b.name)).join(', ')+(l.length>6?' et '+(l.length-6)+' autres':'');
    O.openSheet('<h2>Vérifie la lecture</h2><p><b>'+n+' schémas acquis</b> lus sur '+BP.length+'. Le jeu doit afficher « Trouvé(s) : '+n+'/'+BP.length+' ». Si une case est fausse, clique dessus pour la corriger.'+(doubt?' '+doubt+' case'+(doubt>1?'s sont à vérifier (cadre jaune).':' est à vérifier (cadre jaune).'):'')+'</p>'+
      '<div class="cap-grid" style="aspect-ratio:'+COLS+'/'+ROWS+';background-image:url(\''+s.url+'\');background-size:'+(s.W/gw*100)+'% '+(s.H/gh*100)+'%;background-position:'+(s.x0/(s.W-gw)*100)+'% '+(s.y0/(s.H-gh)*100)+'%">'+
      BP.map((b,i)=>'<button type="button" data-act="cap-toggle" data-i="'+i+'" aria-pressed="'+s.owned[i]+'"'+(s.unsure[i]?' data-unsure':'')+' title="'+esc(b.name)+'" aria-label="'+esc(b.name)+'"></button>').join('')+'</div>'+
      '<p class="cap-legend"><span><i data-k="on"></i>Acquis</span><span><i data-k="off"></i>À trouver</span></p>'+
      '<div class="cap-diff">'+(add.length?'<p><b class="plus">+'+add.length+'</b> à ajouter : '+names(add)+'</p>':'')+(del.length?'<p><b class="minus">−'+del.length+'</b> à retirer de ta collection : '+names(del)+'</p>':'')+(!add.length&&!del.length?'<p>Ta collection correspond déjà à cette capture.</p>':'')+'</div>'+
      '<div class="row"><button class="btn primary big" data-act="cap-apply"'+(!add.length&&!del.length?' disabled':'')+'>Appliquer au profil '+esc(O.P.name())+'</button><button class="btn" data-act="capture">Autre capture</button></div>',{wide:true,label:'Vérifier la capture'});
  }
  Object.assign(actions,{
    capture:()=>{if(!O.P.active()){O.P.choose();return;}if(state){URL.revokeObjectURL(state.url);state=null;}intro();},
    'cap-toggle':d=>{const i=Number(d.i);state.owned[i]=!state.owned[i];state.unsure[i]=false;const top=$('#sheet').scrollTop;review();$('#sheet').scrollTop=top;$('[data-act="cap-toggle"][data-i="'+i+'"]')?.focus({preventScroll:true});},
    'cap-apply':()=>{
      const ok=O.P.replaceOwned(BP.filter((b,i)=>state.owned[i]).map(b=>b.id));
      URL.revokeObjectURL(state.url);state=null;O.closeSheet();
      O.toast(ok?'Collection mise à jour depuis la capture.':'Stockage indisponible : la collection n’a pas pu être enregistrée.');
    }
  });
  document.addEventListener('paste',e=>{if(!$('#capDrop'))return;const f=[...e.clipboardData?.files||[]].find(f=>f.type.startsWith('image/'));if(f){e.preventDefault();take(f);}});
  window.OPS.captureAnalyze=analyze;
})();
