const { readFileSync } = require('fs');

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
}

function getPeca(pecas,apresentacao) {
  return pecas[apresentacao.id];
}

function calcularTotalApresentacao(pecas,apre){
  let total = 0;

  switch (getPeca(pecas,apre).tipo) {
  case "tragedia":
    total = 40000;
    if (apre.audiencia > 30) {
      total += 1000 * (apre.audiencia - 30);
    }
    break;
  case "comedia":
    total = 30000;
    if (apre.audiencia > 20) {
      total += 10000 + 500 * (apre.audiencia - 20);
    }
    total += 300 * apre.audiencia;
    break;
  default:
      throw new Error(`Peça desconhecia: ${getPeca(pecas,apre).tipo}`);
  }
  return total;
}

function calcularCredito(pecas,apre) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(pecas,apre).tipo === "comedia") 
     creditos += Math.floor(apre.audiencia / 5);
  return creditos;   
}

function calcularTotalFatura(fatura){
  let totalFatura = 0 ;
  for (let apre of fatura.apresentacoes){
    totalFatura += calcularTotalApresentacao(pecas,apre);
  }
  return totalFatura;
}

function calcularTotalCreditos(fatura){
  let total = 0;
  for (let apre of fatura.apresentacoes){
    total += calcularCredito(pecas,apre);
  }
  return total;
}

function gerarFaturaStr (fatura, pecas) {

  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
      faturaStr += `  ${getPeca(pecas,apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas,apre))} (${apre.audiencia} assentos)\n`;
  }

    faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(fatura))}\n`;
    faturaStr += `Créditos acumulados: ${calcularTotalCreditos(fatura)} \n`;
    return faturaStr;
  }

  function gerarFaturaHTML(fatura, pecas) {
    let faturaHTML = `
  <html>
    <p> Fatura ${fatura.cliente} </p>
    <ul>
    `;
  
    for (let apre of fatura.apresentacoes) {
      faturaHTML += `
      <li> ${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>
      `;
    }
  
    faturaHTML += `
    </ul>
    <p> Valor total: ${formatarMoeda(calcularTotalFatura(fatura, pecas))} </p>
    <p> Créditos acumulados: ${calcularTotalCreditos(fatura, pecas)} </p>
  </html>
    `;
  
    return faturaHTML;
  }

  
const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);
const faturaHTLM = gerarFaturaHTML(faturas,pecas);
console.log(faturaHTLM)

