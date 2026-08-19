/**
 * Local instance setup page shown on first boot and from the tray.
 */
import "./index.css";

type InstanceSetup = {
  serverUrl: string;
  officialUrl: string;
  firstLaunch: boolean;
};

declare global {
  interface Window {
    desktopConfig: {
      getInstanceSetup: () => Promise<InstanceSetup>;
      applyServerUrl: (
        url: string,
      ) => Promise<{ ok: true; url: string } | { ok: false; error: string }>;
      cancelInstanceSetup: () => Promise<
        { ok: true } | { ok: false; error: string }
      >;
    };
  }
}

const form = document.getElementById("instance-form") as HTMLFormElement;
const customField = document.getElementById("custom-field") as HTMLLabelElement;
const customUrl = document.getElementById("custom-url") as HTMLInputElement;
const officialUrlLabel = document.getElementById("official-url") as HTMLElement;
const errorEl = document.getElementById("error") as HTMLParagraphElement;
const cancelButton = document.getElementById("cancel") as HTMLButtonElement;
const continueButton = document.getElementById("continue") as HTMLButtonElement;

function selectedMode(): "official" | "custom" {
  const checked = form.querySelector<HTMLInputElement>(
    'input[name="mode"]:checked',
  );
  return checked?.value === "custom" ? "custom" : "official";
}

function setMode(mode: "official" | "custom") {
  const input = form.querySelector<HTMLInputElement>(
    `input[name="mode"][value="${mode}"]`,
  );
  if (input) {
    input.checked = true;
  }
}

function setError(message: string | null) {
  if (!message) {
    errorEl.hidden = true;
    errorEl.textContent = "";
    return;
  }

  errorEl.hidden = false;
  errorEl.textContent = message;
}

function syncCustomField() {
  const custom = selectedMode() === "custom";
  customField.hidden = !custom;
  customUrl.required = custom;
  if (custom) {
    customUrl.focus();
  }
}

form
  .querySelectorAll<HTMLInputElement>('input[name="mode"]')
  .forEach((input) => {
    input.addEventListener("change", syncCustomField);
  });

cancelButton.addEventListener("click", async () => {
  setError(null);
  cancelButton.disabled = true;
  const result = await window.desktopConfig.cancelInstanceSetup();
  if (!result.ok) {
    setError(result.error);
    cancelButton.disabled = false;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setError(null);

  const officialUrl = officialUrlLabel.textContent?.trim();
  const url =
    selectedMode() === "official" ? officialUrl : customUrl.value.trim();

  if (!url) {
    setError("Enter a valid URL, for example https://your.domain");
    return;
  }

  continueButton.disabled = true;
  const result = await window.desktopConfig.applyServerUrl(url);
  if (!result.ok) {
    setError(result.error);
    continueButton.disabled = false;
  }
});

async function init() {
  const setup = await window.desktopConfig.getInstanceSetup();
  officialUrlLabel.textContent = setup.officialUrl;

  const isOfficial = !setup.serverUrl || setup.serverUrl === setup.officialUrl;

  if (isOfficial) {
    setMode("official");
  } else {
    setMode("custom");
    customUrl.value = setup.serverUrl;
  }

  cancelButton.hidden = setup.firstLaunch;
  syncCustomField();
}

void init();
