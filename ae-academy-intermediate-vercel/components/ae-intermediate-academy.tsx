"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleHelp,
  Clock3,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  Flame,
  FolderOpen,
  Gauge,
  GraduationCap,
  Library,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  Menu,
  MessageCircleMore,
  NotebookPen,
  PanelLeftClose,
  Play,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Star,
  Target,
  TimerReset,
  Trophy,
  UserRound,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { VisualLab } from "@/components/visual-lab";
import {
  FLAT_LESSONS,
  formatDuration,
  getResources,
  INTERMEDIATE_MODULES,
  TOTAL_MINUTES,
  type Lesson,
} from "@/lib/course";

type Tab = "learn" | "practice" | "resources" | "notes";
type ChatMessage = { id: number; role: "mentor" | "student"; content: string };

const STORAGE = {
  completed: "ae-academy-intermediate-completed",
  challenges: "ae-academy-intermediate-challenges",
  quiz: "ae-academy-intermediate-quiz",
  notes: "ae-academy-intermediate-notes",
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "mentor",
    content:
      "Bienvenue dans le parcours intermédiaire. Je peux reformuler le concept, diagnostiquer ton exercice, te donner un indice progressif ou valider ton défi lorsque tu écris « C’est fait ».",
  },
];

export function AEIntermediateAcademy() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [validatedChallenges, setValidatedChallenges] = useState<Set<string>>(new Set());
  const [quizPassed, setQuizPassed] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(
    Object.fromEntries(INTERMEDIATE_MODULES.map((module, index) => [module.id, index < 2])),
  );
  const [tab, setTab] = useState<Tab>("learn");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setCompleted(new Set(JSON.parse(localStorage.getItem(STORAGE.completed) ?? "[]")));
      setValidatedChallenges(new Set(JSON.parse(localStorage.getItem(STORAGE.challenges) ?? "[]")));
      setQuizPassed(new Set(JSON.parse(localStorage.getItem(STORAGE.quiz) ?? "[]")));
      setNotes(JSON.parse(localStorage.getItem(STORAGE.notes) ?? "{}"));
    } catch {
      // Ignore corrupted local storage and start with a clean state.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE.completed, JSON.stringify([...completed]));
    localStorage.setItem(STORAGE.challenges, JSON.stringify([...validatedChallenges]));
    localStorage.setItem(STORAGE.quiz, JSON.stringify([...quizPassed]));
    localStorage.setItem(STORAGE.notes, JSON.stringify(notes));
  }, [completed, validatedChallenges, quizPassed, notes, hydrated]);

  const currentIndex = useMemo(() => {
    const firstOpen = FLAT_LESSONS.findIndex((lesson) => !completed.has(lesson.id));
    return firstOpen === -1 ? FLAT_LESSONS.length - 1 : firstOpen;
  }, [completed]);

  const active = FLAT_LESSONS[selectedIndex];
  const activeModule = INTERMEDIATE_MODULES.find((module) => module.id === active.moduleId)!;
  const progress = Math.round((completed.size / FLAT_LESSONS.length) * 100);
  const learnedMinutes = FLAT_LESSONS.filter((item) => completed.has(item.id)).reduce(
    (sum, item) => sum + item.duration,
    0,
  );
  const activeUnlocked = selectedIndex <= currentIndex || completed.has(active.id);
  const canComplete = validatedChallenges.has(active.id) && quizPassed.has(active.id);
  const resources = getResources(active.resourceIds);

  useEffect(() => {
    setSelectedAnswer(null);
    setQuizFeedback(quizPassed.has(active.id) ? "correct" : null);
    setMessages(initialMessages);
    setDraft("");
  }, [active.id, quizPassed]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  };

  const goToLesson = (index: number) => {
    const lesson = FLAT_LESSONS[index];
    if (!lesson || (index > currentIndex && !completed.has(lesson.id))) return;
    setSelectedIndex(index);
    setTab("learn");
    setSidebarOpen(false);
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const completeLesson = () => {
    if (!canComplete) {
      setTab("practice");
      showToast("Valide le défi et réussis le quiz avant de terminer la leçon.");
      return;
    }

    setCompleted((previous) => new Set(previous).add(active.id));
    const nextIndex = Math.min(selectedIndex + 1, FLAT_LESSONS.length - 1);
    showToast(
      selectedIndex === FLAT_LESSONS.length - 1
        ? "Parcours intermédiaire terminé. Ton capstone est validé."
        : `Leçon terminée · +${active.xp} XP · Étape suivante débloquée`,
    );

    if (nextIndex !== selectedIndex) {
      window.setTimeout(() => goToLesson(nextIndex), 500);
    }
  };

  const markChallenge = () => {
    setValidatedChallenges((previous) => new Set(previous).add(active.id));
    showToast("Défi marqué comme réalisé. Il reste à réussir le quiz.");
  };

  const submitQuiz = () => {
    if (selectedAnswer === null) return;
    if (selectedAnswer === active.quiz.answer) {
      setQuizFeedback("correct");
      setQuizPassed((previous) => new Set(previous).add(active.id));
      showToast("Bonne réponse · compétence théorique validée");
    } else {
      setQuizFeedback("wrong");
    }
  };

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || thinking) return;

    setMessages((previous) => [
      ...previous,
      { id: Date.now(), role: "student", content: message },
    ]);
    setDraft("");
    setThinking(true);

    window.setTimeout(() => {
      const response = mentorResponse(message, active);
      setMessages((previous) => [
        ...previous,
        { id: Date.now() + 1, role: "mentor", content: response.content },
      ]);
      setThinking(false);
      if (response.validate) markChallenge();
    }, 650);
  };

  const resetProgress = () => {
    setCompleted(new Set());
    setValidatedChallenges(new Set());
    setQuizPassed(new Set());
    setNotes({});
    setSelectedIndex(0);
    showToast("Progression locale réinitialisée.");
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute -left-40 -top-32 size-[520px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 size-[420px] rounded-full bg-violet-600/8 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#08090d]/86 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-20 max-w-[1840px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 lg:hidden"
            aria-label="Ouvrir le programme"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex min-w-fit items-center gap-3">
            <div className="relative grid size-11 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-950/50">
              <WandSparkles className="size-5 text-white" />
              <div className="absolute inset-x-2 bottom-1 h-px bg-white/55" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-indigo-300">Motion School</p>
              <p className="text-lg font-black tracking-tight text-white">AE Academy Pro</p>
            </div>
          </div>

          <div className="mx-auto hidden w-full max-w-2xl items-center gap-4 md:flex">
            <div className="min-w-40 text-right">
              <p className="text-xs font-bold text-zinc-200">
                Intermédiaire · {completed.size}/{FLAT_LESSONS.length}
              </p>
              <p className="text-[10px] text-zinc-500">
                {formatDuration(learnedMinutes)} sur {formatDuration(TOTAL_MINUTES)}
              </p>
            </div>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-white/5 bg-zinc-800/90">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 shadow-[0_0_22px_rgba(99,102,241,.55)] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-10 text-xs font-black text-indigo-300">{progress}%</span>
          </div>

          <div className="ml-auto flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-1.5 pr-3">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-white/10">
              <UserRound className="size-5 text-zinc-200" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-white">Alex Martin</p>
              <p className="flex items-center gap-1 text-[10px] text-amber-300">
                <Flame className="size-3" /> Série de 7 jours
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-3 md:hidden">
          <div className="mb-1.5 flex items-center justify-between text-[10px]">
            <span className="font-semibold text-zinc-400">{completed.size}/{FLAT_LESSONS.length} leçons</span>
            <span className="font-bold text-indigo-300">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <div
        className={`relative mx-auto grid max-w-[1840px] gap-6 px-4 py-6 sm:px-6 lg:px-8 ${
          sidebarCompact ? "lg:grid-cols-[84px_minmax(0,1fr)]" : "lg:grid-cols-[340px_minmax(0,1fr)]"
        }`}
      >
        <aside className="sticky top-[104px] hidden h-[calc(100vh-128px)] overflow-hidden rounded-3xl border border-white/8 bg-zinc-900/55 shadow-2xl shadow-black/30 backdrop-blur-xl lg:flex lg:flex-col">
          <CourseSidebar
            compact={sidebarCompact}
            query={query}
            setQuery={setQuery}
            expandedModules={expandedModules}
            toggleModule={(moduleId) =>
              setExpandedModules((previous) => ({ ...previous, [moduleId]: !previous[moduleId] }))
            }
            selectedIndex={selectedIndex}
            currentIndex={currentIndex}
            completed={completed}
            onSelect={goToLesson}
            onToggleCompact={() => setSidebarCompact((value) => !value)}
            onReset={resetProgress}
          />
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black/75 backdrop-blur-sm" aria-label="Fermer" />
            <aside className="absolute inset-y-0 left-0 flex w-[min(94vw,420px)] flex-col border-r border-white/10 bg-[#0b0c11] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/8 p-4">
                <div>
                  <p className="font-black text-white">Parcours intermédiaire</p>
                  <p className="text-xs text-zinc-500">{formatDuration(TOTAL_MINUTES)} · 10 modules</p>
                </div>
                <button type="button" onClick={() => setSidebarOpen(false)} className="grid size-10 place-items-center rounded-xl bg-white/5 text-zinc-300" aria-label="Fermer">
                  <X className="size-5" />
                </button>
              </div>
              <CourseSidebar
                compact={false}
                query={query}
                setQuery={setQuery}
                expandedModules={expandedModules}
                toggleModule={(moduleId) => setExpandedModules((previous) => ({ ...previous, [moduleId]: !previous[moduleId] }))}
                selectedIndex={selectedIndex}
                currentIndex={currentIndex}
                completed={completed}
                onSelect={goToLesson}
                onToggleCompact={() => undefined}
                onReset={resetProgress}
                mobile
              />
            </aside>
          </div>
        )}

        <div ref={contentRef} className="min-w-0 scroll-mt-28 space-y-6">
          <section className="relative overflow-hidden rounded-[32px] border border-indigo-400/15 bg-gradient-to-br from-indigo-500/11 via-zinc-900/74 to-violet-500/8 p-5 shadow-2xl shadow-indigo-950/18 sm:p-7">
            <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-indigo-500/12 blur-3xl" />
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-indigo-400/20 bg-indigo-500/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-200">
                    Module {INTERMEDIATE_MODULES.findIndex((module) => module.id === active.moduleId) + 1} · {active.moduleTitle}
                  </span>
                  <Badge label={`${active.duration} min`} icon={<Clock3 className="size-3.5" />} />
                  <Badge label={`${active.xp} XP`} icon={<Zap className="size-3.5" />} />
                  <Badge label={active.difficulty} icon={<Gauge className="size-3.5" />} />
                </div>
                <h1 className="text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">{active.title}</h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">{active.summary}</p>
              </div>

              <div className="grid min-w-[280px] grid-cols-2 gap-3">
                <Metric label="Parcours total" value={formatDuration(TOTAL_MINUTES)} icon={<Clock3 className="size-4" />} />
                <Metric label="Niveau visé" value="Junior motion" icon={<GraduationCap className="size-4" />} />
                <Metric label="Projets" value="10 productions" icon={<FolderOpen className="size-4" />} />
                <Metric label="Ressources" value="Adobe officiel" icon={<Library className="size-4" />} />
              </div>
            </div>

            {!activeUnlocked && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-zinc-950/85 backdrop-blur-md">
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-white/5 text-zinc-400"><LockKeyhole className="size-6" /></div>
                  <p className="font-black text-white">Leçon verrouillée</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">Termine les étapes précédentes pour conserver une progression pédagogique cohérente.</p>
                </div>
              </div>
            )}
          </section>

          <nav className="sticky top-[88px] z-30 flex gap-1 overflow-x-auto rounded-2xl border border-white/8 bg-zinc-950/82 p-1.5 shadow-xl backdrop-blur-xl">
            {(
              [
                ["learn", "Cours guidé", BookOpen],
                ["practice", "Atelier & quiz", Target],
                ["resources", "Ressources", Library],
                ["notes", "Mes notes", NotebookPen],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                type="button"
                key={id}
                onClick={() => setTab(id)}
                className={`flex min-w-fit flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black transition ${
                  tab === id ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/40" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                }`}
              >
                <Icon className="size-4" /> {label}
                {id === "practice" && canComplete && <CheckCircle2 className="size-3.5 text-emerald-200" />}
              </button>
            ))}
          </nav>

          {tab === "learn" && (
            <LearnTab lesson={active} moduleOutcome={activeModule.outcome} />
          )}

          {tab === "practice" && (
            <PracticeTab
              lesson={active}
              challengeValidated={validatedChallenges.has(active.id)}
              onMarkChallenge={markChallenge}
              selectedAnswer={selectedAnswer}
              setSelectedAnswer={setSelectedAnswer}
              quizFeedback={quizFeedback}
              submitQuiz={submitQuiz}
            />
          )}

          {tab === "resources" && (
            <ResourcesTab lesson={active} resources={resources} />
          )}

          {tab === "notes" && (
            <NotesTab
              lesson={active}
              value={notes[active.id] ?? ""}
              onChange={(value) => setNotes((previous) => ({ ...previous, [active.id]: value }))}
            />
          )}

          <MentorPanel
            messages={messages}
            draft={draft}
            setDraft={setDraft}
            thinking={thinking}
            onSubmit={submitMessage}
            lesson={active}
          />

          <section className="flex flex-col gap-4 rounded-3xl border border-white/8 bg-zinc-900/55 p-5 shadow-xl sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={selectedIndex === 0}
              onClick={() => goToLesson(selectedIndex - 1)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-bold text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft className="size-4" /> Leçon précédente
            </button>

            <div className="text-center">
              <p className="text-xs font-bold text-zinc-300">
                {canComplete ? "Défi et quiz validés" : "Validation requise avant de continuer"}
              </p>
              <p className="mt-1 text-[10px] text-zinc-600">
                {validatedChallenges.has(active.id) ? "✓ Défi" : "○ Défi"} · {quizPassed.has(active.id) ? "✓ Quiz" : "○ Quiz"}
              </p>
            </div>

            <button
              type="button"
              onClick={completeLesson}
              className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black text-white shadow-xl transition active:scale-[0.98] ${
                canComplete
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-indigo-950/40 hover:-translate-y-0.5"
                  : "bg-zinc-700 text-zinc-300 shadow-black/20 hover:bg-zinc-600"
              }`}
            >
              {completed.has(active.id) ? "Revoir la suite" : "Terminer la leçon"}
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </button>
          </section>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[80] flex max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-400/20 bg-zinc-900/95 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/60 backdrop-blur-xl">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-400" /> {toast}
        </div>
      )}
    </main>
  );
}

function LearnTab({ lesson, moduleOutcome }: { lesson: Lesson; moduleOutcome: string }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/8 bg-zinc-900/58 p-5 shadow-xl sm:p-6">
          <SectionTitle icon={<BrainCircuit className="size-5" />} title="Ce que tu vas réellement maîtriser" subtitle={moduleOutcome} />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {lesson.objectives.map((objective, index) => (
              <div key={objective} className="rounded-2xl border border-white/7 bg-black/12 p-4">
                <span className="mb-3 grid size-8 place-items-center rounded-xl bg-indigo-500/12 text-xs font-black text-indigo-300">0{index + 1}</span>
                <p className="text-xs leading-6 text-zinc-300">{objective}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-violet-400/12 bg-gradient-to-br from-violet-500/10 to-zinc-900/60 p-5 shadow-xl sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-violet-500/12 text-violet-300"><Lightbulb className="size-5" /></div>
            <div>
              <p className="text-sm font-black text-white">Analogie mémorable</p>
              <p className="text-[11px] text-zinc-500">Pour transformer l’abstrait en image mentale</p>
            </div>
          </div>
          <p className="text-base font-semibold leading-8 text-violet-100/90">« {lesson.analogy} »</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/8 bg-zinc-950/45 px-3 py-2">
            <Code2 className="size-4 text-indigo-300" />
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Accès rapide</span>
            <kbd className="rounded-lg border border-white/10 bg-zinc-950 px-2.5 py-1 text-xs font-black text-white">{lesson.shortcut}</kbd>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/8 bg-zinc-900/58 p-5 shadow-xl sm:p-7">
        <SectionTitle icon={<BookOpen className="size-5" />} title="Le concept, sans jargon inutile" subtitle="Comprends la logique avant de mémoriser les boutons" />
        <p className="mt-5 max-w-5xl text-sm leading-8 text-zinc-300 sm:text-[15px]">{lesson.concept}</p>
      </section>

      <section className="rounded-3xl border border-white/8 bg-zinc-900/58 p-5 shadow-xl sm:p-7">
        <SectionTitle icon={<ListChecks className="size-5" />} title="Méthode pas à pas" subtitle="Un ordre de travail reproductible dans tes vrais projets" />
        <div className="relative mt-6 grid gap-4 lg:grid-cols-4">
          <div className="absolute left-8 right-8 top-6 hidden h-px bg-gradient-to-r from-transparent via-indigo-400/25 to-transparent lg:block" />
          {lesson.workflow.map((step, index) => (
            <div key={step.title} className="relative rounded-2xl border border-white/7 bg-zinc-950/38 p-4">
              <span className="relative z-10 mb-4 grid size-11 place-items-center rounded-2xl bg-indigo-500 text-sm font-black text-white shadow-lg shadow-indigo-950/45">{index + 1}</span>
              <h3 className="text-sm font-black text-white">{step.title}</h3>
              <p className="mt-2 text-xs leading-6 text-zinc-500">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <VisualLab lesson={lesson} />

      <section className="rounded-3xl border border-rose-400/10 bg-rose-500/[0.035] p-5 shadow-xl sm:p-6">
        <SectionTitle icon={<CircleHelp className="size-5" />} title="Erreurs fréquentes à diagnostiquer" subtitle="Les connaître évite des heures de correction au hasard" tone="rose" />
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {lesson.mistakes.map((mistake) => (
            <div key={mistake} className="flex items-start gap-3 rounded-2xl border border-rose-300/8 bg-zinc-950/25 p-4">
              <X className="mt-0.5 size-4 shrink-0 text-rose-300" />
              <p className="text-xs leading-6 text-zinc-400">{mistake}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PracticeTab({
  lesson,
  challengeValidated,
  onMarkChallenge,
  selectedAnswer,
  setSelectedAnswer,
  quizFeedback,
  submitQuiz,
}: {
  lesson: Lesson;
  challengeValidated: boolean;
  onMarkChallenge: () => void;
  selectedAnswer: number | null;
  setSelectedAnswer: (answer: number) => void;
  quizFeedback: "correct" | "wrong" | null;
  submitQuiz: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-indigo-400/15 bg-gradient-to-br from-indigo-500/12 via-zinc-900/72 to-violet-500/8 p-5 shadow-2xl sm:p-7">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-indigo-500/12 blur-3xl" />
        <div className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white"><Target className="size-3" /> Défi de production</span>
              <span className="rounded-full border border-amber-300/15 bg-amber-300/8 px-3 py-1 text-[10px] font-black text-amber-200">+{lesson.xp} XP</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{lesson.challenge}</h2>
            <div className="mt-5 rounded-2xl border border-white/8 bg-zinc-950/35 p-4">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.17em] text-zinc-500">Livrable attendu</p>
              <p className="text-sm leading-7 text-zinc-300">{lesson.deliverable}</p>
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300/12 bg-amber-300/[0.045] p-4">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-300" />
              <p className="text-xs leading-6 text-amber-100/75"><strong className="text-amber-200">Indice du mentor :</strong> {lesson.mentorHint}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/9 bg-zinc-950/50 p-5">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Grille d’auto-évaluation</p>
            <div className="space-y-3">
              {lesson.rubric.map((criterion, index) => (
                <div key={criterion} className="flex items-center gap-3 rounded-2xl border border-white/7 bg-white/[0.025] p-3">
                  <span className={`grid size-8 place-items-center rounded-xl ${challengeValidated ? "bg-emerald-400/12 text-emerald-300" : "bg-white/5 text-zinc-600"}`}>
                    {challengeValidated ? <Check className="size-4" /> : <span className="text-[10px] font-black">{index + 1}</span>}
                  </span>
                  <p className="text-xs font-semibold text-zinc-300">{criterion}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onMarkChallenge}
              className={`mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black transition ${
                challengeValidated ? "bg-emerald-400/12 text-emerald-300" : "bg-indigo-500 text-white hover:bg-indigo-400"
              }`}
            >
              {challengeValidated ? <><CheckCircle2 className="size-4" /> Défi validé</> : <><BadgeCheck className="size-4" /> Marquer comme réalisé</>}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/8 bg-zinc-900/58 p-5 shadow-xl sm:p-7">
        <SectionTitle icon={<BrainCircuit className="size-5" />} title="Question de compréhension" subtitle="Une vérification courte pour t’assurer que la logique est acquise" />
        <p className="mt-6 text-base font-bold leading-7 text-white">{lesson.quiz.question}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {lesson.quiz.options.map((option, index) => {
            const selected = selectedAnswer === index;
            const correct = quizFeedback === "correct" && index === lesson.quiz.answer;
            const wrong = quizFeedback === "wrong" && selected;
            return (
              <button
                type="button"
                key={option}
                onClick={() => {
                  setSelectedAnswer(index);
                }}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-xs font-semibold leading-5 transition ${
                  correct
                    ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-100"
                    : wrong
                      ? "border-rose-400/30 bg-rose-400/8 text-rose-100"
                      : selected
                        ? "border-indigo-400/35 bg-indigo-500/10 text-indigo-100"
                        : "border-white/8 bg-zinc-950/25 text-zinc-400 hover:bg-white/5"
                }`}
              >
                <span className={`grid size-7 shrink-0 place-items-center rounded-full border ${selected ? "border-indigo-300 bg-indigo-500 text-white" : "border-white/12 text-zinc-600"}`}>{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-12 flex-1">
            {quizFeedback && (
              <div className={`rounded-2xl border px-4 py-3 text-xs leading-6 ${quizFeedback === "correct" ? "border-emerald-400/15 bg-emerald-400/[0.045] text-emerald-200/80" : "border-rose-400/15 bg-rose-400/[0.045] text-rose-200/80"}`}>
                {quizFeedback === "correct" ? lesson.quiz.explanation : "Ce n’est pas la meilleure réponse. Relis le concept, puis cherche quelle option décrit directement la fonction étudiée."}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={selectedAnswer === null}
            onClick={submitQuiz}
            className="min-h-12 rounded-2xl bg-white px-5 text-sm font-black text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Vérifier la réponse
          </button>
        </div>
      </section>
    </div>
  );
}

function ResourcesTab({ lesson, resources }: { lesson: Lesson; resources: ReturnType<typeof getResources> }) {
  const cheatSheet = [
    `Concept : ${lesson.summary}`,
    `Raccourci : ${lesson.shortcut}`,
    `Méthode : ${lesson.workflow.map((step) => step.title).join(" → ")}`,
    `À éviter : ${lesson.mistakes[0]}`,
    `Livrable : ${lesson.deliverable}`,
  ].join("\n");

  const copyCheatSheet = async () => {
    await navigator.clipboard.writeText(cheatSheet);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/8 bg-zinc-900/58 p-5 shadow-xl sm:p-7">
        <SectionTitle icon={<Library className="size-5" />} title="Documentation vérifiée" subtitle="Des ressources officielles pour approfondir sans dépendre de tutoriels obsolètes" />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {resources.map((resource) => (
            <a
              key={resource.id}
              href={resource.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-white/8 bg-zinc-950/28 p-5 transition hover:-translate-y-0.5 hover:border-indigo-400/25 hover:bg-indigo-500/[0.045]"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <span className="rounded-full border border-indigo-400/15 bg-indigo-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-indigo-300">{resource.label}</span>
                <ExternalLink className="size-4 text-zinc-600 transition group-hover:text-indigo-300" />
              </div>
              <h3 className="text-sm font-black text-white">{resource.title}</h3>
              <p className="mt-2 text-xs leading-6 text-zinc-500">{resource.description}</p>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-zinc-600">{resource.kind}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-white/8 bg-zinc-900/58 p-5 shadow-xl sm:p-6">
          <SectionTitle icon={<FileText className="size-5" />} title="Fiche mémo de la leçon" subtitle="À conserver à côté de la timeline pendant l’exercice" />
          <div className="mt-5 space-y-3">
            {cheatSheet.split("\n").map((line) => (
              <div key={line} className="rounded-2xl border border-white/7 bg-zinc-950/30 px-4 py-3 text-xs leading-6 text-zinc-400">{line}</div>
            ))}
          </div>
          <button type="button" onClick={copyCheatSheet} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/7 px-4 text-xs font-black text-zinc-200 transition hover:bg-white/12">
            <Copy className="size-4" /> Copier la fiche mémo
          </button>
        </div>

        <div className="rounded-3xl border border-emerald-400/12 bg-emerald-400/[0.035] p-5 shadow-xl sm:p-6">
          <SectionTitle icon={<TimerReset className="size-5" />} title="Session d’entraînement recommandée" subtitle={`${lesson.duration} minutes au total`} tone="emerald" />
          <div className="mt-5 space-y-4">
            {[
              ["Comprendre", Math.max(8, Math.round(lesson.duration * 0.2))],
              ["Reproduire", Math.round(lesson.duration * 0.35)],
              ["Créer une variante", Math.round(lesson.duration * 0.3)],
              ["Critiquer et corriger", Math.max(5, Math.round(lesson.duration * 0.15))],
            ].map(([label, minutes], index) => (
              <div key={String(label)} className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-400/10 text-xs font-black text-emerald-300">{index + 1}</span>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-xs"><span className="font-semibold text-zinc-300">{label}</span><span className="text-zinc-600">{minutes} min</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${Number(minutes) / lesson.duration * 100}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function NotesTab({ lesson, value, onChange }: { lesson: Lesson; value: string; onChange: (value: string) => void }) {
  return (
    <section className="rounded-3xl border border-white/8 bg-zinc-900/58 p-5 shadow-xl sm:p-7">
      <SectionTitle icon={<NotebookPen className="size-5" />} title="Carnet personnel" subtitle="Tes notes restent enregistrées localement dans ce navigateur" />
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.38fr]">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`Exemple :\n— Ce que j’ai compris sur « ${lesson.title} »\n— Valeur ou réglage qui a bien fonctionné\n— Erreur que je veux éviter au prochain projet\n— Idée de variante personnelle`}
          className="min-h-[380px] resize-y rounded-3xl border border-white/10 bg-zinc-950/60 p-5 text-sm leading-7 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-indigo-400/35 focus:ring-4 focus:ring-indigo-500/8"
        />
        <div className="space-y-3">
          {["Explique le concept en une phrase.", "Note une valeur ou un réglage utile.", "Décris un défaut observé et sa correction.", "Imagine une application dans un projet réel."].map((prompt, index) => (
            <button
              type="button"
              key={prompt}
              onClick={() => onChange(`${value}${value ? "\n\n" : ""}${index + 1}. ${prompt}\n`)}
              className="w-full rounded-2xl border border-white/8 bg-zinc-950/25 p-4 text-left text-xs leading-6 text-zinc-500 transition hover:border-indigo-400/20 hover:bg-indigo-500/[0.045] hover:text-zinc-300"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function MentorPanel({
  messages,
  draft,
  setDraft,
  thinking,
  onSubmit,
  lesson,
}: {
  messages: ChatMessage[];
  draft: string;
  setDraft: (value: string) => void;
  thinking: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  lesson: Lesson;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/8 bg-zinc-900/58 shadow-2xl shadow-black/25">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/35">
            <Bot className="size-5" />
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-zinc-900 bg-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Nova · Mentor pédagogique</p>
            <p className="text-[11px] text-emerald-300/75">Connaît la leçon, le défi et les erreurs fréquentes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-[10px] text-zinc-500">
          <MessageCircleMore className="size-3.5 text-indigo-300" /> Écris « indice », « explique » ou « c’est fait »
        </div>
      </div>

      <div className="custom-scrollbar h-64 space-y-4 overflow-y-auto p-5 sm:p-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-end gap-3 ${message.role === "mentor" ? "justify-start" : "justify-end"}`}>
            {message.role === "mentor" && <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300"><Bot className="size-4" /></div>}
            <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "mentor" ? "rounded-bl-md border border-white/8 bg-white/5 text-zinc-300" : "rounded-br-md bg-indigo-500 text-white shadow-lg shadow-indigo-950/25"}`}>{message.content}</div>
            {message.role === "student" && <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/5 text-zinc-400"><UserRound className="size-4" /></div>}
          </div>
        ))}
        {thinking && (
          <div className="flex items-end gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300"><Bot className="size-4" /></div>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/8 bg-white/5 px-4 py-3">
              {[0, 1, 2].map((dot) => <span key={dot} className="size-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: `${dot * 120}ms` }} />)}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t border-white/8 bg-zinc-950/35 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {["Donne-moi un indice", "Explique autrement", "Comment diagnostiquer ?", "C’est fait"].map((suggestion) => (
            <button type="button" key={suggestion} onClick={() => setDraft(suggestion)} className="rounded-full border border-white/8 bg-white/[0.025] px-3 py-1.5 text-[10px] font-semibold text-zinc-500 transition hover:bg-white/7 hover:text-zinc-300">{suggestion}</button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative min-w-0 flex-1">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Pose une question sur « ${lesson.title} »…`}
              className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-950/75 px-4 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-indigo-400/45 focus:ring-4 focus:ring-indigo-500/10"
            />
            <Sparkles className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-indigo-400" />
          </div>
          <button type="submit" disabled={!draft.trim() || thinking} className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-950/45 transition hover:bg-indigo-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Envoyer">
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </section>
  );
}

function CourseSidebar({
  compact,
  query,
  setQuery,
  expandedModules,
  toggleModule,
  selectedIndex,
  currentIndex,
  completed,
  onSelect,
  onToggleCompact,
  onReset,
  mobile = false,
}: {
  compact: boolean;
  query: string;
  setQuery: (value: string) => void;
  expandedModules: Record<string, boolean>;
  toggleModule: (moduleId: string) => void;
  selectedIndex: number;
  currentIndex: number;
  completed: Set<string>;
  onSelect: (index: number) => void;
  onToggleCompact: () => void;
  onReset: () => void;
  mobile?: boolean;
}) {
  const normalizedQuery = query.toLocaleLowerCase("fr").trim();
  let cursor = 0;

  if (compact && !mobile) {
    return (
      <div className="flex h-full flex-col items-center gap-3 py-4">
        <button type="button" onClick={onToggleCompact} className="grid size-11 place-items-center rounded-2xl bg-white/5 text-zinc-400 transition hover:bg-white/10" aria-label="Agrandir le menu"><ChevronRight className="size-5" /></button>
        <div className="my-1 h-px w-10 bg-white/8" />
        {INTERMEDIATE_MODULES.map((module, moduleIndex) => {
          const start = INTERMEDIATE_MODULES.slice(0, moduleIndex).reduce((sum, item) => sum + item.lessons.length, 0);
          const active = selectedIndex >= start && selectedIndex < start + module.lessons.length;
          const complete = module.lessons.every((item) => completed.has(item.id));
          return (
            <button type="button" key={module.id} onClick={() => onSelect(Math.min(start, currentIndex))} title={module.title} className={`relative grid size-11 place-items-center rounded-2xl text-xs font-black transition ${active ? "bg-indigo-500 text-white" : complete ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-zinc-500 hover:bg-white/10"}`}>
              {complete ? <Check className="size-4" /> : moduleIndex + 1}
              {active && <span className="absolute -right-1 size-2 rounded-full bg-indigo-300 shadow-[0_0_8px_rgba(165,180,252,.8)]" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-white/8 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-white">Parcours intermédiaire</p>
            <p className="mt-0.5 text-[11px] text-zinc-500">10 modules · {formatDuration(TOTAL_MINUTES)}</p>
          </div>
          {!mobile && <button type="button" onClick={onToggleCompact} className="grid size-9 place-items-center rounded-xl bg-white/5 text-zinc-500 transition hover:bg-white/10" aria-label="Réduire le menu"><PanelLeftClose className="size-4" /></button>}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une leçon…" className="h-10 w-full rounded-xl border border-white/8 bg-zinc-950/55 pl-9 pr-3 text-xs text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-indigo-400/30" />
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
        {INTERMEDIATE_MODULES.map((module, moduleIndex) => {
          const moduleStart = cursor;
          cursor += module.lessons.length;
          const filteredLessons = module.lessons
            .map((lessonItem, localIndex) => ({ lesson: lessonItem, globalIndex: moduleStart + localIndex }))
            .filter(({ lesson: lessonItem }) => !normalizedQuery || `${lessonItem.title} ${module.title}`.toLocaleLowerCase("fr").includes(normalizedQuery));
          if (normalizedQuery && filteredLessons.length === 0) return null;
          const completedCount = module.lessons.filter((item) => completed.has(item.id)).length;
          const activeModule = selectedIndex >= moduleStart && selectedIndex < moduleStart + module.lessons.length;
          const isOpen = normalizedQuery ? true : expandedModules[module.id];

          return (
            <div key={module.id} className="mb-2">
              <button type="button" onClick={() => toggleModule(module.id)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/5">
                <div className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-black ${activeModule ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/35" : completedCount === module.lessons.length ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-zinc-500"}`}>
                  {completedCount === module.lessons.length ? <Check className="size-4" /> : String(moduleIndex + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-zinc-200">{module.title}</p>
                  <p className="truncate text-[10px] text-zinc-600">{module.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-zinc-600">{completedCount}/{module.lessons.length}</span>
                  {isOpen ? <ChevronDown className="size-4 text-zinc-600" /> : <ChevronRight className="size-4 text-zinc-600" />}
                </div>
              </button>

              {isOpen && (
                <div className="relative ml-[29px] border-l border-white/8 py-1 pl-5">
                  {filteredLessons.map(({ lesson: lessonItem, globalIndex }) => {
                    const isCompleted = completed.has(lessonItem.id);
                    const isCurrent = globalIndex === currentIndex;
                    const isLocked = globalIndex > currentIndex && !isCompleted;
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <button
                        type="button"
                        key={lessonItem.id}
                        disabled={isLocked}
                        onClick={() => onSelect(globalIndex)}
                        className={`group relative mb-1 flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${isSelected ? "border-indigo-400/20 bg-indigo-500/10" : "border-transparent hover:bg-white/[0.035]"} ${isLocked ? "cursor-not-allowed opacity-42" : "cursor-pointer"}`}
                      >
                        <span className={`absolute -left-[27px] top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-zinc-900 ${isCompleted ? "bg-emerald-400" : isCurrent ? "bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,.8)]" : "bg-zinc-700"}`} />
                        <div className={`grid size-8 shrink-0 place-items-center rounded-xl ${isCompleted ? "bg-emerald-400/10 text-emerald-300" : isCurrent ? "bg-indigo-500 text-white" : "bg-white/5 text-zinc-600"}`}>
                          {isCompleted ? <Check className="size-4" /> : isCurrent ? <Play className="ml-0.5 size-3.5 fill-current" /> : <LockKeyhole className="size-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-[11px] font-bold ${isSelected ? "text-white" : "text-zinc-400"}`}>{lessonItem.title}</p>
                          <p className="mt-0.5 text-[9px] text-zinc-600">{lessonItem.duration} min · {lessonItem.difficulty}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/8 p-4">
        <div className="mb-3 rounded-2xl border border-violet-400/12 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 p-4">
          <div className="mb-2 flex items-center gap-2"><Trophy className="size-4 text-amber-300" /><p className="text-xs font-black text-white">Niveau de sortie</p></div>
          <p className="text-[10px] leading-5 text-zinc-500">Intermédiaire solide : projets autonomes, templates, tracking, compositing et première pièce de portfolio.</p>
        </div>
        <button type="button" onClick={onReset} className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[10px] font-semibold text-zinc-700 transition hover:bg-white/5 hover:text-zinc-500"><RotateCcw className="size-3.5" /> Réinitialiser la progression locale</button>
      </div>
    </>
  );
}

function Badge({ label, icon }: { label: string; icon: ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.035] px-3 py-1 text-[10px] font-bold text-zinc-400">{icon}{label}</span>;
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-950/32 p-3.5">
      <div className="mb-2 flex items-center gap-2 text-indigo-300">{icon}<span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">{label}</span></div>
      <p className="text-xs font-black text-white">{value}</p>
    </div>
  );
}

function SectionTitle({ icon, title, subtitle, tone = "indigo" }: { icon: ReactNode; title: string; subtitle: string; tone?: "indigo" | "rose" | "emerald" }) {
  const toneClasses = tone === "rose" ? "bg-rose-400/10 text-rose-300" : tone === "emerald" ? "bg-emerald-400/10 text-emerald-300" : "bg-indigo-500/12 text-indigo-300";
  return (
    <div className="flex items-start gap-3">
      <div className={`grid size-10 shrink-0 place-items-center rounded-2xl ${toneClasses}`}>{icon}</div>
      <div>
        <h2 className="text-base font-black text-white">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{subtitle}</p>
      </div>
    </div>
  );
}

function mentorResponse(message: string, lesson: Lesson) {
  const normalized = message
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .trim();

  if (["cest fait", "jai fini", "termine", "valide", "fini"].some((key) => normalized.includes(key))) {
    return {
      validate: true,
      content: `Défi enregistré. Avant de continuer, vérifie les critères suivants : ${lesson.rubric.join(", ")}. Le quiz permettra ensuite de valider la compréhension théorique.`,
    };
  }
  if (normalized.includes("indice") || normalized.includes("aide")) {
    return { validate: false, content: `Premier indice : ${lesson.mentorHint} Si tu bloques encore, décris précisément ce que tu vois à l’écran au lieu de dire seulement que cela ne marche pas.` };
  }
  if (normalized.includes("explique") || normalized.includes("autrement")) {
    return { validate: false, content: `${lesson.analogy} Concrètement dans After Effects : ${lesson.workflow[0].detail} Puis avance étape par étape sans modifier plusieurs paramètres simultanément.` };
  }
  if (normalized.includes("diagnosti") || normalized.includes("probleme") || normalized.includes("faux")) {
    return { validate: false, content: `Diagnostic en trois passes : 1) désactive les effets de finition, 2) observe uniquement le mouvement ou la matte de base, 3) vérifie d’abord cette erreur fréquente : ${lesson.mistakes[0]}` };
  }
  if (normalized.includes("raccourci")) {
    return { validate: false, content: `Le raccourci associé à cette leçon est « ${lesson.shortcut} ». Mémorise-le en l’utilisant trois fois pendant l’exercice plutôt qu’en le récitant.` };
  }
  return { validate: false, content: `Pour « ${lesson.title} », commence par formuler ton intention, puis suis cette première étape : ${lesson.workflow[0].detail} Dis-moi ensuite si le problème concerne le timing, la géométrie, le détourage, la lumière ou le rendu.` };
}
