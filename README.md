# Full-Stack Task Manager (Kubernetes / Minikube)

Цей проєкт є навчальним вебзастосунком для керування завданнями (Task Manager), який розгорнуто в локальному кластері **Kubernetes (Minikube)** у межах Лабораторної роботи №3 з дисципліни *Технології DevOps*.

---

## 🛠 Архітектура застосунку

Застосунок побудований за мікросервісною архітектурою та складається з трьох основних компонентів:

1. **Frontend (Client)**: React SPA під управлінням Nginx. Приймає вхідний трафік на порту `80` та проксигує API-запити (`/api/*`) на бекенд.
2. **Backend (Server)**: Node.js Express REST API. Обробляє бізнес-логіку та взаємодіє з базою даних.
3. **Database (Mongo)**: Документоорієнтована база даних MongoDB для збереження стану та завдань.

---

## 📁 Структура каталогів

```text
.
├── client/                 # Вихідний код React-клієнта та Nginx.conf
├── server/                 # Вихідний код Node.js Express API
├── k8s/                    # Маніфести Kubernetes
│   ├── 00-namespace.yaml   # Ізольований Namespace (task-manager)
│   ├── 10-configmap.yaml   # Нечутливі параметри конфігурації
│   ├── 11-secret.yaml      # Чутливі дані (паролі та URI підключення)
│   ├── 20-mongo-pvc.yaml   # PersistentVolumeClaim для бази даних (1Gi)
│   ├── 21-mongo-deployment.yaml
│   ├── 22-mongo-service.yaml
│   ├── 30-server-deployment.yaml
│   ├── 31-server-service.yaml
│   ├── 40-client-deployment.yaml
│   └── 41-client-service.yaml
└── README.md

```

---

## ⚙️ Конфігурація (ConfigMap та Secret)

### ConfigMap (`server-config`)

Містить основні змінні оточення для бекенда:

* `NODE_ENV`: Середовище виконання (`production`).
* `PORT`: Внутрішній порт сервера (`5000`).

### Secret (`mongo-secret`)

Зберігає чутливі дані підключення до бази даних:

* `MONGO_ROOT_USERNAME`: Логін адміністратора БД.
* `MONGO_ROOT_PASSWORD`: Пароль адміністратора БД.
* `MONGO_URL`: Рядок підключення Express-сервера до MongoDB (`mongodb://admin:...@mongo-service:27017/task_manager?authSource=admin`).

---

## 🚀 Порядок розгортання

### 1. Передумови

Переконайтеся, що у вас встановлені та запущені:

* Docker Desktop
* Minikube
* `kubectl`

### 2. Запуск кластера

```bash
minikube start --driver=docker

```

### 3. Збірка та завантаження образів у Minikube

```bash
# Збірка версії 1.0.0
docker build -t ghcr.io/geyders/task-manager-server:1.0.0 ./server
docker build -t ghcr.io/geyders/task-manager-client:1.0.0 ./client

# Завантаження образів у Minikube
minikube image load ghcr.io/geyders/task-manager-server:1.0.0
minikube image load ghcr.io/geyders/task-manager-client:1.0.0

```

### 4. Розгортання застосунку в K8s

Застосування всіх маніфестів однією командою з каталогу `k8s/`:

```bash
kubectl apply -f k8s/

```

### 5. Доступ до застосунку

Для отримання доступу до вебінтерфейсу виконайте команду пробросу портів:

```bash
kubectl port-forward svc/client-service 3000:80 -n task-manager

```

Застосунок буде доступний у браузері за адресою: **`http://localhost:3000`**.

---

## 🔍 Основні команди для перевірки та керування

* **Перегляд усіх ресурсів у namespace:**
```bash
kubectl get all -n task-manager

```


* **Перевірка змінних оточення у контейнері сервера:**
```bash
kubectl exec -it deployment/server -n task-manager -- printenv

```


* **Масштабування реплік бекенда:**
```bash
kubectl scale deployment/server --replicas=4 -n task-manager

```


* **Оновлення на версію 1.1.0 (Rolling Update):**
```bash
kubectl set image deployment/server server=ghcr.io/geyders/task-manager-server:1.1.0 -n task-manager

```


* **Відкат до попередньої версії (Rollback):**
```bash
kubectl rollout undo deployment/server -n task-manager

```

---

# Лабораторна робота №4. Пакування застосунку в Helm-чарт

**Тема:** Автоматизація та параметризація розгортання multi-container застосунку за допомогою Helm 3

---

## ⚡ Quick Start (Швидкий старт для розробників)

Покрокова інструкція для локального розгортання та перевірки застосунку в кластері Kubernetes (Minikube).

