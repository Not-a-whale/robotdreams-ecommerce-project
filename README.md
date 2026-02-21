# 📦 Homework 05 — Order Service (Transactions, Concurrency, Idempotency)

## 🔎 Короткий опис

Реалізовано створення замовлення з гарантіями:

- відсутність partial writes
- захист від oversell при конкурентних запитах
- повна ідемпотентність
- оптимізація читання замовлень через індекс

## ▶ Як запустити

### 1️⃣ Запуск міграцій

```bash
npm run migration:run
```

### 2️⃣ Запуск застосунку

```bash
npm run start:dev
```

### ➕ Додавання тестових товарів

Можна додати товари напряму в БД:

```bash
docker exec -it iluvcoffee-db-1 psql -U root -d ecommerce -c "
INSERT INTO products (id, name, price, stock)
VALUES
(uuid_generate_v4(), 'Nike Air Essentials Pullover 3', 69, 10),
(uuid_generate_v4(), 'Adidas Hoodie Basic', 79, 5);
"
```

## 🔁 Перевірка ідемпотентності

**1️⃣ Виконати POST-запит:**

```
POST /orders
```

З header:

```
Idempotency-Key: 11111111-1111-1111-1111-111111111111
```

**2️⃣ Повторити той самий запит з тим самим ключем.**

**3️⃣ Перевірити в БД:**

```bash
docker exec -it iluvcoffee-db-1 psql -U root -d ecommerce -c "
SELECT count(*)
FROM orders
WHERE idempotency_key = '11111111-1111-1111-1111-111111111111';
"
```

**Результат повинен бути:** `1`

✅ 2 однакові запити → 1 order у БД.

## 🔐 Механізм конкурентності

Обрано **pessimistic locking**:

```typescript
.setLock('pessimistic_write')
```

**Що це дає:**

- Рядки товарів блокуються на час транзакції
- Інший запит не може змінити stock паралельно
- Oversell неможливий

### 🧪 Сценарій перевірки oversell

**1️⃣ Встановити stock = 1:**

```bash
docker exec -it iluvcoffee-db-1 psql -U root -d ecommerce -c "
UPDATE products
SET stock = 1
WHERE name = 'Nike Air Essentials Pullover 3';
"
```

**2️⃣ Зробити 2 паралельні запити з різними Idempotency-Key.**

**Очікуваний результат:**

- 1 запит успішний
- 1 отримує `409 Conflict`
- stock не стає від'ємним

## 🔁 Ідемпотентність

Ідемпотентність реалізована на двох рівнях.

### 1️⃣ Рівень БД

```sql
ALTER TABLE orders
ADD CONSTRAINT uq_orders_idempotency_key
UNIQUE (idempotency_key);
```

### 2️⃣ Рівень сервісу

- Перевірка існуючого order перед створенням
- Обробка PostgreSQL помилки `23505`

```typescript
if (isPgUniqueViolation(err, 'uq_orders_idempotency_key')) {
  return existingOrder;
}
```

**Гарантія:** 2 однакові запити → 1 order у БД.

## ⚡ Оптимізація запиту

Було оптимізовано запит отримання замовлень користувача:

```sql
SELECT *
FROM orders
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 20;
```

### ❌ До додавання індексу

**Sequential Scan** (~5 ms execution)

```
Limit (cost=1029.27..1029.32 rows=20 width=52) (actual time=4.983..4.985 rows=20.00 loops=1)
  Buffers: shared hit=250
  -> Sort (cost=1029.27..1079.28 rows=20002 width=52) (actual time=4.982..4.983 rows=20.00 loops=1)
        Sort Key: created_at DESC
        Sort Method: top-N heapsort Memory: 30kB
        Buffers: shared hit=250
        -> Seq Scan on orders o (cost=0.00..497.02 rows=20002 width=52) (actual time=0.039..3.292 rows=20002.00 loops=1)
              Filter: (user_id = 'fda37f47-9113-496d-be77-234069aacf14'::uuid)
              Buffers: shared hit=247
Planning:
  Buffers: shared hit=100
Planning Time: 0.532 ms
Execution Time: 5.028 ms
```

### ✅ Після додавання індексу

```sql
CREATE INDEX idx_orders_user_created_at
ON orders(user_id, created_at DESC);
```

**Index Scan** (~0.14 ms execution)

```
Limit (cost=0.29..1.61 rows=20 width=52) (actual time=0.030..0.104 rows=20.00 loops=1)
  Buffers: shared hit=20 read=2
  -> Index Scan using idx_orders_user_created_at on orders o (cost=0.29..1327.20 rows=20002 width=52) (actual time=0.029..0.101 rows=20.00 loops=1)
        Index Cond: (user_id = 'fda37f47-9113-496d-be77-234069aacf14'::uuid)
        Index Searches: 1
        Buffers: shared hit=20 read=2
Planning:
  Buffers: shared hit=122 read=1
Planning Time: 0.594 ms
Execution Time: 0.140 ms
```

### 🧠 Чому planner обрав Index Scan?

Індекс покриває:

- фільтрацію (`user_id`)
- сортування (`created_at DESC`)

PostgreSQL може одразу отримати відсортований результат без додаткового сортування, що значно зменшує час виконання.
