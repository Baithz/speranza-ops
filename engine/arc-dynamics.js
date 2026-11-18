/* Les dégâts sont un état d'inspection visuelle. Les seuils chiffrés relèvent de
   combat-engine.js et ne sont jamais déduits de ces animations de présentation. */
function createArcDynamics(THREE, model, root, groups, scene, useGPU) {
  'use strict';
  const study = model.study;
  const span = study.camera.span;
  const floor = study.floor;
  const center = new THREE.Vector3();
  const vector = new THREE.Vector3();
  const transform = new THREE.Matrix4();
  const turn = new THREE.Matrix4();
  const inverse = new THREE.Matrix4();
  const groupCenters = new Map();
  const emitterPosition = new THREE.Vector3();
  const emitterEnd = new THREE.Vector3();
  const identity = new THREE.Matrix4();
  const effectRoot = new THREE.Group();
  scene.add(effectRoot);
  const geometries = [];
  const materials = [];
  let sprites, points, smokeCloud, beams, rockets, scars, flameMesh, pulseLight;
  let beamPositions, particlePositions, particleColors, smokePositions, flamePositions, flameColors, flameUV;
  const maxParticles = 420;
  const maxBeams = 40;

  for (const name of groups.keys()) {
    const bounds = new THREE.Box3();
    for (const part of model.lod?.parts || model.parts) {
      if (part.group !== name) continue;
      for (let i = 0; i < part.positions.length; i += 3) {
        bounds.expandByPoint(vector.fromArray(part.positions, i));
      }
    }
    groupCenters.set(name, bounds.getCenter(new THREE.Vector3()));
  }

  function initializeGPU() {
    const glow = document.createElement('canvas');
    glow.width = glow.height = 64;
    const brush = glow.getContext('2d');
    const gradient = brush.createRadialGradient(32, 32, 0, 32, 32, 31);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(.2, '#ffffffd9');
    gradient.addColorStop(.55, '#ffffff51');
    gradient.addColorStop(1, '#ffffff00');
    brush.fillStyle = gradient;
    brush.fillRect(0, 0, 64, 64);
    sprites = new THREE.CanvasTexture(glow);
    const dots = new THREE.BufferGeometry();
    particlePositions = new Float32Array(maxParticles * 3);
    particleColors = new Float32Array(maxParticles * 3);
    dots.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    dots.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const dotMaterial = new THREE.PointsMaterial({size:9, map:sprites, vertexColors:true,
      transparent:true, depthWrite:false, blending:THREE.AdditiveBlending});
    points = new THREE.Points(dots, dotMaterial);
    points.frustumCulled = false;
    effectRoot.add(points);
    const smokeGeometry=new THREE.BufferGeometry();
    smokePositions=new Float32Array(90*3);
    smokeGeometry.setAttribute('position',new THREE.BufferAttribute(smokePositions,3));
    const smokeMaterial=new THREE.PointsMaterial({size:38,map:sprites,color:0x455048,opacity:.22,transparent:true,depthWrite:false});
    smokeCloud=new THREE.Points(smokeGeometry,smokeMaterial);smokeCloud.frustumCulled=false;effectRoot.add(smokeCloud);
    const lines = new THREE.BufferGeometry();
    beamPositions = new Float32Array(maxBeams * 6);
    lines.setAttribute('position', new THREE.BufferAttribute(beamPositions, 3));
    const beamMaterial = new THREE.LineBasicMaterial({color:0xffc974, transparent:true,
      opacity:.9, blending:THREE.AdditiveBlending, depthWrite:false});
    beams = new THREE.LineSegments(lines, beamMaterial);
    beams.frustumCulled = false;
    effectRoot.add(beams);
    const missileGeometry = new THREE.ConeGeometry(span * .009, span * .075, 8);
    const missileMaterial = new THREE.MeshStandardMaterial({color:0x414b49, roughness:.5, metalness:.7});
    rockets = new THREE.InstancedMesh(missileGeometry, missileMaterial, 16);
    rockets.frustumCulled = false;
    effectRoot.add(rockets);
    const flameGeometry=new THREE.BufferGeometry();
    flamePositions=new Float32Array(8192*3);flameColors=new Float32Array(8192*3);flameUV=new Float32Array(8192*2);
    flameGeometry.setAttribute('position',new THREE.BufferAttribute(flamePositions,3));
    flameGeometry.setAttribute('color',new THREE.BufferAttribute(flameColors,3));
    flameGeometry.setAttribute('uv',new THREE.BufferAttribute(flameUV,2));
    const flameMaterial=new THREE.ShaderMaterial({transparent:true,
      uniforms:{time:{value:0}},extensions:{derivatives:true},
      vertexShader:'attribute vec3 color; varying vec3 tint; varying vec3 view; varying vec2 coord; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);view=p.xyz;tint=color;coord=uv;gl_Position=projectionMatrix*p;}',
      fragmentShader:'uniform float time; varying vec3 tint; varying vec3 view; varying vec2 coord; void main(){vec3 n=normalize(cross(dFdx(view),dFdy(view)));float edge=smoothstep(0.0,0.65,abs(dot(n,normalize(-view))));float end=1.0-smoothstep(0.45,1.0,coord.x);float flicker=0.65+0.25*sin(coord.x*37.0-time*13.0+sin(coord.y*19.0));gl_FragColor=vec4(tint,0.4*edge*end*flicker);}',
      blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false});
    flameMesh=new THREE.Mesh(flameGeometry,flameMaterial);flameMesh.frustumCulled=false;effectRoot.add(flameMesh);
    const scarGeometry=new THREE.SphereGeometry(span*.009,6,4);
    const scarMaterial=new THREE.MeshStandardMaterial({color:0x151610,roughness:1,metalness:0});
    scars=new THREE.InstancedMesh(scarGeometry,scarMaterial,32);
    scars.frustumCulled=false;effectRoot.add(scars);
    pulseLight = new THREE.PointLight(0xff882b, 0, span * 2, 1.5);
    effectRoot.add(pulseLight);
    geometries.push(dots, lines, missileGeometry,scarGeometry,smokeGeometry,flameGeometry);
    materials.push(dotMaterial, beamMaterial, missileMaterial,scarMaterial,smokeMaterial,flameMaterial);
  }
  if (useGPU) initializeGPU();

  function seed(n) {
    return Math.sin(n * 127.1 + 311.7) * 43758.5453 % 1;
  }

  function apply(state) {
    const battle = state.battle;
    root.position.set(0, 0, 0);
    root.rotation.set(0, 0, 0);
    if (!battle) return;
    const deadAge = battle.deathAt === null ? -1 : Math.max(0, battle.clock - battle.deathAt);
    if (deadAge >= 0) {
      const fallen = 1 - Math.exp(-deadAge * 2.5);
      root.position.y = -span * .11 * fallen;
      root.rotation.z = .22 * fallen;
      root.rotation.x = -.12 * fallen;
    }
    for (const [name, group] of groups) {
      const breakAt = battle.broken[name];
      if (breakAt === undefined) continue;
      const age = Math.max(0, battle.clock - breakAt);
      const localCenter = groupCenters.get(name);
      center.copy(localCenter).applyMatrix4(group.matrix);
      const direction = Math.sign(center.x) || (seed(name.length) > 0 ? 1 : -1);
      const scatter = 1 - Math.exp(-age * 1.4);
      const lift = Math.max(floor + span * .025 - center.y, span * (.24 * age - .46 * age * age));
      const wobble = Math.sin(Math.max(0, age - .6) * 13) * Math.exp(-age * 2) * span * .025;
      transform.makeTranslation(direction * scatter * span * .2, lift + wobble, scatter * span * .1);
      group.matrix.premultiply(transform);
      const spin = Math.min(age, 1.65) * direction;
      turn.makeRotationZ(spin * 1.4);
      transform.makeTranslation(center.x, center.y + lift, center.z);
      inverse.makeTranslation(-center.x, -center.y - lift, -center.z);
      group.matrix.premultiply(inverse).premultiply(turn).premultiply(transform);
    }
  }

  function render(state, context, matrices, project) {
    const battle = state.battle;
    let count = 0, lines = 0, missiles = 0, wounds = 0, smokeCount = 0, flameVertices=0;
    if (pulseLight) pulseLight.intensity = 0;
    function particle(position, color, strength=1) {
      if (count >= maxParticles) return;
      if (useGPU) {
        position.toArray(particlePositions, count * 3);
        particleColors.set(color.map(c=>c * strength), count * 3);
      } else {
        const [x,y] = project(position.x,position.y,position.z);
        context.beginPath();context.arc(x,y,Math.max(.4,strength * 3.5),0,Math.PI*2);
        context.fillStyle = `rgba(${color.map(c=>Math.round(c * 255)).join(',')},${Math.min(1,strength)})`;
        context.fill();
      }
      count++;
    }
    function line(a,b,color='#ffc87e') {
      if (lines >= maxBeams) return;
      if (useGPU) {a.toArray(beamPositions,lines*6);b.toArray(beamPositions,lines*6+3);}
      else {
        context.strokeStyle=color;context.lineWidth=2;
        context.beginPath();context.moveTo(...project(a.x,a.y,a.z));
        context.lineTo(...project(b.x,b.y,b.z));context.stroke();
      }
      lines++;
    }
    function smoke(position){
      if(smokeCount>=90)return;
      if(useGPU)position.toArray(smokePositions,smokeCount*3);
      else{
        const [x,y]=project(position.x,position.y,position.z);
        const puff=context.createRadialGradient(x,y,0,x,y,13);
        puff.addColorStop(0,'#253a2e25');puff.addColorStop(1,'#253a2e00');
        context.fillStyle=puff;context.fillRect(x-13,y-13,26,26);
      }
      smokeCount++;
    }
    const combat = study.combat;
    if (combat && !state.explode && battle?.deathAt === null && state.attacks !== false) {
      const [begin,end] = combat.window;
      const active = state.time >= begin && state.time <= end;
      if (active) for (const [index, emitter] of combat.emitters.entries()) {
        if (battle.broken[emitter.group] !== undefined) continue;
        const matrix = matrices.get(emitter.group) || identity;
        emitterPosition.fromArray(emitter.position).applyMatrix4(matrix);
        vector.fromArray(emitter.direction || [0,0,1]).transformDirection(matrix);
        emitterEnd.copy(emitterPosition).addScaledVector(vector,span * .7);
        const phase = state.time - begin;
        const mortar = /mortar|mortier/.test(emitter.group);
        const period = combat.attack === 'rocket' || mortar ? .8 : .18;
        const progress = (phase + index * .07) % period / period;
        if (combat.attack === 'alarm' || combat.attack === 'shock') {
          const radius = span * (.04 + progress * .35);
          for (let i=0;i<36;i++) {
            const angle=i/36*Math.PI*2;
            center.set(Math.cos(angle)*radius,0,Math.sin(angle)*radius).add(emitterPosition);
            particle(center,combat.attack==='alarm'?[.2,.8,1]:[1,.55,.16],1-progress*.8);
          }
        } else if (combat.attack === 'flame') {
          const axis=vector.clone();
          const right=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize();
          const up=new THREE.Vector3().crossVectors(right,axis).normalize();
          const rings=[];
          for(let layer=0;layer<2;layer++){
            rings.length=0;
            for(let j=0;j<=16;j++){
              const t=j/16;
              const width=span*(.006+Math.sin(Math.PI*t)*.035)*(layer? .5:1);
              const middle=emitterPosition.clone().addScaledVector(axis,t*span*.48);
              middle.addScaledVector(up,span*(t*t*.04+Math.sin(state.time*18-t*11)*t*.008));
              rings.push(Array.from({length:8},(_,k)=>middle.clone().addScaledVector(right,Math.cos(k*Math.PI/4)*width).addScaledVector(up,Math.sin(k*Math.PI/4)*width)));
            }
            for(let j=0;j<16;j++)for(let k=0;k<8;k++){
              const next=(k+1)%8;
              const vertices=[rings[j][k],rings[j+1][k],rings[j][next],rings[j][next],rings[j+1][k],rings[j+1][next]];
              if(useGPU&&flameVertices+6<8192)for(const vertex of vertices){
                vertex.toArray(flamePositions,flameVertices*3);
                flameUV.set([j/16,k/8],flameVertices*2);
                flameColors.set([1,layer?.74:.22+.3*(1-j/16),layer?.25:.025],flameVertices*3);flameVertices++;
              }
              if(!useGPU){
                context.beginPath();vertices.slice(0,3).forEach((vertex,i)=>{
                  const xy=project(vertex.x,vertex.y,vertex.z);if(i)context.lineTo(...xy);else context.moveTo(...xy);
                });context.closePath();context.fillStyle=layer?'#ffd86a55':'#ed701b38';context.fill();
              }
            }
          }
          for (let i=0;i<60;i++) {
            const travel=(phase * 1.8+i/60)%1;
            center.copy(emitterPosition).addScaledVector(vector,travel * span*.48);
            center.x+=seed(i)*travel*span*.08;center.y+=travel*travel*span*.09;
            center.z+=seed(i+8)*travel*span*.08;
            particle(center,[1,.16+travel*.35,.015],(1-travel)*1.8);
          }
        } else if (combat.attack === 'laser') {
          line(emitterPosition,emitterEnd,'#9be8ff');
          for(let i=0;i<20;i++) particle(center.lerpVectors(emitterPosition,emitterEnd,i/20),[.2,.75,1],.7);
        } else if (combat.attack !== 'ram') {
          const head = center.lerpVectors(emitterPosition,emitterEnd,progress).clone();
          const tail = new THREE.Vector3().lerpVectors(emitterPosition,emitterEnd,Math.max(0,progress-.1));
          if(mortar){
            head.z+=span*.35*progress*progress;head.y-=span*.22*progress*progress;
            const behind=Math.max(0,progress-.1);
            tail.z+=span*.35*behind*behind;tail.y-=span*.22*behind*behind;
          }
          line(tail,head);
          if (combat.attack==='rocket' && useGPU && missiles<16) {
            const orientation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),vector);
            transform.compose(head,orientation,new THREE.Vector3(1,1,1));
            rockets.setMatrixAt(missiles++,transform);
          }
          const plume = combat.attack==='rocket'?18:5;
          for (let i=0;i<plume;i++) {
            center.copy(head).addScaledVector(vector,-i*span*.005);
            center.y+=seed(i)*span*.007;
            particle(center,[1,.35,.045],(1-i/plume)*.85);
            if(combat.attack==='rocket' && i>6)smoke(center);
          }
          if(progress<.2) {
            particle(emitterPosition,[1,.8,.4],1.8);
            if(pulseLight){pulseLight.position.copy(emitterPosition);pulseLight.intensity=span*.8;}
          }
        }
      }
    }
    if (battle && !state.explode) {
      for(const mark of battle.scars || []){
        if(wounds>=32)break;
        center.fromArray(mark.position).applyMatrix4(matrices.get(mark.group)||identity);
        if(useGPU){transform.makeTranslation(center.x,center.y,center.z);scars.setMatrixAt(wounds,transform);}
        else{const [x,y]=project(center.x,center.y,center.z);context.fillStyle='#18221c';context.beginPath();context.arc(x,y,2,0,Math.PI*2);context.fill();}
        wounds++;
      }
      for (const impact of battle.impacts) {
        const age=battle.clock-impact.at;
        if(age<0 || age>1.4)continue;
        const matrix=matrices.get(impact.group)||identity;
        emitterPosition.fromArray(impact.position).applyMatrix4(matrix);
        if(age<.12){
          emitterEnd.copy(emitterPosition).add(new THREE.Vector3(span*.6,span*.15,span));
          line(emitterEnd,emitterPosition,'#dbeff9');
        }
        const density=impact.explosive?48:22;
        for(let i=0;i<density;i++){
          const angle=i*2.39996;
          const speed=span*(.08+Math.abs(seed(i+impact.at))* .2);
          center.copy(emitterPosition).add(new THREE.Vector3(Math.cos(angle)*age*speed,
            age*speed*.7-age*age*span*.12,Math.sin(angle)*age*speed));
          particle(center,[1,.5,.1],Math.max(0,1-age)* (impact.explosive?1.6:1));
        }
        if(pulseLight && age<.15){pulseLight.position.copy(emitterPosition);pulseLight.intensity=span*1.7*(1-age/.15);}
        if(impact.explosive)for(let i=0;i<12;i++){
          center.copy(emitterPosition).add(new THREE.Vector3(seed(i)*span*age*.08,span*age*.06,seed(i+3)*span*age*.08));smoke(center);
        }
      }
      if(battle.deathAt!==null){
        const age=battle.clock-battle.deathAt;
        for(let i=0;i<100;i++){
          const life=age-i*.004;
          if(life<0||life>3.5)continue;
          const a=i*2.39996;
          center.set(Math.cos(a)*span*.16*life, floor+span*.18+span*(.2*life-.12*life*life),
            Math.sin(a)*span*.16*life);
          particle(center,[1,.3,.025],Math.max(0,1-life/3.5)*1.5);
        }
        if(age<4)for(let i=0;i<36;i++){
          const drift=(age+i*.05)*span*.07;
          center.set(seed(i)*span*.12+drift*.3,floor+span*.18+drift,seed(i+7)*span*.12);
          smoke(center);
        }
      }
    }
    if(useGPU){
      points.geometry.setDrawRange(0,count);points.geometry.attributes.position.needsUpdate=true;
      points.geometry.attributes.color.needsUpdate=true;
      beams.geometry.setDrawRange(0,lines*2);beams.geometry.attributes.position.needsUpdate=true;
      beams.material.color.setHex(combat?.attack==='laser'?0x9be8ff:0xffc974);
      rockets.count=missiles;rockets.instanceMatrix.needsUpdate=true;
      scars.count=wounds;scars.instanceMatrix.needsUpdate=true;
      smokeCloud.geometry.setDrawRange(0,smokeCount);smokeCloud.geometry.attributes.position.needsUpdate=true;
      flameMesh.geometry.setDrawRange(0,flameVertices);flameMesh.geometry.attributes.position.needsUpdate=true;
      flameMesh.geometry.attributes.color.needsUpdate=true;
      flameMesh.geometry.attributes.uv.needsUpdate=true;flameMesh.material.uniforms.time.value=state.time;
    }
  }

  function dispose(){
    for(const geometry of geometries)geometry.dispose();
    for(const material of materials)material.dispose();
    sprites?.dispose();scene.remove(effectRoot);
  }
  return {apply,render,dispose};
}
