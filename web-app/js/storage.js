/**
 * Gerenciamento de Armazenamento
 * Utiliza localStorage para persistir os dados da aplicação
 */

// Chaves para armazenamento
const STORAGE_KEYS = {
    ACCOUNTS: 'financialApp_accounts',
    EXPENSES: 'financialApp_expenses',
    DEPOSITS: 'financialApp_deposits',
    ADJUSTMENTS: 'financialApp_adjustments',
    SETTINGS: 'financialApp_settings'
};

/**
 * Objeto para gerenciar o armazenamento da aplicação
 */
const Storage = {
    /**
     * Salva dados no localStorage
     * @param {string} key - Chave para armazenamento
     * @param {*} data - Dados a serem armazenados
     */
    save: function(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    },

    /**
     * Carrega dados do localStorage
     * @param {string} key - Chave para buscar os dados
     * @param {*} defaultValue - Valor padrão caso não exista dados
     * @returns {*} Dados armazenados ou valor padrão
     */
    load: function(key, defaultValue = null) {
        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return defaultValue;
            }
            return JSON.parse(serializedData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return defaultValue;
        }
    },

    /**
     * Remove dados do localStorage
     * @param {string} key - Chave para remover
     */
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover dados:', error);
            return false;
        }
    },

    /**
     * Limpa todos os dados da aplicação
     */
    clearAll: function() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Erro ao limpar todos os dados:', error);
            return false;
        }
    }
};

/**
 * Gerenciador de Contas
 */
const AccountManager = {
    /**
     * Obtém todas as contas
     * @returns {Array} Lista de contas
     */
    getAll: function() {
        return Storage.load(STORAGE_KEYS.ACCOUNTS, []);
    },

    /**
     * Obtém uma conta pelo ID
     * @param {string} id - ID da conta
     * @returns {Object|null} Conta encontrada ou null
     */
    getById: function(id) {
        const accounts = this.getAll();
        return accounts.find(account => account.id === id) || null;
    },

    /**
     * Adiciona uma nova conta
     * @param {Object} account - Dados da conta
     * @returns {boolean} Sucesso da operação
     */
    add: function(account) {
        const accounts = this.getAll();
        
        // Adiciona um ID único à conta se não tiver
        if (!account.id) {
            account.id = generateId();
        }
        
        // Adiciona a data de criação
        account.createdAt = new Date().toISOString();
        
        accounts.push(account);
        return Storage.save(STORAGE_KEYS.ACCOUNTS, accounts);
    },

    /**
     * Atualiza uma conta existente
     * @param {string} id - ID da conta
     * @param {Object} updatedData - Novos dados
     * @returns {boolean} Sucesso da operação
     */
    update: function(id, updatedData) {
        const accounts = this.getAll();
        const index = accounts.findIndex(account => account.id === id);
        
        if (index === -1) return false;
        
        // Mantém o ID e a data de criação originais
        updatedData.id = id;
        updatedData.createdAt = accounts[index].createdAt;
        updatedData.updatedAt = new Date().toISOString();
        
        accounts[index] = { ...accounts[index], ...updatedData };
        return Storage.save(STORAGE_KEYS.ACCOUNTS, accounts);
    },

    /**
     * Remove uma conta
     * @param {string} id - ID da conta
     * @returns {boolean} Sucesso da operação
     */
    remove: function(id) {
        const accounts = this.getAll();
        const filteredAccounts = accounts.filter(account => account.id !== id);
        
        // Se a quantidade for igual, não encontrou a conta
        if (filteredAccounts.length === accounts.length) return false;
        
        return Storage.save(STORAGE_KEYS.ACCOUNTS, filteredAccounts);
    },

    /**
     * Atualiza o saldo de uma conta com registro de ajuste
     * @param {string} id - ID da conta
     * @param {number} newBalance - Novo saldo
     * @param {string} reason - Motivo do ajuste
     * @param {string} note - Observação adicional
     * @returns {boolean} Sucesso da operação
     */
    updateBalanceWithAdjustment: function(id, newBalance, reason, note = '') {
        const account = this.getById(id);
        if (!account) return false;
        
        const oldBalance = parseFloat(account.balance);
        const adjustmentAmount = parseFloat(newBalance) - oldBalance;
        
        // Registra o ajuste
        const adjustment = {
            accountId: id,
            oldBalance: oldBalance,
            newBalance: parseFloat(newBalance),
            adjustmentAmount: adjustmentAmount,
            reason: reason,
            note: note,
            date: new Date().toISOString()
        };
        
        const adjustmentSuccess = AdjustmentManager.add(adjustment);
        
        // Atualiza o saldo
        const updateSuccess = this.updateBalance(id, newBalance);
        
        return adjustmentSuccess && updateSuccess;
    },

    /**
     * Atualiza o saldo de uma conta
     * @param {string} id - ID da conta
     * @param {number} newBalance - Novo saldo
     * @returns {boolean} Sucesso da operação
     */
    updateBalance: function(id, newBalance) {
        const account = this.getById(id);
        if (!account) return false;
        
        return this.update(id, { balance: newBalance });
    },

    /**
     * Atualiza o limite de cheque especial
     * @param {string} id - ID da conta
     * @param {number} newLimit - Novo limite
     * @returns {boolean} Sucesso da operação
     */
    updateOverdraftLimit: function(id, newLimit) {
        const account = this.getById(id);
        if (!account) return false;
        
        return this.update(id, { overdraftLimit: newLimit });
    },

    /**
     * Calcula o saldo total de todas as contas
     * @returns {number} Saldo total
     */
    getTotalBalance: function() {
        const accounts = this.getAll();
        return accounts.reduce((total, account) => total + parseFloat(account.balance), 0);
    }
};

