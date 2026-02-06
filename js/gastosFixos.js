"use strict";

const btnBuscar = document.getElementById("buscar");
const btnAtualizar = document.querySelector(".btn--atualizar-lancamentos_fixos");
const btnAbrirFormAtualizar = document.getElementById("atualizar");
const btnsCloseModal = document.querySelector(".btn--close-lancamentos_fixos");
const btnAdicionarGastofixo = document.querySelector(".btn--adicionar-lancamentos_fixos");
const btnDuplicar = document.querySelector(".btn--duplicar-lancamentos_fixos");
const inputMes = document.getElementById("mes");
const inputAno = document.getElementById("ano");
const containerGastosFixos = document.querySelector(".gastos-fixos");
const formAtualizar = document.querySelector(".form-atualizar-lancamentos");
const overlay = document.querySelector(".overlay");
const form_lancamentos_fixos = document.querySelector(".form_lancamentos_fixos");

async function obterGastosFixos() {
    try {
        const listaGatos = document.querySelector(".gastos-fixos");

        const dataAtual = new Date();
        const mes = document.getElementById("mes").value || dataAtual.getMonth() + 1;
        const ano = document.getElementById("ano").value || dataAtual.getFullYear();

        listaGatos.innerHTML = "";
        const response = await fetch(`https://localhost:7280/ControleDeGastos/ObterGastosFixos?Mes=${mes}&Ano=${ano}`);

        const dados = await response.json();

        if (dados.itens.length === 0) {
            const elemento = document.createElement("div");
            elemento.classList.add("card-gasto-fixo");

            elemento.innerHTML = `
                <div> 
                <p><strong>N/A: </strong></p>
                <p class="valores">R$ 0.00</p>
                <span>'Nenhum lançamento para o mês atual 😓'</span>
                </div>
                <div class="img-gastos-fixos">
                        <img src="../Img/gastosFixosImgs/delete.png"  class="img-cards-gastos-fixos"/>
                </div>
            `;
            listaGatos.appendChild(elemento);
            return;
        }

        dados.itens.sort((a, b) => {
            return b.pago - a.pago;
        });

        dados.itens.forEach((item) => {
            const elemento = document.createElement("div");
            elemento.classList.add("card-gasto-fixo");

            elemento.dataset.id = item.idGastosFixos;
            elemento.dataset.descricaoGastoFixo = item.descricaoGastoFixo;
            elemento.dataset.valorGastoFixo = item.valorGastoFixo;
            elemento.dataset.pago = item.pago;
            elemento.dataset.dataDoLancamento = item.dataDoLancamento;

            elemento.innerHTML = `
                    <div> 
                        <p><strong>${item.descricaoGastoFixo.toUpperCase()}</strong> : </p>
                        <p class="valores">R$ ${item.valorGastoFixo.toFixed(2)}</p>
                        <span>${item.pago ? `Menos uma 🙌` : `Pendente 💣`}</span>
                    </div>
                    <div class="img-gastos-fixos">
                            <img src="../Img/gastosFixosImgs/${item.pago ? "checked" : "delete"}.png"  class="img-cards-gastos-fixos"/>
                    </div>
            `;
            listaGatos.appendChild(elemento);
        });
    } catch (error) {
        alert(error);
        console.error(error);
    }
}

