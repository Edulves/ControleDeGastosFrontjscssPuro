let paginaAtual = 1;
let totalDePaginas = 1;

async function carregarDados() {
    try {
        const mes = document.getElementById("mes").value;
        const ano = document.getElementById("ano").value;
        const inicio = document.getElementById("inicio").value;
        const fim = document.getElementById("fim").value;
        const categoria = document.getElementById("categoria").value;
        const qtdPorPagina = document.getElementById("qtdPorPagina").value;

        const params = new URLSearchParams();
        if (mes) params.append("Mes", mes);
        if (ano) params.append("Ano", ano);
        if (inicio) params.append("InicioDoPeriodo", inicio);
        if (fim) params.append("FimDoPeriodo", fim);
        if (categoria) params.append("Categoria", categoria);
        params.append("Pagina", paginaAtual);
        params.append("QtdPorPagina", qtdPorPagina);

        const url = `https://localhost:7280/ControleDeGastos/ObterGastosDiarios?${params.toString()}`;

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar dados: " + resposta.status);
        }

        const dados = await resposta.json();
        const lista = document.getElementById("lista-gastos");
        lista.innerHTML = "";

        if (!dados.itens || dados.itens.length === 0) {
            lista.innerHTML = "<li>Nenhum gasto encontrado.</li>";
            atualizarPaginacao(1, 1);
            return;
        }

        dados.itens.forEach((item) => {
            const li = document.createElement("li");
            const data = new Date(item.dataDoLancamento).toLocaleDateString("pt-BR");
            li.innerHTML = `
              <div><strong>Data:</strong> ${data}</div>
              <div><strong>Valor:</strong> <span class="valor">R$ ${item.valorgasto.toFixed(2)}</span></div>
              <div><strong>Categoria:</strong> <span class="categoria">${item.nomeCategoria}</span></div>
              ${item.observacao ? `<div><strong>Observação:</strong> ${item.observacao}</div>` : ""}
            `;
            lista.appendChild(li);
        });

        atualizarPaginacao(dados.paginaAtual, dados.totalDePaginas);
    } catch (erro) {
        console.error(erro);
    }
}

function atualizarPaginacao(pagina, total) {
    paginaAtual = pagina;
    totalDePaginas = total;

    const paginaInfo = document.getElementById("pagina-info");
    const select = document.getElementById("pagina-select");
    paginaInfo.textContent = `Página ${pagina} de ${total}`;

    select.innerHTML = "";
    for (let i = 1; i <= total; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        if (i === pagina) option.selected = true;
        select.appendChild(option);
    }

    document.getElementById("anterior").disabled = pagina <= 1;
    document.getElementById("proximo").disabled = pagina >= total;
}

document.getElementById("buscar").addEventListener("click", () => {
    paginaAtual = 1;
    carregarDados();
});

document.getElementById("anterior").addEventListener("click", () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        carregarDados();
    }
});

document.getElementById("proximo").addEventListener("click", () => {
    if (paginaAtual < totalDePaginas) {
        paginaAtual++;
        carregarDados();
    }
});

document.getElementById("pagina-select").addEventListener("change", (e) => {
    paginaAtual = parseInt(e.target.value);
    carregarDados();
});

// Carrega automaticamente a primeira página
carregarDados();
