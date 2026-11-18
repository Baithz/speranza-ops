// Mêmes essais que tests/test_relais.py, côté JavaScript.
const {convertir}=require('../api/planning.js');
const t0=1794800000000;
const flux=JSON.stringify({x:1,props:{conditionItems:[{name:'Raid nocturne',type:'major',note:'a ] piège [ " ici'},{name:'Récolteur',type:'minor'}],
 liveEntries:[
  {conditionName:'Raid nocturne',mapDisplayName:'Barrage',startTimestamp:t0,endTimestamp:t0+3600000,regionTimestamps:{'north-america':[t0+1,t0+5000],inconnue:[1,2]}},
  {conditionName:'Récolteur',mapDisplayName:'Ville enfouie',startTimestamp:t0+10,endTimestamp:t0+99999,regionTimestamps:'$undefined'},
  {conditionName:'Récolteur',mapDisplayName:'Port spatial',startTimestamp:t0+20,endTimestamp:t0+99999}]}});
const coupe=Math.floor(flux.length/2);
const page='<html><script>self.__next_f.push([1,'+JSON.stringify('12:'+flux.slice(0,coupe))+'])</script><script>self.__next_f.push([0])</script><script>self.__next_f.push([1,'+JSON.stringify(flux.slice(coupe))+'])</script></html>';
const r=convertir(page);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
console.assert(r.version===1&&eq(r.types,{'Raid nocturne':'major','Récolteur':'minor'}),'types',r.types);
console.assert(r.entries.length===3&&eq(r.entries[0].regionTimestamps,{'north-america':[t0+1,t0+5000]})&&eq(r.entries[1].regionTimestamps,{})&&eq(r.entries[2].regionTimestamps,{}),'entrées',JSON.stringify(r.entries));
console.log('lecture : ok');
for(const [casse,attendu] of [[page.replace('major','autre'),'Condition non reconnue'],[page.replace(String(t0+3600000),String(t0-5)),'Horaire Europe'],['<html></html>','Tableau absent'],[page.replace('Barrage',''),'Condition ou carte'],[page.replace('\\"inconnue\\":[1,2]','\\"brazil\\":[1,2]'),'Horaire régional']]){
  let ok=false;try{convertir(casse);}catch(e){ok=e.message.includes(attendu);if(!ok)console.error('mauvais message',attendu,'→',e.message);}
  console.assert(ok,'aurait dû échouer : '+attendu);
}
console.log('refus des pages incorrectes : ok');
// Le planning réel, relu depuis la capture hors ligne : mêmes clés, mêmes types.
const vrai=require('fs').readFileSync(__dirname+'/../engine/event-snapshot.js','utf8').replace(/^[\s\S]*?window\.ATLAS_TIMETABLE = /,'').replace(/;\s*$/,'');
const ref=JSON.parse(vrai);
console.assert(ref.version===1&&Object.keys(ref.types).length>5&&ref.entries.length>10,'capture inattendue');
const memesClefs=eq(Object.keys(r.entries[0]).sort(),Object.keys(ref.entries[0]).sort());
console.assert(memesClefs,'clés différentes de la capture : '+Object.keys(ref.entries[0]));
console.log('forme identique à la capture réelle ('+ref.entries.length+' créneaux, '+Object.keys(ref.types).length+' conditions) : ok');
