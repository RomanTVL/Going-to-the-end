// ---------- the evening's programme: ten films and games, the last one is ours ----------
// Credit rows: title, h (section heading and checkpoint), r (role and name), c (a sentence, word by word),
// w (a list of names), end. '~' marks a name that crumbles a moment after you stand on it.
// A trailing object adds behaviour: blink (the line goes dark every few seconds), sway (it drifts sideways).
// ['*', dx, dy] hides a star dx from the centre and dy above the next line.
const fontSet = (title, head, role, name, sent, list, end) => ({ title, head, role, name, sent, list, end });
const LEVELS = [];
