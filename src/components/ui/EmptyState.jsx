import { Compass } from "lucide-react";
import { Button } from "./Button";
import { ShellCard } from "./ShellCard";

export function EmptyState({ title, description, action, onAction }) {
  return (
    <ShellCard className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neon">
        <Compass size={24} />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
        {description}
      </p>
      {action ? (
        <Button className="mt-6" onClick={onAction}>
          {action}
        </Button>
      ) : null}
    </ShellCard>
  );
}

