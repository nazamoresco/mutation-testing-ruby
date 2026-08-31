'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDot,
  Code2,
  MessageSquareText,
  MonitorUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Slide = {
  index: string;
  section: string;
  title: string;
  copy: string;
  code?: string;
  annotation: string;
  minutes: number;
  presenter: string[];
  claims: string[];
};

const slides: Slide[] = [
  { index: '01', section: 'Apertura', minutes: 2, title: 'Mutation Testing en Ruby: ¿vale la pena?', copy: 'Las pruebas verdes son el comienzo, no el final. La pregunta es: ¿qué decisiones importantes detectaría realmente tu suite?', code: 'def adult?\n  age >= 18\nend\n\n# ¿qué ocurre si >= se vuelve >?', annotation: 'Una charla para personas que escriben Ruby y no quieren confundir actividad con evidencia.', presenter: ['Abrí con una experiencia conocida: CI verde, incidente igual.', 'Presentá la charla como una pregunta, no como propaganda de una herramienta.'], claims: ['Una suite verde puede seguir siendo semánticamente superficial.', 'La calidad de los tests importa tanto como la cantidad de tests.'] },
  { index: '02', section: 'El problema', minutes: 3, title: 'Cobertura ejecuta. Mutant pregunta: “¿se habría notado?”', copy: 'Cobertura de líneas confirma que el código pasó por una prueba. Mutation testing comprueba si una modificación pequeña altera el resultado de la suite.', annotation: 'Cobertura semántica: evidencia de que una decisión observable está especificada.', presenter: ['No plantees cobertura y mutación como enemigos: responden preguntas diferentes.', 'Pedí un ejemplo del público de una línea cubierta con una aserción débil.'], claims: ['Ejecutar código no equivale a especificar comportamiento.', 'La métrica más útil no siempre es la más fácil de calcular.'] },
  { index: '03', section: 'Qué es', minutes: 3, title: 'Un mutante es un cambio pequeño que tu suite debería matar', copy: 'Se parte del programa original, se altera una única semántica y se ejecutan los tests. Si fallan, el mutante muere. Si pasan, vive.', code: 'original: age >= 18\nmutante:  age > 18\n\nkilled → test falla\nalive  → test pasa', annotation: 'Cada mutante vivo es una invitación a mirar una decisión que todavía no tiene un contrato verificable.', presenter: ['Definí killed y alive con calma: son los dos conceptos que ordenan todo lo demás.', 'Aclará que un alive no siempre significa “escribí otro test”.'], claims: ['Un mutante vivo puede indicar una prueba ausente o código redundante.', 'Mutation testing no busca errores al azar: usa cambios representativos.'] },
  { index: '04', section: 'Ejemplo', minutes: 4, title: 'El borde que no estaba especificado', copy: 'Si solo probamos 17 y 19, cambiar >= por > no rompe nada. El caso que falta no es “más cobertura”: es hacer explícito qué pasa a los 18.', code: 'expect(Person.new(age: 17).adult?).to be(false)\nexpect(Person.new(age: 18).adult?).to be(true)\nexpect(Person.new(age: 19).adult?).to be(true)', annotation: 'Una mutación útil convierte un borde implícito en una conversación concreta de producto y dominio.', presenter: ['Mostrá primero el mutante vivo y recién después agregá el test de 18.', 'Preguntá: ¿quién decide que 18 es el borde?'], claims: ['Los casos límite suelen ser reglas de negocio disfrazadas de operadores.', 'La mejor mejora de test es la que expresa por qué el resultado importa.'] },
  { index: '05', section: 'Ruby', minutes: 3.5, title: 'Mutant es el punto de partida práctico', copy: 'Mutant se integra con RSpec y Minitest. La recomendación es empezar por una zona pequeña, importante y con una suite estable.', code: 'bundle exec mutant run \\\n+  --use rspec \\\n+  --since main \\\n+  "Billing::Price#calculate"', annotation: 'El coste real depende de tu aislamiento de estado, la base de datos y el tamaño de la suite.', presenter: ['Nombrá alternativas, pero no conviertas la charla en una comparación de gems.', 'Explicá --since como una forma de introducir mutación sin ahogarse.'], claims: ['Empezar por el diff es más sostenible que mutar todo el repositorio.', 'La estabilidad de la suite es un requisito, no un detalle.'] },
  { index: '06', section: 'Under the hood', minutes: 4, title: 'Una máquina de contraejemplos para la suite', copy: 'Mutant descubre sujetos, analiza la estructura del código, genera un cambio por vez y deja que el runner clasifique el resultado.', code: 'sujeto → AST → mutante\n      → tests → veredicto\n\nkilled / alive / error', annotation: 'La pregunta interna siempre es la misma: ¿la suite distingue este programa del original?', presenter: ['Usá el término AST sin entrar en una clase de compiladores.', 'Conectá la arquitectura con por qué los estados globales y la base de datos importan.'], claims: ['La herramienta trabaja sobre semánticas, no sobre líneas aisladas.', 'Un error de runner es información sobre el entorno, no cobertura.'] },
  { index: '07', section: 'Resultados', minutes: 3, title: 'Cada mutante vivo abre una conversación de diseño', copy: 'Podés añadir un test, simplificar el código o registrar una excepción razonada. Ignorar el resultado no debería ser la opción por defecto.', annotation: 'El resultado productivo de mutar no es “más tests”; puede ser menos código y una intención más clara.', presenter: ['Mostrá que borrar código también puede ser una victoria.', 'Separá alive de flakiness: primero hay que confiar en el runner.'], claims: ['Un test no es el único artefacto válido para matar un mutante.', 'La simplificación es una respuesta de calidad, no una derrota.'] },
  { index: '08', section: 'Calidad y seguridad', minutes: 4, title: 'Las defensas también son contratos', copy: 'Autorización, tenancy, límites y validaciones se benefician cuando las pruebas reaccionan al eliminar o invertir una condición.', code: 'def allowed?(user, account)\n  user.admin? || account.owner?(user)\nend\n\n# mutante: true', annotation: 'No es un escáner de vulnerabilidades: verifica que las defensas que decidiste tengan pruebas sensibles a su cambio.', presenter: ['Marcá el límite con claridad: no reemplaza threat modeling ni una auditoría.', 'Pedí al público una regla de autorización que les daría miedo mutar.'], claims: ['La seguridad necesita pruebas que fallen cuando una defensa se debilita.', 'Mutation testing valida contratos que ya decidiste, no descubre todos los que faltan.'] },
  { index: '09', section: 'Adopción', minutes: 3, title: 'Una señal de alta fidelidad, no una puerta imposible', copy: 'Primero confirmá que la suite corre de forma estable. Después elegí reglas críticas, usalo en cambios recientes y revisá los vivos uno por uno.', annotation: 'Una métrica sana es decisiones aclaradas y mutaciones revisadas, no un porcentaje que sube sin contexto.', presenter: ['Proponé una estrategia en cuatro pasos: base, foco, diff, revisión.', 'No prometas 100%; explicá por qué no es el objetivo.'], claims: ['El foco reduce coste y mejora la conversación.', 'Los porcentajes sin contexto pueden incentivar malos tests.'] },
  { index: '10', section: 'Límites', minutes: 2.5, title: 'Mutation testing concentra el juicio donde importa', copy: 'Tiene coste, mutantes equivalentes y sensibilidad a flakiness. Funciona mejor junto a revisión humana, tipos, análisis estático y threat modeling.', annotation: 'Una herramienta fuerte no reemplaza el criterio: obliga a aplicarlo en un punto concreto.', presenter: ['Decí explícitamente dónde no ayuda para ganar credibilidad.', 'Cerrá esta parte con la pregunta: ¿qué decisiones no nos podemos permitir errar?'], claims: ['100% mutation score no es el producto.', 'El objetivo es verificar decisiones relevantes, no coleccionar métricas.'] },
  { index: '11', section: 'Cierre', minutes: 3, title: 'Si la IA escribe más código, la escasez no será escribir', copy: 'El valor se mueve hacia herramientas que verifican, restringen y explican software: mutación, complejidad, análisis estático, contraejemplos y observabilidad de decisiones.', annotation: 'Menos skills que producen código sin verificar. Más metacódigo que convierte velocidad en confianza calibrada.', presenter: ['Volvé a la pregunta del inicio: ¿vale la pena? Sí, donde una decisión importa más que el coste de comprobarla.', 'Dejá una pregunta abierta sobre qué herramienta “un nivel arriba” falta en el stack de cada persona.'], claims: ['La IA aumenta el valor de la verificación, no elimina la necesidad de criterio.', 'La próxima capa de herramientas puede ser más interesante que otra capa de generación.'] },
];

