"use client";

import {
  Activity,
  Camera,
  Check,
  CircleDot,
  Code2,
  Crosshair,
  Gauge,
  Layers3,
  Lightbulb,
  Move3D,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Workflow,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Lesson } from "@/lib/course";

export function VisualLab({ lesson }: { lesson: Lesson }) {
  const [playing, setPlaying] = useState(true);
  const [primary, setPrimary] = useState(62);
  const [secondary, setSecondary] = useState(38);
  const [mode, setMode] = useState(0);

  useEffect(() => {
    setPlaying(true);
    setPrimary(62);
    setSecondary(38);
    setMode(0);
  }, [lesson.id]);

  const reset = () => {
    setPrimary(62);
    setSecondary(38);
    setMode(0);
    setPlaying(true);
  };

  const labels = getControlLabels(lesson.lab);

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/80 shadow-2xl shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-indigo-500/12 text-indigo-300 ring-1 ring-indigo-400/15">
            <Activity className="size-5" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Laboratoire visuel</p>
            <p className="text-[11px] text-zinc-500">Manipule les paramètres avant de reproduire dans After Effects</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="grid size-9 place-items-center rounded-xl bg-indigo-500 text-white transition hover:bg-indigo-400 active:scale-95"
            aria-label={playing ? "Mettre en pause" : "Lire"}
          >
            {playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
          </button>
          <button
            type="button"
            onClick={reset}
            className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10"
            aria-label="Réinitialiser"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid min-h-[370px] lg:grid-cols-[1.35fr_0.65fr]">
        <div className="lab-grid relative min-h-[300px] overflow-hidden border-b border-white/8 p-5 lg:border-b-0 lg:border-r">
          <LabCanvas
            type={lesson.lab}
            primary={primary}
            secondary={secondary}
            playing={playing}
            mode={mode}
          />
        </div>

        <div className="flex flex-col bg-zinc-900/55 p-5">
          <div className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">
            <SlidersHorizontal className="size-4 text-indigo-300" />
            Contrôles pédagogiques
          </div>

          <div className="space-y-5">
            <RangeControl label={labels[0]} value={primary} onChange={setPrimary} />
            <RangeControl label={labels[1]} value={secondary} onChange={setSecondary} />
          </div>

          <div className="mt-6">
            <p className="mb-2 text-[11px] font-semibold text-zinc-500">Mode d’observation</p>
            <div className="grid grid-cols-3 gap-2">
              {["Source", "Analyse", "Final"].map((label, index) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => setMode(index)}
                  className={`rounded-xl border px-2 py-2 text-[11px] font-bold transition ${
                    mode === index
                      ? "border-indigo-400/30 bg-indigo-500/15 text-indigo-200"
                      : "border-white/8 bg-white/[0.025] text-zinc-500 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-amber-300/12 bg-amber-300/[0.045] p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-300" />
              <p className="text-xs leading-5 text-amber-100/75">
                Change un seul paramètre à la fois. Observe d’abord la cause, puis décris l’effet avec tes propres mots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LabCanvas({
  type,
  primary,
  secondary,
  playing,
  mode,
}: {
  type: Lesson["lab"];
  primary: number;
  secondary: number;
  playing: boolean;
  mode: number;
}) {
  if (type === "graph") return <GraphLab primary={primary} secondary={secondary} playing={playing} mode={mode} />;
  if (type === "path") return <PathLab primary={primary} secondary={secondary} playing={playing} mode={mode} />;
  if (type === "shape") return <ShapeLab primary={primary} secondary={secondary} playing={playing} mode={mode} />;
  if (["expression", "mapping", "rig"].includes(type)) {
    return <ExpressionLab primary={primary} secondary={secondary} playing={playing} mode={mode} type={type} />;
  }
  if (["camera", "light"].includes(type)) {
    return <CameraLab primary={primary} secondary={secondary} playing={playing} mode={mode} type={type} />;
  }
  if (["tracking", "stabilize"].includes(type)) {
    return <TrackingLab primary={primary} secondary={secondary} playing={playing} mode={mode} stabilized={type === "stabilize"} />;
  }
  if (["keying", "roto", "composite"].includes(type)) {
    return <CompositeLab primary={primary} secondary={secondary} playing={playing} mode={mode} type={type} />;
  }
  if (["character", "walk"].includes(type)) {
    return <CharacterLab primary={primary} secondary={secondary} playing={playing} mode={mode} walking={type === "walk"} />;
  }
  if (["particles", "distortion"].includes(type)) {
    return <ParticleLab primary={primary} secondary={secondary} playing={playing} mode={mode} distorted={type === "distortion"} />;
  }
  if (["workflow", "template", "performance"].includes(type)) {
    return <WorkflowLab primary={primary} secondary={secondary} playing={playing} mode={mode} type={type} />;
  }
  return <ExportLab primary={primary} secondary={secondary} mode={mode} />;
}

function GraphLab({ primary, secondary, playing, mode }: LabProps) {
  const peakX = 55 + primary * 1.55;
  const peakY = 235 - secondary * 1.45;
  const handle = 40 + secondary * 1.2;

  return (
    <div className="relative h-full min-h-[310px] rounded-3xl border border-white/8 bg-zinc-950/65 p-4">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-600">
        <span>{mode === 1 ? "Speed Graph" : mode === 2 ? "Résultat animé" : "Value Graph"}</span>
        <span>0s — 2s</span>
      </div>
      {mode === 2 ? (
        <div className="relative flex h-[245px] items-center overflow-hidden rounded-2xl border border-white/6 bg-gradient-to-r from-zinc-950 to-indigo-950/20 px-8">
          <div className="absolute inset-x-8 top-1/2 h-px bg-white/10" />
          <div
            className="graph-object grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-700 shadow-2xl shadow-indigo-950/60"
            style={{
              animationPlayState: playing ? "running" : "paused",
              animationDuration: `${2.1 - primary / 90}s`,
              borderRadius: `${12 + secondary / 3}px`,
            }}
          >
            <Sparkles className="size-6 text-white" />
          </div>
        </div>
      ) : (
        <svg viewBox="0 0 430 245" className="h-[245px] w-full overflow-visible" role="img" aria-label="Courbe d’animation interactive">
          <defs>
            <linearGradient id="graphFill" x1="0" x2="1">
              <stop offset="0" stopColor="#6366f1" stopOpacity="0.06" />
              <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 53.75} x2={i * 53.75} y1="0" y2="245" stroke="rgba(255,255,255,.045)" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" x2="430" y1={i * 49} y2={i * 49} stroke="rgba(255,255,255,.045)" />
          ))}
          <path
            d={`M 18 220 C ${peakX - handle} 220, ${peakX - handle / 2} ${peakY}, ${peakX} ${peakY} S ${360 - handle} 28, 410 28`}
            fill="none"
            stroke="#818cf8"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d={`M 18 220 C ${peakX - handle} 220, ${peakX - handle / 2} ${peakY}, ${peakX} ${peakY} S ${360 - handle} 28, 410 28 L410 245 L18 245 Z`}
            fill="url(#graphFill)"
          />
          <circle cx="18" cy="220" r="7" fill="#18181b" stroke="#a5b4fc" strokeWidth="3" />
          <circle cx={peakX} cy={peakY} r="7" fill="#18181b" stroke="#c4b5fd" strokeWidth="3" />
          <circle cx="410" cy="28" r="7" fill="#18181b" stroke="#a5b4fc" strokeWidth="3" />
          <line x1={peakX} y1={peakY} x2={peakX - handle / 2} y2={peakY + 34} stroke="#71717a" strokeDasharray="4 4" />
          <circle cx={peakX - handle / 2} cy={peakY + 34} r="4" fill="#a1a1aa" />
        </svg>
      )}
    </div>
  );
}

function PathLab({ primary, secondary, playing, mode }: LabProps) {
  const bend = 60 + secondary * 1.6;
  const speed = 3.4 - primary / 45;
  return (
    <div className="relative flex h-full min-h-[310px] items-center justify-center overflow-hidden rounded-3xl border border-white/8 bg-zinc-950/65">
      <svg viewBox="0 0 520 300" className="h-full min-h-[300px] w-full">
        <path d={`M45 235 C150 ${235 - bend}, 330 ${45 + bend / 3}, 475 62`} fill="none" stroke="rgba(129,140,248,.22)" strokeWidth="12" strokeLinecap="round" />
        <path id="motionPath" d={`M45 235 C150 ${235 - bend}, 330 ${45 + bend / 3}, 475 62`} fill="none" stroke="#818cf8" strokeWidth="3" strokeDasharray={mode === 1 ? "6 8" : "0"} strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={45 + i * 107.5} cy={235 - i * 43} r="4" fill="#52525b" opacity={mode === 1 ? 1 : 0.35} />
        ))}
        <g className="path-follower" style={{ animationPlayState: playing ? "running" : "paused", animationDuration: `${Math.max(1.2, speed)}s` }}>
          <circle r="23" fill="#6366f1" />
          <circle cx="-7" cy="-8" r="6" fill="rgba(255,255,255,.35)" />
        </g>
      </svg>
      <div className="absolute bottom-5 left-5 rounded-xl border border-white/8 bg-zinc-900/85 px-3 py-2 text-[11px] text-zinc-400">
        Spatial = forme · Temporel = vitesse
      </div>
    </div>
  );
}

function ShapeLab({ primary, secondary, playing, mode }: LabProps) {
  const dash = 100 - primary;
  const copies = Math.max(3, Math.round(3 + secondary / 10));
  return (
    <div className="relative flex h-full min-h-[310px] items-center justify-center overflow-hidden rounded-3xl border border-white/8 bg-zinc-950/65">
      <div className="relative grid size-64 place-items-center">
        {Array.from({ length: copies }).map((_, index) => {
          const rotation = (360 / copies) * index;
          return (
            <div
              key={index}
              className="absolute h-2 w-24 origin-left rounded-full bg-gradient-to-r from-indigo-500 to-violet-300"
              style={{ transform: `translateX(50%) rotate(${rotation}deg) scaleX(${0.35 + index / copies})`, opacity: 0.3 + index / copies }}
            />
          );
        })}
        <svg viewBox="0 0 220 220" className={`absolute inset-0 size-full ${playing ? "slow-spin" : ""}`} style={{ animationPlayState: playing ? "running" : "paused" }}>
          <circle cx="110" cy="110" r="78" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="16" />
          <circle
            cx="110"
            cy="110"
            r="78"
            fill="none"
            stroke={mode === 1 ? "#34d399" : "#818cf8"}
            strokeWidth={8 + secondary / 10}
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${primary} ${dash}`}
            transform="rotate(-90 110 110)"
          />
        </svg>
        <div className="grid size-20 place-items-center rounded-3xl border border-white/10 bg-zinc-900/90 shadow-2xl">
          <Layers3 className="size-8 text-indigo-300" />
        </div>
      </div>
      <span className="absolute bottom-5 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {copies} copies · Trim {primary}%
      </span>
    </div>
  );
}

function ExpressionLab({ primary, secondary, playing, mode, type }: LabProps & { type: string }) {
  const mapped = Math.round(20 + primary * 1.6);
  const margin = 12 + secondary / 2;
  const code = type === "mapping"
    ? `progress = effect("Progression")("Slider");\nease(progress, 0, 100, 20, ${mapped});`
    : type === "rig"
      ? `box = thisComp.layer("TITLE");\nr = box.sourceRectAtTime();\n[r.width + ${Math.round(margin * 2)}, r.height + ${Math.round(margin * 2)}]`
      : `source = thisComp.layer("CTRL");\nvalue + source.effect("Décalage")("Slider") * ${Math.max(1, Math.round(primary / 20))};`;

  return (
    <div className="grid h-full min-h-[310px] gap-4 md:grid-cols-[1.05fr_0.95fr]">
      <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#0c0d13]">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3 text-[11px] text-zinc-500">
          <Code2 className="size-4 text-indigo-300" /> expression.jsx
        </div>
        <pre className="whitespace-pre-wrap p-5 font-mono text-xs leading-7 text-zinc-300">
          <span className="text-violet-300">{code.split("\n")[0]}</span>{"\n"}
          <span className="text-indigo-300">{code.split("\n").slice(1).join("\n")}</span>
        </pre>
        <div className="mx-4 rounded-2xl border border-emerald-400/12 bg-emerald-400/[0.045] px-4 py-3 text-xs text-emerald-200/80">
          Résultat calculé : <strong>{mapped}</strong> px · marge <strong>{Math.round(margin)}</strong> px
        </div>
      </div>
      <div className="relative flex items-center justify-center overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-indigo-950/30 to-zinc-950">
        <div
          className={`relative flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-700 shadow-2xl shadow-indigo-950/50 ${playing ? "gentle-float" : ""}`}
          style={{
            width: `${Math.min(230, 85 + primary * 1.35)}px`,
            height: `${60 + secondary * 0.7}px`,
            borderRadius: `${12 + secondary / 3}px`,
            animationPlayState: playing ? "running" : "paused",
            opacity: mode === 1 ? 0.5 : 1,
          }}
        >
          <span className="px-5 text-center text-sm font-black text-white">TITRE ADAPTATIF</span>
          {mode === 1 && <div className="absolute -inset-3 rounded-[inherit] border border-dashed border-emerald-300/70" />}
        </div>
      </div>
    </div>
  );
}

function CameraLab({ primary, secondary, playing, mode, type }: LabProps & { type: string }) {
  const perspective = 480 + primary * 6;
  const depth = 30 + secondary * 2.2;
  return (
    <div className="relative h-full min-h-[310px] overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-indigo-950/20 to-zinc-950">
      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-xl border border-white/8 bg-zinc-950/70 px-3 py-2 text-[11px] text-zinc-400">
        {type === "light" ? <Sun className="size-4 text-amber-300" /> : <Camera className="size-4 text-indigo-300" />}
        {type === "light" ? `Intensité ${primary}%` : `Focale ${Math.round(20 + primary * 0.55)} mm`}
      </div>
      {type === "light" && (
        <div
          className="absolute left-[18%] top-[18%] size-24 rounded-full bg-amber-200/25 blur-2xl"
          style={{ opacity: primary / 100, transform: `scale(${0.6 + secondary / 90})` }}
        />
      )}
      <div
        className={`absolute inset-0 flex items-center justify-center ${playing ? "camera-drift" : ""}`}
        style={{ perspective: `${perspective}px`, animationPlayState: playing ? "running" : "paused" }}
      >
        <div className="relative h-44 w-64" style={{ transformStyle: "preserve-3d", transform: `rotateY(${-16 + secondary / 4}deg) rotateX(${5 - primary / 25}deg)` }}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="absolute inset-0 flex items-center justify-center rounded-3xl border border-white/12 bg-gradient-to-br from-zinc-800/95 to-zinc-950/95 shadow-2xl"
              style={{ transform: `translateZ(${(index - 1.5) * depth}px) translateX(${(index - 1.5) * 9}px)`, opacity: 0.45 + index * 0.16 }}
            >
              <div className={`rounded-2xl ${index === 2 ? "size-20 bg-indigo-500" : "h-3 w-28 bg-white/10"}`} />
            </div>
          ))}
        </div>
      </div>
      {mode === 1 && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 bg-emerald-400/15" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-emerald-400/15" />
          <Crosshair className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-emerald-300" />
        </div>
      )}
    </div>
  );
}

