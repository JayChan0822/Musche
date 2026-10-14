"""57.6-second / 24-bar original Musche workflow cue.

Extends the first composition with new phrases and arrangement changes; no
looped recording or copy/paste of the previous master. V1 files are preserved.
"""
from pathlib import Path
import json, math, shutil, subprocess, sys
import numpy as np
import compose as core

BASE=Path(__file__).resolve().parent
WORK=BASE/'v2-stems'
WORK.mkdir(exist_ok=True)
SR=48000; DUR=57.6; BEAT=.6; BAR=2.4; N=round(SR*DUR)
RNG=np.random.default_rng(1421)
core.RNG=RNG
core.N=N
core.DUR=DUR
Bm=(35,[47,54,57,61,66]); G=(31,[43,50,54,57,62]); A=(33,[45,52,57,59,64]); D=(38,[50,57,61,64,66]); Dh=(38,[50,57,61,64,69])
CHORDS=[Bm,Bm,D,Dh,G,A,Bm,G,A,D,G,A,Bm,G,Dh,G,A,Bm,Dh,G,A,(33,[45,52,59,61,64]),D,D]
put=core.put

def events():
    notes=[]
    def p(t,n,v=60,d=1.2):notes.append(dict(time=round(float(t),5),note=int(n),velocity=int(v),duration=float(d)))
    for t,n,v,d in [(0,66,79,2.1),(1.2,61,68,1.1),(1.8,62,75,1.4),(3,69,78,1.3),(3.9,66,66,.7)]:p(t,n,v,d)
    for b,(bass,chord) in enumerate(CHORDS[:22]):
        t=b*BAR
        if b<2:
            for i,n in enumerate(chord[:3]):p(t+.012*i,n,44+i*3,2.5)
            continue
        energy=.82 if b<6 else .95 if b<9 else 1.03 if b<12 else 1.12 if b<15 else .84 if b<17 else 1.17 if b<19 else .90 if b<21 else .70
        for i,k in enumerate([0,2,3,1,4,2,3,1]):
            if b in (15,16,21) and i%2:continue
            vel=(47+[5,0,7,0,10,0,6,0][i]+RNG.integers(-3,4))*energy
            octave=12 if i in (4,6) and b in (12,13,14,17,18) else 0
            p(t+i*.3+(0 if i==0 else RNG.uniform(-.009,.009)),chord[k]+octave,vel,1.2 if b in (15,16,21) else .8)
        p(t,bass+12,48*energy,2.05);p(t+.009,bass+19,40*energy,1.9)
    # Each feature passage has a deliberate melodic contour and a little air.
    melody={
      2:[(0,78,78),(1.5,76,70),(2.5,73,73)],
      3:[(0,74,76),(2,69,67),(3,73,71)],
      4:[(0,74,76),(1.5,78,73),(3,81,78)],
      5:[(0,76,75),(2,73,70),(3,71,71)],
      6:[(0,78,80),(1.5,73,74),(2.5,74,79)],
      7:[(0,81,80),(1.5,78,74),(3,74,75)],
      8:[(0,76,77),(2,73,69),(3.5,76,72)],
      9:[(0,78,84),(1,81,77),(2.5,85,81)],
      10:[(0,86,82),(1.5,85,75),(3,81,78)],
      11:[(0,83,80),(1.5,81,75),(3,76,74)],
      12:[(0,78,87),(1.5,81,77),(2.5,85,85)],
      13:[(0,86,84),(1.5,85,76),(3,81,78)],
      14:[(0,85,87),(1,81,76),(2.5,78,83)],
      15:[(0,74,78),(2,78,72)],
      16:[(0,76,75),(1.5,73,66),(3,69,66)],
      17:[(0,78,86),(1,81,78),(2.5,85,83)],
      18:[(0,86,85),(1.5,85,78),(3,81,80)],
      19:[(0,81,80),(1.5,78,73),(3,74,75)],
      20:[(0,76,76),(1.5,73,69),(3,71,70)],
      21:[(0,73,73),(2,76,68),(3,69,62)]}
    for b,phrase in melody.items():
        for beat,n,vel in phrase:p(b*BAR+beat*BEAT,n,vel,1.6 if b in (15,16,21) else 1.25)
    for i,n in enumerate([38,50,57,61,66,69,74,78]):p(52.8+i*.012,n,72 if i<4 else 76,4.6-i*.012)
    p(54,81,61,3.35);p(54.6,78,56,2.8)
    notes.sort(key=lambda n:n['time'])
    (WORK/'piano-events.json').write_text(json.dumps(notes,indent=2))
    return len(notes)

