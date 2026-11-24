# 🌡️ Monitoramento de Temperatura IoT

## 📌 Sobre o projeto

Sistema de monitoramento de temperatura e umidade desenvolvido como atividade acadêmica, utilizando um ESP32 simulado no Wokwi, sensor DHT22, comunicação MQTT, API REST e um painel web.

O sistema permite acompanhar as leituras em tempo real, visualizar o histórico de temperaturas e identificar situações de alerta.

## 🛠️ Tecnologias utilizadas

- **Wokwi:** simulação do ESP32 e sensor DHT22.
- **MicroPython:** programação do ESP32.
- **EMQX Serverless:** comunicação MQTT.
- **Supabase:** API REST e banco de dados PostgreSQL.
- **Cloudflare Pages:** hospedagem do painel web.
- **HTML, CSS e JavaScript:** desenvolvimento do frontend.

## 🏗️ Arquitetura

ESP32 + DHT22 (Wokwi) → MQTT/TLS → EMQX → HTTPS → Supabase → Cloudflare Pages

O ESP32 realiza leituras periódicas e publica os dados via MQTT. O EMQX encaminha as informações para uma função de API no Supabase, que armazena os registros no banco de dados. O painel web consulta esses dados e apresenta os resultados.

## ⚙️ Funcionalidades

- Monitoramento de temperatura e umidade.
- Envio automático de leituras a cada 10 segundos.
- Armazenamento do histórico no Supabase.
- Gráfico das últimas 30 leituras.
- Alerta para temperaturas a partir de 30 °C.
- Identificação de dados desatualizados após 30 segundos sem novas leituras.
- Atualização automática quando a transmissão é retomada.

## 🧪 Testes realizados

- Envio de dados do Wokwi ao Supabase.
- Exibição das leituras no painel web.
- Alteração da temperatura simulada para 35 °C e ativação do alerta.
- Interrupção da simulação e identificação de dados desatualizados.
- Retomada da simulação e atualização automática do painel.

## 🌐 Painel web

https://monitoramento-temperatura-iot.pages.dev

## 🔐 Segurança

O projeto utiliza comunicação MQTT com TLS e autenticação para envio de dados. Senhas e chaves privadas não devem ser publicadas no repositório.

## 📚 Contexto acadêmico

Projeto desenvolvido para demonstrar a integração entre sensores simulados, comunicação em rede, API REST, armazenamento de dados e interface web.
