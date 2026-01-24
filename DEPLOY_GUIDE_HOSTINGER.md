# Guia Completo: Deploy na Hostinger com Domínio IONOS

Este guia considera que você tem o domínio na IONOS e uma conta de hospedagem na Hostinger, mas ainda não vinculou os dois.

## 1. Adicionar o Site na Hostinger

Antes de ver o Gerenciador de Arquivos, você precisa "criar" o espaço para o site na sua hospedagem.

1. Faça login no **hPanel** (Hostinger).
2. No menu superior ou na seção **Sites**, clique em **"+ Criar ou migrar um site"**.
3. Selecione o tipo de site: **Outro** (ou pule se possível, pois vamos subir arquivos manualmente).
4. Em "Criar novo site ou migrar?", selecione **Criar novo site**.
5. Quando perguntar sobre plataforma (WordPress, IA, etc), selecione **Pular, quero começar do zero** (ou "Esvaziar" / "Empty", a opção que diz que você vai subir seus arquivos).
6. Na etapa **Nomeie seu site**, escolha **Usar um domínio existente**.
7. **Digite o seu domínio** da IONOS (ex: `seusite.com`) e clique em Continuar.
8. A Hostinger vai mostrar os DNS (Nameservers) que você precisa usar. **Anote-os**.

## 2. Apontar o Domínio na IONOS

Agora precisamos dizer para a IONOS que quem manda no seu domínio é a Hostinger.

1. Acesse o painel da **IONOS**.
2. Vá em **Domínios & SSL**.
3. Clique na **engrenagem** ou no próprio domínio para ver as configurações.
4. Procure a aba/opção **Nameservers** (Servidores de Nome).
5. Escolha a opção **Usar nameservers personalizados**.
6. Apague os atuais da IONOS e cole os da Hostinger que você anotou.
   *   Nameserver 1: (Geralmente `ns1.dns-parking.com`)
   *   Nameserver 2: (Geralmente `ns2.dns-parking.com`)
7. Salve. A propagação pode levar algumas horas, mas a Hostinger geralmente libera o painel em poucos minutos.

## 3. Preparar e Enviar os Arquivos

Agora que o site está criado na Hostinger (mesmo que o DNS ainda esteja propagando), o Gerenciador de Arquivos vai aparecer.

1. No seu computador, entre na pasta do projeto Educai-GYN.
2. Entre na pasta **`dist`** (que foi gerada pelo comando `npm run build` que executamos).
3. Selecione **todos** os arquivos dentro dela e compacte-os em um arquivo **`site.zip`**.
   *(Certifique-se de zipar o CONTEÚDO da pasta dist, e não a pasta dist em si. Ao abrir o zip, deve-se ver logo o index.html)*.
4. Volte para o **hPanel** (Hostinger).
5. Vá em **Sites** -> Clique no **Gerenciar** (Manage) do site que você acabou de adicionar.
6. No menu lateral ou Dashboard, procure por **Gerenciador de Arquivos** (File Manager).
7. Entre na pasta **`public_html`**.
8. Apague o arquivo `default.php` se houver.
9. Clique no ícone de **Upload** (seta para cima) e envie seu arquivo `site.zip`.
10. Clique com o botão direito no `site.zip` (ou use o menu) e escolha **Extrair** (Extract).
    *   Extraia para `.` (ponto) ou deixe em branco para extrair na raiz da `public_html`.
11. Se tudo deu certo, você verá o arquivo `index.html` e a pasta `assets` soltos dentro da `public_html`.

## 4. Configurar Rotas (.htaccess)

Se por algum motivo o arquivo `.htaccess` não foi no zip (alguns sistemas ocultam arquivos com ponto), crie-o manualmente no Gerenciador de Arquivos da Hostinger:

1. Na `public_html`, clique em **Novo Arquivo**.
2. Nome: `.htaccess`
3. Cole o seguinte código:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```
4. Salve.

Pronto! Assim que os DNS da IONOS propagarem (pode levar 1h a 24h, mas geralmente é rápido), seu site estará no ar rodando com Supabase.
