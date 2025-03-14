/**
 * Interface do Usuário
 * Gerencia a interação com o DOM e elementos visuais
 */

/**
 * Gerencia modais da aplicação
 */
const ModalUI = {
    /**
     * Abre um modal pelo seu ID
     * @param {string} modalId - ID do modal a ser aberto
     */
    open: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Impede scroll do body
        }
    },

    /**
     * Fecha um modal pelo seu ID
     * @param {string} modalId - ID do modal a ser fechado
     */
    close: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restaura scroll do body
        }
    },

    /**
     * Fecha todos os modais abertos
     */
    closeAll: function() {
        const activeModals = document.querySelectorAll('.modal.active');
        activeModals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    },

    /**
     * Inicializa os eventos de fechamento dos modais
     */
    init: function() {
        // Fecha o modal quando clica fora do conteúdo
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal') && event.target.classList.contains('active')) {
                this.close(event.target.id);
            }
        });

        // Fecha o modal quando clica no botão de fechar
        const closeButtons = document.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modalId = button.getAttribute('data-close-modal');
                this.close(modalId);
            });
        });

        // Fecha todos os modais ao pressionar ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeAll();
            }
        });
    }
};

/**
 * Gerencia a interface para contas bancárias
 */
const AccountUI = {
    /**
     * Renderiza a lista de contas na interface
     */
    renderAccounts: function() {
        const accountsList = document.getElementById('accountsList');
        const emptyState = document.getElementById('emptyState');
        const accounts = AccountManager.getAll();
        const helpTip = document.getElementById('accountsHelpTip');

        // Atualiza o saldo total
        this.updateTotalBalance();

        // Se não houver contas, mostra o estado vazio e esconde a dica
        if (accounts.length === 0) {
            accountsList.innerHTML = '';
            emptyState.style.display = 'block';
            if (helpTip) helpTip.style.display = 'none';
            return;
        }

        // Esconde o estado vazio, mostra as contas e a dica
        emptyState.style.display = 'none';
        if (helpTip) helpTip.style.display = 'block';
        
        // Renderiza cada conta
        accountsList.innerHTML = accounts.map(account => {
            const bankInitial = getInitial(account.bankName);
            const formattedBalance = formatCurrency(account.balance);
            const balanceClass = getBalanceStatus(account.balance);
            
            return `
                <div class="account-card" data-account-id="${account.id}">
                    <div class="account-card-header">
                        <div class="bank-logo">
                            ${bankInitial}
                        </div>
                        <div class="account-details">
                            <div class="bank-name">${account.bankName}</div>
                            <div class="account-number">Conta: ${account.accountNumber}</div>
                        </div>
                    </div>
                    <div class="account-balance ${balanceClass}">${formattedBalance}</div>
                </div>
            `;
        }).join('');

        // Adiciona evento de clique nas contas
        const accountCards = document.querySelectorAll('.account-card');
        accountCards.forEach(card => {
            card.addEventListener('click', () => {
                const accountId = card.getAttribute('data-account-id');
                this.showAccountDetails(accountId);
            });
        });
    },

    /**
     * Atualiza o saldo total exibido na interface
     */
    updateTotalBalance: function() {
        const totalBalanceElement = document.getElementById('totalBalance');
        const totalBalance = AccountManager.getTotalBalance();
        totalBalanceElement.textContent = formatCurrency(totalBalance);
        
        // Adiciona classe para estilização baseada no valor
        totalBalanceElement.className = 'summary-balance ' + getBalanceStatus(totalBalance);
    },

    /**
     * Atualiza o saldo de uma conta específica na lista de contas
     * @param {string} accountId - ID da conta
     */
    updateAccountBalance: function(accountId) {
        const account = AccountManager.getById(accountId);
        if (!account) return;
        
        // Atualiza o saldo total
        this.updateTotalBalance();
        
        // Atualiza o saldo da conta específica na lista
        const accountCard = document.querySelector(`.account-card[data-account-id="${accountId}"]`);
        if (accountCard) {
            const balanceElement = accountCard.querySelector('.account-balance');
            if (balanceElement) {
                balanceElement.textContent = formatCurrency(account.balance);
                balanceElement.className = 'account-balance ' + getBalanceStatus(account.balance);
            }
        }
    },

    /**
     * Atualiza os detalhes de saldo de uma conta específica no modal de detalhes
     * @param {string} accountId - ID da conta
     */
    updateAccountDetails: function(accountId) {
        const account = AccountManager.getById(accountId);
        if (!account) return;

        // Atualiza os valores de saldo no modal
        const balanceElement = document.getElementById('detailsBalance');
        balanceElement.textContent = formatCurrency(account.balance);
        balanceElement.className = 'balance-value ' + getBalanceStatus(account.balance);
        
        // Atualiza o limite de cheque especial
        document.getElementById('detailsOverdraftLimit').textContent = formatCurrency(account.overdraftLimit || 0);
        
        // Calcula e atualiza o saldo disponível
        const availableBalance = calculateAvailableBalance(account.balance, account.overdraftLimit);
        const availableBalanceElement = document.getElementById('detailsAvailableBalance');
        availableBalanceElement.textContent = formatCurrency(availableBalance);
        
        // Adiciona classe para estilização do saldo disponível
        if (availableBalance > 0) {
            availableBalanceElement.className = 'available-value positive';
        } else if (availableBalance < 0) {
            availableBalanceElement.className = 'available-value negative';
        } else {
            availableBalanceElement.className = 'available-value zero';
        }
    },

    /**
     * Mostra os detalhes de uma conta
     * @param {string} accountId - ID da conta
     */
    showAccountDetails: function(accountId) {
        const account = AccountManager.getById(accountId);
        if (!account) return;

        // Preenche os detalhes no modal
        document.getElementById('detailsBankName').textContent = account.bankName;
        document.getElementById('detailsAccountNumber').textContent = `Conta: ${account.accountNumber}`;
        document.getElementById('detailsBalance').textContent = formatCurrency(account.balance);
        document.getElementById('detailsOverdraftLimit').textContent = formatCurrency(account.overdraftLimit || 0);
        
        const availableBalance = calculateAvailableBalance(account.balance, account.overdraftLimit);
        document.getElementById('detailsAvailableBalance').textContent = formatCurrency(availableBalance);

        // Armazena o ID da conta atual no botão de exclusão
        const deleteButton = document.getElementById('btnDeleteAccount');
        deleteButton.setAttribute('data-account-id', accountId);

        // Armazena o ID da conta no botão de editar limite
        const editOverdraftButton = document.getElementById('btnEditOverdraft');
        editOverdraftButton.setAttribute('data-account-id', accountId);

        // Armazena o ID da conta no botão de adicionar despesa
        const addExpenseButton = document.getElementById('btnAddExpense');
        addExpenseButton.setAttribute('data-account-id', accountId);
        
        // Armazena o ID da conta no botão de adicionar depósito
        const addDepositButton = document.getElementById('btnAddDeposit');
        addDepositButton.setAttribute('data-account-id', accountId);

        // Renderiza as despesas da conta
        ExpenseUI.renderExpensesByAccount(accountId);
        
        // Renderiza os depósitos da conta
        DepositUI.renderDepositsByAccount(accountId);
        
        // Renderiza os ajustes de saldo da conta
        AdjustmentUI.renderAdjustmentsByAccount(accountId);

        // Abre o modal de detalhes
        ModalUI.open('accountDetailsModal');
    },

    /**
     * Inicializa os eventos relacionados às contas
     */
    init: function() {
        // Botão para adicionar conta
        const addAccountButton = document.getElementById('btnAddAccount');
        if (addAccountButton) {
            addAccountButton.addEventListener('click', () => {
                ModalUI.open('addAccountModal');
            });
        }

        // Formulário de adicionar conta
        const addAccountForm = document.getElementById('addAccountForm');
        if (addAccountForm) {
            addAccountForm.addEventListener('submit', (event) => {
                event.preventDefault();
                
                let bankName = document.getElementById('bankName').value;
                if (bankName === 'outro') {
                    bankName = document.getElementById('customBankName').value;
                }
                
                const accountNumber = document.getElementById('accountNumber').value;
                const balance = parseFloat(document.getElementById('balance').value);
                const overdraftLimit = parseFloat(document.getElementById('overdraftLimit').value) || 0;
                
                // Validações básicas
                if (!bankName || !accountNumber || isNaN(balance)) {
                    showToast('Por favor, preencha todos os campos corretamente.');
                    return;
                }
                
                // Formata o número da conta
                const formattedAccountNumber = formatAccountNumber(accountNumber);
                
                // Cria objeto da conta
                const newAccount = {
                    bankName,
                    accountNumber: formattedAccountNumber,
                    balance,
                    overdraftLimit
                };
                
                // Salva a conta
                const success = AccountManager.add(newAccount);
                
                if (success) {
                    addAccountForm.reset();
                    ModalUI.close('addAccountModal');
                    this.renderAccounts();
                    showToast('Conta adicionada com sucesso!');
                } else {
                    showToast('Erro ao adicionar conta. Tente novamente.');
                }
            });
        }

        // Botão para editar limite de cheque especial
        const editOverdraftButton = document.getElementById('btnEditOverdraft');
        if (editOverdraftButton) {
            editOverdraftButton.addEventListener('click', () => {
                const accountId = editOverdraftButton.getAttribute('data-account-id');
                const account = AccountManager.getById(accountId);
                
                if (account) {
                    document.getElementById('newOverdraftLimit').value = account.overdraftLimit || 0;
                    document.getElementById('editOverdraftForm').setAttribute('data-account-id', accountId);
                    ModalUI.open('editOverdraftModal');
                }
            });
        }

        // Botão para editar saldo atual
        const editBalanceButton = document.getElementById('btnEditBalance');
        if (editBalanceButton) {
            editBalanceButton.addEventListener('click', () => {
                const accountId = document.getElementById('btnEditOverdraft').getAttribute('data-account-id');
                const account = AccountManager.getById(accountId);
                
                if (account) {
                    document.getElementById('newBalance').value = account.balance;
                    document.getElementById('editBalanceForm').setAttribute('data-account-id', accountId);
                    ModalUI.open('editBalanceModal');
                }
            });
        }

        // Formulário de editar limite
        const editOverdraftForm = document.getElementById('editOverdraftForm');
        if (editOverdraftForm) {
            editOverdraftForm.addEventListener('submit', (event) => {
                event.preventDefault();
                
                const accountId = editOverdraftForm.getAttribute('data-account-id');
                const newLimit = parseFloat(document.getElementById('newOverdraftLimit').value) || 0;
                
                const success = AccountManager.updateOverdraftLimit(accountId, newLimit);
                
                if (success) {
                    ModalUI.close('editOverdraftModal');
                    // Atualiza os detalhes em tempo real
                    this.updateAccountDetails(accountId);
                    showToast('Limite atualizado com sucesso!');
                } else {
                    showToast('Erro ao atualizar limite. Tente novamente.');
                }
            });
        }

        // Formulário de editar saldo
        const editBalanceForm = document.getElementById('editBalanceForm');
        if (editBalanceForm) {
            editBalanceForm.addEventListener('submit', (event) => {
                event.preventDefault();
                
                const accountId = editBalanceForm.getAttribute('data-account-id');
                const newBalance = parseFloat(document.getElementById('newBalance').value);
                const reason = document.getElementById('balanceAdjustmentReason').value;
                const note = document.getElementById('balanceAdjustmentNote').value;
                
                // Validações básicas
                if (isNaN(newBalance) || !reason) {
                    showToast('Por favor, preencha todos os campos corretamente.');
                    return;
                }
                
                const success = AccountManager.updateBalanceWithAdjustment(accountId, newBalance, reason, note);
                
                if (success) {
                    editBalanceForm.reset();
                    ModalUI.close('editBalanceModal');
                    
                    // Atualiza a interface em tempo real
                    this.updateAccountDetails(accountId);
                    this.updateAccountBalance(accountId);
                    
                    showToast('Saldo atualizado com sucesso!');
                } else {
                    showToast('Erro ao atualizar saldo. Tente novamente.');
                }
            });
        }

        // Botão para excluir conta
        const deleteAccountButton = document.getElementById('btnDeleteAccount');
        if (deleteAccountButton) {
            deleteAccountButton.addEventListener('click', () => {
                ModalUI.open('confirmDeleteModal');
            });
        }

        // Botão de confirmar exclusão
        const confirmDeleteButton = document.getElementById('btnConfirmDelete');
        if (confirmDeleteButton) {
            confirmDeleteButton.addEventListener('click', () => {
                const accountId = document.getElementById('btnDeleteAccount').getAttribute('data-account-id');
                
                // Remove a conta e suas transações
                const success = this.deleteAccount(accountId);
                
                if (success) {
                    ModalUI.close('confirmDeleteModal');
                    ModalUI.close('accountDetailsModal');
                    this.renderAccounts();
                    showToast('Conta excluída com sucesso!');
                } else {
                    showToast('Erro ao excluir conta. Tente novamente.');
                }
            });
        }

        // Seletor de banco
        const bankSelector = document.getElementById('bankName');
        if (bankSelector) {
            bankSelector.addEventListener('change', () => {
                const customBankGroup = document.getElementById('customBankGroup');
                if (bankSelector.value === 'outro') {
                    customBankGroup.style.display = 'block';
                } else {
                    customBankGroup.style.display = 'none';
                }
            });
        }
    },

    /**
     * Exclui uma conta e suas transações
     * @param {string} accountId - ID da conta
     * @returns {boolean} Sucesso da operação
     */
    deleteAccount: function(accountId) {
        // Remove as despesas da conta
        ExpenseManager.removeByAccountId(accountId);
        
        // Remove os depósitos da conta
        DepositManager.removeByAccountId(accountId);
        
        // Remove os ajustes da conta
        AdjustmentManager.removeByAccountId(accountId);
        
        // Remove a conta
        return AccountManager.remove(accountId);
    }
};

