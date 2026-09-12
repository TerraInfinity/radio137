import { useEffect, useState } from "react";
import { SignInChoices } from "@/components/sign-in-choices";
import { addAdminGlaumWordFn, addGuestGlaumWordFn, hideGlaumWordFn, listGlaumWords } from "@/lib/glaum-api";
import { GLAUM_DEFAULT_WORDS, GLAUM_GUEST_MAX, graphemeCount } from "@/lib/glaum-words";
import { useRadioUser } from "@/lib/radio-user";

type WordRow = {
  id: number;
  word: string;
  authorId: string | null;
  authorName: string | null;
  expiresAt: string | null;
};

type Lexicon = {
  pool: string[];
  permanent: WordRow[];
  guest: WordRow[];
};

export function GlaumWordBooth({ nextPath = "/channel/official-glaum-frequency" }: { nextPath?: string }) {
  const { user, isAdmin, isPending } = useRadioUser();
  const [open, setOpen] = useState(false);
  const [lex, setLex] = useState<Lexicon | null>(null);
  const [word, setWord] = useState("");
  const [adminWord, setAdminWord] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    void listGlaumWords()
      .then(setLex)
      .catch(() => {
        /* seed pool still floats */
      });
  }, []);

  const mine = lex?.guest.find((row) => row.authorId === user?.id);

  async function addGuest() {
    setBusy(true);
    setHint("");
    try {
      const next = await addGuestGlaumWordFn({ data: { word } });
      setLex(next);
      setWord("");
      setHint("It floats for a month.");
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Could not add");
    } finally {
      setBusy(false);
    }
  }

  async function addPermanent() {
    setBusy(true);
    setHint("");
    try {
      const next = await addAdminGlaumWordFn({ data: { word: adminWord } });
      setLex(next);
      setAdminWord("");
      setHint("Permanent.");
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Could not add");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id?: number, label?: string) {
    setBusy(true);
    try {
      const next = await hideGlaumWordFn({ data: id ? { id } : { word: label } });
      setLex(next);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not remove");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glaum-panel mt-6 overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex h-12 w-full items-center justify-between gap-3 px-3 text-left"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-glaum">Lantern words</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">{open ? "Close" : "Open"}</span>
      </button>
      {open ? (
        <div className="border-t border-line p-3">
      <p className="text-sm text-muted">
        Drop a word into the bubbles. Emoji and symbols are welcome. Under 10 characters, no profanity. Guest words fade after a month.
      </p>
      {isPending ? <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">Checking…</p> : null}
      {!isPending && !user ? (
        <div className="mt-4">
          <p className="text-sm text-muted">Sign in to add a word.</p>
          <div className="mt-3">
            <SignInChoices next={nextPath} />
          </div>
        </div>
      ) : null}
      {user && !mine ? (
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void addGuest();
          }}
        >
          <input
            className="input max-w-xs"
            value={word}
            onChange={(event) => setWord(event.target.value)}
            placeholder="🦐✨"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <span className="self-center font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            {graphemeCount(word)} / {GLAUM_GUEST_MAX}
          </span>
          <button type="submit" disabled={busy || !word.trim()} className="btn-glaum inline-flex h-11 items-center px-4 font-mono text-[11px] uppercase tracking-[0.14em]">
            {busy ? "Sending…" : "Float it"}
          </button>
        </form>
      ) : null}
      {mine ? (
        <p className="mt-3 text-sm text-muted">
          Your word <span className="text-glaum-gold">{mine.word}</span> floats until {mine.expiresAt ? new Date(mine.expiresAt).toLocaleDateString() : "it fades"}.
        </p>
      ) : null}
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
      {isAdmin ? (
        <div className="mt-6 border-t border-line pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">C · permanent list</p>
          <form
            className="mt-3 flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void addPermanent();
            }}
          >
            <input className="input max-w-xs" value={adminWord} onChange={(event) => setAdminWord(event.target.value)} placeholder="sat nam" />
            <button type="submit" disabled={busy || !adminWord.trim()} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
              Make permanent
            </button>
          </form>
          <ul className="mt-3 space-y-1">
            {(lex?.permanent ?? []).map((row) => (
              <li key={row.id} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm">{row.word}</span>
                <button type="button" disabled={busy} onClick={() => void remove(row.id)} className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ember">
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Built-in</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {GLAUM_DEFAULT_WORDS.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(undefined, item)}
                  className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
                >
                  {item} · hide
                </button>
              </li>
            ))}
          </ul>
          {(lex?.guest.length ?? 0) > 0 ? (
            <>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Guest · month</p>
              <ul className="mt-1 space-y-1">
                {lex?.guest.map((row) => (
                  <li key={row.id} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {row.word} <span className="text-subtle">· {row.authorName || "guest"}</span>
                    </span>
                    <button type="button" disabled={busy} onClick={() => void remove(row.id)} className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ember">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
        </div>
      ) : null}
    </section>
  );
}
