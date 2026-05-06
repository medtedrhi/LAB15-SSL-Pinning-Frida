# LAB 15 — Analyse Dynamique Android : Inspection TLS/HTTP(S) avec Frida, Burp Suite et InsecureBankv2

## 1. Objectif du lab

Ce lab a pour objectif de réaliser une analyse dynamique d’une application Android volontairement vulnérable afin d’observer son trafic réseau avec Burp Suite et de tester l’injection de scripts avec Frida.

L’application utilisée est **InsecureBankv2**, une application Android de test conçue pour l’apprentissage de la sécurité mobile.

Les objectifs principaux sont :

- Vérifier que Frida détecte l’application Android cible.
- Injecter un script simple avec Frida.
- Configurer Burp Suite comme proxy.
- Installer le certificat CA de Burp Suite sur l’émulateur Android.
- Configurer le proxy Android.
- Lancer le serveur backend de InsecureBankv2.
- Connecter l’application Android au serveur local.
- Observer les requêtes HTTP dans Burp Suite.
- Injecter un script de bypass SSL pinning avec Frida.

---

## 2. Environnement utilisé

- Windows
- PowerShell
- Android Studio Emulator
- ADB
- Frida 17.8.0
- frida-server
- Burp Suite Community Edition
- Python 2.7
- InsecureBankv2
- Backend AndroLabServer

---

## 3. Application cible

Application utilisée :


InsecureBankv2

Package Android :

com.android.insecurebankv2

Cette application est volontairement vulnérable et doit être utilisée uniquement dans un environnement de test ou pédagogique.

4. Structure du projet
LAB15-SSL-Pinning-Frida/
│
├── README.md
├── hello.js
├── sslpin_bypass_universal.js

5. Vérification de Frida et détection de l’application

La première étape consiste à vérifier que Frida peut communiquer avec l’émulateur Android et détecter les applications installées.

Commande utilisée :

frida-ps -Uai

Résultat observé :

PID   Name            Identifier
7288  InsecureBankv2  com.android.insecurebankv2

Cette sortie confirme que Frida détecte correctement l’application cible.

<img width="1100" height="531" alt="Capture d&#39;écran 2026-05-06 143544" src="https://github.com/user-attachments/assets/04e3d59a-95be-4068-b7d0-0b37145eadf0" />




6. Test d’injection simple avec Frida

Avant d’utiliser un script de bypass SSL pinning, un script simple est injecté dans l’application afin de vérifier que Frida fonctionne correctement.

Fichier utilisé :

hello.js

Contenu du script :

Java.perform(function () {
    console.log("[+] Script injecté: Java.perform OK");
});

Commande utilisée :

frida -U -f com.android.insecurebankv2 -l hello.js

Résultat observé :

Connected to Android Emulator 5554
Spawned `com.android.insecurebankv2`. Resuming main thread!
[+] Script injecté: Java.perform OK

Cette étape confirme que Frida peut lancer l’application et injecter du code JavaScript dans son processus.

<img width="1196" height="417" alt="Capture d&#39;écran 2026-05-06 143625" src="https://github.com/user-attachments/assets/fb05f33a-d898-46e2-9246-fec364711f1b" />


7. Configuration de Burp Suite

Burp Suite est utilisé comme proxy afin d’intercepter le trafic réseau généré par l’application Android.

Dans Burp Suite :

Proxy > Proxy settings > Proxy listeners

Configuration utilisée :

Bind to port: 8080
Bind to address: All interfaces

Le choix All interfaces permet à Burp Suite d’écouter sur toutes les interfaces réseau de la machine, y compris l’adresse IP locale utilisée par l’émulateur Android.

<img width="977" height="664" alt="Capture d&#39;écran 2026-05-06 143956" src="https://github.com/user-attachments/assets/2fa2fa69-d194-43d4-bb1a-8094635ed064" />


8. Configuration du proxy Android

Dans l’émulateur Android, le réseau Wi-Fi est configuré pour utiliser Burp Suite comme proxy.

Chemin utilisé :

Settings > Network & Internet > Wi-Fi > AndroidWifi > Edit

Configuration utilisée :

Proxy: Manual
Proxy hostname: 192.168.11.130
Proxy port: 8080

