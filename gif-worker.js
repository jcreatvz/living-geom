import {createGIF} from './gif-codec.js';
let encoder;
self.onmessage=event=>{const m=event.data;try{
  if(m.type==='start'){encoder=createGIF({...m,samples:new Uint8Array(m.samples)});self.postMessage({type:'ready'})}
  else if(m.type==='frame'){encoder.frame(new Uint8Array(m.rgba),m.delay);self.postMessage({type:'frame'})}
  else if(m.type==='finish'){const bytes=encoder.finish();encoder=null;self.postMessage({type:'done',bytes:bytes.buffer},[bytes.buffer])}
}catch(error){self.postMessage({type:'error',message:error.message||'GIF encoding failed'})}};
