import { useState } from "react";
import { useRivet } from "../../lib/rivet/store";
import { userName } from "../../lib/rivet/demo-data";
import { formatDateTime } from "../../lib/formatDate";
import type { LogEntry } from "../../lib/rivet/types";

export function EntryDiscussion({ entry }: { entry: LogEntry }) {
  const { addComment } = useRivet();
  const [body, setBody] = useState("");

  return (
    <section className="space-y-3 rounded-lg border border-border p-4">
      {entry.previousDecisions?.length ? <details className="text-sm">
        <summary className="cursor-pointer font-medium">Previous decisions</summary>
        {entry.previousDecisions.map((decision, index) => <p key={index} className="mt-2">
          {decision.status === "rejected" ? "Rejected" : "Approved"} · {formatDateTime(decision.at)}
          {decision.remarks && <span className="block text-muted-foreground">{decision.remarks}</span>}
        </p>)}
      </details> : null}
      <h2 className="font-medium">Comments</h2>
      {entry.comments.map((comment) => <div key={comment.id} className="text-sm">
        <p className="text-muted-foreground">{userName(comment.authorId)} · {formatDateTime(comment.createdAt)}</p>
        <p className="whitespace-pre-wrap">{comment.body}</p>
      </div>)}
      <form className="space-y-2" onSubmit={(event) => {
        event.preventDefault();
        if (!body.trim()) return;
        addComment(entry.id, body);
        setBody("");
      }}>
        <label className="block text-sm">Add a comment
          <textarea className="mt-1 block w-full rounded border p-2" value={body} onChange={(event) => setBody(event.target.value)} required />
        </label>
        <p className="text-xs text-muted-foreground">To mention someone with access, type @ followed by their work email.</p>
        <button className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground">Post comment</button>
      </form>
    </section>
  );
}
