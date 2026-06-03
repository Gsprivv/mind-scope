import { useState, type FormEvent } from "react";
import { COMPANY, UK_EMERGENCY, UK_LOCALE } from "../constants/company";
import { saveContactMessage } from "../lib/contactStorage";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "mt-1 w-full rounded-lg border border-sage-200 px-3 py-2.5 outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-200";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    saveContactMessage({
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim() || "General enquiry",
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    });

    setSubmitted(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-sage-900">
        Contact us
      </h1>
      <p className="mt-2 text-sage-600">
        Send us a message and we will respond during UK office hours. This form
        is not monitored 24/7 — please use the crisis services below if you need
        urgent help.
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl border border-sage-200 bg-white p-5 text-sm shadow-sm sm:grid-cols-2">
        <div>
          <p className="font-medium text-sage-800">Email</p>
          <a
            href={`mailto:${COMPANY.email}`}
            className="text-sage-600 underline"
          >
            {COMPANY.email}
          </a>
        </div>
        <div>
          <p className="font-medium text-sage-800">Telephone</p>
          <a
            href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
            className="text-sage-600 underline"
          >
            {COMPANY.phoneDisplay}
          </a>
        </div>
        <div className="sm:col-span-2">
          <p className="font-medium text-sage-800">Address</p>
          <p className="text-sage-600">{COMPANY.address}</p>
        </div>
      </div>

      {submitted ? (
        <div
          className="mt-8 rounded-2xl border border-sage-200 bg-sage-50 px-5 py-6 text-sage-800"
          role="status"
        >
          <p className="font-semibold">Thank you — your message has been sent.</p>
          <p className="mt-2 text-sm text-sage-600">
            We aim to reply within 2 working days ({COMPANY.officeHours}).
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-sage-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          <label className="block">
            <span className="text-sm font-medium text-sage-700">Full name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              autoComplete="name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-sage-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-sage-700">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Question about check-ins"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-sage-700">Message</span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-sage-500 py-3 font-semibold text-cream hover:bg-sage-600"
          >
            Send message
          </button>
        </form>
      )}

      <section className="mt-10 rounded-2xl border border-red-100 bg-red-50/60 p-5">
        <h2 className="font-display text-lg font-semibold text-red-900">
          Need urgent help?
        </h2>
        <p className="mt-1 text-sm text-red-800">
          Do not use this contact form for emergencies.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-red-900">
          {UK_EMERGENCY.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> —{" "}
              <a href={s.href} className="underline">
                {s.contact}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-4 text-xs text-sage-500">
        Submitted on{" "}
        {new Date().toLocaleDateString(UK_LOCALE, {
          dateStyle: "long",
        })}
        . Messages are stored locally in this demo app.
      </p>
    </div>
  );
}
