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
}) {
  return (
    <div className={`fixed top-0 self-end z-20 m-5 flex items-center gap-x-3 transition-opacity duration-500 ${iconsVisible || isDownloadOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>

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

        {isDownloadOpen && (
          <div className="absolute top-10 right-0 bg-white dark:bg-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl z-30 p-3 flex flex-col w-[260px] special-t">
            <button
              onClick={() => { downloadTxtFile(); setIsDownloadOpen(false); }}
              className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left flex text-base rounded-xl transition-colors duration-200"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div>Text</div>
                <div className="text-neutral-400">.txt</div>
              </div>
            </button>
            <button
              onClick={() => { downloadMdFile(); setIsDownloadOpen(false); }}
              className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left flex text-base rounded-xl transition-colors duration-200"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div>Markdown</div>
                <div className="text-neutral-400">.md</div>
              </div>
            </button>
            <button
              onClick={() => { downloadPdfFile(); setIsDownloadOpen(false); }}
              className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left flex text-base rounded-xl transition-colors duration-200"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div>PDF</div>
                <div className="text-neutral-400">.pdf</div>
              </div>
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
