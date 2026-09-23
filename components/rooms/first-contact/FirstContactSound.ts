import type { FirstContactPhase } from "./types";

type FirstContactSound = {
  setPhase: (phase: FirstContactPhase) => void;
  accent: (phase: FirstContactPhase) => void;
  dispose: () => void;
};

function ramp(param: AudioParam, value: number, at: number, duration = 0.55) {
  param.cancelScheduledValues(at);
  param.setValueAtTime(Math.max(0.0001, param.value), at);
  param.exponentialRampToValueAtTime(Math.max(0.0001, value), at + duration);
}

function ping(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  at: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, at);
  filter.type = "lowpass";
  filter.frequency.value = 2500;
  filter.Q.value = 0.5;

  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  osc.start(at);
  osc.stop(at + duration + 0.04);
}

function ceramicTick(
  ctx: AudioContext,
  destination: AudioNode,
  at: number,
  volume = 0.017,
  frequency = 2150,
) {
  const frameCount = Math.max(1, Math.floor(ctx.sampleRate * 0.08));
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    const decay = Math.exp(-index / (frameCount * 0.15));
    data[index] = (Math.random() * 2 - 1) * decay;
  }

  const source = ctx.createBufferSource();
  const band = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  band.type = "bandpass";
  band.frequency.value = frequency;
  band.Q.value = 4.1;

  gain.gain.setValueAtTime(volume, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.075);

  source.connect(band);
  band.connect(gain);
  gain.connect(destination);
  source.start(at);
}

function makeAir(ctx: AudioContext, destination: AudioNode) {
  const seconds = 2;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let index = 0; index < data.length; index += 1) {
    const white = Math.random() * 2 - 1;
    last = last * 0.984 + white * 0.016;
    data[index] = last * 0.72;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  source.loop = true;
  filter.type = "bandpass";
  filter.frequency.value = 560;
  filter.Q.value = 0.45;
  gain.gain.value = 0.0001;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start();

  return { source, filter, gain };
}

export function createFirstContactSound(ctx: AudioContext): FirstContactSound {
  const master = ctx.createGain();
  const compressor = ctx.createDynamicsCompressor();
  const low = ctx.createOscillator();
  const mid = ctx.createOscillator();
  const lowGain = ctx.createGain();
  const midGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  master.gain.value = 0.0001;
  compressor.threshold.value = -18;
  compressor.knee.value = 14;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.01;
  compressor.release.value = 0.24;

  low.type = "sine";
  mid.type = "triangle";
  low.frequency.value = 88;
  mid.frequency.value = 176;
  lowGain.gain.value = 0.018;
  midGain.gain.value = 0.003;

  filter.type = "lowpass";
  filter.frequency.value = 1250;
  filter.Q.value = 0.55;

  low.connect(lowGain);
  mid.connect(midGain);
  lowGain.connect(filter);
  midGain.connect(filter);
  filter.connect(master);
  master.connect(compressor);
  compressor.connect(ctx.destination);

  const air = makeAir(ctx, filter);

  low.start();
  mid.start();

  const settings: Record<FirstContactPhase, {
    low: number;
    mid: number;
    air: number;
    airHz: number;
    filter: number;
    master: number;
    f1: number;
    f2: number;
  }> = {
    object: { low: .017, mid: .0025, air: .0045, airHz: 500, filter: 1120, master: .34, f1: 86, f2: 172 },
    gap: { low: .021, mid: .0045, air: .0058, airHz: 550, filter: 1250, master: .40, f1: 91, f2: 182 },
    angle: { low: .024, mid: .0080, air: .0064, airHz: 620, filter: 1450, master: .44, f1: 96, f2: 192 },
    signal: { low: .020, mid: .0100, air: .0061, airHz: 720, filter: 1760, master: .47, f1: 102, f2: 204 },
    third: { low: .019, mid: .0130, air: .0076, airHz: 810, filter: 2080, master: .50, f1: 108, f2: 216 },
    residue: { low: .015, mid: .0040, air: .0040, airHz: 520, filter: 1180, master: .33, f1: 91, f2: 182 },
  };

  function setPhase(phase: FirstContactPhase) {
    const now = ctx.currentTime;
    const state = settings[phase];

    low.frequency.exponentialRampToValueAtTime(state.f1, now + 0.8);
    mid.frequency.exponentialRampToValueAtTime(state.f2, now + 0.8);
    air.filter.frequency.exponentialRampToValueAtTime(state.airHz, now + 0.9);
    filter.frequency.exponentialRampToValueAtTime(state.filter, now + 0.9);

    ramp(lowGain.gain, state.low, now, 0.75);
    ramp(midGain.gain, state.mid, now, 0.75);
    ramp(air.gain.gain, state.air, now, 0.9);
    ramp(master.gain, state.master, now, 0.9);
  }

  function accent(phase: FirstContactPhase) {
    const now = ctx.currentTime + 0.012;

    if (phase === "object") {
      ceramicTick(ctx, compressor, now, .018, 2050);
      ping(ctx, compressor, 172, now + .025, .22, .014);
    } else if (phase === "angle") {
      ceramicTick(ctx, compressor, now, .022, 1820);
      ceramicTick(ctx, compressor, now + .10, .014, 2350);
      ping(ctx, compressor, 220, now + .02, .18, .021, "triangle");
    } else if (phase === "signal") {
      ceramicTick(ctx, compressor, now, .016, 2820);
      ping(ctx, compressor, 247, now + .02, .12, .019);
      ping(ctx, compressor, 370, now + .18, .16, .014);
    } else if (phase === "third") {
      ceramicTick(ctx, compressor, now, .018, 2120);
      ping(ctx, compressor, 164, now + .03, .34, .021);
      ping(ctx, compressor, 246, now + .10, .42, .017);
      ping(ctx, compressor, 328, now + .18, .48, .013);
    } else if (phase === "residue") {
      ping(ctx, compressor, 182, now, .42, .013);
      ping(ctx, compressor, 273, now + .09, .48, .008);
    }
  }

  function dispose() {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    window.setTimeout(() => {
      try {
        low.stop();
        mid.stop();
        air.source.stop();
      } catch {
        // Sources may already be stopped during navigation teardown.
      }

      low.disconnect();
      mid.disconnect();
      air.source.disconnect();
      air.filter.disconnect();
      air.gain.disconnect();
      filter.disconnect();
      master.disconnect();
      compressor.disconnect();
    }, 250);
  }

  return { setPhase, accent, dispose };
}
