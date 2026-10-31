# React Native support

Strata Storage 3.1.4 does not register React Native storage adapters. The native adapters exported from `strata-storage/capacitor` use Capacitor plugins and require a Capacitor runtime. A React Native app cannot use them by selecting `secure`, `sqlite` or `preferences` in `defaultStorages`.

For a web or Capacitor app, use the [Capacitor example](./capacitor-app.md) and [platform guide](../guides/platforms/capacitor.md). For React Native, use a storage library with adapters built for that runtime. No React Native integration or biometric option is claimed by this package.
