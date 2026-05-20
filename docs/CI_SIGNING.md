Android and iOS CI signing
=========================

Android (GitHub Actions)
- Create a Java keystore (example):

  keytool -genkey -v -keystore release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias your_key_alias

- Encode keystore for GitHub secret:

  base64 release-keystore.jks | tr -d '\n' > keystore.jks.base64

- Add these GitHub repository secrets:
  - `ANDROID_KEYSTORE_BASE64`  -> contents of `keystore.jks.base64`
  - `KEYSTORE_PASSWORD`        -> keystore password
  - `KEY_ALIAS`                -> alias used when creating key
  - `KEY_PASSWORD`             -> key password (can be same as keystore password)

- The workflow will decode the base64, write `android/keystore.jks` and `keystore.properties` at build time.

iOS (GitHub Actions / macOS runner)
- Export your distribution certificate as a P12 and your provisioning profile.

  - `IOS_P12_BASE64` -> base64 of the exported P12 file
  - `IOS_P12_PASSWORD` -> password for the P12 (if any)
  - `IOS_MOBILEPROVISION_BASE64` -> base64 of the provisioning profile (.mobileprovision)

- The iOS workflow contains a template step that imports the P12 and provisioning profile on the macOS runner.

Security notes
- Keep your keystore and signing artifacts secret and use GitHub repository or organization secrets.
- For production releases, consider using a secure key management flow and rotate keys when needed.

If you want, I can:
- Add a Gradle release signing properties template in the repo.
- Help you create the keystore locally and produce the base64 blobs.