function TrackingLab({ primary, secondary, playing, mode, stabilized }: LabProps & { stabilized: boolean }) {
  const drift = Math.max(0, 30 - primary / 3.4);
  return (
    <div className="relative h-full min-h-[310px] overflow-hidden rounded-3xl border border-white/8 bg-zinc-950/65">
      <div
        className={`${playing ? "tracked-footage" : ""} absolute inset-0`}
        style={{ animationPlayState: playing ? "running" : "paused", animationDuration: `${4.3 - secondary / 55}s` }}
      >
        <div className="absolute inset-6 rounded-3xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-indigo-950/30">
          <div className="absolute left-[18%] top-[20%] h-24 w-36 rounded-2xl bg-zinc-700/50" />
          <div className="absolute bottom-[16%] right-[13%] h-32 w-44 rounded-3xl bg-zinc-800" />
          <div className="absolute left-[46%] top-[44%] size-8 rounded-md bg-amber-300 shadow-lg shadow-amber-950/30" />
        </div>
      </div>
      <div
        className={`${playing && !stabilized ? "tracker-follow" : ""} absolute left-[49%] top-[48%] size-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-indigo-300/80`}
        style={{ animationPlayState: playing ? "running" : "paused", transform: `translate(calc(-50% + ${drift}px), calc(-50% - ${drift / 2}px))` }}
      >
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-indigo-300/35" />
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-indigo-300/35" />
        <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-200" />
      </div>
      {mode === 1 && (
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-white/8 bg-zinc-950/80 px-4 py-3 text-[11px] text-zinc-400">
          <span>Confiance du track</span>
          <span className="font-black text-emerald-300">{Math.round(58 + primary * 0.41)}%</span>
        </div>
      )}
      {stabilized && (
        <div className="absolute right-5 top-5 flex items-center gap-2 rounded-xl bg-emerald-400/10 px-3 py-2 text-[11px] font-bold text-emerald-300">
          <Check className="size-4" /> Mouvement compensé
        </div>
      )}
    </div>
  );
}

