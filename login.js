document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('themeToggleButton');
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // --- Lógica do Tema (Modo Escuro/Claro) ---
    const applyTheme = (isDarkMode) => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            themeToggleButton.textContent = 'Modo Claro';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleButton.textContent = 'Modo Escuro';
        }
    };

    // Carregar preferência de tema do localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        applyTheme(true);
    } else {
        applyTheme(false); // Padrão para modo claro se não houver preferência
    }

    // Alternar tema ao clicar no botão
    themeToggleButton.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        applyTheme(!isDarkMode);
        localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
    });

    // --- Lógica de Login ---
    // Usuários de demonstração (substitua por autenticação real em um ambiente de produção)
    const users = [
        { username: 'funcionario', password: '123', role: 'piscicultor' },
        { username: 'admin', password: 'admin', role: 'administrador' }
    ];

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;

        const user = users.find(u => u.username === usernameInput && u.password === passwordInput);

        if (user) {
            errorMessage.textContent = ''; // Limpa qualquer mensagem de erro anterior
            // Armazena o papel do usuário no localStorage para uso futuro (ex: redirecionamento)
            localStorage.setItem('userRole', user.role);

            // Redireciona com base no papel do usuário
            if (user.role === 'administrador') {
                window.location.href = 'admin_dashboard.html'; // Página para administradores
            } else {
                window.location.href = 'painel_controle.html'; // Página para funcionários/piscicultores (dashboard principal)
            }
        } else {
            errorMessage.textContent = 'Usuário ou senha inválidos.';
        }
    });
});
