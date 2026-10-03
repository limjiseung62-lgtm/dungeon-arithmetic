from pathlib import Path
import numpy as np,wave,json
root=Path(__file__).resolve().parent;root.mkdir(parents=True,exist_ok=True)
sr=32000;rng=np.random.default_rng(4173)
def note(m):return 440*2**((m-69)/12)
def env(n,a=.01,r=.1):
 e=np.ones(n);a=min(n,int(sr*a));r=min(n,int(sr*r));e[:a]=np.linspace(0,1,a);e[-r:]=np.linspace(1,0,r) if r else e[-r:];return e

def instrument(m,d,kind):
 t=np.arange(int(sr*d))/sr;f=note(m)
 if kind=='strings':
  y=sum(np.sin(2*np.pi*f*(1+detune)*h*t+detune*600)*np.exp(-h*.75) for detune in [-.0018,.0014] for h in range(1,7));y*=env(len(t),.8,1.2)*.24
 elif kind=='flute':
  phase=2*np.pi*f*t+.018*np.sin(2*np.pi*4.5*t);y=(np.sin(phase)+.15*np.sin(phase*2)+.035*np.sin(phase*3))*env(len(t),.08,.3)*.2
 else:
  y=sum(np.sin(2*np.pi*f*h*t)*np.exp(-t*(2.2+h*.6))*(.55**(h-1)) for h in range(1,6));y*=env(len(t),.004,.2)*.24
 return y

def noise(d,lo,hi,decay=6):
 n=int(sr*d);x=rng.normal(0,1,n);freq=np.fft.rfftfreq(n,1/sr);mask=np.clip((freq-lo)/max(100,lo),0,1)*np.clip((hi-freq)/max(100,hi*.2),0,1);y=np.fft.irfft(np.fft.rfft(x)*mask,n);y/=max(np.max(np.abs(y)),.01);return y*np.exp(-np.arange(n)/sr*decay)*env(n,.002,.025)
def drum(d=.5,weight=1):
 t=np.arange(int(sr*d))/sr;return .35*np.sin(2*np.pi*(48*t+35*(1-np.exp(-t*18))/18))*np.exp(-t*10)*weight+.1*noise(d,90,800,16)
def write(name,y,peak=.72):
 y=np.asarray(y);y=y*env(len(y),.002,.035) if y.ndim==1 else y;y=y/(max(np.max(np.abs(y)),.001)/peak);pcm=(np.clip(y,-1,1)*32767).astype('<i2');
 with wave.open(str(root/(name+'.wav')),'wb') as w:w.setnchannels(1 if y.ndim==1 else 2);w.setsampwidth(2);w.setframerate(sr);w.writeframes(pcm.tobytes())
 return {'file':name+'.wav','seconds':len(y)/sr,'peak':round(float(np.max(np.abs(y))),4),'rms':round(float(np.sqrt(np.mean(y*y))),4)}
