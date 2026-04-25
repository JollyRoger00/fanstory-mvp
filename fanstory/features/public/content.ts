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

const ruContent: PublicSiteContent = {
  footer: {
    summary:
      "Публичные страницы сервиса интерактивных AI-историй для пользователей и модерации платежей.",
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
      "А дальше? — сервис генерации интерактивных AI-историй. Пользователь создает историю, развивает сюжет выбором действий и получает новые главы в личном кабинете.",
    serviceTitle: "Как работает сервис",
    serviceDescription:
      "После регистрации пользователь получает доступ к созданию и продолжению AI-историй. Новые главы открываются автоматически после генерации, а оплаченные главы и подписки зачисляются на аккаунт без участия менеджера.",
    freeAccessTitle: "Бесплатный старт",
    freeAccessDescription:
      "Первые 10 глав доступны бесплатно после регистрации.",
    chapterPacksTitle: "Пакеты глав",
    subscriptionsTitle: "Подписки",
    packs: [
      {
        name: "10 глав",
        price: "200 ₽",
        description: "Разовая покупка для продолжения интерактивных историй.",
      },
      {
        name: "50 глав",
        price: "799 ₽",
        description: "Подходит для длинных сюжетных веток и нескольких историй.",
      },
      {
        name: "100 глав",
        price: "1499 ₽",
        description: "Расширенный пакет для активного использования сервиса.",
      },
    ],
    subscriptions: [
      {
        name: "Месяц",
        price: "1599 ₽",
        description: "Подписка дает 25 глав в день.",
      },
      {
        name: "Год",
        price: "5999 ₽",
        description: "Годовой план с доступом к 25 главам в день.",
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
      "Страница содержит публичные контактные данные и реквизиты исполнителя для пользователей и модерации платежного провайдера.",
    detailsTitle: "Реквизиты",
    details: [
      { label: "Исполнитель", value: "Ильясов Руслан Александрович" },
      { label: "Статус", value: "самозанятый" },
      { label: "ИНН", value: "[380806642556]" },
      { label: "Email", value: "[ggjgrgg@gmail.com]" },
      { label: "Телефон", value: "[+7 (983) 403-97-77]" },
      { label: "Сайт", value: "https://adalshe.ru" },
    ],
    note:
      "Замените placeholders на реальные реквизиты перед отправкой сайта на финальную модерацию и запуском приема платежей.",
  },
  offer: {
    eyebrow: "Оферта",
    title: "Публичная оферта",
    lead:
      "Настоящая оферта регулирует порядок использования цифрового сервиса интерактивных AI-историй и приобретения пакетов глав и подписок.",
    sections: [
      {
        title: "1. Общие положения",
        paragraphs: [
          `Настоящий документ является предложением исполнителя заключить договор на использование сервиса ${APP_NAME} на условиях, изложенных ниже.`,
          "Оплата услуг пользователем означает полное и безоговорочное принятие условий оферты.",
        ],
      },
      {
        title: "2. Предмет услуги",
        paragraphs: [
          `${APP_NAME} предоставляет пользователю доступ к цифровому сервису генерации и продолжения интерактивных AI-историй.`,
          "Услуга оказывается исключительно в электронном виде через личный кабинет пользователя. Физическая доставка товара или материального носителя не осуществляется.",
        ],
      },
      {
        title: "3. Регистрация и доступ",
        paragraphs: [
          "Для использования сервиса пользователь проходит регистрацию и авторизацию через поддерживаемые методы входа.",
          "Пользователь обязуется предоставлять актуальные данные аккаунта и не передавать доступ к нему третьим лицам.",
        ],
      },
      {
        title: "4. Тарифы и порядок оплаты",
        paragraphs: [
          "Актуальные тарифы, пакеты глав и подписки размещаются на странице /pricing и являются неотъемлемой частью настоящей оферты.",
          "Оплата осуществляется в безналичной форме с использованием платежного провайдера, подключенного на сайте исполнителя.",
        ],
      },
      {
        title: "5. Порядок предоставления глав",
        paragraphs: [
          "После успешной оплаты соответствующее количество глав или доступ по подписке автоматически зачисляется на аккаунт пользователя.",
          "Пользователь получает возможность генерировать новые главы и продолжать интерактивные истории в пределах оплаченного доступа.",
        ],
      },
      {
        title: "6. Возвраты",
        paragraphs: [
          "Пользователь вправе обратиться с запросом на возврат денежных средств по контактам исполнителя.",
          "Запрос рассматривается индивидуально с учетом того, была ли цифровая услуга фактически предоставлена, были ли начислены главы на аккаунт и были ли они использованы.",
          "Если цифровой доступ уже предоставлен и полностью или частично использован, исполнитель вправе отказать в возврате либо рассчитать сумму возврата пропорционально неиспользованному объему услуги.",
        ],
      },
      {
        title: "7. Ограничение ответственности",
        paragraphs: [
          "Исполнитель не несет ответственности за временную недоступность сервиса по причинам, не зависящим от него, включая сбои инфраструктуры, внешних API и платежных провайдеров.",
          "Исполнитель не гарантирует соответствие сгенерированного контента субъективным ожиданиям пользователя.",
        ],
      },
      {
        title: "8. Контакты исполнителя",
        paragraphs: [
          "Исполнитель: Ильясов Руслан Александрович.",
          "ИНН: 380806642556. Email: ggjgrgg@gmail.com. Телефон: [+7 (983) 403-97-77].",
          "Сайт сервиса: https://adalshe.ru.",
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
          "При регистрации и входе через Google OAuth сервис получает и обрабатывает данные, переданные провайдером авторизации, включая имя пользователя и адрес электронной почты.",
          "При использовании сервиса мы также храним созданные пользователем истории, сохранения, прогресс чтения, сведения о доступе к главам и технические записи, связанные с работой аккаунта.",
        ],
      },
      {
        title: "2. Для чего используются данные",
        paragraphs: [
          "Данные используются для создания и обслуживания аккаунта, предоставления доступа к историям, синхронизации прогресса, начисления бесплатных и оплаченных глав, а также для поддержки пользователей.",
          "Технические данные и журналы могут использоваться для диагностики ошибок, предотвращения злоупотреблений и обеспечения безопасности сервиса.",
        ],
      },
      {
        title: "3. Хранение историй и пользовательского контента",
        paragraphs: [
          "Созданные пользователем истории, главы, выборы и сохранения хранятся в инфраструктуре сервиса и привязываются к аккаунту пользователя.",
          "Пользователь соглашается с тем, что эти данные необходимы для функционирования продукта и повторного доступа к истории из личного кабинета.",
        ],
      },
      {
        title: "4. Платежные данные",
        paragraphs: [
          "Платежные данные пользователя обрабатываются платежным провайдером и не хранятся сервисом в полном объеме данных банковской карты.",
          "Сервис может хранить технические сведения о платеже: идентификатор платежа, статус, оплаченный продукт, сумму и служебные данные, необходимые для подтверждения доступа.",
        ],
      },
      {
        title: "5. Передача данных третьим лицам",
        paragraphs: [
          "Данные могут передаваться только тем сервисам и подрядчикам, которые необходимы для работы сайта, авторизации пользователей, генерации контента и обработки платежей.",
          "Исполнитель не продает персональные данные пользователя третьим лицам.",
        ],
      },
      {
        title: "6. Обращения пользователя",
        paragraphs: [
          "Пользователь может направить запрос по вопросам обработки данных, исправления контактной информации или удаления аккаунта по контактам исполнителя.",
          "Контакты для запросов: [ggjgrgg@gmail.com], [+7 (983) 403-97-77], https://adalshe.ru.",
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
          "Пользователь обязуется использовать сервис добросовестно и в соответствии с действующим законодательством.",
        ],
      },
      {
        title: "2. Запрещенный контент и действия",
        paragraphs: [
          "Пользователю запрещено использовать сервис для создания, хранения, публикации или распространения незаконного контента, вредоносных материалов, призывов к насилию, нарушений прав третьих лиц и иных запрещенных законом действий.",
        ],
        items: [
          "незаконный, мошеннический или вводящий в заблуждение контент;",
          "контент, нарушающий авторские права, права на изображение или иные права третьих лиц;",
          "попытки взлома, обхода ограничений, автоматизированного злоупотребления сервисом;",
          "использование сервиса для спама, фишинга или иной вредоносной активности.",
        ],
      },
      {
        title: "3. Возрастные и контентные ограничения",
        paragraphs: [
          "Пользователь обязан самостоятельно оценивать допустимость создаваемого или читаемого контента с учетом собственного возраста и требований законодательства страны пребывания.",
          "Исполнитель вправе ограничивать отдельные сценарии использования, если они связаны с недопустимыми темами, злоупотреблением сервисом или жалобами третьих лиц.",
        ],
      },
      {
        title: "4. Оплачиваемый цифровой доступ",
        paragraphs: [
          "Часть функциональности сервиса предоставляется на платной основе в виде пакетов глав и подписок.",
          "После оплаты цифровой доступ предоставляется автоматически в аккаунте пользователя, без физической доставки.",
        ],
      },
      {
        title: "5. Блокировка и ограничение доступа",
        paragraphs: [
          "Исполнитель вправе временно ограничить доступ к аккаунту или полностью заблокировать его при нарушении условий настоящего соглашения, подозрении на мошенничество, злоупотреблении платежной системой или попытках повлиять на стабильность сервиса.",
          "В случае серьезного или повторного нарушения исполнитель вправе прекратить обслуживание пользователя без предварительного уведомления.",
        ],
      },
      {
        title: "6. Ограничение гарантий",
        paragraphs: [
          "Сервис предоставляется по модели as is в той мере, в какой это допустимо применимым правом.",
          "Исполнитель не гарантирует бесперебойную и безошибочную работу сервиса в каждый момент времени, но принимает разумные меры для поддержания его доступности.",
        ],
      },
      {
        title: "7. Контакты",
        paragraphs: [
          "По вопросам использования сервиса, жалобам и обращениям пользователь может связаться с исполнителем по следующим данным:",
          "Исполнитель: Ильясов Руслан Александрович. Email: ggjgrgg@gmail.com. Телефон: [+7 (983) 403-97-77].",
        ],
      },
    ],
  },
};

const enContent: PublicSiteContent = {
  footer: {
    summary:
      "Public service pages for users and for YooKassa moderation of the payment-enabled website.",
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
      `${APP_NAME} is an interactive AI story service. Users create stories, continue them through choices, and receive new chapters inside their account dashboard.`,
    serviceTitle: "How the service works",
    serviceDescription:
      "After registration, the user can create and continue AI stories. New chapters appear digitally in the account, and paid chapters or subscriptions are credited automatically without manual processing.",
    freeAccessTitle: "Free starter access",
    freeAccessDescription: "The first 10 chapters are free after registration.",
    chapterPacksTitle: "Chapter packs",
    subscriptionsTitle: "Subscriptions",
    packs: [
      {
        name: "10 chapters",
        price: "200 ₽",
        description: "One-time purchase for continuing interactive stories.",
      },
      {
        name: "50 chapters",
        price: "799 ₽",
        description: "Suitable for longer story branches and multiple stories.",
      },
      {
        name: "100 chapters",
        price: "1299 ₽",
        description: "Expanded pack for active service usage.",
      },
    ],
    subscriptions: [
      {
        name: "1 month",
        price: "1499 ₽",
        description: "The subscription includes 25 chapters per day.",
      },
      {
        name: "1 year",
        price: "5999 ₽",
        description: "Yearly plan with 25 chapters per day.",
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
    title: "Service provider details",
    lead:
      "This page contains public contact details and service provider information for users and payment moderation.",
    detailsTitle: "Details",
    details: [
      { label: "Provider", value: "Ильясов Руслан Александрович" },
      { label: "Status", value: "self-employed" },
      { label: "Tax ID", value: "380806642556" },
      { label: "Email", value: "ggjgrgg@gmail.com" },
      { label: "Phone", value: "[+7 (983) 403-97-77]" },
      { label: "Website", value: "https://adalshe.ru" },
    ],
    note:
      "Replace placeholders with the real provider details before final moderation and payment launch.",
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
          `This document is an offer by the service provider to enter into an agreement for the use of ${APP_NAME} under the terms below.`,
          "By paying for the service, the user fully accepts this offer.",
        ],
      },
      {
        title: "2. Subject of the service",
        paragraphs: [
          `${APP_NAME} provides access to a digital service for generating and continuing interactive AI stories.`,
          "The service is provided only in electronic form through the user's account. No physical goods or delivery are involved.",
        ],
      },
      {
        title: "3. Registration and access",
        paragraphs: [
          "To use the service, the user must register and sign in using the supported authorization methods.",
          "The user must keep account information up to date and must not share account access with third parties.",
        ],
      },
      {
        title: "4. Pricing and payment",
        paragraphs: [
          "Current tariffs, chapter packs, and subscriptions are listed on the /pricing page and form an integral part of this offer.",
          "Payment is made online through the payment provider connected to the website.",
        ],
      },
      {
        title: "5. Chapter delivery",
        paragraphs: [
          "After successful payment, the relevant number of chapters or subscription access is credited to the user account automatically.",
          "The user can then generate new chapters and continue interactive stories within the paid access limits.",
        ],
      },
      {
        title: "6. Refunds",
        paragraphs: [
          "The user may contact the provider regarding a refund request.",
          "Each request is reviewed individually based on whether the digital service has already been delivered, whether chapters were credited, and whether they were used.",
          "If digital access has already been delivered and used in whole or in part, the provider may refuse a refund or calculate it proportionally to the unused part of the service.",
        ],
      },
      {
        title: "7. Limitation of liability",
        paragraphs: [
          "The provider is not liable for temporary unavailability caused by factors outside its control, including infrastructure failures, external APIs, or payment provider issues.",
          "The provider does not guarantee that generated content will match the user's subjective expectations.",
        ],
      },
      {
        title: "8. Provider contacts",
        paragraphs: [
          "Provider: Ильясов Руслан Александрович.",
          "Tax ID: 380806642556. Email: ggjgrgg@gmail.com. Phone: [+7 (983) 403-97-77].",
          "Website: https://adalshe.ru.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Privacy policy",
    lead:
      "This policy explains what data the service processes, why it is processed, and how users can contact the provider about personal data matters.",
    sections: [
      {
        title: "1. Data we process",
        paragraphs: [
          "When a user signs in through Google OAuth, the service processes the profile data provided by the authorization provider, including the user's name and email address.",
          "The service also stores generated stories, saves, reading progress, chapter access information, and technical records related to the account.",
        ],
      },
      {
        title: "2. Purpose of processing",
        paragraphs: [
          "Data is used to create and maintain the account, provide access to stories, synchronize progress, credit free and paid chapters, and support users.",
          "Technical data and logs may also be used for diagnostics, abuse prevention, and service security.",
        ],
      },
      {
        title: "3. Storage of stories and user content",
        paragraphs: [
          "Stories, chapters, choices, and saves created by the user are stored in the service infrastructure and linked to the user account.",
          "The user understands that this storage is necessary for product functionality and for reopening the story later from the dashboard.",
        ],
      },
      {
        title: "4. Payment data",
        paragraphs: [
          "Payment data is processed by the payment provider. The service does not store the full bank card details.",
          "The service may store technical payment data such as payment identifiers, statuses, product references, amounts, and service metadata needed to grant access.",
        ],
      },
      {
        title: "5. Sharing with third parties",
        paragraphs: [
          "Data may be shared only with services and contractors necessary for running the website, authorizing users, generating content, and processing payments.",
          "The provider does not sell users' personal data to third parties.",
        ],
      },
      {
        title: "6. User requests",
        paragraphs: [
          "Users may send requests related to personal data, contact data correction, or account deletion using the provider contacts.",
          "Contact details for requests: [ggjgrgg@gmail.com], [+7 (983) 403-97-77], https://adalshe.ru.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Terms",
    title: "User agreement",
    lead:
      "This agreement defines the rules for using the interactive AI story service, acceptable user conduct, and grounds for restricting access.",
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
          "Users may not use the service to create, store, publish, or distribute illegal content, harmful materials, calls for violence, infringements of third-party rights, or any other unlawful activity.",
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
          "For questions, complaints, or service-related requests, users may contact the provider:",
          "Provider: Ильясов Руслан Александрович. Email: ggjgrgg@gmail.com. Phone: [+7 (983) 403-97-77].",
        ],
      },
    ],
  },
};

export function getPublicSiteContent(locale: Locale) {
  return locale === "ru" ? ruContent : enContent;
}
