/**
 * Script de Atualização de Descrições — Kings Simuladores
 * 
 * Gera descrições profissionais em HTML para todos os produtos com 
 * descrições incompletas ou truncadas. Estilo inspirado nos sites 
 * dos fabricantes (Moza Racing, Thermaltake) mas com texto original.
 * 
 * Uso: npx dotenv -e .env.local -- npx tsx scripts/update-descriptions.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ────────────────────────────────────────────────────────────────────
// Banco de Descrições Profissionais
// ────────────────────────────────────────────────────────────────────

const descriptions: Record<string, string> = {

// ═══════════════════════════════════════════
// BASES DIRECT DRIVE
// ═══════════════════════════════════════════

'kit-direct-drive-para-pc-moza-racing-r5-55nm-r5': `
<h3><strong>Moza Racing R5: Entrada no Mundo Direct Drive</strong></h3>
<p>A <strong>R5</strong> é a porta de entrada definitiva para o universo Direct Drive. Com <strong>5,5 Nm de torque</strong> e transmissão direta ao eixo do volante, ela elimina correias e engrenagens, entregando um Force Feedback preciso, suave e sem atraso.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>5,5 Nm de Torque Direto:</strong> Potência suficiente para sentir cada detalhe da pista — ondulações, meio-fios, perda de aderência — sem o "filtro" mecânico de sistemas tradicionais.</p></li>
<li><p><strong>Encoder de 15 Bits:</strong> Resolução angular de alta precisão que garante transições suaves e resposta fiel ao que acontece na simulação.</p></li>
<li><p><strong>Chassi em Alumínio Aeronáutico:</strong> Liga de alumínio de grau aviação que combina leveza (apenas 4,5 kg) com rigidez e dissipação térmica eficiente.</p></li>
<li><p><strong>Refresh Rate de 1000Hz via USB:</strong> Comunicação ultra-rápida entre a base e o PC, eliminando qualquer latência perceptível.</p></li>
</ul>

<h4><strong>Design Compacto e Versátil</strong></h4>
<p>Com dimensões de apenas <strong>200 x 150 x 120mm</strong>, a R5 é uma das bases Direct Drive mais compactas do mercado. Acompanha suporte de mesa (table clamp) e é compatível com a maioria dos cockpits profissionais via montagem padrão de 4 furos.</p>

<h4><strong>Software MOZA Pit House</strong></h4>
<p>Controle total da experiência através do software dedicado: ajuste curvas de Force Feedback, intensidade de efeitos, crie perfis personalizados para cada jogo (iRacing, Assetto Corsa, F1 24, Gran Turismo) e mantenha o firmware sempre atualizado.</p>

<h4><strong>O que vem no Kit</strong></h4>
<ul>
<li><p><strong>Base Direct Drive R5</strong> (5.5 Nm)</p></li>
<li><p><strong>Volante ES Steering Wheel</strong></p></li>
<li><p><strong>Pedais SR-P Lite</strong> (freio + acelerador)</p></li>
<li><p><strong>Table Clamp</strong> (suporte de mesa)</p></li>
<li><p><strong>Fonte de alimentação</strong> e cabos</p></li>
</ul>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Torque Máximo:</strong> 5,5 Nm</p></li>
<li><p><strong>Potência:</strong> 108W</p></li>
<li><p><strong>Encoder:</strong> 15 bits</p></li>
<li><p><strong>Peso da Base:</strong> 4,5 kg</p></li>
<li><p><strong>Plataforma:</strong> PC (Windows)</p></li>
<li><p><strong>Montagem:</strong> Mesa (clamp incluso) ou cockpit (4 furos)</p></li>
</ul>
`,

'5466ci4xv-base-direct-drive-9nm-r9-v2-moza-racing': `
<h3><strong>Moza Racing R9 V3: Potência Profissional com Precisão Cirúrgica</strong></h3>
<p>A <strong>R9 V3</strong> é a escolha de quem busca o equilíbrio perfeito entre potência e refinamento. Com <strong>9 Nm de torque</strong> e o algoritmo <strong>NexGen 4.0</strong>, ela entrega um Force Feedback maduro, detalhado e incrivelmente suave.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>9 Nm de Torque Puro:</strong> Força suficiente para reproduzir com fidelidade a sensação de pilotar carros de GT3 a Fórmula, sentindo cada transferência de peso e variação de aderência.</p></li>
<li><p><strong>Encoder Magnético de 21 Bits:</strong> Mais de <strong>2 milhões de pontos de resolução</strong> por volta, garantindo transições imperceptíveis e um nível de detalhe que bases concorrentes não alcançam nessa faixa de preço.</p></li>
<li><p><strong>Algoritmo NexGen 4.0:</strong> A terceira geração da R9 traz o processamento de Force Feedback mais avançado da Moza, com suporte a <strong>iRacing 360Hz</strong> e equalização de efeitos em tempo real.</p></li>
<li><p><strong>Anel Deslizante de Grau Industrial:</strong> Permite rotação infinita do volante mantendo conexão estável — essencial para carros de drift e rally com alto ângulo de esterço.</p></li>
</ul>

<h4><strong>Construção Premium</strong></h4>
<p>Chassi fabricado em <strong>liga de alumínio de grau aeronáutico</strong> com controle térmico inteligente integrado. O corpo da base funciona como dissipador de calor, mantendo performance constante mesmo em corridas de Endurance de várias horas.</p>

<h4><strong>Software MOZA Pit House</strong></h4>
<p>Personalize cada aspecto do seu setup: <strong>Game FFB Decoupling</strong> para ajustar elementos individuais de feedback, <strong>Force Feedback Equalizer</strong> para filtrar frequências específicas, e perfis automáticos por jogo.</p>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Torque Máximo:</strong> 9 Nm</p></li>
<li><p><strong>Potência:</strong> 180W</p></li>
<li><p><strong>Encoder:</strong> 21 bits (2.097.152 passos)</p></li>
<li><p><strong>Refresh Rate USB:</strong> 1000Hz</p></li>
<li><p><strong>Peso:</strong> ~6 kg</p></li>
<li><p><strong>Tensão:</strong> Bivolt (110V~220V)</p></li>
<li><p><strong>Plataforma:</strong> PC (Windows)</p></li>
<li><p><strong>Montagem:</strong> 4 furos inferiores (padrão)</p></li>
</ul>
`,

'yr9p524sr-base-direct-drive-12nm-r12': `
<h3><strong>Moza Racing R12 V2: Performance de Elite, Refinada</strong></h3>
<p>A <strong>R12 V2</strong> é a base para quem não aceita compromissos. Com <strong>12 Nm de torque</strong> entregues por um motor servo de pólos inclinados com rotor envolto em <strong>fibra de carbono</strong>, ela define o padrão de performance na categoria semi-profissional.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>12 Nm de Torque Bruto:</strong> Reproduz fielmente a resistência de direções hidráulicas e elétricas de carros de competição reais. Sinta a pista reagir sob suas mãos com uma fidelidade impressionante.</p></li>
<li><p><strong>Motor Servo de Pólos Inclinados:</strong> Tecnologia inspirada em veículos elétricos que minimiza perdas por corrente parasita, reduz o cogging (vibração do motor parado) e melhora a eficiência térmica.</p></li>
<li><p><strong>Encoder de 21 Bits:</strong> Resolução angular de <strong>0,00017°</strong> — mais de 2 milhões de passos por revolução — para uma suavidade absurda nas transições de força.</p></li>
<li><p><strong>Algoritmo NexGen 4.0:</strong> Force Feedback mais detalhado e "maduro" que a geração anterior, com suporte a 360Hz no iRacing.</p></li>
</ul>

<h4><strong>Segurança e Inteligência</strong></h4>
<ul>
<li><p><strong>Hand-Off Protection:</strong> Sistema avançado que detecta quando suas mãos soltam o volante, reduzindo a força instantaneamente para prevenir oscilações perigosas.</p></li>
<li><p><strong>Controle Térmico Inteligente:</strong> Monitoramento em tempo real da temperatura do motor e dos componentes eletrônicos, garantindo performance estável em sessões de longa duração.</p></li>
</ul>

<h4><strong>Conectividade Completa</strong></h4>
<p>Portas dedicadas para pedais, dashboard, câmbio, freio de mão e botão de emergência (E-Stop). Compatível com todo o ecossistema Moza via conexão wireless ou cabeada.</p>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Torque Máximo:</strong> 12 Nm</p></li>
<li><p><strong>Potência:</strong> 216W</p></li>
<li><p><strong>Encoder:</strong> 21 bits (0,00017° de resolução)</p></li>
<li><p><strong>Rotação:</strong> 90° a 2700° (ajustável)</p></li>
<li><p><strong>Peso:</strong> ~6,7 kg</p></li>
<li><p><strong>Tensão:</strong> Bivolt (110V~220V)</p></li>
<li><p><strong>Plataforma:</strong> PC (Windows)</p></li>
</ul>
`,

// ═══════════════════════════════════════════
// KIT R3 XBOX/PC
// ═══════════════════════════════════════════

'kit-direct-drive-39nm-r3-xboxpc': `
<h3><strong>Kit Direct Drive Moza R3: A Porta de Entrada para Xbox e PC</strong></h3>
<p>O <strong>Kit R3</strong> é o pacote ideal para quem quer experimentar a tecnologia Direct Drive sem investir em equipamento de ponta. Com <strong>3,9 Nm de torque</strong> e compatibilidade nativa com <strong>Xbox e PC</strong>, é a solução perfeita para quem joga Forza, F1 e mais.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>3,9 Nm de Torque Direct Drive:</strong> Mesmo com torque mais contido, a R3 entrega um Force Feedback infinitamente superior a qualquer volante com correias ou engrenagens nessa faixa de preço.</p></li>
<li><p><strong>Compatível com Xbox e PC:</strong> Diferente da maioria das bases Direct Drive, a R3 funciona nativamente no Xbox Series X|S e Xbox One, além de PC.</p></li>
<li><p><strong>Encoder de Alta Resolução:</strong> Resposta precisa e suave em todas as situações.</p></li>
<li><p><strong>Design Ultra-Compacto:</strong> A menor e mais leve base Direct Drive da Moza, perfeita para setups de mesa.</p></li>
</ul>

<h4><strong>O que vem no Kit</strong></h4>
<ul>
<li><p><strong>Base Direct Drive R3</strong> (3,9 Nm)</p></li>
<li><p><strong>Volante ES Steering Wheel</strong></p></li>
<li><p><strong>Pedais SR-P Lite</strong> (freio + acelerador)</p></li>
<li><p><strong>Table Clamp</strong> (suporte de mesa)</p></li>
<li><p><strong>Fonte de alimentação</strong> e cabos</p></li>
</ul>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Torque Máximo:</strong> 3,9 Nm</p></li>
<li><p><strong>Plataforma:</strong> Xbox Series X|S, Xbox One, PC (Windows)</p></li>
<li><p><strong>Tipo:</strong> Direct Drive</p></li>
<li><p><strong>Montagem:</strong> Mesa (clamp incluso) ou cockpit</p></li>
</ul>
`,

// ═══════════════════════════════════════════
// VOLANTES MOZA
// ═══════════════════════════════════════════

'none-169484083': `
<h3><strong>Volante Moza Racing GS V2: O Clássico Redondo, Evoluído</strong></h3>
<p>O <strong>GS V2</strong> é o volante redondo premium da Moza, inspirado nos aros de GT e Turismo. Com diâmetro de <strong>280mm</strong>, couro PU premium e botões de grau automotivo, é a escolha perfeita para quem pilota desde GT3 até caminhões e rally.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Aro Redondo de 280mm:</strong> Formato clássico que permite rotação completa — ideal para carros com alto ângulo de esterço como rally e drift.</p></li>
<li><p><strong>Couro PU de Alta Qualidade:</strong> Grip firme e confortável mesmo em sessões longas.</p></li>
<li><p><strong>Botões e Shifter Paddles:</strong> Shifter paddles magnéticos com feedback tátil preciso e botões programáveis para funções rápidas (TC, ABS, brake bias).</p></li>
<li><p><strong>Quick Release Magnético:</strong> Troca rápida de volante sem ferramentas. Conecta ao hub via sistema proprietário Moza.</p></li>
<li><p><strong>Conexão Wireless:</strong> Sem cabos entre o volante e a base — comunicação sem fio estável e sem latência.</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p>Compatível com todas as bases Moza Racing (R3, R5, R9, R12, R16, R21). Funciona exclusivamente via ecossistema Moza — não é compatível com bases de outras marcas.</p>
`,

'volante-moza-ks': `
<h3><strong>Volante Moza Racing KS: Fórmula na Essência</strong></h3>
<p>O <strong>KS</strong> é o volante no formato open-wheel (fórmula) da Moza Racing. Compacto, com display integrado e construção em fibra de carbono, é feito para quem pilota monopostos e protótipos com máxima precisão.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Design Open-Wheel Autêntico:</strong> Formato inspirado em volantes de Fórmula 1 com grip ergonômico para posição de pilotagem esportiva.</p></li>
<li><p><strong>Display LCD Integrado:</strong> Tela que exibe RPM, marcha atual, tempo de volta e telemetria em tempo real diretamente no volante.</p></li>
<li><p><strong>Construção em Fibra de Carbono:</strong> Placa frontal leve e rígida que transmite cada detalhe do Force Feedback sem flexão.</p></li>
<li><p><strong>Dual Clutch Paddles:</strong> Embreagens duplas com ajuste de ponto de mordida — essencial para largadas perfeitas em corridas online.</p></li>
<li><p><strong>Encoders Rotativos e Botões:</strong> Múltiplos encoders e botões para ajustes on-the-fly de TC, ABS, brake bias e mapas de motor.</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p>Compatível com todas as bases Moza Racing via Quick Release magnético. Conexão wireless proprietária.</p>
`,

'volante-fsr-v2-lancamento': `
<h3><strong>Volante FSR V2: O Fórmula Definitivo da Moza</strong></h3>
<p>O <strong>FSR V2</strong> é o volante fórmula flagship da Moza Racing. Com construção em <strong>fibra de carbono real</strong>, display LCD de 4,3 polegadas e cluster de botões de grau profissional, é a peça central para quem leva o sim racing a sério.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>Placa Frontal em Fibra de Carbono Real:</strong> Não é adesivo ou pintura — é fibra de carbono genuína, oferecendo rigidez máxima com peso mínimo.</p></li>
<li><p><strong>Display LCD de 4,3":</strong> Tela colorida com telemetria completa: RPM, velocidade, marcha, tempo de volta, delta, temperaturas e mais.</p></li>
<li><p><strong>Dual Clutch com Ajuste de Bite Point:</strong> Embreagens duplas independentes com configuração de ponto de mordida via software Pit House.</p></li>
<li><p><strong>12+ Botões Programáveis:</strong> Encoders rotativos, botões momentâneos e chaves toggle para controle total do carro sem tirar as mãos do volante.</p></li>
<li><p><strong>Shifter Paddles Magnéticos:</strong> Trocas de marcha com feedback tátil preciso e resposta instantânea.</p></li>
</ul>

<h4><strong>Grips Premium</strong></h4>
<p>Grips em silicone de alta densidade com textura antiderrapante. Ergonomia projetada para posição de pilotagem aberta (monopostos e protótipos LMDh/Hypercar).</p>

<h4><strong>Compatibilidade</strong></h4>
<p>Compatível com todas as bases Moza Racing via Quick Release magnético. Conexão wireless proprietária com latência imperceptível.</p>
`,

'volante-vision-gs-moza-racing': `
<h3><strong>Volante Moza Vision GS: O Redondo com Tela</strong></h3>
<p>O <strong>Vision GS</strong> combina o melhor dos dois mundos: o formato redondo versátil do GS com um <strong>display LCD integrado</strong> para telemetria em tempo real. É o volante para quem quer informação na ponta dos dedos sem abrir mão da versatilidade.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Formato Redondo com Display:</strong> Aro de 300mm com tela LCD integrada no centro, exibindo RPM, marcha, tempos e telemetria.</p></li>
<li><p><strong>Couro Premium:</strong> Aro revestido em couro PU de alta qualidade com grip texturizado.</p></li>
<li><p><strong>Shifter Paddles Magnéticos:</strong> Trocas de marcha com click tátil satisfatório e resposta imediata.</p></li>
<li><p><strong>Botões e Encoders:</strong> Botões iluminados e encoders rotativos para ajustes em tempo real.</p></li>
<li><p><strong>Quick Release Magnético:</strong> Instalação e remoção em segundos, sem ferramentas.</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p>Compatível com todas as bases Moza Racing. Conexão wireless proprietária.</p>
`,

'volante-moza-racing-lamborghini-essenza-scv12-licenciado-oficialmente': `
<h3><strong>Volante Moza Lamborghini Essenza SCV12: Licenciamento Oficial</strong></h3>
<p>Este não é apenas um volante — é uma réplica <strong>oficialmente licenciada pela Lamborghini</strong> do volante do supercarro <strong>Essenza SCV12</strong>, o track car mais exclusivo da marca italiana. Cada detalhe foi reproduzido com a aprovação da Lamborghini Squadra Corse.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>Licença Oficial Lamborghini:</strong> Design aprovado pela Squadra Corse, reproduzindo fielmente as proporções, layout de botões e identidade visual do volante real.</p></li>
<li><p><strong>Construção Premium:</strong> Estrutura em liga de alumínio com acabamento automotivo de alta qualidade. Grips em alcantara ou couro sintético premium.</p></li>
<li><p><strong>Display LCD Integrado:</strong> Tela de telemetria com informações de corrida em tempo real.</p></li>
<li><p><strong>Cluster de Botões Completo:</strong> Encoders rotativos, botões momentâneos e chaves funcionais inspirados no layout real do SCV12.</p></li>
<li><p><strong>Dual Clutch Magnético:</strong> Embreagens duplas com ajuste de ponto de mordida para largadas controladas.</p></li>
</ul>

<h4><strong>Para Colecionadores e Pilotos</strong></h4>
<p>Além de ser uma peça funcional de alta performance para sim racing, o volante Lamborghini SCV12 é um item de coleção para entusiastas do automobilismo. Embalagem premium com certificação de licenciamento.</p>

<h4><strong>Compatibilidade</strong></h4>
<p>Compatível com todas as bases Moza Racing via Quick Release magnético. Conexão wireless proprietária.</p>
`,

// ═══════════════════════════════════════════
// PEDAIS MOZA
// ═══════════════════════════════════════════

'pedal-moza-sr-p-sem-embreagem': `
<h3><strong>Pedal SR-P Moza Racing: Célula de Carga Profissional</strong></h3>
<p>O <strong>SR-P</strong> é o pedal flagship da Moza Racing, equipado com <strong>célula de carga de 200 kg</strong> no freio. Diferente de pedais comuns que medem distância, o SR-P mede a <strong>pressão</strong> que você aplica — exatamente como pedais de carros de corrida reais.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>Célula de Carga de 200 kg:</strong> Sensor de pressão industrial que converte a força aplicada em frenagem precisa. Quanto mais forte pisa, mais freia — sem depender da distância do curso.</p></li>
<li><p><strong>Acelerador com Sensor Hall:</strong> Sensor magnético sem contato que elimina desgaste mecânico e garante precisão absoluta por milhões de ciclos.</p></li>
<li><p><strong>Construção Full Metal:</strong> Estrutura, pedais e articulações em aço e alumínio. Zero plástico nas partes estruturais.</p></li>
<li><p><strong>Molas e Elastômeros Intercambiáveis:</strong> Personalize a resistência e o feel do freio com diferentes combinações de molas e borrachas incluídas.</p></li>
</ul>

<h4><strong>Ajuste Total</strong></h4>
<p>Ângulo, espaçamento e altura dos pedais são totalmente ajustáveis para se adaptar à sua posição de pilotagem e ao seu cockpit. Base antiderrapante para uso no chão ou montagem em cockpits profissionais.</p>

<h4><strong>Configuração</strong></h4>
<p>Este kit inclui <strong>acelerador + freio</strong> (sem embreagem). A embreagem pode ser adquirida separadamente e instalada posteriormente.</p>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Freio:</strong> Célula de carga 200 kg</p></li>
<li><p><strong>Acelerador:</strong> Sensor Hall magnético</p></li>
<li><p><strong>Material:</strong> Aço + alumínio</p></li>
<li><p><strong>Conexão:</strong> USB ou via base Moza</p></li>
</ul>
`,

'pedais-moza-racing-sr-p': `
<h3><strong>Pedal Embreagem Moza SR-P: Expansão do seu Setup</strong></h3>
<p>A <strong>embreagem SR-P</strong> é o módulo de expansão para quem já possui o set de pedais SR-P (acelerador + freio) e quer completar o trio. Equipada com sensor Hall magnético e construção full metal, ela se integra perfeitamente ao seu pedal existente.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Sensor Hall Magnético:</strong> Sem contato mecânico, sem desgaste. Precisão absoluta e vida útil praticamente ilimitada.</p></li>
<li><p><strong>Construção Full Metal:</strong> Mesmo padrão de qualidade do acelerador e freio SR-P — aço e alumínio, zero plástico.</p></li>
<li><p><strong>Instalação Plug & Play:</strong> Encaixa diretamente na base do SR-P existente. Sem furação, sem modificação — conecta e usa.</p></li>
<li><p><strong>Curso e Resistência Ajustáveis:</strong> Molas e elastômeros permitem personalizar o ponto de mordida e a firmeza da embreagem.</p></li>
</ul>

<h4><strong>Para Quem é?</strong></h4>
<p>Essencial para quem pilota com câmbio manual (H-shifter ou sequencial) e quer largadas com controle de embreagem em corridas online. Também recomendado para entusiastas de rally e drift.</p>
`,

'pedal-crp-2-compativel-com-active-mboost': `
<h3><strong>Pedal Moza CRP 2: Célula de Carga com Compatibilidade Active</strong></h3>
<p>O <strong>CRP 2</strong> é o pedal com célula de carga da Moza projetado para oferecer frenagem por pressão com custo acessível. Compatível com o módulo <strong>Active mBooster</strong> para adicionar Force Feedback nos pedais futuramente.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Célula de Carga no Freio:</strong> Frenagem baseada em pressão — quanto mais força aplica, mais freia, independente da distância do pedal.</p></li>
<li><p><strong>Compatível com mBooster:</strong> Preparado para receber o módulo Active mBooster, que adiciona Force Feedback háptico ao pedal de freio.</p></li>
<li><p><strong>Construção Robusta:</strong> Estrutura em metal com ajustes de ângulo e espaçamento.</p></li>
<li><p><strong>Sensor Hall no Acelerador:</strong> Precisão magnética sem desgaste mecânico.</p></li>
</ul>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Freio:</strong> Célula de carga</p></li>
<li><p><strong>Acelerador:</strong> Sensor Hall</p></li>
<li><p><strong>Conexão:</strong> USB ou via base Moza</p></li>
</ul>
`,

'acessorio-para-pedal-crp2-crp2_acessorio': `
<h3><strong>Acessório para Pedal CRP2: Kit de Personalização</strong></h3>
<p>Kit de acessórios de expansão para o pedal <strong>Moza CRP2</strong>. Inclui molas e elastômeros adicionais que permitem personalizar a resistência e o feel dos pedais de acordo com sua preferência de pilotagem.</p>

<h4><strong>O Que Inclui</strong></h4>
<ul>
<li><p><strong>Molas de Diferentes Dureza:</strong> Opções de soft, medium e hard para ajustar a resistência do freio ao seu estilo.</p></li>
<li><p><strong>Elastômeros de Performance:</strong> Borrachas de diferentes densidades que alteram a sensação de progressividade do pedal.</p></li>
<li><p><strong>Hardware de Instalação:</strong> Tudo o que precisa para trocar os componentes.</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p>Exclusivo para pedais <strong>Moza CRP2</strong>. Não compatível com SR-P ou SR-P Lite.</p>
`,

'pedal-ativo-moza-racing-mbooster-sem-acelerador-e-suporte-pedal': `
<h3><strong>Pedal Active mBooster Moza: Force Feedback nos Pés</strong></h3>
<p>O <strong>Active mBooster</strong> é o sistema de pedal ativo da Moza que adiciona <strong>Force Feedback real nos pedais de freio</strong>. Usando um motor servo dedicado, ele simula o ABS, o bloqueio de rodas e a progressividade da frenagem como num carro de corrida real.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>Motor Servo Ativo:</strong> Diferente de pedais passivos com molas, o mBooster usa um motor elétrico que empurra de volta contra o seu pé, simulando a reação real do sistema de freio.</p></li>
<li><p><strong>Simulação de ABS:</strong> Sinta a vibração e a pulsação do ABS nos seus pés — informação que te permite frear no limite sem travar as rodas.</p></li>
<li><p><strong>Célula de Carga Integrada:</strong> Sensor de pressão de alta resolução para frenagem precisa.</p></li>
<li><p><strong>Perfis por Carro:</strong> Configure diferentes curvas de força e simulações de ABS para cada tipo de veículo via Pit House.</p></li>
</ul>

<h4><strong>Este Kit Inclui</strong></h4>
<ul>
<li><p><strong>Módulo de freio Active mBooster</strong> com motor servo</p></li>
<li><p><strong>Suporte/base de montagem para o pedal</strong></p></li>
<li><p><strong>Acelerador NÃO incluso</strong> — utilize com seu pedal acelerador existente</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p>Funciona com bases Moza Racing ou via conexão USB direta ao PC.</p>
`,

'71knhkwon-/pedal-active-moza-racing-mbooster-com-feedback-suporte': `
<h3><strong>Pedal Active mBooster Moza: Force Feedback nos Pés (Sem Suporte)</strong></h3>
<p>O <strong>Active mBooster</strong> é o sistema de pedal ativo da Moza que adiciona <strong>Force Feedback real no pedal de freio</strong>. Esta versão vem <strong>sem o suporte de montagem</strong> — ideal para quem já tem um cockpit com suporte de pedal próprio.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>Motor Servo Ativo:</strong> Empurra de volta contra o seu pé, simulando ABS, bloqueio de rodas e progressividade real da frenagem.</p></li>
<li><p><strong>Simulação de ABS Real:</strong> Sinta a pulsação do ABS nos pés — frenagem no limite sem travar rodas.</p></li>
<li><p><strong>Célula de Carga Integrada:</strong> Frenagem por pressão de alta resolução.</p></li>
<li><p><strong>Configuração via Pit House:</strong> Perfis personalizados por carro e jogo.</p></li>
</ul>

<h4><strong>Atenção</strong></h4>
<p>Esta versão <strong>NÃO inclui suporte de montagem nem acelerador</strong>. Você precisa ter um suporte/cockpit próprio para fixar o módulo. Se precisar do suporte, opte pela versão "com Suporte".</p>
`,

'embreagem-sr-p-r5-lite': `
<h3><strong>Embreagem SR-P Lite: Módulo para Kits R5 e R3</strong></h3>
<p>Módulo de embreagem para adicionar ao set de pedais <strong>SR-P Lite</strong> que acompanha os kits R5 e R3. Encaixa diretamente na base existente sem modificação.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Instalação Plug & Play:</strong> Encaixa na base do SR-P Lite existente — sem furação, sem gambiarra.</p></li>
<li><p><strong>Sensor Hall:</strong> Precisão magnética sem desgaste.</p></li>
<li><p><strong>Construção Robusta:</strong> Mesmo padrão de qualidade do pedal original.</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p>Exclusivo para pedais <strong>SR-P Lite</strong> (que acompanham os kits R3 e R5). Não compatível com SR-P full.</p>
`,

'kit-de-desempenho-pedal-sr-p': `
<h3><strong>Kit de Molas de Precisão SR-P: Personalize seu Freio</strong></h3>
<p>Kit com molas de diferentes dureza e elastômeros de performance para personalizar a sensação do pedal de freio <strong>SR-P full</strong>. Ideal para pilotos que querem um pedal mais firme (estilo F1) ou mais progressivo (estilo GT).</p>

<h4><strong>O Que Inclui</strong></h4>
<ul>
<li><p><strong>Molas de Precisão:</strong> Diferentes constantes de mola para variar a resistência do pedal de freio.</p></li>
<li><p><strong>Elastômeros:</strong> Borrachas de densidades variadas que alteram a progressividade e o feedback tátil.</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p><strong>Atenção:</strong> Este kit é exclusivo para o pedal <strong>SR-P full</strong>. <strong>NÃO é compatível</strong> com o SR-P Lite dos kits R5 e R3.</p>
`,

// ═══════════════════════════════════════════
// ACESSÓRIOS MOZA
// ═══════════════════════════════════════════

'extensor-rod-moza-racing': `
<h3><strong>Extensor para Bases Moza Racing</strong></h3>
<p>Haste extensora em alumínio que permite montar a base Direct Drive Moza em cockpits com maior distância entre o suporte frontal e a posição do piloto. Essencial para setups com cockpits maiores ou posições de pilotagem mais recuadas.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Alumínio de Alta Resistência:</strong> Não introduz flexão ou folga — rigidez total na transmissão do Force Feedback.</p></li>
<li><p><strong>Instalação Simples:</strong> Parafusos padrão, compatível com os furos de montagem das bases Moza.</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p>Compatível com todas as bases Moza Racing: R3, R5, R9, R12, R16 e R21.</p>
`,

'suporte-base-frontal-moza-racing-v2-ou-superior': `
<h3><strong>Suporte Base Frontal Moza Racing V2+</strong></h3>
<p>Suporte de montagem frontal para fixar bases Direct Drive Moza em cockpits profissionais. Compatível com bases <strong>V2 ou superior</strong>, oferece posicionamento preciso e rigidez para torques de até 21 Nm.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Aço de Alta Resistência:</strong> Projetado para aguentar o torque da R21 (21 Nm) sem flexão.</p></li>
<li><p><strong>Ajuste de Ângulo:</strong> Permite inclinar a base para encontrar a posição de pilotagem ideal.</p></li>
<li><p><strong>Furação Universal:</strong> Compatível com cockpits de perfil de alumínio (8020/8040) e cockpits tubulares.</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p>Bases Moza Racing versão V2 ou superior (R5 V2, R9 V2/V3, R12 V2, R16, R21).</p>
`,

'suporte-de-mesa-ou-cockpit-freio-de-mao-ou-cambio-moza': `
<h3><strong>Suporte de Mesa para Câmbio / Freio de Mão Moza</strong></h3>
<p>Suporte multifuncional que permite fixar o <strong>câmbio (shifter)</strong> ou <strong>freio de mão (handbrake)</strong> Moza Racing na lateral da mesa ou do cockpit. Construção em metal com sistema de grampo ajustável.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Fixação Dupla:</strong> Funciona tanto em mesas (grampo lateral) quanto em cockpits (parafusos).</p></li>
<li><p><strong>Posição Ajustável:</strong> Ângulo e altura reguláveis para ergonomia ideal.</p></li>
<li><p><strong>Construção Metálica:</strong> Rigidez para aguentar puxadas fortes no freio de mão.</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p>Compatível com shifter e handbrake da linha Moza Racing.</p>
`,

// ═══════════════════════════════════════════
// COCKPITS THERMALTAKE
// ═══════════════════════════════════════════

'cockpit-thermaltake-gr300': `
<h3><strong>Cockpit Thermaltake GR300: Estrutura Sólida, Preço Acessível</strong></h3>
<p>O <strong>GR300</strong> é o cockpit de entrada da Thermaltake, projetado para oferecer uma base estável para simuladores de corrida sem ocupar muito espaço. Estrutura em aço tubular com acabamento resistente e ajustes essenciais de posição.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Estrutura em Aço Tubular:</strong> Rigidez suficiente para bases Direct Drive de até 12 Nm sem flexão perceptível.</p></li>
<li><p><strong>Ajuste de Distância:</strong> Regulagem de distância entre volante, pedais e assento para diferentes estaturas.</p></li>
<li><p><strong>Dobrável:</strong> Pode ser dobrado para armazenamento quando não estiver em uso.</p></li>
<li><p><strong>Compatibilidade Universal:</strong> Suporta bases Moza, Thrustmaster, Logitech e Fanatec via adaptação de furação.</p></li>
</ul>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Material:</strong> Aço tubular</p></li>
<li><p><strong>Capacidade:</strong> Até 120 kg (piloto + equipamento)</p></li>
<li><p><strong>Assento:</strong> Não incluso — compatível com assentos automotivos padrão</p></li>
</ul>
`,

'prs': `
<h3><strong>Cockpit Thermaltake GR500 Racing Profissional — Preto</strong></h3>
<p>O <strong>GR500</strong> é o cockpit premium da Thermaltake para sim racing profissional. Estrutura reforçada em aço de alta resistência com ajustes completos de posição e suporte nativo para bases Direct Drive de alto torque.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Estrutura Reforçada:</strong> Aço de alta espessura que suporta bases Direct Drive de até 21 Nm sem flexão.</p></li>
<li><p><strong>Ajuste 360°:</strong> Regulagem completa de distância, ângulo e altura para volante, pedais, câmbio e monitor.</p></li>
<li><p><strong>Suporte para Monitor:</strong> Preparado para receber suporte de monitor (vendido separadamente) para tela de até 50".</p></li>
<li><p><strong>Assento Racing Incluso:</strong> Assento estilo racing com reclinação e trilho de ajuste frontal/traseiro.</p></li>
</ul>

<h4><strong>Cor</strong></h4>
<p>Versão <strong>Preto (Black)</strong> — acabamento fosco premium.</p>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Material:</strong> Aço reforçado de alta resistência</p></li>
<li><p><strong>Capacidade:</strong> Até 150 kg</p></li>
<li><p><strong>Inclui:</strong> Estrutura + assento racing</p></li>
</ul>
`,

'cockpit-thermaltake-gr500-racing-profissional-preto-thermaltake_preto': `
<h3><strong>Cockpit Thermaltake GR500 Racing Profissional — Preto</strong></h3>
<p>O <strong>GR500</strong> é o cockpit premium da Thermaltake para sim racing profissional. Estrutura reforçada em aço com ajustes completos e assento racing incluso.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Estrutura Reforçada:</strong> Suporta bases Direct Drive de até 21 Nm sem flexão.</p></li>
<li><p><strong>Ajuste Completo:</strong> Regulagem de distância, ângulo e altura para todos os periféricos.</p></li>
<li><p><strong>Assento Racing Incluso:</strong> Assento reclinável com trilho de ajuste.</p></li>
<li><p><strong>Preparado para Monitor:</strong> Aceita suporte de monitor de até 50" (vendido separadamente).</p></li>
</ul>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Material:</strong> Aço reforçado</p></li>
<li><p><strong>Capacidade:</strong> Até 150 kg</p></li>
<li><p><strong>Cor:</strong> Preto fosco</p></li>
</ul>
`,

'cockpit-thermaltake-gr500-racing-profissional-alabaster-thermaltake_branco': `
<h3><strong>Cockpit Thermaltake GR500 Racing Profissional — Alabaster (Branco)</strong></h3>
<p>A versão <strong>Alabaster</strong> do GR500 traz a mesma estrutura reforçada do modelo preto, com um visual premium em branco fosco que destaca qualquer setup. A cor Alabaster combina com ambientes claros e setups modernos.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Mesma Estrutura Reforçada:</strong> Suporta bases Direct Drive de até 21 Nm.</p></li>
<li><p><strong>Acabamento Alabaster:</strong> Branco fosco premium com resistência a riscos e manchas.</p></li>
<li><p><strong>Assento Racing Incluso:</strong> Assento reclinável com detalhes em branco e cinza.</p></li>
<li><p><strong>Ajustes Completos:</strong> Mesmas regulagens do modelo preto — distância, ângulo e altura.</p></li>
</ul>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Material:</strong> Aço reforçado</p></li>
<li><p><strong>Capacidade:</strong> Até 150 kg</p></li>
<li><p><strong>Cor:</strong> Alabaster (Branco fosco)</p></li>
</ul>
`,

'extreme': `
<h3><strong>Cockpit para Simulador de Voo GF500 — Thermaltake</strong></h3>
<p>O <strong>GF500</strong> é o cockpit da Thermaltake projetado especificamente para <strong>simuladores de voo</strong>. Com posição de pilotagem ajustável e suportes para joystick, throttle e pedais de leme, é a estrutura ideal para pilotos virtuais de Flight Simulator, DCS e X-Plane.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Design para Voo:</strong> Posição de assento e braços projetados para acomodar joystick HOTAS e throttle em posição ergonômica natural.</p></li>
<li><p><strong>Suportes Ajustáveis:</strong> Braços laterais com regulagem de altura e ângulo para joystick e throttle de qualquer marca.</p></li>
<li><p><strong>Base para Pedais de Leme:</strong> Plataforma inferior projetada para pedais rudder.</p></li>
<li><p><strong>Estrutura em Aço:</strong> Rigidez e estabilidade para sessões longas de voo.</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p>Compatível com joysticks e throttles de todas as marcas (Thrustmaster, VKB, Logitech, Virpil). Assento estilo piloto incluso.</p>
`,

'cockpit-para-simulador-de-voo-gf500-thermaltake-preto-sim_voo_thermal_black': `
<h3><strong>Cockpit para Simulador de Voo GF500 — Thermaltake — Preto</strong></h3>
<p>A versão <strong>preta</strong> do cockpit de voo GF500 da Thermaltake. Mesma estrutura robusta e ajustes ergonômicos da versão padrão, com acabamento em preto fosco premium.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Projetado para Voo:</strong> Suportes para joystick HOTAS, throttle e pedais rudder em posição ergonômica.</p></li>
<li><p><strong>Ajustes Completos:</strong> Braços laterais reguláveis em altura e ângulo.</p></li>
<li><p><strong>Estrutura em Aço:</strong> Estabilidade total para sessões longas.</p></li>
<li><p><strong>Acabamento Preto Fosco:</strong> Visual premium e discreto.</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p>Compatível com joysticks e throttles de todas as marcas. Assento incluso.</p>
`,

// ═══════════════════════════════════════════
// THERMALTAKE G6 E ACESSÓRIOS
// ═══════════════════════════════════════════

'volante-thermaltake-g6-direct-drive-pedais': `
<h3><strong>Conjunto Thermaltake G6: Direct Drive Completo com Pedais</strong></h3>
<p>O <strong>G6</strong> é o pacote completo da Thermaltake para quem quer entrar no mundo Direct Drive sem complicação. Inclui <strong>base Direct Drive, volante e pedais</strong> num único kit, pronto para usar.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>Base Direct Drive:</strong> Transmissão direta sem correias ou engrenagens para Force Feedback puro e responsivo.</p></li>
<li><p><strong>Volante Incluso:</strong> Aro em couro com botões programáveis e shifter paddles.</p></li>
<li><p><strong>Pedais com 2 Pedais:</strong> Set de acelerador e freio com sensores de alta precisão.</p></li>
<li><p><strong>Montagem Versátil:</strong> Compatível com mesas (clamp incluso) e cockpits via furação padrão.</p></li>
</ul>

<h4><strong>Para Quem é?</strong></h4>
<p>Ideal para quem está fazendo upgrade de um volante com correias (Logitech G29, Thrustmaster T300) e quer sentir a diferença do Direct Drive sem montar peça por peça.</p>
`,

'kit-thrustmaster-t128-force-feedback-ps5ps4-e-pc': `
<h3><strong>Kit Thrustmaster T128: Force Feedback para PS5, PS4 e PC</strong></h3>
<p>O <strong>T128</strong> é o volante de entrada da Thrustmaster com <strong>Force Feedback real</strong>. Compatível com <strong>PS5, PS4 e PC</strong>, é a escolha perfeita para quem está começando no sim racing e quer sentir a diferença de um volante com retorno de força de verdade.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Force Feedback Magnético:</strong> Sistema Hybrid Drive que combina motor com feedback magnético para sensações realistas.</p></li>
<li><p><strong>Compatibilidade Tripla:</strong> Funciona nativamente em PS5, PS4 e PC — sem adaptadores.</p></li>
<li><p><strong>Pedais Magnéticos Inclusos:</strong> Set de acelerador e freio com sensores magnéticos (sem desgaste).</p></li>
<li><p><strong>Design Compacto:</strong> Leve e fácil de montar na mesa com grampo incluso.</p></li>
</ul>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Tipo:</strong> Hybrid Drive (Force Feedback)</p></li>
<li><p><strong>Rotação:</strong> 900°</p></li>
<li><p><strong>Plataformas:</strong> PS5, PS4, PC</p></li>
<li><p><strong>Pedais:</strong> 2 pedais magnéticos inclusos</p></li>
</ul>
`,

// ═══════════════════════════════════════════
// ACESSÓRIOS GERAIS
// ═══════════════════════════════════════════

'suporte-monitor-gr300-ate-50-polegadas': `
<h3><strong>Suporte para Monitor Thermaltake GR300 — até 50"</strong></h3>
<p>Suporte de monitor projetado para o cockpit <strong>Thermaltake GR300</strong>, compatível com telas de até <strong>50 polegadas</strong>. Construção em aço com ajuste de altura e ângulo para posicionar o monitor na distância e inclinação ideais.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Suporta Telas de até 50":</strong> Compatível com monitores ultrawide e TVs.</p></li>
<li><p><strong>Ajuste de Altura e Ângulo:</strong> Encontre a posição perfeita para imersão máxima.</p></li>
<li><p><strong>Padrão VESA:</strong> Compatível com montagens VESA 75x75 e 100x100.</p></li>
<li><p><strong>Integração Perfeita:</strong> Encaixa diretamente na estrutura do GR300 sem adaptações.</p></li>
</ul>
`,

'tapete-de-chao-para-simulador-thermaltake': `
<h3><strong>Tapete de Chão para Simulador — Thermaltake</strong></h3>
<p>Tapete de chão oficial da Thermaltake para simuladores de corrida. Protege o piso, reduz vibrações e dá o acabamento profissional ao seu setup.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Anti-Derrapante:</strong> Base emborrachada que mantém o cockpit firme no chão.</p></li>
<li><p><strong>Absorção de Vibração:</strong> Reduz a transmissão de vibrações do pedal e do cockpit para o piso.</p></li>
<li><p><strong>Proteção do Piso:</strong> Evita arranhões e marcas no piso de madeira, porcelanato ou laminado.</p></li>
<li><p><strong>Visual Profissional:</strong> Acabamento premium com logo Thermaltake que completa o visual do setup.</p></li>
</ul>
`,

// ═══════════════════════════════════════════
// SERVIÇO
// ═══════════════════════════════════════════

'consultoria-de-montagem-ou-instalacao': `
<h3><strong>Consultoria Online de Instalação e Montagem</strong></h3>
<p>Serviço de <strong>consultoria online em tempo real</strong> com um especialista da Kings Simuladores para te ajudar na instalação, montagem e configuração do seu simulador de corrida.</p>

<h4><strong>O Que Você Recebe</strong></h4>
<ul>
<li><p><strong>Chamada ao Vivo:</strong> Sessão por videochamada com um técnico especialista que te guia passo a passo.</p></li>
<li><p><strong>Montagem do Cockpit:</strong> Orientação na montagem mecânica da estrutura, fixação da base, pedais e acessórios.</p></li>
<li><p><strong>Configuração de Software:</strong> Setup do Pit House (Moza), calibração de Force Feedback, configuração de pedais e criação de perfis por jogo.</p></li>
<li><p><strong>Otimização de Performance:</strong> Dicas de configuração para iRacing, Assetto Corsa, F1 24 e outros títulos populares.</p></li>
</ul>

<h4><strong>Como Funciona</strong></h4>
<p>Após a compra, nossa equipe entrará em contato para agendar o horário da sessão. A consultoria é feita por videochamada (WhatsApp, Google Meet ou Zoom) e tem duração de acordo com a complexidade do seu setup.</p>
`,

// ═══════════════════════════════════════════
// NOVOS TEMPLATES — Produtos sem descrição
// ═══════════════════════════════════════════

'volante-truck-moza-racing': `
<h3><strong>Volante TSW Truck — Moza Racing: Imersão Total em Simulação de Caminhões</strong></h3>
<p>O <strong>TSW Truck</strong> foi projetado especificamente para simulação de caminhões e máquinas agrícolas. Com <strong>400mm de diâmetro</strong> — o padrão real de volantes de caminhão — ele entrega autenticidade e conforto em sessões longas no Euro Truck Simulator 2, American Truck Simulator e Farming Simulator.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>Diâmetro de 400mm:</strong> Tamanho idêntico ao de volantes reais de caminhão, proporcionando esterço natural e preciso, sem a sensação artificial de volantes menores.</p></li>
<li><p><strong>14 Botões Retroiluminados:</strong> Botões mecânicos de curso curto com iluminação integrada, posicionados para acesso rápido a buzina, faróis, setas e funções do painel.</p></li>
<li><p><strong>2 Thumb Encoders + 2 Joysticks Direcionais:</strong> Permitem navegar menus, ajustar espelhos e controlar câmeras sem tirar as mãos do volante.</p></li>
<li><p><strong>10 LEDs RGB de Alta Luminosidade:</strong> Totalmente customizáveis via MOZA Pit House para telemetria, RPM ou indicadores visuais personalizados.</p></li>
</ul>

<h4><strong>Construção Premium</strong></h4>
<p>Aro fabricado em <strong>alumínio de alta resistência</strong> revestido com <strong>couro microfibra perfurado</strong> e costura manual — a mesma qualidade encontrada em volantes reais de veículos pesados. O design clássico de quatro raios com detalhes cromados transmite autenticidade visual.</p>

<h4><strong>Compatibilidade Universal</strong></h4>
<p>Compatível com todas as bases Direct Drive Moza Racing (R3, R5, R9, R12, R21, R25) via <strong>Quick Release em alumínio</strong>. Também funciona com bases de outros fabricantes quando utilizado com o MOZA Universal Hub.</p>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Diâmetro:</strong> 400mm</p></li>
<li><p><strong>Botões:</strong> 14 mecânicos retroiluminados</p></li>
<li><p><strong>Encoders:</strong> 2 thumb encoders</p></li>
<li><p><strong>Joysticks:</strong> 2 direcionais (4 vias)</p></li>
<li><p><strong>LEDs:</strong> 10 RGB configuráveis</p></li>
<li><p><strong>Material:</strong> Alumínio + couro microfibra</p></li>
<li><p><strong>Quick Release:</strong> Alumínio (incluso)</p></li>
<li><p><strong>Conectividade:</strong> Wireless e com fio</p></li>
<li><p><strong>Software:</strong> MOZA Pit House</p></li>
</ul>
`,

'moza-racing-volante-rsv2': `
<h3><strong>Volante Moza Racing RS V2: O GT Round Definitivo</strong></h3>
<p>O <strong>RS V2</strong> é o volante round mais completo do ecossistema Moza. Com <strong>330mm de diâmetro</strong>, 10 botões mecânicos retroiluminados e paletas magnéticas em <strong>fibra de carbono forjada</strong>, ele combina ergonomia de corrida com versatilidade para qualquer categoria — de GT3 a Rally.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>330mm de Diâmetro:</strong> Tamanho ideal para GT, touring e carros de rua. Grande o suficiente para movimentos suaves, compacto o bastante para reações rápidas.</p></li>
<li><p><strong>10 Botões Mecânicos Retroiluminados:</strong> Com 8 opções de cor, cada botão é programável via MOZA Pit House para funções como traction control, ABS, pit limiter e mais.</p></li>
<li><p><strong>Paletas Magnéticas em Fibra de Carbono Forjada:</strong> Troca de marchas com feedback tátil preciso e durabilidade excepcional. A fibra de carbono forjada garante leveza e rigidez superiores.</p></li>
<li><p><strong>Dual Clutch Paddles:</strong> Embreagem dupla com ajuste de bite point independente — essencial para saídas paradas perfeitas e técnicas de heel-and-toe.</p></li>
</ul>

<h4><strong>Controles Avançados</strong></h4>
<p>Além dos botões, o RS V2 conta com <strong>2 joysticks multidirecionais pressionáveis</strong> e <strong>2 encoders rotativos</strong> para ajustes on-the-fly de mapa de motor, brake bias, TC e configurações de setup sem sair da pista.</p>

<h4><strong>Indicador de RPM Sequencial</strong></h4>
<p>Faixa de <strong>LEDs RGB sequenciais</strong> totalmente configurável via MOZA Pit House: use como shift light, indicador de RPM, flag de bandeira ou telemetria de combustível. Cada LED pode ter cor, brilho e comportamento individuais.</p>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Diâmetro:</strong> 330mm (13")</p></li>
<li><p><strong>Formato:</strong> Round (circular)</p></li>
<li><p><strong>Botões:</strong> 10 mecânicos retroiluminados (8 cores)</p></li>
<li><p><strong>Joysticks:</strong> 2 multidirecionais pressionáveis</p></li>
<li><p><strong>Encoders:</strong> 2 rotativos</p></li>
<li><p><strong>Paletas:</strong> Magnéticas em fibra de carbono forjada</p></li>
<li><p><strong>Embreagem:</strong> Dual clutch com bite point</p></li>
<li><p><strong>LEDs RPM:</strong> Sequenciais RGB configuráveis</p></li>
<li><p><strong>Material:</strong> Alumínio aeronáutico + couro microfibra</p></li>
<li><p><strong>Quick Release:</strong> Alumínio (incluso)</p></li>
</ul>
`,

'volante-moza-racing-cs': `
<h3><strong>Volante Moza Racing CS V2: Versatilidade Round para Toda Categoria</strong></h3>
<p>O <strong>CS V2</strong> é o volante round mais versátil da Moza. Com <strong>330mm de diâmetro</strong> e construção em <strong>alumínio de grau aeronáutico</strong>, ele foi pensado para quem compete em múltiplas categorias — de GT a touring, de rally a road cars — sem trocar de equipamento.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>Chassis em Alumínio 6061 CNC:</strong> Liga de alumínio de grau aviação usinada em CNC, combinando rigidez extrema com peso controlado. Zero flex em qualquer nível de Force Feedback.</p></li>
<li><p><strong>6 Botões Mecânicos Programáveis:</strong> Posicionados ergonomicamente para acesso rápido a TC, ABS, pit limiter e funções personalizadas.</p></li>
<li><p><strong>2 Joysticks Multidirecionais + 2 Encoders Rotativos:</strong> Ajuste brake bias, mapa de motor e configurações de setup direto do volante durante a corrida.</p></li>
<li><p><strong>Paletas Magnéticas em Fibra de Carbono Forjada:</strong> Sensores fotoelétricos sem contato garantem durabilidade infinita e troca de marchas com feedback tátil preciso.</p></li>
</ul>

<h4><strong>Grip Premium</strong></h4>
<p>Aro revestido em <strong>couro microfibra de alta aderência</strong> que absorve umidade sem perder tração. Design round clássico que se adapta a qualquer posição de mão — ideal para quem alterna entre categorias com ângulos de esterço diferentes.</p>

<h4><strong>Indicador Sequencial RGB</strong></h4>
<p>LEDs RGB integrados funcionam como shift light, indicador de RPM ou telemetria configurável. Cada LED é ajustável individualmente via <strong>MOZA Pit House</strong>.</p>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Diâmetro:</strong> 330mm (13")</p></li>
<li><p><strong>Formato:</strong> Round (circular clássico)</p></li>
<li><p><strong>Botões:</strong> 6 mecânicos programáveis</p></li>
<li><p><strong>Joysticks:</strong> 2 multidirecionais pressionáveis</p></li>
<li><p><strong>Encoders:</strong> 2 rotativos</p></li>
<li><p><strong>Paletas:</strong> Magnéticas em fibra de carbono forjada</p></li>
<li><p><strong>LEDs:</strong> RGB sequenciais configuráveis</p></li>
<li><p><strong>Material:</strong> Alumínio 6061 CNC + couro microfibra</p></li>
<li><p><strong>Quick Release:</strong> Alumínio (incluso)</p></li>
<li><p><strong>Conectividade:</strong> Wireless/com fio</p></li>
</ul>
`,

'volante-moza-racing-esx-xbox': `
<h3><strong>Volante MOZA Racing ESX: Licenciado Oficialmente para Xbox + PC</strong></h3>
<p>O <strong>ESX</strong> é o primeiro volante Moza com <strong>licença oficial Xbox</strong>. Com <strong>280mm de diâmetro</strong> e <strong>22 botões totalmente customizáveis</strong>, ele transforma qualquer base Direct Drive Moza em um setup compatível com Xbox Series X|S, Xbox One e PC — plug-and-play, sem adaptadores.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>Licença Oficial Xbox:</strong> Certificado pela Microsoft. Basta conectar e jogar — sem emuladores, sem drivers adicionais, sem perda de funcionalidade.</p></li>
<li><p><strong>22 Botões Customizáveis:</strong> A maior quantidade de inputs de qualquer volante Moza. Inclui botões mecânicos, joysticks multidirecionais e mapeamento completo dos botões Xbox (A, B, X, Y, Menu, View).</p></li>
<li><p><strong>280mm de Diâmetro:</strong> Formato compacto inspirado em fórmula/GT, ideal para reações rápidas e corridas intensas.</p></li>
<li><p><strong>Grip ISF PU Antiderrapante:</strong> Material exclusivo resistente a suor e abrasão, mantendo aderência perfeita mesmo em sessões longas.</p></li>
</ul>

<h4><strong>Troca entre Xbox e PC</strong></h4>
<p>Alterne entre os modos com um toque: pressione <strong>S1 + S2 por 3 segundos</strong>. No modo Xbox, os LEDs fluem das laterais ao centro; no modo PC, exibem efeito de respiração. A transição é instantânea, sem reiniciar o jogo.</p>

<h4><strong>10 LEDs RPM RGB</strong></h4>
<p>Faixa de LEDs de alta luminosidade configurável como shift light, indicador de RPM, bandeiras ou telemetria. Cada LED pode ser ajustado individualmente via <strong>MOZA Pit House</strong>.</p>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Diâmetro:</strong> 280mm</p></li>
<li><p><strong>Botões:</strong> 22 customizáveis (mecânicos + joysticks)</p></li>
<li><p><strong>LEDs:</strong> 10 RGB de alta luminosidade</p></li>
<li><p><strong>Grip:</strong> ISF PU antiderrapante</p></li>
<li><p><strong>Paletas:</strong> Alumínio de alta precisão</p></li>
<li><p><strong>Quick Release:</strong> Alumínio (incluso)</p></li>
<li><p><strong>Plataformas:</strong> Xbox Series X|S, Xbox One, PC</p></li>
<li><p><strong>Bases Compatíveis:</strong> R3, R5, R9, R12, R21, R25</p></li>
</ul>
`,

'embreagem-para-crp2': `
<h3><strong>Módulo de Embreagem para Pedal CRP2 — Moza Racing</strong></h3>
<p>Complete seu set de pedais CRP2 com o <strong>módulo de embreagem dedicado</strong>. Projetado com sistema de <strong>3 estágios progressivos</strong>, ele reproduz com fidelidade a sensação de uma embreagem real — do curso leve inicial à resistência firme do ponto de embreamento até a liberação nítida.</p>

<h4><strong>Destaques Técnicos</strong></h4>
<ul>
<li><p><strong>Sistema de 3 Estágios:</strong> Curso inicial suave, resistência média progressiva e liberação definida. Cada estágio simula o comportamento mecânico de uma embreagem automotiva real.</p></li>
<li><p><strong>Sensor de Ângulo 15-bit (32.768 PPR):</strong> Precisão absoluta na captura do ponto de embreamento (bite point), permitindo saídas paradas perfeitas e técnicas avançadas de heel-and-toe.</p></li>
<li><p><strong>Mola Dupla com Tensão Ajustável:</strong> Sistema de resistência continuamente ajustável sem ferramentas. Adapte a rigidez ao seu estilo — leve para GT, firme para rally e drift.</p></li>
<li><p><strong>Curso Ajustável de 15° a 25°:</strong> Personalize o comprimento do curso para reproduzir diferentes tipos de embreagem, de corrida a estradeiro.</p></li>
</ul>

<h4><strong>Construção de Grau Aeroespacial</strong></h4>
<p>Estrutura em <strong>alumínio 6061 CNC</strong> com placa de calcanhar em <strong>fibra de carbono 3K</strong>. Ajustes de altura do pedal (até 30mm) e ângulo (0°–15°) garantem ergonomia perfeita para qualquer posição de pilotagem.</p>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Sensor:</strong> 15-bit / 32.768 PPR</p></li>
<li><p><strong>Curso:</strong> 15° a 25° (ajustável)</p></li>
<li><p><strong>Peso:</strong> 1,45 kg</p></li>
<li><p><strong>Dimensões:</strong> 145 x 300 x 200mm</p></li>
<li><p><strong>Material:</strong> Alumínio 6061 CNC + fibra de carbono 3K</p></li>
<li><p><strong>Compatibilidade:</strong> Pedais CRP2 (acelerador + freio)</p></li>
<li><p><strong>Plataforma:</strong> PC + Xbox (via base Moza)</p></li>
<li><p><strong>Software:</strong> MOZA Pit House</p></li>
</ul>
`,

'suporte-triplo-para-monitor-de-corrida-pro-thermaltake-branco-suporte_snow': `
<h3><strong>Suporte Triplo para Monitor PRO — Thermaltake — Branco (Snow)</strong></h3>
<p>O <strong>Suporte Triplo PRO</strong> da Thermaltake na edição <strong>Snow (branco)</strong> oferece campo de visão panorâmico com até <strong>3 monitores de até 32 polegadas</strong>. Projetado para cockpits Thermaltake GR300 e GR500, ele combina rigidez estrutural com ajuste milimétrico de ângulo e altura.</p>

<h4><strong>Destaques</strong></h4>
<ul>
<li><p><strong>Suporte para 3 Monitores:</strong> Acomoda até 3 telas de 27" a 32" cada, proporcionando imersão total com campo de visão de até 180°.</p></li>
<li><p><strong>Ajuste de Ângulo e Altura:</strong> Regulagem independente de cada braço lateral para alinhamento perfeito com a posição dos olhos, eliminando reflexos e distorções.</p></li>
<li><p><strong>Acabamento Snow Premium:</strong> Pintura eletrostática branca de alta durabilidade, resistente a arranhões e manchas, mantendo a estética clean ao longo do tempo.</p></li>
<li><p><strong>Estrutura em Aço Reforçado:</strong> Tubular de aço carbono que suporta o peso combinado de 3 monitores sem flexão ou vibração perceptível.</p></li>
</ul>

<h4><strong>Compatibilidade</strong></h4>
<p>Compatível com cockpits Thermaltake GR300, GR500 (preto e alabaster) e suportes de monitor padrão VESA 75x75 / 100x100. Montagem por parafusos com gabarito incluso.</p>

<h4><strong>Especificações</strong></h4>
<ul>
<li><p><strong>Monitores:</strong> Até 3x 32" (VESA 75x75 / 100x100)</p></li>
<li><p><strong>Cor:</strong> Branco (Snow)</p></li>
<li><p><strong>Material:</strong> Aço carbono com pintura eletrostática</p></li>
<li><p><strong>Ajustes:</strong> Ângulo + Altura (independente por braço)</p></li>
<li><p><strong>Compatibilidade:</strong> Cockpits GR300 e GR500 Thermaltake</p></li>
</ul>
`,

}

// ────────────────────────────────────────────────────────────────────
// Execução
// ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Iniciando atualização de descrições...\n')
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, slug, description')
    .eq('status', 'active')

  if (error || !products) {
    console.error('❌ Erro ao buscar produtos:', error)
    return
  }

  let updated = 0
  let skipped = 0
  let notFound = 0

  for (const product of products) {
    const newDescription = descriptions[product.slug]
    
    if (!newDescription) {
      // Verifica se a descrição atual é curta ou truncada
      const len = product.description?.length || 0
      const isTruncated = product.description && !product.description.trim().endsWith('>')
      
      if (len < 200 || isTruncated) {
        console.log(`⚠️  SEM TEMPLATE: ${product.title} [${len} chars] — slug: ${product.slug}`)
        notFound++
      } else {
        skipped++
      }
      continue
    }

    const cleanDescription = newDescription.trim()

    const { error: updateError } = await supabase
      .from('products')
      .update({ description: cleanDescription })
      .eq('id', product.id)

    if (updateError) {
      console.error(`❌ Erro ao atualizar "${product.title}":`, updateError.message)
    } else {
      console.log(`✅ ${product.title}`)
      updated++
    }
  }

  console.log(`\n════════════════════════════════════════`)
  console.log(`✅ Atualizados: ${updated}`)
  console.log(`⏭️  Já estavam OK: ${skipped}`)
  console.log(`⚠️  Sem template: ${notFound}`)
  console.log(`════════════════════════════════════════\n`)
}

main()