### Передумови

* Запущений кластер Minikube (`minikube start`)
* Встановлені `kubectl` та `helm` (v3+)

---

### 1. Клонування проєкту та перехід у директорію

```bash
git clone https://github.com/geyders/taskmanager.git
cd taskmanager

```

---

### 2. Розгортання через Helm

#### 🟢 Варіант A: Development (1 репліка, мінімальні ресурси)

```bash
helm install task-manager ./helm/task-manager \
  -f ./helm/task-manager/values-dev.yaml \
  -n task-manager \
  --create-namespace

```

#### 🔵 Варіант B: Production (High Availability: по 3 репліки backend/frontend)

```bash
helm install task-manager ./helm/task-manager \
  -f ./helm/task-manager/values-prod.yaml \
  -n task-manager \
  --create-namespace

```

---

### 3. Перевірка статусу та запуск Helm Test

```bash
# Відстеження статусу запуску подів
kubectl get pods -n task-manager -w

# Запуск інтеграційного тесту перевірки зв'язності
helm test task-manager -n task-manager

```

---

### 4. Доступ до вебінтерфейсу

Для отримання прямого URL до клієнтського сервісу у Minikube:

```bash
minikube service task-manager-client-service -n task-manager --url

```

---

### 5. Оновлення конфігурації

Зміна версії образу або параметрів без перевстановлення:

```bash
helm upgrade task-manager ./helm/task-manager \
  -f ./helm/task-manager/values-dev.yaml \
  --set image.server.tag=1.1.0 \
  -n task-manager

```

---

### 6. Видалення релізу

```bash
# Видалення Helm-релізу
helm uninstall task-manager -n task-manager

# (Опціонально) Видалення namespace
kubectl delete namespace task-manager

```

---

## 🛠️ Структура Helm-чарта

Структура директорій чарта збережена у підпапці `helm/task-manager`:

```text
helm/task-manager/
├── Chart.yaml             # Метадані чарта (version: 0.1.0, appVersion: 1.0.0)
├── values.yaml            # Базові конфігурації за замовчуванням
├── values-dev.yaml        # Конфігурація для Dev-середовища
├── values-prod.yaml       # Конфігурація для Prod-середовища
├── .helmignore            # Файли, що ігноруються при пакуванні чарта
├── NOTES.txt              # Пост-інсталяційні підказки у консолі
└── templates/
    ├── _helpers.tpl       # Динамічні шаблони для генерації імен та міток
    ├── configmap.yaml     # Конфігурації середовища (NODE_ENV, PORT)
    ├── secret.yaml        # Секретні дані БД (MONGO_ROOT_USERNAME, MONGO_URL)
    ├── mongo-pvc.yaml     # PersistentVolumeClaim для диска MongoDB
    ├── mongo-deployment.yaml
    ├── mongo-service.yaml
    ├── server-deployment.yaml
    ├── server-service.yaml
    ├── client-deployment.yaml
    ├── client-service.yaml
    └── tests/
        └── test-connection.yaml # Helm Test Hook (перевірка HTTP/TCP доступу)

```

---

## ⚙️ Опис параметрів конфігурації (`values.yaml`)

| Параметр | Опис | Значення за замовчуванням |
| --- | --- | --- |
| `replicaCount.server` | Кількість реплік backend-сервера | `2` |
| `replicaCount.client` | Кількість реплік frontend-клієнта | `2` |
| `replicaCount.mongo` | Кількість реплік БД MongoDB | `1` |
| `image.server.repository` | Docker-репозиторій Backend | `ghcr.io/geyders/task-manager-server` |
| `image.server.tag` | Версія образу Backend | `1.0.0` |
| `image.client.repository` | Docker-репозиторій Frontend | `ghcr.io/geyders/task-manager-client` |
| `image.client.tag` | Версія образу Frontend | `1.0.0` |
| `image.mongo.repository` | Образ бази даних MongoDB | `mongo` |
| `image.mongo.tag` | Версія MongoDB | `8` |
| `service.client.type` | Тип Kubernetes Service для клієнта | `NodePort` |
| `service.client.port` | Внутрішній порт сервісу клієнта | `80` |
| `service.client.nodePort` | Зовнішній NodePort порт | `30080` |
| `persistence.mongo.enabled` | Увімкнення PersistentVolumeClaim | `true` |
| `persistence.mongo.size` | Обсяг виділеного дискового простору | `1Gi` |
| `resources.*` | Request/Limit ресурси CPU та Memory | Індивідуально за файлами `values-*.yaml` |
| `config.nodeEnv` | Оточення Node.js (`development` / `production`) | `production` |