/**
 * Gerencia a interface para despesas
 */
const ExpenseUI = {
    /**
     * Renderiza as despesas de uma conta específica
     * @param {string} accountId - ID da conta
     */
    renderExpensesByAccount: function(accountId) {
        const expensesList = document.getElementById('expensesList');
        const emptyExpensesState = document.getElementById('emptyExpensesState');
        const expenses = ExpenseManager.getByAccountId(accountId);
        
        // Ordena as despesas por data (mais recentes primeiro)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Se não houver despesas, mostra o estado vazio
        if (expenses.length === 0) {
            expensesList.innerHTML = '';
            emptyExpensesState.style.display = 'block';
            return;
        }
        
        // Esconde o estado vazio e mostra as despesas
        emptyExpensesState.style.display = 'none';
        
        // Renderiza cada despesa
        expensesList.innerHTML = expenses.map(expense => {
            const formattedAmount = formatCurrency(expense.amount);
            const formattedDate = formatDate(expense.date);
            const receiptIndicator = expense.hasReceipt ? 
                `<span class="receipt-indicator" data-expense-id="${expense.id}" title="Ver comprovante">
                    <i class="fas fa-paperclip"></i>
                </span>` : '';
            
            return `
                <div class="expense-item ${expense.hasReceipt ? 'expense-item-with-receipt' : ''}" data-expense-id="${expense.id}">
                    <div class="expense-info">
                        <div class="expense-category">${expense.category}</div>
                        <div class="expense-description">${expense.description}</div>
                        <div class="expense-date">${formattedDate}</div>
                    </div>
                    <div class="expense-amount negative">${formattedAmount} ${receiptIndicator}</div>
                    <div class="expense-actions">
                        <button class="btn-icon btn-edit-expense" data-expense-id="${expense.id}" aria-label="Editar despesa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete-expense" data-expense-id="${expense.id}" aria-label="Excluir despesa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Adiciona eventos aos botões de edição e exclusão
        this.addExpenseActionEvents(accountId);
        
        // Adiciona eventos aos indicadores de comprovante
        this.addReceiptEvents();
    },

    /**
     * Adiciona eventos aos botões de ação das despesas
     * @param {string} accountId - ID da conta
     */
    addExpenseActionEvents: function(accountId) {
        // Adiciona eventos aos botões de edição
        const editButtons = document.querySelectorAll('.btn-edit-expense');
        editButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation(); // Evita propagação do evento
                const expenseId = button.getAttribute('data-expense-id');
                this.showEditExpenseModal(expenseId, accountId);
            });
        });
        
        // Adiciona eventos aos botões de exclusão
        const deleteButtons = document.querySelectorAll('.btn-delete-expense');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation(); // Evita propagação do evento
                const expenseId = button.getAttribute('data-expense-id');
                this.showDeleteExpenseConfirmation(expenseId, accountId);
            });
        });
    },

    /**
     * Adiciona eventos aos indicadores de comprovante
     */
    addReceiptEvents: function() {
        const receiptIndicators = document.querySelectorAll('.receipt-indicator');
        receiptIndicators.forEach(indicator => {
            indicator.addEventListener('click', (event) => {
                event.stopPropagation(); // Evita propagação do evento
                const expenseId = indicator.getAttribute('data-expense-id');
                this.showReceiptPreview(expenseId);
            });
        });
    },

    /**
     * Mostra a visualização do comprovante
     * @param {string} expenseId - ID da despesa
     */
    showReceiptPreview: function(expenseId) {
        const expense = ExpenseManager.getById(expenseId);
        if (!expense || !expense.hasReceipt) return;
        
        // Cria o elemento de visualização
        const previewElement = document.createElement('div');
        previewElement.className = 'receipt-preview';
        
        // Determina o tipo de conteúdo
        let contentHtml = '';
        if (expense.receiptType.startsWith('image/')) {
            contentHtml = `<img src="${expense.receiptData}" alt="Comprovante">`;
        } else if (expense.receiptType === 'application/pdf') {
            contentHtml = `<iframe src="${expense.receiptData}" title="Comprovante PDF"></iframe>`;
        } else {
            contentHtml = `<div style="padding: 20px; background: white; border-radius: 8px;">
                <p>Não foi possível visualizar este tipo de arquivo.</p>
                <p>Tipo: ${expense.receiptType}</p>
                <p>Nome: ${expense.receiptName}</p>
            </div>`;
        }
        
        // Adiciona o conteúdo
        previewElement.innerHTML = `
            <div class="receipt-preview-content">
                ${contentHtml}
            </div>
            <button class="receipt-preview-close" aria-label="Fechar visualização">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Adiciona ao DOM
        document.body.appendChild(previewElement);
        
        // Adiciona evento para fechar
        const closeButton = previewElement.querySelector('.receipt-preview-close');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(previewElement);
        });
        
        // Fecha ao clicar fora do conteúdo
        previewElement.addEventListener('click', (event) => {
            if (event.target === previewElement) {
                document.body.removeChild(previewElement);
            }
        });
    },

    /**
     * Mostra o modal de edição de despesa
     * @param {string} expenseId - ID da despesa
     * @param {string} accountId - ID da conta
     */
    showEditExpenseModal: function(expenseId, accountId) {
        const expense = ExpenseManager.getById(expenseId);
        if (!expense) return;
        
        // Preenche o formulário com os dados da despesa
        document.getElementById('editExpenseCategory').value = expense.category;
        document.getElementById('editExpenseDescription').value = expense.description;
        document.getElementById('editExpenseAmount').value = expense.amount;
        document.getElementById('editExpenseDate').value = expense.date;
        
        // Limpa o campo de arquivo
        const fileInput = document.getElementById('editExpenseReceipt');
        fileInput.value = '';
        document.getElementById('editExpenseReceiptName').textContent = 'Nenhum arquivo selecionado';
        
        // Mostra informações do comprovante atual, se existir
        const currentReceiptContainer = document.getElementById('currentReceiptContainer');
        const currentReceiptName = document.getElementById('currentReceiptName');
        const viewReceiptBtn = document.getElementById('viewReceiptBtn');
        
        if (expense.hasReceipt) {
            currentReceiptContainer.style.display = 'block';
            currentReceiptName.textContent = expense.receiptName;
            
            // Configura o botão de visualizar
            viewReceiptBtn.onclick = () => this.showReceiptPreview(expenseId);
        } else {
            currentReceiptContainer.style.display = 'none';
        }
        
        // Armazena os IDs no formulário
        const editForm = document.getElementById('editExpenseForm');
        editForm.setAttribute('data-expense-id', expenseId);
        editForm.setAttribute('data-account-id', accountId);
        
        // Abre o modal
        ModalUI.open('editExpenseModal');
    },

    /**
     * Mostra a confirmação de exclusão de despesa
     * @param {string} expenseId - ID da despesa
     * @param {string} accountId - ID da conta
     */
    showDeleteExpenseConfirmation: function(expenseId, accountId) {
        const expense = ExpenseManager.getById(expenseId);
        if (!expense) return;
        
        // Configura o modal de confirmação
        const confirmDeleteBtn = document.getElementById('btnConfirmDeleteExpense');
        confirmDeleteBtn.setAttribute('data-expense-id', expenseId);
        confirmDeleteBtn.setAttribute('data-account-id', accountId);
        
        // Atualiza o texto de confirmação
        const confirmText = document.getElementById('confirmDeleteExpenseText');
        confirmText.textContent = `Tem certeza que deseja excluir a despesa "${expense.description}" de ${formatCurrency(expense.amount)}?`;
        
        // Abre o modal
        ModalUI.open('confirmDeleteExpenseModal');
    },

    /**
     * Inicializa os eventos relacionados às despesas
     */
    init: function() {
        // Botão para adicionar despesa
        const addExpenseButton = document.getElementById('btnAddExpense');
        if (addExpenseButton) {
            addExpenseButton.addEventListener('click', () => {
                // Define a data atual no campo de data
                const dateInput = document.getElementById('expenseDate');
                if (dateInput) {
                    dateInput.value = getCurrentDateForInput();
                }
                
                // Armazena o ID da conta no formulário
                const accountId = addExpenseButton.getAttribute('data-account-id');
                document.getElementById('addExpenseForm').setAttribute('data-account-id', accountId);
                
                // Limpa o campo de arquivo
                const fileInput = document.getElementById('expenseReceipt');
                fileInput.value = '';
                document.getElementById('expenseReceiptName').textContent = 'Nenhum arquivo selecionado';
                
                ModalUI.open('addExpenseModal');
            });
        }

        // Formulário de adicionar despesa
        const addExpenseForm = document.getElementById('addExpenseForm');
        if (addExpenseForm) {
            addExpenseForm.addEventListener('submit', (event) => {
                event.preventDefault();
                
                const accountId = addExpenseForm.getAttribute('data-account-id');
                const category = document.getElementById('expenseCategory').value;
                const description = document.getElementById('expenseDescription').value;
                const amount = parseFloat(document.getElementById('expenseAmount').value);
                const date = document.getElementById('expenseDate').value;
                const receiptFile = document.getElementById('expenseReceipt').files[0] || null;
                
                // Validações básicas
                if (!category || !description || isNaN(amount) || amount <= 0 || !date) {
                    showToast('Por favor, preencha todos os campos corretamente.');
                    return;
                }
                
                // Cria objeto da despesa
                const newExpense = {
                    accountId,
                    category,
                    description,
                    amount,
                    date
                };
                
                // Salva a despesa
                const success = ExpenseManager.add(newExpense, receiptFile);
                
                if (success) {
                    addExpenseForm.reset();
                    ModalUI.close('addExpenseModal');
                    
                    // Atualiza a interface em tempo real
                    AccountUI.updateAccountDetails(accountId);
                    AccountUI.updateAccountBalance(accountId);
                    
                    // Se tiver anexo, aguarda um pouco para renderizar as despesas
                    // para dar tempo do arquivo ser processado
                    if (receiptFile) {
                        setTimeout(() => {
                            ExpenseUI.renderExpensesByAccount(accountId);
                            showToast('Despesa adicionada com sucesso!');
                        }, 500);
                    } else {
                        ExpenseUI.renderExpensesByAccount(accountId);
                        showToast('Despesa adicionada com sucesso!');
                    }
                } else {
                    showToast('Erro ao adicionar despesa. Tente novamente.');
                }
            });
        }
        
        // Formulário de editar despesa
        const editExpenseForm = document.getElementById('editExpenseForm');
        if (editExpenseForm) {
            editExpenseForm.addEventListener('submit', (event) => {
                event.preventDefault();
                
                const expenseId = editExpenseForm.getAttribute('data-expense-id');
                const accountId = editExpenseForm.getAttribute('data-account-id');
                const category = document.getElementById('editExpenseCategory').value;
                const description = document.getElementById('editExpenseDescription').value;
                const amount = parseFloat(document.getElementById('editExpenseAmount').value);
                const date = document.getElementById('editExpenseDate').value;
                const receiptFile = document.getElementById('editExpenseReceipt').files[0] || null;
                
                // Verifica se deve remover o comprovante
                const removeReceiptBtn = document.getElementById('removeReceiptBtn');
                const removeReceipt = removeReceiptBtn && removeReceiptBtn.hasAttribute('data-remove-receipt');
                
                // Validações básicas
                if (!category || !description || isNaN(amount) || amount <= 0 || !date) {
                    showToast('Por favor, preencha todos os campos corretamente.');
                    return;
                }
                
                // Cria objeto com os dados atualizados
                const updatedExpense = {
                    category,
                    description,
                    amount,
                    date
                };
                
                // Atualiza a despesa
                const result = ExpenseManager.update(expenseId, updatedExpense, receiptFile, removeReceipt);
                
                const handleSuccess = () => {
                    editExpenseForm.reset();
                    ModalUI.close('editExpenseModal');
                    
                    // Atualiza a interface em tempo real
                    AccountUI.updateAccountDetails(accountId);
                    AccountUI.updateAccountBalance(accountId);
                    ExpenseUI.renderExpensesByAccount(accountId);
                    
                    showToast('Despesa atualizada com sucesso!');
                };
                
                // Verifica se o resultado é uma Promise (caso de upload de arquivo)
                if (result instanceof Promise) {
                    result.then(success => {
                        if (success) {
                            handleSuccess();
                        } else {
                            showToast('Erro ao atualizar despesa. Tente novamente.');
                        }
                    });
                } else if (result) {
                    handleSuccess();
                } else {
                    showToast('Erro ao atualizar despesa. Tente novamente.');
                }
            });
        }
        
        // Botão de confirmar exclusão de despesa
        const confirmDeleteExpenseBtn = document.getElementById('btnConfirmDeleteExpense');
        if (confirmDeleteExpenseBtn) {
            confirmDeleteExpenseBtn.addEventListener('click', () => {
                const expenseId = confirmDeleteExpenseBtn.getAttribute('data-expense-id');
                const accountId = confirmDeleteExpenseBtn.getAttribute('data-account-id');
                
                // Remove a despesa
                const success = ExpenseManager.remove(expenseId);
                
                if (success) {
                    ModalUI.close('confirmDeleteExpenseModal');
                    
                    // Atualiza a interface em tempo real
                    AccountUI.updateAccountDetails(accountId);
                    AccountUI.updateAccountBalance(accountId);
                    ExpenseUI.renderExpensesByAccount(accountId);
                    
                    showToast('Despesa excluída com sucesso!');
                } else {
                    showToast('Erro ao excluir despesa. Tente novamente.');
                }
            });
        }
        
        // Botão para remover comprovante
        const removeReceiptBtn = document.getElementById('removeReceiptBtn');
        if (removeReceiptBtn) {
            removeReceiptBtn.addEventListener('click', () => {
                // Marca o botão para remover o comprovante
                removeReceiptBtn.setAttribute('data-remove-receipt', 'true');
                
                // Esconde o container de comprovante atual
                document.getElementById('currentReceiptContainer').style.display = 'none';
                
                // Mostra mensagem de confirmação
                showToast('O comprovante será removido ao salvar as alterações.');
            });
        }
        
        // Eventos para os campos de upload de arquivo
        this.initFileInputEvents();
    },
    
    /**
     * Inicializa eventos para os campos de upload de arquivo
     */
    initFileInputEvents: function() {
        // Campo de arquivo para adicionar despesa
        const expenseReceipt = document.getElementById('expenseReceipt');
        const expenseReceiptName = document.getElementById('expenseReceiptName');
        
        if (expenseReceipt && expenseReceiptName) {
            expenseReceipt.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    expenseReceiptName.textContent = file.name;
                } else {
                    expenseReceiptName.textContent = 'Nenhum arquivo selecionado';
                }
            });
        }
        
        // Campo de arquivo para editar despesa
        const editExpenseReceipt = document.getElementById('editExpenseReceipt');
        const editExpenseReceiptName = document.getElementById('editExpenseReceiptName');
        
        if (editExpenseReceipt && editExpenseReceiptName) {
            editExpenseReceipt.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    editExpenseReceiptName.textContent = file.name;
                    
                    // Esconde o container de comprovante atual
                    document.getElementById('currentReceiptContainer').style.display = 'none';
                    
                    // Remove o atributo de remoção, se existir
                    const removeReceiptBtn = document.getElementById('removeReceiptBtn');
                    if (removeReceiptBtn) {
                        removeReceiptBtn.removeAttribute('data-remove-receipt');
                    }
                } else {
                    editExpenseReceiptName.textContent = 'Nenhum arquivo selecionado';
                }
            });
        }
    }
};

