---
title: Ionic Capacitor example
description: Prepare one Strata Storage instance for an Ionic app and register native adapters before the first operation.
tags: [ionic, capacitor, angular]
---

# Ionic App Example

Prepare one storage instance after the Ionic platform is ready. `defineStorage()` registers the web adapters, and `registerCapacitorAdapters()` adds native adapters when the app runs through Capacitor.

```typescript
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = defineStorage({
    namespace: 'ionic-app',
    defaultStorages: Capacitor.isNativePlatform()
      ? ['sqlite', 'preferences', 'memory']
      : ['indexedDB', 'localStorage', 'memory'],
  });
  private readonly ready: Promise<void>;

  constructor(platform: Platform) {
    this.ready = platform.ready().then(() => registerCapacitorAdapters(this.storage));
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.ready;
    await this.storage.set(key, value);
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ready;
    return this.storage.get<T>(key);
  }
}
```

A screen can call `await storageService.set('draft', draft)` and read it with `await storageService.get<Draft>('draft')`. Test the web path in a browser and the native path in an iOS or Android build. See the [Capacitor guide](../guides/platforms/capacitor.md) and [device verification guide](../guides/platforms/device-verification.md).
