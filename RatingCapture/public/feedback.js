// Seletores DOM
const form = document.getElementById('form-feedback');
const lista = document.getElementById('lista-feedbacks');
const filtroCheckboxes = document.querySelectorAll('.filter-nota');
const ctx = document.getElementById('graficoNotas').getContext('2d');
const toast = document.getElementById('toast');
const feedbackCount = document.getElementById('feedback-count');

// Variáveis globais
let feedbacks = [];
let chart;

// Função para exibir toast de notificação
function mostrarToast(mensagem, tipo = 'success') {
  const toastIcon = toast.querySelector('.toast-icon');
  const toastMessage = toast.querySelector('.toast-message');
  
  // Configurar ícone baseado no tipo
  if (tipo === 'success') {
    toastIcon.className = 'toast-icon fas fa-check-circle';
    toast.className = 'toast show';
  } else if (tipo === 'error') {
    toastIcon.className = 'toast-icon fas fa-exclamation-circle';
    toast.className = 'toast show error';
  }
  
  toastMessage.textContent = mensagem;
  
  // Remover toast após 4 segundos
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Função para validar formulário
function validarFormulario() {
  let isValid = true;
  
  // Limpar mensagens de erro anteriores
  document.querySelectorAll('.error-message').forEach(el => {
    el.classList.remove('show');
  });
  
  // Validar nome
  const nome = form.nome.value.trim();
  if (!nome) {
    document.getElementById('erro-nome').textContent = 'Por favor, informe seu nome.';
    document.getElementById('erro-nome').classList.add('show');
    isValid = false;
  } else if (nome.length < 2) {
    document.getElementById('erro-nome').textContent = 'Nome deve ter pelo menos 2 caracteres.';
    document.getElementById('erro-nome').classList.add('show');
    isValid = false;
  }
  
  // Validar nota
  const nota = parseInt(form.nota.value);
  if (isNaN(nota) || nota < 1 || nota > 5) {
    document.getElementById('erro-nota').textContent = 'Por favor, selecione uma avaliação válida.';
    document.getElementById('erro-nota').classList.add('show');
    isValid = false;
  }
  
  return isValid;
}

// Função para carregar feedbacks do servidor
async function carregarFeedbacks() {
  try {
    // Mostrar estado de carregamento
    lista.innerHTML = '<li class="loading-state"><i class="fas fa-spinner fa-spin"></i>Carregando feedbacks...</li>';
    
    const response = await fetch('/api/feedbacks');
    
    if (!response.ok) {
      throw new Error('Erro ao carregar feedbacks');
    }
    
    feedbacks = await response.json();
    renderizarLista();
    atualizarGrafico();
    atualizarContador();
    
  } catch (error) {
    console.error('Erro ao carregar feedbacks:', error);
    lista.innerHTML = '<li class="empty-state"><i class="fas fa-exclamation-triangle"></i>Erro ao carregar feedbacks. Tente novamente.</li>';
    mostrarToast('Erro ao carregar feedbacks. Tente novamente.', 'error');
  }
}

// Função para salvar feedback no servidor
async function salvarFeedback(feedbackData) {
  try {
    const response = await fetch('/api/feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao salvar feedback');
    }
    
    const novoFeedback = await response.json();
    return novoFeedback;
    
  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    throw error;
  }
}

// Função para renderizar lista de feedbacks com filtro
function renderizarLista() {
  const notasSelecionadas = Array.from(filtroCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => Number(cb.value));
  
  const filtrados = feedbacks.filter(fb => notasSelecionadas.includes(fb.nota));
  
  lista.innerHTML = '';
  
  if (filtrados.length === 0) {
    if (feedbacks.length === 0) {
      lista.innerHTML = '<li class="empty-state"><i class="fas fa-comment-slash"></i>Nenhum feedback recebido ainda. Seja a primeira a avaliar!</li>';
    } else {
      lista.innerHTML = '<li class="empty-state"><i class="fas fa-filter"></i>Nenhum feedback encontrado para os filtros selecionados.</li>';
    }
    return;
  }
  
  filtrados.forEach((fb, index) => {
    const li = document.createElement('li');
    li.style.animationDelay = `${index * 0.1}s`;
    
    // Gerar estrelas baseado na nota
    const estrelas = '⭐'.repeat(fb.nota);
    
    // Formatar data
    const data = new Date(fb.createdAt);
    const dataFormatada = data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    li.innerHTML = `
      <div class="nome">${escapeHtml(fb.nome)}</div>
      <div class="nota">
        <span>Avaliação: ${estrelas} (${fb.nota}/5)</span>
        <small style="margin-left: auto; color: #9ca3af;">${dataFormatada}</small>
      </div>
      ${fb.comentario ? `<div class="comentario">"${escapeHtml(fb.comentario)}"</div>` : ''}
    `;
    
    lista.appendChild(li);
  });
}

