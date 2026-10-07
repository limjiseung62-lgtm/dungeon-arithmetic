export const rectanglesOverlap=(a,b,gap=0)=>a.x+a.width+gap>b.x&&b.x+b.width+gap>a.x&&a.y+a.height+gap>b.y&&b.y+b.height+gap>a.y;
export function projectedSafeZones(pose,body){return pose.faceSafeZones.map(z=>({x:body.x+z.x*body.width,y:body.y+z.y*body.height,width:z.width*body.width,height:z.height*body.height,kind:z.kind||'face'}));}
// Pure display geometry. No target values, claims, grades or combat state are changed.
export function placeMonsterTargets({width,height,body,anchors,sizes,safeZones=[],reserved=[]}){
 const placed=[];
 for(let i=0;i<4;i++){
  const size=sizes[i],anchor=anchors[i],wanted={x:body.x+anchor[0]*body.width,y:body.y+anchor[1]*body.height};
  const clamp=(x,y)=>({x:Math.max(8,Math.min(width-size.width-8,x-size.width/2)),y:Math.max(8,Math.min(height-size.height-8,y-size.height/2)),...size});
  const candidates=[clamp(wanted.x,wanted.y)];
  for(const y of [.24,.34,.44,.54,.64,.73])for(const x of [.12,.24,.38,.62,.76,.88])candidates.push(clamp(width*x,height*y));
  const score=r=>safeZones.filter(z=>rectanglesOverlap(r,z,20)).length*1e9+placed.filter(z=>rectanglesOverlap(r,z,6)).length*1e7+reserved.filter(z=>rectanglesOverlap(r,z,4)).length*1e5+Math.hypot(r.x+r.width/2-wanted.x,r.y+r.height/2-wanted.y);
  candidates.sort((a,b)=>score(a)-score(b));placed.push(candidates[0]);
 }
 return placed.map(r=>({...r,centerX:r.x+r.width/2,centerY:r.y+r.height/2}));
}
