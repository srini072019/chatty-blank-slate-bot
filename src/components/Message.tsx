
import { cn } from "@/lib/utils";

interface MessageProps {
  content: string;
  isUser: boolean;
}

const Message = ({ content, isUser }: MessageProps) => {
  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg max-w-[80%] w-fit",
        isUser ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary"
      )}
    >
      {content}
    </div>
  );
};

export default Message;
