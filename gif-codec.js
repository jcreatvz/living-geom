import {GIFEncoder,quantize,applyPalette} from './vendor/gifenc.js';
// A single palette sampled across the animation avoids frame-to-frame color flicker.
export function createGIF({width,height,samples,transparent=false,repeat=0}){
  const source=samples.length?samples:new Uint8Array([0,0,0,255]);
  const colors=quantize(source,transparent?255:256,{format:'rgb565'});
  if(!colors.length)colors.push([0,0,0]);
  const palette=transparent?[[0,0,0],...colors]:colors;
  const encoder=GIFEncoder();let frames=0;
  return{
    frame(rgba,delay){const indexed=applyPalette(rgba,colors,'rgb565');if(transparent)for(let i=0;i<indexed.length;i++)indexed[i]=rgba[i*4+3]<128?0:indexed[i]+1;
      encoder.writeFrame(indexed,width,height,{palette:frames===0?palette:undefined,delay,repeat,transparent,transparentIndex:0,dispose:transparent?2:1});frames++},
    finish(){encoder.finish();return encoder.bytes()}
  };
}
