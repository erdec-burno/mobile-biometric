# Биометрический вход и подтверждение операций

Эта инструкция добавляет в демо-приложение локальное подтверждение через
отпечаток пальца, Touch ID или Face ID. Сервер для этого варианта не нужен.

> Биометрические данные не выдаются приложению: их проверяет операционная
> система. Без backend это является защитой интерфейса приложения, но не
> защитой реальных платежей или удалённых API-операций.

## 1. Установить библиотеку

В корне проекта выполните:

```powershell
npx expo install expo-local-authentication
```

Команда подберёт версию, совместимую с Expo SDK 57. На момент подготовки этой
инструкции документация SDK 57 рекомендует `~57.0.2`.

## 2. Настроить Face ID для iOS

В массив `expo.plugins` файла `app.json` добавьте плагин. Существующие плагины
`expo-router` и `expo-splash-screen` оставьте без изменений:

```json
[
  "expo-local-authentication",
  {
    "faceIDPermission": "Разрешите Face ID для безопасного входа и подтверждения операций."
  }
]
```

В результате часть `plugins` будет содержать, в частности:

```json
"plugins": [
  "expo-router",
  [
    "expo-splash-screen",
    {
      "backgroundColor": "#208AEF",
      "image": "./assets/images/splash-icon.png",
      "imageWidth": 76
    }
  ],
  [
    "expo-local-authentication",
    {
      "faceIDPermission": "Разрешите Face ID для безопасного входа и подтверждения операций."
    }
  ]
]
```

На Android необходимые разрешения биометрии добавляются библиотекой
автоматически.

## 3. Создать функцию подтверждения

Создайте, например, файл `lib/biometrics.ts`:

```ts
import * as LocalAuthentication from 'expo-local-authentication';

export async function confirmWithBiometrics(
  promptMessage: string,
): Promise<boolean> {
  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);

  if (!hasHardware || !isEnrolled) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    promptDescription: 'Подтвердите действие биометрией устройства',
    cancelLabel: 'Отмена',
    biometricsSecurityLevel: 'strong',
    disableDeviceFallback: true,
    requireConfirmation: true,
  });

  return result.success;
}
```

Параметр `biometricsSecurityLevel: 'strong'` важен для Android: он не допускает
слабое 2D-распознавание лица и разрешает, например, отпечаток или 3D-скан лица.
`disableDeviceFallback: true` не предлагает PIN-код устройства после неудачных
попыток. Если PIN должен быть допустимой запасной опцией, замените значение на
`false`.

## 4. Использовать для входа

Пример обработчика кнопки на экране входа:

```tsx
import { Alert, Button } from 'react-native';
import { confirmWithBiometrics } from '@/lib/biometrics';

export function BiometricLoginButton() {
  async function handleLogin() {
    const confirmed = await confirmWithBiometrics('Войти в приложение');

    if (!confirmed) {
      Alert.alert('Вход не подтверждён');
      return;
    }

    // Демо: переключить локальное состояние на «пользователь вошёл».
    // В production здесь обычно обновляют сессию через backend.
  }

  return <Button title="Войти по отпечатку" onPress={handleLogin} />;
}
```

## 5. Использовать для критичной операции

Запрашивайте биометрию сразу перед действием, а не при открытии экрана:

```ts
async function handleDeleteProfile() {
  const confirmed = await confirmWithBiometrics('Удалить профиль');

  if (!confirmed) {
    return;
  }

  // Демо-действие: удалить только локальные данные или показать успех.
}
```

Подходящие примеры: удаление профиля, сброс настроек, изменение PIN-кода,
подтверждение заказа. Обычную навигацию и безопасные действия биометрией
перегружать не стоит.

## 6. Проверка на устройстве

Биометрию проверяйте на физическом телефоне с добавленным отпечатком или Face
ID. Эмуляторы и симуляторы не дают надёжной проверки поведения биометрии.

Для Face ID на iOS Expo Go не поддерживает запрос Face ID. После установки
пакета или изменения `app.json` создайте и установите development build:

```powershell
npx expo install expo-dev-client
npx expo run:android
# или, на macOS с Xcode:
npx expo run:ios
```

Пересобирать development build нужно после добавления нативной библиотеки или
изменения config plugin. Обычные изменения TypeScript/JavaScript затем можно
запускать через `npx expo start`.

## Что изменить при появлении backend

Локальная биометрия не доказывает серверу факт подтверждения. Когда в
приложении появятся реальные операции, backend должен сам проверять сессию,
права пользователя, параметры операции и защиту от повторной отправки запроса.
Для локального хранения токенов используйте `expo-secure-store`, а не
`AsyncStorage`.

## Официальная документация

- [Expo LocalAuthentication, SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/local-authentication/)
- [Expo development builds](https://docs.expo.dev/develop/development-builds/use-development-builds/)