/**
 * Gerenciador de Despesas
 */
const ExpenseManager = {
    /**
     * Obtém todas as despesas
     * @returns {Array} Lista de despesas
     */
    getAll: function() {
        return Storage.load(STORAGE_KEYS.EXPENSES, []);
    },

    /**
     * Obtém despesas de uma conta específica
     * @param {string} accountId - ID da conta
     * @returns {Array} Lista de despesas da conta
     */
    getByAccountId: function(accountId) {
        const expenses = this.getAll();
        return expenses.filter(expense => expense.accountId === accountId);
    },

    /**
     * Obtém uma despesa pelo ID
     * @param {string} id - ID da despesa
     * @returns {Object|null} Despesa encontrada ou null
     */
    getById: function(id) {
        const expenses = this.getAll();
        return expenses.find(expense => expense.id === id) || null;
    },

    /**
     * Adiciona uma nova despesa
     * @param {Object} expense - Dados da despesa
     * @param {File|null} receiptFile - Arquivo de comprovante/boleto
     * @returns {boolean} Sucesso da operação
     */
    add: function(expense, receiptFile = null) {
        const expenses = this.getAll();
        
        // Adiciona um ID único à despesa
        if (!expense.id) {
            expense.id = generateId();
        }
        
        // Adiciona a data de criação
        expense.createdAt = new Date().toISOString();
        
        // Processa o arquivo de comprovante, se existir
        if (receiptFile) {
            expense.hasReceipt = true;
            expense.receiptName = receiptFile.name;
            expense.receiptType = receiptFile.type;
            
            // Converte o arquivo para base64
            const reader = new FileReader();
            reader.onload = (e) => {
                expense.receiptData = e.target.result;
                
                // Salva a despesa com o comprovante
                expenses.push(expense);
                
                // Atualiza o saldo da conta
                if (expense.accountId) {
                    const account = AccountManager.getById(expense.accountId);
                    if (account) {
                        const newBalance = parseFloat(account.balance) - parseFloat(expense.amount);
                        AccountManager.updateBalance(expense.accountId, newBalance);
                    }
                }
                
                Storage.save(STORAGE_KEYS.EXPENSES, expenses);
            };
            reader.readAsDataURL(receiptFile);
            return true;
        } else {
            expense.hasReceipt = false;
            expenses.push(expense);
            
            // Atualiza o saldo da conta
            if (expense.accountId) {
                const account = AccountManager.getById(expense.accountId);
                if (account) {
                    const newBalance = parseFloat(account.balance) - parseFloat(expense.amount);
                    AccountManager.updateBalance(expense.accountId, newBalance);
                }
            }
            
            return Storage.save(STORAGE_KEYS.EXPENSES, expenses);
        }
    },

    /**
     * Atualiza uma despesa existente
     * @param {string} id - ID da despesa
     * @param {Object} updatedData - Novos dados
     * @param {File|null} receiptFile - Novo arquivo de comprovante/boleto
     * @param {boolean} removeReceipt - Se deve remover o comprovante existente
     * @param {boolean} updateBalance - Se deve atualizar o saldo da conta
     * @returns {boolean|Promise} Sucesso da operação ou Promise
     */
    update: function(id, updatedData, receiptFile = null, removeReceipt = false, updateBalance = true) {
        const expenses = this.getAll();
        const index = expenses.findIndex(expense => expense.id === id);
        
        if (index === -1) return false;
        
        const oldExpense = expenses[index];
        
        // Mantém o ID, a conta e a data de criação originais
        updatedData.id = id;
        updatedData.accountId = oldExpense.accountId;
        updatedData.createdAt = oldExpense.createdAt;
        updatedData.updatedAt = new Date().toISOString();
        
        // Atualiza o saldo da conta se necessário
        if (updateBalance && updatedData.accountId) {
            const account = AccountManager.getById(updatedData.accountId);
            if (account) {
                // Restaura o valor antigo e subtrai o novo
                const newBalance = parseFloat(account.balance) + parseFloat(oldExpense.amount) - parseFloat(updatedData.amount);
                AccountManager.updateBalance(updatedData.accountId, newBalance);
            }
        }
        
        // Gerencia o comprovante
        if (removeReceipt) {
            // Remove o comprovante existente
            updatedData.hasReceipt = false;
            updatedData.receiptName = null;
            updatedData.receiptType = null;
            updatedData.receiptData = null;
            
            expenses[index] = { ...oldExpense, ...updatedData };
            return Storage.save(STORAGE_KEYS.EXPENSES, expenses);
        } else if (receiptFile) {
            // Adiciona um novo comprovante
            updatedData.hasReceipt = true;
            updatedData.receiptName = receiptFile.name;
            updatedData.receiptType = receiptFile.type;
            
            // Converte o arquivo para base64
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    updatedData.receiptData = e.target.result;
                    
                    expenses[index] = { ...oldExpense, ...updatedData };
                    const success = Storage.save(STORAGE_KEYS.EXPENSES, expenses);
                    resolve(success);
                };
                reader.readAsDataURL(receiptFile);
            });
        } else {
            // Mantém o comprovante existente, se houver
            if (oldExpense.hasReceipt) {
                updatedData.hasReceipt = true;
                updatedData.receiptName = oldExpense.receiptName;
                updatedData.receiptType = oldExpense.receiptType;
                updatedData.receiptData = oldExpense.receiptData;
            }
            
            expenses[index] = { ...oldExpense, ...updatedData };
            return Storage.save(STORAGE_KEYS.EXPENSES, expenses);
        }
    },

    /**
     * Remove uma despesa
     * @param {string} id - ID da despesa
     * @param {boolean} restoreBalance - Se deve restaurar o saldo da conta
     * @returns {boolean} Sucesso da operação
     */
    remove: function(id, restoreBalance = true) {
        const expenses = this.getAll();
        const expense = expenses.find(exp => exp.id === id);
        
        if (!expense) return false;
        
        // Restaura o saldo da conta se necessário
        if (restoreBalance && expense.accountId) {
            const account = AccountManager.getById(expense.accountId);
            if (account) {
                const newBalance = parseFloat(account.balance) + parseFloat(expense.amount);
                AccountManager.updateBalance(expense.accountId, newBalance);
            }
        }
        
        const filteredExpenses = expenses.filter(exp => exp.id !== id);
        return Storage.save(STORAGE_KEYS.EXPENSES, filteredExpenses);
    },

    /**
     * Remove todas as despesas de uma conta
     * @param {string} accountId - ID da conta
     * @returns {boolean} Sucesso da operação
     */
    removeByAccountId: function(accountId) {
        const expenses = this.getAll();
        const filteredExpenses = expenses.filter(expense => expense.accountId !== accountId);
        return Storage.save(STORAGE_KEYS.EXPENSES, filteredExpenses);
    },

    /**
     * Obtém o total de despesas de uma conta
     * @param {string} accountId - ID da conta
     * @returns {number} Total de despesas
     */
    getTotalByAccountId: function(accountId) {
        const expenses = this.getByAccountId(accountId);
        return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
    }
};

