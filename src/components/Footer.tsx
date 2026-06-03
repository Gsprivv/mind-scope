import { Link } from "react-router-dom";
import { COMPANY, UK_EMERGENCY } from "../constants/company";
import { ChatOpenButton } from "./ChatWidget";
import { StaffAccessButton } from "./StaffAccessButton";

export function Footer() {
  return (
    <footer className="border-t border-sage-200/80 bg-warm/50 dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-sage-800 dark:text-slate-100">
              {COMPANY.name}
            </h2>
            <p className="mt-1 text-sm text-sage-600 dark:text-slate-400">{COMPANY.legalName}</p>
            <ul className="mt-4 space-y-2 text-sm text-sage-700">
              <li>
                <span className="text-sage-500">Email: </span>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="font-medium underline hover:text-sage-900"
                >
                  {COMPANY.email}
                </a>
              </li>
              <li>
                <span className="text-sage-500">Telephone: </span>
                <a
                  href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
                  className="font-medium underline hover:text-sage-900"
                >
                  {COMPANY.phoneDisplay}
                </a>
              </li>
              <li className="text-sage-600">{COMPANY.officeHours}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-700">
              Quick links
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-sage-700 underline hover:text-sage-900">
                  Contact us
                </Link>
              </li>
              <li>
                <ChatOpenButton variant="inline" />
              </li>
              <li>
                <Link to="/" className="text-sage-700 underline hover:text-sage-900">
                  Home
                </Link>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-700">
              UK emergency &amp; crisis support
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {UK_EMERGENCY.map((service) => (
                <li key={service.name}>
                  <a
                    href={service.href}
                    className="font-medium text-sage-800 underline hover:text-sage-950"
                    {...(service.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {service.name}
                  </a>
                  <span className="text-sage-600"> — {service.contact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 border-t border-sage-200/80 pt-6 text-center text-xs text-sage-500">
          {COMPANY.name} is for self-reflection only and is not a substitute for
          professional medical or mental health care. Registered in England and
          Wales.
        </p>
        <div className="mt-4 flex flex-col items-center gap-4">
          <ChatOpenButton variant="footer" />
          <StaffAccessButton />
        </div>
      </div>
    </footer>
  );
}
