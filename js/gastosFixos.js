"use strict";

const btnBuscar = document.getElementById("buscar");
const inputMes = document.getElementById("mes");
const inputAno = document.getElementById("ano");
const containerGastosFixos = document.querySelector(".gastos-fixos");

async function buscarGastosFixos() {
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

async function getTotaisGastosFixos() {
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

function updateData() {
    const dataAtual = new Date();
    const mes = document.getElementById("mes").value || dataAtual.getMonth() + 1;
    const ano = document.getElementById("ano").value || dataAtual.getFullYear();

    inputMes.placeholder = `${mes.toString().padStart(2, "0")}`;
    inputAno.placeholder = `${ano.toString()}`;

    inputMes.value = "";
    inputAno.value = "";
}

async function updateStatus(e) {
    try {
        const card = e.target.closest(".card-gasto-fixo");

        const id = Number(card.dataset.id);
        const pago = !(card.dataset.pago === "true");

        console.log(id, pago);

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

btnBuscar.addEventListener("click", () => {
    buscarGastosFixos();
    getTotaisGastosFixos();
    updateData();
});

containerGastosFixos.addEventListener("click", function (e) {
    if (e.target.matches("img.img-cards-gastos-fixos")) {
        updateStatus(e);
    }
});

function refresh() {
    buscarGastosFixos();
    getTotaisGastosFixos();
    updateData();
}

refresh();
