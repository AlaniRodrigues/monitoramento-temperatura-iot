# 🧊 Smart Cooler IoT

## Monitoramento de Refrigeração de Bebidas em Supermercados

### 📌 Sobre o projeto

O Smart Cooler IoT é um sistema de monitoramento de temperatura de geladeiras de bebidas em supermercados, desenvolvido utilizando tecnologias de Internet das Coisas (IoT).

O objetivo é acompanhar as condições de refrigeração em tempo real, identificar temperaturas inadequadas e auxiliar na prevenção de desperdícios.

### 🎓 Informações acadêmicas

- **Instituição:** Universidade de Marília – UNIMAR
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Atividade:** Projeto Integrador de Monitoramento IoT – 2026/2
- **Grupo:** 06

### 👥 Integrantes

- Alani da Silva Rodrigues
- Giovanna Gonçalves Batista
- Marcelo Henrique de Amorim

### 🥤 Equipamentos monitorados

O sistema utiliza cinco sensores DHT22 conectados a um único ESP32.

| Geladeira | Identificação | GPIO |
|---|---|---|
| Cervejas | cerveja-01 | 4 |
| Guaranás | guarana-01 | 5 |
| Sucos | suco-01 | 18 |
| Energéticos | energetico-01 | 19 |
| Águas | agua-01 | 21 |

### 🛠️ Tecnologias utilizadas

- ESP32
- Sensores DHT22
- Wokwi
- MicroPython
- MQTT
- EMQX Serverless
- Supabase Edge Functions
- PostgreSQL
- API REST
- HTML
- CSS
- JavaScript
- Cloudflare Pages

### 🔄 Arquitetura do sistema

DHT22 → ESP32 → MQTT → EMQX → API REST → Supabase → Painel Web

1. Os cinco sensores coletam as temperaturas das geladeiras.
2. O ESP32 processa as leituras e envia mensagens JSON utilizando MQTT.
3. O broker EMQX recebe as mensagens e encaminha os dados via HTTPS.
4. A Edge Function ingest recebe, valida e armazena as informações no Supabase.
5. O painel hospedado no Cloudflare Pages consulta os registros e apresenta as informações individualmente.

### 📊 Funcionalidades

- Monitoramento de cinco geladeiras simultaneamente.
- Atualização automática das informações.
- Temperatura atual de cada equipamento.
- Alertas de temperatura inadequada.
- Identificação de temperaturas críticas.
- Gráficos individuais de temperatura.
- Histórico de leituras.
- Identificação de dados desatualizados.
- Retomada automática da visualização após o recebimento de novas leituras.
- Armazenamento independente do painel web.
- Interface interativa com seleção individual das geladeiras.

### ⏱️ Intervalo de coleta

As leituras são enviadas aproximadamente a cada 10 segundos, mesmo quando a temperatura permanece igual.

Um intervalo menor permite identificar alterações mais rapidamente, mas aumenta o tráfego de rede e o volume de registros armazenados.

### 🗄️ Banco de dados

As informações são armazenadas na tabela leituras do Supabase.

Cada registro possui um identificador, data e hora, temperatura e identificação da geladeira.

A coluna de umidade permanece na estrutura por compatibilidade técnica, mas não é utilizada como indicador no painel.

### 🧪 Testes funcionais

Os cenários de validação do projeto incluem:

- Fluxo completo dos sensores até o painel web.
- Monitoramento de temperaturas normais.
- Identificação de temperaturas inadequadas.
- Inter
