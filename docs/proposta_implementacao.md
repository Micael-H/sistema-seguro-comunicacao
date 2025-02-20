## Explicação de como cada tecnologia será usada no sistema.

### bcrypt

- O bcrypt é uma biblioteca usada para hashing seguro de senhas. Ele é especialmente projetado para proteger senhas contra ataques de força bruta e rainbow tables.

- Como usar:
  **Armazenamento seguro de senhas:** Quando um usuário cria ou atualiza uma senha, use o bcrypt para gerar um hash da senha antes de armazená-la no banco de dados.
  **Verificação de senhas:** Quando o usuário faz login, compare a senha fornecida com o hash armazenado usando a função de verificação do bcrypt.

### PyJWT

- O PyJWT é uma biblioteca para criação e verificação de JSON Web Tokens (JWT), que são usados para autenticação e troca segura de informações.

- Como usar:
  **Geração de tokens:** Após o login bem-sucedido, gere um JWT contendo informações do usuário (como ID ou permissões) e um tempo de expiração.

  **Verificação de tokens:** Em requisições subsequentes, verifique o token JWT para autenticar o usuário e garantir que ele tem permissão para acessar determinados recursos.

### cryptography

- Fornece ferramentas para criptografia simétrica (AES) e assimétrica (RSA), que podem ser usadas para proteger dados sensíveis.

- Como usar:
  **AES (Criptografia Simétrica):** Use para criptografar e descriptografar dados, como mensagens ou arquivos, com uma chave secreta compartilhada.

  **RSA (Criptografia Assimétrica):** Use para criptografar dados com uma chave pública e descriptografar com uma chave privada, ideal para troca segura de chaves ou assinaturas digitais.

## Principais etapas de implementação, incluindo:

- **Cadastro de usuário** → Hash de senha com bcrypt.
- **Login** → Geração e verificação de Token JWT.
- **Criptografia de mensagens** → Uso de AES (CBC).
- **Proteção da chave AES** → Uso de RSA para criptografar a chave antes de armazená-la.

# Armazenamento Seguro de Dados

O armazenamento seguro de dados envolve a proteção de informações contra acessos não autorizados, perdas ou vazamentos. Para garantir essa segurança, algumas práticas essenciais incluem:

## 1. Criptografia

Utilizar criptografia para armazenar dados sensíveis, tornando-os ilegíveis sem a chave correta.

## 2. Controle de Acesso

Restringir quem pode acessar os dados por meio de autenticação forte (MFA, senhas seguras, etc.).

## 3. Backup Regular

Fazer cópias periódicas dos dados e armazená-las em locais seguros.
