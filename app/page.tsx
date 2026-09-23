'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDot,
  Code2,
  ExternalLink,
  MessageSquareText,
  MonitorUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Visual =
  | 'welcome'
  | 'survey'
  | 'architecture'
  | 'imperative'
  | 'decision'
  | 'spaces'
  | 'oracle'
  | 'contextual-oracle'
  | 'equivalent'
  | 'cost'
  | 'transfer'
  | 'reflection';
type ImperativeStep =
  | 'contract'
  | 'location'
  | 'source'
  | 'ast'
  | 'point'
  | 'replacement'
  | 'patch'
  | 'insertion'
  | 'verdict'
  | 'simplification';

type AstNodeData = {
  type: string;
  detail: string;
  children: AstNodeData[];
};

type Slide = {
  index: string;
  section: string;
  minutes: number;
  title: string;
  copy: string;
  annotation: string;
  code?: string;
  step?: ImperativeStep;
  visual: Visual;
  presenter: string[];
  claims: string[];
};

type BrowserRubyValue = { toString: () => string };
type BrowserRubyVm = { eval: (code: string) => BrowserRubyValue };
type BrowserRubyRuntime = {
  DefaultRubyVM: (
    module: WebAssembly.Module,
    options?: {
      consolePrint?: {
        stdout?: (line: string) => void;
        stderr?: (line: string) => void;
      };
    },
  ) => Promise<{ vm: BrowserRubyVm }>;
};

const RUBY_WASM_API =
  'https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@2.10.1/dist/browser/+esm';
const RUBY_WASM_BINARY =
  'https://cdn.jsdelivr.net/npm/@ruby/3.3-wasm-wasi@2.10.1/dist/ruby+stdlib.wasm';

const calculatorSource = `class Citizen
  def adult?(age)
    age >= 18
  end
end
`;

const citizenTestSource = `load "citizen.rb"

def run_tests
  citizen = Citizen.new
  raise "19 should be adult" unless citizen.adult?(19)
  raise "17 should not be adult" if citizen.adult?(17)

  "2 tests · 2 passed"
end

run_tests`;

const subjectSource = `module MiniMutant
  class Subject
    attr_reader :owner, :name, :path, :line

    def initialize(owner:, name:)
      @owner = owner
      @name = name
      @path, @line = owner.instance_method(name).source_location
    end
  end
end`;

const sourceFileSource = `require "prism"

module MiniMutant
  class SourceFile
    attr_reader :path, :source, :ast

    def self.load(path)
      new(path)
    end

    def initialize(path)
      @path = path
      @source = File.binread(path)
      result = Prism.parse(@source)
      raise SyntaxError, result.errors.map(&:message).join(", ") unless result.success?
      @ast = result.value
    end
  end
end`;

const methodFinderSource = `module MiniMutant
  class MethodFinder
    def self.call(source_file, subject)
      nodes(source_file.ast).find do |node|
        node.is_a?(Prism::DefNode) &&
          node.name == subject.name &&
          node.location.start_line == subject.line
      end
    end

    def self.nodes(node)
      [node] + node.compact_child_nodes.flat_map { |child| nodes(child) }
    end
  end
end`;

const mutationSource = `module MiniMutant
  Mutation = Data.define(:original_ast, :ast, :point)

  MutationPoint = Data.define(:node, :replacement) do
    def self.find(definition)
      node = MethodFinder.nodes(definition).find do |candidate|
        candidate.is_a?(Prism::CallNode) && candidate.name == :>=
      end
      new(node:, replacement: :>)
    end
  end
end`;

const operatorReplacementSource = `module MiniMutant
  class OperatorReplacement < Prism::MutationCompiler
    def self.call(ast, point)
      mutated = new(point).visit(ast)
      Mutation.new(original_ast: ast, ast: mutated, point: point)
    end

    def initialize(point)
      @point = point
    end

    def visit_call_node(node)
      copy = super
      same_location = node.location.start_offset == @point.node.location.start_offset &&
        node.location.end_offset == @point.node.location.end_offset
      same_location ? copy.copy(name: @point.replacement) : copy
    end
  end
end`;

const deparserSource = `module MiniMutant
  class Deparser
    BINARY = %i[> >= < <= == != + - * /]

    def self.call(node)
      new.visit(node)
    end

    def visit(node)
      case node
      when Prism::DefNode
        params = node.parameters.requireds.map(&:name).join(", ")
        body = visit(node.body).lines.map { |line| "  #{line}" }.join
        "def #{node.name}(#{params})\\n#{body}\\nend"
      when Prism::StatementsNode
        node.body.map { |child| visit(child) }.join("\\n")
      when Prism::CallNode
        args = node.arguments&.arguments || []
        if node.receiver && BINARY.include?(node.name) && args.one?
          "#{visit(node.receiver)} #{node.name} #{visit(args.first)}"
        else
          raise "unsupported call: #{node.name}"
        end
      when Prism::LocalVariableReadNode
        node.name.to_s
      when Prism::IntegerNode
        node.value.to_s
      when Prism::TrueNode
        "true"
      when Prism::FalseNode
        "false"
      else
        raise "unsupported node: #{node.class}"
      end
    end
  end
end`;

const inserterSource = `module MiniMutant
  class Inserter
    def self.with(subject, ruby)
      original = subject.owner.instance_method(subject.name)
      subject.owner.class_eval(ruby, subject.path, subject.line)
      yield
    ensure
      subject.owner.define_method(subject.name, original)
    end
  end
end`;

const runnerSource = `module MiniMutant
  class Runner
    def self.call(subject:, mutation:)
      ruby = Deparser.call(mutation.ast)
      Inserter.with(subject, ruby) do
        yield
        [:alive, nil]
      end
    rescue RuntimeError => error
      [:killed, error.message]
    end
  end
end`;

const semanticSimplificationSource = `module MiniMutant
  class SemanticSimplification < Prism::MutationCompiler
    def self.call(ast, point)
      replacement = Prism.parse("true").value.statements.body.first
      mutated = new(point.node.location, replacement).visit(ast)
      Mutation.new(original_ast: ast, ast: mutated, point: point)
    end

    def initialize(target_location, replacement)
      @target_location = target_location
      @replacement = replacement
    end

    def visit_call_node(node)
      same_location = node.location.start_offset == @target_location.start_offset &&
        node.location.end_offset == @target_location.end_offset
      return @replacement if same_location

      super
    end
  end
end`;

const preparation = `load "citizen.rb"
load "mini_mutant/subject.rb"
load "mini_mutant/source_file.rb"
load "mini_mutant/method_finder.rb"
load "mini_mutant/mutation.rb"

subject = MiniMutant::Subject.new(owner: Citizen, name: :adult?)
file = MiniMutant::SourceFile.load(subject.path)
original = MiniMutant::MethodFinder.call(file, subject)
point = MiniMutant::MutationPoint.find(original)`;

const mutationPreparation = `${preparation}
load "mini_mutant/operator_replacement.rb"
mutation = MiniMutant::OperatorReplacement.call(original, point)`;

const astPayloadRuby = `def ast_payload(node)
  detail = case node
  when Prism::DefNode, Prism::RequiredParameterNode, Prism::LocalVariableReadNode
    ":#{node.name}"
  when Prism::CallNode
    "name: #{node.name.inspect}"
  when Prism::IntegerNode
    node.value.to_s
  else
    ""
  end

  {
    type: node.class.name.delete_prefix("Prism::"),
    detail: detail,
    children: node.compact_child_nodes.map { |child| ast_payload(child) }
  }
end`;

const runnableSteps: Record<ImperativeStep, string> = {
  contract: citizenTestSource,
  location: `load "citizen.rb"
load "mini_mutant/subject.rb"

subject = MiniMutant::Subject.new(owner: Citizen, name: :adult?)
"subject → Citizen#adult? @ #{subject.path}:#{subject.line}"`,
  source: `load "citizen.rb"
load "mini_mutant/subject.rb"
load "mini_mutant/source_file.rb"

subject = MiniMutant::Subject.new(owner: Citizen, name: :adult?)
source_file = MiniMutant::SourceFile.load(subject.path)
"source → #{source_file.source.bytesize} bytes; AST → #{source_file.ast.class}"`,
  ast: `require "json"
load "citizen.rb"
load "mini_mutant/subject.rb"
load "mini_mutant/source_file.rb"
load "mini_mutant/method_finder.rb"

subject = MiniMutant::Subject.new(owner: Citizen, name: :adult?)
source_file = MiniMutant::SourceFile.load(subject.path)
definition = MiniMutant::MethodFinder.call(source_file, subject)

${astPayloadRuby}

"__AST__#{JSON.generate(ast_payload(definition))}"`,
  point: `${preparation}
"mutation point → #{point.node.class}(#{point.node.name.inspect}) → #{point.replacement.inspect}"`,
  replacement: `require "json"
${mutationPreparation}

${astPayloadRuby}

"__AST__#{JSON.generate(ast_payload(mutation.ast))}"`,
  patch: `${mutationPreparation}
load "mini_mutant/deparser.rb"
"deparsed Ruby:\\n#{MiniMutant::Deparser.call(mutation.ast)}"`,
  insertion: `${mutationPreparation}
load "mini_mutant/deparser.rb"
load "mini_mutant/inserter.rb"
ruby = MiniMutant::Deparser.call(mutation.ast)
before = Citizen.new.adult?(18)
inside = MiniMutant::Inserter.with(subject, ruby) { Citizen.new.adult?(18) }
after = Citizen.new.adult?(18)
"original: #{before} → inserted: #{inside} → restored: #{after}"`,
  verdict: `${mutationPreparation}
load "mini_mutant/deparser.rb"
load "mini_mutant/inserter.rb"
load "mini_mutant/runner.rb"
load "citizen_test.rb"

status, error = MiniMutant::Runner.call(subject:, mutation:) { run_tests }
error ? "#{status.upcase} → #{error}" : status.upcase.to_s`,
  simplification: `${preparation}
load "mini_mutant/deparser.rb"
load "mini_mutant/inserter.rb"
load "mini_mutant/runner.rb"
load "mini_mutant/semantic_simplification.rb"
load "citizen_test.rb"

mutation = MiniMutant::SemanticSimplification.call(original, point)
ruby = MiniMutant::Deparser.call(mutation.ast)
status, error = MiniMutant::Runner.call(subject:, mutation:) { run_tests }
"#{ruby}\\n\\n#{error ? "#{status.upcase} → #{error}" : status.upcase}"`,
};

