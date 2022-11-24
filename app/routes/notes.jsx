import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link, useCatch } from "@remix-run/react";
import NewNote, { links as newNoteLinks } from "~/components/NewNote";
import NoteList, { links as noteListLinks } from "~/components/NoteList";
import { getStoredNotes, storeNotes } from "~/data/notes";

export default function NotesPage() {
  const notes = useLoaderData();

  return (
    <main>
      <NewNote />
      <NoteList notes={notes} />
    </main>
  );
}

export async function loader() {
  const notes = await getStoredNotes();

  if (!notes || notes.length === 0) {
    throw json(
      { message: "Could not find any notes." },
      { status: 404, statusText: "Not Found" }
    );
  }

  return notes;
}

// action() func contains the backend codes
// this fun will triggered whenever a non GET request reaches the Route
export async function action({ request }) {
  // Get the user data
  const formData = await request.formData();

  // Extract the user data

  // const noteData = {
  //   title: formData.get("title"),
  //   content: formData.get("content"),
  // };

  const noteData = Object.fromEntries(formData);

  // validation
  if (noteData.title.trim().length < 5) {
    return { message: "Invalid title - must be at least 5 characters long." };
  }

  // Store that user data
  const existingNotes = await getStoredNotes();
  noteData.id = new Date().toISOString();
  const updatedNotes = existingNotes.concat(noteData);
  await storeNotes(updatedNotes);

  // await new Promise((resolve, reject) => setTimeout(() => resolve(), 2000));
  // This will pause 2 seconds during adding new note

  // redirect the user
  return redirect("/notes");
}

export function links() {
  return [...newNoteLinks(), ...noteListLinks()];
}

export function CatchBoundary() {
  const caughtResponse = useCatch();
  const message = caughtResponse.data?.message || "Data not found.";

  return (
    <main>
      <NewNote />
      <p className="info-message">{message}</p>
    </main>
  );
}

export function ErrorBoundary({ error }) {
  return (
    <main className="error">
      <h1>An error related to your notes occurred!</h1>
      <p>{error.message}</p>
      <p>
        Back to <Link to="/">safely</Link>!
      </p>
    </main>
  );
}

export function meta() {
  return { title: "All Notes", description: "Manage your notes with ease" };
}
