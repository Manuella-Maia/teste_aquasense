const btnRefresh = document.getElementById("btnRefresh");
const btnToggleDark = document.getElementById("btnToggleDark");
const filterTanque = document.getElementById("filterTanque");
const filterParametro = document.getElementById("filterParametro");
const tankList = document.getElementById("tankList");

let allTanques = []; // Armazena todos os dados dos tanques
let darkMode = false; // Variável para controlar o estado do tema

// Ícones FontAwesome por parâmetro
const paramIcons = {
  condutividade: '<i class="fas fa-water param-icon" title="Condutividade"></i>',
  ph: '<i class="fas fa-vial param-icon" title="pH"></i>',
  oxigenio: '<i class="fas fa-tint param-icon" title="Oxigênio Dissolvido"></i>',
  temperatura: '<i class="fas fa-thermometer-half param-icon" title="Temperatura"></i>',
};

// --- DADOS SIMULADOS PARA SUBSTITUIR O BACKEND PHP ---
// Estes dados simulam o que viria do 'das_get_dados.php'
// Revertido para apenas 3 tanques conforme solicitado
let simulatedTankData = [
  {
    tanque_id: 1,
    nome: "Tanque Principal",
    especie: "Tilápia",
    capacidade: "200m³",
    condutividade: 450,
    ph: 7.2,
    oxigenio: 6.8,
    temperatura: 26.5,
    timestamp: "2025-07-12 14:30:00"
  },
  {
    tanque_id: 2,
    nome: "Tanque Secundário",
    especie: "Pacu",
    capacidade: "150m³",
    condutividade: 580, // Valor mais alto para simular "Atenção"
    ph: 6.9,
    oxigenio: 5.5,
    temperatura: 27.1,
    timestamp: "2025-07-12 14:25:00"
  },
  {
    tanque_id: 3,
    nome: "Tanque Experimental",
    especie: "Tambaqui",
    capacidade: "100m³",
    condutividade: 1300, // Valor muito alto para simular "Crítico"
    ph: 7.5,
    oxigenio: 7.2,
    temperatura: 25.9,
    timestamp: "2025-07-12 14:20:00"
  }
];

// Função para simular a busca de dados (substitui o fetch ao PHP)
function simulateFetchDasDados() {
  return new Promise(resolve => {
    setTimeout(() => {
      // Simula alguma flutuação nos dados para um efeito mais dinâmico
      const updatedData = simulatedTankData.map(tank => {
        // Apenas atualiza se houver dados existentes
        if (tank.timestamp) {
          return {
            ...tank,
            condutividade: parseFloat((tank.condutividade + (Math.random() * 20 - 10)).toFixed(2)),
            ph: parseFloat((tank.ph + (Math.random() * 0.2 - 0.1)).toFixed(2)),
            oxigenio: parseFloat((tank.oxigenio + (Math.random() * 0.5 - 0.25)).toFixed(2)),
            temperatura: parseFloat((tank.temperatura + (Math.random() * 0.8 - 0.4)).toFixed(2)),
            timestamp: new Date().toLocaleString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };
        }
        return tank; // Retorna o tanque sem alteração se não houver timestamp
      });
      simulatedTankData = updatedData; // Atualiza os dados simulados
      resolve(updatedData);
    }, 500); // Simula um atraso de rede
  });
}
// --- FIM DOS DADOS SIMULADOS ---