report=[]
beat=60/88;bar=beat*4;N=int(sr*bar*24)
chords=[[50,57,60,65],[53,60,65,69],[48,55,60,64],[55,62,65,69],[50,57,62,65],[46,53,58,62],[53,60,65,69],[48,55,60,67]]*3
for name,boss in [('dungeon-suite',False),('golem-suite',True)]:
 out=np.zeros((N,2))
 def add(y,start,level=1,pan=0):
  indices=(np.arange(len(y))+int(start*sr))%N;out[indices,0]+=y*level*np.sqrt((1-pan)/2);out[indices,1]+=y*level*np.sqrt((1+pan)/2)
 for b,chord in enumerate(chords):
  for j,m in enumerate(chord):add(instrument(m,bar+2,'strings'),b*bar,.29,[-.35,.3,-.1,.15][j])
  add(instrument(chord[0]-12,bar+.7,'strings'),b*bar,.25 if boss else .15,0)
  for step in range(8):
   m=chord[[0,2,1,3,2,1,3,2][step]]+12
   add(instrument(m,1.2,'harp'),b*bar+step*beat/2,.15 if b%4<2 else .11,(-1)**step*.4)
  if b%4 in [2,3]:
   melody=[74,72,69,67] if (b//4)%2==0 else [69,65,67,69]
   for j,m in enumerate(melody[:2]):add(instrument(m,beat*1.7,'flute'),b*bar+(j*2+.5)*beat,.25,.15)
  if boss:
   for offset in [0,2]:add(drum(.65,1.2),b*bar+offset*beat,.25,0)
   if b%4==3:add(noise(.3,800,2600,14),b*bar+3.5*beat,.1,-.2)
 # Circular room reflections make the loop tail continuous.
 dry=out.copy()
 for delay,level in [(.087,.12),(.163,.1),(.271,.075),(.419,.05)]:out+=np.roll(dry,int(sr*delay),axis=0)[:,::-1]*level
 out=np.tanh(out*.8);report.append(write(name,out,.62))
for name,chord in [('victory',[62,66,69,74]),('gameover',[50,53,57,62])]:
 out=np.zeros((sr*8,2))
 for i,m in enumerate(chord*2):
  y=instrument(m,3,'harp' if name=='victory' else 'strings');start=int(i*.45*sr);end=min(len(out),start+len(y));out[start:end]+=y[:end-start,None]*.3
 out*=env(len(out),.05,1.8)[:,None];report.append(write(name,out,.6))
# Weapon sounds: air movement and resonant contact, distinct assets and envelopes.
for i in range(3):
 d=.32+i*.018;n=int(sr*d);t=np.arange(n)/sr;air=noise(d,650+i*90,6200-i*250,1.8);air*=np.sin(np.pi*np.clip(t/d,0,1))**1.6
 metal=np.sin(2*np.pi*(850+i*70)*t)*np.exp(-t*22)*.09
 report.append(write('sword-swing-'+str(i+1),air+metal,.52))
 d=.5;n=int(sr*d);t=np.arange(n)/sr
 impact=.46*noise(d,100,4600,20)+.25*np.sin(2*np.pi*(92+i*5)*t)*np.exp(-t*18)
 for f in [720+i*18,1163+i*27,1780+i*11]:impact+=.1*np.sin(2*np.pi*f*t)*np.exp(-t*(12+f/250))
 report.append(write('sword-impact-'+str(i+1),impact,.65))
for name,d in [('scroll-open',.5),('magic-charge',.85),('magic-launch',.4),('fire-explosion',1.1),('shield-impact',.55),('shield-break',.7),('special-block',.9),('player-hit',.4)]:
 t=np.arange(int(sr*d))/sr
 if name=='scroll-open':y=noise(d,1200,6500,5)*(.3+.7*np.sin(t*25)**2)
 elif name=='magic-charge':y=sum(np.sin(2*np.pi*f*t+.9*t*t)*np.exp(-t*.5) for f in [330,495,660])*.15+noise(d,1500,4500,1)*.15;y*=env(len(t),.3,.12)
 elif name=='magic-launch':y=noise(d,250,5500,2)*np.sin(np.pi*t/d)**.7+np.sin(2*np.pi*(180*t+600*t*t))*.13
 elif name=='fire-explosion':y=noise(d,40,3300,6)*.65+np.sin(2*np.pi*(42*t+25*(1-np.exp(-t*12))/12))*np.exp(-t*8)*.35
 elif name in ['shield-impact','shield-break','special-block']:
  y=noise(d,300,6500,14)*.3
  for j,f in enumerate([430,691,1063,1537]):y+=np.sin(2*np.pi*f*t)*np.exp(-t*(7+j*2))*.18
  if name=='special-block':y+=sum(np.sin(2*np.pi*f*t)*env(len(t),.04,.3) for f in [784,988,1175])*.09
  if name=='shield-break':y+=noise(d,2200,10000,8)*.5
 else:y=noise(d,80,2200,18)*.5+np.sin(2*np.pi*75*t)*np.exp(-t*15)*.2
 report.append(write(name,y,.7 if name=='fire-explosion' else .62))
(root/'audio-analysis.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('Generated',len(report),'original WAV assets; longest loop',N/sr,'seconds')

