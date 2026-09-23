import type { SeraphPerformanceSnapshot } from "./types";

type SeraphRoomSound = {
  update: (state: SeraphPerformanceSnapshot) => void;
  fracture: () => void;
  dispose: () => void;
};

function createNoiseBuffer(context: AudioContext, seconds: number) {
  const buffer = context.createBuffer(
    1,
    Math.floor(context.sampleRate * seconds),
    context.sampleRate,
  );
  const data = buffer.getChannelData(0);

  let previous = 0;
  for (let index = 0; index < data.length; index += 1) {
    const white = Math.random() * 2 - 1;
    previous = previous * 0.94 + white * 0.06;
    data[index] = previous;
  }

  return buffer;
}

function setTarget(
  param: AudioParam,
  value: number,
  now: number,
  timeConstant = 0.18,
) {
  param.setTargetAtTime(Math.max(0.0001, value), now, timeConstant);
}

export function createSeraphRoomSound(context: AudioContext): SeraphRoomSound {
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  const convolver = context.createConvolver();
  const wet = context.createGain();
  const dry = context.createGain();

  const bodyOsc = context.createOscillator();
  const harmonicOsc = context.createOscillator();
  const bodyGain = context.createGain();
  const harmonicGain = context.createGain();
  const bodyFilter = context.createBiquadFilter();

  const breath = context.createBufferSource();
  const breathGain = context.createGain();
  const breathFilter = context.createBiquadFilter();

  const whisper = context.createBufferSource();
  const whisperGain = context.createGain();
  const whisperFilter = context.createBiquadFilter();

  master.gain.value = 0.0001;
  compressor.threshold.value = -21;
  compressor.knee.value = 15;
  compressor.ratio.value = 4.2;
  compressor.attack.value = 0.012;
  compressor.release.value = 0.28;

  const impulseLength = Math.floor(context.sampleRate * 2.8);
  const impulse = context.createBuffer(2, impulseLength, context.sampleRate);
  for (let channelIndex = 0; channelIndex < 2; channelIndex += 1) {
    const channel = impulse.getChannelData(channelIndex);
    for (let index = 0; index < channel.length; index += 1) {
      const t = index / channel.length;
      channel[index] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.4);
    }
  }
  convolver.buffer = impulse;

  wet.gain.value = 0.37;
  dry.gain.value = 0.86;

  bodyOsc.type = "sine";
  harmonicOsc.type = "triangle";
  bodyOsc.frequency.value = 88;
  harmonicOsc.frequency.value = 178;

  bodyGain.gain.value = 0.034;
  harmonicGain.gain.value = 0.006;

  bodyFilter.type = "lowpass";
  bodyFilter.frequency.value = 620;
  bodyFilter.Q.value = 0.72;

  const noise = createNoiseBuffer(context, 4);

  breath.buffer = noise;
  breath.loop = true;
  breathGain.gain.value = 0.006;
  breathFilter.type = "bandpass";
  breathFilter.frequency.value = 420;
  breathFilter.Q.value = 0.62;

  whisper.buffer = noise;
  whisper.loop = true;
  whisperGain.gain.value = 0.0001;
  whisperFilter.type = "bandpass";
  whisperFilter.frequency.value = 1480;
  whisperFilter.Q.value = 4.2;

  bodyOsc.connect(bodyGain);
  harmonicOsc.connect(harmonicGain);
  bodyGain.connect(bodyFilter);
  harmonicGain.connect(bodyFilter);

  breath.connect(breathFilter);
  breathFilter.connect(breathGain);

  whisper.connect(whisperFilter);
  whisperFilter.connect(whisperGain);

  for (const node of [bodyFilter, breathGain, whisperGain]) {
    node.connect(dry);
    node.connect(convolver);
  }

  dry.connect(master);
  convolver.connect(wet);
  wet.connect(master);
  master.connect(compressor);
  compressor.connect(context.destination);

  bodyOsc.start();
  harmonicOsc.start();
  breath.start();
  whisper.start(context.currentTime + 0.17);

  const now = context.currentTime;
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.13, now + 1.5);

  function update(state: SeraphPerformanceSnapshot) {
    const now = context.currentTime;
    const heat = Math.max(state.strain, state.fracture, state.residue * 0.42);
    const quiet = state.stillness * (0.55 + state.recognition * 0.45);

    setTarget(master.gain, 0.115 + state.presence * 0.025 + heat * 0.018, now, 0.22);
    setTarget(bodyGain.gain, 0.031 + state.presence * 0.016 + heat * 0.01, now, 0.16);
    setTarget(
      harmonicGain.gain,
      0.005 + state.strain * 0.015 + state.fracture * 0.018 - quiet * 0.0025,
      now,
      0.14,
    );
    setTarget(
      breathGain.gain,
      0.005 + state.presence * 0.003 + state.strain * 0.006 - quiet * 0.002,
      now,
      0.23,
    );
    setTarget(
      whisperGain.gain,
      0.0007 + state.strain * 0.006 + state.residue * 0.003 - quiet * 0.0005,
      now,
      0.18,
    );

    const fundamental =
      88 +
      state.recognition * 3.5 +
      state.strain * 11 -
      state.residue * 5 +
      state.fracture * 17;

    bodyOsc.frequency.setTargetAtTime(fundamental, now, 0.17);
    harmonicOsc.frequency.setTargetAtTime(
      fundamental * (2.01 + state.strain * 0.02),
      now,
      0.19,
    );

    bodyFilter.frequency.setTargetAtTime(
      560 +
        state.presence * 520 +
        state.recognition * 120 +
        state.strain * 480 +
        state.fracture * 760 -
        quiet * 130,
      now,
      0.15,
    );

    breathFilter.frequency.setTargetAtTime(
      390 + state.strain * 160 + state.residue * 70,
      now,
      0.23,
    );

    whisperFilter.frequency.setTargetAtTime(
      1320 + state.strain * 520 + state.fracture * 900,
      now,
      0.22,
    );

    wet.gain.setTargetAtTime(
      0.34 + state.recognition * 0.08 + state.residue * 0.17,
      now,
      0.4,
    );
  }

  function fracture() {
    const now = context.currentTime;
    const hit = context.createOscillator();
    const hitGain = context.createGain();
    const noiseSource = context.createBufferSource();
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();

    hit.type = "sine";
    hit.frequency.setValueAtTime(220, now);
    hit.frequency.exponentialRampToValueAtTime(54, now + 1.2);

    hitGain.gain.setValueAtTime(0.0001, now);
    hitGain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
    hitGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.22);

    noiseSource.buffer = createNoiseBuffer(context, 0.7);
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1280;
    noiseFilter.Q.value = 1.2;
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.052, now + 0.012);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    hit.connect(hitGain);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    for (const node of [hitGain, noiseGain]) {
      node.connect(master);
      node.connect(convolver);
    }

    hit.start(now);
    noiseSource.start(now);
    hit.stop(now + 1.25);
    noiseSource.stop(now + 0.72);
  }

  function dispose() {
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    window.setTimeout(() => {
      try {
        bodyOsc.stop();
        harmonicOsc.stop();
        breath.stop();
        whisper.stop();
      } catch {
        // Already stopped during navigation teardown.
      }

      bodyOsc.disconnect();
      harmonicOsc.disconnect();
      breath.disconnect();
      whisper.disconnect();
      master.disconnect();
      compressor.disconnect();
      convolver.disconnect();
    }, 320);
  }

  return { update, fracture, dispose };
}
