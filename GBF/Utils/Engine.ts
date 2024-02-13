export function GetClockEmoji() {
  const currentHour = new Date().getHours();

  const emojiMap = [
    { start: 6, end: 11, emoji: "🕕" },
    { start: 12, end: 17, emoji: "🕧" },
    { start: 18, end: 21, emoji: "🕕" },
    { start: 22, end: 5, emoji: "🕛" },
  ];

  const emojiObj = emojiMap.find(
    ({ start, end }) => currentHour >= start || currentHour <= end
  );
  return emojiObj ? emojiObj.emoji : "🕛";
}