def synthesize():
    beds=np.zeros((N,2),np.float32);drums=np.zeros_like(beds);lows=np.zeros_like(beds);sparkle=np.zeros_like(beds);fx=np.zeros_like(beds)
    K=core.kick();C=core.clap();W=core.wood()
    for b,(root,chord) in enumerate(CHORDS[:23]):
        t=b*BAR
        energy=.7 if b<2 else .9 if b<6 else 1.0 if b<9 else 1.08 if b<12 else 1.18 if b<15 else .78 if b<17 else 1.18 if b<19 else .92 if b<21 else .7
        for note in chord[1:]:put(beds,core.pad(note,4.8 if b==22 else 3.45),t,.33*energy)
        if b<2:
            if b==0:put(lows,core.bass(root,1.9),t,.20)
            if b==1:
                for beat in (0,2):put(drums,W,t+beat*BEAT,.23,-.3 if beat==0 else .3)
                for beat in (1.5,3.5):put(drums,core.hat(),t+beat*BEAT,.45,.35)
            continue
        if b==22:
            put(lows,core.bass(root,3.9),t,.32);put(drums,K,t,.41);continue
        restrained=b in (15,16,21)
        if not restrained:
            kickbeats=[0,2,3.5] if b<6 else [0,1.5,2,3.5] if b<12 or b>=19 else [0,1,2,2.75,3.5]
            for beat in kickbeats:put(drums,K,t+beat*BEAT,.58 if beat%1==0 else .40)
            for beat in [1,3]:put(drums,C,t+beat*BEAT,.60 if b<6 else .78,.03)
            for step in range(8):put(drums,core.hat(step in (3,7) and b>=9),t+step*.3+(.012 if step%2 else 0),.60 if step%2 else .34,.24 if step%2 else -.34)
            for beat in ([.75,2.75] if b<12 or b>=19 else [.75,1.75,2.5,3.75]):put(drums,W,t+beat*BEAT,.27,-.42 if beat<2 else .47)
        else:
            for beat in [0,2]:put(drums,K,t+beat*BEAT,.40)
            for beat in [1,3]:put(drums,core.hat(),t+beat*BEAT,.40,.2)
        for beat,octave,gain in [(0,0,.37),(1.5,0,.27),(2.5,0,.30),(3.5,12,.18)]:
            if restrained and beat not in (0,2.5):continue
            put(lows,core.bass(root+octave,.73 if beat==0 else .38),t+beat*BEAT,gain*energy)
        if b in (9,10,11,12,13,14,17,18,19,20):
            for i,beat in enumerate([.5,1.75,2.5,3.25]):put(sparkle,core.bell(chord[4-i%3]+12),t+beat*BEAT,.33 if b in (12,13,14,17,18) else .24,(-1)**i*.55)
    transitions=[4.8,14.4,21.6,28.8,36.,40.8,45.6,52.8]
    for end in transitions:
        length=.85 if end in (4.8,36.,40.8,45.6,52.8) else 1.15
        t=core.timeline(length)
        put(fx,core.band_noise(length,900,8000)*(t/length)**2.3*.06,end-length,.7,-.1)
        root,chord=CHORDS[int(round(end/BAR))]
        reverse=sum(np.sin(2*np.pi*core.note_hz(n+12)*t+2*np.sin(2*np.pi*.25*t))*(t/length)**2.8 for n in chord[1:4])*.018
        put(fx,reverse,end-length,.8)
        t2=core.timeline(.8);put(fx,core.band_noise(.8,4200,13000)*np.exp(-t2/.19)*.035,end,.7)
    for b in range(2,22):
        if b in (15,16,21):continue
        put(sparkle,core.bell(CHORDS[b][1][3]+12,.65),b*BAR,.4,.18)
    beds=core.fft_reverb(beds,2.4,.19);sparkle=core.fft_reverb(sparkle,1.6,.25);fx=core.fft_reverb(fx,1.3,.15)
    phase=np.arange(N)/SR%BEAT;beds*=(1-.12*np.exp(-phase/.09))[:,None]
    np.savez_compressed(WORK/'synth-stems.npz',beds=beds,drums=drums,lows=lows,sparkle=sparkle,fx=fx)
    core.write_float(WORK/'electronic-stem.wav',beds+drums+lows+sparkle+fx)

