# [Swift - iOS] How to save Certificate (.pem) and Private key in Keychain, then obtain an Identity.

Recently I had to interface an iOS app with an IoT MQTT broker hosted on AWS, and I wasn't able to find a clear documentation on how to obtain a `SecIdentityRef` from a PEM certificate and a private key.

Amazon, as well as using server certificates, advices to use client certificates so that... 

> ...each device or client be given a unique certificate to enable fine-grained client management actions, including certificate revocation.

This means the application must manage his own certificates, maybe obtained at runtime.

The framework I've used is [CocoaMQTT](https://github.com/emqx/CocoaMQTT), it could easily handle client certificates, but on the README they give examples using a .p12 certificate created on machine's terminal. But what if the certificates are *dynamic*, and adding the .p12 is not convenient? An example could be downloading the certificate and private key from a local server, because the app has multiple clients correlated with different users that could register and login at different times.

CocoaMQTT relays on `GCDAsyncSockets` which needs, in order to connect via SSL, a dictionary populated by `kCFStreamSSLCertificates` as key and an array of `SecIdentityRef` as value. We pass this dictionary by assigning the `sslSettings` property of the CocoaMQTT client instance. Now, how to obtain the `SecIdentityRef` using the cert.pem and priv.key files?

### Create a SecCertificate

