import { compileAction } from './state-diff.js';
import { validateSite } from '../generate.js';
const cleanFrames = (frames) =>
  (frames || []).map((frame) =>
    Object.fromEntries(
      Object.entries(frame).filter(([k]) => !['computedOffset'].includes(k)),
    ),
  );
export function assembleCapture(capture) {
  const variants = capture.viewports
    .map((v) => {
      const motion = [
        ...(v.initial.animations || []),
        ...(v.measured.animations || []),
      ]
        .filter((a) => a.target && a.keyframes?.length > 1)
        .filter(
          (a, i, all) => all.findIndex((b) => b.target === a.target) === i,
        )
        .map((a) => ({
          target: a.target,
          keyframes: cleanFrames(a.keyframes),
          timing: a.timing,
        }));
      const tracks = [];
      const reveals = [];
      const byId = new Map();
      for (const sample of v.scrollSamples || [])
        for (const n of sample.nodes) {
          if (!byId.has(n.id)) byId.set(n.id, []);
          byId.get(n.id).push({
            y: sample.y,
            transform: n.transform,
            opacity: n.opacity,
            filter: n.filter,
          });
        }
      for (const [id, frames] of byId) {
        if (
          Number(frames[0].opacity) < 0.1 &&
          Number(frames.at(-1).opacity) >= 0.99
        ) {
          if (!motion.some((item) => item.target === id)) {
            const start = Math.max(
              0,
              frames.findIndex((f) => Number(f.opacity) > 0.01) - 1,
            );
            const end = frames.findIndex(
              (f, i) =>
                i > start &&
                Number(f.opacity) >= 0.999 &&
                f.transform === frames.at(-1).transform,
            );
            const sampled = frames.slice(start, end < 0 ? undefined : end + 1);
            reveals.push({
              id,
              duration: Math.max(180, (sampled.length - 1) * 180),
              frames: sampled.map(({ y: _y, ...f }) => f),
            });
          }
          continue;
        }
        if (
          new Set(frames.map(({ y: _y, ...f }) => JSON.stringify(f))).size > 3
        )
          tracks.push({ id, frames });
      }
      const actions = capture.interactions
        .filter((i) => i.width === v.width && i.before && i.after)
        .map((i) => compileAction({ ...i, baseURL: capture.url }));
      return {
        width: v.width,
        minWidth: v.width === 1440 ? 1200 : v.width === 768 ? 768 : 0,
        html: v.document.html,
        css: v.document.css,
        js: interactionRuntime({ motion, actions, tracks, reveals }),
      };
    })
    .sort((a, b) => b.minWidth - a.minWidth);
  const desktop = variants[0];
  return validateSite({
    title: capture.viewports[0].document.title,
    description: capture.viewports[0].document.description,
    html: desktop.html,
    css: desktop.css,
    js: desktop.js,
    variants,
    reply:
      'Reconstructed the captured reference. Review the visual comparison and interaction coverage before personalizing.',
  });
}
export function interactionRuntime({
  motion,
  actions,
  tracks = [],
  reveals = [],
}) {
  // All executable logic is application-owned; captured pages contribute only sanitized data.
  const data = JSON.stringify({ motion, actions, tracks, reveals }).replace(
    /<\//g,
    '<\\/',
  );
  return `return (function(){
const data=${data};const controller=new AbortController();const animations=[];const observers=[];
const selector=id=>'[data-fusion-node="'+id+'"]';
for(const action of data.actions){
  let open=false;
  const apply=event=>{
    if(!event.target.closest(selector(action.target.id)))return;
    if(action.kind==='hover'&&event.relatedTarget&&event.target.closest(selector(action.target.id)).contains(event.relatedTarget))return;
    event.preventDefault();event.stopImmediatePropagation();
    for(const patch of action.patches){const node=document.querySelector(selector(patch.id));if(!node)continue;for(const attr of patch.attrs){const value=open?attr.before:attr.after;if(value===null)node.removeAttribute(attr.name);else node.setAttribute(attr.name,value);}if(patch.before!==undefined)node.innerHTML=open?patch.before:patch.after;}open=!open;
  };document.addEventListener(action.kind==='hover'?'pointerover':'click',apply,{signal:controller.signal});
  if(action.kind==='hover')document.addEventListener('pointerout',apply,{signal:controller.signal});
  document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches(selector(action.target.id))){event.preventDefault();event.target.click();}},{signal:controller.signal});
}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
for(const reveal of data.reveals||[]){const target=document.querySelector(selector(reveal.id));if(!target)continue;const animation=target.animate(reveal.frames,{duration:reveal.duration,fill:'both'});animation.pause();animations.push(animation);const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){animation.play();observer.disconnect();}},{threshold:.12});observer.observe(target);observers.push(observer);}
for(const track of data.tracks||[]){const target=document.querySelector(selector(track.id));if(!target)continue;const max=track.frames.at(-1).y||1;const animation=target.animate(track.frames.map(({y,...f})=>({...f,offset:y/max})),{duration:max,fill:'both'});animation.id='fusion-scroll';animation.pause();const sync=()=>animation.currentTime=Math.min(max,scrollY);sync();addEventListener('scroll',sync,{passive:true,signal:controller.signal});animations.push(animation);}
for(const item of data.motion){
 const target=document.querySelector(selector(item.target));if(!target)continue;
 const timing={...item.timing,iterations:item.timing?.iterations==='Infinity'?Infinity:(item.timing?.iterations||1)};
 if(timing.iterations===Infinity){const animation=target.animate(item.keyframes,timing);animations.push(animation);}
 else {const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){animations.push(target.animate(item.keyframes,{...timing,fill:'none'}));observer.disconnect();}},{threshold:.12});observer.observe(target);observers.push(observer);}
}}
return ()=>{controller.abort();animations.forEach(a=>a.cancel());observers.forEach(o=>o.disconnect());};
})();`;
}