L’adresse 192.168.11.130 correspond à l’adresse IP de la machine Windows qui exécute Burp Suite.

<img width="376" height="819" alt="Capture d&#39;écran 2026-05-06 144348" src="https://github.com/user-attachments/assets/ba58bd2a-b827-4328-950a-72cc6e2a7d83" />


9. Téléchargement du certificat CA Burp

Depuis le navigateur de l’émulateur Android, l’adresse suivante a été ouverte :

http://burp

Cette page permet de télécharger le certificat CA généré par Burp Suite.

Fichier téléchargé :

cacert.der

<img width="395" height="822" alt="Capture d&#39;écran 2026-05-06 144521" src="https://github.com/user-attachments/assets/781481a4-77b1-4869-8fa8-08deb7ed4561" />


10. Installation du certificat CA

Le certificat CA a été installé depuis les paramètres Android.

Chemin utilisé :

Settings > Security > Encryption & credentials > Install a certificate > CA certificate

Après installation, Android affiche le message suivant :

CA certificate installed

Cette étape permet à l’émulateur Android de faire confiance au certificat utilisé par Burp Suite.

<img width="393" height="810" alt="Capture d&#39;écran 2026-05-06 145041" src="https://github.com/user-attachments/assets/00a18a01-e580-49b0-ab59-7c008fc2b0bf" />


11. Lancement du serveur InsecureBankv2

L’application InsecureBankv2 nécessite un serveur backend local appelé AndroLabServer.

Le serveur a été lancé avec Python 2.7.

Commande utilisée :

cd D:\Desktop\Android-InsecureBankv2\AndroLabServer
py -2 app.py

Résultat observé :

The server is hosted on port: 8888

Le serveur est donc disponible sur :

http://192.168.11.130:8888

Remarque : lorsque l’adresse est ouverte directement dans le navigateur, la page peut afficher Not Found. Cela est normal, car le serveur ne possède pas forcément de page d’accueil /. Il répond surtout aux routes utilisées par l’application, comme /login.

<img width="853" height="74" alt="Capture d&#39;écran 2026-05-06 150102" src="https://github.com/user-attachments/assets/9d5a5fb1-f7c6-49d4-a192-a390d9aba024" />


12. Configuration du serveur dans InsecureBankv2

Dans l’application InsecureBankv2, l’adresse du serveur backend a été configurée.

Configuration utilisée :

Server IP: 192.168.11.130
Server Port: 8888

Cette configuration permet à l’application Android de communiquer avec le backend exécuté sur la machine Windows.

<img width="447" height="782" alt="Capture d&#39;écran 2026-05-06 150554" src="https://github.com/user-attachments/assets/cb192358-f696-4bab-abbd-63fc93c6c9d9" />


13. Connexion à l’application

Après configuration du serveur, une tentative de connexion est effectuée dans InsecureBankv2.

Après connexion réussie, l’application affiche l’écran principal avec les options suivantes :

Transfer
View Statement
Change Password
Device not Rooted!!

Cela confirme que l’application communique correctement avec le serveur backend.

<img width="425" height="823" alt="Capture d&#39;écran 2026-05-06 150647" src="https://github.com/user-attachments/assets/eff73fbd-3193-4b38-a7fe-71acb5d60832" />


14. Script de bypass SSL pinning avec Frida

Un script Frida a ensuite été utilisé pour installer plusieurs hooks liés à la gestion TLS/SSL.

Fichier utilisé :

sslpin_bypass_universal.js

Commande utilisée :

frida -U -f com.android.insecurebankv2 -l sslpin_bypass_universal.js

Résultat observé :

[+] Universal SSL Pinning Bypass chargé
[+] Cible : com.android.insecurebankv2
[+] SSL bypass: SSLContext.init patché
[+] SSL bypass: TrustManagerImpl.verifyChain patché
[-] OkHttp CertificatePinner non trouvé
[+] SSL bypass: WebViewClient.onReceivedSslError patché
[+] Hooks SSL installés

Le message suivant n’est pas une erreur bloquante :

OkHttp CertificatePinner non trouvé

Cela signifie simplement que l’application ne semble pas utiliser la classe okhttp3.CertificatePinner. Les autres hooks sont bien chargés.

