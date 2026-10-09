"""Original Musche launch score. Deterministic composition and synthesis; 100 BPM.

Piano notes are rendered with macOS's built-in DLS instrument by render_piano.swift.
All other instruments, percussion and mix processing are generated here.
No commercial recording, downloaded music, or third-party audio sample is used.
"""
from pathlib import Path
import json, math, subprocess, wave
import numpy as np

ROOT = Path(__file__).resolve().parent
SR = 48000
DUR = 48.0
BEAT = .6
BAR = 2.4
N = int(DUR * SR)
RNG = np.random.default_rng(1421)

# B minor opens into D major. Extended, open voicings keep the cue spacious.
CHORDS = [
    (35,[47,54,57,61,66]), (35,[47,54,57,61,66]),
    (31,[43,50,54,57,62]), (33,[45,52,54,59,64]),
    (38,[50,57,61,64,66]), (38,[50,57,61,64,69]),
    (31,[43,50,54,57,62]), (33,[45,52,59,61,64]),
    (35,[47,54,57,61,66]), (31,[43,50,54,57,62]),
    (38,[50,57,61,64,69]), (33,[45,52,57,59,64]),
    (35,[47,54,57,61,66]), (31,[43,50,54,57,62]),
    (38,[50,57,61,64,69]), (33,[45,52,57,59,64]),
    (31,[43,50,54,57,62]), (33,[45,52,57,59,64]),
    (38,[50,57,61,64,66]), (38,[50,57,61,64,66])
]

def note_hz(n): return 440. * 2. ** ((n - 69) / 12)
def timeline(sec): return np.arange(int(sec * SR), dtype=np.float64) / SR
def smooth_envelope(t, attack, release, length):
    return np.minimum(1., t / max(.001, attack)) ** 1.3 * np.minimum(1., np.maximum(0, length-t) / max(.001,release)) ** 1.5

def put(dest, sound, time, gain=1., pan=0.):
    start = int(round(time * SR))
    if start < 0:
        sound = sound[-start:]; start = 0
    length = min(len(sound), len(dest)-start)
    if length <= 0: return
    sound = sound[:length]
    if sound.ndim == 1:
        angle = (pan+1) * math.pi/4
        dest[start:start+length, 0] += (sound * gain * math.cos(angle)).astype(np.float32)
        dest[start:start+length, 1] += (sound * gain * math.sin(angle)).astype(np.float32)
    else: dest[start:start+length] += (sound * gain).astype(np.float32)

def band_noise(seconds, lo=1000, hi=10000):
    count = int(seconds*SR)
    x = RNG.normal(0,1,count)
    spectrum = np.fft.rfft(x)
    frequencies = np.fft.rfftfreq(count,1/SR)
    shape = (1/(1+(lo/np.maximum(frequencies,1))**6)) * 1/(1+(frequencies/hi)**10)
    x = np.fft.irfft(spectrum*shape, count)
    return x / max(.01,np.std(x))

def write_float(path, sound):
    # Feed float32 to ffmpeg and store 24-bit production masters.
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','pipe:0','-c:a','pcm_s24le',str(path)],input=sound.astype('<f4').tobytes(),check=True)

