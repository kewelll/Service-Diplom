#!/usr/bin/env bash
# Лаунчер веб-приложения КомпСервис.
# Двойной клик по этому файлу → открывается Терминал →
# при первом запуске всё ставится автоматически → запускается сервер.

set -e
cd "$(dirname "$0")/repair-service"

echo ""
echo "============================================"
echo "  КомпСервис — система сервисного центра"
echo "============================================"
echo ""

# Проверка Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Не найден Node.js."
  echo "   Установите Node.js версии 20 или новее с https://nodejs.org/"
  echo ""
  read -n1 -s -r -p "Нажмите любую клавишу для выхода..."
  exit 1
fi
echo "✓ Node.js $(node -v)"

# Файл окружения
if [ ! -f .env ]; then
  echo "→ Создаю .env (первый запуск)"
  cp .env.example .env
fi

# Установка зависимостей
if [ ! -d node_modules ]; then
  echo "→ Устанавливаю зависимости (первый запуск, 2–3 минуты)..."
  npm install
else
  echo "✓ Зависимости установлены"
fi

# База данных и демо-данные
if [ ! -s prisma/dev.db ]; then
  echo "→ Создаю базу данных..."
  npx prisma db push
  echo "→ Наполняю демонстрационными данными..."
  npm run seed
else
  echo "✓ База данных готова"
fi

echo ""
echo "============================================"
echo "  Сервер запускается."
echo "  Откройте в браузере: http://localhost:3000"
echo "  (если порт занят — смотрите URL в логах ниже)"
echo ""
echo "  Демо-аккаунты:"
echo "    Администратор: admin@remont.ru  / admin123"
echo "    Мастер:        master@remont.ru / master123"
echo "    Клиент:        client@remont.ru / client123"
echo ""
echo "  Чтобы остановить — нажмите Ctrl+C"
echo "============================================"
echo ""

npm run dev
