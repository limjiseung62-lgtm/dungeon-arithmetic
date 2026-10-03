from pathlib import Path
import numpy as np,wave
r=Path(__file__).resolve().parent;sr=32000;rng=np.random.default_rng(110)
for name,kind,dur in [('ice-spear',0,.65),('magic-shield',1,.7),('healing-light',2,.9),('chain-lightning',3,.85),('purification',4,.8),('meteor-impact',5,.85),('time-stop',6,.9)]:
 t=np.arange(int(sr*dur))/sr;n=len(t);noise=rng.normal(0,1,n)
 if kind==0:y=noise*np.exp(-t*8)*.14+sum(np.sin(2*np.pi*f*t)*np.exp(-t*7)*.15 for f in [950,1430,2100])
 elif kind in [1,2,4]:
  notes={1:[320,480,640],2:[523,659,784],4:[740,988,1480]}[kind];y=sum(np.sin(2*np.pi*f*t)*np.exp(-t*(2.2+i))*.18 for i,f in enumerate(notes))
 elif kind==3:
  y=np.zeros(n)
  for start in [0,.25,.5]:u=np.maximum(0,t-start);y+=(t>=start)*(noise*.25+np.sin(2*np.pi*160*u)*.15)*np.exp(-u*18)
 elif kind==5:y=(noise*.2+np.sin(2*np.pi*(85*t-25*t*t))*.45)*np.exp(-t*5)
 else:y=(np.sin(2*np.pi*(760*t-180*t*t))*.3+np.sin(2*np.pi*1140*t)*.13)*np.exp(-t*2.5)
 fade=np.minimum(1,t/.008)*np.minimum(1,(dur-t)/.08);y*=fade;y*=.6/max(.6,np.max(np.abs(y)))
 stereo=np.column_stack((y,np.roll(y,int(sr*.0015))*.94));stereo[-int(sr*.008):]*=np.linspace(1,0,int(sr*.008))[:,None]
 with wave.open(str(r/(name+'.wav')),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((stereo*32767).astype('<i2').tobytes())
print('7 original spell SFX generated; BGM unchanged')
