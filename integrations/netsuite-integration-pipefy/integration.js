const axios = require('axios');

// Credenciais e URLs
const netsuiteAuth = {
  username: '',
  password: '',
};

const pipefyAuth = {
  token: '', // Insira seu token do Pipefy aqui JWT
};

const netsuiteUrl = 'https://api.netsuite.com/rest/record/v1/customer';
const pipefyUrl = 'https://api.pipefy.com/graphql';

// Função para obter dados do NetSuite
async function getNetsuiteData() {
  try {
    const response = await axios.get(netsuiteUrl, {
      auth: {
        username: netsuiteAuth.username,
        password: netsuiteAuth.password,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao obter dados do NetSuite:', error);
    throw error;
  }
}

// Função para enviar dados para o Pipefy
async function sendToPipefy(data) {
  const query = `
    mutation {
      createCard(pipe_id: SEU_PIPE_ID, title: "Novo Cliente", fields_attributes: [{field_id: SEU_CAMPO_ID, field_value: "${data.valor}"}]) {
          card {
              id
          }
      }
    }
  `;

  try {
    const response = await axios.post(pipefyUrl, { query }, {
      headers: {
        Authorization: `Bearer ${pipefyAuth.token}`, // Inclir o Token
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao enviar dados para o Pipefy:', error);
    throw error;
  }
}

// Executa a integração
async function runIntegration() {
  try {
    // Obtém dados do NetSuite
    const netsuiteData = await getNetsuiteData();

    // Envia dados para o Pipefy
    const pipefyResponse = await sendToPipefy(netsuiteData);

    console.log('Integração concluída com sucesso:', pipefyResponse);
  } catch (error) {
    console.error('Erro na integração:', error);
  }
}

// Executar a integração quando o script é executado
runIntegration();