/**
 * Gerenciador de Configurações
 */
const SettingsManager = {
    /**
     * Obtém todas as configurações
     * @returns {Object} Configurações
     */
    getAll: function() {
        return Storage.load(STORAGE_KEYS.SETTINGS, {
            darkMode: false
        });
    },

    /**
     * Atualiza uma configuração
     * @param {string} key - Chave da configuração
     * @param {*} value - Valor da configuração
     * @returns {boolean} Sucesso da operação
     */
    update: function(key, value) {
        const settings = this.getAll();
        settings[key] = value;
        return Storage.save(STORAGE_KEYS.SETTINGS, settings);
    },

    /**
     * Verifica se o modo escuro está ativado
     * @returns {boolean} Status do modo escuro
     */
    isDarkModeEnabled: function() {
        const settings = this.getAll();
        return settings.darkMode === true;
    }
};

/**
 * Gerenciador de Depósitos
 */
const DepositManager = {
    /**
     * Obtém todos os depósitos
     * @returns {Array} Lista de depósitos
     */
    getAll: function() {
        return Storage.load(STORAGE_KEYS.DEPOSITS, []);
    },

    /**
     * Obtém depósitos de uma conta específica
     * @param {string} accountId - ID da conta
     * @returns {Array} Lista de depósitos da conta
     */
    getByAccountId: function(accountId) {
        const deposits = this.getAll();
        return deposits.filter(deposit => deposit.accountId === accountId);
    },

    /**
     * Obtém um depósito pelo ID
     * @param {string} id - ID do depósito
     * @returns {Object|null} Depósito encontrado ou null
     */
    getById: function(id) {
        const deposits = this.getAll();
        return deposits.find(deposit => deposit.id === id) || null;
    },

    /**
     * Adiciona um novo depósito
     * @param {Object} deposit - Dados do depósito
     * @returns {boolean} Sucesso da operação
     */
    add: function(deposit) {
        const deposits = this.getAll();
        
        // Adiciona um ID único ao depósito
        if (!deposit.id) {
            deposit.id = generateId();
        }
        
        // Adiciona a data de criação
        deposit.createdAt = new Date().toISOString();
        
        deposits.push(deposit);
        
        // Atualiza o saldo da conta
        if (deposit.accountId) {
            const account = AccountManager.getById(deposit.accountId);
            if (account) {
                const newBalance = parseFloat(account.balance) + parseFloat(deposit.amount);
                AccountManager.updateBalance(deposit.accountId, newBalance);
            }
        }
        
        return Storage.save(STORAGE_KEYS.DEPOSITS, deposits);
    },

    /**
     * Atualiza um depósito existente
     * @param {string} id - ID do depósito
     * @param {Object} updatedData - Novos dados
     * @param {boolean} updateBalance - Se deve atualizar o saldo da conta
     * @returns {boolean} Sucesso da operação
     */
    update: function(id, updatedData, updateBalance = true) {
        const deposits = this.getAll();
        const index = deposits.findIndex(deposit => deposit.id === id);
        
        if (index === -1) return false;
        
        const oldDeposit = deposits[index];
        
        // Mantém o ID, a conta e a data de criação originais
        updatedData.id = id;
        updatedData.accountId = oldDeposit.accountId;
        updatedData.createdAt = oldDeposit.createdAt;
        updatedData.updatedAt = new Date().toISOString();
        
        // Atualiza o saldo da conta se necessário
        if (updateBalance && updatedData.accountId) {
            const account = AccountManager.getById(updatedData.accountId);
            if (account) {
                // Restaura o valor antigo e adiciona o novo
                const newBalance = parseFloat(account.balance) - parseFloat(oldDeposit.amount) + parseFloat(updatedData.amount);
                AccountManager.updateBalance(updatedData.accountId, newBalance);
            }
        }
        
        deposits[index] = { ...oldDeposit, ...updatedData };
        return Storage.save(STORAGE_KEYS.DEPOSITS, deposits);
    },

    /**
     * Remove um depósito
     * @param {string} id - ID do depósito
     * @param {boolean} restoreBalance - Se deve restaurar o saldo da conta
     * @returns {boolean} Sucesso da operação
     */
    remove: function(id, restoreBalance = true) {
        const deposits = this.getAll();
        const deposit = deposits.find(dep => dep.id === id);
        
        if (!deposit) return false;
        
        // Restaura o saldo da conta se necessário
        if (restoreBalance && deposit.accountId) {
            const account = AccountManager.getById(deposit.accountId);
            if (account) {
                const newBalance = parseFloat(account.balance) - parseFloat(deposit.amount);
                AccountManager.updateBalance(deposit.accountId, newBalance);
            }
        }
        
        const filteredDeposits = deposits.filter(dep => dep.id !== id);
        return Storage.save(STORAGE_KEYS.DEPOSITS, filteredDeposits);
    },

    /**
     * Remove todos os depósitos de uma conta
     * @param {string} accountId - ID da conta
     * @returns {boolean} Sucesso da operação
     */
    removeByAccountId: function(accountId) {
        const deposits = this.getAll();
        const filteredDeposits = deposits.filter(deposit => deposit.accountId !== accountId);
        return Storage.save(STORAGE_KEYS.DEPOSITS, filteredDeposits);
    },

    /**
     * Obtém o total de depósitos de uma conta
     * @param {string} accountId - ID da conta
     * @returns {number} Total de depósitos
     */
    getTotalByAccountId: function(accountId) {
        const deposits = this.getByAccountId(accountId);
        return deposits.reduce((total, deposit) => total + parseFloat(deposit.amount), 0);
    }
};

