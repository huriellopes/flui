# 💧 Flui

> **flua. hidrate-se.**

App mobile de saúde que transforma **hidratação, nutrição e treino** em progresso diário — com metas, grupos e ranking entre amigos. Feito com **React Native + Expo** (TypeScript). Foco inicial em **Android**, com base pronta para iOS.

## O que já existe

- **Lembretes de hidratação** — notificações locais (`expo-notifications`) respeitando a **janela de horário** (`startHour`/`endHour`) e o intervalo configurado; toggle reverte sozinho se a permissão for negada
- **Perfil** com foto (avatar) e metas diárias (calorias, macros, água) calculadas a partir dos dados corporais
- **Registros** de água, refeições e treinos com ganho de XP
- **Gamificação social** — grupos com código de convite, ranking por XP, e **feed** com posts (foto + legenda), **curtidas** e **comentários**
- Persistência local via `AsyncStorage` e identidade visual própria (ícone/splash Flui)

## Backend

A API fica em repositório separado, interligada aqui como submódulo em [`backend/`](./backend):
**[flui-api](https://github.com/huriellopes/flui-api)** (NestJS + Prisma + PostgreSQL, deploy em Docker no Contabo com monitoramento via Telegram).

Para clonar já com o backend:

```bash
git clone --recurse-submodules https://github.com/huriellopes/flui.git
# ou, se já clonou sem o submódulo:
git submodule update --init --recursive
```

## Stack

- [Expo](https://expo.dev) SDK 54 · React Native 0.81 (New Architecture)
- `expo-notifications` (lembretes locais) · `expo-image-picker` (fotos)
- `@react-native-async-storage/async-storage` (persistência)

## Como rodar

```bash
npm install
npm start          # abre o Expo Dev Tools
npm run android    # abre no emulador/dispositivo Android
```

> É necessário o app **Expo Go** no dispositivo ou um emulador Android configurado. A URL da API fica em `src/config.ts` (produção: `https://flui-api.cantinbr.com.br/api`).

## Estrutura

```
flui/
├─ App.tsx                       # componente raiz + navegação
├─ app.json                      # config do Expo (ícones Flui, permissões, plugins)
├─ assets/                       # ícone, adaptive icon, splash, favicon (Flui)
└─ src/
   ├─ screens/                   # Home, Auth, Perfil, Grupos, Feed, Conta
   ├─ api/                       # cliente HTTP + módulos (auth, logs, groups, posts…)
   ├─ services/notifications.ts  # permissões + agendamento dos lembretes
   ├─ hooks/useWaterReminders.ts # estado dos lembretes + sincronização
   ├─ state/                     # providers (auth, dados do app)
   ├─ storage/                   # tipos e persistência das configurações
   └─ config.ts                  # URL base da API
```

## Fluxo de contribuição

O trabalho é feito na branch **`dev`** e vai para **`main`** via Pull Request (a `main` é protegida e exige PR). Não usar *squash merge*.

## Verificação

```bash
npm run typecheck  # checagem de tipos TypeScript
```
