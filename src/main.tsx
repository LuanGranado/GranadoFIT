import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Dumbbell,
  Flame,
  HeartPulse,
  LogOut,
  Menu,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Target,
  Timer,
  TrendingDown,
  UserRound,
  Utensils,
  Weight,
  X,
} from "lucide-react";
import {
  bmi,
  bmiLabel,
  createBlankData,
  createInitialData,
  days,
  formatTime,
  normalizeWeek,
  type AppData,
  weekDayIndex,
} from "./model";
import "./style.css";

const ProgressChart = React.lazy(() => import("./ProgressChart"));

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  string | undefined;
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
type Page =
  "overview" | "workouts" | "nutrition" | "cardio" | "progress" | "profile";
type Editor = {
  kind: "exercise" | "meal" | "workout";
  day: number;
  id?: string;
};
const nav = [
  { id: "overview", label: "Visão geral", icon: Activity },
  { id: "workouts", label: "Meus treinos", icon: Dumbbell },
  { id: "nutrition", label: "Alimentação", icon: Utensils },
  { id: "cardio", label: "Cardio & tempo", icon: Timer },
  { id: "progress", label: "Minha evolução", icon: TrendingDown },
  { id: "profile", label: "Meu perfil", icon: UserRound },
] as const;
const today = weekDayIndex();
const localKey = "granadofit-demo-v1";
const safeRead = (): AppData => {
  try {
    const raw = localStorage.getItem(localKey);
    return raw
      ? normalizeWeek(JSON.parse(raw) as AppData)
      : createInitialData();
  } catch {
    return createInitialData();
  }
};

