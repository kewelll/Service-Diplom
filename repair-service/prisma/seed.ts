import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";
import crypto from "node:crypto";
import "dotenv/config";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function daysAgo(d: number, h = 10): Date {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(h, 0, 0, 0);
  return date;
}

async function main() {
  console.log("Очистка базы данных...");
  // Порядок удаления важен из-за внешних ключей.
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.orderService.deleteMany();
  await prisma.orderPart.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.part.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  // Сброс счётчиков автоинкремента, чтобы идентификаторы начинались с 1.
  await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence");

  console.log("Создание пользователей...");
  const admin = await prisma.user.create({
    data: {
      fullName: "Администратор Сервиса",
      email: "admin@remont.ru",
      phone: "+7 (3843) 50-10-00",
      role: "ADMIN",
      passwordHash: hashPassword("admin123"),
    },
  });

  const master1 = await prisma.user.create({
    data: {
      fullName: "Иванов Сергей Петрович",
      email: "master@remont.ru",
      phone: "+7 (913) 100-20-30",
      role: "MASTER",
      passwordHash: hashPassword("master123"),
    },
  });
  const master2 = await prisma.user.create({
    data: {
      fullName: "Кузнецов Дмитрий Андреевич",
      email: "master2@remont.ru",
      phone: "+7 (913) 100-20-31",
      role: "MASTER",
      passwordHash: hashPassword("master123"),
    },
  });
  const master3 = await prisma.user.create({
    data: {
      fullName: "Соколова Анна Викторовна",
      email: "master3@remont.ru",
      phone: "+7 (913) 100-20-32",
      role: "MASTER",
      passwordHash: hashPassword("master123"),
    },
  });

  const client1 = await prisma.user.create({
    data: {
      fullName: "Петров Иван Сергеевич",
      email: "client@remont.ru",
      phone: "+7 (923) 555-11-22",
      role: "CLIENT",
      passwordHash: hashPassword("client123"),
    },
  });
  const client2 = await prisma.user.create({
    data: {
      fullName: "Смирнова Елена Александровна",
      email: "client2@remont.ru",
      phone: "+7 (923) 555-33-44",
      role: "CLIENT",
      passwordHash: hashPassword("client123"),
    },
  });
  const client3 = await prisma.user.create({
    data: {
      fullName: "Морозов Алексей Николаевич",
      email: "client3@remont.ru",
      phone: "+7 (923) 555-55-66",
      role: "CLIENT",
      passwordHash: hashPassword("client123"),
    },
  });

  console.log("Создание категорий техники...");
  const catLaptop = await prisma.category.create({
    data: { name: "Ноутбуки", description: "Ноутбуки, ультрабуки, нетбуки" },
  });
  const catPc = await prisma.category.create({
    data: { name: "Персональные компьютеры", description: "Настольные ПК, моноблоки" },
  });
  const catPrinter = await prisma.category.create({
    data: { name: "Принтеры и МФУ", description: "Лазерные и струйные принтеры, МФУ" },
  });
  const catMonitor = await prisma.category.create({
    data: { name: "Мониторы", description: "ЖК-мониторы, дисплеи" },
  });
  const catPeriph = await prisma.category.create({
    data: { name: "Периферия", description: "Клавиатуры, мыши, источники питания" },
  });

  console.log("Создание прайс-листа услуг...");
  const svc = await Promise.all(
    [
      ["Диагностика неисправности", catLaptop.id, 500, 1, "Выявление причины неисправности устройства"],
      ["Чистка системы охлаждения с заменой термопасты", catLaptop.id, 1500, 2, "Разборка, чистка от пыли, замена термопасты"],
      ["Замена матрицы ноутбука", catLaptop.id, 2500, 2, "Стоимость работ без учёта матрицы"],
      ["Замена клавиатуры ноутбука", catLaptop.id, 1200, 1, "Демонтаж и установка клавиатурного модуля"],
      ["Восстановление после залития", catLaptop.id, 3000, 4, "Чистка платы, восстановление дорожек"],
      ["Замена аккумулятора", catLaptop.id, 1000, 1, "Установка нового аккумулятора"],
      ["Сборка ПК из комплектующих", catPc.id, 2000, 2, "Сборка и первичная настройка"],
      ["Чистка ПК от пыли", catPc.id, 1000, 1, "Чистка корпуса и компонентов"],
      ["Установка операционной системы", catPc.id, 1500, 2, "Установка и базовая настройка ОС"],
      ["Удаление вирусов и настройка ПО", catPc.id, 1200, 2, "Лечение системы, настройка защиты"],
      ["Ремонт блока питания ПК", catPc.id, 1800, 2, "Диагностика и ремонт БП"],
      ["Ремонт узла подачи бумаги принтера", catPrinter.id, 1600, 2, "Замена роликов, чистка тракта"],
      ["Заправка картриджа", catPrinter.id, 600, 1, "Заправка лазерного картриджа"],
      ["Восстановление печатающей головки", catPrinter.id, 2200, 3, "Промывка и восстановление головки"],
      ["Ремонт блока питания монитора", catMonitor.id, 1700, 2, "Замена конденсаторов, диагностика"],
      ["Замена подсветки матрицы монитора", catMonitor.id, 2400, 3, "Замена LED-подсветки"],
      ["Перенос данных и резервное копирование", catPc.id, 800, 1, "Копирование пользовательских данных"],
    ].map(([name, categoryId, price, durationH, description]) =>
      prisma.service.create({
        data: {
          name: name as string,
          categoryId: categoryId as number,
          price: price as number,
          durationH: durationH as number,
          description: description as string,
        },
      })
    )
  );
  const byName = (n: string) => svc.find((s) => s.name.startsWith(n))!;

  console.log("Создание склада запчастей...");
  const part = await Promise.all(
    [
      ["SSD-накопитель 512 ГБ", "SSD-512", 4500, 20],
      ["Оперативная память DDR4 8 ГБ", "RAM-DDR4-8", 2800, 15],
      ["Матрица ноутбука 15.6\" FHD", "LCD-156-FHD", 6500, 6],
      ["Клавиатура ноутбука (универсальная)", "KB-UNI", 1800, 10],
      ["Аккумулятор ноутбука", "BAT-NB", 3200, 8],
      ["Термопаста (шприц)", "TP-01", 350, 50],
      ["Блок питания ноутбука 65 Вт", "PSU-NB-65", 1900, 12],
      ["Блок питания ATX 500 Вт", "PSU-ATX-500", 3500, 7],
      ["Кулер процессорный", "CLR-CPU", 1500, 9],
      ["Ролик подачи бумаги", "ROLL-01", 700, 25],
      ["Картридж лазерный (совместимый)", "CRT-LAS", 1400, 18],
      ["Печатающая головка", "PHEAD-01", 4200, 4],
      ["Шлейф матрицы", "FLEX-LCD", 900, 14],
      ["Батарейка CMOS", "CMOS-CR2032", 120, 60],
    ].map(([name, sku, price, stock]) =>
      prisma.part.create({
        data: { name: name as string, sku: sku as string, price: price as number, stock: stock as number },
      })
    )
  );
  const partByName = (n: string) => part.find((p) => p.name.startsWith(n))!;

  console.log("Создание заказов...");
  let counter = 0;
  const num = () => `2026-${String(++counter).padStart(6, "0")}`;

  // Вспомогательная функция создания заказа со связанными данными.
  async function makeOrder(opts: {
    client: number;
    master?: number;
    category: number;
    deviceType: string;
    brand?: string;
    model?: string;
    serial?: string;
    problem: string;
    diagnosis?: string;
    status: "NEW" | "DIAGNOSTICS" | "APPROVAL" | "IN_PROGRESS" | "READY" | "ISSUED" | "CANCELED";
    createdDaysAgo: number;
    services?: { name: string; qty?: number }[];
    parts?: { name: string; qty?: number }[];
    comments?: { author: number; text: string; internal?: boolean }[];
    review?: { rating: number; text: string };
    estimatedCost?: number;
  }) {
    const services = opts.services ?? [];
    const parts = opts.parts ?? [];
    let total = 0;
    const svcData = services.map((s) => {
      const item = byName(s.name);
      const qty = s.qty ?? 1;
      total += item.price * qty;
      return { serviceId: item.id, quantity: qty, price: item.price };
    });
    const partData = parts.map((p) => {
      const item = partByName(p.name);
      const qty = p.qty ?? 1;
      total += item.price * qty;
      return { partId: item.id, quantity: qty, price: item.price };
    });

    const flow: Record<string, string[]> = {
      NEW: ["NEW"],
      DIAGNOSTICS: ["NEW", "DIAGNOSTICS"],
      APPROVAL: ["NEW", "DIAGNOSTICS", "APPROVAL"],
      IN_PROGRESS: ["NEW", "DIAGNOSTICS", "APPROVAL", "IN_PROGRESS"],
      READY: ["NEW", "DIAGNOSTICS", "APPROVAL", "IN_PROGRESS", "READY"],
      ISSUED: ["NEW", "DIAGNOSTICS", "APPROVAL", "IN_PROGRESS", "READY", "ISSUED"],
      CANCELED: ["NEW", "DIAGNOSTICS", "CANCELED"],
    };
    const steps = flow[opts.status];
    const created = daysAgo(opts.createdDaysAgo);

    const order = await prisma.order.create({
      data: {
        number: num(),
        clientId: opts.client,
        masterId: opts.master ?? null,
        categoryId: opts.category,
        deviceType: opts.deviceType,
        deviceBrand: opts.brand ?? null,
        deviceModel: opts.model ?? null,
        serialNumber: opts.serial ?? null,
        problem: opts.problem,
        diagnosis: opts.diagnosis ?? null,
        status: opts.status,
        estimatedCost: opts.estimatedCost ?? null,
        // Итог считается, когда по заказу уже подобраны услуги/запчасти.
        totalCost: total,
        createdAt: created,
        deadline: ["APPROVAL", "IN_PROGRESS", "READY"].includes(opts.status)
          ? daysAgo(opts.createdDaysAgo - 5)
          : null,
        closedAt: opts.status === "ISSUED" ? daysAgo(Math.max(0, opts.createdDaysAgo - 6)) : null,
        services: { create: svcData },
        parts: { create: partData },
        history: {
          create: steps.map((st, i) => ({
            status: st as never,
            changedById: i === 0 ? opts.client : opts.master ?? admin.id,
            comment:
              i === 0
                ? "Заявка создана"
                : st === "CANCELED"
                ? "Клиент отказался от ремонта"
                : undefined,
            createdAt: daysAgo(opts.createdDaysAgo - i),
          })),
        },
      },
    });

    for (const c of opts.comments ?? []) {
      await prisma.comment.create({
        data: {
          orderId: order.id,
          authorId: c.author,
          text: c.text,
          isInternal: c.internal ?? false,
          createdAt: daysAgo(opts.createdDaysAgo - 1),
        },
      });
    }

    if (opts.review) {
      await prisma.review.create({
        data: {
          orderId: order.id,
          clientId: opts.client,
          rating: opts.review.rating,
          text: opts.review.text,
          createdAt: daysAgo(Math.max(0, opts.createdDaysAgo - 7)),
        },
      });
    }
    return order;
  }

  await makeOrder({
    client: client1.id,
    category: catLaptop.id,
    deviceType: "Ноутбук",
    brand: "ASUS",
    model: "VivoBook X512",
    serial: "ASX512-77123",
    problem: "Сильно шумит вентилятор, ноутбук перегревается и выключается.",
    status: "NEW",
    createdDaysAgo: 0,
  });

  await makeOrder({
    client: client2.id,
    master: master1.id,
    category: catLaptop.id,
    deviceType: "Ноутбук",
    brand: "Lenovo",
    model: "IdeaPad 3",
    serial: "LN-IP3-55021",
    problem: "Не включается после скачка напряжения.",
    diagnosis: "Неисправен блок питания, требуется замена.",
    status: "DIAGNOSTICS",
    createdDaysAgo: 2,
    comments: [
      { author: master1.id, text: "Принят на диагностику, проверяю цепь питания.", internal: true },
    ],
  });

  await makeOrder({
    client: client1.id,
    master: master1.id,
    category: catPc.id,
    deviceType: "Персональный компьютер",
    brand: "DNS",
    model: "Home",
    problem: "Компьютер самопроизвольно перезагружается под нагрузкой.",
    diagnosis: "Вздулись конденсаторы блока питания. Рекомендована замена БП и чистка.",
    status: "APPROVAL",
    estimatedCost: 5300,
    createdDaysAgo: 4,
    services: [{ name: "Ремонт блока питания" }, { name: "Чистка ПК" }],
    parts: [{ name: "Блок питания ATX" }],
    comments: [{ author: master1.id, text: "Согласуйте, пожалуйста, замену блока питания." }],
  });

  await makeOrder({
    client: client3.id,
    master: master2.id,
    category: catPrinter.id,
    deviceType: "МФУ",
    brand: "HP",
    model: "LaserJet M428",
    serial: "HP-M428-9001",
    problem: "Зажёвывает бумагу, печать с полосами.",
    diagnosis: "Износ ролика подачи, загрязнение тракта подачи бумаги.",
    status: "IN_PROGRESS",
    estimatedCost: 2300,
    createdDaysAgo: 5,
    services: [{ name: "Ремонт узла подачи" }],
    parts: [{ name: "Ролик подачи" }],
    comments: [{ author: master2.id, text: "Замена ролика выполнена, тестирую печать.", internal: true }],
  });

  await makeOrder({
    client: client1.id,
    master: master1.id,
    category: catLaptop.id,
    deviceType: "Ноутбук",
    brand: "Acer",
    model: "Aspire 5",
    serial: "AC-A5-33410",
    problem: "Не заряжается, быстро разряжается батарея.",
    diagnosis: "Износ аккумулятора (ёмкость 18%). Требуется замена.",
    status: "READY",
    estimatedCost: 4200,
    createdDaysAgo: 7,
    services: [{ name: "Замена аккумулятора" }, { name: "Диагностика" }],
    parts: [{ name: "Аккумулятор ноутбука" }],
    comments: [{ author: master1.id, text: "Аккумулятор заменён, устройство готово к выдаче." }],
  });

  await makeOrder({
    client: client2.id,
    master: master3.id,
    category: catLaptop.id,
    deviceType: "Ноутбук",
    brand: "HP",
    model: "Pavilion 15",
    serial: "HP-PV15-22817",
    problem: "Медленно работает, не хватает памяти, шумит при нагрузке.",
    diagnosis: "Недостаточно ОЗУ и медленный HDD. Чистка СО, установка SSD и ОЗУ.",
    status: "ISSUED",
    estimatedCost: 9300,
    createdDaysAgo: 14,
    services: [
      { name: "Чистка системы охлаждения" },
      { name: "Перенос данных" },
      { name: "Установка операционной системы" },
    ],
    parts: [{ name: "SSD-накопитель" }, { name: "Оперативная память DDR4" }],
    review: { rating: 5, text: "Отличная работа, ноутбук стал быстрым. Спасибо мастеру!" },
    comments: [{ author: master3.id, text: "Работы выполнены, данные перенесены, ОС переустановлена." }],
  });

  await makeOrder({
    client: client3.id,
    master: master1.id,
    category: catPc.id,
    deviceType: "Персональный компьютер",
    brand: "Самосбор",
    problem: "После сборки не запускается, нет изображения.",
    diagnosis: "Неправильно установлена планка ОЗУ, не подключён доп. кабель питания.",
    status: "ISSUED",
    estimatedCost: 2000,
    createdDaysAgo: 20,
    services: [{ name: "Сборка ПК" }, { name: "Диагностика" }],
    review: { rating: 4, text: "Всё работает, но пришлось немного подождать." },
  });

  await makeOrder({
    client: client1.id,
    master: master2.id,
    category: catMonitor.id,
    deviceType: "Монитор",
    brand: "Samsung",
    model: "S24F350",
    problem: "Не включается, индикатор моргает.",
    diagnosis: "Вышел из строя блок питания (вздутые конденсаторы).",
    status: "ISSUED",
    estimatedCost: 1700,
    createdDaysAgo: 25,
    services: [{ name: "Ремонт блока питания монитора" }],
    review: { rating: 5, text: "Быстро и недорого починили монитор." },
  });

  await makeOrder({
    client: client2.id,
    master: master2.id,
    category: catPrinter.id,
    deviceType: "Принтер",
    brand: "Canon",
    model: "PIXMA G3411",
    problem: "Не печатает чёрным цветом.",
    diagnosis: "Засохла печатающая головка, восстановление невозможно — клиент отказался.",
    status: "CANCELED",
    createdDaysAgo: 10,
  });

  await makeOrder({
    client: client1.id,
    category: catPeriph.id,
    deviceType: "Источник бесперебойного питания",
    brand: "APC",
    model: "Back-UPS 650",
    problem: "Не держит заряд, пищит при отключении сети.",
    status: "NEW",
    createdDaysAgo: 1,
  });

  console.log("Создание уведомлений...");
  await prisma.notification.createMany({
    data: [
      { userId: client1.id, text: "Ваш заказ 2026-000005 готов к выдаче.", link: "/orders", isRead: false },
      { userId: client1.id, text: "Заказ 2026-000003 ожидает согласования стоимости.", link: "/orders", isRead: false },
      { userId: master1.id, text: "Вам назначен новый заказ 2026-000003.", link: "/master", isRead: true },
      { userId: client2.id, text: "Заказ 2026-000006 выдан. Оставьте отзыв о работе.", link: "/orders", isRead: false },
    ],
  });

  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    services: await prisma.service.count(),
    parts: await prisma.part.count(),
    orders: await prisma.order.count(),
    reviews: await prisma.review.count(),
  };
  console.log("Готово. Создано:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