<img width="1452" height="558" alt="Capture d&#39;écran 2026-05-06 152015" src="https://github.com/user-attachments/assets/9e619651-40ac-4ae1-aca3-304ddd13ccac" />


15. Observation du trafic dans Burp Suite

Après la configuration du proxy et l’utilisation de l’application, Burp Suite affiche les requêtes envoyées par InsecureBankv2 vers le serveur local.

Dans Burp Suite :

Proxy > HTTP history

Requête observée :

POST /login HTTP/1.1
Host: 192.168.11.130:8888
Content-Type: application/x-www-form-urlencoded
User-Agent: Apache-HttpClient/UNAVAILABLE (java 1.4)

Cette requête montre que l’application envoie les informations de connexion au serveur backend.

<img width="1872" height="385" alt="Capture d&#39;écran 2026-05-06 150733" src="https://github.com/user-attachments/assets/886bddee-65a8-4d5d-b61f-cbaf4fa2ae06" />


16. Détails de la requête login

Dans l’onglet HTTP history de Burp Suite, la requête /login peut être inspectée en détail.

Exemple de requête interceptée :

POST /login HTTP/1.1
Host: 192.168.11.130:8888
Content-Type: application/x-www-form-urlencoded
Connection: Keep-Alive
User-Agent: Apache-HttpClient/UNAVAILABLE (java 1.4)

username=jack&password=********

Pour des raisons de sécurité et de bonne pratique, le mot de passe est masqué dans le README.

Cette capture prouve que le trafic de l’application passe bien par Burp Suite.

<img width="1902" height="596" alt="Capture d&#39;écran 2026-05-06 152218" src="https://github.com/user-attachments/assets/2b4d4a3f-0a14-46f8-b3b3-9ee11175d2fe" />


17. Résultat obtenu

À la fin du lab, les éléments suivants ont été validés :

Frida détecte l’application InsecureBankv2.
Un script Frida simple peut être injecté dans l’application.
Burp Suite est configuré comme proxy sur le port 8080.
L’émulateur Android utilise Burp Suite comme proxy.
Le certificat CA de Burp Suite est installé dans Android.
Le serveur backend InsecureBankv2 fonctionne sur le port 8888.
L’application communique correctement avec le serveur.
Les requêtes réseau sont visibles dans Burp Suite.
Le script Frida de bypass SSL est chargé correctement.
18. Problèmes rencontrés
Problème 1 : certificat CA non cliquable

Lors de l’installation du certificat cacert.der, Android ne permettait pas toujours de sélectionner le fichier directement depuis le gestionnaire de fichiers.

Solution utilisée :

Passer par les paramètres Android.
Choisir Install a certificate.
Choisir CA certificate.
Installer le certificat téléchargé depuis http://burp.
Problème 2 : serveur Python incompatible avec Python 3

Le backend InsecureBankv2 utilise une ancienne syntaxe Python 2.

Erreur observée :

SyntaxError: Missing parentheses in call to 'print'

Solution :

py -2 app.py

Le serveur doit être lancé avec Python 2.7.

Problème 3 : modules installés avec la mauvaise version Python

Les dépendances ont d’abord été installées avec Python 3, alors que le serveur fonctionne avec Python 2.

Solution :

py -2 -m pip install -r requirements.txt

Puis :

py -2 app.py
Problème 4 : page Not Found sur le navigateur

Lorsque l’adresse suivante est ouverte dans le navigateur :

http://192.168.11.130:8888

Le serveur affiche :

Not Found

Cela est normal, car la route / n’est pas utilisée. L’application communique avec des routes spécifiques comme :

/login
19. Conclusion

Ce lab a permis de réaliser une analyse dynamique Android complète sur l’application InsecureBankv2.

Les principales étapes réalisées sont :

Détection de l’application avec Frida.
Injection d’un script Frida simple.
Configuration de Burp Suite comme proxy.
Installation du certificat CA Burp sur Android.
Lancement du serveur backend InsecureBankv2.
Configuration de l’application avec l’adresse IP du serveur.
Connexion à l’application.
Observation des requêtes réseau dans Burp Suite.
Injection d’un script de bypass SSL pinning avec Frida.

Ce lab montre comment combiner Frida et Burp Suite pour analyser le comportement réseau d’une application Android dans un environnement de test contrôlé.
