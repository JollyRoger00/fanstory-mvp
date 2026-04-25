import type { Locale } from "@/lib/i18n/config";
import { APP_NAME } from "@/lib/site";

type FooterLink = {
  href: string;
  label: string;
};

type PricingTier = {
  name: string;
  price: string;
  description: string;
};

type ContactField = {
  label: string;
  value: string;
};

type ArticleSection = {
  title: string;
  paragraphs: string[];
  items?: string[];
};

type PublicPage = {
  eyebrow: string;
  title: string;
  lead: string;
};

export type PublicSiteContent = {
  footer: {
    summary: string;
    linksTitle: string;
    supportTitle: string;
    contactLine: string;
    links: FooterLink[];
    reserved: string;
  };
  pricing: PublicPage & {
    serviceTitle: string;
    serviceDescription: string;
    freeAccessTitle: string;
    freeAccessDescription: string;
    chapterPacksTitle: string;
    subscriptionsTitle: string;
    serviceDeliveryTitle: string;
    packs: PricingTier[];
    subscriptions: PricingTier[];
    fulfillmentNotes: string[];
  };
  contacts: PublicPage & {
    detailsTitle: string;
    details: ContactField[];
    note: string;
  };
  offer: PublicPage & {
    sections: ArticleSection[];
  };
  privacy: PublicPage & {
    sections: ArticleSection[];
  };
  terms: PublicPage & {
    sections: ArticleSection[];
  };
};

const contactPlaceholdersRu: ContactField[] = [
  { label: "Исполнитель", value: "[УКАЖИТЕ ФИО]" },
  { label: "Статус", value: "самозанятый" },
  { label: "ИНН", value: "[УКАЖИТЕ ИНН]" },
  { label: "Email", value: "[УКАЖИТЕ EMAIL]" },
  { label: "Телефон", value: "[УКАЖИТЕ ТЕЛЕФОН]" },
  { label: "Сайт", value: "https://adalshe.ru" },
];

const contactPlaceholdersEn: ContactField[] = [
  { label: "Provider", value: "[FULL NAME]" },
  { label: "Status", value: "self-employed" },
  { label: "Tax ID", value: "[TAX ID]" },
  { label: "Email", value: "[EMAIL]" },
  { label: "Phone", value: "[PHONE]" },
  { label: "Website", value: "https://adalshe.ru" },
];

