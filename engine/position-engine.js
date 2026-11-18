// Tourne seulement dans un worker local. La carte a le nord en haut : deux repères
// suffisent donc à trouver l'échelle et le décalage, quels que soient le déplacement et le zoom du jeu.
function runPositionEngine() {
  'use strict';
  const cv = loadPositionFeatures();
  const cornerPool = new Proxy([], {get:(list, key) => list[key] || (list[key] = {angle:0})});
  const canvas = new OffscreenCanvas(1, 1);
  const context = canvas.getContext('2d', {willReadFrequently:true});
  let reference, frame, transform, calibration, lastFix, aspect, needsConfirmation=false;
  const references=new Map();
  let currentKey, nextSurvey=0;
  function pixels(image, width) {
    canvas.width = width;
    canvas.height = Math.max(1, Math.round(image.height * width / image.width));
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return context.getImageData(0, 0, canvas.width, canvas.height);
  }
  function features(pic, limit) {
    const {width:w,height:h} = pic;
    const gray = new cv.matrix_t(w,h,cv.U8C1_t);
    cv.imgproc.grayscale(pic.data,w,h,gray);
    const hist = new Uint32Array(256);
    for (let i=0;i<w*h;i+=3) hist[gray.data[i]]++;
    let white=0,total=0;
    while (white<255 && total<w*h*.32) total+=hist[white++];
    const gain=220/Math.max(48,white);
    for (let i=0;i<w*h;i++) gray.data[i]=Math.min(255,gray.data[i]*gain);
    cv.fast_corners.set_threshold(17);
    const count=cv.fast_corners.detect(gray,cornerPool,18);
    const corners=Array.from({length:count},(_,i)=>cornerPool[i]).sort((a,b)=>b.score-a.score);
    const tile=Math.max(14,Math.sqrt(w*h/limit)), cols=Math.ceil(w/tile), used=new Uint8Array(cols*Math.ceil(h/tile));
    const chosen=[];
    for (const pt of corners) {
      const k=Math.floor(pt.y/tile)*cols+Math.floor(pt.x/tile);
      if (used[k]>=2) continue;
      used[k]++;chosen.push(pt);
      if (chosen.length===limit) break;
    }
    const blurred=new cv.matrix_t(w,h,cv.U8C1_t);
    cv.imgproc.gaussian_blur(gray,blurred,5,1.2);
    const descriptors=new cv.matrix_t(32,chosen.length||1,cv.U8C1_t);
    cv.orb.describe(blurred,chosen,chosen.length,descriptors);
    return {xy:chosen.map(p=>[p.x,p.y]), words:new Uint32Array(descriptors.data.buffer,0,chosen.length*8)};
  }
  function prepare(image,compact=false) {
    const xy=[], descriptors=[];
    for (const width of compact?[460,700,1020,1480,2080]:[460,630,860,1170,1600,2180]) {
      const f=features(pixels(image,width),Math.round(Math.min(compact?1400:2300,width*1.6)));
      for (const p of f.xy) xy.push([p[0]/width,p[1]/width]);
      descriptors.push(f.words);
    }
    const words=new Uint32Array(xy.length*8);
    let at=0;
    for (const d of descriptors) {words.set(d,at);at+=d.length;}
    const buckets=Array.from({length:8*256},()=>[]);
    for (let i=0;i<xy.length;i++) for (let k=0;k<8;k++) buckets[k*256+(words[i*8+k]&255)].push(i);
    return {xy,words,buckets,aspect:image.height/image.width};
  }
  function bits(n) {
    n-=n>>>1&0x55555555;
    n=(n&0x33333333)+(n>>>2&0x33333333);
    return Math.imul((n+(n>>>4))&0x0f0f0f0f,0x01010101)>>>24;
  }
  function pairs(f, ratio, reference) {
    const found=[], seen=new Int32Array(reference.xy.length);
    for (let i=0;i<f.xy.length;i++) {
      let best=68, next=87, winner=-1;
      const pos=i*8;
      for (let k=0;k<8;k++) for (const j of reference.buckets[k*256+(f.words[pos+k]&255)]) {
        if (seen[j]===i+1) continue;
        seen[j]=i+1;
        let dist=0;
        for (let n=0;n<8 && dist<next;n++) dist+=bits(f.words[pos+n]^reference.words[j*8+n]);
        if (dist<best) {next=best;best=dist;winner=j;}
        else if (dist<next) next=dist;
      }
      if (winner>=0 && best<next*.89) found.push([f.xy[i][0]/ratio,f.xy[i][1]/ratio,...reference.xy[winner],best]);
    }
    return found;
  }
  function register(matches,w,h) {
    const points=matches.sort((a,b)=>a[4]-b[4]).slice(0,240);
    let best=null, bestCount=0;
    // Amorce avec les paires de repères les plus distinctives et les plus éloignées.
    for (let i=0;i<Math.min(40,points.length);i++) for(let j=i+1;j<Math.min(100,points.length);j++) {
      const a=points[i],b=points[j],dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy;
      if (d<2500) continue;
      const scale=((b[2]-a[2])*dx+(b[3]-a[3])*dy)/d;
      if (scale<1/6500||scale>1/220) continue;
      const tx=a[2]-a[0]*scale,ty=a[3]-a[1]*scale,tol=scale*4;
      let count=0;
      for(const p of points) if(Math.abs(p[2]-tx-p[0]*scale)<tol&&Math.abs(p[3]-ty-p[1]*scale)<tol) count++;
      if(count>bestCount){bestCount=count;best={scale,tx,ty};}
    }
    if (bestCount<12) return null;
    const support=points.filter(p=>Math.hypot(p[2]-best.tx-p[0]*best.scale,p[3]-best.ty-p[1]*best.scale)<best.scale*5);
    const tiles=new Set(support.map(p=>Math.floor(p[0]/55)+'/'+Math.floor(p[1]/55)));
    if (tiles.size<8||Math.max(...support.map(p=>p[0]))-Math.min(...support.map(p=>p[0]))<w*.15 ||
        Math.max(...support.map(p=>p[1]))-Math.min(...support.map(p=>p[1]))<h*.15) return null;
    return {...best,support};
  }
  function hueAt(data,i) {
    const r=data[i],g=data[i+1],b=data[i+2],hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo;
    if (!d) return [0,0,hi];
    return [((hi===r?(g-b)/d:hi===g?2+(b-r)/d:4+(r-g)/d)+6)%6,d/hi,hi];
  }
  function sampleColor(x,y) {
    let best=null, high=-Infinity;
    for(let yy=Math.max(0,y-5);yy<=Math.min(frame.height-1,y+5);yy++) for(let xx=Math.max(0,x-5);xx<=Math.min(frame.width-1,x+5);xx++){
      const color=hueAt(frame.data,(yy*frame.width+xx)*4);
      if(color[1]<.39||color[2]<65) continue;
      const score=color[1]*8+color[2]/180-Math.hypot(xx-x,yy-y);
      if(score>high){best=color;high=score;}
    }
    return best;
  }
  function components(color) {
    const {width:w,height:h,data}=frame, mask=new Uint8Array(w*h);
    // Les deux panneaux latéraux peuvent contenir une seconde copie de la flèche du joueur.
    const left=Math.ceil(w*.245),right=Math.floor(w*.777),top=Math.ceil(h*.105),bottom=Math.floor(h*.90);
    for(let y=top;y<bottom;y++) for(let x=left;x<right;x++){
      const k=y*w+x,i=k*4,hi=Math.max(data[i],data[i+1],data[i+2]),lo=Math.min(data[i],data[i+1],data[i+2]);
      if(hi<Math.max(46,color[2]*.53)||hi-lo<hi*Math.max(.3,color[1]*.66))continue;
      const hue=hueAt(data,i)[0],diff=Math.abs(hue-color[0]);
      if(Math.min(diff,6-diff)<.19)mask[k]=1;
    }
    const out=[],stack=[];
    for(let k=top*w;k<bottom*w;k++){
      if(!mask[k])continue;
      stack.push(k);mask[k]=0;
      let n=0,sx=0,sy=0,x0=w,x1=0,y0=h,y1=0,coords=[];
      while(stack.length){
        const v=stack.pop(),x=v%w,y=(v/w)|0;n++;sx+=x;sy+=y;
        x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
        if(n<=500)coords.push([x,y]);
        for(const d of [-w-1,-w,-w+1,-1,1,w-1,w,w+1])if(mask[v+d]){mask[v+d]=0;stack.push(v+d);}
      }
      if(n<7||n>490||x1-x0>36||y1-y0>36)continue;
      const x=sx/n,y=sy/n;
      if (!transform.support.some(p=>Math.hypot(p[0]-x,p[1]-y)<w*.16))continue;
      // Les quantiles radiaux ne dépendent pas de l'orientation du Raider.
      const radii=coords.map(p=>Math.hypot(p[0]-x,p[1]-y)/Math.sqrt(n)).sort((a,b)=>a-b);
      out.push({x,y,n,shape:[.5,.8,.95].map(q=>radii[Math.floor((n-1)*q)])});
    }
    return out;
  }
  function locate() {
    const options=components(calibration.color).filter(p=>p.n>=calibration.n*.62&&p.n<=calibration.n*1.55&&
      p.shape.every((v,i)=>Math.abs(v-calibration.shape[i])<.15));
    if(options.length!==1)return {kind:options.length?'ambiguous':'missing'};
    return project(options[0]);
  }
  function project(p) {
    const x=transform.tx+transform.scale*p.x,y=(transform.ty+transform.scale*p.y)/aspect;
    return x>=0&&x<=1&&y>=0&&y<=1?{kind:'found',x,y}:{kind:'missing'};
  }
  function offerPreview(reason){
    canvas.width=frame.width;canvas.height=frame.height;context.putImageData(frame,0,0);
    const preview=canvas.transferToImageBitmap();
    self.postMessage({kind:'identify',reason,preview},[preview]);
  }
  self.onmessage = ({data}) => {
    try {
      if (data.type==='reference') {
        try { reference=prepare(data.image); } finally {data.image.close();}
        currentKey=data.key;references.set(currentKey,reference);aspect=reference.aspect;
        calibration=null;lastFix=null;needsConfirmation=false;frame=null;transform=null;self.postMessage({kind:'ready'});return;
      }
      if(data.type==='candidate'){
        try { references.set(data.key,prepare(data.image,true)); }
        finally { data.image.close(); }
        nextSurvey=0;self.postMessage({kind:'candidate-ready'});return;
      }
      if (data.type==='identify') {
        if(!frame||!transform)return;
        const x=Math.round(data.x*frame.width),y=Math.round(data.y*frame.height),color=sampleColor(x,y);
        const p=color&&components(color).filter(p=>Math.hypot(p.x-x,p.y-y)<10).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
        if(!p){self.postMessage({kind:'bad-pick'});return;}
        calibration={color,n:p.n,shape:p.shape};
        const fix=locate();
        if(fix.kind!=='found'){
          calibration=null;lastFix=null;self.postMessage({kind:'uncertain-pick'});return;
        }
        needsConfirmation=false;lastFix={...fix,time:Date.now()};
        self.postMessage(fix);return;
      }
      if(data.type==='reset'){calibration=null;lastFix=null;needsConfirmation=false;return;}
      if(data.type!=='scan'||!reference)return;
      const image=data.image;let small,normal,ratio;
      try{
        const smaller=pixels(image,Math.round(image.width*.70));
        small=features(smaller,550);ratio=smaller.width/image.width;
        frame=pixels(image,image.width);
        normal=features(frame,850);
      }finally{image.close();}
      const match=ref=>register(pairs(small,ratio,ref).concat(pairs(normal,1,ref)),frame.width,frame.height);
      transform=match(reference);
      if(!transform && data.searchOthers && Date.now()>=nextSurvey){
        const hits=[];
        for(const [key,ref] of references){
          if(key===currentKey)continue;
          const registration=match(ref);
          if(registration)hits.push({key,ref,registration});
        }
        hits.sort((a,b)=>b.registration.support.length-a.registration.support.length);
        const best=hits[0],second=hits[1];
        if(best && best.registration.support.length>=15 && (!second||best.registration.support.length>second.registration.support.length*1.35)){
          reference=best.ref;currentKey=best.key;aspect=reference.aspect;transform=best.registration;
          lastFix=null;calibration=null;needsConfirmation=false;
          self.postMessage({kind:'chart',key:currentKey});
        }
        nextSurvey=Date.now()+1700;
      }
      if(!transform){self.postMessage({kind:'no-map'});return;}
      if(!calibration){offerPreview();return;}
      const fix=locate();
      if(fix.kind==='ambiguous')needsConfirmation=true;
      if(fix.kind==='found'){
        if(needsConfirmation){calibration=null;lastFix=null;offerPreview('ambiguous');return;}
        if(lastFix){
          const seconds=(Date.now()-lastFix.time)/1000;
          const distance=Math.hypot(fix.x-lastFix.x,(fix.y-lastFix.y)*aspect);
          if(distance>Math.min(.28,.055+seconds*.008)){
            calibration=null;lastFix=null;offerPreview('jump');return;
          }
        }
        lastFix={...fix,time:Date.now()};
      }
      self.postMessage(fix);
    } catch { self.postMessage({kind:'error'}); }
  };
}