/**
 * Gerencia a interface para depósitos
 */
const DepositUI = {
    /**
     * Renderiza os depósitos de uma conta específica
     * @param {string} accountId - ID da conta
     */
    renderDepositsByAccount: function(accountId) {
        const depositsList = document.getElementById('depositsList');
        const emptyDepositsState = document.getElementById('emptyDepositsState');
        const deposits = DepositManager.getByAccountId(accountId);
        
        // Ordena os depósitos por data (mais recentes primeiro)
        deposits.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Se não houver depósitos, mostra o estado vazio
        if (deposits.length === 0) {
            depositsList.innerHTML = '';
            emptyDepositsState.style.display = 'block';
            return;
        }
        
        // Esconde o estado vazio e mostra os depósitos
        emptyDepositsState.style.display = 'none';
        
        // Renderiza cada depósito
        depositsList.innerHTML = deposits.map(deposit => {
            const formattedAmount = formatCurrency(deposit.amount);
            const formattedDate = formatDate(deposit.date);
            
            return `
                <div class="deposit-item" data-deposit-id="${deposit.id}">
                    <div class="deposit-info">
                        <div class="deposit-category">${deposit.category}</div>
                        <div class="deposit-description">${deposit.description}</div>
                        <div class="deposit-date">${formattedDate}</div>
                    </div>
                    <div class="deposit-amount positive">${formattedAmount}</div>
                    <div class="deposit-actions">
                        <button class="btn-icon btn-edit-deposit" data-deposit-id="${deposit.id}" aria-label="Editar depósito">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete-deposit" data-deposit-id="${deposit.id}" aria-label="Excluir depósito">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Adiciona eventos aos botões de edição e exclusão
        this.addDepositActionEvents(accountId);
    },

    /**
     * Adiciona eventos aos botões de ação dos depósitos
     * @param {string} accountId - ID da conta
     */
    addDepositActionEvents: function(accountId) {
        // Adiciona eventos aos botões de edição
        const editButtons = document.querySelectorAll('.btn-edit-deposit');
        editButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation(); // Evita propagação do evento
                const depositId = button.getAttribute('data-deposit-id');
                this.showEditDepositModal(depositId, accountId);
            });
        });
        
        // Adiciona eventos aos botões de exclusão
        const deleteButtons = document.querySelectorAll('.btn-delete-deposit');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation(); // Evita propagação do evento
                const depositId = button.getAttribute('data-deposit-id');
                this.showDeleteDepositConfirmation(depositId, accountId);
            });
        });
    },

    /**
     * Mostra o modal de edição de depósito
     * @param {string} depositId - ID do depósito
     * @param {string} accountId - ID da conta
     */
    showEditDepositModal: function(depositId, accountId) {
        const deposit = DepositManager.getById(depositId);
        if (!deposit) return;
        
        // Preenche o formulário com os dados do depósito
        document.getElementById('editDepositCategory').value = deposit.category;
        document.getElementById('editDepositDescription').value = deposit.description;
        document.getElementById('editDepositAmount').value = deposit.amount;
        document.getElementById('editDepositDate').value = deposit.date;
        
        // Armazena os IDs no formulário
        const editForm = document.getElementById('editDepositForm');
        editForm.setAttribute('data-deposit-id', depositId);
        editForm.setAttribute('data-account-id', accountId);
        
        // Abre o modal
        ModalUI.open('editDepositModal');
    },

    /**
     * Mostra a confirmação de exclusão de depósito
     * @param {string} depositId - ID do depósito
     * @param {string} accountId - ID da conta
     */
    showDeleteDepositConfirmation: function(depositId, accountId) {
        const deposit = DepositManager.getById(depositId);
        if (!deposit) return;
        
        // Configura o modal de confirmação
        const confirmDeleteBtn = document.getElementById('btnConfirmDeleteDeposit');
        confirmDeleteBtn.setAttribute('data-deposit-id', depositId);
        confirmDeleteBtn.setAttribute('data-account-id', accountId);
        
        // Atualiza o texto de confirmação
        const confirmText = document.getElementById('confirmDeleteDepositText');
        confirmText.textContent = `Tem certeza que deseja excluir o depósito "${deposit.description}" de ${formatCurrency(deposit.amount)}?`;
        
        // Abre o modal
        ModalUI.open('confirmDeleteDepositModal');
    },

    /**
     * Inicializa os eventos relacionados aos depósitos
     */
    init: function() {
        // Botão para adicionar depósito
        const addDepositButton = document.getElementById('btnAddDeposit');
        if (addDepositButton) {
            addDepositButton.addEventListener('click', () => {
                // Define a data atual no campo de data
                const dateInput = document.getElementById('depositDate');
                if (dateInput) {
                    dateInput.value = getCurrentDateForInput();
                }
                
                // Armazena o ID da conta no formulário
                const accountId = addDepositButton.getAttribute('data-account-id');
                document.getElementById('addDepositForm').setAttribute('data-account-id', accountId);
                
                ModalUI.open('addDepositModal');
            });
        }

        // Formulário de adicionar depósito
        const addDepositForm = document.getElementById('addDepositForm');
        if (addDepositForm) {
            addDepositForm.addEventListener('submit', (event) => {
                event.preventDefault();
                
                const accountId = addDepositForm.getAttribute('data-account-id');
                const category = document.getElementById('depositCategory').value;
                const description = document.getElementById('depositDescription').value;
                const amount = parseFloat(document.getElementById('depositAmount').value);
                const date = document.getElementById('depositDate').value;
                
                // Validações básicas
                if (!category || !description || isNaN(amount) || amount <= 0 || !date) {
                    showToast('Por favor, preencha todos os campos corretamente.');
                    return;
                }
                
                // Cria objeto do depósito
                const newDeposit = {
                    accountId,
                    category,
                    description,
                    amount,
                    date
                };
                
                // Salva o depósito
                const success = DepositManager.add(newDeposit);
                
                if (success) {
                    addDepositForm.reset();
                    ModalUI.close('addDepositModal');
                    
                    // Atualiza a interface em tempo real
                    AccountUI.updateAccountDetails(accountId);
                    AccountUI.updateAccountBalance(accountId);
                    DepositUI.renderDepositsByAccount(accountId);
                    
                    showToast('Depósito adicionado com sucesso!');
                } else {
                    showToast('Erro ao adicionar depósito. Tente novamente.');
                }
            });
        }
        
        // Formulário de editar depósito
        const editDepositForm = document.getElementById('editDepositForm');
        if (editDepositForm) {
            editDepositForm.addEventListener('submit', (event) => {
                event.preventDefault();
                
                const depositId = editDepositForm.getAttribute('data-deposit-id');
                const accountId = editDepositForm.getAttribute('data-account-id');
                const category = document.getElementById('editDepositCategory').value;
                const description = document.getElementById('editDepositDescription').value;
                const amount = parseFloat(document.getElementById('editDepositAmount').value);
                const date = document.getElementById('editDepositDate').value;
                
                // Validações básicas
                if (!category || !description || isNaN(amount) || amount <= 0 || !date) {
                    showToast('Por favor, preencha todos os campos corretamente.');
                    return;
                }
                
                // Cria objeto com os dados atualizados
                const updatedDeposit = {
                    category,
                    description,
                    amount,
                    date
                };
                
                // Atualiza o depósito
                const success = DepositManager.update(depositId, updatedDeposit);
                
                if (success) {
                    editDepositForm.reset();
                    ModalUI.close('editDepositModal');
                    
                    // Atualiza a interface em tempo real
                    AccountUI.updateAccountDetails(accountId);
                    AccountUI.updateAccountBalance(accountId);
                    DepositUI.renderDepositsByAccount(accountId);
                    
                    showToast('Depósito atualizado com sucesso!');
                } else {
                    showToast('Erro ao atualizar depósito. Tente novamente.');
                }
            });
        }
        
        // Botão de confirmar exclusão de depósito
        const confirmDeleteDepositBtn = document.getElementById('btnConfirmDeleteDeposit');
        if (confirmDeleteDepositBtn) {
            confirmDeleteDepositBtn.addEventListener('click', () => {
                const depositId = confirmDeleteDepositBtn.getAttribute('data-deposit-id');
                const accountId = confirmDeleteDepositBtn.getAttribute('data-account-id');
                
                // Remove o depósito
                const success = DepositManager.remove(depositId);
                
                if (success) {
                    ModalUI.close('confirmDeleteDepositModal');
                    
                    // Atualiza a interface em tempo real
                    AccountUI.updateAccountDetails(accountId);
                    AccountUI.updateAccountBalance(accountId);
                    DepositUI.renderDepositsByAccount(accountId);
                    
                    showToast('Depósito excluído com sucesso!');
                } else {
                    showToast('Erro ao excluir depósito. Tente novamente.');
                }
            });
        }
    }
};

/**
 * Gerencia a interface para configurações
 */
const SettingsUI = {
    /**
     * Aplica o tema escuro ou claro conforme configuração
     */
    applyTheme: function() {
        const isDarkMode = SettingsManager.isDarkModeEnabled();
        
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        // Atualiza o toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = isDarkMode;
        }
    },
    
    /**
     * Inicializa os eventos relacionados às configurações
     */
    init: function() {
        // Aplica o tema na inicialização
        this.applyTheme();
        
        // Botão para abrir configurações
        const settingsButton = document.getElementById('btnSettings');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                ModalUI.open('settingsModal');
            });
        }
        
        // Toggle de modo escuro
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', () => {
                SettingsManager.update('darkMode', darkModeToggle.checked);
                this.applyTheme();
            });
        }
        
        // Botão para limpar dados
        const clearDataButton = document.getElementById('btnClearData');
        if (clearDataButton) {
            clearDataButton.addEventListener('click', () => {
                ModalUI.open('confirmClearDataModal');
            });
        }
        
        // Botão para confirmar limpeza de dados
        const confirmClearDataButton = document.getElementById('btnConfirmClearData');
        if (confirmClearDataButton) {
            confirmClearDataButton.addEventListener('click', () => {
                const success = Storage.clearAll();
                
                if (success) {
                    ModalUI.close('confirmClearDataModal');
                    ModalUI.close('settingsModal');
                    AccountUI.renderAccounts();
                    showToast('Todos os dados foram apagados.');
                } else {
                    showToast('Erro ao limpar os dados. Tente novamente.');
                }
            });
        }
    }
};

/**
 * Gerencia a interface para ajustes de saldo
 */
const AdjustmentUI = {
    /**
     * Renderiza os ajustes de saldo de uma conta específica
     * @param {string} accountId - ID da conta
     */
    renderAdjustmentsByAccount: function(accountId) {
        const adjustmentsList = document.getElementById('adjustmentsList');
        const emptyAdjustmentsState = document.getElementById('emptyAdjustmentsState');
        const adjustments = AdjustmentManager.getByAccountId(accountId);
        
        // Ordena os ajustes por data (mais recentes primeiro)
        adjustments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Se não houver ajustes, mostra o estado vazio
        if (adjustments.length === 0) {
            adjustmentsList.innerHTML = '';
            emptyAdjustmentsState.style.display = 'block';
            return;
        }
        
        // Esconde o estado vazio e mostra os ajustes
        emptyAdjustmentsState.style.display = 'none';
        
        // Renderiza cada ajuste
        adjustmentsList.innerHTML = adjustments.map(adjustment => {
            const formattedAmount = formatCurrency(adjustment.adjustmentAmount);
            const formattedDate = formatDate(adjustment.date);
            const amountClass = adjustment.adjustmentAmount > 0 ? 'positive' : 
                               adjustment.adjustmentAmount < 0 ? 'negative' : 'zero';
            const noteDisplay = adjustment.note ? `<div class="adjustment-note">${adjustment.note}</div>` : '';
            
            return `
                <div class="adjustment-item" data-adjustment-id="${adjustment.id}">
                    <div class="adjustment-info">
                        <div class="adjustment-reason">${adjustment.reason}</div>
                        ${noteDisplay}
                        <div class="adjustment-date">${formattedDate}</div>
                    </div>
                    <div class="adjustment-amount ${amountClass}">${formattedAmount}</div>
                </div>
            `;
        }).join('');
    }
};

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