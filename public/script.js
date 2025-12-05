const API = "/api";
let todasReservas = [];
let todasMesas = [];

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    
    // Listener do Formulário
    document.getElementById("form-reserva").addEventListener("submit", salvarReserva);
    
    // Listeners de Filtro
    document.getElementById("filtroStatus").addEventListener("change", carregarDados);
    document.getElementById("filtroData").addEventListener("change", carregarDados);
});

async function carregarDados() {
    try {
        // Carrega Mesas
        const resMesas = await fetch(`${API}/mesas`);
        todasMesas = await resMesas.json();

        // Carrega Reservas com Filtros
        const status = document.getElementById("filtroStatus").value;
        const data = document.getElementById("filtroData").value;
        
        // Monta URL de busca
        let urlReservas = `${API}/reservas?`;
        if(status) urlReservas += `status=${status}&`;
        if(data) urlReservas += `data=${data}`;

        const resReservas = await fetch(urlReservas);
        todasReservas = await resReservas.json();

        renderizarMapa();
        renderizarTabela();
        atualizarSelectMesas();
    } catch (error) {
        console.error("Erro ao carregar:", error);
    }
}

// === LÓGICA DO MAPA VISUAL ===
function renderizarMapa() {
    const container = document.getElementById("mapa-mesas");
    container.innerHTML = "";
    const agora = new Date();

    todasMesas.forEach(mesa => {
        const div = document.createElement("div");
        div.className = "mesa";
        
        // Verifica status da mesa baseado nas reservas ativas
        // Regra: Uma mesa pode ter várias reservas, pegamos a que está acontecendo ou a próxima
        const reservaAtiva = todasReservas.find(r => 
            r.mesaId && 
            r.mesaId._id === mesa._id && 
            r.status !== 'cancelado' &&
            r.status !== 'finalizado'
        );

        let statusClass = "disponivel";
        let textoStatus = "Livre";

        if (reservaAtiva) {
            statusClass = reservaAtiva.status; // reservado ou ocupado
            textoStatus = statusClass === 'ocupado' ? "OCUPADO" : "RESERVADO";
            
            // Evento de clique para ver detalhes
            div.onclick = () => alert(`Mesa ${mesa.numero}\nCliente: ${reservaAtiva.nomeCliente}\nHorário: ${new Date(reservaAtiva.dataHora).toLocaleTimeString()}\nStatus: ${reservaAtiva.status}`);
        } else {
            // Evento de clique para reservar
            div.onclick = () => abrirModalCriacao(mesa._id);
        }

        div.classList.add(statusClass);
        div.innerHTML = `
            <i class="material-icons">restaurant</i>
            <span>Mesa ${mesa.numero}</span>
            <small>${textoStatus}</small>
            <small>${mesa.capacidade} lug.</small>
        `;
        
        container.appendChild(div);
    });
}

