const ruMessages = {
  metadata: {
    title: "FanStory",
    description:
      "Интерактивные AI-истории с кошельком, сохранениями, доступом к главам, подписками и авторизацией только через Google.",
  },
  common: {
    appName: "FanStory",
    language: {
      label: "Язык",
      english: "English",
      russian: "Русский",
      switchTo: "Сменить язык",
    },
    actions: {
      createStory: "Создать историю",
      startStory: "Начать историю",
      openDashboard: "Открыть кабинет",
      openReader: "Открыть ридер",
      openStory: "Открыть историю",
      viewAll: "Смотреть все",
      browseStories: "К историям",
      backToStories: "Назад к историям",
      saveProgress: "Сохранить прогресс",
      unlockNextChapter: "Открыть следующую главу",
      addDemoCredits: "Начислить демо-кредиты",
      activateMockPlan: "Активировать mock-план",
      continueWithGoogle: "Продолжить через Google",
      signIn: "Войти",
      signOut: "Выйти",
      newStory: "Новая история",
      generateFirstChapter: "Сгенерировать первую главу",
    },
    states: {
      noActiveSubscription: "Нет активной подписки",
      noActivePlan: "Нет активного плана",
      free: "Бесплатно",
      premium: "Премиум",
      active: "Активна",
      yes: "Да",
      no: "Нет",
    },
    enums: {
      accessReason: {
        FREE: "бесплатный",
        PURCHASED: "купленный",
        SUBSCRIPTION: "по подписке",
        LOCKED: "заблокированный",
      },
      chapterAccessMode: {
        FREE: "Бесплатно",
        PAY_PER_CHAPTER: "Премиум",
        SUBSCRIPTION: "Подписка",
      },
      storyLanguage: {
        en: "Английский",
        ru: "Русский",
      },
      subscriptionInterval: {
        MONTHLY: "Ежемесячно",
        YEARLY: "Ежегодно",
        LIFETIME: "Навсегда",
      },
      walletTransactionType: {
        STARTER_GRANT: "Стартовое начисление",
        CREDIT_TOP_UP: "Пополнение кредитов",
        CHAPTER_PURCHASE: "Покупка главы",
        SUBSCRIPTION_PURCHASE: "Покупка подписки",
        REFUND: "Возврат",
        ADJUSTMENT: "Корректировка",
      },
      subscriptionStatus: {
        ACTIVE: "Активна",
        CANCELED: "Отменена",
        EXPIRED: "Истекла",
        TRIALING: "Пробный период",
        PAST_DUE: "Просрочена",
      },
    },
    loading: {
      title: "Загрузка FanStory",
      description:
        "Подготавливаем следующий экран, текущий язык и рабочее пространство продукта.",
    },
    errors: {
      title: "Что-то пошло не так",
      description:
        "Не удалось завершить запрос. Попробуйте обновить страницу или вернуться на главную.",
      reset: "Повторить",
      goHome: "На главную",
    },
    empty: {
      title: "Пока пусто",
      description: "Раздел заполнится по мере появления данных в продукте.",
    },
    labels: {
      chapter: "Глава",
      updated: "обновлено",
      created: "создано",
      status: "Статус",
      account: "Аккаунт",
      subscription: "Подписка",
      recentStories: "Последние истории",
      recentSaves: "Последние сохранения",
      wallet: "Кошелек",
      ledger: "Леджер",
      profile: "Профиль",
      stories: "Истории",
      saves: "Сохранения",
      balance: "Баланс",
      premiumAccess: "Премиум-доступ",
      currentStoryState: "Текущее состояние истории",
      decisionHistory: "История выборов",
      chapterTimeline: "Лента глав",
      currentSubscription: "Текущая подписка",
      saveCheckpoint: "Создать сохранение",
      nextChapterAccess: "Доступ к следующей главе",
      chooseNextMove: "Выберите следующий ход",
      storyLibrary: "Библиотека историй",
      storyLanguage: "Язык истории",
    },
    relative: {
      ago: "{value} назад",
    },
  },
  navigation: {
    dashboard: "Кабинет",
    stories: "Истории",
    saves: "Сохранения",
    wallet: "Кошелек",
    subscriptions: "Подписки",
    productNote: "Заметка по продукту",
    productNoteDescription:
      "Главы, подписки, кошелек и генерация уже разделены на серверном слое, поэтому платежные и AI-провайдеры можно развивать без переписывания UI-маршрутов.",
    workspaceEyebrow: "Интерактивные AI-истории",
    workspaceTitle: "Центр управления",
  },
  landing: {
    badge: "Foundation финальной версии для интерактивной AI-фантастики",
    title:
      "FanStory превращает ветвящиеся AI-истории в полноценный продуктовый интерфейс.",
    description:
      "Google-вход, профиль как центр управления, кошелек и доступ к главам, сохранения историй, подписочные entitlement-механики и provider layer под OpenAI или другой генератор.",
    heroPrimary: "Начать собирать истории",
    heroSecondary: "Открыть кабинет",
    architectureTitle: "Архитектура под продукт, а не одноразовый прототип",
    architectureCards: [
      {
        title: "Отдельный сервис доступа",
        description:
          "Премиальный доступ к главам вычисляется в отдельном access service.",
      },
      {
        title: "Разделение кошелька и леджера",
        description: "Кошелек и журнал покупок отделены от компонентов и форм.",
      },
      {
        title: "Абстракция провайдера",
        description:
          "Provider abstraction готова к замене mock-генерации на живую модель.",
      },
    ],
    pillars: [
      {
        title: "Интерактивный story engine",
        description:
          "Главы генерируются как цельный run со структурированным состоянием, историей выборов и абстракцией провайдера для реальных AI-бэкендов.",
      },
      {
        title: "Профиль как control center",
        description:
          "Истории, сохранения, баланс, покупки и статус подписки живут в одном кабинете, а не разбросаны по временным страницам.",
      },
      {
        title: "Фундамент монетизации",
        description:
          "Кошелек, покупки и доступ по подписке моделируются на сервере, поэтому платежного провайдера можно подключать без переписывания core UI.",
      },
    ],
  },
  signIn: {
    badge: "Доступ только через Google",
    title: "Войти в FanStory",
    description:
      "Авторизация намеренно ограничена Google. После создания аккаунта пользователь попадает в рабочее пространство с историями, сохранениями, балансом и данными доступа.",
    foundation: "Auth.js + Prisma adapter + protected routes",
  },
  dashboard: {
    eyebrow: "Профиль",
    title: "С возвращением, {name}",
    description:
      "Ваш профиль — это центр управления историями, сохранениями, покупками, балансом и статусом подписки.",
    metrics: {
      stories: {
        label: "Истории",
        hint: "Интерактивные повествования, принадлежащие этому аккаунту.",
      },
      saves: {
        label: "Сохранения",
        hint: "Точки возврата для продолжения чтения и будущего ветвления.",
      },
      balance: {
        label: "Баланс",
        hint: "Кошелек управляется на сервере и отделен от UI-действий.",
      },
      premiumAccess: {
        label: "Премиум-доступ",
      },
    },
    recentStories: {
      title: "Последние истории",
      description:
        "Последняя активность по историям и текущий прогресс по главам.",
      item: "{chapterLabel} {chapterNumber} • {updatedLabel} {updatedAt}",
      emptyTitle: "Историй пока нет",
      emptyDescription:
        "Создайте первую историю, чтобы заполнить кабинет, сценарии кошелька и reader mode.",
    },
    profileStatus: {
      title: "Статус профиля",
      recentSavesEmpty:
        "Сохранения появятся после создания первого чекпоинта в ридере.",
      recentSaveItem: "{storyTitle} • {chapterLabel} {chapterNumber}",
    },
  },
  stories: {
    list: {
      eyebrow: "Истории",
      title: "Библиотека историй",
      description:
        "Все сгенерированные истории текущего пользователя. Каждая история владеет своими главами, run state и проверками доступа.",
      synopsisFallback: "История во вселенной {universe}.",
      emptyTitle: "Истории еще не созданы",
      emptyDescription:
        "Используйте flow создания истории, чтобы собрать story aggregate, первую главу и первый набор выборов.",
      cardUpdated:
        "{updatedLabel} {updatedAt} • сгенерировано глав: {chapterCount}",
    },
    create: {
      eyebrow: "Генерация истории",
      title: "Создать новую историю",
      description:
        "Новая история создает persisted aggregate с конфигом, первой главой, выбором и снимком состояния run.",
      formTitle: "Создание новой интерактивной истории",
      formDescription:
        "Эта форма пишет в story-generation service, а не в локальное состояние UI. Первая глава генерируется сразу через provider abstraction.",
      fields: {
        contentLanguage: "Язык истории",
        title: "Название истории",
        synopsis: "Синопсис",
        universe: "Вселенная",
        protagonist: "Главный герой",
        theme: "Тема",
        genre: "Жанр",
        tone: "Тональность",
      },
      hints: {
        contentLanguage:
          "Определяет язык глав, описаний состояния и выборов. Это отдельная настройка и не зависит от языка интерфейса.",
      },
      placeholders: {
        title: "Дом за сигналом",
        synopsis:
          "Краткое обещание мира, конфликта и эмоционального направления.",
        universe: "Нео-викторианский мегаполис",
        protagonist: "Опальный архивариус",
        theme: "Манипуляция памятью",
        genre: "Спекулятивный детектив",
        tone: "Напряженный, камерный, кинематографичный",
      },
    },
    detail: {
      eyebrow: "Детали истории",
      descriptionFallback:
        "Метаданные интерактивной истории и текущее состояние run.",
      currentStateTitle: "Текущее состояние истории",
      activeGoals: "Активные цели",
      tensions: "Напряжения",
      knownFacts: "Известные факты",
      decisionHistory: "История выборов",
      noDecisions:
        "Пока нет зафиксированных выборов. Первая глава уже доступна в reader mode.",
      decisionItem: "{chapterLabel} {chapterNumber}: {selectedLabel}",
      chapterTimeline: "Лента глав",
    },
    reader: {
      eyebrow: "Ридер",
      description:
        "Режим прохождения текущего story run с проверкой прав доступа и чекпоинтами сохранений.",
      chapterBadge: "{chapterLabel} {chapterNumber}",
      chooseTitle: "Выберите следующий ход",
      chooseDescription:
        "Выборы сохраняются на сервере, а следующая глава генерируется только после подтверждения прав доступа.",
      lockedChoices:
        "Сначала откройте следующую главу. Формы выбора остаются заблокированными, пока доступ не будет выдан покупкой главы или активной подпиской.",
      checkpointPlaceholder: "Название чекпоинта",
      saveDescription:
        "Сохранений: {count}. Сейвы хранят snapshot run и указатель главы для будущего восстановления и ветвления.",
      accessDescription:
        "Доступ вычисляется в отдельном сервисном слое. UI только отображает результат.",
      accessAllowed: "Следующая глава уже доступна по схеме доступа: {reason}.",
      accessLocked:
        "{chapterLabel} {chapterNumber} закрыта. Откройте за {price} или покройте доступ подпиской.",
    },
  },
  saves: {
    eyebrow: "Сохранения",
    title: "Сохраненные чекпоинты",
    description:
      "Сейвы — это persisted snapshots, которые позже можно развить в более богатое восстановление и ветвление.",
    emptyTitle: "Сохранений пока нет",
    emptyDescription:
      "Откройте ридер и создайте чекпоинт. Снимки уже готовы для будущего restore и более сложной механики ветвлений.",
    cardMeta: "{storyTitle} • {chapterLabel} {chapterNumber}",
    button: "Открыть сейв",
  },
  wallet: {
    eyebrow: "Кошелек",
    title: "Баланс и леджер",
    description:
      "Кредиты, история операций и placeholder flow пополнения живут в отдельном wallet service.",
    descriptionCard:
      "Баланс кошелька обновляется через отдельный сервис и transaction ledger, а не локальным UI-состоянием. Реальную платежную интеграцию можно будет добавить без изменения page components.",
    ledgerTitle: "Леджер",
    table: {
      type: "Тип",
      description: "Описание",
      amount: "Сумма",
      balanceAfter: "Баланс после",
      when: "Когда",
    },
    transactionDescriptions: {
      STARTER_GRANT: "Стартовые кредиты начислены при первом входе.",
      CREDIT_TOP_UP:
        "Демо-кредиты добавлены для локальной разработки и проверки покупок.",
      CHAPTER_PURCHASE: "Кредиты списаны за открытие премиальной главы.",
      SUBSCRIPTION_PURCHASE: "Кредиты списаны за доступ по подписке.",
      REFUND: "Кредиты возвращены в кошелек.",
      ADJUSTMENT: "Ручная корректировка кошелька.",
    },
  },
  subscriptions: {
    eyebrow: "Подписки",
    title: "Слой доступа по подписке",
    description:
      "Подписочная логика моделируется отдельно от UI, чтобы в будущем премиальный доступ можно было связать с billing provider, webhook-ами и entitlement sync.",
    currentTitle: "Текущая подписка",
    noActive:
      "Активного плана нет. Архитектура подписки уже встроена в доступ к главам, покупки и reader gating.",
    statusLine: "Статус: {status}{endsAt}",
    statusEndsAt: " • действует до {date}",
    unlimitedPremiumAccess: "Безлимитный премиум-доступ: {value}",
    chapterDiscount: "Скидка на главы: {value}%",
    integrationReady:
      "Foundation готова для будущей платежной и webhook-интеграции",
    planDescriptions: {
      "fanstory-plus-monthly":
        "Безлимитный доступ к премиальным главам на время активности, приоритет в очереди генерации и foundation под подписочное ограничение доступа.",
      "fanstory-pro-yearly":
        "План для активных пользователей с годовым биллингом-заглушкой и местом для будущей интеграции платежного провайдера.",
    },
  },
  userMenu: {
    fallbackName: "Пользователь FanStory",
  },
} as const;

export default ruMessages;