const ruContent: PublicSiteContent = {
  footer: {
    summary:
      "Публичные страницы сервиса интерактивных AI-историй для пользователей и проверки платежной интеграции.",
    linksTitle: "Публичные страницы",
    supportTitle: "Контакты",
    contactLine: "Сайт: adalshe.ru",
    links: [
      { href: "/pricing", label: "Тарифы" },
      { href: "/contacts", label: "Контакты" },
      { href: "/offer", label: "Оферта" },
      { href: "/privacy", label: "Конфиденциальность" },
      { href: "/terms", label: "Пользовательское соглашение" },
    ],
    reserved: "Все права защищены.",
  },
  pricing: {
    eyebrow: "Тарифы",
    title: "Тарифы и описание услуги",
    lead:
      "«А дальше?» — сервис генерации интерактивных AI-историй. Пользователь создаёт историю, делает выборы и получает новые главы в личном кабинете.",
    serviceTitle: "Как работает сервис",
    serviceDescription:
      "После регистрации пользователь получает доступ к созданию и продолжению AI-историй. Новые главы открываются в аккаунте автоматически, а купленные главы и подписки зачисляются без ручной обработки.",
    freeAccessTitle: "Бесплатный старт",
    freeAccessDescription:
      "Первые 10 глав доступны бесплатно после регистрации.",
    chapterPacksTitle: "Пакеты глав",
    subscriptionsTitle: "Подписки",
    serviceDeliveryTitle: "Порядок оказания услуги",
    packs: [
      {
        name: "10 глав",
        price: "200 ₽",
        description:
          "Разовая покупка для продолжения одной или нескольких историй.",
      },
      {
        name: "50 глав",
        price: "799 ₽",
        description:
          "Подходит для длинных сюжетов и нескольких параллельных веток.",
      },
      {
        name: "100 глав",
        price: "1299 ₽",
        description:
          "Максимальный пакет для активного использования сервиса.",
      },
    ],
    subscriptions: [
      {
        name: "Месяц",
        price: "1499 ₽",
        description: "25 глав в день с ежемесячной оплатой.",
      },
      {
        name: "Год",
        price: "5999 ₽",
        description: "25 глав в день по сниженной годовой стоимости.",
      },
    ],
    fulfillmentNotes: [
      "После оплаты главы зачисляются на аккаунт пользователя автоматически.",
      "Пользователь получает доступ к генерации и продолжению интерактивных историй в личном кабинете.",
      "Услуга оказывается в электронном виде. Физическая доставка не осуществляется.",
    ],
  },
  contacts: {
    eyebrow: "Контакты",
    title: "Реквизиты исполнителя",
    lead:
      "Публичная страница с контактами и реквизитами исполнителя для пользователей и проверки платёжной интеграции.",
    detailsTitle: "Реквизиты",
    details: contactPlaceholdersRu,
    note:
      "Перед отправкой сайта на модерацию замените плейсхолдеры на реальные реквизиты исполнителя.",
  },
  offer: {
    eyebrow: "Оферта",
    title: "Публичная оферта",
    lead:
      "Настоящая оферта регулирует порядок использования цифрового сервиса интерактивных AI-историй, а также покупку пакетов глав и подписок.",
    sections: [
      {
        title: "1. Общие положения",
        paragraphs: [
          `Настоящий документ является предложением заключить договор на использование сервиса ${APP_NAME} на условиях, изложенных ниже.`,
          "Оплата услуги означает полное и безоговорочное принятие условий оферты.",
        ],
      },
      {
        title: "2. Предмет услуги",
        paragraphs: [
          `${APP_NAME} предоставляет пользователю цифровой доступ к генерации, чтению и продолжению интерактивных AI-историй.`,
          "Услуга оказывается исключительно в электронном виде через личный кабинет пользователя. Физическая доставка не осуществляется.",
        ],
      },
      {
        title: "3. Регистрация и доступ",
        paragraphs: [
          "Для использования сервиса пользователь проходит регистрацию и авторизацию доступными на сайте способами.",
          "Пользователь обязуется указывать актуальные данные аккаунта и не передавать доступ третьим лицам.",
        ],
      },
      {
        title: "4. Порядок оплаты",
        paragraphs: [
          "Актуальные тарифы, пакеты глав и подписки опубликованы на странице /pricing и являются частью настоящей оферты.",
          "Оплата осуществляется в безналичной форме через подключённого платёжного провайдера.",
        ],
      },
      {
        title: "5. Порядок предоставления глав",
        paragraphs: [
          "После успешной оплаты соответствующее количество глав или доступ по подписке автоматически зачисляется на аккаунт пользователя.",
          "Пользователь получает доступ к генерации новых глав и продолжению историй в пределах оплаченного доступа.",
        ],
      },
      {
        title: "6. Возвраты",
        paragraphs: [
          "Пользователь вправе обратиться с запросом на возврат денежных средств по контактам исполнителя.",
          "Запрос рассматривается индивидуально с учётом того, был ли цифровой доступ фактически предоставлен и были ли оплаченные главы уже использованы.",
          "Если цифровая услуга уже оказана полностью или частично, исполнитель вправе отказать в возврате либо уменьшить сумму возврата пропорционально использованному объёму доступа.",
        ],
      },
      {
        title: "7. Ограничение ответственности",
        paragraphs: [
          "Исполнитель не несёт ответственности за временную недоступность сервиса по причинам, не зависящим от него, включая сбои инфраструктуры, внешних API и платёжных провайдеров.",
          "Исполнитель не гарантирует соответствие сгенерированного контента субъективным ожиданиям пользователя.",
        ],
      },
      {
        title: "8. Контакты исполнителя",
        paragraphs: [
          "Контакты исполнителя размещены на странице /contacts и являются неотъемлемой частью оферты.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Конфиденциальность",
    title: "Политика конфиденциальности",
    lead:
      "Политика описывает, какие данные собирает сервис, для чего они используются и как пользователь может обратиться по вопросам обработки персональных данных.",
    sections: [
      {
        title: "1. Какие данные мы обрабатываем",
        paragraphs: [
          "При входе через Google OAuth сервис получает и обрабатывает данные, переданные провайдером авторизации, включая имя пользователя и адрес электронной почты.",
          "В процессе использования сервиса мы также храним созданные пользователем истории, главы, сохранения, данные о покупках и технические записи, связанные с работой аккаунта.",
        ],
      },
      {
        title: "2. Для чего используются данные",
        paragraphs: [
          "Данные используются для создания и обслуживания аккаунта, синхронизации прогресса, начисления бесплатных и оплаченных глав, а также для поддержки пользователей.",
          "Технические данные и журналы могут использоваться для диагностики ошибок, предотвращения злоупотреблений и обеспечения безопасности сервиса.",
        ],
      },
      {
        title: "3. Хранение историй и пользовательского контента",
        paragraphs: [
          "Созданные пользователем истории, главы, выборы и сохранения хранятся в инфраструктуре сервиса и привязываются к аккаунту пользователя.",
          "Эти данные необходимы для работы продукта и повторного доступа к историям из личного кабинета.",
        ],
      },
      {
        title: "4. Платёжные данные",
        paragraphs: [
          "Платёжные данные пользователя обрабатываются платёжным провайдером и не хранятся сервисом в полном объёме данных банковской карты.",
          "Сервис может хранить только технические сведения о платеже: идентификатор, статус, оплаченный продукт и служебные данные, необходимые для предоставления доступа.",
        ],
      },
      {
        title: "5. Передача данных третьим лицам",
        paragraphs: [
          "Данные могут передаваться только тем сервисам и подрядчикам, которые необходимы для работы сайта, авторизации пользователей, генерации контента и обработки платежей.",
          "Исполнитель не продаёт персональные данные пользователя третьим лицам.",
        ],
      },
      {
        title: "6. Обращения пользователя",
        paragraphs: [
          "Пользователь может направить запрос по вопросам обработки данных, исправления контактной информации или удаления аккаунта по контактам исполнителя.",
          "Контакты для обращений размещены на странице /contacts.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Соглашение",
    title: "Пользовательское соглашение",
    lead:
      "Соглашение определяет правила использования сервиса интерактивных AI-историй, допустимое поведение пользователей и основания для ограничения доступа.",
    sections: [
      {
        title: "1. Использование сервиса",
        paragraphs: [
          `Сервис ${APP_NAME} предназначен для создания, чтения и продолжения интерактивных AI-историй через личный кабинет пользователя.`,
          "Пользователь обязуется использовать сервис добросовестно и в соответствии с применимым законодательством.",
        ],
      },
      {
        title: "2. Запрещённый контент и действия",
        paragraphs: [
          "Пользователю запрещено использовать сервис для создания, хранения, публикации или распространения незаконного, вредоносного или нарушающего права третьих лиц контента.",
        ],
        items: [
          "незаконный, мошеннический или вводящий в заблуждение контент;",
          "контент, нарушающий авторские права, права на изображение или иные права третьих лиц;",
          "попытки взлома, обхода ограничений или автоматизированного злоупотребления сервисом;",
          "спам, фишинг и иная вредоносная активность.",
        ],
      },
      {
        title: "3. Возрастные и контентные ограничения",
        paragraphs: [
          "Пользователь самостоятельно оценивает допустимость создаваемого и читаемого контента с учётом своего возраста и требований законодательства страны пребывания.",
          "Исполнитель вправе ограничивать отдельные сценарии использования, если они связаны с недопустимыми темами, злоупотреблением сервисом или жалобами третьих лиц.",
        ],
      },
      {
        title: "4. Платный цифровой доступ",
        paragraphs: [
          "Часть функциональности сервиса предоставляется на платной основе в виде пакетов глав и подписок.",
          "После оплаты цифровой доступ предоставляется автоматически внутри аккаунта пользователя, без физической доставки.",
        ],
      },
      {
        title: "5. Блокировка и ограничение доступа",
        paragraphs: [
          "Исполнитель вправе временно ограничить или полностью заблокировать доступ при нарушении условий соглашения, подозрении на мошенничество, злоупотреблении платёжной системой или попытках повлиять на стабильность сервиса.",
          "При серьёзном или повторном нарушении обслуживание может быть прекращено без предварительного уведомления.",
        ],
      },
      {
        title: "6. Ограничение гарантий",
        paragraphs: [
          "Сервис предоставляется по модели as is в той мере, в какой это допускается применимым правом.",
          "Исполнитель не гарантирует бесперебойную и безошибочную работу сервиса в каждый момент времени, но принимает разумные меры для поддержания его доступности.",
        ],
      },
      {
        title: "7. Контакты",
        paragraphs: [
          "По вопросам использования сервиса, жалобам и обращениям пользователь может связаться с исполнителем по контактам, размещённым на странице /contacts.",
        ],
      },
    ],
  },
};

const enContent: PublicSiteContent = {
  footer: {
    summary:
      "Public pages of the interactive AI story service for users and payment moderation.",
    linksTitle: "Public pages",
    supportTitle: "Contacts",
    contactLine: "Website: adalshe.ru",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/contacts", label: "Contacts" },
      { href: "/offer", label: "Offer" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
    reserved: "All rights reserved.",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Pricing and service description",
    lead:
      `${APP_NAME} is an interactive AI story service. Users create stories, make choices, and receive new chapters inside their account dashboard.`,
    serviceTitle: "How the service works",
    serviceDescription:
      "After registration, the user can create and continue AI stories. New chapters appear in the account automatically, and paid chapters or subscriptions are credited without manual processing.",
    freeAccessTitle: "Free starter access",
    freeAccessDescription: "The first 10 chapters are free after registration.",
    chapterPacksTitle: "Chapter packs",
    subscriptionsTitle: "Subscriptions",
    serviceDeliveryTitle: "Service delivery",
    packs: [
      {
        name: "10 chapters",
        price: "200 ₽",
        description: "One-time purchase for continuing one or more stories.",
      },
      {
        name: "50 chapters",
        price: "799 ₽",
        description: "Suitable for longer plots and several story branches.",
      },
      {
        name: "100 chapters",
        price: "1299 ₽",
        description: "The largest pack for active service usage.",
      },
    ],
    subscriptions: [
      {
        name: "1 month",
        price: "1499 ₽",
        description: "25 chapters per day with monthly billing.",
      },
      {
        name: "1 year",
        price: "5999 ₽",
        description: "25 chapters per day with discounted yearly billing.",
      },
    ],
    fulfillmentNotes: [
      "After payment, chapters are credited to the user account automatically.",
      "The user receives access to generate and continue interactive stories in the personal dashboard.",
      "The service is delivered digitally. No physical delivery is provided.",
    ],
  },
  contacts: {
    eyebrow: "Contacts",
    title: "Provider details",
    lead:
      "Public page with contact details and provider information for users and payment moderation.",
    detailsTitle: "Details",
    details: contactPlaceholdersEn,
    note:
      "Replace the placeholders with real provider details before sending the site for moderation.",
  },
  offer: {
    eyebrow: "Offer",
    title: "Public offer",
    lead:
      "This public offer governs the use of the digital interactive AI story service and the purchase of chapter packs and subscriptions.",
    sections: [
      {
        title: "1. General terms",
        paragraphs: [
          `This document is an offer by the provider to enter into an agreement for the use of ${APP_NAME} under the terms below.`,
          "Payment for the service means full acceptance of this offer.",
        ],
      },
      {
        title: "2. Subject of the service",
        paragraphs: [
          `${APP_NAME} provides digital access to generating, reading, and continuing interactive AI stories.`,
          "The service is delivered only in electronic form through the user's dashboard. No physical delivery is provided.",
        ],
      },
      {
        title: "3. Registration and access",
        paragraphs: [
          "To use the service, the user must register and sign in through the supported authentication methods.",
          "The user must keep account data up to date and must not share account access with third parties.",
        ],
      },
      {
        title: "4. Payment procedure",
        paragraphs: [
          "Current prices, chapter packs, and subscriptions are listed on /pricing and are an integral part of this offer.",
          "Payments are made in cashless form through the payment provider connected to the website.",
        ],
      },
      {
        title: "5. Delivery of chapters",
        paragraphs: [
          "After successful payment, the corresponding number of chapters or subscription access is credited to the user account automatically.",
          "The user receives access to generate new chapters and continue stories within the paid access limits.",
        ],
      },
      {
        title: "6. Refunds",
        paragraphs: [
          "The user may request a refund using the provider contacts.",
          "Each request is reviewed individually based on whether the digital access was already granted and whether the paid chapters were already used.",
          "If the digital service was already provided fully or partially, the provider may decline the refund or reduce it proportionally to the used access.",
        ],
      },
      {
        title: "7. Limitation of liability",
        paragraphs: [
          "The provider is not liable for temporary service unavailability caused by factors beyond its control, including infrastructure issues, external APIs, and payment providers.",
          "The provider does not guarantee that generated content will match the user's subjective expectations.",
        ],
      },
      {
        title: "8. Provider contacts",
        paragraphs: [
          "Provider contacts are published on /contacts and form an integral part of this offer.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Privacy policy",
    lead:
      "This policy explains what data the service processes, why it is used, and how users can contact the provider about personal data matters.",
    sections: [
      {
        title: "1. Data we process",
        paragraphs: [
          "When users sign in with Google OAuth, the service receives and processes the data provided by the authentication provider, including the user's name and email address.",
          "While using the service, we also store user-created stories, chapters, saves, payment-related records, and technical logs related to account operations.",
        ],
      },
      {
        title: "2. Purpose of processing",
        paragraphs: [
          "Data is used to create and maintain the account, sync progress, grant free and paid chapters, and provide user support.",
          "Technical data and logs may also be used to diagnose errors, prevent abuse, and protect the service.",
        ],
      },
      {
        title: "3. Story and content storage",
        paragraphs: [
          "User-created stories, chapters, choices, and saves are stored in the service infrastructure and linked to the user's account.",
          "This data is required for the product to function and for users to access their stories later.",
        ],
      },
      {
        title: "4. Payment data",
        paragraphs: [
          "Payment data is processed by the payment provider and is not stored by the service in the full scope of bank card details.",
          "The service may store only technical payment information such as the payment identifier, status, product, and service data needed to grant access.",
        ],
      },
      {
        title: "5. Sharing with third parties",
        paragraphs: [
          "Data may be shared only with services and contractors necessary to run the website, authorize users, generate content, and process payments.",
          "The provider does not sell users' personal data to third parties.",
        ],
      },
      {
        title: "6. User requests",
        paragraphs: [
          "Users may send requests related to personal data, contact data correction, or account deletion using the provider contacts.",
          "Provider contacts for such requests are published on /contacts.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Terms",
    title: "User agreement",
    lead:
      "This agreement defines the rules for using the interactive AI story service, acceptable conduct, and the grounds for restricting access.",
    sections: [
      {
        title: "1. Use of the service",
        paragraphs: [
          `${APP_NAME} is intended for creating, reading, and continuing interactive AI stories through the user's dashboard.`,
          "Users must use the service in good faith and in compliance with applicable law.",
        ],
      },
      {
        title: "2. Prohibited content and actions",
        paragraphs: [
          "Users may not use the service to create, store, publish, or distribute illegal content, harmful materials, infringements of third-party rights, or any other unlawful activity.",
        ],
        items: [
          "illegal, fraudulent, or misleading content;",
          "content that violates copyright, image rights, or other third-party rights;",
          "attempts to hack the service, bypass restrictions, or abuse automation;",
          "spam, phishing, or other malicious use of the service.",
        ],
      },
      {
        title: "3. Age and content restrictions",
        paragraphs: [
          "Users must independently assess whether the generated or consumed content is appropriate for their age and local legal requirements.",
          "The provider may restrict certain uses if they involve unacceptable themes, abuse, or third-party complaints.",
        ],
      },
      {
        title: "4. Paid digital access",
        paragraphs: [
          "Part of the service functionality is paid and provided through chapter packs and subscriptions.",
          "After payment, digital access is granted automatically inside the user account, with no physical delivery.",
        ],
      },
      {
        title: "5. Suspension and blocking",
        paragraphs: [
          "The provider may temporarily restrict or permanently block access in case of violations, suspected fraud, payment abuse, or attempts to affect service stability.",
          "For serious or repeated violations, the provider may terminate access without prior notice.",
        ],
      },
      {
        title: "6. Warranty disclaimer",
        paragraphs: [
          "The service is provided on an as is basis to the extent permitted by applicable law.",
          "The provider does not guarantee uninterrupted or error-free availability at all times, but takes reasonable steps to maintain the service.",
        ],
      },
      {
        title: "7. Contacts",
        paragraphs: [
          "For questions, complaints, or service-related requests, users may contact the provider using the details published on /contacts.",
        ],
      },
    ],
  },
};

export function getPublicSiteContent(locale: Locale) {
  return locale === "ru" ? ruContent : enContent;
}
