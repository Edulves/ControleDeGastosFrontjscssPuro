"use strict";

const inputMes = document.getElementById("mes");
const inputAno = document.getElementById("ano");
const inputInicioPeriodo = document.getElementById("periodoDeInicio");
const inputFimPeriodo = document.getElementById("periodoDeFim");
const ctxMainChart = document.getElementById("mainChart");
const ctxDayChart = document.getElementById("exDayChart");
const btnBuscar = document.getElementById("buscar");
const chartMain = document.querySelector(".chartMain");
const ChartNotFoundCategories = document.querySelector(".ChartNotFoundCategories");
const ChartNotFoundDays = document.querySelector(".ChartNotFoundDays");

let dadosDash = [];
async function getDadosDash() {
    try {
        const dataAtual = new Date();
        const mes = document.getElementById("mes").value || dataAtual.getMonth() + 1;
        const ano = document.getElementById("ano").value || dataAtual.getFullYear();
        const params = new URLSearchParams();
        params.append("Mes", Number(mes));
        params.append("Ano", Number(ano));

        const response = await fetch(`https://localhost:7280/ControleDeGastos/ObterSomaDeGastoPorCategoria?${params}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            ChartNotFoundCategories.innerHTML = "";

            const containsCategoryHidden = chartMain.classList.contains("hidden");
            if (!containsCategoryHidden) {
                chartMain.classList.add("hidden");
            }

            const containsNotFoundHidden = ChartNotFoundCategories.classList.contains("hidden");
            if (containsNotFoundHidden) {
                ChartNotFoundCategories.classList.remove("hidden");
            }

            const elementImg = document.createElement("img");

            elementImg.src = "../Img/DashBoardImgs/NenhumDadoEncontrado.png";
            elementImg.alt = "Imagem dados não encontrados";
            elementImg.classList.add("img-dash-notFound");

            ChartNotFoundCategories.appendChild(elementImg);

            // Lê o corpo da resposta (pode ser JSON)
            const erroJson = await response.json();

            // Lança o erro com base no conteúdo retornado
            throw new Error(erroJson.detalhe || erroJson.titulo || "Erro ao buscar dados");
        }

        const containsCategoryHidden = chartMain.classList.contains("hidden");
        if (containsCategoryHidden) {
            chartMain.classList.remove("hidden");
            ChartNotFoundCategories.classList.add("hidden");
            chartMain.destroy();
            chartMain = null;
        }

        dadosDash = await response.json();
        const qtdCategorias = dadosDash.listaDeGastosPorCategoria.length;
        const labels = dadosDash.listaDeGastosPorCategoria.map((item) => item.nomeDaCategoria.toUpperCase());
        const dataSet = dadosDash.listaDeGastosPorCategoria.map((item) => item.valorGasto);
        const colors = dadosDash.listaDeGastosPorCategoria.map((_, index) => `rgb(27, 145, 255, ${(index + 1) / qtdCategorias}`);
        colors.reverse();

        createMainChart("Meus gastos", labels, dataSet, colors);
    } catch (error) {
        console.log(error.message);
    }
}

async function getDadosDashPequeno() {
    try {
        const dataAtual = new Date();
        const mes = document.getElementById("mes").value || dataAtual.getMonth() + 1;
        const ano = document.getElementById("ano").value || dataAtual.getFullYear();
        const areaTotalGastos = document.querySelector(".totais");
        areaTotalGastos.innerHTML = "";

        const params = new URLSearchParams();
        params.append("Mes", Number(mes));
        params.append("Ano", Number(ano));

        const response = await fetch(`https://localhost:7280/ControleDeGastos/ObterSomaDeGastoPorDia?${params}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            dadosDash = [];
            const totalGastos = 0;
            const totalelementos = 1;

            criarCardEGraficoPequeno(dadosDash, totalGastos, areaTotalGastos, totalelementos);
            criarCardsTotais(totalGastos, totalelementos);

            // Lê o corpo da resposta (pode ser JSON)
            const erroJson = await response.json();

            // Lança o erro com base no conteúdo retornado
            throw new Error(erroJson.detalhe || erroJson.titulo || "Erro ao buscar dados");
        }

        dadosDash = await response.json();
        const totalGastos = dadosDash.total;
        const totalelementos = dadosDash.listaDeGastosPorDia.length;

        criarCardEGraficoPequeno(dadosDash, totalGastos, totalelementos);
        criarCardsTotais(totalGastos, totalelementos);
    } catch (error) {
        console.log(error.message);
    }
}

const criarCardEGraficoPequeno = function (dadosDash, totalGastos, totalelementos) {
    const chartDay = document.querySelector(".chartDay");

    if (dadosDash.length === 0) {
        ChartNotFoundDays.innerHTML = "";

        const containsDayHidden = chartDay.classList.contains("hidden");
        if (!containsDayHidden) {
            chartDay.classList.add("hidden");
        }

        const containsNotFoundHidden = ChartNotFoundDays.classList.contains("hidden");
        if (containsNotFoundHidden) {
            ChartNotFoundDays.classList.remove("hidden");
        }

        const elementImg = document.createElement("img");

        elementImg.src = "../Img/DashBoardImgs/NenhumDadoEncontrado.png";
        elementImg.alt = "Imagem dados não encontrados";
        elementImg.classList.add("img-dash-notFound");

        ChartNotFoundDays.appendChild(elementImg);
        return;
    }

    const containsDayHidden = chartDay.classList.contains("hidden");
    if (containsDayHidden) {
        chartDay.classList.remove("hidden");

        dayChart.destroy();
        dayChart = null;
    }

    const containsNoutFoudHidden = ChartNotFoundDays.classList.contains("hidden");
    if (!containsNoutFoudHidden) ChartNotFoundDays.classList.add("hidden");

    const labels = dadosDash.listaDeGastosPorDia.map((item) => new Date(item.dataLancamento).getDate());
    const dataSet = dadosDash.listaDeGastosPorDia.map((item) => item.valorPorDia);
    createDayChart("gastos diarios", labels, dataSet, ["#e84748"]);
};

function criarCardsTotais(totalGastos, totalelementos) {
    const areaTotalGastos = document.querySelector(".totais");

    for (let index = 1; index <= 2; index++) {
        const elemento = document.createElement("div");

        elemento.innerHTML = `
        <div class="card-dash"> 
            <p><strong>${index === 1 ? "Mensal" : "Diario"}: </strong> </p>
            <p class="valores">R$ ${(index === 1 ? totalGastos : totalGastos / totalelementos).toFixed(2)}</p>
            <div class="img-cards-dash">
                <img src="../Img/DashBoardImgs/${index === 1 ? "mes" : "average"}.png" class="img-dash"/>
            </div>
        </div>
        `;
        areaTotalGastos.appendChild(elemento);
    }
}

let mainChart = null;
function createMainChart(title, labels, dataSet, colors) {
    if (mainChart) {
        // 🔄 atualiza com animação
        mainChart.data.labels = labels;
        mainChart.data.datasets[0].data = dataSet;

        mainChart.update(); // 👈 anima aqui
        return;
    }

    mainChart = new Chart(ctxMainChart, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: title,
                    data: dataSet,
                    backgroundColor: colors,
                    borderRadius: 10,
                },
            ],
        },
        options: {
            indexAxis: "y",
            responsive: true,
            animation: {
                duration: 1000, // ms
                easing: "easeOutQuart",
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    grid: {
                        display: false,
                    },
                    beginAtZero: true,
                    min: 0,
                    ticks: {
                        stepSize: 100,
                    },
                },
                x: {
                    grid: {
                        display: false,
                    },
                },
            },
        },
    });
}

