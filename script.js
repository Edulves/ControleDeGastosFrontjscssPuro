async function carregarDados() {
    try {
        // Obtém valores dos filtros
        const mes = document.getElementById("mes").value;
        const ano = document.getElementById("ano").value;
        const inicio = document.getElementById("inicio").value;
        const fim = document.getElementById("fim").value;
        const categoria = document.getElementById("categoria").value;

        // Monta a query string dinamicamente
        const params = new URLSearchParams();

        if (mes) params.append("Mes", mes);
        if (ano) params.append("Ano", ano);
        if (inicio) params.append("InicioDoPeriodo", inicio);
        if (fim) params.append("FimDoPeriodo", fim);
        if (categoria) params.append("Categoria", categoria);

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
    } catch (erro) {
        console.error(erro);
    }
}

// Executa busca ao clicar no botão
document.getElementById("buscar").addEventListener("click", carregarDados);

// Também busca automaticamente ao carregar a página
carregarDados();
