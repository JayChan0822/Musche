import Foundation
import AVFoundation

struct Note: Decodable { let time: Double; let note: UInt8; let velocity: UInt8; let duration: Double }
struct Event { let sample: Int64; let note: UInt8; let velocity: UInt8; let on: Bool }

let base = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let notes = try JSONDecoder().decode([Note].self, from: Data(contentsOf: base.appendingPathComponent("piano-events.json")))
var events: [Event] = []
for note in notes {
    events.append(Event(sample: Int64((note.time * 48000).rounded()), note: note.note, velocity: note.velocity, on: true))
    events.append(Event(sample: Int64(((note.time + note.duration) * 48000).rounded()), note: note.note, velocity: note.velocity, on: false))
}
events.sort { $0.sample == $1.sample ? (!$0.on && $1.on) : $0.sample < $1.sample }
let engine = AVAudioEngine()
let sampler = AVAudioUnitSampler()
engine.attach(sampler)
let fmt = AVAudioFormat(standardFormatWithSampleRate: 48000, channels: 2)!
engine.connect(sampler, to: engine.mainMixerNode, format: fmt)
try sampler.loadSoundBankInstrument(at: URL(fileURLWithPath: "/System/Library/Components/CoreAudio.component/Contents/Resources/gs_instruments.dls"), program: 0, bankMSB: 0x79, bankLSB: 0)
try engine.enableManualRenderingMode(.offline, format: fmt, maximumFrameCount: 1024)
try engine.start()
let out = try AVAudioFile(forWriting: base.appendingPathComponent("piano-dry.wav"), settings: fmt.settings)
let buf = AVAudioPCMBuffer(pcmFormat: engine.manualRenderingFormat, frameCapacity: 1024)!
var index = 0
var active: [UInt8:Int] = [:]
while engine.manualRenderingSampleTime < 2304000 {
    let now = engine.manualRenderingSampleTime
    while index < events.count && events[index].sample <= now {
        let ev=events[index]
        if ev.on {
            sampler.startNote(ev.note, withVelocity: ev.velocity, onChannel: 0)
            active[ev.note, default: 0] += 1
        } else {
            active[ev.note, default: 0] -= 1
            if active[ev.note, default: 0] <= 0 {sampler.stopNote(ev.note,onChannel:0)}
        }
        index += 1
    }
    let untilNext = index < events.count ? events[index].sample-now : 1024
    let count = AVAudioFrameCount(min(1024,2304000-now,max(1,untilNext)))
    let result = try engine.renderOffline(count, to: buf)
    if result == .success {try out.write(from:buf)}
}
engine.stop()
print("Rendered \(notes.count) piano notes into 48 s stereo stem.")
