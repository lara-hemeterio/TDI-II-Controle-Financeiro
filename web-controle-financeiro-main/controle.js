const form = document.getElementById('form');
const descImput = document.querySelector('#descricao');
const valorImput = document.querySelector('#montante');
const balancoH1 = document.querySelector('#balanco');
const receitaP = document.querySelector('#din-positivo');
const despesaP = document.querySelector('#din-negativo');
const transacoesUl = document.querySelector('#transacoes');

// Vamos usar o WebStorage para persistir as transações
// Chave de acesso aos dados
const chave_transacoes_ls = 'transacoes';

// Vetor para armazenar as transações
let transacoesSalvas = null;

// Inicilia transações salvas
try {
    transacoesSalvas = JSON.parse(localStorage.getItem(chave_transacoes_ls));
} catch (error) {
    transacoesSalvas = [];
}

if (transacoesSalvas == null) {
    transacoesSalvas = [];
}

function gerarId(){
    if(transacoesSalvas.length === 0){
        return 0;
    }
    return transacoesSalvas[transacoesSalvas.length - 1].id + 1; 
}



form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Recuperar os valores
    const descTransacao = descImput.value.trim();
    const valorTransacao = valorImput.value.trim();

    const tipo = document.querySelector('input[name="tipo"]:checked').value;

    // Validar os imputs
    if (descTransacao === ""){
        alert("A descrição da transação não pode ser vazia.");
        return;
    }

    if (valorTransacao === ""){
        alert("O valor da transação não pode ser vazio.");
        return;
    }

    let valor = parseFloat(valorTransacao);

    if(tipo === "despesa"){
        valor = -valor;
    }

    // Criar objeto da transação
    const transacao = {
        id: gerarId(),
        descricao: descTransacao,
        valor: valor
    };

    somaAoSaldo(transacao);
    somaReceitaDespesa(transacao);
    addTransacaoAoDOM(transacao);

    descImput.value = "";
    valorImput.value = "";
    
    transacoesSalvas.push(transacao);

    localStorage.setItem(chave_transacoes_ls, 
        JSON.stringify(transacoesSalvas));
}); // Fim addEventLisneter do form

// Métodos auxiliares
function somaAoSaldo(transacao){
    const valorTransacao = transacao.valor;
    
    let total = balancoH1.innerHTML.replace("R$", "");
    total = parseFloat(total);
    total += valorTransacao;
    
    balancoH1.innerHTML = `R$${total}`;
}

function somaReceitaDespesa(transacao){
    const elementoAlterado = transacao.valor > 0 ? receitaP : despesaP;
    const substituir = transacao.valor > 0 ? "+ R$" : "- R$";

    let valor = elementoAlterado.innerHTML.replace(substituir, "");
    valor = parseFloat(valor);

    const valorTransacao = transacao.valor;
    valor += Math.abs(valorTransacao);

    elementoAlterado.innerHTML = `${substituir}${valor}`;
}

function addTransacaoAoDOM(transacao) {
    const sinal = transacao.valor < 0 ? "-" : "";
    const classeCSS = transacao.valor < 0 ? "negativo" : "positivo";

    let valorTransacao = Math.abs(transacao.valor);
    const li = document.createElement('li');

    li.classList.add(classeCSS);
    li.setAttribute("id","transacao-" + transacao.id);

    li.innerHTML = `${transacao.id} - ${transacao.descricao} 
                    <span>${sinal}R$${valorTransacao}</span>
                    <button class="delete-btn" 
                    onclick="deletaTransacao(${transacao.id})">X</button>`;

    transacoesUl.append(li);
}

// Carregar os dados persistidos
function carregarDados(){
    transacoesUl.innerHTML = "";
    balancoH1.innerHTML = "R$0.00";
    receitaP.innerHTML = "+ R$0.00";
    despesaP.innerHTML = "- R$0.00";

    for(let i = 0; i < transacoesSalvas.length; i++) {
        somaAoSaldo(transacoesSalvas[i]);
        somaReceitaDespesa(transacoesSalvas[i]);
        addTransacaoAoDOM(transacoesSalvas[i]);
    }
}

function deletaTransacao(idTransacao) {
    const transacaoIndex = transacoesSalvas.findIndex(
        transacao => transacao.id == idTransacao
    );

    const transacaoRemovida = transacoesSalvas.splice(transacaoIndex, 1)[0];

    localStorage.setItem(chave_transacoes_ls, 
        JSON.stringify(transacoesSalvas));

    const li = document.getElementById("transacao-" + idTransacao);
    li.remove();

    let total = parseFloat(balancoH1.innerHTML.replace("R$", ""));
    total -= transacaoRemovida.valor;

    balancoH1.innerHTML = `R$${total}`;

    const elementoAlterado = transacaoRemovida.valor > 0 ? receitaP : despesaP;
    const substituir = transacaoRemovida.valor > 0 ? "+ R$" : "- R$";

    let valor = parseFloat(elementoAlterado.innerHTML.replace(substituir, ""));
    valor -= Math.abs(transacaoRemovida.valor);

    elementoAlterado.innerHTML = `${substituir}${valor}`;
}

carregarDados();