// --- FUNÇÃO getStatus ATUALIZADA PARA CONDUTIVIDADE ---
function getStatus(param, value) {
  if (value === null || value === undefined || isNaN(value)) {
    return "unknown"; // Se sem dados, considera desconhecido (cinza)
  }

  if (param === "condutividade") {
    // Definição dos limites conforme o seu PHP para condutividade
    const LIMITE_NORMAL_MAX = 500;
    const LIMITE_ALERTA_PREDITIVO = 800; // Alerta Preditivo (Atenção)
    const LIMITE_CRITICO = 1200; // Alerta Crítico

    // Ordem de verificação é importante: do mais crítico para o normal
    if (value >= LIMITE_CRITICO) {
      return "red"; // Vermelho - Crítico (>= 1200)
    } else if (value > LIMITE_NORMAL_MAX && value < LIMITE_CRITICO) {
      return "yellow"; // Amarelo - Atenção/Preditivo (501 a 1199)
    } else if (value <= LIMITE_NORMAL_MAX) {
      return "green"; // Verde - Normal (<= 500)
    }
    return "unknown"; // Fallback
  } else if (param === "ph") {
    // Exemplo de limites para pH (ajuste conforme necessário)
    if (value >= 6.5 && value <= 8.0) {
      return "green";
    } else if ((value >= 6.0 && value < 6.5) || (value > 8.0 && value <= 8.5)) {
      return "yellow";
    } else {
      return "red";
    }
  } else if (param === "oxigenio") {
    // Exemplo de limites para Oxigênio Dissolvido (ajuste conforme necessário)
    if (value >= 5.0) {
      return "green";
    } else if (value >= 3.0 && value < 5.0) {
      return "yellow";
    } else {
      return "red";
    }
  } else if (param === "temperatura") {
    // Exemplo de limites para Temperatura (ajuste conforme necessário)
    if (value >= 24.0 && value <= 30.0) {
      return "green";
    } else if ((value >= 22.0 && value < 24.0) || (value > 30.0 && value <= 32.0)) {
      return "yellow";
    } else {
      return "red";
    }
  }
  return "unknown"; // Parâmetro desconhecido
}

function getStatusText(statusClass) {
  switch (statusClass) {
    case "green":
      return "Normal";
    case "yellow":
      return "Atenção";
    case "red":
      return "Crítico";
    case "unknown":
      return "Sem Dados";
    default:
      return "Desconhecido";
  }
}

function createParameterMini(param, value, tanque_id, tanque_nome) {
  // Se um filtro de parâmetro específico está ativo e não é este parâmetro, não renderiza
  if (filterParametro.value !== "all" && filterParametro.value !== param) {
    return "";
  }

  const icon = paramIcons[param] || "";
  const statusClass = getStatus(param, value);
  const valueDisplay = value !== null && value !== undefined && !isNaN(value) ? value.toFixed(param === "ph" ? 1 : 2) : "-";

  let unit = "";
  if (param === "condutividade") unit = "µS/cm";
  else if (param === "oxigenio") unit = "mg/L";
  else if (param === "temperatura") unit = "°C";
  // pH não tem unidade comum aqui

  // Link para a página de detalhes do tanque, passando ID e nome
  const linkHref = `condutividade.html?tanque_id=${tanque_id}&nome=${encodeURIComponent(tanque_nome)}`;

  return `
    <a href="${linkHref}" class="parameter-mini" title="Detalhes ${param.charAt(0).toUpperCase() + param.slice(1)} Tanque ${tanque_id}">
      ${icon}
      <h4>${param.charAt(0).toUpperCase() + param.slice(1)}</h4>
      <span class="value"><span class="number">${valueDisplay}</span><span class="unit"> ${unit}</span></span>
      <div class="status-indicator ${statusClass}"></div>
    </a>
  `;
}