---

## 📑 Звіт про виконання пунктів 6–9

### Пункт 6. Підготовка двох середовищ (`values-dev.yaml` та `values-prod.yaml`)

Створено два незалежні файли значень:

* **`values-dev.yaml`**: Налаштовано 1 репліку для кожного сервісу, базові ліміти ресурсів та `nodeEnv: "development"`.
* **`values-prod.yaml`**: Налаштовано по 3 репліки для `server` та `client`, підвищені ліміти ресурсів та `nodeEnv: "production"`.

**Шаблонізація та перевірка маніфестів без установки в кластер (п. 6.b):**

```powershell
helm template task-manager ./helm/task-manager -f ./helm/task-manager/values-dev.yaml

```

---

### Пункт 7. Перевірка та розгортання чарта

**1. Синтаксична перевірка (п. 7.a):**

```powershell
helm lint ./helm/task-manager

```

*Результат:* `1 chart(s) linted, 0 chart(s) failed`

**2. Інсталяція релізу у власному Namespace (п. 7.c):**

```powershell
helm install task-manager ./helm/task-manager -f ./helm/task-manager/values-dev.yaml -n task-manager --create-namespace

```

**3. Перевірка списку розгорнутих релізів (п. 7.d):**

```powershell
helm list -n task-manager

```

```text
NAME            NAMESPACE       REVISION    UPDATED                                 STATUS      CHART               APP VERSION
task-manager    task-manager    1           2026-10-07 20:32:14.0751707 +0300 EEST  deployed    task-manager-0.1.0  1.0.0      

```

**4. Збереження стану релізу у вигляді Secret (п. 7.e):**

```powershell
kubectl get secrets -n task-manager -l owner=helm

```

```text
NAME                                  TYPE                 DATA   AGE
sh.helm.release.v1.task-manager.v1    helm.sh/release.v1   1      3s

```

---

### Пункт 8. Демонстрація повного життєвого циклу релізу

**1. Оновлення релізу через `--set` (п. 8.a):**

```powershell
helm upgrade task-manager ./helm/task-manager -f ./helm/task-manager/values-dev.yaml --set image.server.tag=1.1.0 -n task-manager

```

**2. Перехід на Production-конфігурацію (п. 8.b):**

```powershell
helm upgrade task-manager ./helm/task-manager -f ./helm/task-manager/values-prod.yaml -n task-manager

```

**3. Перегляд історії ревізій (п. 8.c):**

```powershell
helm history task-manager -n task-manager

```

```text
REVISION    UPDATED                     STATUS      CHART               APP VERSION DESCRIPTION     
1           Wed Oct  7 20:32:14 2026    superseded  task-manager-0.1.0  1.0.0       Install complete
2           Wed Oct  7 20:33:06 2026    superseded  task-manager-0.1.0  1.0.0       Upgrade complete
3           Wed Oct  7 20:33:07 2026    deployed    task-manager-0.1.0  1.0.0       Upgrade complete

```

**4. Виконання відкату (Rollback) на ревізію №1 (п. 8.d):**

```powershell
helm rollback task-manager 1 -n task-manager

```

```text
Rollback was a success! Happy Helming!

```

**5. Повне видалення релізу (п. 8.e):**

```powershell
helm uninstall task-manager -n task-manager

```

---

### Пункт 9. Виконанне додаткове завдання (9.b: Додавання Helm Test)

До чарта додано шаблон `templates/tests/test-connection.yaml` з анотацією `"helm.sh/hook": test`.

Тест запускає контейнер `busybox`, який за допомогою `wget` перевіряє доступність HTTP-ендпоінта клієнтського сервісу `task-manager-client-service`.

**Команда виконання тесту:**

```powershell
helm test task-manager -n task-manager

```

**Результат виконання у консолі:**

```text
NAME: task-manager
LAST DEPLOYED: Wed Oct  7 20:58:46 2026
NAMESPACE: task-manager
STATUS: deployed
REVISION: 3
DESCRIPTION: Upgrade complete
TEST SUITE:     task-manager-test-connection
Last Started:   Wed Oct  7 21:04:07 2026
Last Completed: Wed Oct  7 21:04:10 2026
Phase:          Succeeded

```

---

## 🎯 Висновки

У результаті виконання Лабораторної роботи №4 K8s-маніфести проєкту успішно перенесено в структурований Helm 3 чарт. Забезпечено гнучкість налаштування для двох середовищ (`development` та `production`), підтверджено повний цикл управління релізами (встановлення, оновлення параметрів, rollback) та автоматизовано тестування інфраструктурної доступності за допомогою Helm Test Hooks.