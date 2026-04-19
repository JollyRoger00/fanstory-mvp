const choices = [
  "Пойти за таинственным голосом из коридора",
  "Спрятаться в библиотеке и изучить карту замка",
  "Попросить совета у лучшего друга",
  "Нарушить правила и открыть запретную дверь"
];

const sampleChapter =
  "Ночь опустилась на замок, и в старых окнах дрожали огни факелов. " +
  "Главный герой чувствовал, что обычный день вот-вот превратится в начало большой истории. " +
  "Где-то в глубине коридоров уже прозвучал намек на тайну, а впереди оставался только выбор: " +
  "довериться любопытству или попытаться сохранить привычный порядок.";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">FanStory MVP</p>
        <h1>Интерактивные AI-фанфики с выбором действий</h1>
        <p className="lead">
          Это стартовый экран будущего сервиса. Он показывает базовый сценарий:
          пользователь задает мир, героя и тему, получает первую главу и выбирает
          следующий шаг.
        </p>
      </section>

      <section className="grid">
        <div className="card">
          <h2>Данные для истории</h2>
          <form className="story-form">
            <label className="field">
              <span>Вселенная</span>
              <input type="text" defaultValue="Гарри Поттер" />
            </label>

            <label className="field">
              <span>Персонаж</span>
              <input type="text" defaultValue="Ученица, которая случайно нашла секретный ход" />
            </label>

            <label className="field">
              <span>Тема истории</span>
              <textarea defaultValue="Тайна, взросление и рискованный выбор в запретной части замка." />
            </label>

            <button type="button" className="primary-button">
              Создать историю
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Первая глава</h2>
          <p className="chapter">{sampleChapter}</p>

          <div className="choices-block">
            <h3>Выберите продолжение</h3>
            <div className="choices">
              {choices.map((choice) => (
                <button key={choice} type="button" className="choice-button">
                  {choice}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
