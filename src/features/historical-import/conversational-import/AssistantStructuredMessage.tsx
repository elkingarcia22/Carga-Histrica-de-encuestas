import { useState, useEffect } from "react";

export function AssistantStructuredMessage({ content, animate = true, speed = 15, className = "" }: { content: string; animate?: boolean; speed?: number; className?: string }) {
  const [displayedText, setDisplayedText] = useState(animate ? "" : content);

  useEffect(() => {
    if (!animate) return;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(content.substring(0, i + 1));
      i++;
      if (i >= content.length) {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [content, animate, speed]);

  const textToRender = animate ? displayedText : content;

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`font-normal whitespace-pre-wrap leading-relaxed text-foreground/90 ${className}`}>
      {renderFormattedText(textToRender)}
    </div>
  );
}
