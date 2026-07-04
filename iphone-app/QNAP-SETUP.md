# QNAP instellen voor NAS Notities

Stap-voor-stap instructies voor je **QNAP NAS** (QTS 5.x). De app praat met je NAS via **WebDAV**.

## Stap 1: WebDAV inschakelen

1. Open **Configuratiescherm** op je QNAP
2. Ga naar **Netwerk & bestandsservices** → **Win/Mac/NFS/WebDAV**
3. Open het tabblad **WebDAV**
4. Vink **WebDAV inschakelen** aan
5. Kies **Machtiging gedeelde map** (aanbevolen)
6. Poortinstellingen (kies één optie):

| Optie | HTTP (thuis) | HTTPS (extern) |
|-------|--------------|----------------|
| **Webserver-poort** (standaard) | `8080` | `443` |
| **Eigen WebDAV-poort** | bijv. `5000` | bijv. `5001` |

7. Klik op **Toepassen**

> Zorg dat de **webserver** aan staat als je de webserver-poorten gebruikt:  
> Configuratiescherm → **Applicaties** → **Webserver** → inschakelen.

## Stap 2: Gedeelde map en rechten

1. Maak een map aan (of gebruik **Public**), bijvoorbeeld `Public`
2. Ga naar **Configuratiescherm** → **Machtiging** → **Gedeelde mappen**
3. Klik op **WebDAV-toegangsbeheer**
4. Geef je gebruiker **Lezen/Schrijven** op de gekozen map

## Stap 3: App-gebruiker aanmaken (aanbevolen)

1. **Configuratiescherm** → **Machtiging** → **Gebruikers**
2. Maak een gebruiker aan, bijv. `iphone-app`
3. Geef alleen rechten op de map waar notities komen (niet op je hele NAS)

## Stap 4: Adressen voor de app

### Thuisnetwerk

Gebruik het **IP-adres** of **NAS-hostnaam** + poort + **naam van de gedeelde map**:

```
http://192.168.1.50:8080/Public
```

Of met hostnaam:

```
http://mijn-nas.local:8080/Public
```

### Buiten huis

Gebruik altijd **HTTPS**. Drie opties:

#### Optie A: myQNAPcloud (eenvoudigst)

1. Schakel **myQNAPcloud** in: Configuratiescherm → **myQNAPcloud**
2. Noteer je cloudnaam, bijv. `mijnnaam`
3. Forward in je router de **HTTPS WebDAV-poort** (443 of 5001) naar je NAS  
   — of gebruik **myQNAPcloud DDNS** met automatische poortregels als je router dat ondersteunt
4. Extern adres in de app:

```
https://mijnnaam.myqnapcloud.com:443/Public
```

> Poort `443` mag weggelaten worden: `https://mijnnaam.myqnapcloud.com/Public`

#### Optie B: Eigen domein / DDNS

```
https://nas.jouwdomein.nl:443/Public
```

Stel een **Let's Encrypt**-certificaat in via QNAP (Configuratiescherm → Beveiliging → Certificaat & privésleutel).

#### Optie C: VPN (meest veilig)

1. Installeer **QuWAN**, **QVPN** of **Tailscale** op je NAS/iPhone
2. Verbind je iPhone met de VPN buiten huis
3. Gebruik het **thuisadres** ook als extern adres, of het VPN-IP:

```
http://100.x.x.x:8080/Public
```

Geen poorten open op internet nodig.

## Stap 5: Invullen in de app

| Veld | Voorbeeld |
|------|-----------|
| **Thuisnetwerk** | `http://192.168.1.50:8080/Public` |
| **Buiten huis** | `https://mijnnaam.myqnapcloud.com/Public` |
| **Gebruikersnaam** | `iphone-app` |
| **Wachtwoord** | je NAS-wachtwoord |
| **Opslagmap** | `iphone-app-notities` |

De app maakt de map `iphone-app-notities` automatisch aan **binnen** de gedeelde map uit je adres (hier: `Public/iphone-app-notities`).

### Alternatief: map in het pad-veld

Als je geen map in het adres wilt:

| Veld | Waarde |
|------|--------|
| **Thuisnetwerk** | `http://192.168.1.50:8080` |
| **Opslagmap** | `Public/iphone-app-notities` |

Beide manieren werken.

## Problemen oplossen (QNAP)

| Probleem | Oplossing |
|----------|-----------|
| **401 / 403** | Controleer gebruikersnaam, wachtwoord en WebDAV-rechten op de gedeelde map |
| **Verbinding time-out thuis** | Klopt poort 8080? Staat WebDAV aan? Zelfde WiFi-netwerk? |
| **Werkt thuis, niet extern** | myQNAPcloud/DDNS actief? Poort 443 doorgestuurd? HTTPS-certificaat geldig? |
| **Lege notitielijst** | Staat de gedeelde map in het adres? Heeft de gebruiker schrijfrechten? |
| **Certificaatfout** | Installeer een geldig certificaat via QNAP; vermijd zelfondertekende certs extern |

## Testen

1. Thuis: open de app → **Test verbinding** → status **Thuis**
2. Zet WiFi uit (mobiel netwerk) → ververs → status **Extern**
3. Maak een notitie → controleer op QNAP in **Bestandsstation** of het JSON-bestand in `Public/iphone-app-notities/` staat
