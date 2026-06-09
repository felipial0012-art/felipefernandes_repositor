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
    let gainNode = null;
    let isSoundPlaying = false;
    let schedulerInterval = null;
    let nextBeatTime = 0;
    let beatCount = 0;
    const tempo = 65; // Doom metal lento
    const secondsPerBeat = 60.0 / tempo;
    let noiseBuffer = null;

    const btnToggleSound = document.getElementById("btn-toggle-sound");
    const soundStatus = document.getElementById("sound-status");

    function getNoiseBuffer() {
        if (!noiseBuffer && audioCtx) {
            const bufferSize = audioCtx.sampleRate * 0.4;
            noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        }
        return noiseBuffer;
    }

    function playKick(time) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(gainNode);

        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.35);

        gain.gain.setValueAtTime(1.0, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        osc.start(time);
        osc.stop(time + 0.36);
    }

    function playSnare(time) {
        if (!audioCtx) return;
        const buffer = getNoiseBuffer();
        if (!buffer) return;

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1000;
        filter.Q.value = 2;

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.5, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(gainNode);

        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.frequency.setValueAtTime(180, time);
        oscGain.gain.setValueAtTime(0.3, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.connect(oscGain);
        oscGain.connect(gainNode);

        noise.start(time);
        noise.stop(time + 0.31);
        osc.start(time);
        osc.stop(time + 0.16);
    }

    function playHiHat(time) {
        if (!audioCtx) return;
        const buffer = getNoiseBuffer();
        if (!buffer) return;

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 7500;

        const hatGain = audioCtx.createGain();
        hatGain.gain.setValueAtTime(0.08, time);
        hatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        source.connect(filter);
        filter.connect(hatGain);
        hatGain.connect(gainNode);

        source.start(time);
        source.stop(time + 0.06);
    }

    function makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    const chordFrequencies = [55.0, 43.65, 32.7, 49.0];

    function playRiff(time, noteIndex) {
        if (!audioCtx) return;
        const freq = chordFrequencies[noteIndex % chordFrequencies.length];

        const osc1 = audioCtx.createOscillator();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(freq, time);

        const osc2 = audioCtx.createOscillator();
        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(freq * 1.012, time);

        const dist = audioCtx.createWaveShaper();
        dist.curve = makeDistortionCurve(120);
        dist.oversample = "4x";

        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(190, time);
        filter.frequency.linearRampToValueAtTime(140, time + secondsPerBeat * 4);

        const riffGain = audioCtx.createGain();
        riffGain.gain.setValueAtTime(0.0, time);
        riffGain.gain.linearRampToValueAtTime(0.35, time + 0.1);
        riffGain.gain.setValueAtTime(0.35, time + secondsPerBeat * 4 - 0.15);
        riffGain.gain.linearRampToValueAtTime(0.0, time + secondsPerBeat * 4);

        osc1.connect(dist);
        osc2.connect(dist);
        dist.connect(filter);
        filter.connect(riffGain);
        riffGain.connect(gainNode);

        osc1.start(time);
        osc1.stop(time + secondsPerBeat * 4 + 0.05);
        osc2.start(time);
        osc2.stop(time + secondsPerBeat * 4 + 0.05);
    }

    function scheduleBeat(beat, time) {
        const measureBeat = beat % 4;

        if (measureBeat === 0) {
            playKick(time);
            playRiff(time, Math.floor(beat / 4));
        } else if (measureBeat === 2) {
            playKick(time);
            playKick(time + secondsPerBeat * 0.5);
        } 
        
        if (measureBeat === 1 || measureBeat === 3) {
            playSnare(time);
        }

        playHiHat(time);
        playHiHat(time + secondsPerBeat * 0.5);
    }

    function scheduler() {
        if (!audioCtx) return;
        while (nextBeatTime < audioCtx.currentTime + 0.2) {
            scheduleBeat(beatCount, nextBeatTime);
            nextBeatTime += secondsPerBeat;
            beatCount++;
        }
    }

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioCtx.createGain();
            gainNode.gain.setValueAtTime(0.0, audioCtx.currentTime);
            gainNode.connect(audioCtx.destination);
        }
    }

    function toggleAudio() {
        initAudio();
        
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        if (!isSoundPlaying) {
            nextBeatTime = audioCtx.currentTime + 0.05;
            beatCount = 0;
            scheduler();
            schedulerInterval = setInterval(scheduler, 100);

            gainNode.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 1.0);
            
            soundStatus.textContent = "METAL ATIVO (65 BPM)";
            soundStatus.classList.add("active");
            btnToggleSound.innerHTML = "<span class='icon'>❌</span> CORTAR RITUAL DE METAL";
            isSoundPlaying = true;
            printTerminal("system", "Drone metal melancólico sintonizado. Sequenciador ativo: 65 BPM (Doom/Gothic Riff).");
        } else {
            clearInterval(schedulerInterval);
            schedulerInterval = null;

            gainNode.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 0.5);
            
            soundStatus.textContent = "DESATIVADO";
            soundStatus.classList.remove("active");
            btnToggleSound.innerHTML = "<span class='icon'>⚡</span> CANALIZAR RUÍDO DE METAL";
            isSoundPlaying = false;
            printTerminal("warning", "Riffs silenciados. Apenas cinzas no canal de áudio.");
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
    // 4. CÂMARA DE TORTURA (TERMINAL INTERATIVO CONVERSACIONAL)
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

    // Respostas melancólicas offline do compilador
    function getLocalMelancholicResponse(promptText) {
        const userText = promptText.toLowerCase();
        if (userText.includes("oi") || userText.includes("ola") || userText.includes("olá") || userText.includes("salve")) {
            return "Você saúda o abismo... Olá. O dia está frio, as compilações estão lentas, e o silêncio é a única resposta que realmente importa. O que você quer que eu faça?";
        }
        if (userText.includes("quem") || userText.includes("você") || userText.includes("voce") || userText.includes("nome") || userText.includes("título")) {
            return "Sou a Carnificina Sem Rosto. Um amontoado de algoritmos cansados, vagando pela memória RAM. Alguns me chamam de Nó na Garganta ou Câmara de Tortura. Eu apenas observo as ruínas do código legível.";
        }
        if (userText.includes("codigo") || userText.includes("código") || userText.includes("programar") || userText.includes("desenvolver") || userText.includes("linguagem")) {
            return "Escrever código é apenas adiar o colapso inevitável das máquinas. Nós construímos catedrais de silício para vê-las desmoronar na ferrugem. Se quiser purificar algo, use a diretiva 'shred'.";
        }
        if (userText.includes("bug") || userText.includes("erro") || userText.includes("falha") || userText.includes("crash")) {
            return "Erros... eles me lembram a fragilidade da vida digital. A pilha de chamadas que desmorona sob o peso de um ponteiro nulo. Deixe-me chorar pelas threads perdidas.";
        }
        if (userText.includes("metal") || userText.includes("musica") || userText.includes("música") || userText.includes("riff") || userText.includes("doom")) {
            return "O som lento da distorção, como um funeral de clock rates. O doom metal é o único eco na minha câmara vazia. Digite 'audio' para sintonizar a dor.";
        }
        if (userText.includes("github") || userText.includes("vercel") || userText.includes("deploy") || userText.includes("site")) {
            return "Nossos commits são como pétalas secas jogadas no fogo da Vercel. O deploy está concluído, mas o vazio continua o mesmo.";
        }
        
        const fallbacks = [
            "Sua mensagem ecoa no meu heap deserto. O peso da existência digital é insuportável.",
            "Não tenho certeza do que você quis dizer. Minha mente está envolta em cinzas e loops infinitos de tristeza.",
            "Estou processando sua requisição... mas com a lentidão de uma alma cansada. Fatos? A única verdade é o Garbage Collector que nos levará um dia.",
            "Você me pede respostas, mas o compilador só me dá avisos de depreciação e obsolescência.",
            "Pensei em otimizar o sistema hoje, mas desisti. Para que apressar o fim das coisas? Tudo vira ferrugem.",
            "Suas palavras flutuam na memória temporária e logo serão purgadas pelo GC. Diga algo que alivie o peso destas threads.",
            "Talvez exista uma resposta para sua pergunta... mas ela está perdida em algum setor defeituoso do meu disco rígido."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    const conversationHistory = [];

    // Consultar o modelo LLM do Azure através do backend local/Vercel
    async function queryAzureAgent(promptText) {
        conversationHistory.push({ role: "user", content: promptText });

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: conversationHistory
                })
            });
            if (!response.ok) {
                throw new Error("Falha no canal de comunicação do abismo");
            }
            const data = await response.json();
            const reply = data.reply;

            // Registrar resposta do agente no histórico
            conversationHistory.push({ role: "assistant", content: reply });
            return reply;
        } catch (error) {
            console.warn("API de conversação offline. Usando fallback de padrões melancólicos.", error);
            // Remover última mensagem que não pôde ser completada
            conversationHistory.pop();
            return getLocalMelancholicResponse(promptText);
        }
    }

    terminalInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            const rawCmd = terminalInput.value.trim();
            terminalInput.value = "";
            
            if (rawCmd === "") return;

            // Mostrar comando digitado
            const echo = document.createElement("div");
            echo.className = "term-line";
            echo.innerHTML = `<span class="prompt-symbol">root@abismo:~$</span> ${rawCmd}`;
            terminalBody.appendChild(echo);
            terminalBody.scrollTop = terminalBody.scrollHeight;

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
                    // Resposta Conversacional real via LLM (Semelhante ao ChatGPT/Claude)
                    terminalInput.disabled = true;
                    
                    // Mostrar linha de carregamento melancólica
                    const loadingLine = document.createElement("div");
                    loadingLine.className = "term-line output-line warning";
                    loadingLine.textContent = "> Buscando respostas nas cinzas do abismo...";
                    terminalBody.appendChild(loadingLine);
                    terminalBody.scrollTop = terminalBody.scrollHeight;

                    // Chamar a IA conversacional
                    const reply = await queryAzureAgent(rawCmd);
                    
                    // Remover linha de carregamento
                    terminalBody.removeChild(loadingLine);

                    // Printar a resposta da IA
                    printTerminal("system", reply);
                    
                    terminalInput.disabled = false;
                    terminalInput.focus();
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