function App() {
  const [mode, setMode] = useState<"guest" | "demo" | "auth">("guest");
  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<AppData>(() => safeRead());
  const [page, setPage] = useState<Page>("overview");
  const [selectedDay, setSelectedDay] = useState(today);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [toast, setToast] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [loading, setLoading] = useState(!!supabase);
  const [cardioElapsed, setCardioElapsed] = useState(0);
  const [cardioStartedAt, setCardioStartedAt] = useState<number | null>(null);
  const [clockNow, setClockNow] = useState(Date.now());
  const ready = useRef(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    if (cardioStartedAt === null) return;
    const id = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [cardioStartedAt]);
  useEffect(() => {
    const id = window.setInterval(
      () => setData((current) => normalizeWeek(current)),
      60000,
    );
    return () => window.clearInterval(id);
  }, []);
  const cardioSeconds =
    cardioElapsed +
    (cardioStartedAt === null
      ? 0
      : Math.floor((clockNow - cardioStartedAt) / 1000));
  function toggleCardio() {
    if (cardioStartedAt === null) {
      const now = Date.now();
      setClockNow(now);
      setCardioStartedAt(now);
    } else {
      setCardioElapsed(cardioSeconds);
      setCardioStartedAt(null);
    }
  }
  function resetCardio() {
    setCardioElapsed(0);
    setCardioStartedAt(null);
  }
  function saveCardio() {
    const seconds =
      cardioElapsed +
      (cardioStartedAt === null
        ? 0
        : Math.floor((Date.now() - cardioStartedAt) / 1000));
    if (seconds < 1) return;
    update((d) => {
      d.cardio.unshift({ date: new Date().toISOString(), seconds });
      return d;
    });
    resetCardio();
    showToast("Sessão de cardio salva!");
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const client = supabase;
    let live = true;
    client.auth
      .getUser()
      .then(async ({ data: auth }) => {
        if (live && auth.user)
          await loadUser(
            auth.user.id,
            auth.user.user_metadata?.name as string | undefined,
          );
      })
      .catch(() => {
        if (live)
          setAuthNotice(
            "Não foi possível carregar a conta. Verifique a configuração do Supabase e tente entrar novamente.",
          );
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    const { data: listener } = client.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          ready.current = false;
          setUserId(null);
          setMode("guest");
        }
        if (event === "SIGNED_IN" && session?.user && !ready.current)
          window.setTimeout(() => {
            void loadUser(
              session.user.id,
              session.user.user_metadata?.name as string | undefined,
            ).catch(() =>
              setAuthNotice(
                "Não foi possível carregar a conta. Verifique a configuração do Supabase.",
              ),
            );
          }, 0);
      },
    );
    return () => {
      live = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loadUser(id: string, name?: string) {
    if (!supabase) return;
    const { data: row, error } = await supabase
      .from("app_state")
      .select("data")
      .eq("user_id", id)
      .maybeSingle();
    if (error)
      throw new Error(
        "Não foi possível carregar seus dados. Confira se o schema foi aplicado no Supabase.",
      );
    const newAccount = !row?.data || !Object.keys(row.data).length;
    const next = newAccount
      ? createBlankData(name || "Atleta")
      : normalizeWeek(row.data as AppData);
    setData(next);
    setUserId(id);
    setMode("auth");
    setAuthNotice("");
    if (newAccount) setPage("profile");
    ready.current = true;
  }

  useEffect(() => {
    if (mode === "demo") localStorage.setItem(localKey, JSON.stringify(data));
    if (mode === "auth" && userId && supabase && ready.current) {
      const client = supabase;
      const snapshot = data;
      const id = userId;
      saveQueue.current = saveQueue.current
        .catch(() => {})
        .then(async () => {
          const { error } = await client.from("app_state").upsert(
            {
              user_id: id,
              data: snapshot,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );
          if (error) throw error;
        });
      void saveQueue.current.catch(() =>
        showToast("Não foi possível salvar. Tente novamente."),
      );
    }
  }, [data, mode, userId]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 4200);
  }
  function update(fn: (current: AppData) => AppData) {
    setData((current) => fn(structuredClone(current)));
  }
  function navigate(next: Page) {
    setPage(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function enterDemo() {
    setData(safeRead());
    setMode("demo");
    setPage("overview");
  }
  async function signOut() {
    if (mode === "auth" && supabase && userId) {
      await saveQueue.current.catch(() => {});
      const { error } = await supabase
        .from("app_state")
        .upsert(
          { user_id: userId, data, updated_at: new Date().toISOString() },
          { onConflict: "user_id" },
        );
      if (error) {
        showToast("Não foi possível salvar. Tente novamente antes de sair.");
        return;
      }
      await supabase.auth.signOut();
    }
    setMode("guest");
    setUserId(null);
    ready.current = false;
    setPage("overview");
  }

  if (loading)
    return (
      <div className="loading-screen">
        <div className="brand-mark">
          G<span>.</span>
        </div>
        <p>Preparando seu espaço...</p>
      </div>
    );
  if (mode === "guest")
    return (
      <Landing
        onDemo={enterDemo}
        notice={authNotice}
        onAuth={async (email, password, name, register) => {
          if (!supabase)
            throw new Error(
              "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar as contas.",
            );
          if (register) {
            const { data: result, error } = await supabase.auth.signUp({
              email,
              password,
              options: { data: { name } },
            });
            if (error) throw error;
            if (!result.session)
              return "Conta criada. Confirme o e-mail para entrar.";
            await loadUser(result.user!.id, name);
          } else {
            const { data: result, error } =
              await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            await loadUser(
              result.user.id,
              result.user.user_metadata?.name as string | undefined,
            );
          }
          return "";
        }}
        hasSupabase={!!supabase}
      />
    );

  const currentWorkout = data.workouts[selectedDay];
  const currentMeals = data.meals[selectedDay];
  const totalExercises = data.workouts.reduce(
    (sum, workout) => sum + workout.exercises.length,
    0,
  );
  const doneExercises = data.workouts.reduce(
    (sum, workout) =>
      sum + workout.exercises.filter((item) => item.done).length,
    0,
  );
  const currentBmi = bmi(data.profile.weight, data.profile.height);
  const completedToday = data.workouts[today].exercises.filter(
    (item) => item.done,
  ).length;
  const displayName = data.profile.name.trim().split(" ")[0] || "Atleta";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="side-top">
          <button className="brand" onClick={() => navigate("overview")}>
            <span className="brand-mark">
              G<span>.</span>
            </span>
            <span className="brand-word">
              Granado<span>Fit</span>
            </span>
          </button>
          <button
            className="mobile-close icon-button"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-label">SEU ESPAÇO</div>
        <nav className="nav-list" aria-label="Navegação principal">
          {nav.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <item.icon size={19} strokeWidth={1.8} />
              <span>{item.label}</span>
              {page === item.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="side-goal">
            <div className="side-goal-icon">
              <Target size={20} />
            </div>
            <strong>Seu ritmo. Sua evolução.</strong>
            <p>Um passo de cada vez leva você mais longe.</p>
            <button onClick={() => navigate("progress")}>
              Ver evolução <ArrowRight size={15} />
            </button>
          </div>
          <button
            className="side-help"
            onClick={() =>
              showToast(
                "GranadoFit: seu espaço de treino pessoal. Edite seus planos e acompanhe seu progresso.",
              )
            }
          >
            <CircleHelp size={18} /> Ajuda <ArrowRight size={15} />
          </button>
        </div>
      </aside>
      {menuOpen && (
        <button
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Fechar menu"
        />
      )}
      <div className="main-wrap">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <span className="breadcrumb">Pessoal</span>
            <ChevronRight size={14} />
            <strong>{nav.find((item) => item.id === page)?.label}</strong>
          </div>
          <div className="topbar-actions">
            <span className="today-date">
              <CalendarDays size={16} />
              {new Intl.DateTimeFormat("pt-BR", {
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </span>
            <span className="top-separator" />
            <button
              className="icon-button bell"
              aria-label="Notificações"
              onClick={() =>
                showToast("Você está em dia. Continue no seu ritmo!")
              }
            >
              <Bell size={19} />
              <span />
            </button>
            <button
              className="avatar-button"
              onClick={() => navigate("profile")}
              aria-label="Abrir perfil"
            >
              {displayName.slice(0, 1).toUpperCase()}
            </button>
          </div>
        </header>
        <main className="content">
          {mode === "demo" && (
            <div className="demo-banner">
              <span>
                Modo demonstração: seus dados ficam salvos somente neste
                navegador.
              </span>
              <button onClick={signOut}>
                Sair da demonstração <ArrowRight size={14} />
              </button>
            </div>
          )}
          {page === "overview" && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">SEU PAINEL DE CONTROLE</span>
                  <h1>
                    Bom dia, {displayName}
                    <span className="headline-dot">.</span>
                  </h1>
                  <p>O progresso acontece um dia de cada vez. Vamos nessa?</p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => navigate("workouts")}
                >
                  <Dumbbell size={17} /> Ver meu treino <ArrowRight size={16} />
                </button>
              </div>
              <section className="hero-card">
                <div className="hero-orb hero-orb-one" />
                <div className="hero-orb hero-orb-two" />
                <div className="hero-content">
                  <div className="hero-label">
                    <span className="hero-label-dot" /> SEU FOCO DE HOJE
                  </div>
                  <h2>{data.workouts[today].title}</h2>
                  <p>
                    {data.workouts[today].focus} <span>·</span>{" "}
                    {data.workouts[today].duration
                      ? `${data.workouts[today].duration} min estimados`
                      : "Dia de recuperar"}
                  </p>
                  <div className="hero-footer">
                    <button
                      onClick={() => {
                        setSelectedDay(today);
                        navigate("workouts");
                      }}
                    >
                      Abrir treino de hoje <ArrowRight size={17} />
                    </button>
                    <span>
                      {completedToday}/{data.workouts[today].exercises.length}{" "}
                      exercícios feitos
                    </span>
                  </div>
                </div>
                <div className="hero-graphic">
                  <div className="graphic-ring ring-outer" />
                  <div className="graphic-ring ring-inner" />
                  <div className="graphic-core">
                    <Dumbbell size={54} strokeWidth={1.15} />
                  </div>
                </div>
              </section>
              <div className="section-title">
                <div>
                  <h2>Seu panorama</h2>
                  <p>O que você já conquistou nesta semana</p>
                </div>
                <span>SEMANA ATUAL</span>
              </div>
              <div className="stats-grid">
                <StatCard
                  icon={Dumbbell}
                  label="Treino concluído"
                  value={`${doneExercises}/${totalExercises}`}
                  suffix="exercícios"
                  tone="violet"
                  detail="da sua ficha semanal"
                />
                <StatCard
                  icon={Flame}
                  label="Refeições registradas"
                  value={`${data.meals[today].filter((item) => item.done).length}/${data.meals[today].length}`}
                  suffix="hoje"
                  tone="orange"
                  detail="consistência diária"
                />
                <StatCard
                  icon={HeartPulse}
                  label="Seu IMC"
                  value={currentBmi?.toFixed(1) || "—"}
                  suffix="kg/m²"
                  tone="pink"
                  detail={bmiLabel(currentBmi)}
                />
                <StatCard
                  icon={Timer}
                  label="Cardio acumulado"
                  value={`${Math.round(data.cardio.reduce((sum, item) => sum + item.seconds, 0) / 60)}`}
                  suffix="min"
                  tone="blue"
                  detail="tempo total registrado"
                />
              </div>
              <div className="overview-grid">
                <section className="glass-card overview-workout">
                  <div className="card-header">
                    <div>
                      <span className="mini-eyebrow">PLANEJAMENTO</span>
                      <h3>Sua semana de treinos</h3>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate("workouts")}
                    >
                      Ver ficha <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="week-list">
                    {data.workouts.map((workout, index) => (
                      <button
                        key={days[index]}
                        className={`week-row ${index === today ? "is-today" : ""}`}
                        onClick={() => {
                          setSelectedDay(index);
                          navigate("workouts");
                        }}
                      >
                        <span className="week-day">
                          {days[index].slice(0, 3).toUpperCase()}
                        </span>
                        <span className="week-row-main">
                          <strong>{workout.title}</strong>
                          <small>{workout.focus}</small>
                        </span>
                        <span className="week-row-end">
                          {index === today ? (
                            <span className="today-pill">HOJE</span>
                          ) : workout.duration ? (
                            `${workout.duration} min`
                          ) : (
                            "—"
                          )}
                          <ChevronRight size={16} />
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="glass-card nutrition-preview">
                  <div className="card-header">
                    <div>
                      <span className="mini-eyebrow">NUTRIÇÃO</span>
                      <h3>Refeições de hoje</h3>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => {
                        setSelectedDay(today);
                        navigate("nutrition");
                      }}
                    >
                      Ver dieta <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="meal-preview-list">
                    {data.meals[today].map((item, index) => (
                      <div className="meal-preview" key={item.id}>
                        <div className={`meal-icon meal-${index % 4}`}>
                          <Utensils size={17} />
                        </div>
                        <div>
                          <strong>{item.name}</strong>
                          <small>
                            {item.time} · {item.detail}
                          </small>
                        </div>
                        <span>{item.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                  <div className="nutrition-foot">
                    <div>
                      <span>Planejamento diário</span>
                      <strong>
                        {data.meals[today]
                          .reduce((sum, item) => sum + item.calories, 0)
                          .toLocaleString("pt-BR")}{" "}
                        kcal
                      </strong>
                    </div>
                    <div className="mini-progress">
                      <span
                        style={{
                          width: `${data.meals[today].length ? (data.meals[today].filter((item) => item.done).length / data.meals[today].length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
          {page === "workouts" && (
            <>
              <PageTitle
                eyebrow="SEU PLANO"
                title="Meus treinos"
                description="Sua ficha de treino para cada dia da semana. Ajuste ao seu ritmo."
              />
              <DayTabs selected={selectedDay} onSelect={setSelectedDay} />
              <div className="detail-grid">
                <section className="glass-card detail-main">
                  <div className="detail-heading">
                    <div className="detail-icon purple">
                      <Dumbbell size={24} />
                    </div>
                    <div>
                      <span className="mini-eyebrow">
                        {days[selectedDay].toUpperCase()} ·{" "}
                        {currentWorkout.focus.toUpperCase()}
                      </span>
                      <h2>{currentWorkout.title}</h2>
                      <p>
                        {currentWorkout.exercises.length} exercícios ·{" "}
                        {currentWorkout.duration} min estimados
                      </p>
                    </div>
                  </div>
                  <div className="exercise-list">
                    {currentWorkout.exercises.length ? (
                      currentWorkout.exercises.map((item, index) => (
                        <div
                          className={`exercise-item ${item.done ? "done" : ""}`}
                          key={item.id}
                        >
                          <button
                            className="check-button"
                            onClick={() =>
                              update((d) => {
                                const target = d.workouts[
                                  selectedDay
                                ].exercises.find(
                                  (exercise) => exercise.id === item.id,
                                )!;
                                target.done = !target.done;
                                return d;
                              })
                            }
                            aria-label={`${item.done ? "Desmarcar" : "Concluir"} ${item.name}`}
                          >
                            {item.done && <Check size={16} />}
                          </button>
                          <span className="exercise-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="exercise-main">
                            <strong>{item.name}</strong>
                            <span>
                              {item.sets} séries · {item.reps} repetições ·
                              descanso {item.rest}
                            </span>
                          </div>
                          <button
                            className="icon-button muted"
                            aria-label={`Editar ${item.name}`}
                            onClick={() =>
                              setEditor({
                                kind: "exercise",
                                day: selectedDay,
                                id: item.id,
                              })
                            }
                          >
                            <Settings2 size={17} />
                          </button>
                          <button
                            className="icon-button muted"
                            aria-label={`Excluir ${item.name}`}
                            onClick={() =>
                              update((d) => {
                                d.workouts[selectedDay].exercises = d.workouts[
                                  selectedDay
                                ].exercises.filter(
                                  (exercise) => exercise.id !== item.id,
                                );
                                return d;
                              })
                            }
                          >
                            <X size={17} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <Dumbbell size={27} />
                        <strong>Dia livre</strong>
                        <p>
                          Use este espaço para descansar ou adicione um
                          exercício.
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    className="add-button"
                    onClick={() =>
                      setEditor({ kind: "exercise", day: selectedDay })
                    }
                  >
                    <Plus size={18} /> Adicionar exercício
                  </button>
                </section>
                <aside className="detail-side">
                  <div className="glass-card progress-side">
                    <div className="side-card-icon">
                      <Target size={21} />
                    </div>
                    <h3>Progresso do dia</h3>
                    <div className="big-percent">
                      {currentWorkout.exercises.length
                        ? Math.round(
                            (currentWorkout.exercises.filter(
                              (item) => item.done,
                            ).length /
                              currentWorkout.exercises.length) *
                              100,
                          )
                        : 0}
                      <span>%</span>
                    </div>
                    <div className="progress-bar">
                      <span
                        style={{
                          width: `${currentWorkout.exercises.length ? (currentWorkout.exercises.filter((item) => item.done).length / currentWorkout.exercises.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p>
                      {
                        currentWorkout.exercises.filter((item) => item.done)
                          .length
                      }{" "}
                      de {currentWorkout.exercises.length} exercícios concluídos
                    </p>
                  </div>
                  <div className="glass-card tip-card">
                    <span className="mini-eyebrow">DO SEU JEITO</span>
                    <h3>Personalize sua ficha</h3>
                    <p>
                      Edite o nome do treino, duração e exercícios para refletir
                      seu planejamento real.
                    </p>
                    <button
                      className="text-button"
                      onClick={() =>
                        setEditor({ kind: "workout", day: selectedDay })
                      }
                    >
                      Editar treino <ArrowRight size={16} />
                    </button>
                  </div>
                </aside>
              </div>
            </>
          )}
          {page === "nutrition" && (
            <>
              <PageTitle
                eyebrow="ALIMENTAÇÃO"
                title="Minha dieta"
                description="Organize suas refeições da semana do seu jeito."
              />
              <DayTabs selected={selectedDay} onSelect={setSelectedDay} />
              <div className="nutrition-header glass-card">
                <div className="detail-icon orange">
                  <Utensils size={24} />
                </div>
                <div>
                  <span className="mini-eyebrow">
                    {days[selectedDay].toUpperCase()}
                  </span>
                  <h2>Plano alimentar</h2>
                  <p>{currentMeals.length} refeições planejadas</p>
                </div>
                <div className="nutrition-total">
                  <span>Total planejado</span>
                  <strong>
                    {currentMeals
                      .reduce((sum, item) => sum + item.calories, 0)
                      .toLocaleString("pt-BR")}{" "}
                    <small>kcal</small>
                  </strong>
                </div>
              </div>
              <div className="meal-cards">
                {currentMeals.map((item, index) => (
                  <div
                    className={`glass-card meal-card ${item.done ? "done" : ""}`}
                    key={item.id}
                  >
                    <div className={`meal-icon meal-${index % 4}`}>
                      <Utensils size={21} />
                    </div>
                    <div className="meal-card-info">
                      <div>
                        <span className="mini-eyebrow">{item.time}</span>
                        <h3>{item.name}</h3>
                      </div>
                      <p>{item.detail}</p>
                      <span className="calorie-chip">{item.calories} kcal</span>
                    </div>
                    <div className="meal-card-actions">
                      <button
                        className={`done-button ${item.done ? "selected" : ""}`}
                        onClick={() =>
                          update((d) => {
                            const target = d.meals[selectedDay].find(
                              (meal) => meal.id === item.id,
                            )!;
                            target.done = !target.done;
                            return d;
                          })
                        }
                      >
                        {item.done ? (
                          <>
                            <Check size={16} /> Consumida
                          </>
                        ) : (
                          "Marcar consumida"
                        )}
                      </button>
                      <button
                        className="icon-button muted"
                        aria-label={`Editar ${item.name}`}
                        onClick={() =>
                          setEditor({
                            kind: "meal",
                            day: selectedDay,
                            id: item.id,
                          })
                        }
                      >
                        <Settings2 size={17} />
                      </button>
                      <button
                        className="icon-button muted"
                        aria-label={`Excluir ${item.name}`}
                        onClick={() =>
                          update((d) => {
                            d.meals[selectedDay] = d.meals[selectedDay].filter(
                              (meal) => meal.id !== item.id,
                            );
                            return d;
                          })
                        }
                      >
                        <X size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="add-button wide"
                onClick={() => setEditor({ kind: "meal", day: selectedDay })}
              >
                <Plus size={18} /> Adicionar refeição
              </button>
              <p className="health-note">
                Informações nutricionais são estimativas inseridas por você.
                Para um plano alimentar individualizado, procure um
                nutricionista.
              </p>
            </>
          )}
          {page === "cardio" && (
            <CardioPage
              data={data}
              seconds={cardioSeconds}
              running={cardioStartedAt !== null}
              onToggle={toggleCardio}
              onReset={resetCardio}
              onSave={saveCardio}
            />
          )}
          {page === "progress" && (
            <ProgressPage data={data} update={update} currentBmi={currentBmi} />
          )}
          {page === "profile" && (
            <ProfilePage
              data={data}
              update={update}
              mode={mode}
              signOut={signOut}
            />
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button onClick={() => setToast("")} aria-label="Fechar aviso">
            <X size={15} />
          </button>
        </div>
      )}
      {editor && (
        <EditorModal
          key={`${editor.kind}-${editor.day}-${editor.id || "new"}`}
          editor={editor}
          data={data}
          update={update}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  );
}

function EditorModal({
  editor,
  data,
  update,
  onClose,
}: {
  editor: Editor;
  data: AppData;
  update: (fn: (data: AppData) => AppData) => void;
  onClose: () => void;
}) {
  const workout = data.workouts[editor.day];
  const exercise =
    editor.kind === "exercise"
      ? workout.exercises.find((item) => item.id === editor.id)
      : undefined;
  const meal =
    editor.kind === "meal"
      ? data.meals[editor.day].find((item) => item.id === editor.id)
      : undefined;
  const [form, setForm] = useState({
    name:
      exercise?.name ||
      meal?.name ||
      (editor.kind === "workout" ? workout.title : ""),
    sets: exercise?.sets || "3",
    reps: exercise?.reps || "12",
    rest: exercise?.rest || "60s",
    focus: workout.focus,
    duration: String(workout.duration),
    time: meal?.time || "12:00",
    detail: meal?.detail || "",
    calories: String(meal?.calories ?? 0),
  });
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  const label =
    editor.kind === "exercise"
      ? "exercício"
      : editor.kind === "meal"
        ? "refeição"
        : "treino";
  function field(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    update((d) => {
      if (editor.kind === "exercise") {
        const next = {
          name: form.name.trim(),
          sets: form.sets.trim(),
          reps: form.reps.trim(),
          rest: form.rest.trim(),
        };
        const target = d.workouts[editor.day].exercises.find(
          (item) => item.id === editor.id,
        );
        if (target) Object.assign(target, next);
        else
          d.workouts[editor.day].exercises.push({
            id: crypto.randomUUID(),
            ...next,
            done: false,
          });
      } else if (editor.kind === "meal") {
        const next = {
          name: form.name.trim(),
          time: form.time,
          detail: form.detail.trim(),
          calories: Number(form.calories),
        };
        const target = d.meals[editor.day].find(
          (item) => item.id === editor.id,
        );
        if (target) Object.assign(target, next);
        else
          d.meals[editor.day].push({
            id: crypto.randomUUID(),
            ...next,
            done: false,
          });
      } else {
        Object.assign(d.workouts[editor.day], {
          title: form.name.trim(),
          focus: form.focus.trim() || "Treino",
          duration: Number(form.duration),
        });
      }
      return d;
    });
    onClose();
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="editor-modal glass-card"
        role="dialog"
        aria-modal="true"
        aria-label={`${editor.id ? "Editar" : "Adicionar"} ${label}`}
        onSubmit={save}
      >
        <button
          className="modal-close icon-button"
          type="button"
          aria-label="Fechar"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <span className="mini-eyebrow">
          {days[editor.day].toUpperCase()} · SEU PLANO
        </span>
        <h2>
          {editor.id || editor.kind === "workout" ? "Editar" : "Adicionar"}{" "}
          {label}
        </h2>
        <p>Personalize seu planejamento do jeito que funciona para você.</p>
        <div className="editor-fields">
          <label>
            Nome
            <input
              autoFocus
              required
              maxLength={80}
              value={form.name}
              onChange={(event) => field("name", event.target.value)}
              placeholder={`Nome do ${label}`}
            />
          </label>
          {editor.kind === "exercise" && (
            <>
              <div className="form-row">
                <label>
                  Séries
                  <input
                    required
                    maxLength={12}
                    value={form.sets}
                    onChange={(event) => field("sets", event.target.value)}
                  />
                </label>
                <label>
                  Repetições ou duração
                  <input
                    required
                    maxLength={24}
                    value={form.reps}
                    onChange={(event) => field("reps", event.target.value)}
                  />
                </label>
              </div>
              <label>
                Descanso
                <input
                  required
                  maxLength={20}
                  value={form.rest}
                  onChange={(event) => field("rest", event.target.value)}
                />
              </label>
            </>
          )}
          {editor.kind === "meal" && (
            <>
              <label>
                Alimentos / descrição
                <input
                  maxLength={160}
                  value={form.detail}
                  onChange={(event) => field("detail", event.target.value)}
                  placeholder="O que compõe esta refeição?"
                />
              </label>
              <div className="form-row">
                <label>
                  Horário
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(event) => field("time", event.target.value)}
                  />
                </label>
                <label>
                  Calorias estimadas
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    required
                    value={form.calories}
                    onChange={(event) => field("calories", event.target.value)}
                  />
                </label>
              </div>
            </>
          )}
          {editor.kind === "workout" && (
            <>
              <label>
                Foco do treino
                <input
                  maxLength={80}
                  value={form.focus}
                  onChange={(event) => field("focus", event.target.value)}
                  placeholder="Ex.: força superior"
                />
              </label>
              <label>
                Duração estimada (min)
                <input
                  type="number"
                  min="0"
                  max="600"
                  required
                  value={form.duration}
                  onChange={(event) => field("duration", event.target.value)}
                />
              </label>
            </>
          )}
        </div>
        <div className="editor-actions">
          <button type="button" className="outline-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="primary-button">
            <Save size={16} /> Salvar {label}
          </button>
        </div>
      </form>
    </div>
  );
}

function Landing({
  onDemo,
  onAuth,
  hasSupabase,
  notice,
}: {
  onDemo: () => void;
  onAuth: (
    email: string,
    password: string,
    name: string,
    register: boolean,
  ) => Promise<string>;
  hasSupabase: boolean;
  notice: string;
}) {
  const [authOpen, setAuthOpen] = useState(false),
    [register, setRegister] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="landing">
      <div className="landing-glow" />
      <header className="landing-nav">
        <div className="brand">
          <span className="brand-mark">
            G<span>.</span>
          </span>
          <span className="brand-word">
            Granado<span>Fit</span>
          </span>
        </div>
        <div>
          <button className="landing-login" onClick={() => setAuthOpen(true)}>
            Entrar
          </button>
          <button className="landing-nav-cta" onClick={onDemo}>
            Explorar app <ArrowUpRight size={16} />
          </button>
        </div>
      </header>
      <main className="landing-main">
        <div className="landing-copy">
          <span className="landing-kicker">
            <span /> TREINE COM PROPÓSITO
          </span>
          <h1>
            Seu melhor ritmo <em>começa aqui.</em>
          </h1>
          <p>
            Treinos, alimentação, cardio e evolução em um só espaço. Tudo o que
            você precisa para transformar consistência em resultado.
          </p>
          <div className="landing-actions">
            <button className="primary-button" onClick={onDemo}>
              Explorar demonstração <ArrowRight size={18} />
            </button>
            <button
              className="landing-secondary"
              onClick={() => setAuthOpen(true)}
            >
              Criar minha conta <ArrowUpRight size={17} />
            </button>
          </div>
          {notice && (
            <div className="form-error" role="alert">
              {notice}
            </div>
          )}
          <div className="landing-points">
            <span>
              <Check size={16} /> Ficha semanal
            </span>
            <span>
              <Check size={16} /> Progresso real
            </span>
            <span>
              <Check size={16} /> Seu espaço
            </span>
          </div>
        </div>
        <div className="landing-art">
          <div className="landing-art-ring ring-one" />
          <div className="landing-art-ring ring-two" />
          <div className="landing-art-ring ring-three" />
          <div className="landing-art-core">
            <div className="landing-core-logo">
              G<span>.</span>
            </div>
          </div>
          <div className="floating-card float-top">
            <div className="floating-icon">
              <Dumbbell size={20} />
            </div>
            <div>
              <small>TREINO DE HOJE</small>
              <strong>Seu próximo passo</strong>
            </div>
            <ArrowUpRight size={17} />
          </div>
          <div className="floating-card float-bottom">
            <div className="floating-icon pink">
              <HeartPulse size={20} />
            </div>
            <div>
              <small>EVOLUÇÃO</small>
              <strong>Todo dia conta.</strong>
            </div>
            <TrendingDown size={17} />
          </div>
        </div>
      </main>
      <footer className="landing-footer">
        <span>GRANADOFIT · FEITO PARA SUA EVOLUÇÃO</span>
        <span>Comece no seu ritmo. Continue por você.</span>
      </footer>
      {authOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAuthOpen(false);
          }}
        >
          <form
            className="auth-modal glass-card"
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              setSuccess("");
              setBusy(true);
              try {
                const result = await onAuth(email, password, name, register);
                if (result) setSuccess(result);
              } catch (cause) {
                setError(
                  cause instanceof Error
                    ? cause.message
                    : "Não foi possível continuar.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <button
              type="button"
              className="modal-close icon-button"
              aria-label="Fechar"
              onClick={() => setAuthOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="brand-mark">
              G<span>.</span>
            </div>
            <span className="mini-eyebrow">SEU ESPAÇO COMEÇA AQUI</span>
            <h2>{register ? "Criar conta" : "Bem-vindo de volta"}</h2>
            <p>
              {register
                ? "Crie sua conta para salvar seus planos com segurança."
                : "Entre para continuar sua jornada."}
            </p>
            {register && (
              <label>
                Seu nome
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  minLength={2}
                  placeholder="Como quer ser chamado?"
                />
              </label>
            )}
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="voce@exemplo.com"
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                placeholder="Mínimo de 6 caracteres"
              />
            </label>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="form-success" role="status">
                {success}
              </div>
            )}
            <button
              className="primary-button auth-submit"
              disabled={busy || !hasSupabase}
            >
              {busy ? "Aguarde..." : register ? "Criar conta" : "Entrar"}{" "}
              <ArrowRight size={17} />
            </button>
            {!hasSupabase && (
              <small className="auth-note">
                Contas aguardam a configuração do Supabase. Você pode explorar a
                demonstração.
              </small>
            )}
            <button
              type="button"
              className="switch-auth"
              onClick={() => {
                setRegister(!register);
                setError("");
                setSuccess("");
              }}
            >
              {register
                ? "Já tem uma conta? Entrar"
                : "Ainda não tem conta? Criar conta"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>
          {title}
          <span className="headline-dot">.</span>
        </h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
function DayTabs({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (day: number) => void;
}) {
  return (
    <div className="day-tabs" role="tablist" aria-label="Dias da semana">
      {days.map((day, index) => (
        <button
          role="tab"
          aria-selected={selected === index}
          className={selected === index ? "selected" : ""}
          key={day}
          onClick={() => onSelect(index)}
        >
          {day}
          <span>{index === today ? "HOJE" : ""}</span>
        </button>
      ))}
    </div>
  );
}
function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  tone,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  suffix: string;
  tone: string;
  detail: string;
}) {
  return (
    <div className="glass-card stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={21} strokeWidth={1.9} />
      </div>
      <span className="stat-label">{label}</span>
      <div className="stat-value">
        {value}
        <small>{suffix}</small>
      </div>
      <div className="stat-detail">
        <ArrowUpRight size={14} />
        {detail}
      </div>
    </div>
  );
}

function CardioPage({
  data,
  seconds,
  running,
  onToggle,
  onReset,
  onSave,
}: {
  data: AppData;
  seconds: number;
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSave: () => void;
}) {
  const total = data.cardio.reduce((sum, item) => sum + item.seconds, 0);
  return (
    <>
      <PageTitle
        eyebrow="MOVIMENTO"
        title="Cardio & tempo"
        description="Cada minuto em movimento conta para sua jornada."
      />
      <div className="cardio-grid">
        <section className="glass-card timer-card">
          <span className="mini-eyebrow">SEU CRONÔMETRO</span>
          <div className="timer-orbit">
            <div className="timer-ring">
              <Timer size={27} />
              <strong>{formatTime(seconds)}</strong>
              <span>
                {running
                  ? "EM ANDAMENTO"
                  : seconds
                    ? "PAUSADO"
                    : "PRONTO PARA COMEÇAR"}
              </span>
            </div>
          </div>
          <div className="timer-actions">
            <button className="primary-button" onClick={onToggle}>
              {running ? <Pause size={19} /> : <Play size={19} />}{" "}
              {running ? "Pausar" : seconds ? "Continuar" : "Iniciar cardio"}
            </button>
            <button className="outline-button" onClick={onReset}>
              <RotateCcw size={17} /> Reiniciar
            </button>
          </div>
          <button
            className="save-session"
            disabled={seconds < 1}
            onClick={onSave}
          >
            <Save size={17} /> Salvar sessão
          </button>
        </section>
        <aside className="cardio-side">
          <div className="glass-card cardio-metric">
            <div className="stat-icon blue">
              <Clock3 size={22} />
            </div>
            <span>TEMPO ACUMULADO</span>
            <strong>
              {Math.round(total / 60)}
              <small> min</small>
            </strong>
            <p>em {data.cardio.length} sessões registradas</p>
          </div>
          <div className="glass-card cardio-history">
            <div className="card-header">
              <div>
                <span className="mini-eyebrow">HISTÓRICO</span>
                <h3>Últimas sessões</h3>
              </div>
            </div>
            {data.cardio.length ? (
              data.cardio.slice(0, 5).map((item, index) => (
                <div className="history-row" key={`${item.date}-${index}`}>
                  <span className="history-icon">
                    <HeartPulse size={17} />
                  </span>
                  <span>
                    {new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    }).format(new Date(item.date))}
                  </span>
                  <strong>{formatTime(item.seconds)}</strong>
                </div>
              ))
            ) : (
              <p className="no-history">Sua primeira sessão aparece aqui.</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function ProgressPage({
  data,
  update,
  currentBmi,
}: {
  data: AppData;
  update: (fn: (data: AppData) => AppData) => void;
  currentBmi: number | null;
}) {
  const graph = data.weights.map((item) => ({
    label: new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(new Date(`${item.date}T12:00:00`)),
    peso: item.weight,
  }));
  const first = data.weights[0]?.weight ?? data.profile.weight;
  const diff = data.profile.weight - first;
  return (
    <>
      <PageTitle
        eyebrow="SUA JORNADA"
        title="Minha evolução"
        description="Acompanhe o caminho que você está construindo."
      />
      <div className="progress-metrics">
        <StatCard
          icon={Weight}
          label="Peso atual"
          value={data.profile.weight.toLocaleString("pt-BR")}
          suffix="kg"
          tone="violet"
          detail="último registro"
        />
        <StatCard
          icon={Target}
          label="Meta de peso"
          value={data.profile.targetWeight.toLocaleString("pt-BR")}
          suffix="kg"
          tone="orange"
          detail="definida por você"
        />
        <StatCard
          icon={HeartPulse}
          label="Índice de massa corporal"
          value={currentBmi?.toFixed(1) || "—"}
          suffix="kg/m²"
          tone="pink"
          detail={bmiLabel(currentBmi)}
        />
        <StatCard
          icon={diff <= 0 ? ArrowDownRight : ArrowUpRight}
          label="Desde o início"
          value={`${diff > 0 ? "+" : ""}${diff.toFixed(1)}`}
          suffix="kg"
          tone="blue"
          detail="variação registrada"
        />
      </div>
      <div className="progress-content">
        <section className="glass-card chart-card">
          <div className="card-header">
            <div>
              <span className="mini-eyebrow">ACOMPANHAMENTO</span>
              <h3>Evolução de peso</h3>
            </div>
            <span className="chart-unit">PESO EM KG</span>
          </div>
          <div className="chart-wrap">
            <React.Suspense
              fallback={
                <div className="chart-loading">Carregando evolução...</div>
              }
            >
              <ProgressChart graph={graph} />
            </React.Suspense>
          </div>
        </section>
        <aside className="glass-card new-weight">
          <div className="side-card-icon">
            <Weight size={21} />
          </div>
          <h3>Registrar peso</h3>
          <p>
            Acompanhe suas mudanças no tempo. A consistência diz mais que um
            único número.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const value = Number(new FormData(form).get("weight"));
              if (!Number.isFinite(value) || value < 20 || value > 500) return;
              update((d) => {
                d.profile.weight = value;
                d.weights.push({
                  date: new Date().toISOString().slice(0, 10),
                  weight: value,
                });
                return d;
              });
              form.reset();
            }}
          >
            <label htmlFor="weight-entry">Peso atual (kg)</label>
            <div className="weight-input-wrap">
              <input
                id="weight-entry"
                type="number"
                name="weight"
                min="20"
                max="500"
                step="0.1"
                required
                placeholder="Ex.: 78,5"
              />
              <span>kg</span>
            </div>
            <button className="primary-button" type="submit">
              Salvar registro <ArrowRight size={17} />
            </button>
          </form>
        </aside>
      </div>
      <p className="health-note">
        O IMC é apenas uma referência geral e não avalia composição corporal.
        Procure orientação profissional para interpretar seus dados.
      </p>
    </>
  );
}

function ProfilePage({
  data,
  update,
  mode,
  signOut,
}: {
  data: AppData;
  update: (fn: (data: AppData) => AppData) => void;
  mode: "demo" | "auth";
  signOut: () => void;
}) {
  const [draft, setDraft] = useState(data.profile);
  useEffect(() => setDraft(data.profile), [data.profile]);
  return (
    <>
      <PageTitle
        eyebrow="SEUS DADOS"
        title="Meu perfil"
        description="Informações que ajudam você a acompanhar sua jornada."
      />
      <div className="profile-grid">
        <section className="glass-card profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {data.profile.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <span className="mini-eyebrow">PERFIL PESSOAL</span>
              <h2>{data.profile.name}</h2>
              <p>
                {mode === "demo" ? "Conta de demonstração" : "Conta pessoal"}
              </p>
            </div>
          </div>
          <form
            className="profile-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (
                !draft.name.trim() ||
                draft.height < 80 ||
                draft.height > 250 ||
                draft.weight < 20 ||
                draft.weight > 500 ||
                draft.targetWeight < 20 ||
                draft.targetWeight > 500
              )
                return;
              update((d) => {
                if (d.profile.weight !== draft.weight)
                  d.weights.push({
                    date: new Date().toISOString().slice(0, 10),
                    weight: draft.weight,
                  });
                d.profile = { ...draft, name: draft.name.trim() };
                return d;
              });
            }}
          >
            <label>
              Seu nome
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
                required
              />
            </label>
            <div className="form-row">
              <label>
                Altura (cm)
                <input
                  type="number"
                  min="80"
                  max="250"
                  value={draft.height || ""}
                  onChange={(event) =>
                    setDraft({ ...draft, height: Number(event.target.value) })
                  }
                  required
                />
              </label>
              <label>
                Peso atual (kg)
                <input
                  type="number"
                  min="20"
                  max="500"
                  step="0.1"
                  value={draft.weight || ""}
                  onChange={(event) =>
                    setDraft({ ...draft, weight: Number(event.target.value) })
                  }
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Meta de peso (kg)
                <input
                  type="number"
                  min="20"
                  max="500"
                  step="0.1"
                  value={draft.targetWeight || ""}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      targetWeight: Number(event.target.value),
                    })
                  }
                  required
                />
              </label>
              <label>
                Seu objetivo
                <input
                  value={draft.goal}
                  onChange={(event) =>
                    setDraft({ ...draft, goal: event.target.value })
                  }
                  placeholder="Ex.: ganhar força"
                />
              </label>
            </div>
            <button className="primary-button" type="submit">
              <Save size={17} /> Salvar alterações
            </button>
          </form>
        </section>
        <aside className="profile-side">
          <div className="glass-card profile-summary">
            <div className="side-card-icon">
              <HeartPulse size={21} />
            </div>
            <h3>Seu IMC</h3>
            <div className="big-percent">
              {bmi(data.profile.weight, data.profile.height)?.toFixed(1) || "—"}
            </div>
            <span className="status-pill">
              {bmiLabel(bmi(data.profile.weight, data.profile.height))}
            </span>
            <p>Calculado com seu peso e altura atuais.</p>
          </div>
          <button className="logout-button" onClick={signOut}>
            <LogOut size={18} /> Sair da conta <ArrowRight size={16} />
          </button>
        </aside>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