const slides: Slide[] = [
  {
    index: '01',
    section: 'Bienvenida',
    minutes: 2,
    visual: 'welcome',
    title: 'Mutant Testing en Ruby: ¿vale la pena?',
    copy: 'Vamos a entender mutation testing construyendo MiniMutant: una implementación pequeña, visible y ejecutable que nos permita mirar el mecanismo por dentro.',
    annotation: '',
    presenter: [
      'Hacé click en el título dos veces: primero corregí Mutant → Mutation; después pasalo a “Pruebas de mutación” como guiño a la encuesta.',
      'Presentate y contá por qué elegiste construir una versión mínima en vez de empezar por una herramienta terminada.',
      'Anticipá el recorrido: entender el mecanismo, construir MiniMutant y discutir dónde aporta valor.',
    ],
    claims: [
      'MiniMutant es el hilo conductor de la charla.',
      'La pregunta “¿vale la pena?” se responde después de entender qué hace mutation testing y cuánto cuesta.',
    ],
  },
  {
    index: '02',
    section: 'Encuesta Ruby Sur',
    minutes: 1,
    visual: 'survey',
    title: 'La mayoría llega con curiosidad, no con experiencia',
    copy: 'Antes de la charla preguntamos cuánto conocían la técnica y qué les impedía probarla. Son 11 respuestas: sirven para orientar esta conversación, no para representar a toda la comunidad Ruby.',
    annotation:
      '9 de 11 nunca usaron mutation testing. Las barreras más repetidas fueron no conocerlo y no haber tenido tiempo o prioridad.',
    presenter: [
      'Empezá por el tamaño de la muestra: once respuestas de la convocatoria de Ruby Sur.',
      'Marcá que nueve personas nunca lo usaron y nueve tienen poca o ninguna familiaridad.',
      'Usá las dos respuestas abiertas para cerrar el gag del título: “¿No es Mutation Testing?” y “tests de mutación”.',
      'No generalices estos resultados fuera de la audiencia de la charla.',
    ],
    claims: [
      'Familiaridad: 6 lo escucharon nombrar, 3 no lo conocían y 2 sabían un poco.',
      'Uso real: 9 nunca; 2 lo probaron alguna vez.',
      'Barreras múltiples: 5 “no lo conocía” y 4 falta de tiempo o prioridad.',
    ],
  },
  {
    index: '03',
    section: 'MiniMutant · 01',
    minutes: 0.5,
    visual: 'imperative',
    step: 'contract',
    title: 'Código base',
    copy: '',
    annotation: '',
    presenter: [
      'Mostrá `citizen.rb` y después la suite incompleta: prueba 17 y 19, pero no el borde de 18.',
      'Preguntá al público: “¿Cuál es la alteración más pequeña, válida en Ruby, que cambia la semántica y aun así deja los tests en verde?”.',
      'Si hace falta una pista: se puede borrar un solo carácter de `>=`.',
    ],
    claims: [
      'La suite pasa aunque todavía no distingue `>=` de `>`.',
      'La pregunta nace del código; la definición formal viene después.',
    ],
  },
  {
    index: '04',
    section: 'Mapa de vuelo',
    minutes: 1,
    visual: 'architecture',
    title: 'Antes de construir: el recorrido completo',
    copy: '',
    annotation: '',
    presenter: [
      'Conectá el mapa con el ejemplo que acaba de ver el público.',
      'Recorré las tres bandas sin entrar todavía en implementación.',
      'Anticipá que cada nombre del diagrama va a convertirse en un archivo del IDE.',
    ],
    claims: [
      'El pipeline va de runtime a AST y del AST nuevamente a comportamiento ejecutable.',
      'Runner no decide si el cambio es correcto: solamente reporta si la suite lo distinguió.',
    ],
  },
  {
    index: '05',
    section: 'MiniMutant · 02',
    minutes: 0.5,
    visual: 'imperative',
    step: 'location',
    title: 'Citizen#adult? es nuestro Subject',
    copy: '',
    annotation: '',
    code: 'method = Citizen.instance_method(:adult?)\npath, line = method.source_location',
    presenter: [
      'Leé el valor de `path:line`: la siguiente operación trabaja sobre ese archivo exacto.',
    ],
    claims: [
      '`source_location` conecta un método que existe en runtime con su implementación Ruby.',
    ],
  },
  {
    index: '06',
    section: 'MiniMutant · 03',
    minutes: 0.5,
    visual: 'imperative',
    step: 'source',
    title: 'SourceFile lee y parsea citizen.rb una vez',
    copy: '',
    annotation: '',
    code: 'source_file = SourceFile.load(subject.path)\nsource_file.ast # Prism::ProgramNode',
    presenter: [
      'Marcá la regla: un archivo, una lectura, un parseo, muchas mutaciones.',
    ],
    claims: [
      'Reflection ubica el archivo; SourceFile produce la representación estructurada.',
    ],
  },
  {
    index: '07',
    section: 'MiniMutant · 04',
    minutes: 0.5,
    visual: 'imperative',
    step: 'ast',
    title: 'MethodFinder encuentra el AST de Citizen#adult?',
    copy: '',
    annotation: '',
    code: 'tree = Prism.parse(source).value\ndefinition = nodes(tree).find { |node|\n  node.is_a?(Prism::DefNode) && node.name == :adult?\n}',
    presenter: [
      'Mostrá el salto: de un string completo a una única definición de método.',
    ],
    claims: [
      'La selección por nombre y línea evita mutar otro método con el mismo operador.',
    ],
  },
  {
    index: '08',
    section: 'MiniMutant · 05',
    minutes: 0.5,
    visual: 'imperative',
    step: 'point',
    title: 'Encontramos un punto, no una línea entera',
    copy: '',
    annotation: '',
    code: 'point = MutationPoint.new(\n  node: call,\n  replacement: :>\n)',
    presenter: [
      'Separá la selección del punto de la transformación: todavía no cambiamos el árbol.',
    ],
    claims: ['MutationPoint describe un único cambio estructural posible.'],
  },
  {
    index: '09',
    section: 'MiniMutant · 06',
    minutes: 0.5,
    visual: 'imperative',
    step: 'replacement',
    title: 'OperatorReplacement transforma AST → AST',
    copy: '',
    annotation: '',
    code: 'copy = super\ncopy.copy(name: :>)',
    presenter: [
      'Mostrá que el resultado sigue siendo un DefNode completo, no un string parchado.',
    ],
    claims: [
      'El cambio es pequeño a propósito: expresa una hipótesis semántica precisa.',
    ],
  },
  {
    index: '10',
    section: 'MiniMutant · 07',
    minutes: 0.5,
    visual: 'imperative',
    step: 'patch',
    title: 'Deparser convierte el AST mutado en Ruby',
    copy: '',
    annotation: '',
    code: 'ruby = Deparser.call(mutation.ast)\n# def adult?(age)\n#   age > 18\n# end',
    presenter: [
      'Señalá el round trip conceptual: Ruby → AST original → AST mutado → Ruby.',
    ],
    claims: [
      'El source generado representa el AST mutado, no una edición textual.',
    ],
  },
  {
    index: '11',
    section: 'MiniMutant · 08',
    minutes: 0.5,
    visual: 'imperative',
    step: 'insertion',
    title: 'Inserter cambia el método y después lo restaura',
    copy: '',
    annotation: '',
    code: 'Inserter.with(subject, ruby) do\n  Citizen.new.adult?(18) # false\nend\nCitizen.new.adult?(18) # true',
    presenter: [
      'Ejecutá y leé la transición completa: original → inserted → restored.',
      'Aclarar que Mutant real suma aislamiento de procesos alrededor de esta idea.',
    ],
    claims: [
      'Insertion cambia un solo experimento y deja limpio el siguiente.',
    ],
  },
  {
    index: '12',
    section: 'MiniMutant · 09',
    minutes: 0.5,
    visual: 'imperative',
    step: 'verdict',
    title: 'Runner reporta alive; ahora matémoslo juntos',
    copy: '',
    annotation: '',
    code: 'status = Runner.call { run_tests }\n# primero: ALIVE\n# agregar el caso 18 y reejecutar → KILLED',
    presenter: [
      'Primero ejecutá sin tocar nada y obtené ALIVE.',
      'Abrí citizen_test.rb, agregá `raise "18 should be adult" unless citizen.adult?(18)` dentro de run_tests y reejecutá.',
      'El cambio de veredicto es la demostración central de la charla.',
    ],
    claims: [
      'Alive significa que la suite no refutó la alternativa.',
      'Killed aparece cuando una observación distingue el comportamiento requerido.',
    ],
  },
  {
    index: '13',
    section: 'Operadores',
    minutes: 3,
    visual: 'decision',
    title: 'Dos familias de operadores, dos preguntas distintas',
    copy: '',
    annotation: '',
    presenter: [
      'Usá el ejemplo `>=` → `>` como orthogonal replacement: no simplifica la forma; reemplaza una decisión por otra.',
      'Contrastalo con semantic reduction: borrar una rama, un argumento o una parte del comportamiento para ver si hacía falta.',
      'Conectá un mutante vivo con dos acciones: aceptar la simplificación o agregar el test que demuestra que la diferencia importa.',
    ],
    claims: [
      'Semantic Reduction pregunta qué comportamiento podemos quitar.',
      'Orthogonal Replacement pregunta si los tests distinguen alternativas válidas.',
    ],
  },
  {
    index: '14',
    section: 'Espacio de programas',
    minutes: 1.5,
    visual: 'spaces',
    title: 'La suite define cuánto comportamiento dejamos pasar',
    copy: 'Ruby admite un universo enorme de programas. Nuestra suite acepta un subconjunto: todos los que producen las observaciones que hoy comprobamos. Los requerimientos definen un espacio todavía menor: los comportamientos que realmente consideramos correctos.',
    annotation:
      'Mutation testing busca contraejemplos para contraer el espacio aceptado por la suite hasta aproximarlo al espacio permitido por los requerimientos.',
    presenter: [
      'Leé las esferas de afuera hacia adentro: posible en Ruby, aceptado por la suite, válido para el negocio.',
      'Señalá la zona entre la esfera de tests y la de requerimientos: son programas incorrectos que igualmente pasan.',
      'Cada mutante vivo descubre un punto en esa zona y nos obliga a elegir entre agregar una observación o aceptar la alternativa.',
      'Aclaración formal: no enumeramos todo el universo Ruby; los operadores muestrean vecinos pequeños y relevantes del programa actual.',
    ],
    claims: [
      'Una suite fuerte hace que “pasa los tests” se aproxime a “cumple los requerimientos”.',
      'Mutation testing mide y reduce la holgura entre ambos espacios mediante alternativas concretas.',
    ],
  },
  {
    index: '15',
    section: 'MiniMutant · 10',
    minutes: 1,
    visual: 'imperative',
    step: 'simplification',
    title: 'SemanticSimplification elimina la decisión completa',
    copy: '',
    annotation: '',
    code: 'CallNode(:>=) → TrueNode\n# def adult?(age)\n#   true\n# end',
    presenter: [
      'Conectá esta implementación con las dos familias que acabamos de presentar.',
      'Ejecutá: el caso de 17 mata inmediatamente esta simplificación.',
    ],
    claims: [
      'Una reducción viva puede indicar código redundante, no solamente un test faltante.',
    ],
  },
  {
    index: '16',
    section: 'Oracle Problem',
    minutes: 1.5,
    visual: 'oracle',
    title: 'Distinguir comportamientos no alcanza para elegir el correcto',
    copy: 'Un mutante vivo dice que la suite actual no distingue dos programas. El Oracle Problem aparece después: aun cuando encontramos un input que los separa, mutation testing no sabe cuál resultado representa el requerimiento.',
    annotation:
      'Encontrar una diferencia es un problema técnico. Decidir cuál comportamiento es correcto exige una fuente de verdad.',
    presenter: [
      'Separá dos preguntas: “¿existe un input que distingue?” y “¿qué salida debería producir?”.',
      'Usá risk_score = 742: >= envía el pago a revisión manual y > lo aprueba. Sin conocer la política de riesgo, ninguna salida es obviamente correcta.',
      'Nombrá posibles oráculos: tests, especificaciones, documentación, requerimientos y conocimiento del dominio.',
    ],
    claims: [
      'Alive significa que la suite no distingue; no significa automáticamente que falte un test.',
      'Mutation testing encuentra una pregunta, pero no inventa el requerimiento que la responde.',
    ],
  },
  {
    index: '17',
    section: 'Oracle contextual',
    minutes: 1.5,
    visual: 'contextual-oracle',
    title: 'Los LLMs pueden construir un oracle contextual',
    copy: 'Con acceso al repositorio y al contexto de la empresa, un LLM puede reunir evidencia dispersa. Si la política dice “risk_score de 742 o más requiere revisión manual”, puede justificar >=, señalar que > viola la regla y proponer el caso de borde.',
    annotation:
      'No resuelven formalmente el Oracle Problem; reducen muchísimo su impacto práctico cuando existe una fuente de verdad recuperable.',
    presenter: [
      'Mostrá que el valor no viene del modelo aislado, sino del modelo conectado a evidencia trazable.',
      'Enumerá las fuentes: código, tests, Jira o Linear, PRs, discusiones, documentación y convenciones del dominio.',
      'Marcá el límite: si la verdad no existe, está desactualizada o se contradice, el LLM tampoco puede fabricarla.',
    ],
    claims: [
      'El LLM reduce el trabajo de búsqueda, síntesis y propuesta del test.',
      'La evidencia debe acompañar la recomendación para que una persona pueda revisarla.',
    ],
  },
  {
    index: '18',
    section: 'Equivalent mutants',
    minutes: 1.5,
    visual: 'equivalent',
    title: 'Si ningún input observa la diferencia, el mutante es equivalente',
    copy: 'Este problema es distinto del Oracle Problem: no hay un caso faltante que pueda separar original y mutante. En una herramienta orientada a semantic simplification, esa supervivencia tiene valor: revela comportamiento irrelevante que podemos eliminar.',
    annotation:
      'Si la simplificación conserva toda conducta observable, aceptar el mutante mejora el programa original.',
    presenter: [
      'Contrastá con >= → >: risk_score = 742 prueba que esos programas no son equivalentes.',
      'Usá i + 1 + 0 → i + 1: quitar + 0 no cambia ningún resultado observable.',
      'Explicá la filosofía: un buen operador no debería producir ruido; si una simplificación es equivalente, se acepta el cambio.',
    ],
    claims: [
      'Un mutante equivalente no puede ser matado por ningún test basado en comportamiento observable.',
      'En semantic simplification, equivalencia puede ser una oportunidad de borrar código, no un falso positivo.',
    ],
  },
  {
    index: '19',
    section: 'Coste y optimización',
    minutes: 2,
    visual: 'cost',
    title:
      'La primera optimización es ejecutar menos experimentos, pero mejores',
    copy: 'Cada subject abre nuevos experimentos. Antes de escalar infraestructura, conviene reducir el espacio: código cambiado, zonas de alto riesgo, operadores valiosos y tests relevantes.',
    annotation:
      'Buen candidato = una regresión cuesta + la suite es confiable + podemos acotar el alcance.',
    presenter: [
      'Conectá las tres áreas del libro: generación, ejecución y análisis humano.',
      'Empezá por los subjects: código cambiado, autorización, tenancy, dinero, límites y otras reglas donde fallar cuesta.',
      'Priorizá incremental mutation y alcance por riesgo; después selección de tests, paralelismo y sampling.',
      'Recordá que un wait lento o una suite flaky se multiplica por cientos de mutantes.',
      'Ubicá al LLM en triage y recuperación de contexto, no como reemplazo silencioso del oracle.',
    ],
    claims: [
      'Seleccionar subjects por cambio y criticidad reduce el coste antes de crear el primer mutante.',
      'Acotar por cambio y riesgo suele ahorrar más que correr indiscriminadamente en más máquinas.',
      'Optimizar la suite base es requisito previo: cada ineficiencia se multiplica por mutante.',
    ],
  },
  {
    index: '20',
    section: 'Más allá del unit test',
    minutes: 1.5,
    visual: 'transfer',
    title: 'Mutant es un mecanismo que podemos tomar prestado',
    copy: 'La idea no depende de un método Ruby: alterar deliberadamente una parte del sistema, ejecutar una observación y comprobar si alguien nota el cambio. Podemos aplicar semantic reduction sobre una aplicación completa y usar tests funcionales o E2E como detector.',
    annotation:
      'Si quitamos un comportamiento relevante y el recorrido E2E sigue verde, el test comprobaba actividad, no necesariamente el resultado del negocio.',
    presenter: [
      'Generalizá el ciclo que acabamos de construir: transformar, ejecutar en aislamiento y observar el veredicto.',
      'Dá ejemplos de semantic reduction a nivel aplicación: omitir una validación, no persistir un cambio, suprimir una autorización o saltar una llamada externa.',
      'Ejemplo: el checkout muestra “Compra confirmada”, pero mutamos el sistema para no crear la orden. El E2E debería fallar verificando el resultado persistido.',
      'Conectalo con Chaos Monkey: en vez de mutar el AST, termina una instancia o degrada infraestructura para comprobar una propiedad de resiliencia.',
      'Aclarar que el coste sube: necesitamos aislamiento de datos, restauración confiable y selección inteligente de recorridos.',
    ],
    claims: [
      'Mutation testing es un protocolo experimental, no solamente una herramienta para unit tests.',
      'Semantic reduction permite preguntar qué resultados de negocio observan realmente los tests E2E.',
      'Chaos engineering reutiliza el mismo patrón sobre infraestructura y propiedades de resiliencia.',
    ],
  },
  {
    index: '21',
    section: 'Reflexión',
    minutes: 3,
    visual: 'reflection',
    title: 'Si la IA escribe más código, la escasez no será escribir',
    copy: 'El lugar interesante puede estar un nivel más arriba: herramientas que verifican, restringen y explican código generado. Mutation testing, complejidad, análisis estático y contraejemplos convierten velocidad en confianza calibrada.',
    annotation:
      'Menos automatización que produce código sin verificar. Más metacódigo que nos ayuda a decidir si ese código merece confianza.',
    presenter: [
      'Volvé a la pregunta inicial: vale la pena cuando la decisión importa más que el coste de comprobarla.',
      'Terminá invitando al público a nombrar una herramienta de verificación que les falta hoy.',
    ],
    claims: [
      'La generación de código eleva el valor de la verificación.',
      'La siguiente capa interesante de herramientas puede ser la que prueba el output de la anterior.',
    ],
  },
];

