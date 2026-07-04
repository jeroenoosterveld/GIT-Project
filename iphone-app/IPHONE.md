# NAS Notities op je iPhone

## Snel starten

1. Zorg dat **WebDAV** aan staat op je NAS (zie [NAS-SETUP.md](./NAS-SETUP.md))
2. Installeer de app via **Expo Go** (ontwikkeling) of **TestFlight** (build)
3. Vul in de app je NAS-adressen in:
   - **Thuis:** `http://192.168.x.x:5005`
   - **Extern:** `https://jouwnas.example.com:5006`
4. Maak notities — ze worden op je NAS opgeslagen

## Expo Go (ontwikkeling)

1. Installeer [Expo Go](https://apps.apple.com/app/expo-go/id982107779)
2. Start op een computer: `npm start`
3. Scan de QR-code

## TestFlight / App Store

```bash
npm run build:ios
```

De build kan via TestFlight worden gedeeld.

## Buiten huis gebruiken

De app schakelt automatisch over naar je externe NAS-adres zodra je niet meer op het thuisnetwerk zit. Zie [NAS-SETUP.md](./NAS-SETUP.md) voor het instellen van QuickConnect, DDNS of VPN.