async function deletarGastoFixo(e) {
    try {
        const linhaClicked = e.target.closest("div.linhas_lancamentos_fixos");

        if (linhaClicked.dataset.deletado) {
            alert("item já deletado!!!");
            return;
        }

        if (Number(linhaClicked.dataset.id) === 0) {
            linhaClicked.remove();
            return;
        }

        const confirmou = confirm("Tem certeza que deseja prosseguir?");
        if (confirmou) {
            const response = await fetch(`https://localhost:7280/ControleDeGastos/FalsoDeleteGastosFixo?id=${linhaClicked.dataset.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                // Lê o corpo da resposta (pode ser JSON)
                const erroJson = await response.json();

                // Lança o erro com base no conteúdo retornado
                throw new Error(erroJson.detalhe || erroJson.titulo || "Erro ao buscar dados");
            }

            linhaClicked.querySelectorAll("input").forEach((input) => {
                input.style.background = "#e84748";
                linhaClicked.dataset.deletado = true;
            });

            const texto = await response.text();
            alert(texto);

            linhaClicked.remove();
        }
    } catch (error) {
        alert(error);
        console.error(error);
    }
}

async function obterTotaisGastosFixos() {
    try {
        const areaTotais = document.querySelector(".gastos-fixos-totais");
        areaTotais.innerHTML = "";

        const dataAtual = new Date();
        const mes = document.getElementById("mes").value || dataAtual.getMonth() + 1;
        const ano = document.getElementById("ano").value || dataAtual.getFullYear();

        const url = `https://localhost:7280/ControleDeGastos/ObterValorTotaisGastosFixosPagoVsNao?Mes=${mes}&Ano=${ano}`;

        const response = await fetch(url);

        if (!response.ok) {
            const cards = [
                {
                    titulo: "Valor pago",
                    imagem: "cogumeloX",
                },
                {
                    titulo: "A pagar",
                    imagem: "ghost",
                },
            ];

            cards.forEach(({ titulo, imagem }) => {
                const card = document.createElement("div");
                card.classList.add("card-gasto-fixo--totais");

                card.innerHTML = `
                    <p><strong>${titulo}</strong> : &nbsp</p>
                    <p class="valores">R$ 00.00</p>
                    <div class="img-gastos-fixos-totais">
                        <img src="../Img/gastosFixosImgs/${imagem}.png" />
                    </div>
                `;

                areaTotais.appendChild(card);
            });

            // Lê o corpo da resposta (pode ser JSON)
            const erroJson = await response.json();

            // Lança o erro com base no conteúdo retornado
            throw new Error(erroJson.detalhe || erroJson.titulo || "Erro ao buscar dados");
        }

        const dados = await response.json();

        Object.entries(dados).forEach(([chave, valor]) => {
            const elemento = document.createElement("div");
            elemento.classList.add("card-gasto-fixo--totais");

            const pagoOuAPagar = chave.toUpperCase() === "VALORPAGO";

            elemento.innerHTML = `
                    <p><strong>${pagoOuAPagar ? "Valor pago" : "A pagar"}</strong>  :  &nbsp</p>
                    <p class="valores">R$ ${valor.toFixed(2)}</p>
                    <div class="img-gastos-fixos-totais">
                        <img src="../Img/gastosFixosImgs/${pagoOuAPagar ? "cogumelo" : "ghost2"}.png"/>
                    </div>
                `;
            areaTotais.appendChild(elemento);
        });
    } catch (error) {
        console.error(error);
    }
}

async function atualizarDadosGastosFixos(e, duplicar, dataDuplicar) {
    try {
        const lancamentosGastosFixos = document.querySelectorAll(".linhas_lancamentos_fixos");
        const lacamentos = [];

        if (lancamentosGastosFixos.length <= 0) {
            throw new Error("Nenhuma linha preenchida");
        }

        lancamentosGastosFixos.forEach((linha, i) => {
            if (linha.dataset.deletado) return;

            if (linha.classList.contains("header")) return;

            const idLancamento = duplicar ? 0 : Number(linha.dataset.id);
            const descrição = linha.querySelector(".DescricaoUpdate").value;
            const valor = linha.querySelector(".valorDespesa_lancamentos_fixos").value;
            const data = duplicar ? dataDuplicar : linha.querySelector(".dataDoLancamento").value;

            if (!data) throw new Error(`Data obrigatória na linha ${i + 1}`);

            if (!descrição || descrição.length <= 0) throw new Error(`Descrição obrigatória`);

            if (!valor || parseFloat(valor) <= 0) throw new Error(`Valor de gasto inválido na linha ${i + 1}`);

            console.log(idLancamento, data, descrição, valor);

            lacamentos.push({
                idGastosFixos: idLancamento,
                descricaoGastoFixo: descrição,
                valorGastoFixo: valor,
                dataDoLancamento: data,
            });
        });

        const response = await fetch("https://localhost:7280/ControleDeGastos/AtualizarGastosFixos", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lacamentos),
        });

        if (!response.ok) {
            const erroJson = await response.json();

            throw new Error(erroJson.detalhe || erroJson.titulo || "Erro ao buscar dados");
        }

        alert("Itens atualizados com sucesso!!!");
        closeModal(e);
    } catch (error) {
        console.log(error);
        alert(error);
    }
}

async function atualizarConfirmacaoDePagamento(e) {
    try {
        const card = e.target.closest(".card-gasto-fixo");

        const id = Number(card.dataset.id);
        const pago = !(card.dataset.pago === "true");

        const response = await fetch("https://localhost:7280/ControleDeGastos/AtualizarGastosFixos", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify([
                {
                    idGastosFixos: id,
                    pago: pago,
                },
            ]),
        });

        if (!response.ok) {
            // Lê o corpo da resposta (pode ser JSON)
            const erroJson = await response.json();

            // Lança o erro com base no conteúdo retornado
            throw new Error(erroJson.detalhe || erroJson.titulo || "Erro ao buscar dados");
        }

        // const texto = await response.text();
        // alert(texto);

        refresh();
    } catch (error) {
        alert(error);
        console.error(error);
    }
}

async function duplicarDespesasFixas(e) {
    try {
        const mesDuplicar = document.querySelector(".input-data-duplicar").value;

        if (!mesDuplicar) throw new Error("Mês para o qual duplicar obrigatorio");

        confirm(`Duplicar despesas para o mês ${mesDuplicar}?`);
        await atualizarDadosGastosFixos(e, true, mesDuplicar);
    } catch (error) {
        alert(error);
        console.error(error);
    }
}