function CompositeLab({ primary, secondary, playing, mode, type }: LabProps & { type: string }) {
  const split = 20 + primary * 0.62;
  const feather = 4 + secondary / 3;
  return (
    <div className="relative h-full min-h-[310px] overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-sky-950/30 via-zinc-950 to-violet-950/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(56,189,248,.15),transparent_30%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
      <div
        className={`${playing ? "subject-breathe" : ""} absolute bottom-7 left-1/2 h-56 w-36 -translate-x-1/2 rounded-[52px_52px_28px_28px] bg-gradient-to-b from-amber-200 via-rose-300 to-indigo-800 shadow-2xl`}
        style={{
          animationPlayState: playing ? "running" : "paused",
          filter: type === "roto" ? `drop-shadow(0 0 ${feather}px rgba(255,255,255,.25))` : `saturate(${0.7 + secondary / 80})`,
          opacity: mode === 1 ? 0.9 : 1,
        }}
      >
        <div className="absolute -top-14 left-1/2 size-24 -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-100 to-rose-300" />
      </div>
      {mode === 0 && type === "keying" && (
        <div className="absolute inset-0 -z-0 bg-emerald-500/30" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }} />
      )}
      {mode === 1 && (
        <div className="absolute inset-0 bg-black/60">
          <div className="absolute bottom-7 left-1/2 h-56 w-36 -translate-x-1/2 rounded-[52px_52px_28px_28px] bg-white">
            <div className="absolute -top-14 left-1/2 size-24 -translate-x-1/2 rounded-full bg-white" />
          </div>
        </div>
      )}
      <div className="absolute left-5 top-5 rounded-xl border border-white/8 bg-zinc-950/75 px-3 py-2 text-[11px] text-zinc-400">
        {type === "keying" ? "Screen Matte & spill" : type === "roto" ? "Segmentation & contour" : "Match lumière & texture"}
      </div>
      {mode === 2 && (
        <div className="absolute bottom-5 right-5 rounded-xl bg-indigo-500/15 px-3 py-2 text-[11px] font-bold text-indigo-200">Composite final</div>
      )}
    </div>
  );
}