def events():
    result=[]
    def piano(time,note,velocity=60,length=1.2):
        result.append(dict(time=round(time,5),note=note,velocity=int(velocity),duration=length))
    # Sparse, deliberate opening gesture; recurring three-note identity.
    for time,note,velocity,duration in [
        (0,66,79,2.1),(1.2,61,68,1.1),(1.8,62,75,1.4),(3.0,69,78,1.3),
        (3.9,66,66,.7),(4.8,62,79,1.8),(6.0,69,70,1.3),(6.6,71,79,1.4),
        (7.8,69,72,.8),(8.4,64,72,1.0),(9.0,61,66,.6)]: piano(time,note,velocity,duration)
    # Arpeggiation is rhythmically related, but retains small human timing/velocity.
    arp_pattern=[0,2,3,1,4,2,3,1]
    for b,(bass,chord) in enumerate(CHORDS[:18]):
        time=b*BAR
        if b<4:
            for i,note in enumerate(chord[:3]): piano(time+.012*i,note,44+i*3,2.5)
            continue
        energy=1 if b<8 else 1.12 if b<12 else 1.25 if b<16 else .72
        for i,index in enumerate(arp_pattern):
            if b>=16 and i%2: continue
            vel=(47+[5,0,7,0,10,0,6,0][i]+RNG.integers(-3,4))*energy
            note=chord[index]+(12 if i in (4,6) and b>=12 else 0)
            piano(time+i*.3+(0 if i==0 else RNG.uniform(-.009,.009)),note,vel,.8 if b<16 else 1.4)
        # Soft root/fifth foundation with changing inversion.
        piano(time,bass+12,48*energy,2.05)
        piano(time+.009,bass+19,40*energy,1.9)
    # Melodic phrase: breath, response and lift instead of a constant scale.
    melody={
      4:[(0,78,78),(1.5,76,71),(2.5,73,73)],
      5:[(0,74,76),(2,69,68),(3,73,71)],
      6:[(0,74,76),(1.5,78,73),(3,81,78)],
      7:[(0,76,75),(2,73,70),(3,71,71)],
      8:[(0,78,83),(1.5,73,74),(2.5,74,81)],
      9:[(0,81,82),(1.5,78,77),(3,74,77)],
      10:[(0,78,84),(1,81,76),(2.5,85,78)],
      11:[(0,83,79),(1.5,81,75),(3,76,74)],
      12:[(0,78,87),(1.5,81,77),(2.5,85,85)],
      13:[(0,86,84),(1.5,85,76),(3,81,78)],
      14:[(0,85,87),(1,81,76),(2.5,78,83)],
      15:[(0,76,82),(1.5,73,72),(3,71,73)],
      16:[(0,74,78),(2,78,72)],
      17:[(0,76,74),(1.5,73,65),(3,69,65)]}
    for b,phrase in melody.items():
        for beat,note,vel in phrase: piano(b*BAR+beat*BEAT,note,vel,1.25 if b<16 else 1.6)
    # Final major-nine logo cadence, played as a tiny upward roll.
    for i,note in enumerate([38,50,57,61,66,69,74,78]): piano(43.2+i*.012,note,72 if i<4 else 76,4.65-i*.012)
    piano(44.4,81,61,3.4)
    piano(45.0,78,56,2.85)
    result.sort(key=lambda x:x['time'])
    (ROOT/'piano-events.json').write_text(json.dumps(result,indent=2))
    return result

def pad(note, seconds=3.2):
    t=timeline(seconds); freq=note_hz(note)
    stereo=np.zeros((len(t),2),dtype=np.float64)
    for side in range(2):
        for cents,weight in [(-6,.33),(0,.38),(5,.29)]:
            f=freq*2**((cents+(side-.5)*2.5)/1200)
            drift=.8*np.sin(t*2*np.pi*.13+side*1.8)
            phase=2*np.pi*f*t + drift*.04
            for h in range(1,9):
                stereo[:,side]+=weight/h**1.95 * np.sin(h*phase+RNG.uniform(0,2*np.pi))*np.exp(-h/8)
    stereo *= smooth_envelope(t,.45,1.2,seconds)[:,None]
    return stereo*.2

def bass(note,seconds=.48):
    t=timeline(seconds); f=note_hz(note)
    x=np.sin(2*np.pi*f*t)+.21*np.sin(4*np.pi*f*t)+.07*np.sin(6*np.pi*f*t)
    envelope=(1-np.exp(-t/.009))*np.exp(-t/1.1)*np.minimum(1,np.maximum(0,seconds-t)/.08)
    return np.tanh(x*1.35)/1.35*envelope

def kick():
    t=timeline(.48)
    phase=2*np.pi*(48*t+79*.021*(1-np.exp(-t/.021)))
    body=np.sin(phase)*np.exp(-t/.13)*(1-np.exp(-t/.002))
    attack=band_noise(.48,600,3800)*np.exp(-t/.004)*.065
    return np.tanh((body+attack)*1.35)/1.35

def hat(opened=False):
    seconds=.25 if opened else .07
    t=timeline(seconds)
    return band_noise(seconds,6500,14000)*np.exp(-t/(.055 if opened else .013))*(1-np.exp(-t/.0005))*.13

def clap():
    t=timeline(.24)
    noise=band_noise(.24,1400,6500)
    env=sum(np.where(t>=on,np.exp(-np.maximum(0,t-on)/decay),0)*volume for on,decay,volume in [(0,.005,.4),(.009,.007,.6),(.020,.032,.6)])
    tone=np.sin(2*np.pi*188*t)*np.exp(-t/.025)*.14
    return (noise*env*.2+tone)*(1-np.exp(-t/.0008))

