# NAS Notities op je iPhone (QNAP)

## Snel starten

1. Schakel **WebDAV** in op je QNAP (zie [QNAP-SETUP.md](./QNAP-SETUP.md))
2. Installeer de app via **Expo Go** of **TestFlight**
3. Vul in de app in:
   - **Thuis:** `http://192.168.2.27:8080/Public`
   - **Extern:** `https://jouwnaam.myqnapcloud.com/Public`
4. Maak notities — ze worden op je QNAP opgeslagen

## Expo Go (ontwikkeling)

1. Installeer [Expo Go](https://apps.apple.com/app/expo-go/id982107779)
2. Start op een computer: `npm start`
3. Scan de QR-code

## Buiten huis (myQNAPcloud)

1. Schakel myQNAPcloud in op je QNAP
2. Forward HTTPS-poort 443 naar je NAS (of gebruik VPN)
3. Extern adres: `https://<jouw-naam>.myqnapcloud.com/Public`

Zie [QNAP-SETUP.md](./QNAP-SETUP.md) voor stap-voor-stap instructies.

## TestFlight / App Store

```bash
npm run build:ios
```
