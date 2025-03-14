# Controle Financeiro - Aplicação Web

Uma aplicação web de controle financeiro pessoal que permite gerenciar contas bancárias e despesas, desenvolvida com HTML, CSS e JavaScript puro.

## 📋 Funcionalidades

### Gerenciamento de Contas
- Adicionar contas bancárias com saldo inicial
- Visualizar saldo total de todas as contas
- Configurar limite de cheque especial
- Excluir contas existentes

### Gerenciamento de Despesas
- Registrar despesas por categoria
- Atualização automática de saldos
- Visualização de despesas por conta

### Configurações
- Modo escuro / claro
- Opção para limpar todos os dados

## 🚀 Como Usar

A aplicação é totalmente baseada em navegador e utiliza o armazenamento local para persistir os dados. Siga os passos abaixo para começar:

1. Abra o arquivo `index.html` em qualquer navegador moderno
2. Adicione suas contas bancárias clicando no botão "+" no canto inferior direito
3. Clique em uma conta para ver detalhes e adicionar despesas

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura da aplicação
- **CSS3**: Estilização e design responsivo
- **JavaScript**: Lógica da aplicação
- **LocalStorage**: Armazenamento dos dados no navegador
- **Web APIs**: Manipulação do DOM e eventos

## 📁 Estrutura do Projeto

```
web-app/
│
├── css/
│   └── style.css          # Estilos da aplicação
│
├── js/
│   ├── app.js             # Inicialização da aplicação
│   ├── storage.js         # Gerenciamento de dados
│   ├── ui.js              # Interface do usuário
│   └── utils.js           # Funções utilitárias
│
├── img/                   # Diretório para imagens (opcional)
│
└── index.html             # Página principal
```

## 🔒 Privacidade

Todos os dados são armazenados apenas localmente no seu navegador usando LocalStorage. Nenhuma informação é enviada para servidores externos. Seus dados financeiros permanecem exclusivamente no seu dispositivo.

## 💡 Funcionalidades Planejadas

- Exportação e importação de dados
- Gráficos para visualização de gastos
- Categorização avançada de despesas
- Gerenciamento de receitas
- Planejamento de orçamento

## 📱 Compatibilidade

A aplicação é compatível com os seguintes navegadores:
- Google Chrome (recomendado)
- Mozilla Firefox
- Microsoft Edge
- Safari
- Opera

## 🤝 Contribuindo

Contribuições são bem-vindas! Se você quiser melhorar esta aplicação, sinta-se à vontade para criar um fork do repositório e enviar um pull request.

## 📄 Licença

Este projeto está licenciado sob a licença MIT - consulte o arquivo LICENSE para obter detalhes. 