// Função para escapar HTML (prevenir XSS)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Função para atualizar contador de feedbacks
function atualizarContador() {
  const count = feedbacks.length;
  feedbackCount.textContent = `${count} ${count === 1 ? 'feedback' : 'feedbacks'}`;
}

// Função para atualizar gráfico
function atualizarGrafico() {
  // Contar número de notas 1 a 5
  const countNotas = [0, 0, 0, 0, 0];
  feedbacks.forEach(fb => {
    if (fb.nota >= 1 && fb.nota <= 5) {
      countNotas[fb.nota - 1]++;
    }
  });
  
  const data = {
    labels: ['1 Estrela', '2 Estrelas', '3 Estrelas', '4 Estrelas', '5 Estrelas'],
    datasets: [{
      label: 'Quantidade de avaliações',
      data: countNotas,
      backgroundColor: [
        '#ef4444', // vermelho para 1 estrela
        '#f97316', // laranja para 2 estrelas
        '#eab308', // amarelo para 3 estrelas
        '#22c55e', // verde para 4 estrelas
        '#ec4899'  // rosa para 5 estrelas
      ],
      borderColor: [
        '#dc2626',
        '#ea580c',
        '#ca8a04',
        '#16a34a',
        '#be185d'
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };
  
  const config = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : 0;
              return `${context.parsed.y} avaliações (${percentage}%)`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0,
            color: '#6b7280',
            font: {
              family: 'Poppins'
            }
          },
          grid: {
            color: 'rgba(236, 72, 153, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#6b7280',
            font: {
              family: 'Poppins',
              weight: '500'
            }
          },
          grid: {
            display: false
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    }
  };
  
  if (chart) {
    chart.data = data;
    chart.update('active');
  } else {
    chart = new Chart(ctx, config);
  }
}

// Evento de envio do formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Validar formulário
  if (!validarFormulario()) {
    return;
  }
  
  // Desabilitar botão de envio
  const submitBtn = form.querySelector('.submit-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Enviando...';
  submitBtn.disabled = true;
  
  try {
    const feedbackData = {
      nome: form.nome.value.trim(),
      nota: parseInt(form.nota.value),
      comentario: form.comentario.value.trim() || null
    };
    
    // Salvar no servidor
    const novoFeedback = await salvarFeedback(feedbackData);
    
    // Adicionar à lista local
    feedbacks.unshift(novoFeedback);
    
    // Atualizar interface
    renderizarLista();
    atualizarGrafico();
    atualizarContador();
    
    // Limpar formulário
    form.reset();
    
    // Mostrar sucesso
    mostrarToast('Feedback enviado com sucesso! Obrigada pela sua avaliação! 💖', 'success');
    
  } catch (error) {
    console.error('Erro ao enviar feedback:', error);
    mostrarToast('Erro ao enviar feedback. Tente novamente.', 'error');
  } finally {
    // Reabilitar botão
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

// Eventos para filtros
filtroCheckboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    renderizarLista();
  });
});

// Melhorar a experiência do usuário com animações
document.addEventListener('DOMContentLoaded', () => {
  // Adicionar animação de fade-in para seções
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    setTimeout(() => {
      section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }, index * 200);
  });
});

// Inicialização da aplicação
async function init() {
  console.log('🌸 Iniciando Sistema de Feedback Feminino...');
  await carregarFeedbacks();
  console.log('✨ Sistema carregado com sucesso!');
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', init);

// Adicionar evento para fechar toast ao clicar
toast.addEventListener('click', () => {
  toast.classList.remove('show');
});

// Auto-hide toast ao perder foco da janela
window.addEventListener('blur', () => {
  toast.classList.remove('show');
});

// Log para debugging (remover em produção)
console.log('🎀 Sistema de Feedback Carregado - Versão 1.0');
