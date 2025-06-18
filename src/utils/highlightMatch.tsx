export function highlightMatch(text: string, term: string): JSX.Element {
  if (!term.trim()) return <>{text}</>;

  const regex = new RegExp(`(${term})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
      )}
    </>
  );
}
