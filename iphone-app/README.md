# NAS Notities — React Native (iPhone)

Een iPhone-app die **notities opslaat op je QNAP NAS** via **WebDAV**. Thuis gebruikt de app je lokale NAS-adres; buiten huis schakelt hij automatisch over naar je externe adres (HTTPS).

## Wat doet de app?

- Notities maken, bewerken en verwijderen
- Opslag als JSON-bestanden op je NAS (map instelbaar)
- Automatische keuze: eerst thuisnetwerk, anders extern adres
- Lokale cache als de NAS tijdelijk niet bereikbaar is
- Wachtwoord veilig opgeslagen in de iOS Keychain (`expo-secure-store`)

## QNAP voorbereiden

> Volledige handleiding: **[QNAP-SETUP.md](./QNAP-SETUP.md)**

1. **Configuratiescherm** → **Netwerk & bestandsservices** → **Win/Mac/NFS/WebDAV** → tab **WebDAV**
2. Schakel WebDAV in, kies **Machtiging gedeelde map**
3. Poorten (standaard webserver): **8080** (HTTP thuis) en **443** (HTTPS extern)
4. Geef je gebruiker WebDAV **Lezen/Schrijven** op een gedeelde map (bijv. `Public`)

**Voorbeeldadressen:**

| Veld | Voorbeeld |
|------|-----------|
| Thuis | `http://192.168.1.50:8080/Public` |
| Buiten huis | `https://mijnnaam.myqnapcloud.com/Public` |
| Opslagmap | `iphone-app-notities` |

## App instellen

1. Open **Instellingen** in de app
2. Vul **thuisnetwerk-adres** in (HTTP op lokaal netwerk)
3. Vul **buiten huis-adres** in (altijd **HTTPS**, bijv. myQNAPcloud)
4. Vul QNAP-gebruikersnaam en wachtwoord in
5. Kies een mapnaam (standaard: `iphone-app-notities`)
6. Tik op **Test verbinding** en daarna **Opslaan**

## Buiten huis

- **myQNAPcloud** — eenvoudigst (zie QNAP-SETUP.md)
- **DDNS + port forwarding** — eigen domein, poort 443
- **VPN (QVPN / Tailscale)** — het veiligst

Zie [NAS-SETUP.md](./NAS-SETUP.md) voor details.

## Technologie

| Onderdeel | Keuze |
|-----------|-------|
| Framework | Expo ~57 + React Native 0.86 |
| NAS-protocol | WebDAV (PROPFIND, GET, PUT, DELETE) |
| Credentials | expo-secure-store (Keychain) |
| Offline cache | AsyncStorage |

## Ontwikkelen

```bash
cd iphone-app
npm install
npm start
```

## Native iOS-build

```bash
npm run build:ios
```