The first thing to do is creating a `SecCertificate` instance and you should use the `SecCertificateCreateWithData` method as you can see on [Apple Developer Documentation](https://developer.apple.com/documentation/security/certificate_key_and_trust_services/certificates/storing_a_der-encoded_x_509_certificate?language=objc). But, uhm... probably you have a .pem file containing a single certificate, but the method needs a DER format cert. 

> PEM is the most common format for X.509 public certificates, containing one or more items in *Base64 ASCII encoding*. While DER is a binary encoding for **certificates and private keys** and doesn't contain plain text statements such as the header `-----BEGIN CERTIFICATE-----`.

So... you can convert the PEM certificate *on the fly* by removing the header and footer plain text strings, and base64 decoding the result!

```swift
static func removeEndsBase64Decode(file: String) -> Data? {
    let rmEnds = self.removeHeaderAndFooter(fullString: file)
    guard let der = Data(base64Encoded: rmEnds, options:NSData.Base64DecodingOptions.ignoreUnknownCharacters) else {
        NSLog("Error: couldn't parse the certificate/key")
        return nil
    }
    return der
}

static func removeHeaderAndFooter(fullString: String) -> String {
    var removedHF = fullString
    removedHF = removedHF.replacingOccurrences(of: "-----BEGIN RSA PRIVATE KEY-----\n", with: "")
    removedHF = removedHF.replacingOccurrences(of: "\n-----END RSA PRIVATE KEY-----\n", with: "")
    removedHF = removedHF.replacingOccurrences(of: "-----BEGIN CERTIFICATE-----\n", with: "")
    removedHF = removedHF.replacingOccurrences(of: "\n-----END CERTIFICATE-----\n", with: "")
    return removedHF
}
```

Now you can easily call `SecCertificateCreateWithData` by calling the`removeEndsBase64Decode` function.

### Create a SecKey

Next, you need to create a `SecKey` instance and probably for this you have a priv.key file containing a RSA private key. Similarly as we have done for the certificate, we need to remove the header and footer and base64 decode the result. Then use the `SecKeyCreateWithData` method.

### Get a SecIdentity

If you are developing a macOS app, you can simply use [`SecIdentityCreateWithCertificate`](https://developer.apple.com/documentation/security/1401160-secidentitycreatewithcertificate) method offered from the SDK, but unfortunately I had to implement it for iOS, and the only way is passing through the Keychain! 
It cloud seems simple, but handling the Keychain API isn't. In this article I won't help you much with that, but there are many informations in the Apple Documentation.
In order to obtain the `SecIdentity` you need to add the `SecCertificate` and `SecKey`...

```swift
static func addCertificate(certificate: SecCertificate, label: String){
    let addCertQuery: [String: Any] = [kSecClass as String: kSecClassCertificate,
                                       kSecValueRef as String: certificate,
                                       kSecAttrLabel as String: label]

    let status = SecItemAdd(addCertQuery as CFDictionary, nil)
    if (status != errSecSuccess) {
        NSLog("Keychain | !!! Couldn't save certificate securely - errCode: \(status)")
        if #available(iOS 11.3, *) {
            NSLog("errDesc: \(SecCopyErrorMessageString(status, nil).debugDescription)")
        }
    } else {
        NSLog("Keychain | Successfully saved certificate")
    }
}


static func addKey(key: SecKey, label: String){
    let addKeyQuery: [String: Any] = [
          kSecClass as String: kSecClassKey,
          kSecAttrIsPermanent as String: true,
          kSecValueRef as String: key,
          kSecAttrApplicationTag as String: label
        ]

    let status = SecItemAdd(addKeyQuery as CFDictionary, nil)
    if (status != errSecSuccess) {
        NSLog("Keychain | !!! Couldn't save key securely - errCode: \(status)")
        if #available(iOS 11.3, *) {
            NSLog("errDesc: \(SecCopyErrorMessageString(status, nil).debugDescription)")
        }
    } else {
        NSLog("Keychain | Successfully saved key")
    }
}
```

...and then query for a `SecIdentityRef`:

```swift
static func getIdentity() -> CFTypeRef? {
    let getIdentityQuery: [String: Any] = [kSecClass as String: kSecClassIdentity,
                                            kSecReturnData  as String: kCFBooleanTrue!,
                                            kSecReturnAttributes as String: kCFBooleanTrue!,
                                            kSecReturnRef as String: kCFBooleanTrue!,
                                            kSecMatchLimit as String: kSecMatchLimitAll
        ]
    var identityItem: CFTypeRef?
    let status = SecItemCopyMatching(getIdentityQuery as CFDictionary, &identityItem)
    if (status != errSecSuccess) {
        NSLog("Keychain | Couldn't retrieve Identity - errCode: \(status))")
        if #available(iOS 11.3, *) {
            NSLog("errDesc: \(SecCopyErrorMessageString(status, nil).debugDescription)")
        }
    } else {
        return identityItem
    }
    return nil
}
```

##### SAMPLE CODE

```swift
if let certData = IdentityManager.removeEndsBase64Decode(file: certStr),
   let keyData = IdentityManager.removeEndsBase64Decode(file: keyStr){
    let size = keyData.count * 8
    let attributes: CFDictionary = [ kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
                                     kSecAttrKeyClass as String: kSecAttrKeyClassPrivate,
                                     kSecAttrKeySizeInBits as String: NSNumber(value: size)] as CFDictionary
    var error: Unmanaged<CFError>?
    if let cert = SecCertificateCreateWithData(nil, certData as CFData),
       let key = SecKeyCreateWithData(keyData as CFData, attributes, &error){
        IdentityManager.addCertificate(certificate: cert, label: "myCertificate")
        IdentityManager.addKey(key: key, label: "myPrivateKey")
    }
}

guard let identity = IdentityManager.getIdentity() as? Array<Any>,
      let identityDict = identity[0] as? Dictionary<String, Any> else {
    NSLog("Couldn't retrieve identity dictionary")
    return
}

let identityRef = identityDict[kSecValueRef as String]
let certArray = [identityRef] as CFArray
var sslSettings: [String: NSObject] = [:]
sslSettings[kCFStreamSSLCertificates as String] = certArray
mqtt.sslSettings = sslSettings
```

Keep attention to `let identityDict = identity[0]` the `getIdentity()` method returns an array of identities, get the correct one!

## Conclusion

Most of this informations are taken from the Apple Forum topic: [generate SecIdentityRef with SecCertificateRef](https://developer.apple.com/forums/thread/69642) and @eskimo's answers (thanks god eskimo exists!). If you found a better solution don't hesitate to let me know, just text me on [LinkedIn](https://www.linkedin.com/in/raffaele-apetino/).
