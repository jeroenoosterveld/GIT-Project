# NAS instellen voor gebruik buiten huis

Om je NAS-notities ook **buiten je thuisnetwerk** te gebruiken, moet je NAS bereikbaar zijn via internet. De app probeert eerst het thuisadres; als dat niet werkt, gebruikt ze het externe adres.

## Vereisten

- WebDAV ingeschakeld op je NAS
- Een **HTTPS**-adres voor externe toegang (aanbevolen)
- Een NAS-gebruiker met schrijfrechten op de opslagmap

## Optie 1: Synology QuickConnect (eenvoudigst)

1. Schakel QuickConnect in op je Synology
2. Schakel WebDAV HTTPS in (poort 5006)
3. Extern adres in de app: `https://<jouw-id>.quickconnect.to:5006`

Synology regelt de tunnel; geen port forwarding nodig.

## Optie 2: DDNS + port forwarding

1. Stel **DDNS** in op je router of NAS (bijv. DuckDNS, No-IP)
2. Forward poort **5006** (HTTPS) naar je NAS
3. Gebruik een geldig SSL-certificaat (Let's Encrypt via NAS)
4. Extern adres: `https://jouwnas.duckdns.org:5006`

## Optie 3: VPN (meest veilig)

1. Installeer **Tailscale**, **WireGuard** of de VPN-server van je NAS
2. Verbind je iPhone met de VPN buiten huis
3. Gebruik het **thuisadres** als extern adres, of het Tailscale-IP (`100.x.x.x`)

Geen poorten open op internet nodig.

## Optie 4: Reverse proxy

Gebruik Nginx, Caddy of de ingebouwde reverse proxy van je NAS om WebDAV via `https://nas.jouwdomein.nl/webdav` aan te bieden.

## Veiligheid

- Gebruik altijd **HTTPS** voor het externe adres
- Maak een aparte NAS-gebruiker aan voor de app
- Geef alleen rechten op de notitiemap
- Overweeg VPN in plaats van open poorten op internet

## Problemen oplossen

| Probleem | Oplossing |
|----------|-----------|
| Werkt thuis, niet extern | Controleer port forwarding, HTTPS en DDNS |
| Inlogfout | Controleer gebruikersnaam/wachtwoord en WebDAV-rechten |
| Certificaatfout | Installeer een geldig SSL-certificaat op je NAS |
| Lege lijst | Controleer of de mapnaam klopt en schrijfrechten heeft |

## App-testen

1. Zet WiFi **uit** op je iPhone (mobiel netwerk)
2. Open de app en trek naar beneden om te verversen
3. Status moet **Extern** tonen als het externe adres werkt
