/* L'export Blender range les deux niveaux de zoom dans le même repère direct. */
function createFlightRenderer(viewport, anchors, studyModel) {
  'use strict';
  const T=window.THREE, model=studyModel || window.ATLAS_WASP_MESH;
  if(!T||!model?.parts?.length)throw Error('Modèle indisponible');
  const stage=viewport.querySelector('[data-stage-ground]'), stageCtx=stage.getContext('2d');
  const surface=viewport.querySelector('[data-stage-model]');
  const study = studyModel?.study;
  const camera = study ? new T.OrthographicCamera(-1,1,1,-1,.01,study.camera.span*8) : new T.PerspectiveCamera(35,1,.1,60);
  const scene=new T.Scene();
  const motion = study ? createStudyPose(T,model,camera) : null;
  let finish, dynamics;
  const fxCanvas=viewport.querySelector('[data-stage-fx]'), fx=fxCanvas?.getContext('2d');
  const root=new T.Group();scene.add(root);
  const parts=new Map(),matrices=new Map(),anchors3d=new Map();
  const vp=new T.Matrix4(),mvp=new T.Matrix4(), point=new T.Vector3(), normalMatrix=new T.Matrix3();
  const ring2d=new Path2D();
  ring2d.arc(0,0,1,0,Math.PI*2);
  const translation=new T.Matrix4(),spin=new T.Matrix4();
  const pivots=Object.fromEntries(Object.entries(model.pivots || {}).map(([key,v])=>[key.slice(5),v]));
  const raster=document.createElement('canvas');
  let rasterCtx,pixels,depth,rgba;
  let renderer=null,software=[],materials=[],kind='',width=1,height=1,dpr=1,disposed=false;
  for(const p of model.parts){
    if(p.group.startsWith('rotor')&&p.pivot)pivots[p.group.slice(5)]=p.pivot;
    if(!parts.has(p.group)){
      const group=new T.Group();group.name=p.group;group.matrixAutoUpdate=false;root.add(group);parts.set(p.group,group);
    }
  }
  const anchorGroups = new Map();
  if(study){
    for(const mark of study.points){
      anchors3d.set(mark.id,new T.Vector3(...mark.position));
      anchorGroups.set(mark.id,mark.group);
    }
  }else{
    for(const id of Object.keys(pivots)){
      anchors3d.set(id,new T.Vector3(...pivots[id]));anchorGroups.set(id,'arm'+id);
    }
    for(const id of ['optic','body']){
      anchors3d.set(id,new T.Vector3(...model.hotspots[id]));anchorGroups.set(id,id);
    }
  }
  function gpu(){
    // On demande le contexte nous-mêmes pour qu'un navigateur sans accélération se replie proprement.
    const opts={alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power'};
    const gl=surface.getContext('webgl2',opts)||surface.getContext('webgl',opts);
    if(!gl)throw Error('WebGL indisponible');
    renderer=new T.WebGLRenderer({...opts,canvas:surface,context:gl});
    renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
    scene.add(study ? new T.HemisphereLight(0xe5f0ff,0xbbafa4,2.15) : new T.HemisphereLight(0xfff4db,0x718c92,1.8));
    const sun=new T.DirectionalLight(0xffe3ac,3.4);sun.position.set(-3,6,4);scene.add(sun);
    const rim=new T.DirectionalLight(0xb3ebff,2.6);rim.position.set(4,2,-4);scene.add(rim);
    const bounce=new T.DirectionalLight(study?0xe0edff:0xffaa6a,study?1.6:1.15);bounce.position.set(-3,-3,2);scene.add(bounce);
    const studio=document.createElement('canvas');studio.width=256;studio.height=128;
    const c=studio.getContext('2d'),sky=c.createLinearGradient(0,0,0,128);
    sky.addColorStop(0,study?'#c4dcf1':'#e5efe8');sky.addColorStop(.45,study?'#9aafbf':'#667f82');sky.addColorStop(.53,study?'#58616a':'#263234');sky.addColorStop(1,study?'#9e8a77':'#805d43');c.fillStyle=sky;c.fillRect(0,0,256,128);
    c.fillStyle='#ffe9c5';c.fillRect(20,19,44,24);c.fillStyle='#e3fbff';c.fillRect(166,34,9,68);
    const reflection=new T.CanvasTexture(studio);reflection.mapping=T.EquirectangularReflectionMapping;reflection.colorSpace=T.SRGBColorSpace;scene.environment=reflection;
    if(study)finish=createStudyFinish(T);
    for(const p of model.parts){
      const geometry=new T.BufferGeometry();
      geometry.setAttribute('position',new T.Float32BufferAttribute(p.positions,3));
      if(p.indices?.length)geometry.setIndex(p.indices);
      if(p.normals?.length===p.positions.length)geometry.setAttribute('normal',new T.Float32BufferAttribute(p.normals,3));else geometry.computeVertexNormals();
      const color=new T.Color().setRGB(...p.color,T.SRGBColorSpace);
      const mat=new T.MeshStandardMaterial({color,metalness:p.metalness??.40,roughness:p.roughness??.43,envMapIntensity:.65,side:T.DoubleSide});
      if(p.colors?.length===p.positions.length){
        geometry.setAttribute('color',new T.Float32BufferAttribute(p.colors,3));
        mat.vertexColors=true;mat.color.setHex(0xffffff);
      }
      const emissive=p.emissive ?? (p.group==='optic'&&Math.max(...p.color)>.62 ? .74 : 0);
      if(emissive){mat.emissive.copy(color);mat.emissiveIntensity=emissive;}
      finish?.apply(geometry,mat,p);
      materials.push({mat,group:p.group,emissive,color,base:mat.color.clone()});
      parts.get(p.group).add(new T.Mesh(geometry,mat));
    }
    kind='webgl';surface.hidden=false;
    if(study)dynamics=createArcDynamics(T,model,root,parts,scene,true);
  }
  function cpu(){
    // Le rendu de secours projette et éclaire quand même de vrais triangles, et l'orbite reste libre.
    surface.hidden=true;kind='canvas';renderer=null;
    rasterCtx=raster.getContext('2d');
    const source=model.lod?.parts || model.parts;
    software=source.map(p=>{
      const pos=p.positions,idx=p.indices?.length?p.indices:Array.from({length:pos.length/3},(_,i)=>i);
      const colors=p.colors?.length===pos.length ? Float32Array.from(p.colors,
        value=>255*(value<=.0031308?12.92*value:1.055*value**(1/2.4)-.055)) : null;
      return {p,idx,colors,screen:new Float32Array(pos.length),light:new Float32Array(pos.length/3)};
    });
    if(study)dynamics=createArcDynamics(T,model,root,parts,scene,false);
    viewport.dataset.renderer=kind;
    size();
  }
  try{gpu();}catch{cpu();}
  viewport.dataset.renderer=kind;
  function lostContext(e){
    if(disposed)return;
    e.preventDefault();releaseGPU(false);cpu();viewport.dispatchEvent(new Event('flight-redraw'));
  }
  surface.addEventListener('webglcontextlost',lostContext);
  function size(){
    const box=viewport.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);
    dpr=Math.min(kind==='webgl'?1.65:1.35,window.devicePixelRatio||1);
    stage.width=Math.round(width*dpr);stage.height=Math.round(height*dpr);
    if(fxCanvas){fxCanvas.width=stage.width;fxCanvas.height=stage.height;}
    if(renderer){renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);}
    if(rasterCtx){
      const ratio=Math.min(dpr,820/width,510/height);
      raster.width=Math.max(1,Math.round(width*ratio));raster.height=Math.max(1,Math.round(height*ratio));
      pixels=rasterCtx.createImageData(raster.width,raster.height);
      rgba=new Uint32Array(pixels.data.buffer);depth=new Float32Array(rgba.length);
    }
    camera.aspect=width/height;camera.updateProjectionMatrix();
  }
  function project(x,y,z,world){
    point.set(x,y,z);if(world)point.applyMatrix4(world);point.applyMatrix4(vp);
    return [(point.x*.5+.5)*width,(.5-point.y*.5)*height];
  }
  function ring(radius,y,begin,end){
    const c=stageCtx,n=Math.max(2,Math.ceil((end-begin)*18));c.beginPath();
    for(let i=0;i<=n;i++){
      const a=begin+(end-begin)*i/n,p=project(radius*Math.cos(a),y,radius*Math.sin(a));
      if(i)c.lineTo(...p);else c.moveTo(...p);
    }
  }
  function ground(s){
    const c=stageCtx;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,width,height);
    if(camera.position.y<=-1)return;
    const y=-1.25;
    // Des marques concentriques d'atterrisseur donnent à la caméra un repère au sol visible.
    ring(2.64,y,0,Math.PI*2);c.fillStyle='rgba(24,31,30,.24)';c.fill();
    for(const [r,opacity] of [[2.64,.38],[2.51,.20],[2.1,.12],[1.84,.13]]){
      ring(r,y,0,Math.PI*2);c.lineWidth=1;c.strokeStyle='rgba(240,219,166,'+opacity+')';c.stroke();
    }
    const origin=project(0,y,0),side=project(1.56,y,0),front=project(0,y,1.33);
    c.save();c.transform(side[0]-origin[0],side[1]-origin[1],front[0]-origin[0],front[1]-origin[1],origin[0],origin[1]);
    const shadow=c.createRadialGradient(0,0,.05,0,0,1);shadow.addColorStop(0,'rgba(4,11,15,.68)');shadow.addColorStop(.58,'rgba(8,17,20,.39)');shadow.addColorStop(1,'rgba(8,17,20,0)');c.fillStyle=shadow;c.fill(ring2d);c.restore();
    for(let k=0;k<48;k++){
      const a=k*Math.PI/24,inner=k%4===0?2.42:2.54;
      const p=project(inner*Math.cos(a),y,inner*Math.sin(a)),q=project(2.6*Math.cos(a),y,2.6*Math.sin(a));
      c.beginPath();c.moveTo(...p);c.lineTo(...q);c.strokeStyle=k%4===0?'#e8c48a88':'#e8c48a42';c.stroke();
    }
    ring(2.63,y,s.time*.22,s.time*.22+.42);c.strokeStyle='#eac276ba';c.lineWidth=2.5;c.stroke();
  }
  function groupMatrix(group,s,target){
    const rotor=group.startsWith('rotor'),side=rotor?group.slice(5):group.startsWith('arm')?group.slice(3):null;
    const pivot=pivots[side], e=s.explosion;
    target.identity();
    if(pivot){
      target.makeTranslation(pivot[0]*.45*e,e*(rotor?.67:.22),pivot[2]*.43*e);
      if(rotor){
        const direction=side==='FR'||side==='RL'?-1:1;
        target.multiply(translation.makeTranslation(...pivot)).multiply(spin.makeRotationY(direction*(s.hits.get(side)??s.time)*24));
        target.multiply(translation.makeTranslation(-pivot[0],-pivot[1],-pivot[2]));
      }
    }else if(group==='optic')target.makeTranslation(0,-.18*e,.52*e);
  }
  function softwareDraw(s){
    rgba.fill(0);depth.fill(1);
    const w=raster.width,h=raster.height;
    for(const part of software){
      const {p,idx,screen,light}=part,world=matrices.get(p.group)||root.matrixWorld;
      const colors=s.hits.has(p.group.slice(-2))?null:part.colors;
      mvp.multiplyMatrices(vp,world);normalMatrix.getNormalMatrix(world);
      const v=mvp.elements,n=normalMatrix.elements,pos=p.positions,norm=p.normals;
      const rgb=s.hits.has(p.group.slice(-2))?[1,.59,.24]:p.color;
      const red=rgb[0]*255,green=rgb[1]*255,blue=rgb[2]*255;
      for(let j=0;j<pos.length;j+=3){
        const x=pos[j],y=pos[j+1],z=pos[j+2],inv=1/(v[3]*x+v[7]*y+v[11]*z+v[15]);
        screen[j]=((v[0]*x+v[4]*y+v[8]*z+v[12])*inv*.5+.5)*w;
        screen[j+1]=(.5-(v[1]*x+v[5]*y+v[9]*z+v[13])*inv*.5)*h;
        screen[j+2]=(v[2]*x+v[6]*y+v[10]*z+v[14])*inv;
        const a=norm[j],b=norm[j+1],c=norm[j+2];
        const nx=n[0]*a+n[3]*b+n[6]*c,ny=n[1]*a+n[4]*b+n[7]*c,nz=n[2]*a+n[5]*b+n[8]*c;
        light[j/3]=.59+.58*Math.max(0,-nx*.42+ny*.72+nz*.55)+.23*Math.max(0,nx*.7+ny*.5-nz*.5);
      }
      for(let i=0;i<idx.length;i+=3){
        const a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3;
        const ax=screen[a],ay=screen[a+1],bx=screen[b],by=screen[b+1],cx=screen[c],cy=screen[c+1];
        const det=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);
        if(Math.abs(det)<.08)continue;
        const x0=Math.max(0,Math.ceil(Math.min(ax,bx,cx)-.5)),x1=Math.min(w-1,Math.floor(Math.max(ax,bx,cx)-.5));
        const y0=Math.max(0,Math.ceil(Math.min(ay,by,cy)-.5)),y1=Math.min(h-1,Math.floor(Math.max(ay,by,cy)-.5));
        const ux=(by-cy)/det,uy=(cx-bx)/det,vx=(cy-ay)/det,vy=(ax-cx)/det;
        const za=screen[a+2]-screen[c+2],zb=screen[b+2]-screen[c+2],zc=screen[c+2];
        const lc=light[idx[i+2]],la=light[idx[i]]-lc,lb=light[idx[i+1]]-lc;
        for(let y=y0;y<=y1;y++){
          let u=(x0+.5-cx)*ux+(y+.5-cy)*uy,v=(x0+.5-cx)*vx+(y+.5-cy)*vy;
          for(let x=x0;x<=x1;x++,u+=ux,v+=vx){
            if(u<0||v<0||u+v>1)continue;
            const off=y*w+x,z=zc+za*u+zb*v;if(z>=depth[off])continue;
            depth[off]=z;const k=lc+la*u+lb*v;
            let r=red,g=green,bv=blue;
            if(colors){
              const bary=1-u-v;
              r=colors[a]*u+colors[b]*v+colors[c]*bary;
              g=colors[a+1]*u+colors[b+1]*v+colors[c+1]*bary;
              bv=colors[a+2]*u+colors[b+2]*v+colors[c+2]*bary;
            }
            rgba[off]=0xff000000|(Math.min(255,bv*k+8)<<16)|(Math.min(255,g*k+7)<<8)|Math.min(255,r*k+7);
          }
        }
      }
    }
    rasterCtx.putImageData(pixels,0,0);stageCtx.drawImage(raster,0,0,width,height);
  }
  function draw(s){
    if(disposed)return;
    if(study){
      motion.registerPhoto(s.reference,parts);
      motion.positionCamera(s,width/height);
      motion.animateGroups(s.time,parts,s.explode);
      dynamics?.apply(s);
    }else{
    const pitch=s.pitch,yaw=s.yaw+.07*Math.sin(s.time*.37),t=s.time;
    const dist=(Math.max(4.72,7.8/camera.aspect)+.56*s.explosion)/s.zoom;
    camera.position.set(Math.sin(yaw)*Math.cos(pitch)*dist,Math.sin(pitch)*dist,Math.cos(yaw)*Math.cos(pitch)*dist);
    camera.lookAt(0,-.05,0);
    root.rotation.set(.036*Math.sin(t*.89),.06*Math.sin(t*.49),.06*Math.sin(t*.72)-.18*s.settle);
    root.position.set(.03*Math.sin(t*.58),.07*Math.sin(t*1.4)-s.settle*.24,0);
    for(const [id,group] of parts)groupMatrix(id,s,group.matrix);
    }
    camera.updateMatrixWorld();vp.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    root.updateMatrixWorld(true);
    for(const [id,g] of parts)matrices.set(id,g.matrixWorld);
    if(fx){
      fx.setTransform(dpr,0,0,dpr,0,0);fx.clearRect(0,0,width,height);
      dynamics?.render(s,fx,matrices,project);
    }
    if(study){
      stageCtx.setTransform(dpr,0,0,dpr,0,0);stageCtx.clearRect(0,0,width,height);
      motion.floorShadow(stageCtx,project,s);
    }else ground(s);
    if(renderer){
      for(const {mat,group,emissive,color,base} of materials){
        const broken=s.battle?.broken[group]!==undefined;
        const dead=s.battle?.deathAt!==null && s.battle?.deathAt!==undefined;
        mat.color.copy(base).multiplyScalar(broken?.45:dead?.6:1);
        const impact=s.battle?.impacts.some(hit=>hit.group===group && s.battle.clock-hit.at<.12);
        if(impact || s.hits.has(group.slice(-2))){mat.emissive.setHex(0xfc741d);mat.emissiveIntensity=.7;}
        else if(broken||dead)mat.emissiveIntensity=0;
        else{mat.emissive.copy(color);mat.emissiveIntensity=emissive;}
      }
      renderer.render(scene,camera);
    }else softwareDraw(s);
    if(!study)for(const [id,node] of anchors){
      if(node.hidden)continue;
      const p=anchors3d.get(id),m=parts.get(anchorGroups.get(id))?.matrixWorld||root.matrixWorld;
      const [x,y]=project(p.x,p.y,p.z,m);
      node.style.left=x.toFixed(1)+'px';node.style.top=y.toFixed(1)+'px';
    }
    if(fx){
      if(!s.explode)motion?.effects(fx,s.time,matrices,project,s.battle);
      if(s.marks)motion.labelPoints(fx,anchors,matrices,project,s,width,height);
    }
  }
  function releaseGPU(dropContext){
    dynamics?.dispose();dynamics=null;
    scene.traverse(obj=>{if(obj.isMesh){obj.geometry.dispose();obj.material.dispose();}});
    scene.environment?.dispose();scene.environment=null;
    finish?.dispose();finish=null;
    if(renderer){renderer.dispose();if(dropContext)renderer.forceContextLoss();}
    materials=[];
  }
  function dispose(){
    disposed=true;surface.removeEventListener('webglcontextlost',lostContext);
    releaseGPU(true);renderer=null;software=[];depth=null;pixels=null;rgba=null;
  }
  function pick(clientX,clientY){
    if(!study)return null;
    const bounds=viewport.getBoundingClientRect();
    if(renderer){
      const ray=new T.Raycaster();
      ray.setFromCamera(new T.Vector2((clientX-bounds.left)/width*2-1,1-(clientY-bounds.top)/height*2),camera);
      const hit=ray.intersectObject(root,true)[0];
      if(hit){
        const group=hit.object.parent;
        const local=hit.point.clone().applyMatrix4(group.matrixWorld.clone().invert());
        return {group:group.name,position:local.toArray(),label:'Surface touchée'};
      }
      return null;
    }
    let closest=null,distance=42;
    for(const p of study.points){
      const xy=project(...p.position,matrices.get(p.group));
      const gap=Math.hypot(xy[0]-(clientX-bounds.left),xy[1]-(clientY-bounds.top));
      if(gap<distance){closest=p;distance=gap;}
    }
    return closest;
  }
  size();return {draw,size,dispose,pick,get kind(){return kind;}};
}
