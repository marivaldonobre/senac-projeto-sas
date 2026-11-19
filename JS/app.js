
// ==========================================
// DADOS DO SISTEMA
// ==========================================

let usuarios = JSON.parse(localStorage.getItem("sasUsuarios") || "[]");
let servicos = JSON.parse(localStorage.getItem("sasServicos") || "[]");

let perfilSelecionado = "";
let usuarioAtual = null;

const telas = [
    "telaInicial",
    "telaLogin",
    "telaPerfil",
    "telaCadastro",
    "painelPrestador",
    "painelCliente",
    "telaCadastroServico"
];


// ==========================================
// FUNÇÕES GERAIS
// ==========================================

function salvarUsuarios() {
    localStorage.setItem("sasUsuarios", JSON.stringify(usuarios));
}

function salvarServicos() {
    localStorage.setItem("sasServicos", JSON.stringify(servicos));
}

function mostrarTela(id) {
    telas.forEach(tela => {
        document.getElementById(tela).classList.add("oculto");
    });

    document.getElementById(id).classList.remove("oculto");
}

function abrirPainelUsuario() {
    if (!usuarioAtual) return;

    if (usuarioAtual.perfil === "prestador") {
        document.getElementById("boasVindasPrestador").textContent =
            `Olá, ${usuarioAtual.nome}!`;

        atualizarListaServicos();
        mostrarTela("painelPrestador");

    } else {
        document.getElementById("boasVindasCliente").textContent =
            `Olá, ${usuarioAtual.nome}!`;

        atualizarCatalogoCliente();
        mostrarTela("painelCliente");
    }
}


// ==========================================
// EXCLUSÃO DE CONTA
// ==========================================

function apagarConta() {
    if (!usuarioAtual) {
        alert("Nenhuma conta está conectada.");
        return;
    }

    const emailConta = usuarioAtual.email;
    const ehPrestador = usuarioAtual.perfil === "prestador";

    let mensagem = "Tem certeza de que deseja apagar sua conta?";

    if (ehPrestador) {
        mensagem +=
            "\n\nATENÇÃO: todos os seus serviços cadastrados também serão apagados.";
    }

    mensagem += "\n\nEssa ação não poderá ser desfeita.";

    const confirmou = confirm(mensagem);

    if (!confirmou) {
        return;
    }

    // Remove o usuário da lista de contas
    usuarios = usuarios.filter(usuario =>
        usuario.email !== emailConta
    );

    salvarUsuarios();

    // Se for prestador, remove também seus serviços
    if (ehPrestador) {
        servicos = servicos.filter(servico =>
            servico.prestadorEmail !== emailConta
        );

        salvarServicos();
    }

    // Encerra a sessão atual
    usuarioAtual = null;

    // Atualiza as listas exibidas no sistema
    atualizarListaServicos();
    atualizarCatalogoCliente();

    // Retorna à tela inicial
    mostrarTela("telaInicial");

    alert("Sua conta foi apagada com sucesso!");
}


// ==========================================
// SERVIÇOS DO PRESTADOR
// ==========================================

function atualizarListaServicos() {
    const lista = document.getElementById("listaServicos");

    if (!lista) return;

    lista.innerHTML = "";

    const meusServicos = servicos.filter(servico =>
        servico.prestadorEmail === usuarioAtual?.email
    );

    const mensagemTitulo = document.querySelector(".mensagemPainel > strong");
    const mensagemTexto = document.querySelector(".mensagemPainel > p");

    if (mensagemTitulo) {
        mensagemTitulo.style.display =
            meusServicos.length === 0 ? "block" : "none";
    }

    if (mensagemTexto) {
        mensagemTexto.style.display =
            meusServicos.length === 0 ? "block" : "none";
    }

    if (meusServicos.length === 0) {
        lista.innerHTML = `
            <p class="semServicos">
                Você ainda não cadastrou nenhum serviço.
            </p>
        `;
        return;
    }

    meusServicos.forEach(servico => {
        const card = document.createElement("div");
        card.className = "cardServico";

        const titulo = document.createElement("h4");
        titulo.textContent = servico.nome;

        const categoria = document.createElement("p");
        categoria.textContent = "Categoria: " + servico.categoria;

        const descricao = document.createElement("p");
        descricao.textContent = servico.descricao;

        const preco = document.createElement("p");
        preco.textContent = "Preço: " + Number(servico.preco).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const duracao = document.createElement("p");
        duracao.textContent = "Duração: " + servico.duracao;

        const local = document.createElement("p");
        local.textContent = "Atendimento: " + servico.local;

        card.append(titulo, categoria, descricao, preco, duracao, local);
        lista.appendChild(card);
    });
}