function CharacterLab({ primary, secondary, playing, mode, walking }: LabProps & { walking: boolean }) {
  const arm = -30 + primary * 0.6;
  const leg = -24 + secondary * 0.55;
  return (
    <div className="relative flex h-full min-h-[310px] items-center justify-center overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-violet-950/25 to-zinc-950">
      <div className="absolute bottom-12 h-px w-4/5 bg-white/10" />
      <div className={`${playing ? (walking ? "walk-cycle" : "character-idle") : ""} relative h-64 w-44`} style={{ animationPlayState: playing ? "running" : "paused" }}>
        <div className="absolute left-1/2 top-2 size-20 -translate-x-1/2 rounded-[45%] bg-gradient-to-br from-amber-100 to-rose-300 shadow-xl" />
        <div className="absolute left-1/2 top-[76px] h-28 w-24 -translate-x-1/2 rounded-[32px_32px_22px_22px] bg-indigo-500 shadow-2xl shadow-indigo-950/50" />
        <Limb className="left-[28px] top-[86px]" rotation={arm} origin="top right" />
        <Limb className="right-[28px] top-[86px]" rotation={-arm} origin="top left" />
        <Limb className="bottom-1 left-[57px]" rotation={leg} origin="top center" long />
        <Limb className="bottom-1 right-[57px]" rotation={-leg} origin="top center" long />
        {mode === 1 && ["left-[47%] top-[82px]", "left-[34px] top-[86px]", "right-[34px] top-[86px]", "left-[61px] top-[184px]", "right-[61px] top-[184px]"].map((pos) => (
          <span key={pos} className={`absolute ${pos} size-3 rounded-full border-2 border-emerald-300 bg-zinc-950`} />
        ))}
      </div>
      <div className="absolute bottom-5 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-widest text-zinc-500">
        {walking ? "Contact · Down · Passing · Up" : "Pose · Action · Follow-through"}
      </div>
    </div>
  );
}

