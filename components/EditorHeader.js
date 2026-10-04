import { useState, useEffect, useRef } from "react";

export default function EditorHeader({
  iconsVisible,
  isDownloadOpen,
  setIsDownloadOpen,
  downloadRef,
  downloadPdfFile,
  downloadMdFile,
  downloadTxtFile,
  openClearModal,
  openInfoModal,
  font,
  setFont,
  theme,
  changeTheme,
}) {
  const [isFontOpen, setIsFontOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  // The download dropdown's PDF option doesn't download immediately — it
  // switches the same dropdown into a theme-pick step (pre-selected to the
  // site's current theme) with a confirm button, so the PDF isn't tied to
  // whatever theme you happen to be viewing the site in.
  const [isPdfThemeStep, setIsPdfThemeStep] = useState(false);
  const [pdfExportTheme, setPdfExportTheme] = useState(theme);
  const fontRef = useRef(null);
  const themeRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (fontRef.current && !fontRef.current.contains(e.target)) setIsFontOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target)) setIsThemeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // The download dropdown can close from outside this component (click
  // outside, handled in pages/index.js) — reset back to the file-type list
  // whenever that happens, so it doesn't reopen stuck on the PDF theme step.
  useEffect(() => {
    if (!isDownloadOpen) setIsPdfThemeStep(false);
  }, [isDownloadOpen]);

  // Pre-select the site's current theme each time the PDF step opens
  useEffect(() => {
    if (isPdfThemeStep) setPdfExportTheme(theme);
  }, [isPdfThemeStep]);

  const themeOptions = [
    { value: "light", label: "Light", swatchClass: "bg-white border border-neutral-300", swatchColor: "#ffffff" },
    { value: "dark", label: "Dark", swatchClass: "bg-neutral-900 border border-neutral-700", swatchColor: "#171717" },
    { value: "beige", label: "Beige", swatchClass: "bg-[#f8efdb] border border-neutral-300", swatchColor: "#f8efdb" },
  ];
  const fontPreviewStyle = {
    sans: { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif' },
    serif: { fontFamily: '"Spectral", Georgia, serif' },
    dyslexic: { fontFamily: '"OpenDyslexic", sans-serif' },
  }[font];

  return (
    <div className={`fixed top-0 self-end z-20 m-5 flex items-center gap-x-1 min-[360px]:gap-x-3 transition-opacity duration-500 ${iconsVisible || isDownloadOpen || isFontOpen || isThemeOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>

      {/* Font Picker Button */}
      <div ref={fontRef} className="relative flex justify-center group">
        <button
          onClick={() => setIsFontOpen((prev) => !prev)} aria-label="Font" aria-expanded={isFontOpen}
          className="text-neutral-400 beige:text-[#594e38] hover:text-black dark:hover:text-white beige:hover:text-[#463a25] w-11 h-11 lg:w-[30px] lg:h-[30px] flex items-center justify-center transition-all duration-500 text-lg font-semibold"
          style={fontPreviewStyle}
        >
          Aa
        </button>
        <div className="text-xs absolute z-20 mt-10 dark:text-white text-black beige:text-[#463a25] invisible lg:group-hover:visible">Font</div>

        {isFontOpen && (
          <div className="fixed top-16 right-5 w-[260px] lg:absolute lg:top-10 lg:right-0 bg-white dark:bg-neutral-800 beige:bg-[#fbf6e9] shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl z-30 p-3 flex flex-col gap-1 special-t">
            <button
              onClick={() => { setFont("sans"); setIsFontOpen(false); }}
              className={`px-4 py-3 text-left flex items-center justify-between w-full text-base rounded-xl transition-colors duration-200 ${font === "sans" ? "bg-blue-100 dark:bg-blue-900/40 beige:bg-[#e8d3a0] text-blue-600 dark:text-blue-400 beige:text-[#463a25]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700 beige:hover:bg-[#f0e2be]"}`}
            >
              <span>Sans Serif</span>
              <span className="text-neutral-400 beige:text-[#594e38]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif' }}>Aa</span>
            </button>
            <button
              onClick={() => { setFont("serif"); setIsFontOpen(false); }}
              className={`px-4 py-3 text-left flex items-center justify-between w-full text-base rounded-xl transition-colors duration-200 ${font === "serif" ? "bg-blue-100 dark:bg-blue-900/40 beige:bg-[#e8d3a0] text-blue-600 dark:text-blue-400 beige:text-[#463a25]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700 beige:hover:bg-[#f0e2be]"}`}
            >
              <span>Serif</span>
              <span className="text-neutral-400 beige:text-[#594e38]" style={{ fontFamily: '"Spectral", Georgia, serif' }}>Aa</span>
            </button>
            <button
              onClick={() => { setFont("dyslexic"); setIsFontOpen(false); }}
              className={`px-4 py-3 text-left flex items-center justify-between w-full text-base rounded-xl transition-colors duration-200 ${font === "dyslexic" ? "bg-blue-100 dark:bg-blue-900/40 beige:bg-[#e8d3a0] text-blue-600 dark:text-blue-400 beige:text-[#463a25]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700 beige:hover:bg-[#f0e2be]"}`}
            >
              <span>OpenDyslexic</span>
              <span className="text-neutral-400 beige:text-[#594e38]" style={{ fontFamily: '"OpenDyslexic", sans-serif' }}>Aa</span>
            </button>
          </div>
        )}
      </div>

      {/* Theme Picker Button */}
      <div ref={themeRef} className="relative flex justify-center group">
        <button
          onClick={() => setIsThemeOpen((prev) => !prev)} aria-label="Theme" aria-expanded={isThemeOpen}
          className="text-neutral-400 beige:text-[#594e38] hover:text-black dark:hover:text-white beige:hover:text-[#463a25] w-11 h-11 lg:w-[30px] lg:h-[30px] flex items-center justify-center transition-all duration-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" />
          </svg>
        </button>
        <div className="text-xs absolute z-20 mt-10 dark:text-white text-black beige:text-[#463a25] invisible lg:group-hover:visible">Theme</div>

        {isThemeOpen && (
          <div className="fixed top-16 right-5 w-[260px] lg:absolute lg:top-10 lg:right-0 bg-white dark:bg-neutral-800 beige:bg-[#fbf6e9] shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl z-30 p-3 flex flex-col gap-1 special-t">
            {themeOptions.map(({ value, label, swatchClass }) => (
              <button
                key={value}
                onClick={() => { changeTheme(value); setIsThemeOpen(false); }}
                className={`px-4 py-3 text-left flex items-center justify-between w-full text-base rounded-xl transition-colors duration-200 ${theme === value ? "bg-blue-100 dark:bg-blue-900/40 beige:bg-[#e8d3a0] text-blue-600 dark:text-blue-400 beige:text-[#463a25]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700 beige:hover:bg-[#f0e2be]"}`}
              >
                <span>{label}</span>
                <span className={`w-5 h-5 rounded-full ${swatchClass}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Download Button */}
      <div ref={downloadRef} className="relative flex justify-center group">
        <button
          onClick={() => setIsDownloadOpen((prev) => !prev)} aria-label="Download" aria-expanded={isDownloadOpen}
          className="text-neutral-400 beige:text-[#594e38] hover:text-black dark:hover:text-white beige:hover:text-[#463a25] w-11 h-11 lg:w-[30px] lg:h-[30px] flex items-center justify-center transform-all duration-500"
        >
          <span aria-hidden="true" className="material-symbols-rounded" style={{ fontSize: 18 }}>download</span>
        </button>
        <div className="text-xs absolute z-20 mt-10 dark:text-white text-black beige:text-[#463a25] invisible lg:group-hover:visible">Download</div>

        {isDownloadOpen && !isPdfThemeStep && (
          <div className="fixed top-16 right-5 w-[260px] lg:absolute lg:top-10 lg:right-0 bg-white dark:bg-neutral-800 beige:bg-[#fbf6e9] shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl z-30 p-3 flex flex-col gap-1 special-t">
            <button
              onClick={() => { downloadTxtFile(); setIsDownloadOpen(false); }}
              className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 beige:hover:bg-[#f0e2be] text-left flex text-base rounded-xl transition-colors duration-200"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div>Text</div>
                <div className="text-neutral-400 beige:text-[#594e38]">.txt</div>
              </div>
            </button>
            <button
              onClick={() => { downloadMdFile(); setIsDownloadOpen(false); }}
              className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 beige:hover:bg-[#f0e2be] text-left flex text-base rounded-xl transition-colors duration-200"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div>Markdown</div>
                <div className="text-neutral-400 beige:text-[#594e38]">.md</div>
              </div>
            </button>
            <button
              onClick={() => setIsPdfThemeStep(true)}
              className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 beige:hover:bg-[#f0e2be] text-left flex text-base rounded-xl transition-colors duration-200"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div>PDF</div>
                <div className="text-neutral-400 beige:text-[#594e38]">.pdf</div>
              </div>
            </button>
          </div>
        )}

        {/* PDF's theme step — same dropdown, swapped content: pick the PDF's
            colors (pre-selected to the site's current theme) then confirm. */}
        {isDownloadOpen && isPdfThemeStep && (
          <div className="fixed top-16 right-5 w-[260px] lg:absolute lg:top-10 lg:right-0 bg-white dark:bg-neutral-800 beige:bg-[#fbf6e9] shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl z-30 p-3 flex flex-col gap-1 special-t">
            <div className="px-4 pt-1 pb-2 text-xs text-neutral-400 beige:text-[#594e38]">PDF theme</div>
            {themeOptions.map(({ value, label, swatchClass }) => (
              <button
                key={value}
                onClick={() => setPdfExportTheme(value)}
                className={`px-4 py-3 text-left flex items-center justify-between w-full text-base rounded-xl transition-colors duration-200 ${pdfExportTheme === value ? "bg-blue-100 dark:bg-blue-900/40 beige:bg-[#e8d3a0] text-blue-600 dark:text-blue-400 beige:text-[#463a25]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700 beige:hover:bg-[#f0e2be]"}`}
              >
                <span>{label}</span>
                <span className={`w-5 h-5 rounded-full ${swatchClass}`} />
              </button>
            ))}
            <button
              onClick={() => { downloadPdfFile(pdfExportTheme); setIsDownloadOpen(false); setIsPdfThemeStep(false); }}
              className="mt-2 px-4 py-3 text-center rounded-xl bg-neutral-800 dark:bg-neutral-200 hover:bg-neutral-900 dark:hover:bg-neutral-300 text-white dark:text-neutral-900 text-base transition-colors duration-200"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>

      {/* Clear Button */}
      <div className="flex justify-center group">
        <button
          onClick={openClearModal} aria-label="Clear note"
          className="text-neutral-400 beige:text-[#594e38] hover:text-black dark:hover:text-white beige:hover:text-[#463a25] w-11 h-11 lg:w-[30px] lg:h-[30px] flex items-center justify-center transform-all duration-500"
        >
          <span aria-hidden="true" className="material-symbols-rounded" style={{ fontSize: 18 }}>backspace</span>
        </button>
        <div className="text-xs absolute z-20 mt-10 dark:text-white text-black beige:text-[#463a25] invisible lg:group-hover:visible">Clear</div>
      </div>

      {/* Info Button */}
      <div className="flex justify-center group">
        <button
          onClick={openInfoModal} aria-label="About"
          className="text-neutral-400 beige:text-[#594e38] hover:text-black dark:hover:text-white beige:hover:text-[#463a25] w-11 h-11 lg:w-[30px] lg:h-[30px] flex items-center justify-center transform-all duration-500"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
        </button>
        <div className="text-xs absolute z-20 mt-10 dark:text-white text-black beige:text-[#463a25] invisible lg:group-hover:visible">Info</div>
      </div>

    </div>
  );
}