def wood():
    t=timeline(.11)
    return (np.sin(2*np.pi*810*t)+.36*np.sin(2*np.pi*1780*t))*np.exp(-t/.012)*(1-np.exp(-t/.0004))*.2

def bell(note,seconds=.8):
    t=timeline(seconds);f=note_hz(note)
    x=np.sin(2*np.pi*f*t+1.1*np.sin(2*np.pi*f*2*t)*np.exp(-t/.055))
    return x*np.exp(-t/.16)*(1-np.exp(-t/.002))*.11

def fft_reverb(x,decay=1.6,wet=.14):
    length=int(SR*2.6)
    t=np.arange(length)/SR
    out=x.copy()
    fftlen=1<<((len(x)+length-1).bit_length())
    for side in range(2):
        ir=RNG.normal(size=length)*np.exp(-t/(decay*.32))
        # Diffuse late field, preceded by a 24 ms gap.
        ir[:int(.024*SR)]=0
        ir=np.convolve(ir,np.ones(7)/7,mode='same')
        ir/=np.sqrt(np.sum(ir*ir))
        for d,g in [(.031,.17),(.047,.10),(.079,.08)]:ir[int((d+side*.003)*SR)]+=g
        convolved=np.fft.irfft(np.fft.rfft(x[:,side],fftlen)*np.fft.rfft(ir,fftlen),fftlen)[:len(x)]
        out[:,side]+=convolved*wet
    return out

def synthesize():
    beds=np.zeros((N,2),np.float32)
    drums=np.zeros_like(beds); lows=np.zeros_like(beds); sparkle=np.zeros_like(beds); fx=np.zeros_like(beds)
    K=kick(); C=clap(); W=wood()
    for b,(root,chord) in enumerate(CHORDS[:19]):
        time=b*BAR
        energy=.7 if b<4 else 1 if b<8 else 1.08 if b<12 else 1.18 if b<16 else .78 if b<18 else .75
        for i,note in enumerate(chord[1:]): put(beds,pad(note,4.8 if b==18 else 3.45),time,.33*energy)
        if b<4:
            if b in (0,2):put(lows,bass(root,1.9),time,.20)
            if b>=2:
                for beat in (0,2):put(drums,W,time+beat*BEAT,.26,pan=-.35 if beat==0 else .25)
                for beat in (1.5,3.5):put(drums,hat(),time+beat*BEAT,.55,pan=.4)
            continue
        if b>=18:
            put(lows,bass(root,3.9),time,.32)
            put(drums,K,time,.41)
            continue
        # Drum energy opens in four-bar sections, then leaves room for the brand.
        if b<16:
            kickbeats=[0,2,3.5] if b<8 else [0,1.5,2,3.5] if b<12 else [0,1,2,2.75,3.5]
            for beat in kickbeats: put(drums,K,time+beat*BEAT,.62 if beat%1==0 else .44)
            for beat in [1,3]:put(drums,C,time+beat*BEAT,.65 if b<8 else .8,pan=.03)
            for step in range(8):
                put(drums,hat(step in (3,7) and b>=8),time+step*.3+(0.012 if step%2 else 0),.62 if step%2 else .36,pan=.24 if step%2 else -.34)
            for beat in ([.75,2.75] if b<12 else [.75,1.75,2.5,3.75]):
                put(drums,W,time+beat*BEAT,.28,pan=-.42 if beat<2 else .47)
        else:
            for beat in [0,2]:put(drums,K,time+beat*BEAT,.42)
            for beat in [1,3]:put(drums,hat(),time+beat*BEAT,.43,.2)
        for beat,octave,gain in [(0,0,.37),(1.5,0,.27),(2.5,0,.30),(3.5,12,.18)]:
            if b>=16 and beat not in (0,2.5):continue
            put(lows,bass(root+octave,.73 if beat==0 else .38),time+beat*BEAT,gain*energy)
        if 8<=b<16:
            for i,beat in enumerate([.5,1.75,2.5,3.25]):put(sparkle,bell(chord[4-i%3]+12),time+beat*BEAT,.24 if b<12 else .33,pan=(-1)**i*.55)
    # Controlled air rises and harmonic reverse swells connect picture sections.
    accents=[0,9.6,19.2,28.8,38.4,43.2]
    for j,end in enumerate(accents[1:]):
        length=1.15 if end!=43.2 else .9
        t=timeline(length)
        rising=band_noise(length,900,8000)*(t/length)**2.3*.06
        put(fx,rising,end-length,.85,pan=-.1)
        root,chord=CHORDS[int(round(end/BAR))]
        reverse=sum(np.sin(2*np.pi*note_hz(n+12)*t+2*np.sin(2*np.pi*.25*t))*((t/length)**2.8) for n in chord[1:4])*.018
        put(fx,reverse,end-length,.8)
        t2=timeline(.8)
        shimmer=band_noise(.8,4200,13000)*np.exp(-t2/.19)*.035
        put(fx,shimmer,end,.7)
    # Small bespoke landing sounds at visible half-bar changes.
    for t,note in [(4.8,74),(12.,78),(14.4,74),(16.8,76),(21.6,74),(24.,78),(26.4,76),(31.2,81),(33.6,78),(36.,76),(40.8,76)]:
        put(sparkle,bell(note,.65),t,.40,pan=.18)
    beds=fft_reverb(beds,2.4,.19)
    sparkle=fft_reverb(sparkle,1.6,.25)
    fx=fft_reverb(fx,1.3,.15)
    # Gentle rhythmic breathing on sustained material; only 12% maximum ducking.
    phase=np.arange(N)/SR%BEAT
    duck=1-.12*np.exp(-phase/.09)
    beds*=duck[:,None]
    np.savez_compressed(ROOT/'synth-stems.npz',beds=beds,drums=drums,lows=lows,sparkle=sparkle,fx=fx)
    write_float(ROOT/'electronic-stem.wav',beds+drums+lows+sparkle+fx)
    return beds,drums,lows,sparkle,fx

