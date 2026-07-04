# NAS Notities — React Native (iPhone)

Een iPhone-app die **notities opslaat op je NAS** via **WebDAV**. Thuis gebruikt de app je lokale NAS-adres; buiten huis schakelt hij automatisch over naar je externe adres (HTTPS).

## Wat doet de app?

- Notities maken, bewerken en verwijderen
- Opslag als JSON-bestanden op je NAS (map instelbaar)
- Automatische keuze: eerst thuisnetwerk, anders extern adres
- Lokale cache als de NAS tijdelijk niet bereikbaar is
- Wachtwoord veilig opgeslagen in de iOS Keychain (`expo-secure-store`)

## NAS voorbereiden

De app werkt met vrijwel elke NAS die **WebDAV** ondersteunt (Synology, QNAP, TrueNAS, enz.).

### Synology (voorbeeld)

1. **Configuratiescherm → Bestandsservices → WebDAV**
2. Schakel WebDAV in
3. Poorten:
   - **HTTP (thuis):** standaard `5005`
   - **HTTPS (extern):** standaard `5006`
4. Maak een app-gebruiker aan met rechten op de gewenste map

**Thuisadres:** `http://192.168.x.x:5005`  
**Extern (kies één optie):**
- Synology QuickConnect: `https://<id>.quickconnect.to:5006`
- Eigen domein / DDNS: `https://nas.jouwdomein.nl:5006`
- Tailscale/VPN: `http://100.x.x.x:5005` (via VPN-tunnel)

### QNAP (voorbeeld)

1. **Configuratiescherm → Netwerk & bestandsservices → WebDAV**
2. Schakel WebDAV in
3. Gebruik poort `8080` (HTTP) of `443`/`984` (HTTPS), afhankelijk van je instellingen

## App instellen

1. Open **Instellingen** in de app
2. Vul **thuisnetwerk-adres** in (HTTP mag op lokaal netwerk)
3. Vul **buiten huis-adres** in (gebruik **HTTPS**)
4. Vul gebruikersnaam en wachtwoord in
5. Kies een mapnaam (standaard: `iphone-app-notities`)
6. Tik op **Test verbinding** en daarna **Opslaan**

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

Zie ook [NAS-SETUP.md](./NAS-SETUP.md) voor uitgebreide instructies over externe toegang.