function adicionarLinhaLancamentoGastoFixo() {
    const elemento = document.createElement("div");
    elemento.dataset.id = 0;
    elemento.classList.add("linhas_lancamentos_fixos");

    // input date
    const inputData = document.createElement("input");
    inputData.type = "date";
    inputData.name = "dataDoLancamento";
    inputData.classList.add("dataDoLancamento");
    inputData.value = new Date();

    // input descrição
    const inputDescricao = document.createElement("input");
    inputDescricao.type = "text";
    inputDescricao.name = "Descricao";
    inputDescricao.classList.add("DescricaoUpdate");
    inputDescricao.value = "";

    // input valor
    const inputValor = document.createElement("input");
    inputValor.type = "number";
    inputValor.name = "valorDespesa";
    inputValor.placeholder = "0,00";
    inputValor.classList.add("valorDespesa_lancamentos_fixos");
    inputValor.value = Number(0).toFixed(2);

    // botão
    const botao = document.createElement("button");
    botao.type = "button";
    botao.classList.add("btn--remover-lancamentos_fixos");

    // ícone dentro do botão
    const icon = document.createElement("i");
    icon.classList.add("bi", "bi-trash3");

    botao.appendChild(icon);

    elemento.append(inputData, inputDescricao, inputValor, botao);

    form_lancamentos_fixos.append(elemento);
}

function preencherFormularioDeAtualizacao() {
    const listaGastosFixos = document.querySelectorAll(".card-gasto-fixo");
    form_lancamentos_fixos.innerHTML = "";

    const header = document.createElement("div");
    header.classList.add("linhas_lancamentos_fixos", "header");

    ["Data", "Descrição", "Valor", ""].forEach((texto) => {
        const span = document.createElement("span");
        span.textContent = texto;
        header.appendChild(span);
    });

    form_lancamentos_fixos.appendChild(header);

    listaGastosFixos.forEach((item, i) => {
        const elemento = document.createElement("div");
        elemento.dataset.id = item.dataset.id;
        elemento.classList.add("linhas_lancamentos_fixos");

        // input date
        const inputData = document.createElement("input");
        inputData.type = "date";
        inputData.name = "dataDoLancamento";
        inputData.classList.add("dataDoLancamento");
        inputData.value = item.dataset.dataDoLancamento.split("T")[0];

        // input descrição
        const inputDescricao = document.createElement("input");
        inputDescricao.type = "text";
        inputDescricao.name = "Descricao";
        inputDescricao.classList.add("DescricaoUpdate");
        inputDescricao.value = item.dataset.descricaoGastoFixo;

        // input valor
        const inputValor = document.createElement("input");
        inputValor.type = "number";
        inputValor.name = "valorDespesa";
        inputValor.placeholder = "0,00";
        inputValor.classList.add("valorDespesa_lancamentos_fixos");
        inputValor.value = Number(item.dataset.valorGastoFixo).toFixed(2);

        // botão
        const botao = document.createElement("button");
        botao.type = "button";
        botao.classList.add("btn--remover-lancamentos_fixos");

        // ícone dentro do botão
        const icon = document.createElement("i");
        icon.classList.add("bi", "bi-trash3");

        botao.appendChild(icon);

        elemento.append(inputData, inputDescricao, inputValor, botao);

        form_lancamentos_fixos.append(elemento);
    });
}

function atualizarCampoDataDePesquisa() {
    const dataAtual = new Date();
    const mes = document.getElementById("mes").value || dataAtual.getMonth() + 1;
    const ano = document.getElementById("ano").value || dataAtual.getFullYear();

    inputMes.placeholder = `${mes.toString().padStart(2, "0")}`;
    inputAno.placeholder = `${ano.toString()}`;

    inputMes.value = `${mes.toString().padStart(2, "0")}`;
    inputAno.value = `${ano.toString()}`;
}

function closeModal(e) {
    e.preventDefault();
    formAtualizar.classList.add("hidden");
    overlay.classList.add("hidden");
    refresh();
}

btnBuscar.addEventListener("click", () => {
    obterGastosFixos();
    obterTotaisGastosFixos();
    atualizarCampoDataDePesquisa();
});

btnAbrirFormAtualizar.addEventListener("click", () => {
    formAtualizar.classList.remove("hidden");
    overlay.classList.remove("hidden");
    preencherFormularioDeAtualizacao();
});

btnAtualizar.addEventListener("click", (e) => {
    atualizarDadosGastosFixos(e);
});

btnsCloseModal.addEventListener("click", closeModal);

btnAdicionarGastofixo.addEventListener("click", adicionarLinhaLancamentoGastoFixo);

btnDuplicar.addEventListener("click", duplicarDespesasFixas);

form_lancamentos_fixos.addEventListener("click", (e) => {
    if (e.target.closest("button.btn--remover-lancamentos_fixos")) {
        deletarGastoFixo(e);
    }
});

overlay.addEventListener("click", closeModal);

containerGastosFixos.addEventListener("click", function (e) {
    if (e.target.matches("img.img-cards-gastos-fixos")) {
        atualizarConfirmacaoDePagamento(e);
    }
});

function refresh() {
    obterGastosFixos();
    obterTotaisGastosFixos();
    atualizarCampoDataDePesquisa();
}

refresh();