// ==========================================
// CATÁLOGO E PESQUISA DO CLIENTE
// ==========================================

function atualizarCatalogoCliente(filtro = "") {
    const catalogo = document.getElementById("listaServicosCliente");

    if (!catalogo) return;

    catalogo.innerHTML = "";

    const termo = filtro.trim().toLowerCase();

    // A pesquisa considera somente o nome do serviço
    const servicosFiltrados = servicos.filter(servico => {
        const nomeServico = String(servico.nome || "").toLowerCase();

        return nomeServico.includes(termo);
    });

    if (servicosFiltrados.length === 0) {
        catalogo.innerHTML = termo
            ? '<p class="semServicos">Nenhum serviço encontrado com esse nome.</p>'
            : '<p class="semServicos">Ainda não existem serviços cadastrados.</p>';

        return;
    }

    servicosFiltrados.forEach(servico => {
        const card = document.createElement("div");
        card.className = "cardServicoCliente";

        const titulo = document.createElement("h4");
        titulo.textContent = servico.nome;

        const categoria = document.createElement("span");
        categoria.className = "categoriaServicoCliente";
        categoria.textContent = servico.categoria;

        const descricao = document.createElement("p");
        descricao.textContent = servico.descricao;

        const preco = document.createElement("p");
        preco.className = "precoServicoCliente";
        preco.textContent = Number(servico.preco).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const duracao = document.createElement("p");
        duracao.textContent = "Duração: " + servico.duracao;

        const local = document.createElement("p");
        local.textContent = "Atendimento: " + servico.local;

        const prestador = document.createElement("p");
        prestador.textContent = "Prestador: " +
            (servico.prestadorNome || "Prestador não identificado");

        card.append(
            titulo,
            categoria,
            descricao,
            preco,
            duracao,
            local,
            prestador
        );

        catalogo.appendChild(card);
    });
}


// ==========================================
// NAVEGAÇÃO INICIAL
// ==========================================

document.getElementById("btnLogin").addEventListener("click", () => {
    mostrarTela("telaLogin");
});

document.getElementById("btnCadastro").addEventListener("click", () => {
    mostrarTela("telaPerfil");
});


// ==========================================
// BOTÕES VOLTAR
// ==========================================

document.getElementById("voltarLogin").addEventListener("click", () => {
    mostrarTela("telaInicial");
});

document.getElementById("voltarPerfil").addEventListener("click", () => {
    mostrarTela("telaInicial");
});

document.getElementById("voltarCadastro").addEventListener("click", () => {
    mostrarTela("telaPerfil");
});


// ==========================================
// ESCOLHA DO PERFIL
// ==========================================

document.querySelectorAll(".perfil").forEach(botao => {
    botao.addEventListener("click", () => {
        perfilSelecionado = botao.dataset.perfil;

        const mensagem = perfilSelecionado === "prestador"
            ? "Cadastro de prestador de serviços"
            : "Cadastro de cliente";

        document.getElementById("tipoCadastro").textContent = mensagem;

        mostrarTela("telaCadastro");
    });
});


// ==========================================
// CADASTRO DE USUÁRIO
// ==========================================

document.getElementById("formCadastro").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value;

    const emailExistente = usuarios.some(usuario =>
        usuario.email === email
    );

    if (emailExistente) {
        alert("Este e-mail já está cadastrado. Faça login ou utilize outro e-mail.");
        return;
    }

    const novoUsuario = {
        id: Date.now().toString(),
        nome: nome,
        email: email,
        senha: senha,
        perfil: perfilSelecionado
    };

    usuarios.push(novoUsuario);
    salvarUsuarios();

    usuarioAtual = novoUsuario;

    document.getElementById("formCadastro").reset();

    abrirPainelUsuario();
});


// ==========================================
// LOGIN
// ==========================================

