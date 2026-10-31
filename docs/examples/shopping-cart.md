---
title: Local shopping cart
description: Keep a small browser cart with Strata Storage while leaving prices and checkout to the server.
tags: [examples, cart]
---

# Local shopping cart

A cart in `localStorage` can survive a browser reload. It is a draft of the shopper's intent, not an order record: prices, stock, discounts and tax must be checked by the server before checkout.

- [Save and read a cart](#cart)
- [Limits](#limits)

<a id="cart"></a>
## 🛒 Save and read a cart&nbsp;[#](#cart)

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({ namespace: 'shop-cart' });
const cartOptions = { storage: 'localStorage' as const };

type CartItem = { productId: string; name: string; quantity: number };
type Cart = { items: CartItem[] };

async function readCart(): Promise<Cart> {
  return (await storage.get<Cart>('cart', cartOptions)) ?? { items: [] };
}

async function addItem(productId: string, name: string, quantity = 1): Promise<void> {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('Quantity must be a positive whole number.');
  }

  const cart = await readCart();
  const item = cart.items.find(entry => entry.productId === productId);
  if (item) item.quantity += quantity;
  else cart.items.push({ productId, name, quantity });
  await storage.set('cart', cart, cartOptions);
}

async function removeItem(productId: string): Promise<void> {
  const cart = await readCart();
  cart.items = cart.items.filter(item => item.productId !== productId);
  await storage.set('cart', cart, cartOptions);
}

async function clearCart(): Promise<void> {
  await storage.remove('cart', cartOptions);
}
```

`readCart()` returns an empty cart when the key is absent. Surface write failures to the shopper before saying an item was saved.

<a id="limits"></a>
## ⚠️ Limits&nbsp;[#](#limits)

A cart update is a read followed by a write, not an atomic transaction. Two tabs can race and overwrite each other's changes. If a shopper signs in or checks out, merge and validate the cart on your server with a conflict policy; don't treat `localStorage` as shared account state.

`query()` matches fields inside stored values. It cannot filter physical keys or wrapper fields such as `key` and `value.timestamp`. If you collect cart events, record the event name and timestamp in each value, then aggregate reports on the server after consent.
