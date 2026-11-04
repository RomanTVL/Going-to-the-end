// The ascent: up from THE END through the secret session and our film to the very first title.
// Lava rises from below, credits and chunks of the frame fall from above, every word gives way.
{
  const FINAL = LEVELS.find(L => L.final);
  const credits = [['title', 'GOING TO THE END']];
  for (const c of FINAL.credits) if (c[0] === 'h' || c[0] === 'r' || c[0] === 'c' || c[0] === 'w' || c[0] === '*') credits.push(c);
  for (const L of LEVELS.filter(L => !L.final && !L.extra)) {
    const row = L.credits.filter(c => c[0] === 'r').slice(-1);
    credits.push(['film', L.key], ['h', L.name], ...row);
  }
  credits.push(['film', FINAL.key], ['end', 'THE END']);
  LEVELS.push({
    key: 'rise', extra: true, rise: true, name: 'Восхождение', tag: 'ВОСХОЖДЕНИЕ', hint: 'вверх! снизу поднимается лава',
    genre: 'обратно по титрам — к самому началу', par: 150, jump: 1.25,
    pal: { bg: '#0a0405', film: '#efe8dc', dim: '#a58e80', accent: '#ff6a1f', star: '#ffd76a' },
    fonts: FINAL.fonts, hazard: 'rise', props: [], back: 'collapse', sound: { base: 330, wave: 'triangle' },
    credits,
  });
}
