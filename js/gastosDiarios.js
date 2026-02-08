"use strict";

const btnsCloseModal = document.querySelector(".btn--close-lancamentos_diarios");
const btnCadastrarGasto = document.querySelector(".btn--cadastrar-lancamentos_diarios");
const btnAdicionarLinhaDeGasto = document.querySelector(".btn--adicionar-lancamentos_diarios");
const btnLancardespesas = document.getElementById("lancardespesa");
const btnBuscar = document.getElementById("buscar");
const btnPaginaAnterior = document.getElementById("anterior");
const btnProximaPagina = document.getElementById("proximo");
const btnAtualizar = document.querySelector(".btn--atualizar-lancamentos_diarios");
const inputMes = document.getElementById("mes");
const inputAno = document.getElementById("ano");
const lancamentosDataDoLancamento = document.getElementById("dataDoLancamento");
const lancamentosValorgasto = document.getElementById("valorgasto");
const lancamentosObservacao = document.getElementById("observacao");
const modal = document.querySelector(".modal");
const formLancamentosDiarios = document.querySelector(".form_lancamentos_diarios");
const overlay = document.querySelector(".overlay");
const selectInicial = document.querySelector(".categoriaId");
const selectPagina = document.getElementById("pagina-select");
const lista = document.querySelector(".lista-gastos");
const tituloForm = document.querySelector(".modal_lancamentos_diarios_header");

let paginaAtual = 1;
let totalDePaginas = 1;

// Carrega automaticamente a primeira página
carregarDados();

