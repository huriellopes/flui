# 💧 Notify Water Health

Aplicativo mobile para lembrar de beber água ao longo do dia. Feito com **React Native + Expo** (TypeScript). Foco inicial em **Android**, com base pronta para iOS no futuro.

## Status

🚧 Esqueleto inicial — os requisitos estão sendo definidos aos poucos.

O que já existe:
- Estrutura do projeto Expo + TypeScript
- Tela inicial (`HomeScreen`) exibindo meta diária, intervalo e o toggle de lembretes
- Serviço de notificações locais (`expo-notifications`) com canal Android e agendamento recorrente
- Persistência das configurações via `AsyncStorage`

Próximos passos previstos:
- Tela de configurações (editar meta, intervalo e janela de horário)
- Registro do consumo diário e barra de progresso
- Aplicar a janela `startHour`/`endHour` no agendamento

## Stack

- [Expo](https://expo.dev) SDK 52
- React Native 0.76 (New Architecture)
- `expo-notifications` para notificações locais
- `@react-native-async-storage/async-storage` para persistência

## Como rodar

```bash
npm install
npm start          # abre o Expo Dev Tools
npm run android    # abre no emulador/dispositivo Android
```

> É necessário o app **Expo Go** no dispositivo ou um emulador Android configurado.

## Estrutura

```
app-notify-water-health/
├─ App.tsx                     # componente raiz
├─ index.ts                    # entry point (registerRootComponent)
├─ app.json                    # config do Expo (permissões Android, plugin de notificações)
└─ src/
   ├─ screens/HomeScreen.tsx   # tela principal
   ├─ services/notifications.ts# permissões + agendamento de lembretes
   ├─ hooks/useWaterReminders.ts# estado dos lembretes + sincronização
   ├─ storage/settings.ts      # tipos e persistência das configurações
   └─ theme/colors.ts          # paleta de cores
```

## Verificação

```bash
npm run typecheck  # checagem de tipos TypeScript
```