function Limb({ className, rotation, origin, long = false }: { className: string; rotation: number; origin: string; long?: boolean }) {
  return (
    <div
      className={`absolute ${className} w-5 rounded-full bg-violet-300 ${long ? "h-24" : "h-20"}`}
      style={{ transform: `rotate(${rotation}deg)`, transformOrigin: origin }}
    >
      <span className="absolute -bottom-1 left-1/2 size-6 -translate-x-1/2 rounded-full bg-violet-200" />
    </div>
  );
}

function ParticleLab({ primary, secondary, playing, mode, distorted }: LabProps & { distorted: boolean }) {
  const particles = useMemo(() => Array.from({ length: 48 }, (_, i) => ({
    left: (i * 37) % 100,
    top: (i * 61) % 100,
    delay: (i % 12) * -0.17,
    size: 3 + (i % 5) * 2,
  })), []);

  return (
    <div className="relative h-full min-h-[310px] overflow-hidden rounded-3xl border border-white/8 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,.28),transparent_45%)]" />
      <div
        className={`absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-[10px] border-indigo-400/80 shadow-[0_0_35px_rgba(99,102,241,.75),inset_0_0_30px_rgba(139,92,246,.7)] ${playing ? "portal-pulse" : ""}`}
        style={{
          animationPlayState: playing ? "running" : "paused",
          filter: distorted ? `blur(${secondary / 45}px)` : undefined,
          transform: `translate(-50%, -50%) scale(${0.65 + primary / 180}) rotate(${secondary * 1.2}deg)`,
        }}
      />
      {particles.slice(0, Math.round(12 + primary / 2)).map((particle, index) => (
        <span
          key={index}
          className={`${playing ? "particle-fly" : ""} absolute rounded-full bg-indigo-300 shadow-[0_0_10px_rgba(129,140,248,.9)]`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationPlayState: playing ? "running" : "paused",
            opacity: mode === 1 ? 0.45 : 0.9,
          }}
        />
      ))}
      <div className="absolute left-5 top-5 rounded-xl border border-white/8 bg-zinc-950/75 px-3 py-2 text-[11px] text-zinc-400">
        {Math.round(12 + primary / 2)} particules · turbulence {secondary}%
      </div>
    </div>
  );
}