// === LÓGICA DA TABELA ===
function renderizarTabela() {
    const tbody = document.querySelector("#tabela-reservas tbody");
    tbody.innerHTML = "";

    if(todasReservas.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center'>Nenhuma reserva encontrada.</td></tr>";
        return;
    }

    todasReservas.forEach(r => {
        const tr = document.createElement("tr");
        const mesaNum = r.mesaId ? r.mesaId.numero : "N/A";
        const dataFmt = new Date(r.dataHora).toLocaleString('pt-BR');

        tr.innerHTML = `
            <td>Mesa ${mesaNum}</td>
            <td>${r.nomeCliente}</td>
            <td>${dataFmt}</td>
            <td>${r.qtdPessoas}</td>
            <td><span class="badge ${getStatusColor(r.status)}">${r.status}</span></td>
            <td>
                <button class="btn-edit" onclick='abrirModalEdicao(${JSON.stringify(r)})'><i class="material-icons" style="font-size:16px">edit</i></button>
                ${r.status !== 'cancelado' ? `<button class="btn-danger" onclick="cancelarReserva('${r._id}')"><i class="material-icons" style="font-size:16px">close</i></button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getStatusColor(status) {
    if (status === 'finalizado') return 'verde';    // Verde = finalizado
    if (status === 'ocupado') return 'amarelo';     // Amarelo = ocupado
    if (status === 'cancelado') return 'vermelho';   // Laranja = cancelado
    if (status === 'reservado') return 'laranja';  // Vermelho = reservado
    
    return 'cinza'; // Caso padrão
}

// === LÓGICA DO MODAL E FORMULÁRIO ===
const modal = document.getElementById("modalReserva");

function abrirModalCriacao(mesaIdPreSelecionada = null) {
    document.getElementById("form-reserva").reset();
    document.getElementById("reservaId").value = "";
    document.getElementById("modalTitulo").textContent = "Nova Reserva";
    
    if(mesaIdPreSelecionada) {
        document.getElementById("mesaSelect").value = mesaIdPreSelecionada;
    }
    modal.style.display = "block";
}

function abrirModalEdicao(reserva) {
    document.getElementById("reservaId").value = reserva._id;
    document.getElementById("modalTitulo").textContent = "Editar Reserva";
    
    document.getElementById("mesaSelect").value = reserva.mesaId._id || reserva.mesaId;
    document.getElementById("nome").value = reserva.nomeCliente;
    document.getElementById("contato").value = reserva.contatoCliente;
    document.getElementById("qtd").value = reserva.qtdPessoas;
    
    // Formatar data para input datetime-local (yyyy-MM-ddThh:mm)
    const dt = new Date(reserva.dataHora);
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
    document.getElementById("dataHora").value = dt.toISOString().slice(0,16);

    modal.style.display = "block";
}

function fecharModal() {
    modal.style.display = "none";
}

async function salvarReserva(e) {
    e.preventDefault();
    
    const id = document.getElementById("reservaId").value;
    const body = {
        mesaId: document.getElementById("mesaSelect").value,
        nomeCliente: document.getElementById("nome").value,
        contatoCliente: document.getElementById("contato").value,
        qtdPessoas: Number(document.getElementById("qtd").value),
        dataHora: document.getElementById("dataHora").value
    };

    try {
        let res;
        if (id) {
            // EDITAR (PUT)
            res = await fetch(`${API}/reservas/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        } else {
            // CRIAR (POST)
            res = await fetch(`${API}/reservas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        }

        const json = await res.json();
        
        if (res.ok) {
            alert(id ? "Reserva atualizada!" : "Reserva criada!");
            fecharModal();
            carregarDados();
        } else {
            alert("Erro: " + json.message);
        }
    } catch (error) {
        alert("Erro de conexão");
    }
}

async function cancelarReserva(id) {
    if(!confirm("Tem certeza que deseja cancelar?")) return;
    await fetch(`${API}/reservas/${id}/cancelar`, { method: "PUT" });
    carregarDados();
}

function atualizarSelectMesas() {
    const select = document.getElementById("mesaSelect");
    // Guarda o valor atual caso esteja editando
    const valorAtual = select.value; 
    select.innerHTML = "";
    
    todasMesas.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m._id;
        opt.textContent = `Mesa ${m.numero} (${m.localizacao} - ${m.capacidade} lug.)`;
        select.appendChild(opt);
    });

    if(valorAtual) select.value = valorAtual;
}

// Fechar modal se clicar fora
window.onclick = function(event) {
    if (event.target == modal) fecharModal();
}

// ==================================================
// 🥚 EASTER EGG: PROTOCOLO DOOM
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
    const footer = document.getElementById("secret-footer");
    let clickCount = 0;
    let clickTimer;

    if (footer) {
        // Muda o cursor para indicar que é clicável (sutil)
        footer.style.cursor = "pointer";
        footer.title = "???"; // Dica sutil ao passar o mouse

        footer.addEventListener("click", () => {
            clickCount++;
            
            // Feedback visual sutil a cada clique (pisca levemente vermelho)
            footer.style.color = "#e74c3c";
            setTimeout(() => footer.style.color = "", 200);

            // Reseta o contador se parar de clicar por 2 segundos
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000);

            if (clickCount === 6) {
                ativarModoDoom();
                clickCount = 0; // Reseta para não abrir duas vezes
            }
        });
    }
});

function ativarModoDoom() {
    // 1. Criar o container da tela cheia
    const doomContainer = document.createElement("div");
    doomContainer.id = "doom-overlay";
    
    // Estilos para tela cheia e centralização
    Object.assign(doomContainer.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        zIndex: "9999",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    });

    // 2. Criar o botão de fechar (Essencial para parar a música depois)
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "FECHAR JOGO E VOLTAR AO TRABALHO";
    Object.assign(closeBtn.style, {
        position: "absolute",
        top: "20px",
        right: "20px",
        padding: "12px 24px",
        backgroundColor: "#e74c3c",
        color: "white",
        border: "none",
        fontWeight: "bold",
        cursor: "pointer",
        zIndex: "10000",
        borderRadius: "4px",
        fontFamily: "'Segoe UI', sans-serif",
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
    });

    closeBtn.onclick = () => {
        document.body.removeChild(doomContainer);
    };

    // 3. Criar o Iframe do Internet Archive (FONTE ESTÁVEL)
    const iframe = document.createElement("iframe");
    // URL do Internet Archive: Ultimate DOOM
    iframe.src = "https://archive.org/embed/doom-play";
    
    Object.assign(iframe.style, {
        width: "640px",         // Tamanho nativo do DOSBox web
        height: "480px",
        border: "none",
        boxShadow: "0 0 50px rgba(231, 76, 60, 0.5)", // Brilho vermelho temático
        maxWidth: "90%",
        maxHeight: "90%"
    });

    // Permissões para funcionar tela cheia e som
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("webkitallowfullscreen", "true");
    iframe.setAttribute("mozallowfullscreen", "true");

    // 4. Montar na tela
    doomContainer.appendChild(closeBtn);
    doomContainer.appendChild(iframe);
    document.body.appendChild(doomContainer);

    // Tenta focar no botão para capturar o teclado se necessário
    closeBtn.focus();
}