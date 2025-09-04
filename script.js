// ====== CONFIGURAÇÕES DO AIRTABLE ======
// Substitua pelos seus dados do Airtable
const AIRTABLE_API_KEY = 'patlQxVewErXxAkjt.8421b821270cb9709d2501071528be665024463a87654f1912150573cc5a7a73';
const AIRTABLE_BASE_ID = 'appbJPvyeYbcmYZpo';
const AIRTABLE_TABLE_NAME = 'Clientes';

// Verificação das credenciais
console.log('=== CONFIGURAÇÃO AIRTABLE ===');
console.log('API Key:', AIRTABLE_API_KEY ? 'Configurada' : 'NÃO CONFIGURADA');
console.log('Base ID:', AIRTABLE_BASE_ID ? 'Configurada' : 'NÃO CONFIGURADA');
console.log('Table Name:', AIRTABLE_TABLE_NAME ? 'Configurada' : 'NÃO CONFIGURADA');
console.log('==============================');

// Elementos do DOM
const clientForm = document.getElementById('client-form');
const clientsList = document.getElementById('clients-list');
const alertBox = document.getElementById('alert');
const loadingElement = document.getElementById('loading');
const formTitle = document.getElementById('form-title');
const submitButton = document.getElementById('submit-btn');
const cancelButton = document.getElementById('cancel-btn');
const recordIdField = document.getElementById('record-id');

// URL da API do Airtable
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Headers para as requisições
const headers = {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
};

// Função para exibir mensagens de alerta
function showAlert(message, type = 'success') {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.style.display = 'block';

    // Esconder o alerta após 5 segundos
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

// Função para mostrar/ocultar o loading
function toggleLoading(show) {
    loadingElement.style.display = show ? 'block' : 'none';
    clientsList.style.display = show ? 'none' : 'table-row-group';
}

// Função para buscar todos os clientes
async function fetchClients() {
    try {
        toggleLoading(true);
        console.log('Buscando clientes...');
        console.log('URL:', AIRTABLE_URL);
        console.log('Headers:', headers);

        const response = await fetch(AIRTABLE_URL, {
            method: 'GET',
            headers: headers
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro da API ao buscar:', errorText);
            throw new Error(`Erro ao buscar clientes: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);
        displayClients(data.records);

    } catch (error) {
        console.error('Erro detalhado ao buscar:', error);
        showAlert('Erro ao carregar clientes: ' + error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// Função para exibir os clientes na tabela
function displayClients(clients) {
    clientsList.innerHTML = '';

    if (clients.length === 0) {
        clientsList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">Nenhum cliente cadastrado</td>
            </tr>
        `;
        return;
    }

    clients.forEach(client => {
        const { id, fields } = client;
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${fields.Nome || ''}</td>
            <td>${fields.Email || ''}</td>
            <td>${fields.Telefone || ''}</td>
            <td><span class="status-badge status-${fields.Status?.toLowerCase()}">${fields.Status || ''}</span></td>
            <td class="actions">
                <button class="edit" data-id="${id}">Editar</button>
                <button class="delete" data-id="${id}">Excluir</button>
            </td>
        `;

        clientsList.appendChild(row);
    });

    // Adicionar event listeners para os botões de editar e excluir
    document.querySelectorAll('button.edit').forEach(button => {
        button.addEventListener('click', (e) => editClient(e.target.dataset.id));
    });

    document.querySelectorAll('button.delete').forEach(button => {
        button.addEventListener('click', (e) => deleteClient(e.target.dataset.id));
    });
}

// Função para criar ou atualizar um cliente
async function saveClient(clientData, id = null) {
    try {
        const method = id ? 'PATCH' : 'POST';
        const url = id ? `${AIRTABLE_URL}/${id}` : AIRTABLE_URL;

        console.log('Enviando dados:', clientData);
        console.log('URL:', url);
        console.log('Método:', method);

        const body = JSON.stringify({
            fields: clientData
        });

        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro da API:', errorText);
            throw new Error(`Erro ao ${id ? 'atualizar' : 'criar'} cliente: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Cliente salvo com sucesso:', result);
        showAlert(`Cliente ${id ? 'atualizado' : 'criado'} com sucesso!`);

        // Limpar o formulário e recarregar a lista
        resetForm();
        fetchClients();

        return result;

    } catch (error) {
        console.error('Erro detalhado:', error);
        showAlert(`Erro ao ${id ? 'atualizar' : 'criar'} cliente: ${error.message}`, 'error');
        throw error;
    }
}

// Função para preencher o formulário com os dados de um cliente para edição
function editClient(id) {
    // Buscar os dados do cliente específico
    fetch(`${AIRTABLE_URL}/${id}`, {
        method: 'GET',
        headers: headers
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao buscar cliente: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(client => {
        const { fields } = client;

        // Preencher o formulário com os dados do cliente
        document.getElementById('name').value = fields.Nome || '';
        document.getElementById('email').value = fields.Email || '';
        document.getElementById('phone').value = fields.Telefone || '';
        document.getElementById('status').value = fields.Status || '';
        recordIdField.value = client.id;

        // Alterar o título do formulário e o texto do botão
        formTitle.textContent = 'Editar Cliente';
        submitButton.textContent = 'Atualizar Cliente';
        cancelButton.style.display = 'inline-block';

        // Rolagem suave até o formulário
        clientForm.scrollIntoView({ behavior: 'smooth' });
    })
    .catch(error => {
        console.error('Erro:', error);
        showAlert('Erro ao carregar dados do cliente: ' + error.message, 'error');
    });
}

// Função para excluir um cliente
async function deleteClient(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
        return;
    }

    try {
        const response = await fetch(`${AIRTABLE_URL}/${id}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Erro ao excluir cliente: ${response.status} ${response.statusText}`);
        }

        showAlert('Cliente excluído com sucesso!');
        fetchClients();

    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao excluir cliente: ' + error.message, 'error');
    }
}

// Função para resetar o formulário
function resetForm() {
    clientForm.reset();
    recordIdField.value = '';
    formTitle.textContent = 'Adicionar Novo Cliente';
    submitButton.textContent = 'Salvar Cliente';
    cancelButton.style.display = 'none';
}

// Event Listener para o envio do formulário
clientForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const clientData = {
        'Nome': document.getElementById('name').value,
        'Email': document.getElementById('email').value,
        'Telefone': document.getElementById('phone').value,
        'Status': document.getElementById('status').value
    };

    const id = recordIdField.value;

    saveClient(clientData, id || null);
});

// Event Listener para o botão de cancelar
cancelButton.addEventListener('click', resetForm);

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', function() {
    fetchClients();
});