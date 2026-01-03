"use strict";

const modal = document.querySelector(".modal");
const modalForm = document.querySelector(".modal__form");
const overlay = document.querySelector(".overlay");
const btnsOpenModal = document.querySelectorAll(".btn--show-cadastro--lancamentos");
const btnsCloseModal = document.querySelectorAll(".btn--close-modal");
const btnCadastrarGasto = document.querySelector(".btn--cadastar-gasto");
const select = document.getElementById("categoriaId");
const inputMes = document.getElementById("mes");
const inputAno = document.getElementById("ano");
const lancamentosDataDoLancamento = document.getElementById("dataDoLancamento");
const lancamentosValorgasto = document.getElementById("valorgasto");
const lancamentosObservacao = document.getElementById("observacao");

let paginaAtual = 1;
let totalDePaginas = 1;

async function carregarDados() {
    try {
        const dataAtual = new Date();

        const periodoDeInicio = document.getElementById("periodoDeInicio").value;
        const periodoDeFim = document.getElementById("periodoDeFim").value || periodoDeInicio ? dataAtual.toISOString().split("T")[0] : false || "";
        const mes = document.getElementById("mes").value || periodoDeInicio ? "" : false || dataAtual.getMonth() + 1;
        const ano = document.getElementById("ano").value || periodoDeInicio ? "" : false || dataAtual.getFullYear();
        const categoria = document.getElementById("categoria").value;
        const qtdPorPagina = document.getElementById("qtdPorPagina").value;

        inputMes.placeholder = `Ex: ${mes.toString().padStart(2, "0")}`;
        inputAno.placeholder = `Ex: ${ano.toString().padStart(2, "0")}`;

        const params = new URLSearchParams();
        if (mes) params.append("Mes", mes);
        if (ano) params.append("Ano", ano);
        if (periodoDeInicio) params.append("InicioDoPeriodo", periodoDeInicio);
        if (periodoDeFim) params.append("FimDoPeriodo", periodoDeFim);
        if (categoria) params.append("Categoria", categoria);
        params.append("Pagina", paginaAtual);
        params.append("QtdPorPagina", qtdPorPagina);

        const url = `https://localhost:7280/ControleDeGastos/ObterGastosDiarios?${params.toString()}`;

        const resposta = await fetch(url);
        const lista = document.getElementById("lista-gastos");
        lista.innerHTML = "";

        if (!resposta.ok) {
            lista.innerHTML = "<li>Nenhum gasto encontrado.</li>";
            atualizarPaginacao(1, 1);
            // Lê o corpo da resposta (pode ser JSON)
            const erroJson = await resposta.json();

            // Lança o erro com base no conteúdo retornado
            throw new Error(erroJson.detalhe || erroJson.titulo || "Erro ao buscar dados");
        }

        const dados = await resposta.json();

        if (!dados.itens || dados.itens.length === 0) {
            lista.innerHTML = "<li>Nenhum gasto encontrado.</li>";
            atualizarPaginacao(1, 1);
            return;
        }

        dados.itens.forEach((item) => {
            const li = document.createElement("li");
            const data = new Date(item.dataDoLancamento).toLocaleDateString("pt-BR");
            li.innerHTML = `
              <div class="Lancamentos">
                <div><strong>Data:</strong> ${data}</div>
                <div><strong>Valor:</strong> <span class="valor">R$ ${item.valorgasto.toFixed(2)}</span></div>
                <div><strong>Categoria:</strong> <span class="categoria">${item.nomeCategoria}</span></div>
                ${item.observacao ? `<div><strong>Observação:</strong> ${item.observacao}</div>` : ""}
              </div>
            `;
            lista.appendChild(li);
        });

        atualizarPaginacao(dados.paginaAtual, dados.totalDePaginas);
    } catch (erro) {
        alert(erro);
        console.error(erro);
    }
}

async function obterCategoriasdegastos() {
    try {
        if (select.length > 0) return;

        const url = `https://localhost:7280/ControleDeGastos/ObterCategorias`;

        const resposta = await fetch(url);

        if (!resposta.ok) {
            // Lê o corpo da resposta (pode ser JSON)
            const erroJson = await resposta.json();

            // Lança o erro com base no conteúdo retornado
            throw new Error(erroJson.detalhe || erroJson.titulo || "Erro ao buscar dados");
        }

        const categorias = await resposta.json();

        categorias.forEach((categoria) => {
            // Ignora categorias deletadas (caso queira)
            if (categoria.deletado === "*") return;

            const option = document.createElement("option");
            option.value = categoria.idCategoriaDeLancamentos;
            option.textContent = categoria.nomeDaCategoria.toUpperCase();
            select.appendChild(option);
        });

        modalForm;
    } catch (error) {
        alert(error);
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

async function registrarNovoGasto(e) {
    try {
        const dataDoLancamento = document.getElementById("dataDoLancamento");
        const valorgasto = document.getElementById("valorgasto");
        const observacao = document.getElementById("observacao");
        const idCategoria = document.getElementById("categoriaId");

        if (!dataDoLancamento.value) {
            e.preventDefault();
            dataDoLancamento.focus();
            throw new Error("Data de lançamento é obrigatória.");
        }

        if (parseFloat(valorgasto.value) <= 0 || valorgasto.value === "") {
            e.preventDefault();
            valorgasto.focus();
            throw new Error("O valor gasto deve ser maior que zero.");
        }

        document.querySelector(".btn--cadastar-gasto").disabled = true;

        var response = await fetch("https://localhost:7280/ControleDeGastos/CriarLancamentosDeGastosDiario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify([
                {
                    dataDoLancamento: dataDoLancamento.value,
                    valorgasto: valorgasto.value,
                    observacao: observacao.value,
                    categoriaId: idCategoria.value,
                },
            ]),
        });
        var texto = await response.text();
        alert(texto);
        lancamentosValorgasto.value = "";
        lancamentosObservacao.value = "";
        document.querySelector(".btn--cadastar-gasto").disabled = false;
    } catch (error) {
        alert(error);
    }
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

const openModal = function (e) {
    e.preventDefault();
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, "0");
    const dd = String(hoje.getDate()).padStart(2, "0");

    document.getElementById("dataDoLancamento").value = `${yyyy}-${mm}-${dd}`;

    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
};

const closeModal = function (e) {
    e.preventDefault();
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
};

btnsOpenModal.forEach((btn) =>
    btn.addEventListener("click", (event) => {
        openModal(event);
        obterCategoriasdegastos(event);
    })
);

btnsCloseModal.forEach((btn) => btn.addEventListener("click", closeModal));

overlay.addEventListener("click", closeModal);

btnCadastrarGasto.addEventListener("click", registrarNovoGasto);

// Carrega automaticamente a primeira página
carregarDados();
