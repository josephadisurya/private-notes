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
    { value: "light", label: "Light", swatchClass: "bg-white border border-neutral-300" },
    { value: "dark", label: "Dark", swatchClass: "bg-neutral-900 border border-neutral-700" },
    { value: "beige", label: "Beige", swatchClass: "bg-[#f2e8d5] border border-neutral-300" },
  ];

  return (
    <div className={`fixed top-0 self-end z-20 m-5 flex items-center gap-x-3 transition-opacity duration-500 ${iconsVisible || isDownloadOpen || isFontOpen || isThemeOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>

      {/* Font Picker Button */}
      <div ref={fontRef} className="relative flex justify-center group">
        <button
          onClick={() => setIsFontOpen((prev) => !prev)}
          className="text-neutral-400 beige:text-[#8a7355] hover:text-black dark:hover:text-white w-[30px] h-[30px] flex items-center justify-center transition-all duration-500 text-lg font-semibold"
        >
          Aa
        </button>
        <div className="text-xs absolute z-20 mt-10 dark:text-white text-black invisible lg:group-hover:visible">Font</div>

        {isFontOpen && (
          <div className="fixed top-16 right-5 w-[260px] lg:absolute lg:top-10 lg:right-0 bg-white dark:bg-neutral-800 beige:bg-[#f7f0dc] shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl z-30 p-3 flex flex-col gap-1 special-t">
            <button
              onClick={() => { setFont("sans"); setIsFontOpen(false); }}
              className={`px-4 py-3 text-left flex items-center justify-between w-full text-base rounded-xl transition-colors duration-200 ${font === "sans" ? "bg-blue-100 dark:bg-blue-900/40 beige:bg-[#e6d3a8] text-blue-600 dark:text-blue-400 beige:text-[#5c4023]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"}`}
            >
              <span>Sans Serif</span>
              <span className="text-neutral-400 beige:text-[#8a7355]" style={{ fontFamily: '"Satoshi", sans-serif' }}>Aa</span>
            </button>
            <button
              onClick={() => { setFont("serif"); setIsFontOpen(false); }}
              className={`px-4 py-3 text-left flex items-center justify-between w-full text-base rounded-xl transition-colors duration-200 ${font === "serif" ? "bg-blue-100 dark:bg-blue-900/40 beige:bg-[#e6d3a8] text-blue-600 dark:text-blue-400 beige:text-[#5c4023]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"}`}
            >
              <span>Serif</span>
              <span className="text-neutral-400 beige:text-[#8a7355]" style={{ fontFamily: '"EB Garamond", Georgia, serif' }}>Aa</span>
            </button>
          </div>
        )}
      </div>

      {/* Theme Picker Button */}
      <div ref={themeRef} className="relative flex justify-center group">
        <button
          onClick={() => setIsThemeOpen((prev) => !prev)}
          className="text-neutral-400 beige:text-[#8a7355] hover:text-black dark:hover:text-white w-[30px] h-[30px] flex items-center justify-center transition-all duration-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" />
          </svg>
        </button>
        <div className="text-xs absolute z-20 mt-10 dark:text-white text-black invisible lg:group-hover:visible">Theme</div>

        {isThemeOpen && (
          <div className="fixed top-16 right-5 w-[260px] lg:absolute lg:top-10 lg:right-0 bg-white dark:bg-neutral-800 beige:bg-[#f7f0dc] shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl z-30 p-3 flex flex-col gap-1 special-t">
            {themeOptions.map(({ value, label, swatchClass }) => (
              <button
                key={value}
                onClick={() => { changeTheme(value); setIsThemeOpen(false); }}
                className={`px-4 py-3 text-left flex items-center justify-between w-full text-base rounded-xl transition-colors duration-200 ${theme === value ? "bg-blue-100 dark:bg-blue-900/40 beige:bg-[#e6d3a8] text-blue-600 dark:text-blue-400 beige:text-[#5c4023]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"}`}
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
          onClick={() => setIsDownloadOpen((prev) => !prev)}
          className="fill-neutral-400 hover:fill-black dark:hover:fill-white w-[30px] transform-all duration-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M480-328.46 309.23-499.23l42.16-43.38L450-444v-336h60v336l98.61-98.61 42.16 43.38L480-328.46ZM252.31-180Q222-180 201-201q-21-21-21-51.31v-108.46h60v108.46q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h455.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-108.46h60v108.46Q780-222 759-201q-21 21-51.31 21H252.31Z" />
          </svg>
        </button>
        <div className="text-xs absolute z-20 mt-10 dark:text-white text-black invisible lg:group-hover:visible">Download</div>

        {isDownloadOpen && !isPdfThemeStep && (
          <div className="fixed top-16 right-5 w-[260px] lg:absolute lg:top-10 lg:right-0 bg-white dark:bg-neutral-800 beige:bg-[#f7f0dc] shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl z-30 p-3 flex flex-col gap-1 special-t">
            <button
              onClick={() => { downloadTxtFile(); setIsDownloadOpen(false); }}
              className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left flex text-base rounded-xl transition-colors duration-200"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div>Text</div>
                <div className="text-neutral-400 beige:text-[#8a7355]">.txt</div>
              </div>
            </button>
            <button
              onClick={() => { downloadMdFile(); setIsDownloadOpen(false); }}
              className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left flex text-base rounded-xl transition-colors duration-200"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div>Markdown</div>
                <div className="text-neutral-400 beige:text-[#8a7355]">.md</div>
              </div>
            </button>
            <button
              onClick={() => setIsPdfThemeStep(true)}
              className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left flex text-base rounded-xl transition-colors duration-200"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div>PDF</div>
                <div className="text-neutral-400 beige:text-[#8a7355]">.pdf</div>
              </div>
            </button>
          </div>
        )}

        {/* PDF's theme step — same dropdown, swapped content: pick the PDF's
            colors (pre-selected to the site's current theme) then confirm. */}
        {isDownloadOpen && isPdfThemeStep && (
          <div className="fixed top-16 right-5 w-[260px] lg:absolute lg:top-10 lg:right-0 bg-white dark:bg-neutral-800 beige:bg-[#f7f0dc] shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl z-30 p-3 flex flex-col gap-1 special-t">
            <div className="px-4 pt-1 pb-2 text-xs text-neutral-400 beige:text-[#8a7355]">PDF theme</div>
            {themeOptions.map(({ value, label, swatchClass }) => (
              <button
                key={value}
                onClick={() => setPdfExportTheme(value)}
                className={`px-4 py-3 text-left flex items-center justify-between w-full text-base rounded-xl transition-colors duration-200 ${pdfExportTheme === value ? "bg-blue-100 dark:bg-blue-900/40 beige:bg-[#e6d3a8] text-blue-600 dark:text-blue-400 beige:text-[#5c4023]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"}`}
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
          onClick={openClearModal}
          className="fill-neutral-400 hover:fill-black dark:hover:fill-white w-[30px] transform-all duration-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m449.08-333.85 104-104 104 104L699.23-376l-104-104 104-104-42.15-42.15-104 104-104-104L406.92-584l104 104-104 104 42.16 42.15ZM363.46-180q-17.17 0-32.54-7.58-15.36-7.58-25.3-20.96L100-480l205.62-271.46q9.94-13.38 25.3-20.96 15.37-7.58 32.54-7.58h424.23q29.83 0 51.07 21.24Q860-737.52 860-707.69v455.38q0 29.83-21.24 51.07Q817.52-180 787.69-180H363.46ZM175-480l178.46 235.38q1.92 2.31 4.42 3.47 2.5 1.15 5.58 1.15h424.23q5.39 0 8.85-3.46t3.46-8.85v-455.38q0-5.39-3.46-8.85t-8.85-3.46H363.46q-3.08 0-5.58 1.15-2.5 1.16-4.42 3.47L175-480Zm400.38 0Z" /></svg>
        </button>
        <div className="text-xs absolute z-20 mt-10 dark:text-white text-black invisible lg:group-hover:visible">Clear</div>
      </div>

      {/* Info Button */}
      <div className="flex justify-center group">
        <button
          onClick={openInfoModal}
          className="fill-neutral-400 hover:fill-black dark:hover:fill-white w-[30px] transform-all duration-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M450-290h60v-230h-60v230Zm30-298.46q13.73 0 23.02-9.29t9.29-23.02q0-13.73-9.29-23.02-9.29-9.28-23.02-9.28t-23.02 9.28q-9.29 9.29-9.29 23.02t9.29 23.02q9.29 9.29 23.02 9.29Zm.07 488.46q-78.84 0-148.21-29.92t-120.68-81.21q-51.31-51.29-81.25-120.63Q100-401.1 100-479.93q0-78.84 29.92-148.21t81.21-120.68q51.29-51.31 120.63-81.25Q401.1-860 479.93-860q78.84 0 148.21 29.92t120.68 81.21q51.31 51.29 81.25 120.63Q860-558.9 860-480.07q0 78.84-29.92 148.21t-81.21 120.68q-51.29 51.31-120.63 81.25Q558.9-100 480.07-100Zm-.07-60q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
        </button>
        <div className="text-xs absolute z-20 mt-10 dark:text-white text-black invisible lg:group-hover:visible">Info</div>
      </div>

    </div>
  );
}
