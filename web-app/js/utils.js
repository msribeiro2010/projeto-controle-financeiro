/**
 * Utilitários para a aplicação de Controle Financeiro
 */

/**
 * Formata um valor numérico para formato de moeda brasileira
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado como moeda
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata uma data no padrão brasileiro
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada (DD/MM/YYYY)
 */
function formatDate(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

/**
 * Formata o número da conta bancária
 * @param {string} accountNumber - Número da conta
 * @returns {string} Número formatado
 */
function formatAccountNumber(accountNumber) {
    // Verifica se já está formatado
    if (accountNumber.includes('-')) {
        return accountNumber;
    }
    
    // Formata com hífen antes do último dígito
    const digits = accountNumber.replace(/\D/g, '');
    if (digits.length <= 1) return digits;
    
    return `${digits.slice(0, -1)}-${digits.slice(-1)}`;
}

/**
 * Gera um ID único
 * @returns {string} ID único
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Obtém a inicial de uma string
 * @param {string} text - Texto para obter a inicial
 * @returns {string} Inicial em maiúsculo
 */
function getInitial(text) {
    return text ? text.trim().charAt(0).toUpperCase() : '';
}

/**
 * Trunca um texto longo
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Tamanho máximo
 * @returns {string} Texto truncado
 */
function truncateText(text, maxLength = 20) {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
}

/**
 * Obtém a data atual no formato YYYY-MM-DD para input date
 * @returns {string} Data no formato YYYY-MM-DD
 */
function getCurrentDateForInput() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Debounce - limita a quantidade de vezes que uma função é chamada
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em milissegundos
 * @returns {Function} Função com debounce
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Mostra uma notificação toast
 * @param {string} message - Mensagem a ser exibida
 * @param {number} duration - Duração em milissegundos
 */
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Valida um número de conta bancária
 * @param {string} accountNumber - Número da conta a ser validado
 * @returns {boolean} Verdadeiro se for válido
 */
function isValidAccountNumber(accountNumber) {
    // Simplificado para fins de exemplo
    return /^[\d]{1,10}-[\d]$/.test(accountNumber);
}

/**
 * Calcular saldo disponível (soma do saldo atual e limite do cheque especial)
 * @param {number} balance - Saldo atual
 * @param {number} overdraftLimit - Limite do cheque especial
 * @returns {number} Saldo disponível
 */
function calculateAvailableBalance(balance, overdraftLimit) {
    return balance + (overdraftLimit || 0);
}

/**
 * Determina se um saldo está positivo, negativo ou zerado
 * @param {number} balance - Saldo a verificar
 * @returns {string} 'positive', 'negative' ou 'zero'
 */
function getBalanceStatus(balance) {
    if (balance > 0) return 'positive';
    if (balance < 0) return 'negative';
    return 'zero';
} 