const sources = [
  {
    category: 'Mutant: conceptos y uso',
    description:
      'La documentación primaria para profundizar en el vocabulario y el flujo de la herramienta.',
    links: [
      [
        'Mutant — README',
        'Punto de partida: concepto, instalación y filosofía.',
        'https://github.com/mbj/mutant',
      ],
      [
        'Nomenclature',
        'Subject, mutation operator, mutation, kill y otros términos de la charla.',
        'https://github.com/mbj/mutant/blob/main/docs/nomenclature.md',
      ],
      [
        'Rails Integration',
        'Discovery, eager loading e isolation en aplicaciones Rails.',
        'https://github.com/mbj/mutant/blob/main/docs/rails.md',
      ],
      [
        'Incremental mode',
        'Qué selecciona `--since` y qué deja afuera.',
        'https://github.com/mbj/mutant/blob/main/docs/incremental.md',
      ],
      [
        'Reading reports',
        'Cómo leer y priorizar los resultados de una corrida.',
        'https://github.com/mbj/mutant/blob/main/docs/reading-reports.md',
      ],
    ],
  },
  {
    category: 'Evidencia y corpus',
    description:
      'Referencias para discutir el valor y los límites de mutation testing más allá de una demo.',
    links: [
      [
        'Real World Rails',
        'Corpus de checkouts de aplicaciones Rails para el piloto de la charla.',
        'https://github.com/eliotsykes/real-world-rails',
      ],
      [
        'Just et al. — real faults',
        'Trabajo sobre la relación entre mutantes y fallas reales.',
        'https://homes.cs.washington.edu/~rjust/publ/mutants_real_faults_tr_2014.pdf',
      ],
      [
        'Google Research — long-term effects',
        'Estudio sobre efectos a largo plazo de mutation testing en desarrollo.',
        'https://research.google/pubs/long-term-effects-of-mutation-testing/',
      ],
    ],
  },
];

const formatDuration = (minutes: number) =>
  Number.isInteger(minutes)
    ? `${minutes} min`
    : `${Math.floor(minutes)} min 30 s`;
const formatElapsed = (minutes: number) =>
  `${Math.floor(minutes)}:${minutes % 1 === 0 ? '00' : '30'}`;

