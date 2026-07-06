# NAS instellen voor gebruik buiten huis (QNAP)

Deze instructies zijn voor **QNAP NAS**. Voor de volledige QNAP-handleiding zie **[QNAP-SETUP.md](./QNAP-SETUP.md)**.

De app probeert eerst je thuisadres; als dat niet werkt, schakelt ze over naar het externe adres.

## Vereisten

- WebDAV ingeschakeld op je QNAP (poort 8080 thuis, 443 extern is gebruikelijk)
- Een **HTTPS**-adres voor externe toegang
- Een NAS-gebruiker met schrijfrechten op de gedeelde map

## Optie 1: myQNAPcloud (eenvoudigst)

1. Schakel **myQNAPcloud** in via Configuratiescherm
2. Schakel WebDAV HTTPS in (poort 443 of eigen poort)
3. Extern adres in de app: `https://jeroenoosterveld.myqnapcloud.com/Public`

QNAP regelt DNS; je router moet wel de HTTPS-poort doorsturen naar je NAS.

## Optie 2: DDNS + port forwarding

1. Stel **DDNS** in op je QNAP of router (QNAP heeft ingebouwde DDNS)
2. Forward poort **443** (HTTPS WebDAV) naar je NAS
3. Installeer een SSL-certificaat (Let's Encrypt via QNAP)
4. Extern adres: `https://jouwnas.duckdns.org/Public`

## Optie 3: VPN (meest veilig)

1. Gebruik **QVPN**, **QuWAN** of **Tailscale** op je NAS en iPhone
2. Verbind je iPhone met de VPN buiten huis
3. Gebruik het thuisadres of het VPN-IP (`100.x.x.x`)

Geen poorten open op internet nodig.

## Optie 4: Reverse proxy (gevorderd)

Via QNAP **Webserver** of een container (Nginx/Caddy) kun je WebDAV achter een eigen domein zetten, bijv. `https://nas.jouwdomein.nl/webdav`.

## Veiligheid

- Gebruik altijd **HTTPS** voor het externe adres
- Maak een aparte QNAP-gebruiker aan voor de app
- Geef alleen WebDAV-rechten op de notitiemap
- Overweeg VPN in plaats van open poorten op internet

## Problemen oplossen

| Probleem | Oplossing |
|----------|-----------|
| Werkt thuis, niet extern | myQNAPcloud/DDNS, port forwarding (443) en certificaat controleren |
| 401 / 403 | Gebruikersnaam, wachtwoord en WebDAV-rechten op gedeelde map |
| Certificaatfout | Geldig SSL-certificaat via QNAP Configuratiescherm |
| Lege lijst | Gedeelde map in adres opnemen (bijv. `/Public`) |

## App-testen

1. Zet WiFi **uit** op je iPhone (mobiel netwerk)
2. Open de app en trek naar beneden om te verversen
3. Status moet **Extern** tonen als het externe adres werkt