function renderTanques(tanques) {
  tankList.innerHTML = ""; // Limpa a lista antes de renderizar

  let filteredTanques = tanques;
  if (filterTanque.value !== "all") {
    filteredTanques = tanques.filter((t) => t.tanque_id == filterTanque.value);
  }

  if (filteredTanques.length === 0) {
    tankList.innerHTML = "<p class='no-tanks-message'>Nenhum tanque encontrado com os filtros selecionados.</p>";
    return;
  }

  filteredTanques.forEach((tanque) => {
    // Verifica se o tanque tem dados de leitura (timestamp)
    const hasData = tanque.timestamp !== null;
    const leituraFormatada = hasData ? new Date(tanque.timestamp).toLocaleString("pt-BR") : 'N/A';

    let parametrosHtml = "";
    // Renderiza os minis de parâmetro apenas se houver dados
    if (hasData) {
      parametrosHtml += createParameterMini("condutividade", tanque.condutividade, tanque.tanque_id, tanque.nome);
      parametrosHtml += createParameterMini("ph", tanque.ph, tanque.tanque_id, tanque.nome);
      parametrosHtml += createParameterMini("oxigenio", tanque.oxigenio, tanque.tanque_id, tanque.nome);
      parametrosHtml += createParameterMini("temperatura", tanque.temperatura, tanque.tanque_id, tanque.nome);
    } else {
      parametrosHtml = `<p class="no-data-message">Sem dados de leitura recentes.</p>`;
    }

    // Se o filtro de parâmetro está ativo e nenhum parâmetro foi renderizado (ex: tanque sem dados), não renderiza o card
    if (filterParametro.value !== "all" && !hasData && parametrosHtml.includes("no-data-message")) {
        return;
    }


    const card = document.createElement("div");
    card.className = "tank-card";
    // Adiciona uma classe se não houver dados, para estilização visual
    if (!hasData) {
        card.classList.add('no-data-card');
    }

    card.innerHTML = `
      <h3>Tanque ${tanque.tanque_id} - ${tanque.nome}</h3>
      <p>Última leitura: ${leituraFormatada}</p>
      <div class="parameter-dashboard">
        ${parametrosHtml}
      </div>
      <div class="card-actions">
        <a href="historico_anual.html?tanque_id=${tanque.tanque_id}&nome=${encodeURIComponent(tanque.nome)}" class="btn-historico">
          <i class="fas fa-chart-line"></i> Ver Histórico Anual
        </a>
      </div>
    `;

    tankList.appendChild(card);
  });
}

function preencherFiltroTanque(tanques) {
  // Guarda o valor selecionado antes de limpar
  const currentSelected = filterTanque.value;
  filterTanque.innerHTML = '<option value="all">Todos os Tanques</option>';
  // Garante que apenas tanques ativos sejam mostrados no filtro, se desejar
  const activeTanques = tanques.filter(t => t.is_active !== 0); // Assumindo que is_active é 0 para inativo
  const tankIds = [...new Set(activeTanques.map((t) => t.tanque_id))].sort((a, b) => a - b);
  tankIds.forEach((id) => {
    filterTanque.innerHTML += `<option value="${id}">Tanque ${id}</option>`;
  });
  // Restaura o valor selecionado, se ainda existir
  if (tankIds.includes(parseInt(currentSelected)) || currentSelected === "all") {
    filterTanque.value = currentSelected;
  }
}

function carregarDados() {
  btnRefresh.disabled = true;
  btnRefresh.classList.add("loading");
  tankList.innerHTML = "<p class='loading-message'>Carregando dados dos tanques...</p>"; // Mensagem de carregamento

  // Usa a função de simulação em vez do fetch real
  simulateFetchDasDados()
    .then((dados) => {
      allTanques = dados;
      preencherFiltroTanque(allTanques);
      renderTanques(allTanques);
    })
    .catch((err) => {
      console.error("Erro ao carregar dados simulados:", err);
      tankList.innerHTML = "<p class='error-message'>Erro ao carregar dados. Tente atualizar a página.</p>";
    })
    .finally(() => {
      btnRefresh.disabled = false;
      btnRefresh.classList.remove("loading");
    });
}

// Event Listeners
btnRefresh.addEventListener("click", carregarDados);
filterTanque.addEventListener("change", () => renderTanques(allTanques));
filterParametro.addEventListener("change", () => renderTanques(allTanques));

// --- Lógica do Botão de Tema ---
const applyTheme = (isDarkMode) => {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        btnToggleDark.querySelector('i').classList.remove("fa-moon");
        btnToggleDark.querySelector('i').classList.add("fa-sun");
        btnToggleDark.title = "Alternar Modo Claro";
    } else {
        document.body.classList.remove('dark-mode');
        btnToggleDark.querySelector('i').classList.remove("fa-sun");
        btnToggleDark.querySelector('i').classList.add("fa-moon");
        btnToggleDark.title = "Alternar Modo Escuro";
    }
};

// Carregar preferência de tema do localStorage ao iniciar
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    applyTheme(true);
} else {
    applyTheme(false);
}

btnToggleDark.addEventListener("click", () => {
  const isDarkMode = document.body.classList.contains('dark-mode');
  applyTheme(!isDarkMode);
  localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
});
// --- Fim da Lógica do Botão de Tema ---

// Carrega os dados iniciais ao carregar a página
document.addEventListener("DOMContentLoaded", carregarDados);