const rubyToken =
  /(#.*$|'[^']*'|"[^"\n]*"|\b(?:def|end|class|module|if|else|elsif|unless|do|case|when|return)\b|\b(?:true|false|nil)\b|:\w+|\b\d+\b|\b[a-z_]\w*[!?]?(?=\())/gm;

function RubyCode({ code, dark = false }: { code: string; dark?: boolean }) {
  return code
    .replace(/^\+/gm, '')
    .split(rubyToken)
    .map((token, index) => {
      if (!token) return null;
      let color = dark ? 'text-[#f8eeea]' : 'text-[#42191f]';
      if (token.startsWith('#'))
        color = dark ? 'text-[#9f8f92] italic' : 'text-[#9a7073] italic';
      else if (/^['"]/.test(token))
        color = dark ? 'text-[#ffb86c]' : 'text-[#a44a00]';
      else if (
        /^(def|end|class|module|if|else|elsif|unless|do|case|when|return)$/.test(
          token,
        )
      )
        color = dark
          ? 'text-[#ff6b81] font-semibold'
          : 'text-[#9c1f31] font-semibold';
      else if (/^(true|false|nil)$/.test(token))
        color = dark
          ? 'text-[#c792ea] font-semibold'
          : 'text-[#6b3d7a] font-semibold';
      else if (/^:\w+$/.test(token))
        color = dark ? 'text-[#f78c6c]' : 'text-[#b04b5f]';
      else if (/^\d+$/.test(token))
        color = dark ? 'text-[#f9c784]' : 'text-[#805246]';
      else if (/^[a-z_]\w*[!?]?$/.test(token))
        color = dark ? 'text-[#82aaff]' : 'text-[#6b3d7a]';
      return (
        <span className={color} key={`${token}-${index}`}>
          {token}
        </span>
      );
    });
}

type LabFile = { name: string; code: string };

const architectureFiles: LabFile[] = [
  { name: 'mini_mutant/subject.rb', code: subjectSource },
  { name: 'mini_mutant/source_file.rb', code: sourceFileSource },
  { name: 'mini_mutant/method_finder.rb', code: methodFinderSource },
  { name: 'mini_mutant/mutation.rb', code: mutationSource },
  {
    name: 'mini_mutant/operator_replacement.rb',
    code: operatorReplacementSource,
  },
  { name: 'mini_mutant/deparser.rb', code: deparserSource },
  { name: 'mini_mutant/inserter.rb', code: inserterSource },
  { name: 'mini_mutant/runner.rb', code: runnerSource },
  {
    name: 'mini_mutant/semantic_simplification.rb',
    code: semanticSimplificationSource,
  },
];

const architectureDepth: Record<Exclude<ImperativeStep, 'contract'>, number> = {
  location: 1,
  source: 2,
  ast: 3,
  point: 4,
  replacement: 5,
  patch: 6,
  insertion: 7,
  verdict: 8,
  simplification: 9,
};

function labFilesFor(step: ImperativeStep, initialCode: string): LabFile[] {
  if (step === 'contract') {
    return [
      { name: 'citizen.rb', code: calculatorSource.trimEnd() },
      { name: 'citizen_test.rb', code: citizenTestSource },
    ];
  }

  const stepNumber = String(
    Object.keys(runnableSteps).indexOf(step) + 1,
  ).padStart(2, '0');
  return [
    { name: 'citizen.rb', code: calculatorSource.trimEnd() },
    { name: 'citizen_test.rb', code: citizenTestSource },
    ...architectureFiles.slice(0, architectureDepth[step]),
    { name: `step_${stepNumber}.rb`, code: initialCode },
  ];
}

function defaultLabFile(step: ImperativeStep) {
  if (step === 'contract') return 'citizen.rb';
  const defaults: Record<Exclude<ImperativeStep, 'contract'>, string> = {
    location: 'mini_mutant/subject.rb',
    source: 'mini_mutant/source_file.rb',
    ast: 'mini_mutant/method_finder.rb',
    point: 'mini_mutant/mutation.rb',
    replacement: 'mini_mutant/operator_replacement.rb',
    patch: 'mini_mutant/deparser.rb',
    insertion: 'mini_mutant/inserter.rb',
    verdict: 'citizen_test.rb',
    simplification: 'mini_mutant/semantic_simplification.rb',
  };
  return defaults[step];
}

const rubyString = (value: string) =>
  JSON.stringify(value).replaceAll('#{', '\\#{');

function RubyEditor({
  code,
  onChange,
  tall = false,
}: {
  code: string;
  onChange: (value: string) => void;
  tall?: boolean;
}) {
  const preview = useRef<HTMLPreElement | null>(null);
  const height = tall ? 'min-h-[430px]' : 'min-h-[320px]';

  return (
    <div className={`relative overflow-hidden bg-[#20181a] ${height}`}>
      <pre
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap p-4 font-mono text-[13px] leading-6 text-[#f8eeea]"
      >
        <RubyCode code={`${code}\n`} dark />
      </pre>
      <textarea
        aria-label="Código Ruby ejecutable"
        className={`relative z-10 w-full resize-y bg-transparent p-4 font-mono text-[13px] leading-6 text-transparent caret-[#fffaf6] outline-none selection:bg-[#9c1f31]/55 ${height}`}
        onChange={(event) => onChange(event.target.value)}
        onScroll={(event) => {
          if (!preview.current) return;
          preview.current.scrollTop = event.currentTarget.scrollTop;
          preview.current.scrollLeft = event.currentTarget.scrollLeft;
        }}
        spellCheck={false}
        style={{ WebkitTextFillColor: 'transparent', tabSize: 2 }}
        value={code}
      />
    </div>
  );
}

function RubyLab({
  initialCode,
  step,
  tall = false,
  onAst,
}: {
  initialCode: string;
  step: ImperativeStep;
  tall?: boolean;
  onAst?: (root: AstNodeData | null) => void;
}) {
  const initialFiles = labFilesFor(step, initialCode);
  const [files, setFiles] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialFiles.map((file) => [file.name, file.code])),
  );
  const [activeFile, setActiveFile] = useState(defaultLabFile(step));
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'running' | 'error' | 'done'
  >('idle');
  const [output, setOutput] = useState('');
  const wasmModule = useRef<WebAssembly.Module | null>(null);
  const stdout = useRef('');

  const run = async () => {
    setStatus(wasmModule.current ? 'running' : 'loading');
    setOutput('');
    stdout.current = '';

    try {
      const runtime = (await import(
        /* @vite-ignore */ RUBY_WASM_API
      )) as BrowserRubyRuntime;
      if (!wasmModule.current) {
        const response = await fetch(RUBY_WASM_BINARY);
        if (!response.ok)
          throw new Error(`No se pudo descargar Ruby (${response.status})`);
        try {
          wasmModule.current = await WebAssembly.compileStreaming(response);
        } catch {
          wasmModule.current = await WebAssembly.compile(
            await response.arrayBuffer(),
          );
        }
      }

      setStatus('running');
      const { vm } = await runtime.DefaultRubyVM(wasmModule.current, {
        consolePrint: {
          stdout: (line) => {
            stdout.current += line;
          },
          stderr: (line) => {
            stdout.current += line;
          },
        },
      });
      for (const [name, code] of Object.entries(files)) {
        vm.eval(`require "fileutils"
FileUtils.mkdir_p(File.dirname(${rubyString(name)}))
File.write(${rubyString(name)}, ${rubyString(code)})`);
      }

      const runnerName =
        step === 'contract' ? 'citizen_test.rb' : initialFiles.at(-1)?.name;
      const runner = runnerName ? files[runnerName] : '';
      let returned = '';
      if (runner) {
        const result = vm.eval(`begin
${runner}
rescue Exception => error
  "ERROR in ${runnerName}: #{error.class}: #{error.message}"
end`);
        returned = result.toString();
      }
      if (returned.startsWith('__AST__')) {
        const root = JSON.parse(
          returned.slice('__AST__'.length),
        ) as AstNodeData;
        onAst?.(root);
        const count = (node: AstNodeData): number =>
          1 + node.children.reduce((total, child) => total + count(child), 0);
        returned = `AST real recibido · ${count(root)} nodos`;
      }
      setOutput([stdout.current.trim(), returned].filter(Boolean).join('\n'));
      setStatus('done');
    } catch (error) {
      setOutput(
        error instanceof Error ? error.message : 'Ruby no pudo iniciar.',
      );
      setStatus('error');
    }
  };

  const label =
    status === 'loading'
      ? 'Cargando Ruby 3.3…'
      : status === 'running'
        ? 'Ejecutando…'
        : 'Ejecutar Ruby';

  const restore = () => {
    const restored = labFilesFor(step, initialCode);
    setFiles(
      Object.fromEntries(restored.map((file) => [file.name, file.code])),
    );
    setActiveFile(defaultLabFile(step));
    setOutput('');
    setStatus('idle');
    onAst?.(null);
  };

  return (
    <section className="overflow-hidden border border-[#6c2330]/25 bg-[#fffdfb] shadow-[0_14px_38px_rgba(91,30,42,.09)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6c2330]/20 bg-[#f8eeea] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#9c1f31]" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[#42191f]">
            MiniMutant workspace
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={restore}>
            Restaurar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={status === 'loading' || status === 'running'}
            onClick={run}
          >
            <Code2 /> {label}
          </Button>
        </div>
      </div>
      <div className="grid md:grid-cols-[150px_minmax(0,1fr)]">
        <aside className="border-b border-[#6c2330]/20 bg-[#2a171a] p-3 text-[#fffaf6] md:border-b-0 md:border-r">
          <p className="mb-2 px-2 font-mono text-[9px] font-bold uppercase tracking-[.14em] text-[#fffaf6]/45">
            Archivos
          </p>
          <div className="flex gap-1 md:block">
            {Object.keys(files).map((name) => (
              <button
                key={name}
                onClick={() => setActiveFile(name)}
                className={`block w-full px-2 py-2 text-left font-mono text-[11px] transition ${activeFile === name ? 'bg-[#9c1f31] text-[#fffaf6]' : 'text-[#fffaf6]/65 hover:bg-white/10 hover:text-[#fffaf6]'}`}
              >
                {name}
              </button>
            ))}
          </div>
        </aside>
        <div className="min-w-0">
          <div className="border-b border-white/10 bg-[#352729] px-4 py-2 font-mono text-[11px] text-[#fffaf6]/70">
            {activeFile}
          </div>
          <RubyEditor
            code={files[activeFile]}
            onChange={(value) =>
              setFiles((current) => ({ ...current, [activeFile]: value }))
            }
            tall={tall}
          />
        </div>
      </div>
      <div
        aria-live="polite"
        className={`border-t border-[#6c2330]/20 px-4 py-3 font-mono text-xs leading-5 ${status === 'error' ? 'bg-[#fff0ef] text-[#9c1f31]' : 'bg-[#f7f0f8] text-[#42191f]'}`}
      >
        <span className="font-bold uppercase tracking-[.12em] text-[#75555a]">
          Salida
        </span>
        <pre className="mt-1 whitespace-pre-wrap">
          {output || 'Todavía no se ejecutó.'}
        </pre>
      </div>
    </section>
  );
}

function SlideHeading({
  slide,
  compact = false,
}: {
  slide: Slide;
  compact?: boolean;
}) {
  return (
    <div>
      <h1
        className={`max-w-4xl font-semibold tracking-[-.055em] text-[#2a171a] ${compact ? 'text-4xl sm:text-5xl' : 'text-4xl sm:text-6xl lg:text-7xl'}`}
      >
        {slide.title}
      </h1>
      {slide.copy && (
        <p
          className={`mt-6 max-w-3xl leading-relaxed text-[#75555a] ${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}
        >
          {slide.copy}
        </p>
      )}
    </div>
  );
}

const welcomeTitles = [
  {
    eyebrow: 'Título enviado',
    title: 'Mutant Testing en Ruby: ¿vale la pena?',
    hint: 'Click para corregir Mutant → Mutation',
  },
  {
    eyebrow: 'Primera corrección',
    title: 'Mutation Testing en Ruby: ¿vale la pena?',
    hint: 'Una corrección más…',
  },
  {
    eyebrow: 'Ahora sí, en español',
    title: 'Pruebas de mutación en Ruby: ¿valen la pena?',
    hint: 'Gracias por la sugerencia, Ruby Sur.',
  },
];

function WelcomeTitle() {
  const [titleStep, setTitleStep] = useState(0);
  const currentTitle = welcomeTitles[titleStep];
  const advanceTitle = () =>
    setTitleStep((current) => Math.min(current + 1, welcomeTitles.length - 1));

  return (
    <div className="group max-w-3xl">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[.15em] text-[#9c1f31]">
        {currentTitle.eyebrow}
      </span>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-.055em] text-[#2a171a] sm:text-6xl lg:text-7xl">
        <button className="text-left" onClick={advanceTitle} type="button">
          {currentTitle.title}
        </button>
      </h1>
      <span className="mt-5 flex items-center gap-2 text-xs text-[#75555a] transition group-hover:text-[#9c1f31]">
        <CircleDot className="size-3" /> {currentTitle.hint}
      </span>
    </div>
  );
}

function AstBranch({
  node,
  root = false,
}: {
  node: AstNodeData;
  root?: boolean;
}) {
  const highlighted = node.type === 'CallNode';

  return (
    <div className={root ? '' : 'relative ml-5 border-l border-white/20 pl-6'}>
      {!root && (
        <span className="absolute -left-px top-5 w-6 border-t border-white/20" />
      )}
      <div
        className={`flex min-h-9 items-center gap-3 border px-3 py-2 font-mono text-xs ${highlighted ? 'border-[#ff6b81] bg-[#9c1f31]/25' : 'border-white/10 bg-white/[.03]'}`}
      >
        <span
          className={
            highlighted ? 'font-bold text-[#ff8b9a]' : 'text-[#82aaff]'
          }
        >
          {node.type}
        </span>
        {node.detail && (
          <span className="ml-auto text-[#f9c784]">{node.detail}</span>
        )}
      </div>
      {node.children.length > 0 && (
        <div className="pt-1">
          {node.children.map((child, index) => (
            <AstBranch
              node={child}
              key={`${child.type}-${child.detail}-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AstTree({
  root,
  title = 'Prism AST · Citizen#adult?',
}: {
  root: AstNodeData | null;
  title?: string;
}) {
  return (
    <div className="h-full min-h-[540px] border border-[#6c2330]/25 bg-[#20181a] p-5 text-[#fffaf6] shadow-[0_14px_38px_rgba(91,30,42,.09)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[#ff8b9a]">
          {title}
        </p>
        <span className="font-mono text-[10px] text-white/40">
          {root ? 'respuesta de Prism' : 'esperando ejecución'}
        </span>
      </div>
      <div className="mt-5">
        {root ? (
          <AstBranch node={root} root />
        ) : (
          <div className="grid min-h-[360px] place-items-center border border-dashed border-white/15 p-8 text-center">
            <div>
              <Code2 className="mx-auto size-6 text-[#ff8b9a]" />
              <p className="mt-4 font-mono text-sm text-white/75">
                Ejecutá Ruby para construir el árbol
              </p>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-white/45">
                La jerarquía se dibuja desde el JSON devuelto por Prism, no
                desde una lista escrita en React.
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 border-l-2 border-[#ff6b81] pl-3">
        <p className="font-mono text-xs text-[#fffaf6]">
          El operador vive en{' '}
          <span className="text-[#ff8b9a]">CallNode#name</span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-white/55">
          Ese nodo puede copiarse con otro nombre y propagarse hasta reconstruir
          el DefNode completo.
        </p>
      </div>
    </div>
  );
}

function MiniMutantSlide({
  slide,
}: {
  slide: Slide & { step: ImperativeStep };
}) {
  const [astRoot, setAstRoot] = useState<AstNodeData | null>(null);
  const lab = (
    <RubyLab
      initialCode={runnableSteps[slide.step]}
      step={slide.step}
      key={slide.index}
    />
  );

  if (slide.step === 'contract') {
    return (
      <div className="grid gap-8 lg:grid-cols-[.3fr_1.7fr] lg:items-start xl:gap-14">
        <SlideHeading slide={slide} />
        {lab}
      </div>
    );
  }

  if (slide.step === 'location') {
    return (
      <div className="grid gap-8 lg:grid-cols-[.6fr_1.4fr] lg:items-start xl:gap-12">
        <SlideHeading slide={slide} />
        {lab}
      </div>
    );
  }

  if (slide.step === 'source') {
    return (
      <div>
        <div className="mb-8">
          <SlideHeading slide={slide} compact />
        </div>
        <RubyLab
          initialCode={runnableSteps[slide.step]}
          step={slide.step}
          tall
          key={slide.index}
        />
      </div>
    );
  }

  if (slide.step === 'ast') {
    return (
      <div>
        <div className="mb-8">
          <SlideHeading slide={slide} compact />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
          <RubyLab
            initialCode={runnableSteps[slide.step]}
            step={slide.step}
            tall
            onAst={setAstRoot}
            key={slide.index}
          />
          <AstTree root={astRoot} />
        </div>
      </div>
    );
  }

  if (slide.step === 'replacement') {
    return (
      <div>
        <div className="mb-8">
          <SlideHeading slide={slide} compact />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
          <RubyLab
            initialCode={runnableSteps[slide.step]}
            step={slide.step}
            tall
            onAst={setAstRoot}
            key={slide.index}
          />
          <AstTree root={astRoot} title="Prism AST · mutado" />
        </div>
      </div>
    );
  }

  if (
    slide.step === 'patch' ||
    slide.step === 'verdict' ||
    slide.step === 'simplification'
  ) {
    return (
      <div>
        <div className="mb-8">
          <SlideHeading slide={slide} compact />
        </div>
        {lab}
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:items-start xl:gap-12">
      <SlideHeading slide={slide} />
      {lab}
    </div>
  );
}

type SphereDot = {
  x: number;
  y: number;
  depth: number;
};

function buildSphereDots(
  count: number,
  radius: number,
  rotation: number,
): SphereDot[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const tilt = -0.24;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);

  return Array.from({ length: count }, (_, index) => {
    const vertical = 1 - (2 * (index + 0.5)) / count;
    const ringRadius = Math.sqrt(1 - vertical * vertical);
    const angle = index * goldenAngle + rotation;
    const x = Math.cos(angle) * ringRadius;
    const rawDepth = Math.sin(angle) * ringRadius;
    const y = vertical * cosTilt - rawDepth * sinTilt;
    const depth = vertical * sinTilt + rawDepth * cosTilt;

    return {
      x: 300 + x * radius,
      y: 190 + y * radius,
      depth: (depth + 1) / 2,
    };
  }).sort((first, second) => first.depth - second.depth);
}

const rubyUniverseDots = buildSphereDots(760, 174, 0.2);
const suiteUniverseDots = buildSphereDots(430, 121, 1.1);
const requirementUniverseDots = buildSphereDots(180, 68, 2.2);

function PointCloudSphere({
  dots,
  color,
  minOpacity,
  maxOpacity,
  dotScale,
}: {
  dots: SphereDot[];
  color: string;
  minOpacity: number;
  maxOpacity: number;
  dotScale: number;
}) {
  return (
    <g fill={color}>
      {dots.map((dot, index) => (
        <circle
          cx={dot.x}
          cy={dot.y}
          key={index}
          opacity={minOpacity + dot.depth * (maxOpacity - minOpacity)}
          r={dotScale * (0.45 + dot.depth * 0.8)}
        />
      ))}
    </g>
  );
}

function Diagram({ visual }: { visual: Visual }) {
  const card =
    'border border-[#6c2330]/20 bg-[#fffdfb] p-4 shadow-[0_10px_30px_rgba(91,30,42,.06)]';
  const label =
    'font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#9c1f31]';

  if (visual === 'welcome')
    return (
      <div className="grid min-h-[430px] place-items-center">
        <div>
          <div className="relative mx-auto size-40 overflow-hidden rounded-full border-[6px] border-[#fffdfb] shadow-[0_22px_55px_rgba(91,30,42,.2)] ring-1 ring-[#9c1f31]/20 sm:size-48">
            <Image
              src="/presenter.jpg"
              alt="Retrato del presentador"
              fill
              priority
              sizes="192px"
              className="scale-[1.65] object-cover object-[36%_40%]"
            />
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a
              aria-label="Visitar Ruby Sur"
              className="grid h-16 w-40 place-items-center border border-[#6c2330]/15 bg-white px-4 shadow-[0_8px_24px_rgba(91,30,42,.06)] transition hover:-translate-y-0.5 hover:border-[#9c1f31]"
              href="https://ruby.com.ar/"
              rel="noreferrer"
              target="_blank"
            >
              <Image
                src="/ruby-sur.svg"
                alt="Ruby Sur"
                width={140}
                height={44}
                unoptimized
                className="h-10 w-full object-contain"
              />
            </a>
            <a
              aria-label="Visitar Sinaptia"
              className="grid h-16 w-40 place-items-center border border-[#6c2330]/15 bg-white px-4 shadow-[0_8px_24px_rgba(91,30,42,.06)] transition hover:-translate-y-0.5 hover:border-[#00b7a1]"
              href="https://sinaptia.dev/"
              rel="noreferrer"
              target="_blank"
            >
              <Image
                src="/sinaptia.svg"
                alt="Sinaptia"
                width={140}
                height={44}
                unoptimized
                className="h-10 w-full object-contain"
              />
            </a>
          </div>
        </div>
      </div>
    );

  if (visual === 'survey') {
    const familiarity = [
      { label: 'Lo escuchó nombrar', value: 6, color: '#9c1f31' },
      { label: 'Nada', value: 3, color: '#6b3d7a' },
      { label: 'Un poco', value: 2, color: '#c87884' },
    ];

    return (
      <div className="overflow-hidden border border-[#6c2330]/20 bg-[#fffdfb] shadow-[0_18px_50px_rgba(91,30,42,.09)]">
        <div className="grid grid-cols-2 border-b border-[#6c2330]/15">
          <div className="border-r border-[#6c2330]/15 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[.14em] text-[#75555a]">
              Uso real
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-[-.05em] text-[#9c1f31]">
              9<span className="text-xl text-[#75555a]">/11</span>
            </p>
            <p className="mt-1 text-sm font-semibold">nunca lo usaron</p>
          </div>
          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-[.14em] text-[#75555a]">
              Familiaridad
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-[-.05em] text-[#6b3d7a]">
              9<span className="text-xl text-[#75555a]">/11</span>
            </p>
            <p className="mt-1 text-sm font-semibold">poca o ninguna</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className={label}>¿Cuánto conocían la técnica?</p>
            <span className="font-mono text-[10px] text-[#75555a]">n = 11</span>
          </div>
          <div className="mt-4 space-y-3">
            {familiarity.map((item) => (
              <div
                className="grid grid-cols-[145px_1fr_24px] items-center gap-3"
                key={item.label}
              >
                <span className="text-xs text-[#75555a]">{item.label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-[#f1e5e2]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: item.color,
                      width: `${(item.value / 11) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-right font-mono text-xs font-semibold">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <div className="border border-[#6c2330]/15 bg-[#fffaf6] px-3 py-2.5">
              <span className="font-mono text-xs font-bold text-[#9c1f31]">
                5
              </span>
              <span className="ml-2 text-xs">no lo conocían</span>
            </div>
            <div className="border border-[#6c2330]/15 bg-[#fffaf6] px-3 py-2.5">
              <span className="font-mono text-xs font-bold text-[#9c1f31]">
                4
              </span>
              <span className="ml-2 text-xs">sin tiempo o prioridad</span>
            </div>
          </div>
        </div>
        <div className="grid gap-px border-t border-[#6c2330]/15 bg-[#6c2330]/10 sm:grid-cols-2">
          <blockquote className="bg-[#f8eeea] px-4 py-3 text-xs font-semibold text-[#42191f]">
            “¿No es Mutation Testing?”
          </blockquote>
          <blockquote className="bg-[#f8eeea] px-4 py-3 text-xs font-semibold text-[#42191f]">
            “Los llamaría tests de mutación”
          </blockquote>
        </div>
        <p className="border-t border-[#6c2330]/15 px-5 py-2 font-mono text-[9px] text-[#75555a]">
          Encuesta previa Ruby Sur · 18–22 sep 2026
        </p>
      </div>
    );
  }

  if (visual === 'architecture') {
    const stages = [
      {
        number: '01',
        eyebrow: 'DISCOVER',
        label: 'Encontrar el subject',
        result: 'DefNode',
        items: ['Subject', 'SourceFile', 'MethodFinder'],
        accent: '#82aaff',
      },
      {
        number: '02',
        eyebrow: 'TRANSFORM',
        label: 'Construir la alternativa',
        result: 'Mutation(AST)',
        items: ['MutationPoint', 'OperatorReplacement', 'Mutation'],
        accent: '#c792ea',
      },
      {
        number: '03',
        eyebrow: 'VERIFY',
        label: 'Pedirle evidencia a la suite',
        result: 'alive / killed',
        items: ['Deparser', 'Inserter', 'Runner'],
        accent: '#ff8b9a',
      },
    ];

    return (
      <div className="overflow-hidden border border-[#6c2330]/25 bg-[#20181a] text-[#fffaf6] shadow-[0_22px_60px_rgba(42,23,26,.2)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#2c2023] px-5 py-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-[#ff8b9a]">
              MiniMutant / system map
            </p>
            <p className="mt-1 text-xs text-white/45">
              Un experimento estructural, tres responsabilidades
            </p>
          </div>
          <span className="flex items-center gap-2 font-mono text-[10px] text-white/45">
            <span className="size-1.5 rounded-full bg-[#63d79b] shadow-[0_0_12px_#63d79b]" />
            Ruby → AST → evidencia
          </span>
        </div>
        <div className="grid min-h-[430px] grid-cols-1 gap-3 p-5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch">
          {stages.map((stage, stageIndex) => (
            <div className="contents" key={stage.number}>
              {stageIndex > 0 && (
                <div className="hidden items-center sm:flex">
                  <div className="grid size-8 place-items-center rounded-full border border-white/15 bg-white/[.04]">
                    <ArrowRight className="size-4 text-white/55" />
                  </div>
                </div>
              )}
              <div className="relative flex flex-col border border-white/10 bg-white/[.035] p-4">
                <div
                  className="absolute inset-x-0 top-0 h-0.5"
                  style={{ backgroundColor: stage.accent }}
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="font-mono text-[9px] font-semibold tracking-[.16em]"
                      style={{ color: stage.accent }}
                    >
                      {stage.eyebrow}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-snug">
                      {stage.label}
                    </p>
                  </div>
                  <span className="font-mono text-3xl font-light text-white/12">
                    {stage.number}
                  </span>
                </div>
                <div className="my-5 h-px bg-white/10" />
                <div className="flex-1 space-y-2">
                  {stage.items.map((item, itemIndex) => (
                    <div className="relative" key={item}>
                      {itemIndex > 0 && (
                        <div className="absolute -top-2 left-3 h-2 w-px bg-white/15" />
                      )}
                      <div className="flex items-center gap-2 border border-white/10 bg-[#171113] px-3 py-2.5 font-mono text-[10px] text-white/75">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: stage.accent }}
                        />
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="font-mono text-[8px] uppercase tracking-[.15em] text-white/35">
                    output
                  </p>
                  <p
                    className="mt-2 font-mono text-xs font-semibold"
                    style={{ color: stage.accent }}
                  >
                    {stage.result}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 border-t border-white/10 bg-[#171113] px-5 py-3 text-center font-mono text-[9px] uppercase tracking-[.12em] text-white/35">
          <span>runtime</span>
          <span>estructura</span>
          <span>comportamiento</span>
        </div>
      </div>
    );
  }

  if (visual === 'imperative') return null;

  if (visual === 'decision')
    return (
      <div className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-[#9c1f31] bg-[#9c1f31] p-5 text-[#fffaf6]">
            <p className="font-mono text-[10px] uppercase tracking-[.14em] text-white/70">
              Semantic Reduction
            </p>
            <p className="mt-3 text-xl font-semibold">Quitar comportamiento</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              ¿Esta complejidad realmente hace falta?
            </p>
            <div className="mt-5 border border-white/20 bg-black/10 px-3 py-2 font-mono text-xs">
              <span className="text-white/55">premium? &amp;&amp; active?</span>
              <span className="mx-2 text-white/45">→</span>
              <span className="font-semibold">premium?</span>
            </div>
          </div>
          <div className="border border-[#6b3d7a] bg-[#6b3d7a] p-5 text-[#fffaf6]">
            <p className="font-mono text-[10px] uppercase tracking-[.14em] text-white/70">
              Orthogonal Replacement
            </p>
            <p className="mt-3 text-xl font-semibold">Cambiar una decisión</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              ¿La suite distingue esta alternativa?
            </p>
            <div className="mt-5 border border-white/20 bg-black/10 px-3 py-2 font-mono text-xs">
              <span className="text-white/55">age &gt;= 18</span>
              <span className="mx-2 text-white/45">→</span>
              <span className="font-semibold">age &gt; 18</span>
            </div>
          </div>
        </div>
        <div
          className={`${card} grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center`}
        >
          <div>
            <p className={label}>Si la reducción sobrevive</p>
            <p className="mt-2 text-base font-semibold">
              aceptar la simplificación
            </p>
          </div>
          <span className="text-[#9c1f31]">→</span>
          <div>
            <p className={label}>Si el reemplazo sobrevive</p>
            <p className="mt-2 text-base font-semibold text-[#9c1f31]">
              consultar el oracle
            </p>
          </div>
        </div>
      </div>
    );

  if (visual === 'spaces') {
    return (
      <div className="relative min-h-[510px] overflow-hidden border border-[#6c2330]/15 bg-transparent shadow-[0_20px_55px_rgba(91,30,42,.07)]">
        <svg
          className="absolute inset-x-0 top-0 h-[382px] w-full"
          viewBox="0 0 600 382"
        >
          <title>
            Tres espacios de programas representados como esferas de puntos
            concéntricas
          </title>
          <defs>
            <filter
              height="180%"
              id="point-glow"
              width="180%"
              x="-40%"
              y="-40%"
            >
              <feGaussianBlur result="blur" stdDeviation="1.8" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="sphere-halo">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="72%" stopColor="#6b3d7a" stopOpacity="0.015" />
              <stop offset="100%" stopColor="#6b3d7a" stopOpacity="0.09" />
            </radialGradient>
          </defs>

          <circle cx="300" cy="190" fill="url(#sphere-halo)" r="181" />
          <circle
            cx="300"
            cy="190"
            fill="none"
            opacity="0.18"
            r="175"
            stroke="#6b3d7a"
          />
          <PointCloudSphere
            color="#6657b8"
            dotScale={1.4}
            dots={rubyUniverseDots}
            maxOpacity={0.72}
            minOpacity={0.08}
          />
          <PointCloudSphere
            color="#b32443"
            dotScale={1.65}
            dots={suiteUniverseDots}
            maxOpacity={0.82}
            minOpacity={0.09}
          />
          <g filter="url(#point-glow)">
            <PointCloudSphere
              color="#d28b26"
              dotScale={1.85}
              dots={requirementUniverseDots}
              maxOpacity={0.96}
              minOpacity={0.13}
            />
          </g>
        </svg>

        <div className="absolute bottom-[72px] left-1/2 grid w-[90%] -translate-x-1/2 grid-cols-3 divide-x divide-[#6c2330]/15 border border-[#6c2330]/15 bg-[#fffaf6]/92 shadow-[0_15px_35px_rgba(91,30,42,.1)] backdrop-blur-md">
          {[
            ['#6657b8', '01 · Universo Ruby', 'programas posibles'],
            ['#b32443', '02 · Suite', 'programas aceptados'],
            ['#d28b26', '03 · Requerimientos', 'programas válidos'],
          ].map(([color, title, description]) => (
            <div className="px-4 py-3" key={title}>
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ backgroundColor: color, color }}
                />
                <p
                  className="font-mono text-[9px] uppercase tracking-[.14em]"
                  style={{ color }}
                >
                  {title}
                </p>
              </div>
              <p className="mt-1 text-xs font-semibold text-[#42191f]">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex h-[58px] items-center justify-center bg-[#42191f] px-5 text-center text-[#fffaf6]">
          <p className="text-sm font-semibold">
            <span className="mr-3 font-mono text-[10px] uppercase tracking-[.15em] text-[#f4a5b1]">
              Mutation testing
            </span>
            contrae lo que la suite acepta hacia lo que el negocio permite
          </p>
        </div>
      </div>
    );
  }

  if (visual === 'oracle')
    return (
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center">
          {[
            ['01', 'Mutante vivo'],
            ['02', 'Input diferenciador'],
            ['03', 'Resultado esperado'],
            ['?', 'Oracle Problem'],
          ].map(([number, title], index) => (
            <div className="contents" key={title}>
              {index > 0 && (
                <ArrowRight className="mx-auto size-4 text-[#9c1f31]" />
              )}
              <div
                className={`border p-3 ${index === 3 ? 'border-[#9c1f31] bg-[#9c1f31] text-white' : 'border-[#6c2330]/20 bg-[#fffdfb]'}`}
              >
                <p
                  className={`font-mono text-[10px] ${index === 3 ? 'text-white/65' : 'text-[#9c1f31]'}`}
                >
                  {number}
                </p>
                <p className="mt-2 text-xs font-semibold leading-tight">
                  {title}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div
          className={`${card} grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center`}
        >
          <div>
            <p className={label}>Original</p>
            <p className="mt-2 font-mono text-base font-semibold">
              risk_score &gt;= 742
            </p>
            <p className="mt-3 font-mono text-xs text-[#75555a]">
              742 → manual review
            </p>
          </div>
          <div className="border border-[#6c2330]/20 bg-[#fff5f4] px-3 py-2 text-center">
            <p className={label}>Input</p>
            <p className="mt-1 font-mono text-sm font-bold">742</p>
          </div>
          <div>
            <p className={label}>Mutante</p>
            <p className="mt-2 font-mono text-base font-semibold text-[#9c1f31]">
              risk_score &gt; 742
            </p>
            <p className="mt-3 font-mono text-xs text-[#75555a]">
              742 → auto approve
            </p>
          </div>
        </div>
      </div>
    );

  if (visual === 'contextual-oracle')
    return (
      <div className="space-y-4">
        <div className={card}>
          <p className={label}>Contexto recuperable</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {['Código', 'Tests', 'Jira / Linear', 'PRs', 'Docs', 'Dominio'].map(
              (source) => (
                <span
                  className="border border-[#6c2330]/15 bg-[#fffaf6] px-3 py-2 text-center font-mono text-[11px] text-[#42191f]"
                  key={source}
                >
                  {source}
                </span>
              ),
            )}
          </div>
        </div>
        <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-[#6b3d7a] text-white">
          <Sparkles className="size-4" />
        </div>
        <div className="border border-[#6b3d7a] bg-[#f7f0fa] p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#6b3d7a]">
            Oracle contextual · evidencia encontrada
          </p>
          <blockquote className="mt-4 border-l-2 border-[#6b3d7a] pl-4 text-sm font-semibold leading-relaxed text-[#42191f]">
            “Un risk_score de 742 o más requiere revisión manual.”
          </blockquote>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <span className="bg-white px-3 py-2 font-mono text-xs text-[#42191f]">
              elegir score &gt;= 742
            </span>
            <span className="bg-white px-3 py-2 font-mono text-xs text-[#42191f]">
              generar caso score = 742
            </span>
          </div>
        </div>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-[#75555a]">
          <MessageSquareText className="mt-0.5 size-4 shrink-0 text-[#9c1f31]" />
          Sin una fuente de verdad consistente, el modelo conserva la misma
          ambigüedad.
        </p>
      </div>
    );

  if (visual === 'equivalent')
    return (
      <div className="space-y-4">
        <div
          className={`${card} grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center`}
        >
          <div>
            <p className={label}>Original</p>
            <p className="mt-3 font-mono text-lg font-semibold">i + 1 + 0</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#75555a]">
              todo input
            </p>
            <p className="mt-1 text-xl text-[#9c1f31]">=</p>
          </div>
          <div>
            <p className={label}>Simplificación</p>
            <p className="mt-3 font-mono text-lg font-semibold text-[#9c1f31]">
              i + 1
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-[#6c2330]/20 bg-[#fffdfb] p-4">
            <CircleDot className="size-5 text-[#75555a]" />
            <p className="mt-3 text-sm font-semibold">No hay contraejemplo</p>
            <p className="mt-2 text-xs leading-relaxed text-[#75555a]">
              Ningún input observable distingue ambos programas.
            </p>
          </div>
          <div className="border border-[#9c1f31] bg-[#9c1f31] p-4 text-white">
            <Check className="size-5" />
            <p className="mt-3 text-sm font-semibold">
              Aceptar la simplificación
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/75">
              El código removido no aportaba comportamiento.
            </p>
          </div>
        </div>
      </div>
    );

  if (visual === 'cost')
    return (
      <div className="space-y-3">
        {[
          {
            number: '01',
            title: 'Seleccionar menos subjects',
            cost: 'superficie bajo experimento',
            actions: 'código cambiado · criticidad · paths y owners',
          },
          {
            number: '02',
            title: 'Generar menos',
            cost: 'espacio de mutantes',
            actions: 'incremental · operadores selectivos · foco por riesgo',
          },
          {
            number: '03',
            title: 'Ejecutar menos',
            cost: 'tiempo de suite y CI',
            actions: 'tests relevantes · suite rápida · paralelismo · sampling',
          },
          {
            number: '04',
            title: 'Revisar mejor',
            cost: 'atención humana',
            actions: 'agrupar · priorizar · recuperar contexto con LLMs',
          },
        ].map((item) => (
          <div
            className="grid gap-3 border border-[#6c2330]/20 bg-[#fffdfb] p-3 shadow-[0_10px_30px_rgba(91,30,42,.05)] sm:grid-cols-[52px_1fr_1.35fr] sm:items-center"
            key={item.number}
          >
            <span className="font-mono text-sm font-bold text-[#9c1f31]">
              {item.number}
            </span>
            <div>
              <p className="font-semibold text-[#42191f]">{item.title}</p>
              <p className="mt-1 text-xs text-[#75555a]">{item.cost}</p>
            </div>
            <p className="border-l border-[#6c2330]/15 pl-4 font-mono text-[11px] leading-relaxed text-[#75555a]">
              {item.actions}
            </p>
          </div>
        ))}
        <p className="border-l-2 border-[#9c1f31] pl-4 text-sm font-semibold text-[#42191f]">
          Acotar primero. Escalar después.
        </p>
      </div>
    );

  if (visual === 'transfer')
    return (
      <div className="space-y-4">
        <div className={card}>
          <div className="flex items-center justify-between gap-4">
            <p className={label}>Semantic reduction · checkout</p>
            <span className="font-mono text-[10px] text-[#75555a]">
              aplicación completa
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="border border-[#6c2330]/15 bg-[#fffaf6] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#75555a]">
                Original
              </p>
              <p className="mt-3 font-mono text-xs leading-6">
                validar → <strong>crear orden</strong> → confirmar
              </p>
            </div>
            <ArrowRight className="mx-auto size-4 text-[#9c1f31]" />
            <div className="border border-[#9c1f31] bg-[#fff5f4] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#9c1f31]">
                Mutante
              </p>
              <p className="mt-3 font-mono text-xs leading-6">
                validar → <s>crear orden</s> → confirmar
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-[#6c2330]/20 bg-[#fffdfb] p-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#75555a]">
              E2E observa el banner
            </p>
            <p className="mt-4 text-lg font-semibold text-[#9c1f31]">ALIVE</p>
            <p className="mt-2 text-xs leading-relaxed text-[#75555a]">
              “Compra confirmada” aparece aunque no exista una orden.
            </p>
          </div>
          <div className="border border-[#9c1f31] bg-[#9c1f31] p-5 text-white">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-white/65">
              E2E observa el resultado
            </p>
            <p className="mt-4 text-lg font-semibold">KILLED</p>
            <p className="mt-2 text-xs leading-relaxed text-white/75">
              Verifica que la orden fue persistida y puede recuperarse.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1.05fr_.95fr]">
          <div className="flex items-center gap-2 border-l-2 border-[#6b3d7a] py-2 pl-4 text-sm font-semibold text-[#42191f]">
            <CircleDot className="size-4 shrink-0 text-[#6b3d7a]" />
            Mutar → ejecutar → observar
          </div>
          <div className="border border-[#6b3d7a]/35 bg-[#f7f0fa] px-4 py-3">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[.13em] text-[#6b3d7a]">
              Mismo patrón · infraestructura
            </p>
            <p className="mt-1 text-sm font-semibold text-[#42191f]">
              Chaos Monkey
              <span className="ml-2 font-normal text-[#75555a]">
                apagar instancia → verificar resiliencia
              </span>
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
      <div className={card}>
        <p className={label}>IA</p>
        <p className="mt-4 text-lg font-semibold">produce código y tests</p>
      </div>
      <div className="self-center text-2xl text-[#9c1f31]">↑</div>
      <div className="border border-[#9c1f31] bg-[#fff5f4] p-4">
        <p className={label}>Metacódigo</p>
        <p className="mt-4 text-lg font-semibold">
          verifica, restringe y explica
        </p>
      </div>
    </div>
  );
}

function SourcesLibrary() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="max-w-3xl">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[.15em] text-[#9c1f31]">
          Biblioteca de lectura
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-.055em] text-[#2a171a] sm:text-6xl">
          Fuentes para continuar después de la charla
        </h1>
        <p className="mt-6 text-xl leading-relaxed text-[#75555a]">
          Acá quedan las referencias sin el límite de una diapositiva: qué
          documenta la herramienta, qué evidencia estamos usando y qué conviene
          leer antes de sacar conclusiones generales.
        </p>
      </div>
      <div className="mt-12 space-y-10">
        {sources.map((group) => (
          <section key={group.category}>
            <div className="border-b border-[#6c2330]/15 pb-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.15em] text-[#9c1f31]">
                {group.category}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#75555a]">
                {group.description}
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {group.links.map(([title, description, href]) => (
                <a
                  className="group border border-[#6c2330]/15 bg-[#fffdfb] p-5 shadow-[0_10px_30px_rgba(91,30,42,.05)] transition hover:border-[#9c1f31] hover:bg-[#fff5f4]"
                  href={href}
                  key={href}
                  rel="noreferrer"
                  target="_blank"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold text-[#42191f]">{title}</h2>
                    <ExternalLink className="mt-0.5 size-4 shrink-0 text-[#9c1f31]" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#75555a]">
                    {description}
                  </p>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-12 border-l-2 border-[#9c1f31] pl-4 text-sm leading-relaxed text-[#75555a]">
        Esta biblioteca separa documentación primaria, corpus y evidencia
        empírica. No reemplaza el contexto de cada proyecto: lo hace discutible.
      </p>
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [presenterMode, setPresenterMode] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const current = slides[Math.min(active, slides.length - 1)];
  const totalMinutes = slides.reduce(
    (total, slide) => total + slide.minutes,
    0,
  );
  const minutesBefore = slides
    .slice(0, active)
    .reduce((total, slide) => total + slide.minutes, 0);

  useEffect(() => {
    const requested = Number(
      new URLSearchParams(window.location.search).get('slide'),
    );
    if (!Number.isInteger(requested) || requested < 1) return;

    const timer = window.setTimeout(
      () => setActive(Math.min(requested - 1, slides.length - 1)),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!sourcesOpen && event.key === 'ArrowRight')
        setActive((value) => Math.min(value + 1, slides.length - 1));
      if (!sourcesOpen && event.key === 'ArrowLeft')
        setActive((value) => Math.max(value - 1, 0));
      if (!sourcesOpen && event.key.toLowerCase() === 'p')
        setPresenterMode((value) => !value);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sourcesOpen]);

  const go = (direction: -1 | 1) =>
    setActive((value) =>
      Math.max(0, Math.min(slides.length - 1, value + direction)),
    );

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a171a] selection:bg-[#9c1f31] selection:text-[#fffaf6]">
      <header className="mx-auto flex max-w-[1800px] items-center justify-between border-b border-[#6c2330]/15 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center bg-[#9c1f31] text-xs font-bold text-[#fffaf6]">
            M
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight">
              Mutation Testing en Ruby
            </p>
            <p className="text-[10px] uppercase tracking-[.15em] text-[#75555a]">
              ¿vale la pena?
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={!sourcesOpen && !presenterMode ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => {
              setSourcesOpen(false);
              setPresenterMode(false);
            }}
          >
            Charla
          </Button>
          <Button
            variant={!sourcesOpen && presenterMode ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => {
              setSourcesOpen(false);
              setPresenterMode(true);
            }}
          >
            <MonitorUp /> Presentador
          </Button>
          <Button
            variant={sourcesOpen ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSourcesOpen(true)}
          >
            Fuentes
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1800px] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav className="border-b border-[#6c2330]/15 p-4 lg:min-h-[calc(100vh-73px)] lg:border-b-0 lg:border-r">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#75555a]">
            Recorrido
          </p>
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-1">
            {slides.map((slide, index) => (
              <button
                key={slide.index}
                onClick={() => {
                  setSourcesOpen(false);
                  setActive(index);
                }}
                className={`flex items-center gap-3 px-2 py-2 text-left transition ${!sourcesOpen && index === active ? 'bg-[#9c1f31] text-[#fffaf6]' : 'text-[#75555a] hover:bg-[#f4e3df] hover:text-[#42191f]'}`}
              >
                <span className="font-mono text-xs">{slide.index}</span>
                <span className="hidden text-sm font-medium sm:inline lg:inline">
                  {slide.section}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setSourcesOpen(true)}
            className={`mt-4 flex w-full items-center gap-3 border-t border-[#6c2330]/15 px-2 pt-4 text-left text-sm font-medium transition ${sourcesOpen ? 'text-[#9c1f31]' : 'text-[#75555a] hover:text-[#42191f]'}`}
          >
            <ExternalLink className="size-3" /> Fuentes y lecturas
          </button>
          <p className="mt-5 border-t border-[#6c2330]/15 pt-4 text-xs leading-relaxed text-[#75555a]">
            <span className="block font-mono text-[#9c1f31]">
              {formatDuration(totalMinutes)}
            </span>
            de contenido + 5 min de preguntas
          </p>
        </nav>

        <section className="relative overflow-hidden px-5 py-7 sm:px-8 sm:py-12">
          <div
            className="absolute right-[-10%] top-[-15%] size-[440px] rounded-full border border-[#9c1f31]/10"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-none">
            {sourcesOpen ? (
              <SourcesLibrary />
            ) : (
              <>
                <div className="mb-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.15em] text-[#9c1f31]">
                  <span>{current.section}</span>
                  <span>
                    {current.index} / {String(slides.length).padStart(2, '0')}
                  </span>
                </div>
                {!presenterMode ? (
                  current.step ? (
                    <MiniMutantSlide
                      slide={current as Slide & { step: ImperativeStep }}
                    />
                  ) : (
                    <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-start xl:gap-14">
                      <div>
                        {current.visual === 'welcome' ? (
                          <WelcomeTitle />
                        ) : (
                          <h1
                            className={`max-w-3xl font-semibold tracking-[-.055em] text-[#2a171a] ${['survey', 'spaces', 'oracle', 'contextual-oracle', 'equivalent', 'cost', 'transfer'].includes(current.visual) ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-4xl sm:text-6xl lg:text-7xl'}`}
                          >
                            {current.title}
                          </h1>
                        )}
                        {current.copy && (
                          <p
                            className={`mt-7 max-w-2xl leading-relaxed text-[#75555a] ${['survey', 'spaces', 'oracle', 'contextual-oracle', 'equivalent', 'cost', 'transfer'].includes(current.visual) ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}
                          >
                            {current.copy}
                          </p>
                        )}
                        {current.annotation && (
                          <p className="mt-9 max-w-xl border-l-2 border-[#9c1f31] pl-4 text-sm leading-relaxed text-[#75555a]">
                            {current.annotation}
                          </p>
                        )}
                      </div>
                      <div className="space-y-4">
                        <Diagram visual={current.visual} />
                        {current.code && !current.step && (
                          <div className="border border-[#6c2330]/15 bg-[#f8eeea] p-5">
                            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#75555a]">
                              <Code2 className="size-4 text-[#9c1f31]" />{' '}
                              Ejemplo
                            </div>
                            <pre className="whitespace-pre-wrap font-mono text-[13px] leading-6">
                              <RubyCode code={current.code} />
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[1.12fr_.88fr]">
                    <div className="border border-[#9c1f31]/50 bg-[#fffdfb] p-6 sm:p-9">
                      <div className="mb-9 flex items-center justify-between gap-4 text-sm font-semibold text-[#9c1f31]">
                        <span className="flex items-center gap-2">
                          <MonitorUp className="size-4" /> Modo presentador
                        </span>
                        <span className="font-mono text-xs">
                          {formatDuration(current.minutes)} ·{' '}
                          {formatElapsed(minutesBefore)}–
                          {formatElapsed(minutesBefore + current.minutes)}
                        </span>
                      </div>
                      <h1 className="text-3xl font-semibold tracking-[-.04em] sm:text-5xl">
                        {current.title}
                      </h1>
                      <p className="mt-4 text-xs font-mono text-[#75555a]">
                        Plan de charla: {formatDuration(totalMinutes)} de
                        contenido + 5 min de preguntas
                      </p>
                      <div className="mt-9 border-t border-[#6c2330]/15 pt-6">
                        <p className="mb-4 text-[10px] font-bold uppercase tracking-[.15em] text-[#75555a]">
                          Lo que conviene decir
                        </p>
                        <ul className="space-y-4">
                          {current.presenter.map((item) => (
                            <li
                              key={item}
                              className="flex gap-3 text-lg leading-relaxed text-[#42191f]"
                            >
                              <Check className="mt-1 size-4 shrink-0 text-[#9c1f31]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <aside className="border border-[#6c2330]/15 bg-[#f8eeea] p-6 sm:p-8">
                      <div className="mb-7 flex items-center gap-2 text-sm font-semibold">
                        <MessageSquareText className="size-4 text-[#9c1f31]" />{' '}
                        Afirmaciones para comentar
                      </div>
                      <ol className="space-y-4">
                        {current.claims.map((claim, index) => (
                          <li
                            key={claim}
                            className="border-l border-[#6c2330]/20 pl-4 text-base leading-relaxed text-[#75555a]"
                          >
                            <span className="mr-2 font-mono text-xs text-[#9c1f31]">
                              0{index + 1}
                            </span>
                            {claim}
                          </li>
                        ))}
                      </ol>
                      {current.annotation && (
                        <div className="mt-10 border-t border-[#6c2330]/15 pt-6 text-sm leading-relaxed text-[#75555a]">
                          {current.annotation}
                        </div>
                      )}
                    </aside>
                  </div>
                )}
                <footer className="mt-12 flex items-center justify-between border-t border-[#6c2330]/15 pt-5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => go(-1)}
                    disabled={active === 0}
                  >
                    <ArrowLeft /> Anterior
                  </Button>
                  <div className="hidden items-center gap-2 text-xs text-[#75555a] sm:flex">
                    <CircleDot className="size-3 text-[#9c1f31]" /> Flechas para
                    navegar · P para presentador
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => go(1)}
                    disabled={active === slides.length - 1}
                  >
                    Siguiente <ArrowRight />
                  </Button>
                </footer>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
