"use strict";

const btnBuscar = document.getElementById("buscar");
const inputMes = document.getElementById("mes");
const inputAno = document.getElementById("ano");

async function buscarGastosFixos() {
    try {
        const listaGatos = document.querySelector(".gastos-fixos");

        const dataAtual = new Date();
        const mes = document.getElementById("mes").value || dataAtual.getMonth() + 1;
        const ano = document.getElementById("ano").value || dataAtual.getFullYear();

        inputMes.placeholder = `Ex: ${mes.toString().padStart(2, "0")}`;
        inputAno.placeholder = `Ex: ${ano.toString()}`;

        listaGatos.innerHTML = "";
        const response = await fetch(`https://localhost:7280/ControleDeGastos/ObterGastosFixos?Mes=${mes}&Ano=${ano}`);

        const dados = await response.json();

        if (!dados.itens || dados.itens.length === 0) {
            listaGatos.innerHTML = '<div class="card-gasto-fixo">Nenhum gasto encontrado.</div>';
            return;
        }

        dados.itens.sort((a, b) => {
            return b.pago - a.pago;
        });

        dados.itens.forEach((item) => {
            const elemento = document.createElement("div");
            elemento.classList.add("card-gasto-fixo");

            elemento.innerHTML = `
                <div> 
                <p><strong>${item.descricaoGastoFixo.toUpperCase()}</strong> : </p>
                <p class="valor">R$ ${item.valorGastoFixo.toFixed(2)}</p>
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

        const dataAtual = new Date();
        const mes = document.getElementById("mes").value || dataAtual.getMonth() + 1;
        const ano = document.getElementById("ano").value || dataAtual.getFullYear();

        inputMes.placeholder = `Ex: ${mes.toString().padStart(2, "0")}`;
        inputAno.placeholder = `Ex: ${ano.toString()}`;

        const url = `https://localhost:7280/ControleDeGastos/ObterValorTotaisGastosFixosPagoVsNao?Mes=${mes}&Ano=${ano}`;

        const response = await fetch(url);
        const dados = await response.json();

        Object.entries(dados).forEach(([chave, valor]) => {
            const elemento = document.createElement("div");
            elemento.classList.add("card-gasto-fixo--totais");

            const imgX = chave.toUpperCase() === "VALORPAGO" ? "cogumelo" : "ghost2";

            elemento.innerHTML = `
                    <p><strong>${chave.toUpperCase() === "VALORPAGO " ? "Valor pago" : "A pagar"}</strong>  :  &nbsp</p>
                    <p class="valor">R$ ${valor.toFixed(2)}</p>
                    <div class="img-gastos-fixos-totais">
                        <img src="../Img/gastosFixosImgs/${imgX}.png"/>
                    </div>
                `;
            areaTotais.appendChild(elemento);
        });
    } catch (error) {
        console.error(error);
        alert(error);
    }
}

btnBuscar.addEventListener("click", buscarGastosFixos);
buscarGastosFixos();

getTotaisGastosFixos();
