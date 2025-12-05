# Sistema de Reservas - Restaurante Fatec

Este projeto é um sistema completo de gerenciamento de reservas de mesas
para restaurantes, desenvolvido como parte da avaliação de
**Desenvolvimento Web III** na FATEC.

O sistema permite o gerenciamento visual de mesas (Planta Baixa),
criação e edição de reservas, e controle de status em tempo real.

------------------------------------------------------------------------

## 👥 Autores

Desenvolvido por: \* **Igor Lima** \* **Gustavo Hammes**

------------------------------------------------------------------------

## 🚀 Funcionalidades

-   **Mapa Visual (Planta Baixa):** Visualização gráfica das zonas do
    restaurante (Varanda, Salão, Centro, VIP).
-   **Status em Tempo Real:** As mesas mudam de cor automaticamente
    conforme o horário:
    -   🟢 **Disponível** (Livre)
    -   🟡 **Ocupado** (Cliente na mesa agora)
    -   🔴 **Reservado** (Reserva futura)
-   **CRUD Completo:** Criar, Listar, Editar e Cancelar reservas.
-   **Regras de Negócio:**
    -   Validação de conflito de horários.
    -   Validação de capacidade da mesa.
    -   Antecedência mínima de 1 hora para reservas.
    -   **Easter Egg:** Experimente clicar 6 vezes no rodapé da página
        😉.

------------------------------------------------------------------------

## 🛠️ Tecnologias Utilizadas

-   **Backend:** Node.js, TypeScript, Express.
-   **Banco de Dados:** MongoDB (via Mongoose).
-   **Frontend:** HTML5, CSS3 (Design Responsivo Moderno), JavaScript
    Vanilla.

------------------------------------------------------------------------

## ⚙️ Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente:

### 1. Pré-requisitos

Certifique-se de ter instalado: \* Node.js \* MongoDB

### 2. Clonar o repositório

``` bash
git clone https://github.com/SEU_USUARIO/Prova3.git
cd Prova3
```

### 3. Instalar dependências

``` bash
npm install
```

### 4. Configurar Variáveis de Ambiente

Crie o arquivo `.env`:

``` env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/reserva
```

### 5. Popular o Banco de Dados (Seed)

``` bash
POST http://localhost:3000/api/mesas/setup
```

------------------------------------------------------------------------

## ▶️ Como Rodar

``` bash
npm run dev
# ou
npx ts-node src/server.ts
```

------------------------------------------------------------------------

## 🧪 Testando o Sistema

1.  Acesse `http://localhost:3000`
2.  Veja o mapa de mesas.
3.  Clique em uma mesa verde.
4.  Preencha os dados e salve.

------------------------------------------------------------------------

© 2025 Igor Lima e Gustavo Hammes - FATEC SP
