// sslpin_bypass_universal.js

Java.perform(function () {
    console.log("[+] Universal SSL Pinning Bypass chargé");
    console.log("[+] Cible : com.android.insecurebankv2");

    function log(msg) {
        console.log("[+] SSL bypass: " + msg);
    }

    // 1. SSLContext.init bypass
    try {
        var TrustManager = Java.registerClass({
            name: "com.frida.CustomTrustManager",
            implements: [Java.use("javax.net.ssl.X509TrustManager")],
            methods: {
                checkClientTrusted: function (chain, authType) {},
                checkServerTrusted: function (chain, authType) {},
                getAcceptedIssuers: function () {
                    return [];
                }
            }
        });

        var SSLContext = Java.use("javax.net.ssl.SSLContext");

        SSLContext.init.overload(
            "[Ljavax.net.ssl.KeyManager;",
            "[Ljavax.net.ssl.TrustManager;",
            "java.security.SecureRandom"
        ).implementation = function (keyManager, trustManager, secureRandom) {
            log("SSLContext.init intercepté");
            var customTrustManagers = [TrustManager.$new()];
            return this.init(keyManager, customTrustManagers, secureRandom);
        };

        log("SSLContext.init patché");
    } catch (e) {
        console.log("[-] SSLContext.init non patché : " + e);
    }

    // 2. Conscrypt TrustManagerImpl bypass
    try {
        var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");

        TrustManagerImpl.verifyChain.implementation = function (
            untrustedChain,
            trustAnchorChain,
            host,
            clientAuth,
            ocspData,
            tlsSctData
        ) {
            log("TrustManagerImpl.verifyChain bypassé pour : " + host);
            return untrustedChain;
        };

        log("TrustManagerImpl.verifyChain patché");
    } catch (e) {
        console.log("[-] TrustManagerImpl non trouvé : " + e);
    }

    // 3. OkHttp CertificatePinner bypass
    try {
        var CertificatePinner = Java.use("okhttp3.CertificatePinner");

        CertificatePinner.check.overload("java.lang.String", "java.util.List").implementation = function (hostname, peerCertificates) {
            log("OkHttp CertificatePinner.check bypassé pour : " + hostname);
            return;
        };

        log("OkHttp CertificatePinner patché");
    } catch (e) {
        console.log("[-] OkHttp CertificatePinner non trouvé : " + e);
    }

    // 4. WebView SSL error bypass
    try {
        var WebViewClient = Java.use("android.webkit.WebViewClient");

        WebViewClient.onReceivedSslError.implementation = function (view, handler, error) {
            log("WebView SSL error ignorée");
            handler.proceed();
        };

        log("WebViewClient.onReceivedSslError patché");
    } catch (e) {
        console.log("[-] WebViewClient non patché : " + e);
    }

    console.log("[+] Hooks SSL installés");
});