def master():
    raw=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-i',str(ROOT/'piano-dry.wav'),'-f','f32le','-ar',str(SR),'-ac','2','pipe:1'])
    piano=np.frombuffer(raw,dtype='<f4').reshape(-1,2).copy()
    if len(piano)<N:piano=np.pad(piano,((0,N-len(piano)),(0,0)))
    piano=piano[:N]
    # Felt-like voicing: soften hammer transients above 4 kHz, retain piano body.
    fr=np.fft.rfftfreq(N,1/SR)
    eq=(1/(1+(fr/4400)**4))**.5*(1-.15*np.exp(-((fr-260)/160)**2))
    for ch in range(2):piano[:,ch]=np.fft.irfft(np.fft.rfft(piano[:,ch])*eq,N)
    piano*=.67/max(np.max(np.abs(piano)),.001)
    # Dotted eighth stereo return: extremely restrained, sustains inter-note motion.
    delay=int(.45*SR)
    piano[delay:,0]+=piano[:-delay,1]*.08
    piano[delay:,1]+=piano[:-delay,0]*.065
    piano=fft_reverb(piano,1.85,.22)
    stems=np.load(ROOT/'synth-stems.npz')
    mix=piano*.66+stems['beds']*.74+stems['drums']*.55+stems['lows']*.63+stems['sparkle']*.68+stems['fx']*.75
    # Smooth natural tail, with a two-second exponential finish; no abrupt cut.
    time=np.arange(N)/SR
    tail=np.where(time<45,1, np.clip((48-time)/3,0,1)**1.45)
    intro=np.minimum(1,time/.012)
    mix*=tail[:,None]*intro[:,None]
    mix=np.tanh(mix*1.3)/1.3
    mix*=.88/max(.001,np.max(np.abs(mix)))
    write_float(ROOT/'musche-score-premaster.wav',mix)
    measured=subprocess.run(['ffmpeg','-hide_banner','-i',str(ROOT/'musche-score-premaster.wav'),'-af','loudnorm=I=-15:TP=-1.2:LRA=8:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
    report=json.loads(measured.stderr[measured.stderr.rfind('{'):measured.stderr.rfind('}')+1])
    normalize='loudnorm=I=-15:TP=-1.2:LRA=8:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:measured_thresh={input_thresh}:offset={target_offset}:linear=true'.format(**report)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(ROOT/'musche-score-premaster.wav'),'-af',normalize,'-ar','48000','-c:a','pcm_s24le',str(ROOT/'musche-score-master.wav')],check=True)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(ROOT/'musche-score-master.wav'),'-c:a','aac','-b:a','320k',str(ROOT/'musche-score-listen.m4a')],check=True)
    print('Master:',ROOT/'musche-score-master.wav')

if __name__=='__main__':
    import sys
    if 'master' in sys.argv:master()
    else:
        events();synthesize()
        print('Composition, piano event map and electronic stems ready.')
