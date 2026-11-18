/* Une seule tuile ajoute de fines variations de peinture et de petites éraflures aux grands panneaux de métal.
   Projette les UV en coordonnées de repos pour que la finition reste collée à chaque pièce mobile. */
function createStudyFinish(THREE) {
  const tile = document.createElement('canvas');
  tile.width = tile.height = 512;
  const ctx = tile.getContext('2d'), image = ctx.createImageData(512,512);
  let seed = 41095;
  const random = ()=>((seed = (Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
  for(let i=0;i<image.data.length;i+=4){
    const grey = 243 + Math.floor(random()*12);
    image.data.set([grey,grey,grey,255],i);
  }
  ctx.putImageData(image,0,0);
  for(let i=0;i<24;i++){
    const x=random()*512,y=random()*512,radius=6+random()*24;
    const stain=ctx.createRadialGradient(x,y,0,x,y,radius);
    stain.addColorStop(0,'rgba(62,58,42,.08)');stain.addColorStop(1,'rgba(62,58,42,0)');
    ctx.fillStyle=stain;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
  }
  for(let i=0;i<160;i++){
    const x=random()*512, y=random()*512, length=random()**3*24+1;
    ctx.strokeStyle=i%4 ? 'rgba(45,49,40,.11)' : 'rgba(249,243,220,.4)';
    ctx.lineWidth=.4+random()*.75;ctx.beginPath();ctx.moveTo(x,y);
    ctx.lineTo(x+length,y+(random()-.5)*length*.7);ctx.stroke();
  }
  const map=new THREE.CanvasTexture(tile);
  map.wrapS=map.wrapT=THREE.RepeatWrapping;map.colorSpace=THREE.SRGBColorSpace;
  const relief=new THREE.CanvasTexture(tile);
  relief.wrapS=relief.wrapT=THREE.RepeatWrapping;
  function apply(geometry,material,p){
    if(material.metalness<.15 || material.emissiveIntensity>.1 && p.emissive)return;
    const coords=new Float32Array(p.positions.length/3*2), normal=p.normals;
    if(!normal)return;
    for(let i=0,j=0;i<p.positions.length;i+=3,j+=2){
      const x=p.positions[i], y=p.positions[i+1], z=p.positions[i+2];
      const ax=Math.abs(normal[i]), ay=Math.abs(normal[i+1]), az=Math.abs(normal[i+2]);
      coords[j]=(ax>az && ax>ay ? z : x)*1.5;
      coords[j+1]=(ay>az && ay>ax ? z : y)*1.5;
    }
    geometry.setAttribute('uv',new THREE.BufferAttribute(coords,2));material.map=map;
    material.bumpMap=relief;material.bumpScale=.0007;
    material.roughnessMap=relief;
    material.roughness=Math.min(.9,material.roughness+.17);
    material.envMapIntensity=.4;
  }
  return {apply,dispose(){map.dispose();relief.dispose();}};
}

/* Blender enregistre une transformation rigide en coordonnées monde par groupe mobile, à chaque échantillon. */
function createStudyPose(THREE, model, camera) {
  const study = model.study;
  const target = new THREE.Vector3(...study.camera.target);
  const translation = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const endRotation = new THREE.Quaternion();
  const scale = new THREE.Vector3(1, 1, 1);
  const frames = study.frames;
  // Les trois premiers montages du hangar datent d'avant le format de bibliothèque. On garde chaque ensemble
  // optique groupé, en séparant canons, blindage, membres et rotors.
  const legacyOffsets={
    body:[0,0,0],optic:[0,-.16,.77],eyebrow:[0,.68,.35],turret:[0,.78,0],
    gun:[0,.58,1.3],heart:[0,.3,-.46],canister:[0,.45,-1.6],
    rearL:[-.88,.45,-.75],rearR:[.88,.45,-.75],
    gunL:[-.68,-.36,.66],gunR:[.68,-.36,.66],
    launcherL:[-.85,-.82,.22],launcherR:[.85,-.82,.22]
  };
  function originalOffset(name){
    if(name.startsWith('lamp'))return legacyOffsets.optic;
    if(name==='turret' && model.parts.some(p=>p.group==='eyebrow'))return [0,-.8,0];
    if(legacyOffsets[name])return legacyOffsets[name];
    const part=/^(arm|nacelle|rotor|upper|lower)([FMR])([LR])$/.exec(name);
    if(!part)return [0,0,0];
    const [,kind,fore,side]=part;
    const radius={arm:.38,nacelle:.82,rotor:.86,upper:.54,lower:1.08}[kind];
    return [side==='L'?-radius:radius,{arm:.1,nacelle:.17,rotor:.96,upper:-.1,lower:-.45}[kind],
      (fore==='F'?1:fore==='R'?-1:0)*radius*.72];
  }
  const offsets=new Map([...new Set(model.parts.map(p=>p.group))].map(name=>[name,study.explode?.[name]||originalOffset(name)]));
  const identity = [0, 0, 0, 0, 0, 0, 1];
  let interval = 0;
  let photoFit, photoSignature;

  function positionCamera(state, aspect) {
    const fit = state.reference ? photoFit : null;
    const halfHeight = fit ? fit.span * Math.max(1, state.reference.aspect / aspect) / (2 * state.zoom)
      : study.camera.span / (2.55 * state.zoom * Math.min(1, aspect));
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.updateProjectionMatrix();
    const horizontal = Math.cos(state.pitch);
    camera.position.set(Math.sin(state.yaw) * horizontal, Math.sin(state.pitch),
      Math.cos(state.yaw) * horizontal).multiplyScalar(study.camera.span * 2.7).add(fit?.center || target);
    camera.lookAt(fit?.center || target);
    if(state.roll)camera.rotateZ(state.roll);
  }

  // Reprend la taille et le centre de l'objet dans la photo d'origine, indépendamment
  // du format de la vue. L'orientation de la caméra vient de l'artiste.
  function registerPhoto(reference, groups) {
    if (!reference) return;
    const signature=reference.aspect+':'+reference.box.join(',');
    if (photoFit && photoSignature===signature) return;
    photoSignature=signature;
    animateGroups(0, groups);
    positionCamera({...study.camera, zoom:1}, reference.aspect);
    camera.updateMatrixWorld();
    const bounds = new THREE.Box3(), vertex = new THREE.Vector3(), basis = new THREE.Matrix4();
    for (const part of model.lod?.parts || model.parts) {
      const group = groups.get(part.group);
      if (!group) continue;
      basis.multiplyMatrices(camera.matrixWorldInverse, group.matrix);
      for (let i = 0; i < part.positions.length; i += 3) {
        bounds.expandByPoint(vertex.fromArray(part.positions, i).applyMatrix4(basis));
      }
    }
    const size = bounds.getSize(new THREE.Vector3()), mid = bounds.getCenter(new THREE.Vector3());
    const [left, top, right, bottom] = reference.box;
    const span = Math.max(size.x / ((right-left) * reference.aspect), size.y / (bottom-top));
    const dx = mid.x - ((left+right)/2 - .5)*span*reference.aspect;
    const dy = mid.y - (.5-(top+bottom)/2)*span;
    const center = target.clone();
    center.addScaledVector(vertex.setFromMatrixColumn(camera.matrixWorld, 0), dx);
    center.addScaledVector(vertex.setFromMatrixColumn(camera.matrixWorld, 1), dy);
    photoFit = {center, span};
  }

  function animateGroups(time, groups, separation=0) {
    while (interval > 0 && frames[interval].time > time) interval--;
    while (interval < frames.length - 2 && frames[interval + 1].time <= time) interval++;
    const a = frames[interval];
    const b = frames[Math.min(interval + 1, frames.length - 1)];
    const blend = THREE.MathUtils.clamp((time - a.time) / (b.time - a.time || 1), 0, 1);
    for (const [name, group] of groups) {
      const left = a.pose[name] || identity;
      const right = b.pose[name] || identity;
      for (let i = 0; i < 3; i++) translation.setComponent(i, left[i] + (right[i] - left[i]) * blend);
      if(separation){
        const [dx,dy,dz]=offsets.get(name);
        translation.x+=dx*separation;translation.y+=dy*separation;translation.z+=dz*separation;
      }
      endRotation.fromArray(right, 3);
      rotation.fromArray(left, 3).slerp(endRotation, blend);
      group.matrix.compose(translation, rotation, scale);
    }
  }

  function effects(context, time, matrices, project, battle) {
    if(battle && battle.deathAt!==null)return;
    for (const fx of study.effects || []) {
      if(battle?.broken[fx.group]!==undefined)continue;
      if (time < fx.start || time >= fx.end) continue;
      const basis = matrices.get(fx.group);
      const start = project(...fx.from, basis);
      const end = project(...fx.to, basis);
      const progress = (time - fx.start) / (fx.end - fx.start);
      const rocket = fx.type === 'rocket';
      const tail = rocket ? Math.max(0, progress - .15) : 0;
      const head = rocket ? progress : 1;
      const dx = end[0] - start[0], dy = end[1] - start[1];
      context.save();
      context.strokeStyle = fx.color;
      context.shadowColor = fx.color;
      context.shadowBlur = rocket ? 8 : 3;
      context.lineWidth = rocket ? 3 : 1.25;
      context.beginPath();
      context.moveTo(start[0] + dx * tail, start[1] + dy * tail);
      context.lineTo(start[0] + dx * head, start[1] + dy * head);
      context.stroke();
      context.restore();
    }
  }
  function floorShadow(context, project, state) {
    if(state.reference || camera.position.y<=study.floor+.05)return;
    const r=study.camera.span*.35, y=study.floor;
    const center=project(0,y,0), x=project(r,y,0), z=project(0,y,r*.85);
    context.save();
    context.transform(x[0]-center[0], x[1]-center[1], z[0]-center[0], z[1]-center[1],center[0],center[1]);
    const shade=context.createRadialGradient(0,0,0,0,0,1);
    shade.addColorStop(0,'rgba(25,33,28,.45)');shade.addColorStop(.55,'rgba(28,36,31,.22)');shade.addColorStop(1,'rgba(30,38,33,0)');
    context.fillStyle=shade;context.beginPath();context.arc(0,0,1,0,Math.PI*2);context.fill();context.restore();
  }
  function labelPoints(context, marks, matrices, project, state, width, height) {
    // Garde le repère tactile de 44 px et son anneau de focus entièrement dans la vue.
    const sides=[[],[]], margin=28;
    const sceneMiddle=width/2;
    for(const point of study.points){
      const node=marks.get(point.id);
      if(node.hidden)continue;
      const [x,y]=project(...point.position,matrices.get(point.group));
      const exposure=point.visibleBetween;
      const visible=x>=1 && x<=width-1 && y>=1 && y<=height-1 &&
        (!exposure || state.explode>.7 || state.time>=exposure[0] && state.time<=exposure[1]);
      node.style.visibility=visible?'visible':'hidden';
      if(visible)sides[Number(x>=sceneMiddle)].push({node,x,y});
    }
    for(const [side, lane] of sides.entries()){
      lane.sort((a,b)=>a.y-b.y);
      const gap=Math.min(50,(height-margin*2)/Math.max(1,lane.length-1));
      let cursor=margin-gap;
      for(const mark of lane){mark.cy=Math.max(mark.y,cursor+gap);cursor=mark.cy;}
      cursor=height-margin+gap;
      for(let i=lane.length-1;i>=0;i--){
        const mark=lane[i];mark.cy=Math.min(mark.cy,cursor-gap);cursor=mark.cy;
      }
      for(const {node,x,y,cy} of lane){
        const offset=width<260?18:30;
        const cx=side ? Math.min(width-margin,Math.max(sceneMiddle+margin,x+offset))
          : Math.max(margin,Math.min(sceneMiddle-margin,x-offset));
        const on=state.activePin===(node.dataset.asPin||node.dataset.flTarget);
        context.beginPath();context.moveTo(x,y);context.lineTo(cx,cy);
        context.strokeStyle='#1c2a23bf';context.lineWidth=3;context.stroke();
        context.strokeStyle=on?'#fff3c6':'#f7dea2';context.lineWidth=1.2;context.stroke();
        context.beginPath();context.arc(x,y,on?3.6:2.8,0,Math.PI*2);
        context.fillStyle=on?'#fff2be':'#ffd782';context.fill();context.strokeStyle='#483e29';context.stroke();
        node.style.left=cx.toFixed(1)+'px';node.style.top=cy.toFixed(1)+'px';
      }
    }
  }
  return {positionCamera, registerPhoto, animateGroups, effects, labelPoints, floorShadow};
}
