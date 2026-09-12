# Expo и EAS: конфигурация проекта

## Что настроено

- Проект Expo привязан к владельцу `dculava-team` и EAS project ID в `app.json`.
- Для Android задан application ID: `com.anonymous.MyFirstMobileApp`.
- В корне находится `eas.json` с профилями `development`, `preview` и `production`.

## Профили EAS Build

| Профиль | Назначение |
| --- | --- |
| `development` | Внутренняя development-сборка с development client. |
| `preview` | Android APK для установки и проверки вне Expo Go. |
| `production` | Production-сборка с автоматическим увеличением номера сборки. |

Запустить облачную Android-сборку можно командой:

```powershell
npx eas build --platform android --profile preview
```

Для development-профиля нужен пакет `expo-dev-client`; это требование профиля `developmentClient: true`.

## Локальная разработка

```powershell
npm start
```

Команда запускает Metro — локальный сервер, с которого Expo Go загружает JavaScript bundle. Терминал с Metro нужно оставлять открытым на время работы приложения.

Скрипты `npm run android` и `npm run ios` используют `expo run:android` и `expo run:ios`; они запускают нативную сборку проекта, а не только открывают Expo Go.

## Проверка совместимости пакетов

Перед обновлением зависимостей сначала выполните:

```powershell
npx expo install --check
```

Чтобы применить рекомендованные Expo совместимые версии, используйте:

```powershell
npx expo install --fix
```

Эта команда изменяет `package.json` и `package-lock.json`, поэтому изменения следует отдельно проверить и закоммитить.

## Если Android показывает `Unable to load script`

1. Убедитесь, что `npm start` всё ещё работает.
2. Откройте проект через Expo Go.
3. На эмуляторе Metro должен быть доступен по адресу, указанному командой `npm start` (обычно `exp://<IP>:8081`).
4. Если bundle загрузился, но Expo Go закрывается, проверьте совместимость зависимостей через `npx expo install --check`.

## Источники

- [Expo CLI: проверка и исправление версий зависимостей](https://docs.expo.dev/versions/v57.0.0/more/expo-cli/)
- [EAS Build: процесс конфигурации](https://docs.expo.dev/versions/v57.0.0/build-reference/build-configuration/)
- [EAS Build: профили в eas.json](https://docs.expo.dev/versions/v57.0.0/build/eas-json/)