const formatDuration = (minutes: number) =>
  Number.isInteger(minutes) ? `${minutes} min` : `${Math.floor(minutes)} min 30 s`;

const formatElapsed = (minutes: number) =>
  `${Math.floor(minutes)}:${minutes % 1 === 0 ? '00' : '30'}`;

const rubyToken = /(#.*$|'[^']*'|"[^"\n]*"|\b(?:def|end|class|module|if|else|elsif|unless|do|case|when|return)\b|\b(?:true|false|nil)\b|:\w+|\b\d+\b|\b[a-z_]\w*[!?]?(?=\())/gm;

function RubyCode({ code }: { code: string }) {
  return code.split(rubyToken).map((token, index) => {
    if (!token) return null;
    let color = 'text-[#42191f]';
    if (token.startsWith('#')) color = 'text-[#9a7073] italic';
    else if (/^['"]/.test(token)) color = 'text-[#a44a00]';
    else if (/^(def|end|class|module|if|else|elsif|unless|do|case|when|return)$/.test(token)) color = 'text-[#9c1f31] font-semibold';
    else if (/^(true|false|nil)$/.test(token)) color = 'text-[#6b3d7a] font-semibold';
    else if (/^:\w+$/.test(token)) color = 'text-[#b04b5f]';
    else if (/^\d+$/.test(token)) color = 'text-[#805246]';
    else if (/^[a-z_]\w*[!?]?$/.test(token)) color = 'text-[#6b3d7a]';
    return <span className={color} key={`${token}-${index}`}>{token}</span>;
  });
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [presenterMode, setPresenterMode] = useState(false);
  const current = slides[active];
  const minutesBefore = slides.slice(0, active).reduce((total, slide) => total + slide.minutes, 0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setActive((value) => Math.min(value + 1, slides.length - 1));
      if (event.key === 'ArrowLeft') setActive((value) => Math.max(value - 1, 0));
      if (event.key.toLowerCase() === 'p') setPresenterMode((value) => !value);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (direction: -1 | 1) =>
    setActive((value) => Math.max(0, Math.min(slides.length - 1, value + direction)));

  return (
    <main className="ruby-light min-h-screen bg-[#fffaf6] text-[#2a171a] selection:bg-[#9c1f31] selection:text-[#fffaf6]">
      <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center border border-[#ffb654] text-xs font-bold text-[#ffb654]">M</span>
          <div>
            <p className="text-sm font-semibold tracking-tight">Mutation Testing en Ruby</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Experiencia de charla</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={!presenterMode ? 'secondary' : 'ghost'} size="sm" onClick={() => setPresenterMode(false)}>Charla</Button>
          <Button variant={presenterMode ? 'secondary' : 'ghost'} size="sm" onClick={() => setPresenterMode(true)}><MonitorUp /> Presentador</Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="border-b border-white/10 p-4 lg:min-h-[calc(100vh-73px)] lg:border-b-0 lg:border-r">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Recorrido</p>
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-1">
            {slides.map((slide, index) => (
              <button key={slide.index} onClick={() => setActive(index)} className={`group flex items-center gap-3 px-2 py-2 text-left transition ${index === active ? 'bg-[#ffb654] text-[#111216]' : 'text-white/50 hover:bg-white/7 hover:text-white'}`}>
                <span className="font-mono text-xs">{slide.index}</span>
                <span className="hidden text-sm font-medium sm:inline lg:inline">{slide.section}</span>
              </button>
            ))}
          </div>
          <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/40"><span className="block font-mono text-[#ffb654]">35 min</span>de contenido + 5 min de preguntas</p>
        </nav>

        <section className="relative overflow-hidden px-5 py-7 sm:px-8 sm:py-12">
          <div className="absolute right-[-10%] top-[-15%] size-[440px] rounded-full border border-[#ffb654]/20" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-8 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-[#ffb654]">
              <span>{current.section}</span>
              <span>{current.index} / {String(slides.length).padStart(2, '0')}</span>
            </div>

            {!presenterMode ? (
              <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
                <div>
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">{current.title}</h1>
                  <p className="mt-7 max-w-2xl text-xl leading-relaxed text-white/65 sm:text-2xl">{current.copy}</p>
                  <p className="mt-10 max-w-xl border-l-2 border-[#ffb654] pl-4 text-sm leading-relaxed text-white/50">{current.annotation}</p>
                </div>
                <div className="border border-white/10 bg-black/20 p-5 sm:p-7">
                  <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/40"><Code2 className="size-4" /> Punto de fricción</div>
                  <pre className="min-h-44 whitespace-pre-wrap font-mono text-[14px] leading-7"><RubyCode code={(current.code ?? current.annotation).replace(/^\+/gm, '')} /></pre>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1.12fr_.88fr]">
                <div className="border border-[#ffb654]/60 bg-[#1a1c22] p-6 sm:p-9">
                  <div className="mb-9 flex items-center justify-between gap-4 text-sm font-semibold text-[#ffb654]">
                    <span className="flex items-center gap-2"><MonitorUp className="size-4" /> Modo presentador</span>
                    <span className="font-mono text-xs">{formatDuration(current.minutes)} · {formatElapsed(minutesBefore)}–{formatElapsed(minutesBefore + current.minutes)}</span>
                  </div>
                  <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{current.title}</h1>
                  <p className="mt-4 text-xs font-mono text-white/40">Plan de charla: 35 min de contenido + 5 min de preguntas</p>
                  <div className="mt-9 border-t border-white/10 pt-6">
                    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Lo que conviene decir</p>
                    <ul className="space-y-4">
                      {current.presenter.map((item) => <li key={item} className="flex gap-3 text-lg leading-relaxed text-white/80"><Check className="mt-1 size-4 shrink-0 text-[#ffb654]" />{item}</li>)}
                    </ul>
                  </div>
                </div>
                <aside className="border border-white/10 bg-white/[.03] p-6 sm:p-8">
                  <div className="mb-7 flex items-center gap-2 text-sm font-semibold"><MessageSquareText className="size-4 text-[#ffb654]" /> Afirmaciones para comentar</div>
                  <ol className="space-y-4">
                    {current.claims.map((claim, index) => <li key={claim} className="border-l border-white/15 pl-4 text-base leading-relaxed text-white/70"><span className="mr-2 font-mono text-xs text-[#ffb654]">0{index + 1}</span>{claim}</li>)}
                  </ol>
                  <div className="mt-10 border-t border-white/10 pt-6 text-sm leading-relaxed text-white/45">{current.annotation}</div>
                </aside>
              </div>
            )}

            <footer className="mt-12 flex items-center justify-between border-t border-white/10 pt-5">
              <Button variant="ghost" size="sm" onClick={() => go(-1)} disabled={active === 0}><ArrowLeft /> Anterior</Button>
              <div className="hidden items-center gap-2 text-xs text-white/35 sm:flex"><CircleDot className="size-3 text-[#ffb654]" /> Flechas para navegar · P para presentador</div>
              <Button variant="secondary" size="sm" onClick={() => go(1)} disabled={active === slides.length - 1}>Siguiente <ArrowRight /></Button>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
