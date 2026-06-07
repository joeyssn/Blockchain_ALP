import { ImagePlus, PackagePlus } from "lucide-react";
import { useState } from "react";
import { ErrorMessage } from "../components/ErrorMessage.jsx";

const initialForm = {
  name: "",
  serialNumber: "",
  description: "",
  manufacturer: "",
  imageName: "",
};

export function RegisterProduct() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.name || !form.serialNumber || !form.manufacturer) {
      setError("Product name, serial number, and manufacturer are required.");
      return;
    }

    setMessage(
      `Mock registration submitted for ${form.name}. This flow is ready for smart contract integration.`
    );
    setForm(initialForm);
  }

  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-ink-100 bg-white p-6 shadow-soft">
      <div className="mb-6">
        <p className="text-sm font-semibold text-web3-600">Register Product</p>
        <h2 className="text-2xl font-bold text-ink-900">Create a new product record</h2>
        <p className="mt-2 text-sm text-ink-500">
          This demo form uses mock submission and is structured for future contract writes.
        </p>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError("")} />
      {message && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          Product Name
          <input
            className="rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
            onChange={(event) => updateField("name", event.target.value)}
            value={form.name}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          Product Serial Number
          <input
            className="rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
            onChange={(event) => updateField("serialNumber", event.target.value)}
            value={form.serialNumber}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          Description
          <textarea
            className="min-h-28 rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
            onChange={(event) => updateField("description", event.target.value)}
            value={form.description}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          Manufacturer
          <input
            className="rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
            onChange={(event) => updateField("manufacturer", event.target.value)}
            value={form.manufacturer}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          Image Upload
          <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 p-6 text-center">
            <ImagePlus className="mx-auto h-8 w-8 text-ink-500" />
            <input
              className="mt-4 w-full text-sm text-ink-500"
              onChange={(event) =>
                updateField("imageName", event.target.files?.[0]?.name || "")
              }
              type="file"
            />
            {form.imageName && <p className="mt-2 text-sm text-ink-700">{form.imageName}</p>}
          </div>
        </label>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-web3-600 px-4 py-3 font-semibold text-white hover:bg-web3-500"
          type="submit"
        >
          <PackagePlus className="h-5 w-5" />
          Register Product
        </button>
      </form>
    </section>
  );
}
