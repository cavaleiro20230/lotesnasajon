import fs from 'fs/promises';
import path from 'path';

// Configurações
const CONFIG = {
  diretorioFonte: './dados-java',
  diretorioDestino: './dados-nasajon',
  tamanhoLote: 100,
  mapeamentoCampos: {
    'id_java': 'codigo_nasajon',
    'nome_completo': 'nome',
    'data_nascimento': 'dt_nascimento',
    'valor': 'valor_total'
  }
};

// Simula dados de uma aplicação Java
async function simularDadosJava(quantidade) {
  console.log(`Gerando ${quantidade} registros de exemplo da aplicação Java...`);
  
  const dados = [];
  for (let i = 1; i <= quantidade; i++) {
    dados.push({
      id_java: `J${i.toString().padStart(5, '0')}`,
      nome_completo: `Usuário Exemplo ${i}`,
      data_nascimento: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 30) + 1970}`,
      valor: parseFloat((Math.random() * 10000).toFixed(2)),
      status: Math.random() > 0.2 ? 'ATIVO' : 'INATIVO'
    });
  }
  
  return dados;
}

// Extrai dados da fonte (aplicação Java)
async function extrairDados() {
  try {
    // Em um cenário real, você poderia ler de um arquivo, banco de dados ou API
    // Aqui estamos simulando dados para o exemplo
    const dadosJava = await simularDadosJava(350);
    
    console.log(`Extraídos ${dadosJava.length} registros da aplicação Java`);
    return dadosJava;
  } catch (error) {
    console.error('Erro ao extrair dados:', error);
    throw error;
  }
}

// Transforma os dados para o formato do Nasajon
function transformarDados(dadosJava) {
  console.log('Transformando dados para o formato Nasajon...');
  
  return dadosJava.map(registro => {
    // Cria um novo objeto com os campos mapeados
    const registroNasajon = {};
    
    // Aplica o mapeamento de campos
    for (const [campoJava, campoNasajon] of Object.entries(CONFIG.mapeamentoCampos)) {
      registroNasajon[campoNasajon] = registro[campoJava];
    }
    
    // Adiciona campos específicos do Nasajon
    registroNasajon.data_importacao = new Date().toISOString();
    registroNasajon.sistema_origem = 'JAVA_APP';
    
    // Transforma o formato de data (DD/MM/YYYY para YYYY-MM-DD)
    if (registroNasajon.dt_nascimento) {
      const partes = registroNasajon.dt_nascimento.split('/');
      if (partes.length === 3) {
        registroNasajon.dt_nascimento = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      }
    }
    
    return registroNasajon;
  });
}

// Divide os dados em lotes
function dividirEmLotes(dados, tamanhoLote) {
  const lotes = [];
  for (let i = 0; i < dados.length; i += tamanhoLote) {
    lotes.push(dados.slice(i, i + tamanhoLote));
  }
  
  console.log(`Dados divididos em ${lotes.length} lotes de até ${tamanhoLote} registros`);
  return lotes;
}

// Importa um lote para o sistema Nasajon
async function importarLote(lote, numeroLote) {
  try {
    console.log(`Importando lote ${numeroLote} com ${lote.length} registros...`);
    
    // Em um cenário real, você enviaria os dados para a API do Nasajon
    // Aqui estamos simulando a importação salvando em um arquivo JSON
    const nomeArquivo = `lote_nasajon_${numeroLote.toString().padStart(3, '0')}.json`;
    
    // Simula o tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simula a gravação no sistema Nasajon
    const conteudoLote = {
      meta: {
        lote: numeroLote,
        data_processamento: new Date().toISOString(),
        total_registros: lote.length
      },
      dados: lote
    };
    
    // Simula o resultado da importação
    return {
      lote: numeroLote,
      registros: lote.length,
      status: 'SUCESSO',
      arquivo: nomeArquivo
    };
  } catch (error) {
    console.error(`Erro ao importar lote ${numeroLote}:`, error);
    return {
      lote: numeroLote,
      registros: lote.length,
      status: 'ERRO',
      mensagem: error.message
    };
  }
}

// Função principal que coordena todo o processo
async function processarExtracao() {
  console.log('Iniciando processo de extração e importação de lotes...');
  
  try {
    // 1. Extrair dados da aplicação Java
    const dadosJava = await extrairDados();
    
    // 2. Transformar dados para o formato Nasajon
    const dadosTransformados = transformarDados(dadosJava);
    
    // 3. Dividir em lotes
    const lotes = dividirEmLotes(dadosTransformados, CONFIG.tamanhoLote);
    
    // 4. Importar cada lote
    const resultados = [];
    for (let i = 0; i < lotes.length; i++) {
      const resultado = await importarLote(lotes[i], i + 1);
      resultados.push(resultado);
      
      // Pausa entre lotes para não sobrecarregar o sistema
      if (i < lotes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // 5. Gerar relatório final
    console.log('\n===== RELATÓRIO DE IMPORTAÇÃO =====');
    console.log(`Total de registros processados: ${dadosJava.length}`);
    console.log(`Total de lotes: ${lotes.length}`);
    
    const lotesSucesso = resultados.filter(r => r.status === 'SUCESSO').length;
    console.log(`Lotes com sucesso: ${lotesSucesso}`);
    console.log(`Lotes com erro: ${resultados.length - lotesSucesso}`);
    
    if (resultados.length - lotesSucesso > 0) {
      console.log('\nDetalhes dos lotes com erro:');
      resultados
        .filter(r => r.status === 'ERRO')
        .forEach(r => console.log(`- Lote ${r.lote}: ${r.mensagem}`));
    }
    
    console.log('\nProcesso de extração e importação concluído!');
    
  } catch (error) {
    console.error('Erro no processo de extração e importação:', error);
  }
}

// Executa o processo
processarExtracao();