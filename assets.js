// Serializable asset metadata. Runtime images and FontFace objects stay out of project JSON.
export const photoKeys=['photoScale','photoX','photoY','photoOpacity','photoDim','photoGrayscale','photoVisible'];
export const photoDefaults={photoScale:1,photoX:0,photoY:0,photoOpacity:1,photoDim:0,photoGrayscale:false,photoVisible:true};
export const clamp=(v,min,max,fallback)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
export function normalizeAssets(project,settings,blocks){
  let imageSources=project.images;
  if(!Array.isArray(imageSources))imageSources=project.photoData?[{id:'image-legacy',name:project.photoName||'Photograph',data:project.photoData,...Object.fromEntries(photoKeys.map(k=>[k,settings[k]]))}]:[];
  if(imageSources.length>20)throw Error('Projects support up to 20 image layers');
  const images=imageSources.map((p,i)=>{
    if(!p||typeof p.data!=='string'||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p.data)||p.data.length>15e6)throw Error('Invalid embedded photograph');
    return {id:typeof p.id==='string'?p.id:'image-'+i,name:String(p.name||'Photograph').slice(0,180),data:p.data,
      photoScale:clamp(p.photoScale,.05,8,1),photoX:clamp(p.photoX,-10000,10000,0),photoY:clamp(p.photoY,-10000,10000,0),photoOpacity:clamp(p.photoOpacity,0,1,1),photoDim:clamp(p.photoDim,0,.9,0),photoGrayscale:!!p.photoGrayscale,photoVisible:p.photoVisible!==false};
  });
  let fontSources=project.fonts;
  if(!Array.isArray(fontSources))fontSources=project.fontData?[{family:'Uploaded Font',name:'Uploaded font',data:project.fontData}]:[];
  if(fontSources.length>20)throw Error('Projects support up to 20 custom fonts');
  const fonts=fontSources.map(f=>{
    if(!f||typeof f.family!=='string'||!/^[\w -]{1,100}$/.test(f.family)||typeof f.data!=='string'||!/^data:(font\/[\w.+-]+|application\/[\w.+-]+|binary\/[\w.+-]+);base64,[A-Za-z0-9+/=]+$/.test(f.data)||f.data.length>7e6)throw Error('Invalid embedded font');
    return {family:f.family,name:String(f.name||'Custom font').slice(0,180),data:f.data};
  });
  if(new Set(fonts.map(f=>f.family)).size!==fonts.length)throw Error('Duplicate font family');
  const ids=[...images.map(p=>p.id),...blocks.map(b=>b.id)];
  if(new Set(ids).size!==ids.length)throw Error('Duplicate layer identifier');
  const legacyOrder=[...images.map(p=>p.id),...new Set((project.cells||[]).map(p=>p.blockId).filter(id=>ids.includes(id)))];
  const order=Array.isArray(project.layerOrder)?project.layerOrder.filter(id=>ids.includes(id)):legacyOrder;
  const layerOrder=[...new Set([...order,...ids])];
  return {images,fonts,layerOrder,activeImage:images.some(p=>p.id===project.activeImage)?project.activeImage:images.at(-1)?.id??null,activeLayer:ids.includes(project.activeLayer)?project.activeLayer:project.activeBlock??blocks[0].id};
}
