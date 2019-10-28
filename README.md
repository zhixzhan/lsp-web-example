# Monaco LSP Web Example

non-server, non-prebuit-plugin, pure-client lsp example

## Install
```
npm install
```

## Run
```
npm run start
```
go to [http://localhost:8080/]()


# Implementations of Monaco language extension

## 1. LSP-Web
Most light way, all in one repo, do not need build monaco-editor or start language server.  
example: [https://github.com/zhixzhan/lsp-web-example/]()

| Client                 | Languageservice |
| -----------            | -----------     |
| createEditor           |                 |
| registerLanguage       |                 |
| setTokenizer           |                 |
| createModel            |                 |
| setEditorLanguage      |                 |
| call Languageservice   |                 |
|                        | Do languageFeatures|


## 2. LSP-Web-Plugin
Pack static language setting to monaco-editor, do not need start language server.
(current composer use this way) 

example: 
[https://github.com/cosmicshuai/monaco-botbuilder-lg]()  
[https://github.com/zhixzhan/monaco-editor]()  
[https://github.com/zhixzhan/monaco-editor-webpack-plugin]()  


| Client                 | Plugin              | Languageservice |
| -----------            | -----------         | -----------     |
| createEditor           |                     |
|                        | registerLanguage    |                 |
|                        | setTokenizer        |                 |
| createModel            |                     |
| setEditorLanguage      |                     |                 |
|                        |call Languageservice |                 |
|                        |                     | Do languageFeatures|

## 3. LSP-Client-Server
Start a standalone language server on remote as service, better perfermance and controllable. Benifit from server environment, it can be writed on any language.  
example: [https://github.com/zhixzhan/lsp-cs-example/]()

| Client                 | Server              | Languageservice |
| -----------            | -----------         | -----------     |
| createEditor           |                     |                 |
| registerLanguage       |                     |                 |
| setTokenizer           |                     |                 |
| createModel            |                     |                 |
| setEditorLanguage      |                     |                 |
| createLanguageClient   |                     |                 |
| createWebSocket        | create Server       |                 |
| connect Server         | listen LSP Request  |                 |
|                        | process Request     |                 |
|                        | ...                 |
|                        | compose document    |                 |
|                        | call Languageservice |                 |
|                        |                     | Do languageFeatures|


# MiddleWare Requirements
For inline LG editing, we do not want pass current editor content directly to languageService.
we need a middleware re-compose document.  
For LU editing, we want call LUIS, before call languageService, or after that before send diagnostics to client.
