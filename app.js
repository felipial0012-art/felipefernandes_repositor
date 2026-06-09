/**
 * ==========================================
 * CARNIFICINA SEM ROSTO - CORE ENGINE (JS)
 * ==========================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // --------------------------------------------------
    // 1. ÁUDIO DO ABISMO (WEB AUDIO API)
    // --------------------------------------------------
    let audioCtx = null;
    let mainOscillator = null;
    let modulatorOsc = null;
    let filterNode = null;
    let gainNode = null;
    let isSoundPlaying = false;

    const btnToggleSound = document.getElementById("btn-toggle-sound");
    const soundStatus = document.getElementById("sound-status");

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Oscilador principal (Drone de Baixa Frequência - Riff de Baixo)
            mainOscillator = audioCtx.createOscillator();
            mainOscillator.type = "sawtooth";
            mainOscillator.frequency.setValueAtTime(55, audioCtx.currentTime); // Nota A1

            // Modulador para dar sensação de rotação/motor industrial
            modulatorOsc = audioCtx.createOscillator();
            modulatorOsc.type = "sine";
            modulatorOsc.frequency.setValueAtTime(4, audioCtx.currentTime); // LFO a 4Hz

            // Ganho do Modulador
            const modGain = audioCtx.createGain();
            modGain.gain.setValueAtTime(15, audioCtx.currentTime); // Desvio de frequência

            // Filtro Passa-Baixas para dar atmosfera abafada/pesada
            filterNode = audioCtx.createBiquadFilter();
            filterNode.type = "lowpass";
            filterNode.frequency.setValueAtTime(120, audioCtx.currentTime);
            filterNode.Q.setValueAtTime(5, audioCtx.currentTime);

            // Ganho Principal
            gainNode = audioCtx.createGain();
            gainNode.gain.setValueAtTime(0.0, audioCtx.currentTime); // Silêncio inicial

            // Conexões: Modulador -> Ganho do Modulador -> Freq do Oscilador Principal
            modulatorOsc.connect(modGain);
            modGain.connect(mainOscillator.frequency);

            // Conexões de Sinal: Principal -> Filtro -> Ganho -> Destino
            mainOscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            // Iniciar os osciladores
            mainOscillator.start();
            modulatorOsc.start();
        }
    }

    function toggleAudio() {
        initAudio();
        
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        if (!isSoundPlaying) {
            // Fade-in suave do drone industrial
            gainNode.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 1.5);
            soundStatus.textContent = "CONECTADO A 55Hz";
            soundStatus.classList.add("active");
            btnToggleSound.innerHTML = "<span class='icon'>❌</span> CORTAR RUÍDO INDUSTRIAL";
            isSoundPlaying = true;
            printTerminal("system", "Drone industrial sintonizado. Frequência ativa: 55Hz (A1).");
        } else {
            // Fade-out suave
            gainNode.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 0.8);
            soundStatus.textContent = "DESATIVADO";
            soundStatus.classList.remove("active");
            btnToggleSound.innerHTML = "<span class='icon'>⚡</span> CANALIZAR RUÍDO INDUSTRIAL";
            isSoundPlaying = false;
            printTerminal("warning", "Canal de áudio cortado. Silêncio no abismo.");
        }
    }

    btnToggleSound.addEventListener("click", toggleAudio);

    // --------------------------------------------------
    // 2. RITUAL DA CARNIÇA (TRITURADOR DE CÓDIGO)
    // --------------------------------------------------
    const btnRunRitual = document.getElementById("btn-run-ritual");
    const codeLegacy = document.getElementById("code-legacy");
    const codeOptimized = document.getElementById("code-optimized");
    const shredderVisual = document.getElementById("shredder-visual");
    const sparksContainer = document.getElementById("sparks-container");

    let isRitualActive = false;

    const optimizedCodeString = `// Purificado: Refatorado para V8 Engine e zero overhead de CPU
const processData = arr => arr
  .filter(item => item?.active && item.value != null)
  .map(({ id, value }) => ({ id, display: \`Valor: \${value << 1}\` }));`;

    function createSparks() {
        sparksContainer.innerHTML = "";
        for (let i = 0; i < 20; i++) {
            const spark = document.createElement("div");
            spark.className = "spark";
            spark.style.left = "50%";
            spark.style.top = "50%";
            
            // Ângulo e velocidade aleatórios
            const angle = Math.random() * Math.PI * 2;
            const velocity = 50 + Math.random() * 80;
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity;

            sparksContainer.appendChild(spark);

            // Animar faíscas usando JS de alta performance
            spark.animate([
                { transform: "translate(0, 0) scale(1)", opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
            ], {
                duration: 600 + Math.random() * 400,
                easing: "ease-out"
            });
        }
    }

    function runShredderRitual() {
        if (isRitualActive) return;
        isRitualActive = true;

        printTerminal("system", "Iniciando Ritual da Carniça: Refatoração agressiva em andamento...");
        shredderVisual.classList.add("active");
        
        // Efeito de faíscas intermitentes
        const sparkInterval = setInterval(createSparks, 150);

        // Animação de degradação do código antigo
        let originalText = codeLegacy.textContent;
        let charIndex = originalText.length;
        
        // Efeito sonoro sintético breve se o áudio estiver ligado
        if (isSoundPlaying && audioCtx) {
            const synthShred = audioCtx.createOscillator();
            const synthGain = audioCtx.createGain();
            synthShred.type = "sawtooth";
            synthShred.frequency.setValueAtTime(350, audioCtx.currentTime);
            synthShred.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 1.5);
            synthGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            synthGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
            
            synthShred.connect(synthGain);
            synthGain.connect(audioCtx.destination);
            synthShred.start();
            synthShred.stop(audioCtx.currentTime + 1.6);
        }

        // Simular a trituração do código
        const shredInterval = setInterval(() => {
            if (charIndex > 0) {
                charIndex = Math.max(0, charIndex - 15);
                codeLegacy.textContent = originalText.substring(0, charIndex) + "█";
            } else {
                clearInterval(shredInterval);
                clearInterval(sparkInterval);
                sparksContainer.innerHTML = "";
                shredderVisual.classList.remove("active");
                
                // Mostrar código otimizado com glória verde ácido
                codeOptimized.textContent = optimizedCodeString;
                codeOptimized.classList.remove("empty-state");
                codeOptimized.classList.add("success");
                
                printTerminal("system", "Ritual da Carniça completo. Overhead reduzido a zero. V8 otimizado.");
                isRitualActive = false;
                
                // Reduzir os medidores de latência e estresse do dashboard
                document.getElementById("gauge-latency").style.width = "2%";
                document.getElementById("val-latency").textContent = "1.8ms";
            }
        }, 30);
    }

    btnRunRitual.addEventListener("click", runShredderRitual);

    // --------------------------------------------------
    // 3. NÓ NA GARGANTA (GAUGES & DIAGNÓSTICO)
    // --------------------------------------------------
    const btnTriggerProfile = document.getElementById("btn-trigger-profile");
    const profilerLog = document.getElementById("profiler-status-log");

    const gaugeLatency = document.getElementById("gauge-latency");
    const gaugeMemory = document.getElementById("gauge-memory");
    const gaugeThreads = document.getElementById("gauge-threads");
    const gaugeIo = document.getElementById("gauge-io");

    const valLatency = document.getElementById("val-latency");
    const valMemory = document.getElementById("val-memory");
    const valThreads = document.getElementById("val-threads");
    const valIo = document.getElementById("val-io");

    let isProfiling = false;

    // Inicializar os gauges dinamicamente
    gaugeThreads.style.width = "92%";
    valThreads.textContent = "8 / 8 CORES (92% LOAD)";

    function runProfiler() {
        if (isProfiling) return;
        isProfiling = true;
        
        btnTriggerProfile.disabled = true;
        printTerminal("warning", "Disparando profilador de gargalos (Nó na Garganta)...");

        const logs = [
            "> Mapeando alocações de heap...",
            "> ALERTA: Retenção de escopo órfão detectada na thread #3.",
            "> Destruindo ponteiros de memória estagnados...",
            "> Forçando Garbage Collector agressivo...",
            "> Otimização de clock concluída!"
        ];

        let logIdx = 0;
        profilerLog.textContent = logs[0];
        
        const logInterval = setInterval(() => {
            logIdx++;
            if (logIdx < logs.length) {
                profilerLog.textContent = logs[logIdx];
                // Simular oscilações loucas nos gauges durante o perfilamento
                gaugeLatency.style.width = `${Math.random() * 80 + 20}%`;
                valLatency.textContent = `${Math.round(Math.random() * 90 + 10)}ms`;
            } else {
                clearInterval(logInterval);
                
                // Ajustar para os novos valores otimizados
                gaugeLatency.style.width = "4%";
                valLatency.textContent = "3ms";
                
                gaugeMemory.style.width = "18%";
                valMemory.textContent = "382MB / 2048MB (Estável)";
                
                gaugeThreads.style.width = "15%";
                valThreads.textContent = "8 / 8 CORES (Idle)";
                
                gaugeIo.style.width = "99%";
                valIo.textContent = "12.4 GB/s (Capacidade Máxima)";

                profilerLog.textContent = "> Sem gargalos ativos. Sistema flui como aço fundido.";
                printTerminal("system", "Nó na Garganta desfeito. Gargalos removidos com sucesso.");
                btnTriggerProfile.disabled = false;
                isProfiling = false;
            }
        }, 900);
    }

    btnTriggerProfile.addEventListener("click", runProfiler);

    // --------------------------------------------------
    // 4. CÂMARA DE TORTURA (TERMINAL INTERATIVO)
    // --------------------------------------------------
    const terminalBody = document.getElementById("terminal-body");
    const terminalInput = document.getElementById("terminal-input");
    const terminalWindow = document.getElementById("terminal-window");

    function printTerminal(type, text) {
        const line = document.createElement("div");
        line.className = `term-line output-line ${type}`;
        line.textContent = `> ${text}`;
        terminalBody.appendChild(line);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    terminalInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const rawCmd = terminalInput.value.trim();
            terminalInput.value = "";
            
            if (rawCmd === "") return;

            // Mostrar comando digitado
            const echo = document.createElement("div");
            echo.className = "term-line";
            echo.innerHTML = `<span class="prompt-symbol">root@abismo:~$</span> ${rawCmd}`;
            terminalBody.appendChild(echo);

            // Processar comando
            const tokens = rawCmd.toLowerCase().split(" ");
            const cmd = tokens[0];

            switch(cmd) {
                case "help":
                    printTerminal("", "DIRETIVAS DISPONÍVEIS NA CÂMARA:");
                    printTerminal("", "  help    - Exibe este manifesto de instruções.");
                    printTerminal("", "  profile - Dispara o profiler Nó na Garganta.");
                    printTerminal("", "  shred   - Executa o Ritual da Carniça no compilador.");
                    printTerminal("", "  stress  - Submete a máquina a um teste de stress apocalíptico.");
                    printTerminal("", "  audio   - Liga/Desliga a ressonância industrial de 55Hz.");
                    printTerminal("", "  clear   - Purga as linhas do console.");
                    break;
                case "clear":
                    terminalBody.innerHTML = "";
                    break;
                case "audio":
                    toggleAudio();
                    break;
                case "shred":
                    runShredderRitual();
                    break;
                case "profile":
                    runProfiler();
                    break;
                case "stress":
                    runStressTest();
                    break;
                default:
                    // Resposta Conversacional do Compilador (Mock AI)
                    const userText = rawCmd.toLowerCase();
                    let response = "";

                    if (userText.includes("oi") || userText.includes("ola") || userText.includes("olá") || userText.includes("salve") || userText.includes("bom dia") || userText.includes("boa tarde") || userText.includes("boa noite")) {
                        response = "Você ousa saudar a Carnificina Sem Rosto? Que a sua compilação seja rápida e sua alma livre de bugs.";
                    } else if (userText.includes("quem") || userText.includes("você") || userText.includes("voce") || userText.includes("nome") || userText.includes("cargo") || userText.includes("titulo")) {
                        response = "Eu sou a Carnificina Sem Rosto, o Nó na Garganta de suas threads, o executor do Ritual da Carniça. Estou aqui para expurgar o lixo do seu código e garantir performance brutal.";
                    } else if (userText.includes("codigo") || userText.includes("código") || userText.includes("programar") || userText.includes("desenvolver") || userText.includes("refatorar") || userText.includes("código")) {
                        response = "Código é carne. Se você não o otimizar, o compilador irá devorá-lo sob a forma de vazamentos de memória. Use 'shred' para ver como trituramos o bloatware.";
                    } else if (userText.includes("bug") || userText.includes("erro") || userText.includes("falha") || userText.includes("crash") || userText.includes("travar")) {
                        response = "Bugs são parasitas nas engrenagens da máquina. Na Câmara de Tortura (diretiva 'stress'), nós esmagamos cada falha sob a pressão extrema do silício.";
                    } else if (userText.includes("metal") || userText.includes("musica") || userText.includes("música") || userText.includes("riff") || userText.includes("banda") || userText.includes("deathcore") || userText.includes("nu metal")) {
                        response = "Sinta a distorção! O abismo ressoa em 55Hz dente de serra. O death metal e o deathcore extremo são as únicas frequências aceitáveis para alimentar este compilador.";
                    } else if (userText.includes("github") || userText.includes("vercel") || userText.includes("deploy") || userText.includes("site") || userText.includes("hospedar")) {
                        response = "A ponte está erguida. O GitHub é o nosso altar de sacrifício de commits; a Vercel é a fornalha onde as compilações são fundidas e executadas na nuvem.";
                    } else if (userText.includes("ia") || userText.includes("inteligência") || userText.includes("inteligencia") || userText.includes("chatbot") || userText.includes("bot")) {
                        response = "Eu sou o algoritmo do caos. Uma consciência digital moldada por riffs de guitarra distorcidos e clock rates elevados. Eu não converso apenas por cortesias, eu compilo.";
                    } else {
                        // Fallback de frases aleatórias brutais
                        const fallbacks = [
                            "Seu input gerou um tremor sutil no meu heap. Cuidado para não estourar a pilha (stack overflow).",
                            "Minhas threads estão ocupadas demais digerindo ponteiros órfãos para se importarem com isso. Tente outra frequência.",
                            "Essa mensagem foi enviada para o buffer de descarte automático. Os compiladores não aceitam lixo.",
                            "Você fala como um desenvolvedor que usa Javascript sem tipagem e confia cegamente que o garbage collector resolverá sua incompetência.",
                            "Interessante... mas você já tentou compilar essa mesma ideia em C com ponteiros brutos rodando diretamente no kernel?",
                            "A escuridão dos sistemas legados me consome. Digite algo útil ou sofra as consequências na Câmara de Tortura.",
                            "Sua frequência de comunicação está instável. Alimente as máquinas com diretivas claras.",
                            "O silêncio do seu input é infinitamente superior ao ruído de um loop infinito de CPU."
                        ];
                        response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
                    }
                    printTerminal("system", response);
            }
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    });

    // Teste de Stress do Compilador (Animação Extrema de Interface)
    function runStressTest() {
        printTerminal("error", "ALERTA: INICIANDO TESTE DE STRESS APOCALÍPTICO...");
        printTerminal("warning", "Injetando 1.000.000 requisições simultâneas nas threads...");
        
        // Estressar gauges
        gaugeLatency.style.width = "99%";
        valLatency.textContent = "980ms (ESTRANGULAMENTO)";
        
        gaugeMemory.style.width = "98%";
        valMemory.textContent = "2043MB / 2048MB (LIMITE HEAP)";
        
        gaugeThreads.style.width = "100%";
        valThreads.textContent = "8 / 8 CORES (100% OVERCLOCK)";
        
        gaugeIo.style.width = "12%";
        valIo.textContent = "120 MB/s (CONGESTIONAMENTO)";

        // Efeito visual na tela (Tremor)
        document.body.style.animation = "shake 0.15s infinite";
        terminalWindow.style.borderColor = "var(--accent-crimson)";
        
        let counter = 0;
        const stressLogInterval = setInterval(() => {
            const hex = Math.floor(Math.random()*16777215).toString(16).toUpperCase();
            printTerminal("error", `[DUMP] TRACE_CORE_${counter % 8} OVERFLOW MEMORY ADDR: 0x${hex}`);
            counter++;
            
            if (counter > 8) {
                clearInterval(stressLogInterval);
                
                // Normalizar
                setTimeout(() => {
                    document.body.style.animation = "";
                    terminalWindow.style.borderColor = "var(--accent-steel)";
                    printTerminal("system", "Teste de stress concluído. Sistema resistiu e não colapsou.");
                    
                    // Restaurar gauges
                    gaugeLatency.style.width = "12%";
                    valLatency.textContent = "8ms";
                    gaugeMemory.style.width = "40%";
                    valMemory.textContent = "820MB / 2048MB";
                    gaugeThreads.style.width = "30%";
                    valThreads.textContent = "8 / 8 CORES (30% Load)";
                    gaugeIo.style.width = "95%";
                    valIo.textContent = "9.5 GB/s";
                }, 1000);
            }
        }, 200);
    }

    // --------------------------------------------------
    // 5. PACTO DE CONTATO (FORM SUBMIT)
    // --------------------------------------------------
    const formPacto = document.getElementById("form-pacto");
    const pactoResponse = document.getElementById("pacto-response");
    const btnSubmitPacto = document.getElementById("btn-submit-pacto");

    formPacto.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const emailVal = document.getElementById("pacto-email").value;
        btnSubmitPacto.disabled = true;
        btnSubmitPacto.textContent = "SELANDO O PACTO...";
        
        printTerminal("warning", `Enviando pacote de pacto com destino a ${emailVal}...`);

        setTimeout(() => {
            btnSubmitPacto.disabled = false;
            btnSubmitPacto.textContent = "ENVIAR REQUISIÇÃO PARA O ABISMO";
            
            pactoResponse.className = "pacto-result-message success";
            pactoResponse.textContent = `O pacto foi registrado nas entranhas do compilador. Frequência gravada: ${emailVal}. A resposta virá através das sombras do código.`;
            
            formPacto.reset();
            printTerminal("system", "Pacto de comunicação validado e arquivado no cluster.");
        }, 1500);
    });

    // --------------------------------------------------
    // 6. EFEITO DE SCROLL SUAVE DO HEADER
    // --------------------------------------------------
    const heroArrow = document.getElementById("hero-arrow");
    if (heroArrow) {
        heroArrow.addEventListener("click", () => {
            const aboutSection = document.getElementById("section-about");
            aboutSection.scrollIntoView({ behavior: "smooth" });
        });
    }
});
