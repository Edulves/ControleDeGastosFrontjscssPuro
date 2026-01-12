"use strict";

const modal = document.querySelector(".modal");
const modalForm = document.querySelector(".modal__form");
const overlay = document.querySelector(".overlay");
const btnsCloseModal = document.querySelector(".btn--close-modal");
const btnCadastrarGasto = document.querySelector(".btn--cadastrar-gasto");
const btnAdicionarLinhaDeGasto = document.querySelector(".btn--adicionar-gasto");
const btnRemoverLinhaDeGasto = document.querySelector(".btn--remover-gasto");
const inputMes = document.getElementById("mes");
const inputAno = document.getElementById("ano");
const lancamentosDataDoLancamento = document.getElementById("dataDoLancamento");
const lancamentosValorgasto = document.getElementById("valorgasto");
const lancamentosObservacao = document.getElementById("observacao");
const selectInicial = document.querySelector(".categoriaId");
const btnLancardespesas = document.getElementById("lancardespesa");

let paginaAtual = 1;
let totalDePaginas = 1;

// Carrega automaticamente a primeira página
carregarDados();

async function carregarDados() {
    try {
        const dataAtual = new Date();

        const mesx = document.getElementById("mes").value || dataAtual.getMonth() + 1;

        console.log(mesx);

        const periodoDeInicio = document.getElementById("periodoDeInicio").value;
        const periodoDeFim = document.getElementById("periodoDeFim").value || periodoDeInicio ? dataAtual.toISOString().split("T")[0] : "";
        const mes = periodoDeInicio ? "" : document.getElementById("mes").value || dataAtual.getMonth() + 1;
        const ano = periodoDeInicio ? "" : document.getElementById("ano").value || dataAtual.getFullYear();
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

let categorias = [];
async function obterCategoriasdegastos() {
    try {
        const url = `https://localhost:7280/ControleDeGastos/ObterCategorias`;

        const response = await fetch(url);

        if (!response.ok) {
            // Lê o corpo da resposta (pode ser JSON)
            const erroJson = await response.json();

            // Lança o erro com base no conteúdo retornado
            throw new Error(erroJson.detalhe || erroJson.titulo || "Erro ao buscar dados");
        }

        categorias = await response.json();

        preencherSelectCategorias(selectInicial);
    } catch (error) {
        alert(error);
        console.error(error);
    }
}

function preencherSelectCategorias(select) {
    try {
        select.innerHTML = `<option value="">Selecione</option>`;

        categorias.forEach((categoria) => {
            const option = document.createElement("option");
            option.value = categoria.idCategoriaDeLancamentos;
            option.textContent = categoria.nomeDaCategoria.toUpperCase();
            select.appendChild(option);
        });
    } catch (error) {
        alert(error);
        console.error(error);
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

let buttonId = 1;
function adicionarNovaLinhaDeGastos() {
    const novaLinha = document.createElement("div");
    const ultimaLinha = document.querySelector(".modal__form").lastElementChild;
    const dataUltimoLancamento = ultimaLinha.querySelector(".dataDoLancamento").value;
    novaLinha.classList.add("linha-de-gastos");
    buttonId++;

    novaLinha.innerHTML = `
    <input name="dataDoLancamento" type="date" class="dataDoLancamento" value="${dataUltimoLancamento}"/>
    <input name="valorgasto" type="number" class="valorgasto" placeholder="0,00" />
    <input name="observacao" type="text" class="observacao" />
    <select name="categoriaId"  class="categoriaId"></select>
    <button class="btn--remover-gasto" id="${"button--" + buttonId}">-</button>
    `;

    const select = novaLinha.querySelector(".categoriaId");
    preencherSelectCategorias(select);

    modalForm.appendChild(novaLinha);
}

function removerLinhaDeGastos(e) {
    e.preventDefault();

    const idButton = e.target.attributes.id.value;
    if (idButton === "button--1") return;

    const buttonRevomer = document.getElementById(idButton);
    const divLancamentoARemover = buttonRevomer.closest(".linha-de-gastos");
    divLancamentoARemover.remove();
}

async function registrarNovoGasto(e) {
    try {
        const linhas = document.querySelectorAll(".linha-de-gastos");
        const gastos = [];

        linhas.forEach((linha, i) => {
            const data = linha.querySelector(".dataDoLancamento").value;
            const valor = linha.querySelector(".valorgasto").value;
            const observacao = linha.querySelector(".observacao").value;
            const categoriaId = linha.querySelector(".categoriaId").value;

            if (!data) {
                throw new Error(`Data obrigatória na linha ${i + 1}`);
            }

            if (!valor || parseFloat(valor) <= 0) {
                throw new Error(`Valor de gasto inválido na linha ${i + 1}`);
            }

            gastos.push({
                dataDoLancamento: data,
                valorgasto: parseFloat(valor),
                observacao,
                categoriaId,
            });

            linha.querySelector(".valorgasto").value = "";
            linha.querySelector(".observacao").value = "";
            linha.querySelector(".categoriaId").value = "";
        });

        document.querySelector(".btn--cadastrar-gasto").disabled = true;

        const response = await fetch("https://localhost:7280/ControleDeGastos/CriarLancamentosDeGastosDiario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(gastos),
        });

        const texto = await response.text();
        alert(texto);
    } catch (error) {
        alert(error.message);
    } finally {
        document.querySelector(".btn--cadastrar-gasto").disabled = false;
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

    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
};

const closeModal = function (e) {
    e.preventDefault();
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
};

btnLancardespesas.addEventListener("click", (event) => {
    obterCategoriasdegastos(event);
    openModal(event);
});

btnsCloseModal.addEventListener("click", closeModal);

overlay.addEventListener("click", closeModal);

btnCadastrarGasto.addEventListener("click", registrarNovoGasto);

btnAdicionarLinhaDeGasto.addEventListener("click", adicionarNovaLinhaDeGastos);

modalForm.addEventListener("click", function (e) {
    if (e.target.matches('button[id^="button--"]')) {
        removerLinhaDeGastos(e);
    }
});
