export default function ClearModal({ isModalOpen, clearContent, cancelClear }) {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-30">
      <div className="bg-white dark:bg-neutral-800 p-6 md:p-12 shadow-lg min-w-[250px] rounded-lg justify-center special-t">
        <h2 className="text-base font-medium mb-8">Are you sure you want to clear all?</h2>
        <div className="flex justify-between gap-x-3 w-full">
          <button
            onClick={clearContent}
            className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 hover:bg-neutral-900 dark:hover:bg-neutral-300 text-white dark:text-neutral-900 rounded-md duration-500 transform-all w-full text-sm"
          >
            Yes
          </button>
          <button
            onClick={cancelClear}
            className="text-black dark:text-white px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-[1px] border-neutral-200 dark:border-neutral-600 rounded-md duration-500 transform-all w-full text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