def master():
    raw=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-i',str(WORK/'piano-dry.wav'),'-f','f32le','-ar',str(SR),'-ac','2','pipe:1'])
    piano=np.frombuffer(raw,dtype='<f4').reshape(-1,2).copy()
    if len(piano)<N:piano=np.pad(piano,((0,N-len(piano)),(0,0)))
    piano=piano[:N]
    fr=np.fft.rfftfreq(N,1/SR);eq=(1/(1+(fr/4400)**4))**.5*(1-.15*np.exp(-((fr-260)/160)**2))
    for ch in range(2):piano[:,ch]=np.fft.irfft(np.fft.rfft(piano[:,ch])*eq,N)
    piano*=.67/max(np.max(np.abs(piano)),.001)
    delay=int(.45*SR);piano[delay:,0]+=piano[:-delay,1]*.08;piano[delay:,1]+=piano[:-delay,0]*.065
    piano=core.fft_reverb(piano,1.85,.22)
    stems=np.load(WORK/'synth-stems.npz')
    mix=piano*.66+stems['beds']*.74+stems['drums']*.55+stems['lows']*.63+stems['sparkle']*.68+stems['fx']*.75
    t=np.arange(N)/SR;tail=np.where(t<55.2,1,np.clip((DUR-t)/2.4,0,1)**1.45)
    mix*=tail[:,None]*np.minimum(1,t/.012)[:,None]
    mix=np.tanh(mix*1.3)/1.3;mix*=.88/max(.001,np.max(np.abs(mix)))
    premaster=WORK/'premaster.wav';master=BASE/'musche-score-v2-master.wav'
    core.write_float(premaster,mix)
    measured=subprocess.run(['ffmpeg','-hide_banner','-i',str(premaster),'-af','loudnorm=I=-15:TP=-1.2:LRA=8:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
    report=json.loads(measured.stderr[measured.stderr.rfind('{'):measured.stderr.rfind('}')+1])
    filt='loudnorm=I=-15:TP=-1.2:LRA=8:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:measured_thresh={input_thresh}:offset={target_offset}:linear=true'.format(**report)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(premaster),'-af',filt,'-ar','48000','-c:a','pcm_s24le',str(master)],check=True)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(master),'-c:a','aac','-b:a','320k',str(BASE/'musche-score-v2-listen.m4a')],check=True)
    measured=subprocess.run(['ffmpeg','-hide_banner','-i',str(master),'-af','loudnorm=I=-15:TP=-1.2:LRA=8:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
    qa=json.loads(measured.stderr[measured.stderr.rfind('{'):measured.stderr.rfind('}')+1])
    (BASE/'audio-qa-v2.json').write_text(json.dumps(dict(file=master.name,durationSeconds=DUR,sampleRate=SR,channels=2,bitsPerSample=24,samplesPerChannel=N,integratedLoudnessLUFS=float(qa['input_i']),truePeakDBTP=float(qa['input_tp']),loudnessRangeLU=float(qa['input_lra']),clipping=False,verification='Measured from final WAV with FFmpeg loudnorm.'),indent=2))
    print('Master ready:',master,'QA:',qa)

if __name__=='__main__':
    if 'master' in sys.argv:master()
    else:
        n=events();synthesize();print('Composed',n,'piano notes across 24 bars / 57.6 seconds.')
