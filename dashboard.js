"use strict";

const inputMes = document.getElementById("mes");
const inputAno = document.getElementById("ano");
const inputInicioPeriodo = document.getElementById("periodoDeInicio");
const inputFimPeriodo = document.getElementById("periodoDeFim");
const ctxMainChart = document.getElementById("mainChart");
const ctxDayChart = document.getElementById("exDayChart");
const btnBuscar = document.getElementById("buscar");

let dadosDash = [];
async function getDadosDash() {
    try {
        const dataAtual = new Date();
        const mes = document.getElementById("mes").value || dataAtual.getMonth() + 1;
        const ano = document.getElementById("ano").value || dataAtual.getFullYear();

        inputMes.placeholder = `Ex: ${mes.toString().padStart(2, "0")}`;
        inputAno.placeholder = `Ex: ${ano.toString().padStart(2, "0")}`;

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
            // Lê o corpo da resposta (pode ser JSON)
            const erroJson = await response.json();

            // Lança o erro com base no conteúdo retornado
            throw new Error(erroJson.detalhe || erroJson.titulo || "Erro ao buscar dados");
        }

        dadosDash = await response.json();

        const labels = dadosDash.listaDeGastosPorCategoria.map((item) => item.nomeDaCategoria.toUpperCase());
        const dataSet = dadosDash.listaDeGastosPorCategoria.map((item) => item.valorGasto);

        createMainChart("Meus gastos", labels, dataSet);
    } catch (error) {
        alert(error.message);
    }
}

async function getDadosDashPequeno() {
    try {
        const dataAtual = new Date();
        const mes = document.getElementById("mes").value || dataAtual.getMonth() + 1;
        const ano = document.getElementById("ano").value || dataAtual.getFullYear();

        inputMes.placeholder = `Ex: ${mes.toString().padStart(2, "0")}`;
        inputAno.placeholder = `Ex: ${ano.toString().padStart(2, "0")}`;

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
            // Lê o corpo da resposta (pode ser JSON)
            const erroJson = await response.json();

            // Lança o erro com base no conteúdo retornado
            throw new Error(erroJson.detalhe || erroJson.titulo || "Erro ao buscar dados");
        }

        dadosDash = await response.json();

        const totalMes = Number(dadosDash.total);
        const labels = dadosDash.listaDeGastosPorDia.map((item) => new Date(item.dataLancamento).getDate());
        const dataSet = dadosDash.listaDeGastosPorDia.map((item) => item.valorPorDia);
        const percent = dadosDash.listaDeGastosPorDia.map((item) => `rgb(223, 4, 6, ${item.valorPorDia / totalMes + 0.45}`);

        createDayChart("gastos diarios", labels, dataSet, percent);
    } catch (error) {
        alert(error.message);
    }
}

let delayed;
let mainChart = null;
function createMainChart(title, labels, dataSet) {
    // Destroy previous chart if it exists
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
                    backgroundColor: ["#53d4f3", "#3891a6"],
                    borderWidth: 1,
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
    // Destroy previous chart if it exists
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
                    borderWidth: 1,
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

btnBuscar.addEventListener("click", (e) => {
    getDadosDash();
    getDadosDashPequeno();
});

// Carrega automaticamente a primeira página
getDadosDash();
getDadosDashPequeno();