function WorkflowLab({ primary, secondary, mode, type }: LabProps & { type: string }) {
  if (type === "performance") {
    const bars = [primary, secondary, 82 - primary / 3, 28 + secondary / 2, 45];
    return (
      <div className="h-full min-h-[310px] rounded-3xl border border-white/8 bg-zinc-950/65 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white"><Gauge className="size-4 text-indigo-300" /> Render Time</div>
          <span className="text-xs text-zinc-500">Frame 01:12</span>
        </div>
        <div className="space-y-4">
          {bars.map((value, index) => (
            <div key={index} className="grid grid-cols-[100px_1fr_52px] items-center gap-3 text-[11px]">
              <span className="truncate text-zinc-500">{["Glow Stack", "Particles", "Precomp 3D", "Roto", "Color"] [index]}</span>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                <div className={`h-full rounded-full ${value > 70 ? "bg-rose-400" : value > 45 ? "bg-amber-300" : "bg-emerald-400"}`} style={{ width: `${value}%` }} />
              </div>
              <span className="text-right font-bold text-zinc-300">{Math.round(value * 2.7)} ms</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const nodes = type === "template"
    ? ["CTRL_GLOBAL", "TITLE", "PALETTE", "MEDIA", "MOGRT"]
    : ["ASSETS", "PRECOMPS", "COMP_MASTER", "RENDER", "ARCHIVE"];

  return (
    <div className="relative flex h-full min-h-[310px] items-center justify-center overflow-hidden rounded-3xl border border-white/8 bg-zinc-950/65 p-6">
      <div className="relative grid w-full max-w-xl grid-cols-5 items-center gap-3">
        {nodes.map((node, index) => (
          <div key={node} className="relative">
            <div
              className={`relative z-10 rounded-2xl border p-3 text-center text-[10px] font-bold ${
                index === mode + 1
                  ? "border-indigo-400/35 bg-indigo-500/15 text-indigo-200"
                  : "border-white/8 bg-zinc-900 text-zinc-400"
              }`}
              style={{ transform: `translateY(${index % 2 ? secondary / 4 : -primary / 5}px)` }}
            >
              {index === 0 ? <Workflow className="mx-auto mb-2 size-5 text-indigo-300" /> : <CircleDot className="mx-auto mb-2 size-5 text-zinc-600" />}
              {node}
            </div>
            {index < nodes.length - 1 && <span className="absolute left-[95%] top-1/2 h-px w-[calc(100%+12px)] bg-gradient-to-r from-indigo-400/50 to-white/8" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportLab({ primary, secondary, mode }: Omit<LabProps, "playing">) {
  const size = Math.max(6, Math.round(95 - primary * 0.74 + secondary * 0.25));
  const score = Math.min(100, Math.round(primary * 0.68 + secondary * 0.32));
  return (
    <div className="grid h-full min-h-[310px] gap-4 md:grid-cols-[1fr_0.9fr]">
      <div className="rounded-3xl border border-white/8 bg-zinc-950/65 p-5">
        <div className="mb-5 flex items-center gap-2 text-sm font-black text-white"><SlidersHorizontal className="size-4 text-indigo-300" /> Module de sortie</div>
        {[
          ["Format", mode === 0 ? "H.264" : mode === 1 ? "ProRes 422" : "ProRes 4444"],
          ["Résolution", "1920 × 1080"],
          ["Débit cible", `${Math.round(4 + primary / 5)} Mb/s`],
          ["Alpha", mode === 2 ? "RGB + Alpha" : "Non"],
          ["Taille estimée", `${size} Mo`],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-white/6 py-3 text-xs last:border-0">
            <span className="text-zinc-500">{label}</span>
            <span className="font-bold text-zinc-200">{value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/8 bg-gradient-to-br from-indigo-950/25 to-zinc-950 p-5 text-center">
        <div className="relative grid size-36 place-items-center rounded-full" style={{ background: `conic-gradient(#6366f1 ${score}%, rgba(255,255,255,.06) 0)` }}>
          <div className="grid size-28 place-items-center rounded-full bg-zinc-950">
            <div>
              <p className="text-3xl font-black text-white">{score}</p>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">qualité</p>
            </div>
          </div>
        </div>
        <p className="mt-5 text-xs leading-5 text-zinc-500">Équilibre simulé entre qualité, poids et compatibilité de livraison.</p>
      </div>
    </div>
  );
}

type LabProps = { primary: number; secondary: number; playing: boolean; mode: number };

function RangeControl({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-zinc-400">{label}</span>
        <span className="rounded-lg bg-indigo-500/10 px-2 py-1 font-black text-indigo-300">{value}%</span>
      </span>
      <input
        type="range"
        min="5"
        max="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-indigo-500"
      />
    </label>
  );
}

function getControlLabels(type: Lesson["lab"]) {
  const map: Record<Lesson["lab"], [string, string]> = {
    graph: ["Influence", "Élasticité"],
    path: ["Vitesse", "Courbure"],
    shape: ["Révélation", "Répétition"],
    expression: ["Valeur source", "Multiplicateur"],
    mapping: ["Progression", "Plage de sortie"],
    rig: ["Longueur du contenu", "Marge dynamique"],
    camera: ["Focale", "Profondeur"],
    light: ["Intensité", "Ouverture"],
    tracking: ["Précision", "Vitesse du plan"],
    stabilize: ["Compensation", "Lissage"],
    keying: ["Clip matte", "Despill"],
    roto: ["Propagation", "Contour progressif"],
    composite: ["Matching", "Texture"],
    character: ["Amplitude des bras", "Amplitude des jambes"],
    walk: ["Énergie", "Transfert de poids"],
    particles: ["Densité", "Turbulence"],
    distortion: ["Déformation", "Évolution"],
    workflow: ["Profondeur", "Décalage"],
    template: ["Contrôles exposés", "Flexibilité"],
    performance: ["Charge principale", "Cache"],
    export: ["Qualité", "Compression"],
  };
  return map[type];
}
