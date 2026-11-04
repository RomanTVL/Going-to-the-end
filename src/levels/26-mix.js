// The secret session: a few lines from every guest film, each in its own type, colours and danger.
// It is built from the other films' credits, so it always matches them.
{
  const FINAL = LEVELS.find(L => L.final);
  const credits = [['title', 'ВСЕ ТИТРЫ СРАЗУ'], ['c', 'Весь вечер за один сеанс']];
  for (const L of LEVELS.filter(L => !L.final && !L.extra)) {
    const rows = L.credits.filter(c => c[0] === 'r' || c[0] === 'c' || c[0] === 'w').slice(1, 5);
    const star = L.credits.find(c => c[0] === '*') || ['*', 0, -44];
    credits.push(['film', L.key], ['h', L.name], ...[rows[0], rows[1], star, rows[2], rows[3]].filter(Boolean));
  }
  credits.push(['film', FINAL.key], ['c', 'Ты видел их все'], ['end', 'THE END']);
  LEVELS.push({
    key: 'mix', extra: true, sections: true, name: 'Все титры сразу', tag: 'СЕКРЕТНЫЙ СЕАНС 26', hint: 'у каждого фильма свои правила',
    genre: 'по мотивам всего вечера сразу', par: 120,
    pal: FINAL.pal, fonts: FINAL.fonts, hazard: null, props: [], back: null, sound: FINAL.sound,
    credits,
  });
}
