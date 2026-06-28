import { motion } from "framer-motion";

export function RunningState({ query }: { query: string }) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full space-y-6"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center">
          <span className="absolute h-14 w-14 animate-ping rounded-full bg-primary/20" />
          <span className="h-3 w-3 rounded-full bg-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wider text-muted-foreground">Researching</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance">
            {query}
          </h2>
          <p className="text-sm text-muted-foreground">
            Follow the live reasoning timeline as the assistant works.
          </p>
        </div>
        <div className="mx-auto max-w-md space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded-full bg-muted"
              style={{ width: `${90 - i * 12}%`, marginInline: "auto" }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
