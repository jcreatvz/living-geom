// Shared plane rotation: each cell is transformed around one type-layer pivot.
export const wordDefaults={enabled:false,axis:'z',projection:'orthographic',turns:1,offset:0,perspective:.65};
export function normalizeWordMotion(m={}){m=m&&typeof m==='object'?m:{};const number=(v,min,max,f)=>Number.isFinite(v)?Math.min(max,Math.max(min,v)):f;return{enabled:m.enabled===true,axis:['x','y','z'].includes(m.axis)?m.axis:'z',projection:m.projection==='perspective'?'perspective':'orthographic',turns:number(m.turns,-4,4,1),offset:number(m.offset,-180,180,0),perspective:number(m.perspective,0,1,.65)}}
export function createWordProjector(cells,m,settings,time){
  m=normalizeWordMotion(m);if(!m.enabled||!cells.length)return null;
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const p of cells){const half=(p.cellSize??settings.resolution)*(p.size??settings.size)/2;minX=Math.min(minX,p.x-half);maxX=Math.max(maxX,p.x+half);minY=Math.min(minY,p.y-half);maxY=Math.max(maxY,p.y+half)}
  const cx=(minX+maxX)/2,cy=(minY+maxY)/2,radius=Math.max(1,Math.hypot(maxX-minX,maxY-minY)/2),f=radius*(5-3.5*m.perspective),r=(m.offset+360*m.turns*time/settings.duration)*Math.PI/180,c=Math.cos(r),sn=Math.sin(r),perspective=m.projection==='perspective';
  const project=(x,y)=>{const dx=x-cx,dy=y-cy;let xx=dx,yy=dy,z=0;if(m.axis==='x'){yy=c*dy;z=sn*dy}else if(m.axis==='y'){xx=c*dx;z=-sn*dx}else{xx=c*dx-sn*dy;yy=sn*dx+c*dy}const k=perspective?f/Math.max(f*.08,f-z):1;return{x:cx+xx*k,y:cy+yy*k}};
  const inverse=(x,y)=>{const u=x-cx,v=y-cy;if(m.axis==='z')return{x:cx+c*u+sn*v,y:cy-sn*u+c*v};if(Math.abs(c)<.04)return null;let dx,dy;if(!perspective){dx=m.axis==='y'?u/c:u;dy=m.axis==='x'?v/c:v}else if(m.axis==='x'){const den=f*c+v*sn;if(Math.abs(den)<f*.04)return null;dy=v*f/den;dx=u*(f-sn*dy)/f}else{const den=f*c-u*sn;if(Math.abs(den)<f*.04)return null;dx=u*f/den;dy=v*(f+sn*dx)/f}return{x:cx+dx,y:cy+dy}};
  return{project,inverse,cx,cy,axis:m.axis,angle:r,projection:m.projection};
}
const flattened=new Map();
// The built-in shape paths use M/L/H/V/Q/A/Z. Flatten curves once; perspective
// then projects every vertex, preserving actual contours instead of stretching cell centers.
export function flattenPath(d){
  if(flattened.has(d))return flattened.get(d);
  const tok=d.match(/[MLHVQAZ]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi)||[];let i=0,cmd='',x=0,y=0,sx=0,sy=0,ring=[],rings=[];
  const number=()=>Number(tok[i++]);const add=(a,b)=>{ring.push([a,b]);x=a;y=b};
  while(i<tok.length){if(/^[a-z]$/i.test(tok[i]))cmd=tok[i++].toUpperCase();
    if(cmd==='M'){if(ring.length)rings.push(ring);ring=[];sx=number();sy=number();add(sx,sy);cmd='L'}
    else if(cmd==='L')add(number(),number());else if(cmd==='H')add(number(),y);else if(cmd==='V')add(x,number());
    else if(cmd==='Q'){const x0=x,y0=y,qx=number(),qy=number(),ex=number(),ey=number();for(let j=1;j<=10;j++){const t=j/10,u=1-t;add(u*u*x0+2*u*t*qx+t*t*ex,u*u*y0+2*u*t*qy+t*t*ey)}}
    else if(cmd==='A'){let rx=Math.abs(number()),ry=Math.abs(number());const phi=number()*Math.PI/180,large=number(),sweep=number(),ex=number(),ey=number(),x0=x,y0=y;
      if(!rx||!ry||(x0===ex&&y0===ey)){add(ex,ey);continue}const cp=Math.cos(phi),sp=Math.sin(phi),xp=cp*(x0-ex)/2+sp*(y0-ey)/2,yp=-sp*(x0-ex)/2+cp*(y0-ey)/2;const scale=xp*xp/(rx*rx)+yp*yp/(ry*ry);if(scale>1){rx*=Math.sqrt(scale);ry*=Math.sqrt(scale)}const factor=(large===sweep?-1:1)*Math.sqrt(Math.max(0,(rx*rx*ry*ry-rx*rx*yp*yp-ry*ry*xp*xp)/(rx*rx*yp*yp+ry*ry*xp*xp))),cxp=factor*rx*yp/ry,cyp=-factor*ry*xp/rx,cx=cp*cxp-sp*cyp+(x0+ex)/2,cy=sp*cxp+cp*cyp+(y0+ey)/2;const a=Math.atan2((yp-cyp)/ry,(xp-cxp)/rx);let delta=Math.atan2((-yp-cyp)/ry,(-xp-cxp)/rx)-a;if(sweep&&delta<0)delta+=Math.PI*2;if(!sweep&&delta>0)delta-=Math.PI*2;const n=Math.max(8,Math.ceil(Math.abs(delta)*14));for(let j=1;j<=n;j++){const theta=a+delta*j/n;add(cx+cp*rx*Math.cos(theta)-sp*ry*Math.sin(theta),cy+sp*rx*Math.cos(theta)+cp*ry*Math.sin(theta))}}
    else if(cmd==='Z'){if(ring.length){rings.push(ring);ring=[]}x=sx;y=sy;cmd=''}else throw Error('Unsupported shape path command');
  }
  if(ring.length)rings.push(ring);flattened.set(d,rings);return rings;
}
export function projectContours(d,a,projector,dx=0,dy=0){const r=a.rotation*Math.PI/180,c=Math.cos(r),sn=Math.sin(r);return flattenPath(d).map(ring=>ring.map(([x,y])=>{const xx=x*a.size*a.flipX,yy=y*a.size*a.flipY;return projector.project(a.x+dx+xx*c-yy*sn,a.y+dy+xx*sn+yy*c)}))}
export function contoursPath(rings){return rings.map(r=>r.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join('')+'Z').join('')}
export function cycleSeconds(s){return s.duration/s.speed*(s.loop==='pingpong'?2:1)}
export function cycleTime(s,progress){const v=Math.max(0,Math.min(1,progress));return s.loop==='pingpong'?s.duration*(v<=.5?v*2:(1-v)*2):s.duration*v}