/**
 * Gerenciador de Ajustes de Saldo
 */
const AdjustmentManager = {
    /**
     * Obtém todos os ajustes
     * @returns {Array} Lista de ajustes
     */
    getAll: function() {
        return Storage.load(STORAGE_KEYS.ADJUSTMENTS, []);
    },

    /**
     * Obtém ajustes de uma conta específica
     * @param {string} accountId - ID da conta
     * @returns {Array} Lista de ajustes da conta
     */
    getByAccountId: function(accountId) {
        const adjustments = this.getAll();
        return adjustments.filter(adjustment => adjustment.accountId === accountId);
    },

    /**
     * Adiciona um novo ajuste
     * @param {Object} adjustment - Dados do ajuste
     * @returns {boolean} Sucesso da operação
     */
    add: function(adjustment) {
        const adjustments = this.getAll();
        
        // Adiciona um ID único ao ajuste
        if (!adjustment.id) {
            adjustment.id = generateId();
        }
        
        // Adiciona a data de criação
        adjustment.createdAt = new Date().toISOString();
        
        adjustments.push(adjustment);
        return Storage.save(STORAGE_KEYS.ADJUSTMENTS, adjustments);
    },

    /**
     * Remove todos os ajustes de uma conta
     * @param {string} accountId - ID da conta
     * @returns {boolean} Sucesso da operação
     */
    removeByAccountId: function(accountId) {
        const adjustments = this.getAll();
        const filteredAdjustments = adjustments.filter(adjustment => adjustment.accountId !== accountId);
        return Storage.save(STORAGE_KEYS.ADJUSTMENTS, filteredAdjustments);
    }
}; 