async function carregarDados() {
    try {
        const dataAtual = new Date();

        const periodoDeInicio = document.getElementById("periodoDeInicio").value;
        const periodoDeFim = document.getElementById("periodoDeFim").value || (!periodoDeInicio ? "" : dataAtual.toISOString().split("T")[0]);
        const mes = periodoDeInicio ? "" : document.getElementById("mes").value || dataAtual.getMonth() + 1;
        const ano = periodoDeInicio ? "" : document.getElementById("ano").value || dataAtual.getFullYear();
        const categoria = document.getElementById("categoria").value;
        const qtdPorPagina = document.getElementById("qtdPorPagina").value;
        const observacao = document.getElementById("observacao").value;

        inputMes.placeholder = `Ex: ${mes.toString().padStart(2, "0")}`;
        inputAno.placeholder = `Ex: ${ano.toString().padStart(2, "0")}`;

        const params = new URLSearchParams();
        if (mes) params.append("Mes", mes);
        if (ano) params.append("Ano", ano);
        if (observacao) params.append("Observacao", observacao);
        if (periodoDeInicio) params.append("InicioDoPeriodo", periodoDeInicio);
        if (periodoDeFim) params.append("FimDoPeriodo", periodoDeFim);
        if (categoria) params.append("Categoria", categoria);
        params.append("Pagina", paginaAtual);
        params.append("QtdPorPagina", qtdPorPagina);

        const url = `https://localhost:7280/ControleDeGastos/ObterGastosDiarios?${params.toString()}`;

        const resposta = await fetch(url);
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
            li.dataset.id = item.idGastosDiario;
            li.dataset.dataDoLancamento = item.dataDoLancamento;
            li.dataset.valorgasto = item.valorgasto;
            li.dataset.observacao = item.observacao;
            li.dataset.nomeCategoria = item.nomeCategoria;
            li.classList.add("lancamentos");
            const data = new Date(item.dataDoLancamento).toLocaleDateString("pt-BR");
            li.innerHTML = `
                <span><strong>Data:</strong> ${data}</span>
                <span><strong>Valor:</strong> <span class="valores">R$ ${item.valorgasto.toFixed(2)}</span></span>
                <span><strong>Categoria:</strong> <span class="categoria_Lancamento-Diario">${item.nomeCategoria}</span></span>
                ${item.observacao ? `<div><strong>Observação:</strong> ${item.observacao}</div>` : ""}
                <span class="btn-edit"><i class="bi bi-pencil-square edit-line"></i></span>
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

async function registrarNovoGasto(e) {
    try {
        const linhas = document.querySelectorAll(".linhas_lancamentos_diarios");
        const gastos = [];

        if (linhas.length <= 0) {
            throw new Error("Nenhuma linha preenchida");
        }

        linhas.forEach((linha, i) => {
            const data = linha.querySelector(".dataDoLancamento").value;
            const valor = linha.querySelector(".valorgasto_lancamentos_diarios").value;
            const observacao = linha.querySelector(".observacao").value;
            const categoriaId = linha.querySelector(".categoriaId").value;

            if (!categoriaId) throw new Error(`Categoria obrigatória na linha ${i + 1}`);

            if (!data) throw new Error(`Data obrigatória na linha ${i + 1}`);

            if (!valor || parseFloat(valor) <= 0) throw new Error(`Valor de gasto inválido na linha ${i + 1}`);

            gastos.push({
                dataDoLancamento: data,
                valorgasto: parseFloat(valor),
                observacao,
                categoriaId,
            });

            linha.querySelector(".valorgasto_lancamentos_diarios").value = "";
            linha.querySelector(".observacao").value = "";
            linha.querySelector(".categoriaId").value = "";
        });

        document.querySelector(".btn--cadastrar-lancamentos_diarios").disabled = true;

        const response = await fetch("https://localhost:7280/ControleDeGastos/CriarLancamentosDeGastosDiario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(gastos),
        });

        if (!response.ok) {
            // Lê o corpo da resposta (pode ser JSON)
            const erroJson = await response.json();

            // Lança o erro com base no conteúdo retornado
            throw new Error(erroJson.detalhe || erroJson.titulo || "Erro ao buscar dados");
        }

        const texto = await response.text();
        alert(texto);
    } catch (error) {
        alert(error.message);
    } finally {
        document.querySelector(".btn--cadastrar-lancamentos_diarios").disabled = false;
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
    const ultimaLinha = document.querySelector(".form_lancamentos_diarios").lastElementChild;
    const dataUltimoLancamento = ultimaLinha.querySelector(".dataDoLancamento").value;
    novaLinha.classList.add("linhas_lancamentos_diarios");
    buttonId++;

    novaLinha.innerHTML = `
    <input name="dataDoLancamento" type="date" class="dataDoLancamento" value="${dataUltimoLancamento}"/>
    <input name="valorgasto" type="number" class="valorgasto_lancamentos_diarios" placeholder="0,00" />
    <input name="observacao" type="text" class="observacao" />
    <select name="categoriaId"  class="categoriaId"></select>
    <button type="button" class="btn--remover-lancamentos_diarios" id="${"button--" + buttonId}">-</button>
    `;

    const select = novaLinha.querySelector(".categoriaId");
    preencherSelectCategorias(select);

    formLancamentosDiarios.appendChild(novaLinha);
}

function removerLinhaDeGastos(e) {
    e.preventDefault();

    const idButton = e.target.attributes.id.value;
    if (idButton === "button--1") return;

    const buttonRevomer = document.getElementById(idButton);
    const divLancamentoARemover = buttonRevomer.closest(".linhas_lancamentos_diarios");
    divLancamentoARemover.remove();
}

function resetarLinhasLancamentos() {
    const linhas = document.querySelectorAll(".linhas_lancamentos_diarios");

    linhas.forEach((linha, index) => {
        if (index > 0) {
            linha.remove();
        }
    });
}

function preencherLinhaParaAtualizar(e) {
    e;
}

async function openModal(e, who) {
    e.preventDefault();
    await obterCategoriasdegastos(e);

    if (who === "cadastrar") {
        btnAtualizar.classList.add("hidden");
        btnCadastrarGasto.classList.remove("hidden");
        btnAdicionarLinhaDeGasto.classList.remove("hidden");
        tituloForm.innerHTML = "Cadastrar despesas diarios";
    }

    if (who === "atualizar") {
        btnAtualizar.classList.remove("hidden");
        btnCadastrarGasto.classList.add("hidden");
        btnAdicionarLinhaDeGasto.classList.add("hidden");
        tituloForm.innerHTML = "Atualizar despesa";
        resetarLinhasLancamentos();
        preencherItemAtualizar(e);
    }

    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
}

function preencherItemAtualizar(e) {
    const linhaAtual = e.target.closest(".lancamentos");
    const linhaAtualizar = document.querySelector(".linhas_lancamentos_diarios");
    const categoriaId = categorias.find((c) => c.nomeDaCategoria === linhaAtual.dataset.nomeCategoria).idCategoriaDeLancamentos;
    linhaAtualizar.querySelector(".valorgasto_lancamentos_diarios").value = linhaAtual.dataset.valorgasto;
    linhaAtualizar.querySelector(".observacao").value = linhaAtual.dataset.observacao;
    linhaAtualizar.querySelector(".dataDoLancamento").value = linhaAtual.dataset.dataDoLancamento.split("T")[0];
    linhaAtualizar.querySelector(".categoriaId").value = categoriaId;
    linhaAtualizar.dataset.id = linhaAtual.dataset.id;
}

function closeModal(e) {
    e.preventDefault();
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
}

btnBuscar.addEventListener("click", () => {
    paginaAtual = 1;
    carregarDados();
});

btnPaginaAnterior.addEventListener("click", () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        carregarDados();
    }
});

btnProximaPagina.addEventListener("click", () => {
    if (paginaAtual < totalDePaginas) {
        paginaAtual++;
        carregarDados();
    }
});

btnLancardespesas.addEventListener("click", (event) => {
    openModal(event, "cadastrar");
});

btnsCloseModal.addEventListener("click", closeModal);

btnCadastrarGasto.addEventListener("click", registrarNovoGasto);

btnAdicionarLinhaDeGasto.addEventListener("click", adicionarNovaLinhaDeGastos);

selectPagina.addEventListener("change", (e) => {
    paginaAtual = parseInt(e.target.value);
    carregarDados();
});

lista.addEventListener("click", (event) => {
    if (event.target.matches(".bi-pencil-square")) {
        obterCategoriasdegastos(event);
        openModal(event, "atualizar");
    }
});

overlay.addEventListener("click", closeModal);

formLancamentosDiarios.addEventListener("click", function (e) {
    if (e.target.matches("button.btn--remover-lancamentos_diarios")) {
        removerLinhaDeGastos(e);
    }
});
