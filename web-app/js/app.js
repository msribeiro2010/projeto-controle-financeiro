/**
 * Aplicação de Controle Financeiro
 * Inicializa e gerencia o fluxo principal da aplicação
 */

// Aguarda o DOM ser carregado completamente
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

/**
 * Inicializa a aplicação
 */
function initApp() {
    // Inicializa as interfaces
    ModalUI.init();
    AccountUI.init();
    ExpenseUI.init();
    DepositUI.init();
    SettingsUI.init();
    
    // Carrega os dados iniciais
    AccountUI.renderAccounts();
    
    // Verifica suporte a localStorage
    if (!isLocalStorageSupported()) {
        showToast('Seu navegador não suporta armazenamento local. Os dados não serão salvos.', 5000);
    }
    
    // Log para debug
    console.log('Aplicação de Controle Financeiro iniciada com sucesso!');
}

/**
 * Verifica se o navegador suporta localStorage
 * @returns {boolean} Se suporta ou não
 */
function isLocalStorageSupported() {
    try {
        const testKey = '__test_key__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Adiciona estilos dinâmicos para estados de saldo
 */
function addDynamicStyles() {
    const styleElement = document.createElement('style');
    
    // CSS para indicar saldos positivos, negativos e zerados
    const css = `
        .account-balance.positive, .summary-balance.positive {
            color: var(--success-color);
        }
        
        .account-balance.negative, .summary-balance.negative {
            color: var(--danger-color);
        }
        
        .account-balance.zero, .summary-balance.zero {
            color: var(--gray-600);
        }
    `;
    
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
}

// Adiciona os estilos dinâmicos no carregamento
addDynamicStyles(); 