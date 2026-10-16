import{cycleSeconds,cycleTime}from'./word-motion.js';
export async function exportGIF({settings,renderFrame,longEdge=720,fps=15,transparent=false,onProgress=()=>{},signal}){
  const seconds=cycleSeconds(settings),count=Math.max(2,Math.min(600,Math.ceil(seconds*fps))),scale=Math.min(1,longEdge/Math.max(settings.width,settings.height));
  const width=Math.max(1,Math.round(settings.width*scale)),height=Math.max(1,Math.round(settings.height*scale));
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.scale(width/settings.width,height/settings.height);
  const check=()=>{if(signal?.aborted)throw new DOMException('Export cancelled','AbortError')};
  const worker=new Worker(new URL('./gif-worker.js',import.meta.url),{type:'module'});
  const request=(msg,transfer=[])=>new Promise((resolve,reject)=>{
    const cleanup=()=>{worker.removeEventListener('message',message);worker.removeEventListener('error',error);signal?.removeEventListener('abort',abort)};
    const message=e=>{cleanup();e.data.type==='error'?reject(Error(e.data.message)):resolve(e.data)};
    const error=e=>{cleanup();reject(Error(e.message||'GIF worker failed'))};const abort=()=>{cleanup();reject(new DOMException('Export cancelled','AbortError'))};
    worker.addEventListener('message',message);worker.addEventListener('error',error);signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)return abort();worker.postMessage(msg,transfer);
  });
  try{
    const sample=[];
    for(let i=0;i<8;i++){check();renderFrame(ctx,cycleTime(settings,i/8),transparent);const data=ctx.getImageData(0,0,width,height).data,stride=Math.max(1,Math.floor(width*height/8192));for(let px=0;px<width*height;px+=stride){const j=px*4;if(!transparent||data[j+3]>=128)sample.push(data[j],data[j+1],data[j+2],255)}onProgress(i/8*.08,'Preparing palette');await new Promise(r=>setTimeout(r,0))}
    const samples=new Uint8Array(sample);await request({type:'start',width,height,transparent,repeat:settings.loop==='once'?-1:0,samples:samples.buffer},[samples.buffer]);
    for(let i=0;i<count;i++){check();const fraction=settings.loop==='once'?i/(count-1):i/count;renderFrame(ctx,cycleTime(settings,fraction),transparent);const rgba=new Uint8Array(ctx.getImageData(0,0,width,height).data);
      // Distribute 10ms GIF ticks so the total duration stays correct at any frame rate.
      const delay=(Math.round((i+1)*seconds*100/count)-Math.round(i*seconds*100/count))*10;
      await request({type:'frame',rgba:rgba.buffer,delay},[rgba.buffer]);onProgress(.08+.92*(i+1)/count,'Encoding GIF');
    }
    const result=await request({type:'finish'});return new Blob([result.bytes],{type:'image/gif'});
  }finally{worker.terminate()}
}