let dayChart = null;
function createDayChart(title, labels, dataSet, colors) {
    if (dayChart) {
        // 🔄 atualiza com animação
        dayChart.data.labels = labels;
        dayChart.data.datasets[0].data = dataSet;
        dayChart.data.datasets[0].backgroundColor = colors;

        dayChart.update(); // 👈 anima aqui
        return;
    }

    dayChart = new Chart(ctxDayChart, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: title,
                    data: dataSet,
                    backgroundColor: colors,
                    borderRadius: 5,
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            indexAxis: "y",
            responsive: true,
            animation: {
                duration: 1000, // ms
                easing: "easeOutQuart",
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    grid: {
                        display: false,
                    },
                    beginAtZero: true,
                    min: 0,
                    ticks: {
                        stepSize: 1,
                    },
                },
                x: {
                    grid: {
                        display: false,
                    },
                    beginAtZero: true,
                    min: 0,
                    ticks: {
                        stepSize: 500,
                    },
                },
            },
        },
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

btnBuscar.addEventListener("click", (e) => {
    getDadosDash();
    getDadosDashPequeno();
    atualizarCampoDataDePesquisa();
});

// Carrega automaticamente a primeira página
getDadosDash();
getDadosDashPequeno();
atualizarCampoDataDePesquisa();