document.getElementById("formLogin").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const campos = evento.currentTarget.querySelectorAll("input");

    const email = campos[0].value.trim().toLowerCase();
    const senha = campos[1].value;

    const usuarioEncontrado = usuarios.find(usuario =>
        usuario.email === email && usuario.senha === senha
    );

    if (!usuarioEncontrado) {
        alert("E-mail ou senha incorretos.");
        return;
    }

    usuarioAtual = usuarioEncontrado;

    evento.currentTarget.reset();

    abrirPainelUsuario();
});


// ==========================================
// SAIR DAS CONTAS
// ==========================================

document.getElementById("btnSair").addEventListener("click", () => {
    usuarioAtual = null;
    mostrarTela("telaInicial");
});

document.getElementById("btnSairCliente").addEventListener("click", () => {
    usuarioAtual = null;
    mostrarTela("telaInicial");
});


// ==========================================
// BOTÕES DE APAGAR CONTA
// ==========================================

document.getElementById("btnApagarContaPrestador").addEventListener("click", () => {
    apagarConta();
});

document.getElementById("btnApagarContaCliente").addEventListener("click", () => {
    apagarConta();
});


// ==========================================
// PAINEL DO PRESTADOR
// ==========================================

document.getElementById("btnMeusServicos").addEventListener("click", () => {
    atualizarListaServicos();

    mostrarTela("painelPrestador");

    document.querySelector(".areaMeusServicos").scrollIntoView({
        behavior: "smooth"
    });
});

document.getElementById("btnAgendamentos").addEventListener("click", () => {
    alert("Área de agendamentos em desenvolvimento.");
});

document.getElementById("btnNovoServico").addEventListener("click", () => {
    mostrarTela("telaCadastroServico");
});

document.getElementById("btnMeuPerfil").addEventListener("click", () => {
    alert("Área de perfil em desenvolvimento.");
});

document.getElementById("btnVoltarServicos").addEventListener("click", () => {
    mostrarTela("painelPrestador");
});


// ==========================================
// CADASTRO DE SERVIÇOS
// ==========================================

document.getElementById("formServico").addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!usuarioAtual || usuarioAtual.perfil !== "prestador") {
        alert("Entre em uma conta de prestador para cadastrar serviços.");
        return;
    }

    const novoServico = {
        id: Date.now().toString(),
        prestadorEmail: usuarioAtual.email,
        prestadorNome: usuarioAtual.nome,
        nome: document.getElementById("nomeServico").value.trim(),
        categoria: document.getElementById("categoriaServico").value,
        descricao: document.getElementById("descricaoServico").value.trim(),
        preco: document.getElementById("precoServico").value,
        duracao: document.getElementById("duracaoServico").value,
        local: document.getElementById("localServico").value
    };

    servicos.push(novoServico);

    salvarServicos();

    atualizarListaServicos();
    atualizarCatalogoCliente();

    evento.currentTarget.reset();

    alert("Serviço cadastrado com sucesso!");

    mostrarTela("painelPrestador");
});


// ==========================================
// PAINEL DO CLIENTE
// ==========================================

// Botão Buscar
document.getElementById("btnBuscar").addEventListener("click", () => {
    const busca = document.getElementById("campoBusca").value;
    atualizarCatalogoCliente(busca);
});

// Atualização automática enquanto digita
document.getElementById("campoBusca").addEventListener("input", () => {
    const busca = document.getElementById("campoBusca").value;
    atualizarCatalogoCliente(busca);
});

// Atalho para a pesquisa
document.getElementById("btnBuscarServicos").addEventListener("click", () => {
    document.getElementById("campoBusca").focus();

    document.getElementById("campoBusca").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});

document.getElementById("btnMeusAgendamentos").addEventListener("click", () => {
    alert("Área de agendamentos em desenvolvimento.");
});

document.getElementById("btnFavoritos").addEventListener("click", () => {
    alert("Área de favoritos em desenvolvimento.");
});

document.getElementById("btnPerfilCliente").addEventListener("click", () => {
    alert("Área de perfil em desenvolvimento.");
});


// ==========================================
// CARREGAMENTO INICIAL
// ==========================================

atualizarListaServicos();
atualizarCatalogoCliente();
